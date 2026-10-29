# Saturated-fat Daily Value visualization

Date: 2026-10-29 (Asia/Manila). Status: implemented and verified locally. Application presentation and tests updated; API and catalog unchanged.

## Confirmed behavior and source

Replace the saturated-fat share-of-total-fat visualization with a comparison against **20 g saturated fat = 100% Daily Value**. This applies to all eligible foods in the Saturated fat view.

FDA lists 20 g as the current saturated-fat Daily Value and identifies 5% DV or less as low and 20% DV or more as high. The requested green/orange/red mapping is this tool's presentation rule, not an FDA-prescribed color scheme. Source: [FDA Daily Value reference](https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels), checked 2026-10-29.

The user confirmed that colors use **exact, unrounded percentages**:

| Exact %DV | Bar color | Suggested visible range label |
| --- | --- | --- |
| ≤5% | Green | Low |
| >5% and <20% | Orange | Mid-range |
| ≥20% | Red | High |

“Mid-range” is a descriptive interface label; FDA's cited general guide defines the low and high thresholds. This confirmation resolves the fractional gaps in the original “6 to 19%” wording.

Use the FDA reference in the context of its general 2,000-calorie labeling framework, with a short inline source link. Do not describe the reference as a personalized goal or imply users should fill the bar. See [FDA label explanation](https://www.fda.gov/food/nutrition-facts-label/how-understand-and-use-nutrition-facts-label).

This explicitly supersedes the previous no-%DV presentation for the Saturated fat view only. Sugar, Sodium, Carbohydrates, food-picker eligibility and the shared nutrition calculator retain their existing behavior.

## Calculation and examples

```text
percentDV = exact saturated-fat grams in the selected portion / 20 × 100
bar width = min(percentDV, 100)%
```

Use the shared calculator's selected-portion saturated-fat value. Do not read a stored product %DV, rescale the nutrient a second time or divide by total fat. Keep the true percentage for text and color; cap only the visual width.

| Saturated fat | %DV | Color | Bar width |
| ---: | ---: | --- | ---: |
| 0 g, explicitly reported | 0% | Green | 0% |
| 1 g | 5% | Green | 5% |
| 1.02 g | 5.1% | Orange | 5.1% |
| 1.2 g | 6% | Orange | 6% |
| 3.8 g | 19% | Orange | 19% |
| 3.98 g | 19.9% | Orange | 19.9% |
| 4 g | 20% | Red | 20% |
| 20 g | 100% | Red | 100% |
| 30 g | 150% | Red | 100% |

## Implementation sequence

### 1. Replace the presentation calculation

Add a named `saturatedFatDailyValueGrams = 20` configuration value and reference-source URL. Update `saturatedFatResult` in `lenses.js` to provide saturated-fat grams/text, actual %DV, formatted %DV, capped bar width, range/color state and an above-DV flag. Remove the old share, other-fat remainder and partner-dependent ratio fields from this view's contract after updating consumers.

- Missing/invalid/partial saturated fat cannot establish a %DV or colored bar. Keep known gram values available where the calculator permits them.
- Missing or incomplete **total fat alone** must not block complete saturated-fat %DV: total fat is no longer the denominator. Track saturated-fat coverage separately from total-fat coverage.
- Preserve the existing inconsistency guard when both complete values are known and saturated fat exceeds total fat. Retain the known grams and explain why the DV visualization is withheld; do not clamp or correct nutrient records.
- Both saturated fat and total fat reported as zero now support a valid **0% DV** result. A total-fat zero is no longer a division-by-zero condition for this view.
- Preserve core import, duplicate-path, unsupported-unit and recipe-completeness guards. Do not override any calculator state that invalidates saturated fat.
- Detect numeric overflow/non-finite percentages. Preserve usable gram text and withhold unsupported percentage output rather than showing infinity or an invalid bar width.

### 2. Keep labels and colors consistent at boundaries

Determine the band before display rounding. Use the exact value for the fill width below 100%, and readable percent text with up to two decimal places.

If ordinary rounding would contradict a threshold, use boundary-aware text: for example, an exact value just above 5% that would round to 5% can display `>5%`; one just below 20% that would round to 20% can display `<20%`. Apply the same principle near 100%, and show `<0.01%` for tiny positive values rather than 0%.

Use semantic green/orange/red style classes with contrast checked against the existing track. Keep text outside the fill; the numerical %DV and range label must convey meaning without color. The neutral track represents the 0–100% reference scale, not “other fat.”

### 3. Replace the Saturated fat UI

In `SaturatedFatLens.vue`:

- Keep saturated-fat grams prominent.
- Replace the old part-to-whole bar, “% of total fat” text and saturated/other-fat legend with the single DV bar, numeric %DV and range label.
- Show a compact reference line: `FDA Daily Value: 20 g saturated fat`, linking the source. Keep context tied to the selected portion.
- Cap the fill at 100% while displaying the actual percentage above 100%, with a short exceeded-reference note.
- Show zero and unavailable states distinctly. Missing data must never produce a green zero result.
- Keep total fat in the main nutrient summary. The lens does not need a duplicate total-fat/other-fat comparison.
- Replace copy that says the view is not a Daily Value percentage. Explain what this portion contributes to the reference, without framing it as a score for the whole food or a target to reach.
- Keep previously removed source/calculation and rice-reference disclosures removed; use the short inline FDA attribution instead.

Update the Saturated fat educational summary in `food-visualizer.vue`, which currently describes the old total-fat proportion.

### 4. Update announcements and accessibility

Update the Saturated fat path in `resultAnnouncement` to speak the selected-portion grams, actual %DV, band and 20 g reference. Remove old share-of-total-fat and zero-total-fat announcements.

The bar may remain decorative when equivalent text is present. If a bounded meter/progress role is used, its accessibility value must remain within its declared range while `aria-valuetext` conveys the true percentage above 100%. Do not announce a capped 150% result as 100%.

Keep accessible text for each color band, avoid color-only meaning, and preserve keyboard focus, reduced motion and stable live announcements during portion changes.

### 5. Verify the new contract

- Rewrite saturated-fat unit tests around the 20 g denominator, including exact 5% and 20% boundaries and values immediately on either side. Include fractional percentage formatting and classification before rounding.
- Cover explicit zero, tiny positives, 100% and above, very large inputs, missing total fat with known saturated fat, partial saturated fat, incomplete total fat with complete saturated fat, inconsistent known pairs, unsupported units, duplicate/import evidence and source immutability.
- Update announcement and fat-browser tests that currently assert other-fat grams or share percentages.
- Browser-check all three colors and threshold transitions during quantity edits, capped widths with uncapped labels, unavailable states, mobile/tablet/desktop layout and no new requests.
- Check contrast, text equivalents, keyboard navigation and existing accessibility scenarios for the new bar.
- Re-run Sugar, Sodium and Carbohydrates regressions, the visualizer unit suite and production build.
- Verify a real eligible food against the configured local API. As a fixture calculation example, the captured gata record at 50 mL has 8.75 g saturated fat and would display **43.75% DV, red**, instead of its former 79.55% share of total fat. Do not promote serving-less fixtures into the live picker for this test.

## Completion criteria

The Saturated fat view compares the selected portion against the 20 g FDA Daily Value. Exact percentages choose green/orange/red using the confirmed boundaries; labels agree with the band, fills stop at 100% without hiding higher values, and missing/partial data remains unavailable. Other nutrient views and catalog data are unchanged.

## Implementation verification

Completed on 2026-10-29:

- 123 visualizer unit tests pass, including exact and fractional thresholds, zero, missing/partial data, inconsistent pairs, extreme values and announcements.
- All eight browser regression suites pass against the production preview. The saturated-fat check additionally verifies exact 5%/20% quantity transitions, all three computed fill colors, no requests during portion edits, and uncapped 175% text with a capped bar.
- All 43 accessibility audits pass, including keyboard and reflow checks. Results are local test evidence, not a certification.
- Production build and diff whitespace check pass.
- Design inspector: 0 failures, 0 warnings at 1440, 768 and 390 px. Rendered production screenshots reviewed at all three widths; retained the existing component direction without a design draw or new assets.
- Source lint: 0 failures, one intentional outlined-box warning. The bar outline marks the reference scale, including a zero-width fill, against the surrounding white surface.
- Live local API check: eligible PhilFCT `coconut-meat-mature`, 100 g, reports 23.14 g saturated fat / 26.1 g total fat. The presentation returns 115.7% DV, High, red, with a 100% bar width.

Visual review: the component gives grams, %DV, band, scale and reference in reading order. Desktop/tablet/phone views have no clipped text or horizontal overflow. Existing page typography and surrounding panels were retained. No new imagery or sample production content was introduced; browser fixture serving labels remain test-only.

No deployment or commit is included.
