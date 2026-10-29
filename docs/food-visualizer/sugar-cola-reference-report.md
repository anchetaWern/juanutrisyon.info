# Sugar comparison using cola glasses

Date: 2026-10-29 (Asia/Manila). Implemented locally; not deployed.

Follow-up: the [category-based sugar visualization](sugar-category-visualization-report.md) now limits cola glasses to Prepared and Processed foods. Other identified types use 4 g teaspoon equivalents. The cola reference implementation below remains in use for its selected category.

## Behavior

The sugar lens replaces the 5 g packets with unbranded cola glasses. One reference glass is **260 g** of PhilFCT food **1346**, `Softdrink, cola`, source code `Q053`. Its sugar amount is calculated from the loaded record using the shared nutrition core, not stored as a production nutrient constant. The observed record gives **24.44 g total sugar per glass**.

The serving definition is internal tool configuration. No food/serving database records changed, and the cola record remains subject to the existing custom-serving requirement in the food picker. Direct reference loading does not make it selectable.

Full and fractional glasses follow the exact comparison count. Illustrations are capped at eight while the numeric label retains the true total. Tiny positives, explicit zero, missing/partial food sugar, invalid references and reference request failures remain distinct. Known sugar grams remain visible when the comparison is unavailable.

## Implementation

- `colaReference.js` validates reference identity and weight basis, calculates sugar for 260 g, and handles lazy loading, caching/deduplication through `foodApi`, manual retry, rate-limit metadata, selected-reference reuse and stale/disposed requests.
- `lenses.js` calculates glass equivalents with bounded illustration counts and numeric guards. Sugar context copy now refers to cola; fruit copy preserves the distinction between naturally occurring and added sugar.
- `SugarLens.vue` draws straight-sided glasses with proportional fills and a short inline `Reference glass: 260 g of cola` note. Graphics are decorative to screen readers; the textual equivalent provides their meaning.
- Page state keeps rice and cola references separate, loads cola only when the sugar lens has usable food sugar, and disposes both loaders on unmount. Announcements use the matching reference state.
- The removed comparison button, source/calculation disclosure and rice-reference disclosure remain removed.
- Added an allowlisted cola fixture with a separate local capture manifest. Original historical capture files remain intact. Browser mocks handle the reference request explicitly and count it.

## Verification

- Visualizer unit suite: **113 tests passed**, including eight cola reference tests and sugar/announcement regressions.
- Existing fixture evidence checks: **seven passed**, including the no-secrets/data-boundary scan. The new cola fixture's hash is separately checked by its reference test.
- Eight browser suites passed across eligibility, base search/selection, portions, sugar, sodium, saturated fat, carbohydrates and disclosure. The fat suite retains its existing 11-request expectation because it never needs a sugar comparison.
- Sugar browser coverage: **1440, 768 and 390 px**, full/half/zero/tiny/capped glasses, request failure/manual retry, rate limiting and changed/zero reference data. One cola-reference request per normal page session; quantity edits do not fetch.
- Accessibility suite: **43 audits passed**, plus keyboard navigation, focus handling, reduced motion, long labels and reflow checks. Axe also checked the new sugar lens at all three widths. This is browser/DOM verification, not a claim of listening to screen-reader speech.
- Production build passed. Its assets contain neither the local Herd API address nor the old packet comparison label.
- Real local API check: searched for `Mango, Manila super, ripe`, selected it, loaded `softdrink-cola`, and changed quantity to two. The result displayed **0.79 glasses of cola**, with three API requests total and no page errors. The earlier broad mango search was unsuitable for this positive-sugar smoke check because not every matching record has complete sugar data; unavailable data correctly withheld the comparison.

## Visual review

The design-taste component workflow followed the surrounding layout and type; no direction draw or redesign was needed. The idea is that the familiar 260 g glass becomes a repeatable unit of total sugar, with portion controls updating its count and fill. Cola brown is confined to the data illustration. No logo, photographs or generated assets were introduced.

Source lint: **0 FAIL, 0 WARN**. The inspector checked a static snapshot of the actual production-rendered selected-food state at 1440, 768 and 390 px: **0 FAIL, 0 WARN**. The snapshot retains built styles and removes application scripts so the selected state survives inspection. Its fixtures are explicitly synthetic food boundary cases with the captured cola reference.

All six inspector screenshots and three focused sugar-lens screenshots were opened and reviewed. The inspector artifacts are under `.taste-skill/cola-inspect/`; browser captures/evidence are in `/private/tmp/jn-cola-browser/`.

```text
ROUND 1
Seen in one second: the sugar amount, followed by a partially filled cola glass.
Idea (one sentence): a 260 g cola glass makes the food's total-sugar amount comparable to a familiar drink serving.
Live thing: portion quantity changes update the grams, glass count and fractional fill.
Layout words by section: existing picker/preview workspace / sugar amount / glass pictogram / equivalent / inline reference / takeaway.
Scores: design 7.5 · usability 8 · creativity 7 · content 8 → overall 7.6 (component review only).
Caps applied: no component failures; the surrounding page was not redesigned or graded as a new marketing page.
Top three problems/tradeoffs (most visible first), each with the screenshot and treatment:
1. The mobile portion panel places the nutrient result below the first fold (mobile-fold.jpg); retain the established control order within this component-only change.
2. The fractional equivalent wraps across two lines on mobile (390-cola-lens.png); preserve readable type and natural wrapping rather than shrinking it.
3. One small glass leaves whitespace beside a low count on desktop (1440-cola-lens.png); retain a constant unit size so changing the portion adds comparable glasses instead of enlarging the reference.
```

There are no new deployment prerequisites beyond the previously documented catalog API support. Production continues to use its configured/public API; local development continues to use the updated Herd API. No deployment was performed.
