# Per-User Provider System (Multi-Tenant SMM)

Abhi system single admin-managed hai: `provider_accounts` aur `engagement_bundles` sirf admin bana sakta hai, saare users usi shared pool se orders place karte hain. Iske baad har user apne **khud ke providers aur bundles** bana payega, orders sirf uski hi keys se jayenge, aur kisi doosre user ko uska data nahi dikhega.

## Kya banega

1. **User Provider Accounts** — user apna SMM panel URL + API key add kare (JAP-style `/api/v2`)
2. **User Service Import** — us panel se services fetch/import ho user ke scope me
3. **User Bundles** — admin ki tarah user bhi apne services se bundles bana sake
4. **User Orders** — jab user order de, uski hi provider key use ho (admin fallback nahi jab user ki key ho)
5. **Full data isolation** — RLS strict, keys encrypted (pgcrypto), sirf owner ko dikhe

## Database changes

New / modified tables (sab RLS enabled, `auth.uid() = user_id`):

```text
user_provider_accounts
  user_id, name, api_url, api_key_encrypted, is_active, balance_cached
user_services
  user_id, user_provider_account_id, provider_service_id, name,
  category, price, min_qty, max_qty, is_active
user_bundles
  user_id, name, description, price, is_active
user_bundle_items
  user_bundle_id, user_service_id, engagement_type, quantity
```

Existing tables ko extend:
- `orders`, `engagement_orders`: nullable `user_provider_account_id`, `user_bundle_id`
- Jab ye set ho, order pipeline admin provider ke bajaye user ka provider use kare

Encryption:
- `pgcrypto` extension enable
- `api_key_encrypted` bytea; encrypt/decrypt SECURITY DEFINER functions with a key stored in `PROVIDER_KEY_SECRET` (edge secret)
- Client kabhi raw key nahi padhta — sirf edge functions decrypt kar sakte hain

## RLS matrix

| Table | SELECT | INSERT/UPDATE/DELETE |
|---|---|---|
| user_provider_accounts | `user_id = auth.uid()` | same |
| user_services | `user_id = auth.uid()` | same |
| user_bundles | `user_id = auth.uid()` OR `is_public = true` | owner only |
| user_bundle_items | via parent bundle owner | owner only |
| orders (existing) | already user-scoped | unchanged |

Admin ko bhi raw key nahi milegi (encrypted column pe koi SELECT policy jo plain text expose kare).

## Edge Functions

1. `user-provider-test` — user ki key validate kare (balance call), cache balance
2. `user-import-services` — user ke panel se services import kare `user_services` me
3. `place-order` (modify) — agar order me `user_provider_account_id` hai to us user ki decrypted key use kare, order us panel pe bheje; warna current admin flow
4. `process-engagement-order` (modify) — bundle agar `user_bundles` se hai to har item user ke provider pe route ho

## UI

Nayi pages (`src/pages/`):
- `MyProviders.tsx` — list/add/edit/delete user providers, test connection, sync services
- `MyServices.tsx` — imported services with per-service pricing view
- `MyBundles.tsx` — create bundle (admin `AdminBundles` jaisa UI par user scope)
- Existing order flows me toggle: "Use my provider" (selector jab user ke pass active provider ho)
- Sidebar me new section "My Panel" ke andar ye 3 links

## Pricing behavior

User apni key se order kare to **wallet se kuch nahi katega** — user apne SMM panel pe khud paisa rakhta hai. Platform sirf orchestration/analytics dega. (Admin flow me markup wallet debit continue rahega.)

## Security guarantees

- Encrypted at rest (pgcrypto AES)
- Never sent to browser — decryption only inside edge functions
- RLS enforces `user_id = auth.uid()` on every row
- `SECURITY DEFINER` decrypt function checks calling context is service_role
- Audit log entry on provider add / key rotate

## Rollout order

1. Migration: new tables + RLS + GRANTs + pgcrypto helpers
2. Edge functions: test connection + import services
3. Frontend: MyProviders page
4. Frontend: MyServices + MyBundles pages
5. Order pipeline routing (place-order + process-engagement-order)
6. Wire selector into existing order UI

Approve karein to migration se start karta hu.