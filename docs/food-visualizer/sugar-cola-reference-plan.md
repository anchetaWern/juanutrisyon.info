# Sugar visualization using glasses of cola

Date: 2026-10-29 (Asia/Manila). Status: implemented locally after the user authorized proceeding and confirmed the reference should remain internal. See the [implementation report](sugar-cola-reference-report.md). The sequence below retains the implementation plan.

## Confirmed requirements

- Replace the existing 5 g sugar-packet visualization; do not add a toggle.
- Label the reference as **cola**, matching the generic PhilFCT record.
- Use PhilFCT **“Softdrink, cola”** and the user's definition **1 glass = 260 g**.
- Keep total sugar in grams visible for the selected food and portion.
- Preserve the current source/custom-serving eligibility rules for selectable foods.
- Keep the recently removed source/calculation and rice-reference disclosures removed. Do not introduce a new expandable provenance section for cola.

## Verified reference

Read-only connected-catalog lookup and local Herd API detail retrieval identified:

| Field | Observed value |
| --- | --- |
| JN food ID | `1346` |
| Description | `Softdrink, cola` |
| Slug | `softdrink-cola` |
| Data source | `ph_fct` |
| PhilFCT source ID | `Q053` |
| Recorded nutrient basis | `100 g` |
| Stored total sugar | `9.4 g` per recorded basis |
| Configured reference serving | `260 g`, defined by the user as one glass |
| Shared-calculator result for 260 g | `24.44 g` total sugar |

These are observations of the connected catalog/local API, not a fresh independent review of the original PhilFCT report. The reference has no assigned, food-specific or subtype custom servings. The 260 g reference is a tool configuration supplied by the user; do not describe it as an existing catalog serving or assume it is 260 mL.

## Calculation

```text
sugar per reference glass = exact total sugar from calculateFood(colaFood, 260, 'g')
equivalent glasses = exact selected-portion total sugar / sugar per reference glass
```

Use the existing shared calculator and its nested nutrient lookup. Store reference identity and the 260 g serving definition in configuration; do not store `9.4` or `24.44` as an independent production nutrient constant. Calculate before display rounding.

At the observed reference values, 12.22 g sugar corresponds to 0.5 glass, 24.44 g to one glass and 48.88 g to two glasses. These are verification examples, not hardcoded denominators. If valid reference nutrient values change, recompute from the loaded record.

## Implementation sequence

### 1. Add the cola reference loader

Add `src/features/food-visualizer/colaReference.js` following the established `riceReference.js` lifecycle:

- Pin ID, slug, exact description, `ph_fct` source and `Q053` source identity; validate a usable recorded weight basis.
- Calculate the user-defined 260 g reference directly. This reference does not require an assigned catalog option ID.
- Require complete, exact, positive total sugar in grams; reject missing, partial, trace, duplicate, invalid or zero reference sugar and incompatible basis changes.
- Load the detail through the existing configured `foodApi`, using the same local/production API selection. The comparison reference can be fetched directly even while the record is excluded from the picker for lacking custom servings. Do not loosen search or selection eligibility.
- Lazy-load when the sugar lens needs the comparison; reuse cached/in-flight data and a selected cola object when available.
- Support manual retry for request failures, rate-limit delays, stale-response rejection and disposal on unmount. Avoid automatic retry loops and quantity-driven requests.

Keep rice and cola loading independently understandable. A generic reference-loader refactor is not necessary for this change.

### 2. Replace the packet calculation contract

Update `sugarResult` in `lenses.js` to accept cola reference state and return sugar grams plus the calculated glass count. Preserve distinct states for unavailable food sugar, unavailable reference, unsupported numeric comparison, explicit zero, tiny positive values and usable comparisons.

- Missing or incomplete food sugar never becomes zero or an exact equivalence.
- Reference failure leaves known food sugar visible and withholds the glass comparison.
- Fractional counts retain full precision for fills and arithmetic.
- Values below 0.01 glass show `<0.01`, with no misleading minimum fill.
- Cap illustrations at eight glasses, showing the true total numerically for larger amounts. Use scientific notation for very large numeric labels, as existing lens formatting does.
- Guard division overflow; do not render an infinite count or allocate unbounded elements.

### 3. Update the sugar lens and copy

Replace packet shapes in `SugarLens.vue` with unbranded, straight-sided cola-glass illustrations built in HTML/CSS or inline SVG. Full glasses represent whole equivalents; the final partial fill represents the fractional equivalent. Do not use a Coca-Cola logo or imply a specific branded formulation.

Suggested presentation:

```text
24.44 g total sugar
[one illustrated glass]
About the same total sugar as 1 glass of cola.
Reference glass: 260 g of cola.
```

Keep reference context short and inline. Explain fractional fills and capped drawings only when applicable. Show loading/error/retry states near the comparison without hiding the selected food's grams.

Revise the neutral and whole-fruit sugar copy to remove packet wording. Preserve the distinction between total and added sugar; whole-fruit copy should explain that matching sugar amounts does not mean cola was added to the fruit or that the foods have the same overall nutritional effects. Avoid daily-limit or blood-glucose claims.

### 4. Connect page state and announcements

- Instantiate the cola reference alongside the existing rice reference in `food-visualizer.vue`.
- Ensure the appropriate reference when its lens is active, pass cola state/retry into `SugarLens`, and dispose both loaders on unmount.
- Pass the correct reference to `resultAnnouncement` for each lens; do not reuse rice state as sugar-reference state.
- Update sugar live announcements to describe grams and glasses, including unavailable/zero states. Mark repeated glass graphics as decorative so screen readers receive one concise textual equivalent.
- Keep the analytics lens ID `sugar`; do not introduce a glasses/packets preference or new toggle events.

### 5. Verify against real data and browser states

- Capture an allowlisted cola detail fixture and record its identity, basis and calculation evidence without changing existing historical captures.
- Unit tests: identity validation; 260 g scaling; correct nested sugar; one/half/two glasses; fractional precision; selected zero vs unknown; partial recipes; invalid reference; tiny/large/overflow results; unchanged source objects.
- Loader tests: lazy fetch, deduplication, selected-reference reuse, manual retry, rate limiting, stale responses and disposal.
- Announcement tests: remove packet references and use glass-count wording with the matching reference state.
- Update existing sugar browser and accessibility scenarios to mock the cola request explicitly, keep nutrient fixtures separate from synthetic boundary cases, and account for the one-time reference request.
- Browser checks at desktop/mobile widths: full/fractional/capped glasses, missing sugar, reference loading/failure/retry, keyboard use, no horizontal overflow, and no requests during quantity edits after reference load.
- Verify a real search, selection and cola-reference load against the configured local Herd API. Mocked browser tests alone did not catch the earlier API-base mismatch.
- Run the visualizer unit suite, focused sugar/accessibility browser checks and production build; check that development API configuration stays out of production assets.

## Completion criteria

The sugar lens shows cola glasses instead of packets, using exactly 260 g of the specified PhilFCT cola per glass. The denominator comes from the current reference record through the shared calculator. Total sugar remains visible, unavailable data stays unavailable, the food-picker policy is unchanged, and the removed disclosures stay removed.

No product questions remain. The reference remains internal; no catalog serving was assigned and no backend change was required.
