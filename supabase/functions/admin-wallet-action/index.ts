import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const INR_RATE = 83.5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = auth.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !user) return json({ error: "Invalid token" }, 401);

    // Admin role check
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Forbidden — admins only" }, 403);

    const body = await req.json();
    const { target_user_id, action, inr_amount, notes, transaction_id } = body ?? {};

    // 🚫 HARD BLOCK: Admins can NO LONGER credit wallets manually.
    // The ONLY way funds are added to a wallet is a successful ZapUPI payment
    // verified by the zapupi-webhook / zapupi-sync-deposit pipeline.
    if (action === "add" || action === "approve_pending") {
      return json({
        error: "Manual wallet credits are permanently disabled. Funds can only be added via successful ZapUPI payments.",
      }, 403);
    }

    // IP / UA (used by all branches)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const ua = req.headers.get("user-agent") || "unknown";

    // ===== Branch: reject a pending deposit transaction (reject only — approve is disabled) =====
    if (action === "reject_pending") {
      if (!transaction_id) return json({ error: "transaction_id required" }, 400);

      const { data: tx, error: txFetchErr } = await admin
        .from("transactions")
        .select("id, user_id, amount, status, type, description")
        .eq("id", transaction_id)
        .maybeSingle();
      if (txFetchErr || !tx) return json({ error: "Transaction not found" }, 404);
      if (tx.status !== "pending") {
        return json({ error: `Already ${tx.status}` }, 400);
      }
      if (tx.type !== "deposit") {
        return json({ error: "Only deposit transactions can be rejected here" }, 400);
      }

      const txUsd = Number(tx.amount) || 0;
      const { data: tProfile } = await admin
        .from("profiles").select("email").eq("user_id", tx.user_id).maybeSingle();

      await admin.from("transactions").update({ status: "failed" }).eq("id", tx.id);
      await admin.from("admin_audit_log").insert({
        actor_id: user.id, actor_email: user.email,
        target_user_id: tx.user_id, target_email: tProfile?.email ?? null,
        action: "deposit_rejected", amount_usd: txUsd, amount_inr: null,
        notes: notes ?? null, ip_address: ip, user_agent: ua,
        metadata: { transaction_id: tx.id },
      });
      return json({ success: true, status: "failed" });
    }

    // ===== Branch: direct subtract by INR amount (admin can only deduct, never add) =====
    if (!target_user_id || action !== "subtract") {
      return json({ error: "Invalid payload" }, 400);
    }
    const inr = Number(inr_amount);
    if (!isFinite(inr) || inr <= 0) {
      return json({ error: "Invalid amount" }, 400);
    }
    const usd = Math.trunc((inr / INR_RATE) * 10000) / 10000;

    // Fetch target wallet + email
    const { data: wallet, error: wErr } = await admin
      .from("wallets")
      .select("balance, total_deposited")
      .eq("user_id", target_user_id)
      .single();
    if (wErr || !wallet) return json({ error: "Target wallet not found" }, 404);

    const { data: targetProfile } = await admin
      .from("profiles")
      .select("email")
      .eq("user_id", target_user_id)
      .maybeSingle();

    const currentBalance = Number(wallet.balance) || 0;
    const newBalance = currentBalance - usd;
    if (newBalance < 0) return json({ error: "Balance cannot be negative" }, 400);

    const newDeposited = Number(wallet.total_deposited) || 0;

    const { error: updErr } = await admin
      .from("wallets")
      .update({ balance: newBalance, total_deposited: newDeposited })
      .eq("user_id", target_user_id);
    if (updErr) throw updErr;

    const { error: txErr } = await admin.from("transactions").insert({
      user_id: target_user_id,
      type: "refund",
      amount: -usd,
      balance_after: newBalance,
      description: `Admin withdrawal — ₹${inr.toFixed(2)}${notes ? " — " + notes : ""}`,
      status: "completed",
    });
    if (txErr) throw txErr;

    // Audit log — never let logging failure block the action result
    await admin.from("admin_audit_log").insert({
      actor_id: user.id,
      actor_email: user.email,
      target_user_id,
      target_email: targetProfile?.email ?? null,
      action: "wallet_withdraw",
      amount_usd: usd,
      amount_inr: inr,
      notes: notes ?? null,
      ip_address: ip,
      user_agent: ua,
      metadata: { new_balance: newBalance },
    });

    return json({ success: true, new_balance: newBalance });
  } catch (e: any) {
    console.error("admin-wallet-action error", e);
    return json({ error: e?.message ?? "Internal error" }, 500);
  }

  function json(payload: unknown, status = 200) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});