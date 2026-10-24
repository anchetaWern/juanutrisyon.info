# Phase 6 — common result layout and sugar lens

Date: 2026-10-23 (Asia/Manila). **Gate: PASS for Phase 6 implementation scope.** Phase 1's original-source review remains unresolved. Phase 7 has not started. Nothing deployed or promoted through site navigation/homepage/sitemap.

## Delivered

- Common [result layout](../../src/features/food-visualizer/components/LensResult.vue) with visual and takeaway columns on desktop and stacked content on mobile. The layout performs no calculation; it accepts presentation slots and portion/stale-result context. Lens colors are supplied by CSS variables.
- [Sugar lens](../../src/features/food-visualizer/components/SugarLens.vue) consumes the canonical portion result, using the existing `findNutrient`/`exactValue` boundary. [Lens model](../../src/features/food-visualizer/lenses.js) divides complete sugar grams by 5 at full precision. It never rescales nutrients or reads the API.
- Five-gram packet illustrations with true fractional fill. At most 20 packets are rendered; a visible caption gives the full total when capped. Tiny positive equivalents display `<0.01`, with text explaining that the amount is too small to illustrate. Extremely large numbers use scientific display notation. Zero is explicitly reported as zero, with no filled packets. Missing/invalid/partial data has no packet equivalent.
- Visible English/Taglish takeaway and qualifications: total sugar may be naturally occurring or added; the packet comparison is by weight, not a count of packets added. No added-sugar quantity, total-sugar %DV, daily limit, health score or clinical prediction is inferred.
- Accessible native radio controls: Sugar is available; Sodium, Saturated fat and Carbohydrates are disabled and labeled “Not available yet”. At 360 px, labels are arranged in a 2×2 grid. A manual Sugar choice persists across portions and food changes. “Use suggested view” restores automatic mode. Only the implemented sugar lens can be selected or suggested in this phase; additional category-to-lens suggestions are deferred until their respective views are implemented.
- A polite atomic text announcement describes the sugar result and packet equivalent; repeated packet graphics are decorative. No animation is introduced. Invalid quantity edits keep the last-valid-portion label visible beside the visualization.

## Context and source boundaries

The context lookup is deliberately narrow. Whole-fruit wording is enabled only for captured mango `678`, with matching slug, exact description, source type, fruit taxonomy and solid food state. The stored record identifies a ripe mango, not juice/powder/purée. This context-only review does **not** validate the nutrient source or approve a featured example. Any identity/preparation mismatch falls back to neutral copy. Other foods get neutral copy; selecting Sugar manually never classifies a new food as fruit.

For the mango context, the visible takeaway states: “May natural na asukal ang buong prutas. Paghahambing lang ng timbang ang mga paketeng ito, hindi asukal na idinagdag sa prutas.” Copy follows the provided implementation plan; no live AI explanation is used.

Coke's captured duplicate canonical carbohydrate parents still invalidate sugar. Its sugar view is unavailable rather than showing the stored 18-g value as an exact result. The captured recipe's partial sugar subtotal is also withheld. No raw fixture, source calculator or generated artifact was changed to obtain an equivalent.

## Validation actually run

**45 Node tests passed**: 35 prior regression cases plus 10 new sugar/lens cases.

```sh
npm run test:food-visualizer
```

New checks establish:

- 25 g → exactly five 5-g packet equivalents, without modifying or rescaling the canonical input.
- 2.5 g → half a packet; other fractional fills retain full precision.
- Known zero remains numeric zero; tiny positive values never display as zero.
- Large counts are bounded to 20 drawings while retaining their total.
- Null, omission, malformed/negative/nonfinite values, trace qualifiers, unsupported units, duplicate-parent guards and partial recipes produce no count.
- Captured liquid and mango portions use the already-scaled canonical result.
- Context matching rejects identity, description, source, taxonomy and preparation mismatches.
- Manual/suggested state, food changes, reset behavior and disabled views behave as specified.

**Chromium checks passed**, with zero page runtime errors and **six mocked requests** (one search plus five details): captured gata, mango, Coke and recipe, plus an explicitly synthetic zero-sugar fixture used only by the test harness. No production API requests were made. The positive liquid flow uses gata; the captured soft-drink flow verifies Coke's truthful unavailable state. The exact 25-g acceptance case is a synthetic unit-test input, not a claimed verified beverage label.

Verified desktop 1280×1000 and mobile 360×800: positive and fractional graphics, capping at 20 packets with a 48-packet total, tiny positive text/no misleading fill, zero, unavailable/partial states, disabled lens controls, Space-key manual selection, manual choice retained across portion/food edits, changing fruit context, restoring suggested mode, and no horizontal overflow. Portion/lens edits made **zero additional API requests**. Full-page mobile captures and cropped desktop lens captures were inspected:

- `/private/tmp/jn-phase6-drink-desktop.png`, `/private/tmp/jn-phase6-drink-mobile.png`
- `/private/tmp/jn-phase6-fruit-desktop.png`, `/private/tmp/jn-phase6-fruit-mobile.png`

Run against the local preview with an existing Playwright installation:

```sh
JN_PLAYWRIGHT_PATH=/Users/wernancheta/projects/juanutrisyon/nuxt-juanutrisyon/node_modules/playwright/index.mjs node tests/food-visualizer/sugar-browser-check.mjs
```

Set `JN_VISUALIZER_URL` to override the default local URL (`http://127.0.0.1:4327/tools/food-visualizer`). No dependency installation was needed. Browser startup requires the existing local execution permission.

Development checks caught the checked radio's Space key not establishing manual mode; an explicit Space handler now records that intent while retaining native radio semantics. A clipped element screenshot captured the existing sticky header across mobile content; final mobile artifacts use full-page captures from the top, which were inspected without that capture overlap.

**Production SSG build passed with fetch disabled**, generating 21 pages, including the canonical public route:

```sh
NODE_OPTIONS="--import=./tests/food-visualizer/disable-fetch.mjs" npm run build
```

Static content and the no-build-time-API contract remain intact. The common result and sugar component are only shown after selection. No API/server/app-source changes, dependency changes or generated calculator changes were required.

## Remaining work

Phase 7 adds the sodium lens and its deterministic salt-mass comparison. Saturated fat and carbohydrate views remain disabled for their planned phases. Context/source review for more food records, verified featured examples, expanded taxonomy-based suggestions, full accessibility/200% zoom auditing, analytics and release/discovery remain in their planned phases. Existing FNRI/label-access issues continue to gate source verification and release; the context wording review does not clear those gates.
