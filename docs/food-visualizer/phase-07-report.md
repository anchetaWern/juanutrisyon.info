# Phase 7 — sodium lens

Date: 2026-10-23 (Asia/Manila). **Gate: PASS for Phase 7 implementation scope.** The user explicitly requested this phase. Original-source review remains unresolved; nothing was deployed or promoted through homepage/navigation/sitemap. Phase 8 has not started.

## Delivered

The [sodium lens](../../src/features/food-visualizer/components/SodiumLens.vue) uses the existing common result layout and canonical selected-portion result. Its [result model](../../src/features/food-visualizer/lenses.js) reads exact sodium in mg through `findNutrient`/`exactValue`, then derives approximate salt-equivalent grams with `mg × 0.0025` (equivalent to `mg × 2.5 / 1000`, without the potentially overflowing intermediate multiplication). It does not rescale nutrients or modify source data.

The view includes:

- Sodium mg, approximate salt-equivalent weight, visible formula and deterministic English/Taglish explanation.
- A fixed decorative salt-crystal illustration labeled “not to scale”. It is not a measured pile, shaker count or teaspoon. Its dimensions do not change with the nutrient value.
- Visible qualifications beside the result: sodium is not the same as salt; this is an approximate mass comparison, not how much salt was added.
- Truthful known-zero, small-positive, missing/invalid and partial-recipe states. Zero has no illustration; unavailable data has neither illustration nor salt equivalent. Partial subtotals are withheld. Tiny positives display a threshold rather than zero; very large values use scientific notation. The unrepresentably small positive conversion case retains positive text rather than reporting zero salt.
- A polite atomic text announcement, decorative SVG hidden from assistive technology, existing stale-portion labeling and responsive desktop/360-px layout. No animations, health classifications, daily limits or added-salt estimates.

Sodium is enabled in the native radio group. The mode label now reflects the active lens. Manual choices persist across portions and foods; restoring suggested mode recomputes from the current food. A context-only lookup suggests Sodium for the captured patis `1270` only when its ID/slug/exact description/source/taxonomy/preparation evidence matches. This is not nutritional source verification or a featured-example promotion. Unknown or changed context falls back to Sugar. Saturated fat and Carbohydrates remain disabled.

The patis profile's stored household basis is **15 g**, not an inferred 15 mL. Its selected-portion sodium is 759.15 mg and salt-equivalent weight 1.897875 g, displayed as approximately 1.9 g. Doubling the portion yields 1,518.3 mg and approximately 3.8 g. Mockup numbers and volume labels were not copied into the data contract.

## Verification actually run

**53 Node tests passed**: all previous cases plus eight sodium-focused tests.

```sh
npm run test:food-visualizer
```

[New tests](../../tests/food-visualizer/sodium.test.mjs) cover 800 mg → approximately 2 g; source sodium in grams normalized by the shared calculator; zero; tiny/large finite values; null/omitted/malformed/negative/nonfinite/unsupported/trace/duplicate inputs; an uncertain imported basis; partial recipe sodium; actual patis/recipe selected values; context matching; manual persistence and suggested reset. Existing sugar tests were updated only for the newly enabled Sodium control (two available lenses instead of one); all sugar mathematics/uncertainty tests remain intact.

**Sodium Chromium checks passed** at desktop 1280×1000 and mobile 360×800, with zero page runtime errors. The harness used seven mocked requests: one search plus six detail reads, comprising captured patis/mango and four explicitly synthetic boundary fixtures (800 mg, zero, missing, partial recipe). No production API requests were made. Verified:

- Actual patis default and doubled portion, decimal formatting and visible qualifications.
- Left/right arrow switching between Sugar and Sodium, correct mode labels and manual persistence across food changes.
- Restoring suggested mode on mango returns Sugar with whole-fruit wording.
- Tiny sodium/salt never appears as zero; invalid quantity retains the last valid result.
- Synthetic 800-mg input renders approximately 2 g; zero renders zero; unavailable/partial data has no equivalent or illustration.
- No horizontal overflow at 360 px; zero additional requests on quantity or lens edits.

[Browser harness](../../tests/food-visualizer/sodium-browser-check.mjs):

```sh
JN_PLAYWRIGHT_PATH=/Users/wernancheta/projects/juanutrisyon/nuxt-juanutrisyon/node_modules/playwright/index.mjs node tests/food-visualizer/sodium-browser-check.mjs
```

Use an existing Playwright installation and local preview; `JN_VISUALIZER_URL` overrides the default `http://127.0.0.1:4327/tools/food-visualizer`. No dependency installation is required. Desktop and full-page mobile captures were inspected at `/private/tmp/jn-phase7-sodium-desktop.png` and `/private/tmp/jn-phase7-sodium-mobile.png`.

**Existing sugar browser regression checks also passed** with six mocked requests, zero page runtime errors and no refetches on portion/lens changes. Fractional/capped/tiny/zero/unavailable sugar, fruit context and manual/suggested behavior remain working. The disabled-control assertion was updated to expect only Saturated fat and Carbohydrates to remain unavailable.

```sh
JN_PLAYWRIGHT_PATH=/Users/wernancheta/projects/juanutrisyon/nuxt-juanutrisyon/node_modules/playwright/index.mjs node tests/food-visualizer/sugar-browser-check.mjs
```

**Production SSG build passed with fetch disabled**, generating 21 pages including the canonical route:

```sh
NODE_OPTIONS="--import=./tests/food-visualizer/disable-fetch.mjs" npm run build
```

The generated calculator artifact/manifest, raw fixtures, API boundary and backend/app source are unchanged. No new source-calculator parity claim is needed beyond the unchanged calculator and existing regression checks: this phase only adds the specified derivative salt-mass calculation and presentation.

## Remaining limits and next phase

The unavailable FNRI report, localhost product-label URLs and captured Coke duplicate-nutrient issue remain unresolved. No source-review gate is cleared by these tests. Full accessibility/200% zoom review, verified featured examples, broader taxonomy-based suggestions and release checks remain in their planned phases.

On the user's next instruction, Phase 8 adds the saturated-fat part-to-whole lens. Existing Sugar and Sodium views remain the regression baseline.
