## Warning — this is destructive

"Full replacement" ka matlab hai current system ka bada hissa hatana. Please confirm karo before I run migrations.

### Kya hatega (data + code loss)

**Data (migrations me DROP)**
- `user_provider_accounts` (users ne apni API keys add ki hain — sab loss)
- `user_bundles`, `user_bundle_items`, `user_bundle_item_providers`
- `user_services`
- `engagement_orders`, `engagement_order_items`, `organic_run_schedule` (saari user order history)
- `subscription_payments`, `subscription_requests`, `subscriptions`, `subscription_plans`
- `wallets`, `transactions`, `deposits`, `oxapay_deposits`, `zapupi_deposits`, related webhook events
- Related triggers: subscription enforce, wallet credit trail, run lock triggers

**Frontend pages/components to delete**
- `MyProviders.tsx`, `MyBundles.tsx`, `MyServices` refs
- `EngagementOrder.tsx`, `EngagementOrderDetail.tsx`, `EngagementOrders.tsx`, `MassOrder.tsx`
- `Subscription.tsx`, `Wallet.tsx` (already gone), subscription gates
- `AIIntelligence.tsx` if it depends on removed tables
- Sidebar entries pointing to above

**Edge functions to delete**
- `execute-all-runs`, `check-order-status`, `process-engagement-order`, `user-provider-manage`
- `oxapay-*`, `zapupi-*`, subscription webhooks
- `cleanup-*` crons referencing removed tables

### Kya banega (spec ke hisab se)

**New tables**
- `providers` (admin-owned, name/api_url/api_key/is_active)
- `services` (name/category/price/min/max, legacy provider_id kept but ignored)
- `service_provider_mapping` (service↔provider, priority, provider_service_id, min/max, is_active)
- `orders` (order_number, user_id, service_id, link, quantity, price, status, provider_order_id, provider_used, tried_providers uuid[], start_count, remains, retry_count, next_retry_at, error_message)
- All with RLS + GRANTs

**New edge functions**
- `dispatch-orders` — cron every 1 min. Strict priority walk, 15s per-request timeout, 110s wall budget, pool of 6. On all-busy → status='queued', next_retry_at=+60s, tried_providers reset to `{}`.
- `check-order-status` — cron every 5 min. Polls provider status, updates remains/start_count/status.
- `cancel-order` — user-callable. Provider cancel + wallet refund (needs wallet table — see below).

**Cron setup** via pg_cron + pg_net.

**New admin UI**
- Provider list (add/edit URL+key, active toggle, balance check button)
- Service↔Provider mapping page (drag-reorder priority, per-row min/max, active toggle, bulk upsert save)
- Queue health widget (queued count, oldest age, per-provider 24h success rate)
- Order detail with `tried_providers` history

**New user UI**
- Simple order-place form (pick service, paste link, enter qty → creates order in `pending`)
- Order list + detail showing status/remains

### Open decisions I need before I code

1. **Wallet + payments** — spec says `cancel-order` refunds wallet. Do you want me to rebuild a wallet + a payments flow (ZapUPI/OxaPay), or skip payments entirely (orders are placed without charging, admin-only test system)?
2. **Subscription gating** — remove entirely, ya keep for order placement?
3. **User signup flow** — keep email/password auth as-is?
4. **Existing `admin@gmail.com` superadmin** — preserve, right?

Reply "confirm + answers to 1-4" aur main sab migrations + code likh dunga ek go me. Otherwise, safer options — "Extract principles, patch existing" — abhi bhi available hai.