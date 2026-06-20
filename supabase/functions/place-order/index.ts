import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { orderData, totalPrice, runs } = body;

    if (!orderData || !totalPrice || totalPrice <= 0) {
      return new Response(JSON.stringify({ error: "Invalid order data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { service_name, ...orderInsertData } = orderData;

    // Quick pre-check (UX only; real check is atomic RPC below)
    const { data: walletPre } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!walletPre) {
      return new Response(JSON.stringify({ error: "Wallet not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (walletPre.balance < totalPrice) {
      return new Response(JSON.stringify({ error: "Insufficient balance" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const duplicateWindowStart = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data: recentDuplicateOrder } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, status, created_at")
      .eq("user_id", user.id)
      .eq("service_id", orderInsertData.service_id)
      .eq("link", orderInsertData.link)
      .eq("quantity", orderInsertData.quantity)
      .gte("created_at", duplicateWindowStart)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentDuplicateOrder) {
      return new Response(JSON.stringify({
        success: true,
        duplicate_blocked: true,
        order_id: recentDuplicateOrder.id,
        order_number: recentDuplicateOrder.order_number,
        status: recentDuplicateOrder.status,
        message: "A similar order was just created, so a duplicate request was blocked.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        ...orderInsertData,
        user_id: user.id,
      })
      .select()
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: `Failed to create order: ${orderError?.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Atomic debit + transaction (under row lock, single DB transaction).
    //    If this fails, the order we just inserted is rolled back manually so
    //    users cannot end up with an order that was never paid for.
    const { data: debitData, error: debitError } = await supabaseAdmin.rpc(
      "debit_wallet_for_order",
      {
        p_user_id: user.id,
        p_amount: totalPrice,
        p_order_id: order.id,
        p_engagement_order_id: null,
        p_description: `Order #${order.order_number} - ${service_name || "Service Order"}`,
      }
    );

    if (debitError || !debitData) {
      console.error("Atomic debit failed, rolling back order:", debitError);
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      const msg = debitError?.message || "Payment failed";
      const isInsufficient = msg.toLowerCase().includes("insufficient");
      return new Response(JSON.stringify({ error: msg }), {
        status: isInsufficient ? 400 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newBalance = (debitData as any).new_balance as number;

    // 5. Insert organic run schedule if provided
    if (runs && runs.length > 0) {
      const runEntries = runs.map((run: any) => ({
        ...run,
        order_id: order.id,
      }));
      
      const { error: runErr } = await supabaseAdmin
        .from("organic_run_schedule")
        .insert(runEntries);
        
      if (runErr) console.error("Run schedule insert error:", runErr);
    }

    // 6. Trigger process-order for non-organic orders
    if (!orderInsertData.is_organic_mode) {
      try {
        await supabaseAdmin.functions.invoke("process-order", {
          body: { order_id: order.id },
        });
      } catch (e) {
        console.error("Failed to trigger process-order:", e);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      order_id: order.id,
      order_number: order.order_number,
      new_balance: newBalance,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("place-order error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
