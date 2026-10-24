# Phase 8 — saturated-fat part-to-whole lens

Date: 2026-10-23 (Asia/Manila). **Gate: PASS for Phase 8 implementation scope.** Original-source review remains unresolved; no source-review waiver, discovery promotion or deployment is implied. Phase 9 has not started.

## Delivered

The [saturated-fat component](../../src/features/food-visualizer/components/SaturatedFatLens.vue) uses the existing common result layout and canonical portion result. Its [result model](../../src/features/food-visualizer/lenses.js) reads saturated-fat and total-fat grams separately through the shared `findNutrient`/`exactValue` boundary. It does not rescale nutrients or infer saturated fat from total fat.

A labeled bar shows saturated fat **within** total fat, with “Other fat” as the remainder. The visible text and legend identify the gram amounts and percentage of total fat; the percentage is not a daily value or health score. This corrects mockup 06's standalone gram blocks. No butter/oil equivalence is used.

A share is drawn only when both values are complete, compatible gram quantities and `0 ≤ saturated ≤ total` with `total > 0`. The model checks validity before display rounding. It never clamps inconsistent values into a valid graphic.

- Valid pairs show the ratio, saturated-fat grams and `total − saturated` grams of other fat.
- Zero saturated fat with positive total fat shows a valid 0% share; equal positive values show a valid 100% share.
- Two reported zeros retain both gram values but show no percentage, remainder or bar.
- Saturated fat greater than total fat, including positive saturated fat with zero total fat, retains both reported amounts and explains the inconsistency without a bar.
- Missing, invalid or partial partners retain any individually known gram amount while withholding the ratio/remainder. Partial recipe subtotals cannot establish exact amounts.
- Tiny positive shares and positive remainders near 100% use threshold labels, rather than false 0% or 100% claims. The bar uses the unrounded ratio without artificial minimum fills; a visible note explains shares too small to distinguish. Large values use scientific display notation.

The bar is decorative alongside its equivalent text. A polite atomic announcement includes both gram values and the share or its unavailability. Existing last-valid-portion labeling remains visible during invalid quantity edits. No animation was introduced.

Saturated fat is enabled in the native lens radio group. A context-only identity lookup suggests it for the captured gata record `1715`, requiring matching slug/exact description/source/taxonomy/preparation evidence. This does not verify its label or promote it as a featured example. Manual lens choices persist across portions/foods; “Use suggested view” recomputes for the selected food. Carbohydrates remains disabled for Phase 9.

The actual captured gata record at 50 mL yields **8.75 g saturated fat within 11 g total fat**, with **2.25 g other fat** and a displayed **79.55%** saturated-fat share. The model retains the full-precision ratio. No illustrative mockup quantity or household serving was substituted.

## Verification actually run

**63 Node tests passed**: the previous 53 plus 10 saturated-fat cases.

```sh
npm run test:food-visualizer
```

[New tests](../../tests/food-visualizer/saturated-fat.test.mjs) cover:

- 8/10 → 80%, remainder 2 g; 0/10; 10/10; 0/0 without a ratio.
- Positive saturated fat over zero total; saturated fat greater than total, including values whose rounded displays would look equal.
- Missing partners preserving individually known amounts, null/omission/invalid/unsupported/duplicate/unverified source evidence, and partial recipe coverage on either partner.
- Source mg normalized by the shared calculator before the pair is compared.
- Tiny, near-100% and extremely large finite pairs, full-precision math and input immutability.
- Actual gata, Coke's two reported fat zeros, partial recipe data, context matching and manual/suggested lens behavior.

During test maintenance, a broad edit intended to change the enabled-lens count from two to three also changed the fractional sugar packet expectation. The failed run caught this; the original two-packet expectation was restored. No sugar calculation or guard was modified. Sodium's unavailable-lens assertion now targets Carbohydrates, since Saturated fat is implemented.

**Saturated-fat Chromium checks passed** at desktop 1280×1000 and mobile 360×800, with zero page runtime errors. Eleven mocked requests were used: one search and ten detail reads (captured gata/Coke plus eight explicitly synthetic boundary fixtures). No production API requests were made. The [browser harness](../../tests/food-visualizer/fat-browser-check.mjs) verifies:

- Actual gata default, fractional portion and independently correct grams/remainder/share.
- Keyboard switching between Sodium and Saturated fat, manual-state persistence and correct mode labels.
- 80% and 0% valid bars; no bar/share for two zeros, inconsistent pairs, missing partners or partial data.
- Known saturated-fat grams retained with missing total fat, and known total-fat grams retained with missing saturated fat.
- Invalid quantity retains the last valid result; no horizontal overflow at 360 px; no extra API calls on portion/lens edits.

```sh
JN_PLAYWRIGHT_PATH=/Users/wernancheta/projects/juanutrisyon/nuxt-juanutrisyon/node_modules/playwright/index.mjs node tests/food-visualizer/fat-browser-check.mjs
```

Use an existing Playwright installation and local preview. `JN_VISUALIZER_URL` overrides the default `http://127.0.0.1:4327/tools/food-visualizer`. No dependency installation was needed. Desktop and full-page mobile screenshots were inspected at `/private/tmp/jn-phase8-fat-desktop.png` and `/private/tmp/jn-phase8-fat-mobile.png`.

**Sugar and Sodium browser regressions passed**, with six and seven mocked requests respectively, zero page errors and no refetches on portion/lens edits. The sugar harness explicitly selects Sugar for gata now that gata's suggested view is Saturated fat; its disabled-control assertion now targets only Carbohydrates. All sugar graphics/uncertainty and sodium conversion assertions remain in place.

**Production SSG build passed with fetch disabled**, generating 21 pages including the canonical public route:

```sh
NODE_OPTIONS="--import=./tests/food-visualizer/disable-fetch.mjs" npm run build
```

The calculator artifact/manifest, raw captured fixtures, API client and backend/app source are unchanged. No dependency, server or deployment changes were required.

## Remaining limits and next phase

The FNRI report and product-label access issues, plus captured Coke's duplicate carbohydrate parents, remain unresolved. Context matching is not source verification. Full accessibility/200% zoom review, reviewed featured examples, analytics and release/discovery checks remain in their planned phases.

On the user's next instruction, Phase 9 adds the carbohydrate/reference-rice comparison using the canonical portion result and explicit reference-serving evidence. Sugar, Sodium and Saturated fat are the regression baseline.
