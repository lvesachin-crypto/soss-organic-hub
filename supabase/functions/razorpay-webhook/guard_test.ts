import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const FN_URL = `${Deno.env.get("VITE_SUPABASE_URL")}/functions/v1/razorpay-webhook`;
const SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

async function sign(body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function post(body: object) {
  const raw = JSON.stringify(body);
  const signature = await sign(raw);
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-razorpay-signature": signature,
      "Authorization": `Bearer ${ANON}`,
      "apikey": ANON,
    },
    body: raw,
  });
  const json = await res.json();
  return { status: res.status, json };
}

Deno.test("ignores access-key payment by service_code in payment notes", async () => {
  const r = await post({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_test_access_key_1",
          amount: 19900,
          fee: 0,
          tax: 0,
          email: "someone@example.com",
          contact: "+919999999999",
          notes: { service_code: "MUJCLONE_KEY_2026" },
        },
      },
    },
  });
  console.log("service_code result:", r);
  assertEquals(r.status, 200);
  assertEquals(r.json.ignored, "access_key_payment");
});

Deno.test("ignores access-key payment by telegram_chat_id in order notes", async () => {
  const r = await post({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_test_access_key_2",
          amount: 19900,
          fee: 0,
          tax: 0,
          email: "user@example.com",
          contact: "+918888888888",
          notes: {},
        },
      },
      order: { entity: { notes: { telegram_chat_id: "123456" } } },
    },
  });
  console.log("telegram_chat_id result:", r);
  assertEquals(r.status, 200);
  assertEquals(r.json.ignored, "access_key_payment");
});

Deno.test("ignores access-key payment by chat_id in payment notes", async () => {
  const r = await post({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_test_access_key_3",
          amount: 19900,
          fee: 0,
          tax: 0,
          email: "x@example.com",
          contact: "+917777777777",
          notes: { chat_id: "987654" },
        },
      },
    },
  });
  console.log("chat_id result:", r);
  assertEquals(r.status, 200);
  assertEquals(r.json.ignored, "access_key_payment");
});

Deno.test("ignores unsupported amount that is not one of the SMM hosted buttons", async () => {
  const r = await post({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_test_unsupported_amount_1",
          amount: 14900,
          fee: 0,
          tax: 0,
          email: "xbhishekh@gmail.com",
          contact: "+916666666666",
          notes: {},
        },
      },
    },
  });
  console.log("unsupported_amount result:", r);
  assertEquals(r.status, 200);
  assertEquals(r.json.ignored, "unsupported_amount");
});

for (const bad of [14900, 19800, 25000, 30000, 75000, 99900, 150000, 1, 99]) {
  Deno.test(`ignores unsupported amount ${bad} paise`, async () => {
    const r = await post({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: `pay_test_bad_${bad}_${Date.now()}`,
            amount: bad,
            fee: 0,
            tax: 0,
            email: "xbhishekh@gmail.com",
            contact: "+910000000000",
            notes: {},
          },
        },
      },
    });
    console.log(`bad amount ${bad} result:`, r);
    assertEquals(r.status, 200);
    assertEquals(r.json.ignored, "unsupported_amount");
  });
}