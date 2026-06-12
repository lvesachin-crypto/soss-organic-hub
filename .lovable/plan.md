## Goal

User ko per-engagement-type **"Number of Runs"** control dena hai. User decide kare ki 24k views kitne runs me deliver ho (e.g. 100 runs, 170 runs, 200 runs). Quantity randomly distribute ho un runs me, min-per-run respect karte hue. Time setting pehle se hai — ye uske saath kaam karega.

## Rules

- **Max runs cap:** `floor(quantity / minQuantity)`. Example: 24,000 views, provider min 100 → max 240 runs. Min 170 → max 141 runs.
- **Min runs:** 1.
- Agar user cap se zyada runs set kare → input clamp + red warning: "Max N runs allowed (quantity/min se calculated)."
- Quantity distribution: total quantity ko runs me randomly split karenge with ±variance, but har run >= providerMin.
- Time setting (Auto / 6h / 12h / custom) waise hi kaam karegi — runs us window me spread honge.

## UI changes

**EngagementTypeCard** (`src/components/engagement/EngagementTypeCard.tsx`):
- New "Number of Runs" field under Settings (next to Delivery Time).
- Input: numeric, default = auto-calculated (current behavior), shows `Max: N runs` hint.
- Quick presets: Auto / 50 / 100 / 200 / Custom.
- Stores in `config.runCount` (new optional field on `EngagementConfig`).

## Logic changes

**`src/lib/engagement-types.ts`**
- Add `runCount?: number` to `EngagementConfig` (undefined = auto).

**`src/lib/organic-algorithm.ts` → `generateOrganicSchedule`**
- Accept optional `forcedRunCount` param.
- If provided, clamp to `[1, floor(quantity / minQuantity)]` and use that exact count instead of internal heuristic.
- Distribute quantity across runs with existing variance algorithm, ensuring each run ≥ providerMin.

**`src/components/engagement/DeliveryPreview.tsx`**
- Pass `config.runCount` through when calling `generateOrganicSchedule`.

**`supabase/functions/process-engagement-order/index.ts` & `place-order/index.ts`**
- Read `run_count` from order payload and pass to schedule generator so server-side schedule matches preview.

## Out of scope

- Time controls (already exist).
- Pricing logic (unchanged).
- Single Order page (separate request).

## Acceptance

- 24,000 views, min 100, user sets **170 runs**, time 26h → preview shows exactly 170 runs spread across 26h, each run ~141 views ±variance.
- User types 300 runs (>240 cap) → input clamps to 240, red warning shows "Max 240 runs (24000 ÷ 100)".
- Empty/Auto → existing behavior unchanged.
