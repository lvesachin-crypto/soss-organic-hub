# Fix: Engagement items stuck on "processing" + check-order-status 504 timeouts

Dono findings confirmed. Root cause verified against current code (`syncEngagementItemTracking` in `execute-all-runs/index.ts` L606–683, mirrored in `check-order-status/index.ts`, plus migration `20260711040700` trigger `engagement_order_items_tracking_recompute`).

---

## Issue 1 — Items never flip to "completed"

**Why it happens today:**
1. `validRuns` filter uses `Number.isFinite(Number(run.provider_start_count))` — `Number(null) === 0`, so runs with missing provider start count get treated as `start=0`, dragging `firstProviderStart` to `0`.
2. `shouldUseProviderBaseline` fires whenever `existingStart === 0`, so the backfill's `start_count=0` gets overwritten with `0` again — permanently.
3. `current` uses `Math.max(...observedCounts)` where each `observedCount = start + delivered_of_ONE_run`. For a 5-run item, max reachable current = biggest single run's qty, but `target = 0 + total_item_quantity` (sum of all runs). Target never met.
4. Trigger + `updateEngagementOrderStatus` both re-force `status='processing'` because `completion_locked_at` never gets set.

**Fix plan:**

### A. `syncEngagementItemTracking` (both `execute-all-runs/index.ts` and `check-order-status/index.ts`)

Replace the flawed `validRuns` / `observedCounts` logic with a delivery-sum model that works whether or not the provider returns a public start count:

- Fix `validRuns` filter — use `run.provider_start_count != null` explicitly (not `Number()` coercion), so null stays null.
- Compute `totalDelivered` as **SUM** across all runs of `deliveredForRun = qty_to_send - max(0, provider_remains)` (fallback: `qty_to_send` when run.status is completed/success, else 0).
- Baseline: prefer `firstProviderStart` when it exists and is > 0. Otherwise keep `existingStart` (never overwrite a real value with 0). When both are unknown, keep baseline as `existingStart ?? 0` but do NOT enable the strict trigger gate (see §C).
- `current = baseline + min(orderedQty, totalDelivered)` — monotonically progresses, capped at target.
- `targetReached = totalDelivered >= orderedQty` (delivery-based, not public-count-based) → this is the source of truth for completion.

### B. `updateEngagementOrderStatus` (both files)

Remove the `(!tracking || tracking.targetReached)` gate around the runs-based completion path. Instead:
- Always compute `itemStatus` from run states (existing logic).
- If `itemStatus === 'completed'` AND `tracking.targetReached` (delivery-based) → allow flip to `completed`.
- If `itemStatus === 'completed'` but delivery short → keep as `partial`, not `processing` (matches reality: all runs finished, some short-delivery).
- Drop the "force back to processing" write when tracking not reached but no active runs exist.

### C. DB migration — relax trigger + backfill correction

New migration:

1. **Rewrite `engagement_order_items_tracking_recompute`** so the completion gate uses `delivered_count >= quantity` (delivery-based) rather than requiring `current_count >= target_count` (public-count-based). Public count remains as informational display, not a completion blocker. Keep monotonic `max_observed_count`. Mirror same relaxation for `orders_tracking_recompute` for consistency (single-order path affected identically).

2. **Backfill correction** — for items where `start_count = 0` AND at least one linked run has `provider_start_count > 0`, update `start_count` to that first provider start value. For items where all runs lack provider start counts, keep `start_count = 0` (the relaxed trigger allows this).

3. **Unstick existing items**: for items where SUM of delivered across runs >= quantity but status ≠ completed, mark as `completed` with `completion_locked_at = now()`. Same one-off cleanup for parent `engagement_orders` where all items are terminal.

---

## Issue 2 — `check-order-status` 504 timeouts

**Why:** function pulls all "started" runs via broad `.or(...)` filter, then sequentially calls provider API + does per-run + per-item Supabase writes. No batching, no concurrency, no per-request timeout, no wall-clock budget. As started-run count grows → >150s → 504.

**Fix plan (single edit to `supabase/functions/check-order-status/index.ts`):**

1. **Wall-clock budget**: capture `startedAt = Date.now()` at top; define `BUDGET_MS = 110_000` (leave headroom under 150s edge limit). Break out of the main loop when `Date.now() - startedAt > BUDGET_MS` — remaining runs picked up on next cron tick.

2. **Batched fetch with LIMIT + order**: change the initial select to `.limit(300).order('last_status_check', { ascending: true, nullsFirst: true })` so oldest-checked runs get priority and we don't try to boil the ocean in one invocation.

3. **Bounded concurrency (Promise pool)**: process runs in parallel with a concurrency cap of 6 using a simple pool helper. Each task = one provider status HTTP call + its writes.

4. **Per-request HTTP timeout**: wrap the provider `fetch(...)` in `AbortController` with 8s timeout. On timeout → log + skip that run (retry next cron), don't fail the whole invocation.

5. **Coalesce per-item tracking sync**: collect unique `engagement_order_item_id` from processed runs into a Set; after the loop call `syncEngagementItemTracking` once per item instead of once per run. Same for `updateEngagementOrderStatus` (dedupe by `engagement_order_id + item_id`).

6. **Reduce Supabase round-trips**: where the current code does multiple sequential updates per run, combine into a single `update({...})` where possible.

Return summary `{ processed, skipped_over_budget, timeouts, errors, duration_ms }` for the admin cron monitor.

---

## Files touched

- `supabase/functions/execute-all-runs/index.ts` — §A + §B
- `supabase/functions/check-order-status/index.ts` — §A + §B + all of Issue 2
- New migration `supabase/migrations/<ts>_relax_completion_gate_and_unstick_items.sql` — §C

## Verification after deploy

1. `SELECT COUNT(*) FROM engagement_order_items WHERE status='processing' AND delivered_count >= quantity` → should be 0 immediately after migration.
2. Watch `check-order-status` logs for `duration_ms < 110000` and no 504s in project analytics.
3. Sample 3 TikTok likes/comments/shares orders — confirm they flip to `completed` after runs finish.

## Risk / rollback

- Trigger change is backwards-compatible (relaxes, never tightens). Rollback = re-apply old trigger definition.
- Edge function changes are additive (budget + concurrency). If any regression → revert file.
- One-off backfill UPDATE is idempotent (only touches rows meeting the exact stuck condition).