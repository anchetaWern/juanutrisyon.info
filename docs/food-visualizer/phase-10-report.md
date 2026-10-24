# Phase 10 — provenance, example review and app handoff

Date: 2026-10-23 (Asia/Manila). **Engineering delivered; overall gate: PARTIAL.** Complete source/household-serving review and human educational-copy sign-off remain pending. The existing app has a verified comparison-mode edge case with manual recovery. No deployment, API change, app-source change or Phase 11 work was performed.

## Delivered behavior

The [source panel](../../src/features/food-visualizer/components/SourceDetails.vue) provides expandable, allowlisted provenance: JN/source IDs, supplied dates/edition, recorded nutrient basis, edible-basis evidence or its absence, selected portion and quantity, canonical/profile/legacy serving IDs, household label, serving provenance, conversion explanation and calculation-core version/source revision. It also identifies the loaded rice reference and its calculated carbohydrate amount.

Recipe disclosures identify estimates, supplied yield/prepared weight and ingredient count; missing contributions remain unknown. Unavailable recipe structure is stated explicitly. Essential lens cautions, selected/last-valid portion labels and missing-data qualifications remain visible outside this disclosure.

The [disclosure adapter](../../src/features/food-visualizer/disclosure.js) exposes selected fields rather than serializing the raw payload. Public HTTPS report, label and recipe links open with `noopener noreferrer`; local/relative/credentialed/non-HTTPS links are withheld. The localhost product-label URLs are neither published nor silently rewritten. Missing dates/editions are omitted. The review evidence's report edition is not inserted into API metadata or runtime food records.

“More nutrients” shows other complete shared-core results for the same committed portion, including known zeros. Partial recipe contributions do not become exact totals. The seven headline fields stay separate; there are no DV percentages, added-sugar estimates, nutrient summations or changes to the shared calculator.

Context assignment remains deterministic and conservative: exact identity/source/taxonomy/preparation matches for rice/bread, mango, patis and gata select the existing context and suggested lens. Other records get neutral sugar context. Manual lens choice persists until explicitly reset. Context classification does not certify a featured example.

## Source and example review

The [source-review evidence](phase-10-source-review.json) compares the seven summary fields in four captured records and four fresh anonymous API responses with primary FNRI report text:

