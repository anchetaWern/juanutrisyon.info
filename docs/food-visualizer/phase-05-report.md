# Phase 5 — portions and canonical nutrient results

Date: 2026-10-23 (Asia/Manila). **Gate: PASS for Phase 5.** Original-source/label review from Phase 1 remains unresolved. This phase was explicitly authorized after Phase 4; no source-review waiver or deployment is implied. Phase 6 has not started.

## Delivered

The selected-food page now includes a serving selector, decimal quantity input, ±0.5 controls, resolved numeric basis and conversion evidence. Its seven-field summary shows total sugar, total carbohydrates, fiber, sodium, saturated fat, total fat and energy. Individual exact nutrients remain visible even if other nutrients are missing. No nutrient-equivalence visuals or daily-value classifications were added.

[Portion adapter and state](../../src/features/food-visualizer/portions.js) resolve the portion separately from immutable raw food data. Nutrients are calculated only with the existing generated `calculateFood`/`findNutrient`/`exactValue` functions. The calculator artifact and its manifest are unchanged.

Serving resolution:

1. An explicit override can select a usable **canonical** option ID; legacy IDs cannot impersonate canonical IDs. No unreviewed curated overrides are configured.
2. A usable canonical default is preferred, even if it is not the first row; otherwise use the first usable canonical option.
3. Fall back to usable food-specific legacy household options, then subtype household options already supplied by the API.
4. Use the recorded source serving when no household option is usable. Direct grams/milliliters are also available where compatible with the source dimension or a documented density.

Household weights and volumes remain distinct. Volumes do not need density when the source is volume-based. Cross-dimension conversion requires a density with units recognized by the shared core. Household labels are never parsed into inferred package sizes. Explicit edible/as-purchased option evidence is converted through the shared `convertEdibleWeight` primitive before canonical calculation; no user-invented edible-weight toggle is exposed. The UI discloses supplied measurements, density conversions and explicit edible-weight conversions.

Blank, zero, negative, malformed, nonfinite and overflowing portion amounts are rejected while the last valid selection/result remains visible and labeled. Valid input restores the result. New food selection resets portion state. Portion edits are local and never call the API.

Nutrient display uses two decimal places, a truthful `<0.01` for smaller positive values and explicit zero for known zero. Raw calculations retain full precision. Partial recipe subtotals are not displayed as exact values; the summary uses “Data not available” and incomplete recipe coverage text. Selected basis display uses significant digits so tiny positive portions do not round to a displayed zero.

## Validation

**35 Node tests passed**, including 14 new portion/summary tests and all prior artifact/API/selection checks:

```sh
npm run test:food-visualizer
```

New tests cover canonical defaults/overrides, unusable defaults, canonical-versus-legacy identities, subtype fallback including unusable food-specific options, all captured foods at household/source/direct portions and fractional quantities, volume-only servings, documented versus unqualified density, count units, both edible-weight conversion directions, invalid-input retention/recovery, reset behavior, missing/null/zero/partial results and display rounding.

**Source/artifact/Food Details comparison** used the actual existing source calculator and `buildNutrientRow` helper, loaded read-only through the app's Vite module loader. Run with an explicit app path:

```sh
node scripts/check-food-visualizer-parity.mjs /Users/wernancheta/projects/juanutrisyon/nuxt-juanutrisyon
```

Results: **72 selected portions across the seven captures matched the source calculator at full precision**, including complete result trees and provenance. **504 Food Details table field comparisons** were performed at matching source-unit selections. 502 matched exactly; two recipe-sodium results differed by less than 10⁻¹⁵ mg due to operation order. Exact recorded differences are in [parity evidence](phase-05-parity.json). No intermediate rounding, tolerance or adjustment was added to the product calculation to hide these differences. The comparison script explicitly permits only tiny floating-point operation-order differences in the table check; source/artifact equality stays strict.

App source HEAD: `22f81d7eedd82c1567d32e2c65817efae637e29a`. The source calculator files remain unchanged. The module loader required localhost-listener approval after a sandbox WebSocket warning; the approved rerun completed without that warning. No app/backend source writes were needed.

**Chromium portion checks passed** with seven captured public foods, desktop 1280×1000 and mobile 360×800. One mocked search plus seven mocked detail reads were made; all quantity/unit/serving edits made **zero additional requests**. Verified canonical rice default 206/80 g, fractional rice values, retained results after blank input, steppers, small-positive sugar formatting, food-change reset, omitted patis sugar, Coke zero saturated fat and unavailable sugar, 480-mL drink selection, gata saturated fat at 50 mL, partial recipe sugar with known sodium, no mobile horizontal overflow and zero page errors. Desktop/mobile screenshots were inspected at `/private/tmp/jn-phase5-desktop.png` and `/private/tmp/jn-phase5-mobile.png`.

```sh
JN_PLAYWRIGHT_PATH=/Users/wernancheta/projects/juanutrisyon/nuxt-juanutrisyon/node_modules/playwright/index.mjs node tests/food-visualizer/portions-browser-check.mjs
```

This browser harness uses an already-installed Playwright toolchain, not a new app dependency. Set `JN_VISUALIZER_URL` to override the local URL; default is `http://127.0.0.1:4327/tools/food-visualizer`. It makes no production API requests. Development checks caught missing rendered whitespace between nutrient numbers and units, which was fixed in the page. A later harness timeout was corrected to match food names literally, including the parentheses in the gata name.

**Production SSG build passed with fetch disabled**, rendering 21 pages. The build still needs no sibling app or API response:

```sh
NODE_OPTIONS="--import=./tests/food-visualizer/disable-fetch.mjs" npm run build
```

## Food Details differences and limits

- Food Details currently derives its default from legacy custom-serving rows (first row for a food-specific profile, or a preparation match for subtype data). It does not consult canonical `is_default`. This page follows the agreed canonical-default contract. The captured household foods have a single matching option, so their current defaults agree. The second-row canonical default behavior is covered by synthetic tests; the app default helper was not changed.
- Food Details pre-aggregates recipe nutrients at the source serving and its table then scales those totals. The visualizer calls the canonical calculator directly at the final portion. That explains the two tiny sodium differences recorded above; display rounding agrees.
- Comparison of Food Details is at its actual calculator/table-helper boundary plus source review of default behavior, not an end-to-end browser run of the Nuxt Food Details page. The recorded portions use source-compatible units; synthetic tests separately establish supported density and edible-weight conversion behavior.
- Captured Coke sugar/carbohydrates remain unavailable due to duplicate canonical parents. Captured recipe sugar, saturated fat, total fat and carbohydrates remain partial. No catalog record, guard or fixture was altered to produce a numeric answer.
- Source/label review, reviewed featured examples, lens visuals, full accessibility review and release/discovery checks remain in their planned phases. No homepage/nav/sitemap promotion or deployment was performed.

## Next phase

On the user's next instruction, Phase 6 adds the shared result/lens layout and sugar visualization using this exact-value result contract. Existing source-review limits still apply.
