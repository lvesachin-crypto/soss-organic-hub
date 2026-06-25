# ZapUPI Automatic UPI Deposit System

Manual deposit (screenshot/UTR + admin approval) ko fully hata ke ZapUPI based instant auto-credit system lagayenge. Sab payment verification server-side hogi (client param trust nahi).

## 1. Secret
- `add_secret` se `ZAPUPI_ZAP_KEY` user se mangwaunga (Razorpay flow ke saath co-exist karega; abhi Razorpay ko touch nahi).

## 2. Database Migration

**New table** `public.zapupi_deposits`:
- `id uuid pk`, `user_id uuid → auth.users`, `order_id text unique`, `amount_inr numeric`, `amount_usd numeric`, `status text default 'pending'` (pending/success/failed), `credited boolean default false`, `txn_id text`, `utr text`, `payment_url text`, `created_at`, `updated_at`.
- GRANT SELECT to authenticated; ALL to service_role. No anon.
- RLS: user `SELECT` own rows only. No client INSERT/UPDATE/DELETE.

**New SECURITY DEFINER function** `credit_wallet_zapupi(p_user_id, p_order_id, p_amount_inr, p_txn_id, p_utr)`:
- Advisory lock on hash(order_id).
- Check `zapupi_deposits` row exists & `credited=false` (idempotent).
- Convert INR→USD at fixed 83.5 (same as razorpay function).
- Lock wallet row, increment `balance` + `total_deposited`.
- Insert `transactions` row (type=deposit, payment_method='zapupi', payment_reference=order_id, status=completed).
- Update zapupi_deposits: status='success', credited=true, txn_id, utr.
- Returns JSON `{credited, new_balance, credited_usd, credited_inr}`.

**Permission lockdown** (bypass-proof):
- `REVOKE EXECUTE ON FUNCTION credit_wallet_zapupi, credit_wallet_razorpay, debit_wallet_for_order, cancel_order_with_refund FROM PUBLIC, anon, authenticated;`
- `GRANT EXECUTE ... TO service_role;`
- Verify `wallets` policies: no client INSERT/UPDATE/DELETE (already locked, will re-confirm).
- Verify `transactions`: no client INSERT (already removed earlier, will re-confirm).

## 3. Edge Functions (3 new)

**`zapupi-create-order`** (verify_jwt in code via getClaims):
- Zod validate `{amount_inr: number ≥ 50, ≤ 100000}`.
- Generate `order_id = 'ZAP_' + uuid`.
- Insert pending row in `zapupi_deposits` (service role).
- POST to `https://pay.zapupi.com/api/create-order` with `{zap_key, order_id, amount, redirect_url, webhook_url}`.
- On gateway error → mark row 'failed', return 502.
- Return `{order_id, payment_url}`.

**`zapupi-webhook`** (`verify_jwt = false` in `supabase/config.toml`):
- Accept webhook payload, extract `order_id`.
- DOUBLE-CONFIRM via `POST https://pay.zapupi.com/api/order-status` with `{zap_key, order_id}`.
- Only if upstream status = success → call `credit_wallet_zapupi` RPC.
- Idempotent: duplicate webhooks safe due to row check + advisory lock.
- Always 200 OK to gateway.

**`zapupi-sync-deposit`** (auth required):
- Body `{order_id}`. Verify order belongs to caller.
- Call ZapUPI order-status; if success and not credited → call `credit_wallet_zapupi`.
- Returns new balance. Backup if webhook missed.

## 4. Frontend

**Remove** manual deposit UI:
- `src/components/wallet/RazorpayDepositCard.tsx` ko replace karke `ZapUpiDepositCard.tsx` banayenge (Razorpay card abhi rakhna hai ya hatana hai — niche question).
- Manual screenshot/UTR form / `deposits` table upload code (if rendered anywhere) hata denge from Wallet page.

**New `ZapUpiDepositCard`**:
- Amount input (₹), quick-select chips (₹100, ₹500, ₹1000, ₹2000, ₹5000).
- "Pay with UPI" button → invoke `zapupi-create-order` → `window.location.href = payment_url`.
- On return, `Wallet.tsx` reads `?order_id=` from URL → calls `zapupi-sync-deposit` → toast + refetch wallet → strips param.

## 5. Items to confirm before implementation

1. **Razorpay flow** abhi live hai (`RazorpayDepositCard`, `create-razorpay-deposit-intent`, `verify-razorpay-deposit`, `razorpay-webhook`). User ke message me "manual hata do" likha hai — manual = screenshot/UTR/admin approval wala flow. Razorpay bhi automatic hai. Kya Razorpay rakhna hai ya wahi bhi hata ke sirf ZapUPI rakhna hai?
2. Manual `deposits` table abhi DB me hai. Use ki UI hata du, lekin table & purane records preserve karu (history ke liye)? Ya pura table drop?
3. `success_url` / `failed_url` ke liye route: `https://organicsmm.online/wallet?order_id=...&status=success` use karu — confirm?
4. Min ₹50 fix; max cap kya rakhu (₹100000 default)?

In 4 cheezo ka jawab dedo, phir migration + edge functions + frontend ek hi pass me bana dunga.
