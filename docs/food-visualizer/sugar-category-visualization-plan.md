# Sugar visualization by food type

Date: 2026-10-29 (Asia/Manila). Status: implemented locally after the user authorized proceeding. See the [implementation report](sugar-category-visualization-report.md). The sequence below retains the implementation plan.

## Confirmed behavior

Apply this change to the **Sugar** view:

| Top-level catalog food type | Visualization | Reference |
| --- | --- | --- |
| `prepared-and-processed` | Cola glasses | Existing PhilFCT `Softdrink, cola` reference; 260 g per glass |
| Any other identified food type | Teaspoons of sugar | **4 g total sugar per teaspoon equivalent**, confirmed by the user |

Choose the visualization automatically for the selected food. Do not introduce a toggle or change the other nutrient views, catalog eligibility, food classifications or nutrient calculations.

Use the food detail's top-level **`type.slug`**, not the food name, preparation state, subtype, data source or a food-specific context allowlist. The newer taxonomy/category metadata is a separate field and should not silently replace this existing classification.

If the top-level type is missing or cannot be identified, retain the known sugar grams and withhold the category-dependent illustration. Do not guess that missing classification means non-prepared, or make additional catalog requests to guess it.

## Current examples

Read-only connected-catalog checks found these classifications:

| Food | Current top-level type | Planned sugar visualization |
| --- | --- | --- |
| `Mango, Manila super, ripe` | Fruits | Teaspoons |
| `Bread, pan de sal` | Cereals and Grains | Teaspoons |
| `Sugar, white, refined` | Sugars and Sweets | Teaspoons |
| `Banana, saba, w/ sugar, fried` | Prepared and Processed | Cola glasses |
| `Rice, well-milled, boiled` | Prepared and Processed | Cola glasses |
| `Fish sauce` | Prepared and Processed | Cola glasses, only when complete sugar data exists |

These follow the catalog even when a food's everyday meaning sounds processed. The internal cola reference is itself classified as Beverages; it remains usable as a comparison reference. Its classification does not control which selected foods use the cola comparison, and its lack of custom servings still prevents ordinary picker eligibility.

## Calculation rules

Keep the shared calculator as the sole source of the selected portion's total sugar.

```text
teaspoon equivalents = exact selected-portion total sugar in grams / 4
cola glass equivalents = exact selected-portion total sugar in grams
                         / calculated sugar in the 260 g cola reference
```

The 4 g teaspoon is an internal visualization definition. It is not a serving assignment or a nutrient value from a sugar record. Do not change catalog food-serving weights to match it. In particular, the current `Sugar, white, refined` serving is 1 tsp = 5 g of that food; its selected portion and calculated nutrients remain as recorded, while the visualization expresses those total-sugar grams using the separate 4 g equivalent.

For the currently verified mango record, 1/2 cup (70 g) contains 9.66 g total sugar: **2.415 teaspoon equivalents**, displayed as approximately **2.42**. Quantity two gives **4.83**. These are test expectations, not new nutrient constants.

## Implementation sequence

### 1. Centralize visualization selection

Add a small pure helper, proposed as `sugarComparison.js`, to select the mode from `food.type.slug` and describe its reference, singular/plural labels and availability. Keep the 4 g definition in one named configuration value. Reuse this helper for rendering, announcements and deciding whether cola needs loading.

The teaspoon descriptor is immediately ready and independent of cola request state. The cola descriptor uses the existing validated reference state. Missing classification has a distinct unavailable-comparison reason.

### 2. Generalize the sugar presentation calculation

Update `sugarResult` to consume the selected comparison descriptor instead of assuming cola. Keep one path for sugar extraction, division, formatting and bounded fills.

- Preserve explicit zero, missing/partial sugar, tiny positives, invalid comparison references and numeric-overflow guards.
- Keep eight illustrations as the shared cap, with the actual total shown numerically.
- Preserve full precision until display formatting; `<0.01` depends on the selected reference unit.
- A failed cola reference must not prevent a valid teaspoon result for another food.
- Known sugar grams remain visible when classification or the relevant reference is unavailable.

### 3. Render the appropriate illustration and copy

Extend `SugarLens.vue` to show teaspoon illustrations for teaspoon mode and retain the existing glass illustration for cola mode. Match the current interface styling; use code-native SVG/CSS, with no new image dependencies.

For teaspoons, use whole spoon symbols plus a clear fractional indication for the remainder. State the exact count textually so users do not need to estimate the spoon fill. Keep the symbols decorative to screen readers.

Suggested teaspoon presentation:

```text
9.66 g total sugar
[2 full teaspoon symbols and a fractional symbol]
About 2.42 teaspoons of sugar by weight.
1 teaspoon equivalent = 4 g of sugar.
```

Use teaspoon-specific singular/plural, partial-fill and capped-count copy. Cola-specific loading/error/retry/reference text appears only in cola mode. Do not show a cola loading message on a teaspoon food.

Update neutral and whole-fruit copy to match the mode. Teaspoons illustrate total sugar by weight; they do not indicate sugar added to the food. In particular, whole-fruit copy must not imply that spoonfuls were poured into fruit. Retain the total-sugar versus added-sugar distinction. Keep the removed expandable disclosures removed.

### 4. Connect page loading and announcements

- Derive one comparison descriptor from the selected food and current cola state; pass it to the sugar lens and sugar announcement path.
- Fetch cola only when Sugar is active, the selected food is Prepared and Processed, and its sugar is usable.
- Switching to a teaspoon food works immediately, even if a previous cola request is pending or failed. An eventual response may remain cached but cannot change the teaspoon result.
- Selecting a Prepared and Processed food later reuses the existing cache/loader and manual retry behavior.
- Quantity edits update either visualization locally without network requests.
- Keep the existing `sugar` analytics lens ID; no new mode-selection event is needed because the food type chooses the mode.

### 5. Verify both branches

- Unit tests: exact category branching; no inference from names/subtype/source; missing classification; 4 g conversion; existing cola calculation; zero, partial, fractional, tiny, capped and overflow cases; independence from failed cola state.
- Announcement tests: correct mode, unit names, singular/plural, gram amount and unavailable reasons.
- Browser checks: mango/pandesal use teaspoons without a cola request; fried saba/cooked rice use glasses when sugar is known; quantities update correctly; switching modes during a delayed/failed cola request does not leak stale text or shapes.
- Retain positive tests for Prepared and Processed cola foods. Existing synthetic sugar browser fixtures will need explicit food types rather than relying on an unspecified default mode.
- Check mobile/desktop layout, keyboard focus and accessibility for both illustrations.
- Verify the exact ripe-mango example against the real configured local API and a prepared-food cola example. Run the visualizer unit suite, focused browser checks and production build.

## Completion criteria

Prepared and Processed foods retain cola glasses; every other identified food type uses 4 g teaspoon equivalents in the Sugar view. Grams remain authoritative, missing data stays unavailable, no catalog serving changes occur, and teaspoon foods never require a cola-reference request.

Implementation is complete locally. No API, catalog serving or food-classification changes were needed. Deployment has not been performed.
