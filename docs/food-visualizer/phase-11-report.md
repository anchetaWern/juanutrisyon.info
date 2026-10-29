# Phase 11 — responsive and accessibility integration

Date: 2026-10-23 (Asia/Manila). **Gate: PASS for Phase 11 engineering scope.** All four flows passed the documented local review; no critical defect remains known in that tested scope. Source/household-serving review, named educational-copy sign-off and the existing app handoff limitation from Phase 10 remain separate release gates. No deployment, API, app-source, nutrient-contract or analytics change was made.

## Changes and their purpose

- The visualizer's navigation stays in document flow so the shared header cannot cover controls or focused content. A first-tab “Skip to food search” link bypasses navigation. Both behaviors are scoped to this route in [App.vue](../../src/App.vue) and [TopNav.vue](../../src/components/TopNav.vue).
- Search submission, pagination and retry focus the named results region; food selection and detail retry focus the preview. “Change food” returns focus to the search input. Request ordering and focus ownership checks prevent late completions from taking focus after the user moves on or edits the query.
- “Use suggested view” retains keyboard focus after reset. It uses `aria-disabled` with an action guard when already suggested, avoiding the observed focus drop caused by disabling the focused native button.
- A persistent, atomic polite result announcement survives lens-component changes. The [announcement adapter](../../src/features/food-visualizer/announcements.js) reuses existing lens presentation results and includes portion, units, unavailable states and equivalence qualifications. It does not calculate nutrients. The four transient duplicate announcement nodes were removed.
- Search/loading messages no longer sit inside busy regions that could suppress their announcements. Error alerts contain the error message; changing retry-countdown button labels are outside the alert. Decimal validation still announces an error while preserving the last valid portion/result.
- The visualizer's palette now provides stronger text and focus contrast, including the shared header and supporting copy on tinted cards. Inline methodology/project links are underlined. Page controls have clearer borders and focus indicators. Route-specific CSS variables avoid changing other pages' palette.
- Grid tracks shrink safely, long food/preparation text wraps, lens controls adapt to available width, and expanded source/nutrient grids remain inside narrow viewports. Native serving options retain their full accessible labels.
- The HTML fallback declares English; Filipino/Taglish headings and explanations declare `lang="fil"`. The rice-reference heading follows the result heading correctly, and the embedded takeaway no longer creates a nested complementary landmark. Named suggestion groups use an explicit group role.
- Reduced-motion preference disables transitions/animations within this route. Visuals retain equivalent numeric text and qualifications; decorative drawings remain hidden from the accessibility tree.

Implementation: [food-visualizer.vue](../../src/pages/food-visualizer.vue), [lens components](../../src/features/food-visualizer/components/LensResult.vue), [source details](../../src/features/food-visualizer/components/SourceDetails.vue), and [HTML fallback](../../index.html). The shared calculation artifact and food fixtures are unchanged.

## Review evidence

The reproducible [browser review](../../tests/food-visualizer/accessibility-browser-check.mjs) saved [43 axe audit results and interaction evidence](phase-11-accessibility-evidence.json). Chromium 156.0.8078.4 / axe-core 4.10.3 reported **zero violations** with WCAG A/AA, WCAG 2.1 AA and best-practice rule tags enabled.

| Environment | Reviewed states and behavior | Result |
| --- | --- | --- |
| 360 × 900 | Initial/search; all four lenses; fractions/invalid quantities; missing nutrients; partial recipe; expanded disclosures; long food/serving labels; empty/503/429 search | Pass; no horizontal overflow or clipped lens labels |
| 390 × 900 | Same state matrix | Pass |
| 1280 × 900 | Same state matrix | Pass |
| 390 × 844, reduced motion | Keyboard path, focus ownership, delayed search/detail loading, retry and missing detail, manual/suggested lenses, disclosures and ARIA tree | Pass |
| 640 × 450 at 2× raster scale | 200% layout equivalent for a 1280-pixel desktop; long labels, all lenses and expanded details | Pass; no horizontal overflow |
| 320 × 800 | Narrow reflow, long labels, all lenses and expanded details | Pass; no horizontal overflow |

The keyboard path uses Tab/Enter to skip/search/select, native serving type-ahead, decimal entry and validation, Space on steppers and lens controls, radio arrow navigation, suggested reset, and native disclosure toggles. It verifies focus after selection/retry/reset, checks that Tab continues after reset, and verifies that delayed requests do not steal focus. Manual lens choice persists across food changes; suggested mode restores the reviewed context. Quantity and repeated lens changes do not create extra API requests after reference initialization.