| Food | JN / FNRI ID | Primary report | JN household option | Result |
| --- | --- | --- | --- | --- |
| Rice, well-milled, boiled | 78 / A020 | [2982](https://i.fnri.dost.gov.ph/fct/library/report/2982) | 206 · ½ cup · 80 g | Text fields match; full review incomplete |
| Bread, pan de sal | 119 / A042 | [3004](https://i.fnri.dost.gov.ph/fct/library/report/3004) | 213 · 1 piece · 23.33 g | Text fields match; full review incomplete |
| Mango, Manila super, ripe | 678 / E051 | [3633](https://i.fnri.dost.gov.ph/fct/library/report/3633) | 159 · ½ cup · 70 g | Text fields match; household edible basis unresolved |
| Fish sauce | 1270 / N011 | [4334](https://i.fnri.dost.gov.ph/fct/library/report/4334) | 953 · 1 tbsp · **15 g** | Text fields match; full review incomplete |

All **28 field comparisons** agree at the source's 100-g basis in the captured and current API records. This includes the unavailable patis sugar field: the report uses a dash and the API omits it; neither is treated as zero. Fresh API reads returned HTTP 200.

The primary PDF text was available through web retrieval of official report URLs. Direct downloads returned HTTP 503 HTML rather than usable PDFs; visual PDF inspection was not completed. These are text-level checks, not a claim that fresh original PDF files were downloaded or visually reviewed. The supplied JN serving IDs/weights/provenance were checked against the fresh API data; they have not been independently validated as household weights. In particular, the official mango basis is edible portion (67% edible yield), while the JN household option does not declare edible versus as-purchased basis. No conversion was guessed.

Consequently the [featured-food configuration](../../src/features/food-visualizer/featuredFoods.js) remains empty and its UI stays hidden. Existing “Search ideas” buttons are catalog queries, not verified-food endorsements or direct candidate shortcuts. Coke remains unfeatured because of its unusable label URL and duplicate canonical carbohydrate parents; gata's original label is also unavailable. The incomplete community recipe is an estimate, not a verified example. Historical Phase 1 captures and hashes were preserved.

This advances Phase 1 source evidence without falsely clearing its complete review gate. The rice comparison remains explicitly qualified as using legacy JN household-serving evidence.

## App routes and existing-session finding

The handoff uses the exact encoded food slug:

- Standard Food Details: `https://app.juanutrisyon.info/food/<slug>`.
- USDA archive Food Details: `https://app.juanutrisyon.info/food/archive/<slug>`.
- Existing comparison entry: `https://app.juanutrisyon.info/search?food1=<encoded-slug>`.

No portion, quantity, lens, comparison calculations or cross-origin storage transfer is added. The new-tab copy tells users to review the app's selected foods and explains how to reveal comparison controls.

[Live browser evidence](phase-10-app-handoff-evidence.json), captured with isolated contexts:

| Scenario | Observed result |
| --- | --- |
| Fresh session seeded with rice | HTTP 200; rice selected; comparison enabled |
| Existing mango selection, comparison off, seed rice | HTTP 200; rice prepended, mango retained; comparison enabled |
| Rice already selected, comparison off, seed rice | HTTP 200; rice retained; **comparison stays off** |
| Manual recovery for that edge case | Existing “Compare foods” button enables comparison and retains rice |
| Rice standard Food Details | HTTP 200; correct food heading and route |
| Iodized salt USDA archive Food Details | HTTP 200; correct food heading and archive route |

Read-only app-source inspection agrees: `src/pages/search.vue`'s `hydrateComparisonState()` enables comparison only when inserting a new seed. The landing page cannot determine the other origin's stored mode. Its copy includes the verified manual recovery rather than promising an unconditional mode change. This is a documented existing app limitation; fixing the app itself remains separate work. These checks did not touch the user's browser sessions or server records.

## Copy review

The concrete [educational review packet](phase-10-copy-review.md) covers English/Filipino wording, every lens's main qualifications, missing/zero/partial/inconsistent states, contexts and source assumptions. **Reviewer: unassigned; sign-off: pending.** A request for the reviewer's identity has been sent to the user. No automated scientific, editorial or human approval is claimed.

## Validation actually run

- **79 Node tests passed**, including six new disclosure cases: route/slug encoding, public URL handling, provenance/privacy/serving fields, unavailable labels and recipe qualifications, complete additional nutrients with correct portion scaling and zeros, and no pending candidate promotion.
- **Seven fixture evidence checks passed**, retaining original capture hashes and privacy/missing-data distinctions.
- **Offline static build passed: 21 pages**, with `fetch` disabled. No live API is required for static generation.
- **Disclosure Chromium check passed**, using intercepted captured responses: four API requests, zero page runtime errors, no additional requests on portion/lens edits, last-valid-result retention, exact outbound links, withheld localhost labels, food-switch provenance updates, recipe estimates and complete additional nutrients. Desktop 1280×1000/mobile 360×800; no horizontal overflow. Source-panel and additional-nutrient screenshots were inspected under `/private/tmp/jn-phase10-*.png`; mobile full-element captures include the existing sticky navigation. Integrated layout/focus/accessibility review remains Phase 11.
- **Live app Chromium check passed its route/identity checks**, with the same-seed/mode-off limitation explicitly recorded and manual recovery verified. Both Food Details paths and fresh/existing comparison sessions were checked.
- **28 primary-text field comparisons passed** against captured and current API summaries at 100 g. These do not establish independent serving validity or visual source review.

Reproduction uses Node 22 and the existing Playwright installation; no package installation was needed:

```sh
npm run test:food-visualizer
python3 scripts/check-food-visualizer-fixtures.py
NODE_OPTIONS="--import=./tests/food-visualizer/disable-fetch.mjs" npm run build
JN_PLAYWRIGHT_PATH=/Users/wernancheta/projects/juanutrisyon/nuxt-juanutrisyon/node_modules/playwright/index.mjs node tests/food-visualizer/disclosure-browser-check.mjs
JN_PLAYWRIGHT_PATH=/Users/wernancheta/projects/juanutrisyon/nuxt-juanutrisyon/node_modules/playwright/index.mjs node tests/food-visualizer/app-handoff-browser-check.mjs
```

The local browser check defaults to `http://127.0.0.1:4327/tools/food-visualizer`; `JN_VISUALIZER_URL` can override it. The app check deliberately uses the public app and isolated test storage. Current API raw downloads and failed report bodies remain outside the repository in `/private/tmp/jn-phase10`.

## Remaining gates

1. Complete original-source and independent household-serving review before promoting candidates. Obtain usable original product-label links; resolve mango serving basis and Coke's duplicate nutrient ancestry before treating those cases as verified examples.
2. Assign a named reviewer and record actual educational-copy review/sign-off.
3. Resolve or explicitly accept the existing app handoff mode limitation before unconditional comparison handoff can be promised.

Phase 11 can address the authorized responsive/accessibility integration when requested. None of these pending review items is silently cleared by the engineering checks.
