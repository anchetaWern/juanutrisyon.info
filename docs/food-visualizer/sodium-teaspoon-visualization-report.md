# Sodium visualization using salt teaspoons

Date: 2026-10-29 (Asia/Manila). Implemented locally; not deployed.

## Behavior and changes

All foods in the Sodium view use **5 g salt-teaspoon equivalents**, calculated from exact selected-portion sodium as `sodium mg × (0.0025 / 5)`. Existing sodium mg and salt-equivalent grams remain visible. Counts are calculated before display rounding, with no extra food scaling or reference API request.

`sodiumResult` now provides teaspoon count/text, fractional fills, a tiny-positive flag and an eight-symbol cap. Missing or incomplete data stays unavailable. Explicit zero shows zero without symbols; positive values below 0.01 teaspoon show `<0.01` without a misleading minimum fill. Very large finite values stay finite and use the existing scientific formatting.

`TeaspoonIllustration.vue` contains the shared decorative drawing and unique SVG clip IDs. Sugar now uses that drawing while retaining its **4 g sugar-teaspoon definition**, category rules and cola branch. The shared component owns no conversion constants or nutrient calculations.

The Sodium view and announcements show matching spoon counts, sodium mg, salt grams and the 5 g definition. Existing wording continues to distinguish salt-equivalent weight from salt actually added. The Sodium-specific calculation disclosure includes division by five. Previously removed source/calculation and rice-reference disclosures remain removed.

No catalog serving weights, food classifications, API behavior or dependencies changed.

## Verification

- **122 unit tests passed**, including salt teaspoon arithmetic, normalized source units, zero/missing/tiny/large values, bounded illustrations and announcements. Existing Sugar tests remain green.
- **Eight browser suites passed** across eligibility, search, portions, sugar, sodium, saturated fat, carbohydrates and disclosure.
- Sodium checks cover whole/fractional/capped spoons, unavailable and partial recipe data, quantity edits without requests, and **1440, 768 and 390 px** without horizontal overflow. Prepared and Processed and other food types both use salt teaspoons. Axe checks on the Sodium panel passed at all three widths.
- **43 full accessibility audits passed**, plus keyboard navigation, focus ownership, reduced motion, long labels and reflow checks. Graphics are decorative; no claim of listening to screen-reader speech is made.
- Production build and whitespace checks passed. Production assets contain no local Herd API address.
- Real local API/browser verification on port 5175: `Fish sauce`, 1 tbsp / 15 g, showed **759.15 mg sodium**, approximately **1.9 g salt-equivalent weight**, and **0.38 teaspoon equivalents**. Quantity two showed **0.76 teaspoons**. Search and food detail required two requests total; quantity edits and salt comparison required none. No page errors occurred.

## Visual review

The design-taste component workflow kept the existing layout, Inter typography, green data fill and teaspoon shape. No direction draw, found imagery or generated assets were needed. Source lint and the production-rendered Sodium snapshot inspector both report **0 FAIL, 0 WARN**. All six inspector screenshots and the three focused Sodium screenshots were opened and reviewed.

Inspector artifacts: `.taste-skill/salt-inspect/`. Browser screenshots, accessibility evidence and the real API screenshot: `/private/tmp/jn-salt-browser/`.

```text
ROUND 1
Seen in one second: sodium mg followed by a fractional teaspoon.
Idea (one sentence): a familiar 5 g salt teaspoon adds scale to the existing sodium-to-salt mass comparison.
Live thing: portion controls update mg, salt grams and spoon equivalents without requests.
Layout words by section: existing portion controls / sodium amount / measuring unit / equivalent / reference definition / explanation.
Scores: design 7.5 · usability 8 · creativity 7 · content 8 → overall 7.6 (component review only).
Caps applied: no component failures; the surrounding page is retained, not graded as a new marketing page.
Top three tradeoffs, with screenshot and treatment:
1. Mobile portion controls precede the result (mobile-fold.jpg); retained within this component-only scope.
2. Salt grams sit below the primary spoon count (390-sodium.png); kept visible as the existing mass comparison.
3. A small fraction uses one partially filled symbol (1440-sodium.png); exact count and fractional caption state its meaning.
```

The running local development page receives the change. No deployment was performed.
