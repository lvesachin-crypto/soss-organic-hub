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
    // Wallet system stores values in USD. Convert INR -> USD.
    const INR_PER_USD = Number(Deno.env.get("INR_USD_RATE") || "83.5");
    const amountUsd: number = Number((amountInr / INR_PER_USD).toFixed(4));
    const notes = payment.notes || {};
    const userIdFromNotes: string | undefined = notes.user_id;
    const userEmailFromNotes: string | undefined = notes.user_email || payment.email;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Idempotency
    const { data: existing } = await supabase
      .from("transactions")
      .select("id")
      .eq("payment_reference", paymentId)
      .maybeSingle();

    if (existing) {
      console.log("Already processed:", paymentId);
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve user
    let userId: string | null = userIdFromNotes || null;
    if (!userId && userEmailFromNotes) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", userEmailFromNotes)
        .maybeSingle();
      userId = prof?.user_id || null;
    }

    if (!userId) {
      console.error("User not resolved for payment", paymentId, notes);
      await supabase.from("transactions").insert({
        user_id: "00000000-0000-0000-0000-000000000000",
        type: "deposit",
        amount: amountUsd,
        balance_after: 0,
        status: "failed",
        payment_method: "razorpay_auto",
        payment_reference: paymentId,
        description: `UNRESOLVED USER. ₹${amountInr} (~$${amountUsd}). Email: ${userEmailFromNotes || "none"}`,
      });
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 200, // 200 so Razorpay doesn't retry forever
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch wallet
    const { data: wallet, error: wErr } = await supabase
      .from("wallets")
      .select("balance, total_deposited")
      .eq("user_id", userId)
      .maybeSingle();

    if (wErr) throw wErr;

    const currentBalance = Number(wallet?.balance || 0);
    const currentDeposited = Number(wallet?.total_deposited || 0);
    const newBalance = currentBalance + amountUsd;
    const newDeposited = currentDeposited + amountUsd;

    if (wallet) {
      const { error: updErr } = await supabase
        .from("wallets")
        .update({ balance: newBalance, total_deposited: newDeposited })
        .eq("user_id", userId);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await supabase.from("wallets").insert({
        user_id: userId,
        balance: newBalance,
        total_deposited: newDeposited,
        total_spent: 0,
      });
      if (insErr) throw insErr;
    }

    const { error: txErr } = await supabase.from("transactions").insert({
      user_id: userId,
      type: "deposit",
      amount: amountUsd,
      balance_after: newBalance,
      status: "completed",
      payment_method: "razorpay_auto",
      payment_reference: paymentId,
      description: `Wallet top-up via Razorpay (₹${amountInr} @ ₹${INR_PER_USD}/USD)`,
    });
    if (txErr) throw txErr;

    console.log(`Credited ₹${amountInr} (=$${amountUsd}) to user ${userId} via ${paymentId}`);

    return new Response(JSON.stringify({ ok: true, credited: amountInr }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});