The inspected accessibility-tree snapshot at `/private/tmp/jn-phase11/keyboard-aria.yml` exposes named search/preview regions, serving/quantity fields, checked radios, complete nutrient text and a qualified result status. Drawings do not replace that text. English result announcements preserve known zero, missing/partial data, inconsistent fat and unavailable reference distinctions; three new unit cases cover those branches.

### Contrast items requiring explicit review

The initial Lighthouse accessibility score was 91; the [final initial-page audit](phase-11-lighthouse-evidence.json) is **100**, using Lighthouse 12.8.2 / Chrome 155. This score applies to the initial page; the separate axe matrix covers selected-food states.

Axe's remaining `color-contrast` manual-review flags are not counted as automatic passes. Twenty distinct flagged text/symbol targets were reviewed explicitly and recorded in the evidence:

- Gradient text: the shell's `#eef8df` color at a maximum 55% opacity over white has a conservative darkest bound of `#f5fbed`. Actual computed foreground colors are checked against that bound. Minimum recorded ratio: **5.73:1**.
- Stepper symbols: axe cannot classify the standalone Unicode minus as ordinary text. The explicitly named increase/decrease buttons use their actual solid foreground/background for the check. Their accessible labels identify the action independently of the symbol.
- Any other manual-review reason makes the test fail. The unsupported generic suggestion label and ambiguous inline-link styling were corrected rather than dismissed.

Additional palette calculations give white on the header CTA **5.28:1** and control borders on white **4.02:1**. The review follows W3C's [text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html); inline links also use underlines so color is not their only cue, consistent with [Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html).

### Visual inspection and limits

Screenshots are saved under `/private/tmp/jn-phase11`: initial, four result cards and search error at 360/390/1280 widths; expanded reflow at 640/320; and cropped reflow details for inspection. Mobile sugar/sodium/fat/carbohydrate cards, desktop fat, and 640/320 reflow details were inspected. Text wraps, visible equivalents and cautions remain readable, and navigation no longer crosses the result cards. The long-label food is an explicitly synthetic stress fixture intercepted by the test, never a featured or published food.

This was a Chromium keyboard, rendering, ARIA-tree and live-region DOM review. VoiceOver/NVDA speech was not listened to, and no complete WCAG conformance certification is claimed. The 200% check uses an equivalent CSS layout viewport and 2× raster scale, rather than manually operating a browser zoom toolbar. The separate 320-CSS-pixel test follows the viewport approach described in W3C's [Reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). No Safari/physical-device result is claimed.

## Checks actually run

- **82 Node tests pass**: 79 existing cases plus three announcement cases. Shared-core integrity, portion precision, missing-value guards and all four lens contracts remain covered.
- **Seven fixture evidence checks pass**, with original capture hashes preserved.
- **43 accessibility audits and six interaction/reflow groups pass**, zero page runtime errors; remaining gradient/symbol contrast flags have the explicit review above.
- **Five existing browser regressions pass**: sugar (five foods), sodium (six foods), saturated fat (ten foods), carbohydrates (four reference scenarios), and disclosure. Each reports zero runtime errors and no extra portion/lens requests as applicable.
- **Offline static build passes: 21 pages**, with `fetch` disabled.
- `git diff --check` passes for tracked changes. No production dependency was added; axe-core was installed only in a temporary test-tools directory.

```sh
npm run test:food-visualizer
python3 scripts/check-food-visualizer-fixtures.py
NODE_OPTIONS="--import=./tests/food-visualizer/disable-fetch.mjs" npm run build
npm install --prefix /private/tmp/jn-phase11-a11y --no-save --package-lock=false axe-core@4.10.3
node tests/food-visualizer/accessibility-browser-check.mjs
```

Use Node 22. The browser script defaults to the existing sibling app's Playwright installation and the local preview at `http://127.0.0.1:4327/tools/food-visualizer`; `JN_PLAYWRIGHT_PATH`, `JN_AXE_PATH` and `JN_VISUALIZER_URL` override those paths. All feature API responses in this phase's browser flows were intercepted fixtures or explicitly synthetic error/stress cases. No fresh production food API verification is claimed by these tests.

## Release gates carried forward

Phase 11's local engineering gate passes. Phase 10's complete source/serving review, named educational-copy review and existing app comparison-mode limitation remain unresolved as previously documented. The [copy review packet](phase-10-copy-review.md) now also points to the nonvisual announcements. No candidate was promoted, no analytics was added, and Phase 12 has not started.
