# Sugar visualization by food type

Date: 2026-10-29 (Asia/Manila). Implemented locally; not deployed.

## Behavior and implementation

The Sugar view uses **cola glasses** for `food.type.slug === 'prepared-and-processed'` and **4 g teaspoon equivalents** for other identified top-level food types. Missing classification keeps known sugar grams visible without guessing an illustration. The mode is automatic, with no toggle.

`sugarComparison.js` centralizes the mode, denominator, availability and unit labels. `sugarResult` uses that descriptor for both branches, retaining full precision, distinct missing/zero/tiny states, numeric overflow guards and an eight-symbol display cap. The existing shared calculator still supplies all selected-portion sugar values.

`SugarLens.vue` renders whole and fractional spoons using scoped SVG clips, or the existing cola glasses. Its captions and live announcements match the selected mode. Teaspoon mode has no dependency on cola readiness and shows no cola loading, error or retry controls. A late reference response cannot replace the current mode.

The page requests cola only when Sugar is active for a Prepared and Processed food with usable sugar. Both modes update locally during quantity edits. Total-sugar and whole-fruit copy avoids treating the visualization as added sugar.

No catalog serving weights, classifications, search eligibility, other nutrient calculations or backend code changed. In particular, the internal 4 g teaspoon definition does not overwrite a food's recorded teaspoon weight. The removed source/calculation disclosures remain removed.

## Validation

- **118 unit tests passed**, including new category selection, 4 g arithmetic, missing classification, failed-reference independence and matching announcement tests.
- **Eight browser regression suites passed**: eligibility, search/selection, portions, sugar, sodium, saturated fat, carbohydrates and disclosure.
- Sugar tests cover 1440, 768 and 390 px; fractions, zero, tiny and capped amounts; cola failures/retry/rate limiting; missing classification; and switching modes while the cola request is pending or failed. Fresh mango and pandesal sessions request no cola reference.
- **43 accessibility audits passed**, along with keyboard navigation, focus handling, long labels, reduced motion and reflow checks. Axe also checks the Sugar view at all three widths. No claim of listening to screen-reader speech is made.
- Production build and whitespace checks passed. The production assets contain no local Herd API address.
- A real, unmocked local API/browser check verified mango at **2.42 teaspoons**, doubled mango at **4.83 teaspoons**, and fried saba at **0.96 cola glasses**. Only the prepared-food selection caused the cola-reference request. No page errors occurred.

## Visual review

The design-taste component workflow kept the existing page layout, Inter type and green data color; no new direction draw or image assets were needed. Source lint and the production-rendered teaspoon-state inspector both report **0 FAIL, 0 WARN**. All six inspector screenshots and the three focused teaspoon screenshots were opened and reviewed.

Inspector artifacts: `.taste-skill/sugar-category-inspect/`. Browser screenshots, real local API captures and accessibility evidence: `/private/tmp/jn-sugar-category-browser/`.

```text
ROUND 1
Seen in one second: sugar grams followed by whole and partial teaspoon symbols.
Idea (one sentence): the food category chooses a familiar unit while sugar grams remain the same.
Live thing: quantity edits update spoon or glass counts without network requests.
Layout words by section: existing portion controls / sugar grams / repeated measuring unit / exact equivalent / reference definition / takeaway.
Scores: design 7.5 · usability 8 · creativity 7 · content 8 → overall 7.6 (component review only).
Caps applied: no component failures; the surrounding page is retained, not graded as a new marketing page.
Top three tradeoffs, with screenshot and treatment:
1. Mobile portion controls precede the result (mobile-fold.jpg); retained within this component-only scope.
2. Fractional spoon fill is visually subtle near a whole unit (390-teaspoons.png); the exact numeric count and fractional caption provide its meaning.
3. The reference definition occupies its own line (1440-teaspoons.png); retained to make the internal 4 g unit explicit alongside catalog portions.
```

The change is available to the running local development page. No deployment was performed.

## Follow-up: stale loading panel during development

The existing Chrome tab at `localhost:5175` showed a mixed hot-reload state: its live announcement correctly described the selected `Mango, piko, medium ripe` as 1.71 teaspoons, while the visible sugar panel still rendered the older cola-loading template.

The sugar panel now has a key for its visualization mode so changing units creates a fresh component. Reference initialization runs immediately and tracks the calculated portion as well as food/lens changes. The cola-loading label now appears only for the actual `loading` state; an idle reference offers a manual load action instead of implying an ongoing request.

All 118 unit tests, eight browser suites and the build pass after the fix. A real local API check on port 5175 verified the exact piko mango at 1.71 teaspoons, doubled to 3.42, with no cola request or loading text. Fried saba still loaded its reference once and showed 0.96 cola glasses.
