// Razorpay webhook - auto credit wallet on payment.captured
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  // constant-time compare
  if (hex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

async function notifyTelegram(supabase: ReturnType<typeof createClient>, text: string) {
  const projectUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!projectUrl || !serviceRoleKey) {
    console.log("Supabase env missing, skipping Telegram notify");
    return;
  }

  try {
    const { error } = await supabase.functions.invoke("send-telegram-notification", {
      body: {
        message: text,
        parse_mode: "HTML",
      },
    });
    if (error) console.error("Telegram invoke error:", error.message);
  } catch (e) {
    console.error("Telegram fetch failed:", e);
  }
}

function toUsdFromInr(amountInr: number, inrPerUsd: number): number {
  return Number((amountInr / inrPerUsd).toFixed(4));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not set");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // STRICT: signature header is mandatory
    if (!signature) {
      console.error("Missing x-razorpay-signature header — rejecting");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ok = await verifySignature(rawBody, signature, secret);
    if (!ok) {
      console.error("Invalid Razorpay signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(rawBody);
    const event = payload?.event;
    console.log("Razorpay event:", event);

    if (event !== "payment.captured") {
      return new Response(JSON.stringify({ ok: true, skipped: event }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payment = payload?.payload?.payment?.entity;
    if (!payment) {
      return new Response(JSON.stringify({ error: "Missing payment entity" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentId: string = payment.id;
    const amountInr: number = Number(payment.amount) / 100; // paise -> rupees
    // STRICT: only credit when Razorpay confirms capture (defence-in-depth)
    if (payment.status && payment.status !== "captured") {
      console.error(`Payment ${paymentId} status=${payment.status}, not crediting`);
      return new Response(JSON.stringify({ ok: true, skipped: payment.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const INR_PER_USD = 83.5;
    const amountUsd = toUsdFromInr(amountInr, INR_PER_USD);
    const notes = payment.notes || {};
    const userIdFromNotes: string | undefined = notes.user_id;
    const userEmailFromNotes: string | undefined = notes.user_email || payment.email;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Resolve user
    let userId: string | null = userIdFromNotes || null;
    if (!userId && userEmailFromNotes) {
      const normalizedEmail = userEmailFromNotes.trim().toLowerCase();
      const { data: prof, error: profileLookupError } = await supabase
        .from("profiles")
        .select("user_id")
        .ilike("email", normalizedEmail)
        .maybeSingle();
      if (profileLookupError) throw profileLookupError;
      userId = prof?.user_id || null;
    }

    if (!userId) {
      console.error("User not resolved for payment", paymentId, notes);
      await notifyTelegram(
        supabase,
        `⚠️ <b>OrganicSMM — UNRESOLVED Payment</b>\n` +
        `Amount: <b>₹${amountInr}</b>\n` +
        `Payment ID: <code>${paymentId}</code>\n` +
        `Email used at checkout: <code>${userEmailFromNotes || "(none)"}</code>\n` +
        `User not found — wallet NOT credited.`,
      );
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 200, // 200 so Razorpay doesn't retry forever
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ATOMIC credit via SECURITY DEFINER function — handles lock + idempotency + wallet update + tx insert
    // Safe under Razorpay's retry policy because of UNIQUE index on payment_reference.
    const { data: creditResult, error: creditErr } = await supabase.rpc("credit_wallet_razorpay", {
      p_user_id: userId,
      p_payment_id: paymentId,
      p_amount_usd: amountUsd,
      p_amount_inr: amountInr,
    });

    if (creditErr) {
      // Transient DB error — return 5xx so Razorpay retries
      console.error("credit_wallet_razorpay failed:", creditErr.message);
      throw creditErr;
    }

    const credited = (creditResult as any)?.credited === true;
    const duplicate = (creditResult as any)?.duplicate === true;
    const newBalance = Number((creditResult as any)?.new_balance ?? 0);

    if (duplicate) {
      console.log("Duplicate webhook for payment", paymentId, "— already credited, ack 200");
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Credited ₹${amountInr} (db=${amountUsd} USD) to user ${userId} via ${paymentId}`);

    // Fetch profile for Telegram message
    const { data: prof } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", userId)
      .maybeSingle();

    await notifyTelegram(
      supabase,
      `✅ <b>OrganicSMM — Wallet Credited</b>\n` +
      `User: <b>${prof?.full_name || "—"}</b>\n` +
      `Email: <code>${prof?.email || userEmailFromNotes || "—"}</code>\n` +
      `Amount: <b>₹${amountInr}</b>\n` +
      `New Balance: ₹${(newBalance * INR_PER_USD).toFixed(2)}\n` +
      `Payment ID: <code>${paymentId}</code>`,
    );

    return new Response(JSON.stringify({ ok: true, credited: amountInr }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    // 5xx triggers Razorpay's automatic retry — the UNIQUE index + RPC make retries safe
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});