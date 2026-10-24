# Phase 9 — carbohydrate and reference-rice lens

Date: 2026-10-23 (Asia/Manila). **Gate: PASS for Phase 9 engineering scope.** All four lens numerical contracts are implemented and tested. Phase 1 original-source review remains unresolved; this report does not approve featured examples or release. Phase 10 has not started.

## Reference evidence

One fresh anonymous GET to the public rice-detail endpoint reverified rice `78`, slug `rice-well-milled-boiled`, Philippine source code `A020`, profile `109`, canonical option `206`, label `1/2 cup`, weight `80 g` and provenance `legacy_custom_servings`. The initial sandbox request failed DNS resolution; the approved retry succeeded. The [allowlisted evidence](phase-09-reference-evidence.json) records retrieval time, response hash and the actual calculated reference. The full raw response stays in `/private/tmp/jn-phase9-reference-live.json`, outside the repo.

The new [reference configuration/loader](../../src/features/food-visualizer/riceReference.js) stores identity and serving evidence, **not a carbohydrate denominator**. It resolves the canonical option through the existing portion adapter and calls the unchanged shared calculator at that serving. Both the original capture and the newly fetched live payload produce **23.76 g carbohydrate per 80-g reference serving**. A test changes the source nutrient input to prove that the denominator is recalculated rather than copied.

The loader fails closed if the configured identity, source ID, profile/option, label, gram weight, serving provenance or usable carbohydrate evidence changes/disappears. Duplicate options, missing/zero/ambiguous carbohydrate values and unsupported conversions also withhold the comparison. The default serving is not silently substituted for option 206.

This validates the current API contract and calculation. It does **not** independently verify the original FNRI nutrient report or laboratory provenance of the household cup conversion. The visible reference description explicitly says that the household weight comes from legacy JN serving data and original-report review remains pending.

## Delivered

The [carbohydrate component](../../src/features/food-visualizer/components/CarbohydrateLens.vue) shows exact, canonical total-carbohydrate grams separately from the rice comparison. Its [lens model](../../src/features/food-visualizer/lenses.js) divides those grams by the positive calculated reference carbs at full precision. No starch amount, added-sugar amount, health equivalence or blood-glucose prediction is derived.

- Equal carbs yield one reference serving; fractional fills and numeric text represent fractional servings.
- Illustrations are bounded to eight reference servings, with the full total stated for larger equivalents. Tiny positives, known zero and numeric-range failure have distinct text. Drawings do not define a household bowl size.
- Missing/partial food carbs produce no equivalent. A missing, loading, failed, zero or changed reference cannot fabricate an equivalent **or hide known food carbs**.
- The visible reference identifies its exact food, ½-cup/80-g serving, calculated carbs, source code and serving provenance. It compares carbohydrate amount only, with qualifications beside the visual and takeaway.
- A context-only ID/slug/description/source/taxonomy/preparation lookup suggests Carbohydrates for the captured cooked-rice and pandesal records. Staple copy explains that low sugar need not mean low total carbohydrates and explicitly avoids calculating measured starch from total carbohydrates. This does not promote either record as a source-verified featured food.
- All four radio controls are enabled. Manual choices persist across foods and portions. The new result uses the shared responsive layout, stale-portion labels, decorative graphics and polite text announcement.

Reference loading is lazy: it starts when a selected food first needs the carbohydrate view, not during static generation, mounting an empty page, ordinary typing or quantity edits. The selected food and reference share the same API client/cache/in-flight registry. A selected rice payload is validated and reused directly; concurrent selected/reference requests deduplicate. Once loaded, the reference is retained for the page session and is recalculated if a newly selected rice payload supplies newer evidence.

Reference request errors remain separate from selected-food state. Network/server failures expose manual retry and rate-limit retry timing; there is no automatic retry loop on lens changes. Changed/invalid reference evidence shows a review-required state without automatically substituting another serving. Disposal and generation checks prevent stale reference completion from restoring invalid or unmounted state.

## Validation actually run

**73 Node tests passed**: 63 previous cases plus 10 [new reference/carbohydrate cases](../../tests/food-visualizer/carbohydrates.test.mjs).

```sh
npm run test:food-visualizer
```

New checks cover the audited denominator and equal-carb case; changed identity/options/weight/provenance; missing/zero/duplicate reference carbs; dynamic denominator calculation; fractional/capped/tiny/zero and overflowing comparisons; preservation of known food carbs on reference failure; Coke duplicate guards and partial recipes; shared in-flight deduplication; reuse of selected rice; manual retry; disposal/stale-response protection; and staple/manual lens state.

**Carbohydrate Chromium checks passed in four scenarios**, with zero page runtime errors:

1. Hold the reference request pending while bread's known carbs remain visible; release it, compare portions and select the already cached rice without another request. Equal carbs give one serving, half portions give half, large counts stay capped, and quantity/lens edits after reference initialization make no requests.
2. Fail reference loading with a synthetic server error, retain bread's known carbs without an equivalent, hide the server trace, then recover through manual retry.
3. Return a changed rice serving weight: retain known food carbs, withhold reference graphics/equivalence and show a review-required state.
4. Return zero reference carbs: the same independent unavailable-comparison behavior applies.

The main scenario also covers Coke's unavailable food carbs, staple copy, source description, desktop 1280×1000 and mobile 360×800 with no horizontal overflow. All browser API responses are intercepted captured records or explicit test mutations; no synthetic food is published by the feature. The only real API read in this phase was the separate rice-contract recheck described above.

```sh
JN_PLAYWRIGHT_PATH=/Users/wernancheta/projects/juanutrisyon/nuxt-juanutrisyon/node_modules/playwright/index.mjs node tests/food-visualizer/carbs-browser-check.mjs
```

Use an existing Playwright installation and local preview; `JN_VISUALIZER_URL` overrides `http://127.0.0.1:4327/tools/food-visualizer`. Full-page desktop/mobile screenshots were inspected at `/private/tmp/jn-phase9-carbs-desktop.png` and `/private/tmp/jn-phase9-carbs-mobile.png`. Full-page capture avoids the existing sticky navigation overlapping a tall element-only screenshot.

**Sugar, Sodium and Saturated-fat browser regressions all passed**, with six, seven and eleven mocked requests respectively, zero page errors and no additional requests on their portion/lens edits. Their numerical assertions remain unchanged. Availability assertions now expect all four views and reject an unknown lens ID instead of treating Carbohydrates as unimplemented.

**Production SSG build passed with fetch disabled**, generating 21 pages including the canonical public route:

```sh
NODE_OPTIONS="--import=./tests/food-visualizer/disable-fetch.mjs" npm run build
```

The existing calculator artifact/manifest, raw Phase 1 captures, backend/app source and dependencies are unchanged. No production API behavior change, deployment or homepage/navigation/sitemap promotion occurred.

## Remaining gates and next phase

Original FNRI/label-content review, unusable product-label URLs, captured Coke's duplicate nutrient issue and educational-copy sign-off remain unresolved. The live API recheck does not clear those gates. Full accessibility/200% zoom review, analytics and release/discovery checks remain in their planned phases.

On the user's next instruction, Phase 10 adds source disclosure, reviewed examples where evidence permits, and the existing app handoff links. No example should be labeled source-verified solely because its calculation or reference contract passed these tests.
