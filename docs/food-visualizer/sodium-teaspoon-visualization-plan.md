# Sodium visualization using salt teaspoons

Date: 2026-10-29 (Asia/Manila). Status: implemented locally after the user authorized proceeding. See the [implementation report](sodium-teaspoon-visualization-report.md). The sequence below retains the implementation plan.

## Confirmed requirements

- Use salt teaspoons for **all foods** in the Sodium view, regardless of food type.
- Define **1 teaspoon equivalent = 5 g salt**, as supplied by the user.
- Continue displaying the selected portion's sodium in mg and approximate salt-equivalent weight in grams.
- Preserve the distinction between sodium, salt-equivalent weight and salt actually added to the food.
- Leave Sugar's category-based cola/4 g sugar-teaspoon behavior unchanged. Salt and sugar use separate unit definitions.

## Calculation

Use exact selected-portion sodium from the existing shared calculator. Retain the existing sodium-to-salt conversion:

```text
salt-equivalent grams = sodium mg × 2.5 / 1000
salt-teaspoon equivalents = salt-equivalent grams / 5
                         = sodium mg / 2000
```

Calculate teaspoon counts directly from the unrounded sodium value, using the combined factor/division to avoid intermediate overflow. Do not derive counts from formatted salt grams, rescale the food's nutrients a second time, or fetch a salt-food reference.

The 5 g definition is an internal visualization unit. It does not change food serving weights or claim that a measured household teaspoon of every salt product weighs exactly 5 g.

| Selected-portion sodium | Salt-equivalent grams | Teaspoon equivalents |
| ---: | ---: | ---: |
| 0 mg, explicitly reported | 0 g | 0 |
| 800 mg | 2 g | 0.4 |
| 1,000 mg | 2.5 g | 0.5 |
| 2,000 mg | 5 g | 1 |
| 4,000 mg | 10 g | 2 |

The existing captured `Fish sauce` fixture at its 1 tbsp / 15 g portion gives 759.15 mg sodium, 1.897875 g salt-equivalent weight and 0.379575 teaspoons, displayed as approximately **0.38 teaspoon equivalents**. This is a fixture-based verification example; production values remain calculated from the selected record.

## Implementation sequence

### 1. Extend sodium presentation data

Add a named salt-teaspoon definition, separate from the existing 4 g sugar-teaspoon constant. Extend `sodiumResult` in `lenses.js` to return teaspoon count, formatted count, bounded illustration fills and a capped flag while preserving its existing sodium and salt-gram values.

- Explicit zero stays a numeric zero; missing/invalid/partial sodium has no equivalent or symbols.
- Positive counts below 0.01 teaspoon display `<0.01`, with no misleading minimum spoon fill. The 0.01-teaspoon threshold corresponds to 20 mg sodium.
- Underflow must not turn positive sodium into a displayed zero equivalent.
- Cap illustrations at eight and display the actual numeric total for larger amounts.
- Preserve full precision until formatting; use existing scientific notation for very large values and reject unsupported numeric results.

This calculation is independent of food classification and all reference loaders. No new API requests are needed.

### 2. Reuse the teaspoon illustration

Extract the existing spoon drawing into a small presentational component, proposed as `TeaspoonIllustration.vue`, shared by Sugar and Sodium. It should accept fills and handle decorative SVG rendering/unique clip IDs only; it must not own conversion constants, nutrient calculations or category selection.

Keep the established layout and styling. Whole symbols represent whole teaspoon equivalents, with a fractional symbol for the remainder. Keep an exact textual count so meaning does not depend on estimating the fill. Mark the illustrations as decorative for screen readers.

Keep the sugar refactor limited to using the same drawing; its 4 g conversion, cola branch, captions and behavior must remain unchanged.

### 3. Update the Sodium view

Suggested presentation for 800 mg:

```text
800 mg sodium
[one teaspoon symbol with a fractional fill]
About 0.4 teaspoon equivalents of salt.
≈ 2 g salt-equivalent weight
1 teaspoon equivalent = 5 g salt.
```

Use singular/plural labels, a fractional-symbol explanation when relevant, and a cap note when the count exceeds eight. Keep known sodium and salt grams visible when an illustration cannot be shown.

Retain the current explanation that sodium is not salt and the comparison does not measure salt added. Update the existing Sodium-specific “How this is calculated” disclosure to include division by 5 after the current salt-gram conversion. Do not reintroduce the removed source/calculation or rice-reference sections.

### 4. Update announcements

Extend the Sodium path in `resultAnnouncement` to announce sodium mg, approximate salt-equivalent grams and the teaspoon count, including the 5 g reference definition. Maintain distinct zero, unavailable and tiny-positive wording. Do not announce the repeated decorative spoon shapes individually.

No page-level category selector, new loading state, reference request, retry control or analytics mode event is required. The analytics lens ID remains `sodium`.

### 5. Verify calculations and interaction

- Unit tests: 800 / 1,000 / 2,000 / 4,000 mg examples; source nutrient units normalized by the shared core; full-precision fractions; explicit zero; tiny positives and underflow; missing, unsupported, duplicate and partial recipe sodium; large finite amounts; capped drawings; source immutability.
- Announcement tests: matching gram/teaspoon values, singular/plural, zero and unavailable wording, and no inference of salt added.
- Browser checks: foods from Prepared and Processed and other types both show salt spoons; portion edits update all values locally; zero/missing/partial data do not gain misleading symbols; full/fractional/capped states render correctly.
- Confirm there are no salt-reference requests and that a pending/failed cola request cannot block Sodium.
- Verify keyboard focus, reduced motion, decorative graphics, long labels and no overflow at desktop/tablet/mobile widths.
- Keep Sugar regression checks for its unchanged 4 g spoon definition and category-based cola branch, particularly after extracting the shared drawing.
- Verify `Fish sauce` against the real configured local API. Run visualizer unit tests, focused sodium/sugar/accessibility browser checks and the production build.

## Completion criteria

Every eligible selected food with complete sodium data can show 5 g salt-teaspoon equivalents in the Sodium view. Sodium mg and salt-equivalent grams remain authoritative and visible, unavailable data stays unavailable, portion edits need no requests, and Sugar retains its separate 4 g definition.

Implementation is complete locally. No API or catalog changes were needed. Deployment has not been performed.
