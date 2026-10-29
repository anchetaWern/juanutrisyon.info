# Food Visualizer — educational copy review

Prepared: 2026-10-23. **Status: PENDING. Named reviewer: unassigned.** No human educational/nutrition copy approval is recorded. Passing engineering tests does not approve these statements for release.

Review the English and Filipino/Taglish together, including zero, missing, partial-recipe and inconsistent-data states. Dynamic quantities below come from the selected portion; braces describe substitutions, not fixed example data. The source files linked below contain the exact rendered variants and remain the implementation authority.

## Sugar

- Heading: “Gaano karaming asukal?” Result: “Total sugar in the selected portion.”
- Equivalence: “{count} × 5 g packet equivalents by weight.” “A weight comparison — not a count of packets added to this food.”
- Takeaway: “Katumbas ito ng humigit-kumulang {count} pakete na tig-5 g ayon sa timbang.”
- General context: “Paghahambing ito ng timbang. Ang total sugar ay maaaring natural na nasa pagkain o idinagdag; hindi nito sinasabi kung gaano karami ang added sugar.”
- Whole-fruit context: “May natural na asukal ang buong prutas. Paghahambing lang ng timbang ang mga paketeng ito, hindi asukal na idinagdag sa prutas.”
- Reminder: “Total sugar is not the same as added sugar. This comparison does not estimate added sugar or describe a daily limit.”
- Zero: “Zero ang naiulat na total sugar sa portion na ito. Hindi ito health score.”
- Missing: “Hindi sapat ang datos para ipakita ang kabuuang sugar sa napiling portion.” A partial recipe's known subtotal cannot establish the total; no packet equivalent is shown.

Exact templates: [SugarLens.vue](../../src/features/food-visualizer/components/SugarLens.vue), context strings: [lenses.js](../../src/features/food-visualizer/lenses.js).

## Sodium

- Heading: “Gaano karaming sodium?” Result: “Sodium in the selected portion.”
- Equivalence: “≈ {grams} salt-equivalent weight.” “Approximate mass comparison: sodium (mg) × 2.5 ÷ 1000 = salt-equivalent grams.” Illustration is explicitly not to scale.
- Qualification: “Sodium is not the same as salt. This comparison does not tell us how much salt was added.”
- Takeaway: “Tinatayang katumbas ito ng {grams} asin ayon sa timbang; hindi ito ang eksaktong asin na idinagdag.”
- Context: “Ang sodium ay hindi kapareho ng asin. Ang ipinapakita ay approximate salt-equivalent weight, hindi sukat ng asin na inilagay sa pagkain.”
- Reminder: “Recipes and packaged products can have different sodium values. Use the selected food and portion when reading this comparison.”
- Zero: “Zero ang naiulat na sodium sa portion na ito. Hindi ito health score.”
- Missing: “Hindi sapat ang datos para ipakita ang kabuuang sodium sa napiling portion.” Partial recipe data cannot establish the total; no salt-equivalent weight is shown.

Exact templates: [SodiumLens.vue](../../src/features/food-visualizer/components/SodiumLens.vue).

## Saturated fat

- Heading: “Gaano karaming saturated fat?” Result includes separate saturated-fat and total-fat grams.
- Share: “{percent}% of total fat is saturated fat.” “Other fat” is the remainder by subtraction, not a named fat subtype or independent source measurement.
- Qualification: “Saturated fat is part of total fat. The graphic compares grams of fat, not butter or oil equivalents.”
- Takeaway: “Ang saturated fat ay bahagi ng total fat: {saturated grams} sa kabuuang {total grams} fat sa portion na ito.”
- Context: “Hindi lahat ng fat ay saturated fat. Ang ‘other fat’ ay ang natitirang total fat matapos ibawas ang saturated fat; hindi nito tinutukoy ang bawat ibang uri ng fat.”
- Reminder: “Tingnan ang parehong total fat at saturated fat, pati ang napiling portion. Hindi ito health score o daily-value percentage.”
- Invalid pair: “Magkaiba ang saturated fat at total fat. Hindi sapat ang pares ng datos na ito para magpakita ng porsiyento.” Distinct explanations cover missing/partial totals, both totals zero, and saturated fat exceeding total fat; none draws a part-to-whole graphic.

Exact templates: [SaturatedFatLens.vue](../../src/features/food-visualizer/components/SaturatedFatLens.vue).

## Carbohydrates

- Heading: “Hindi lang sugar ang dapat tingnan.” Result: “Total carbohydrates in the selected portion.”
- Equivalence: “≈ {count} reference rice serving(s) with a similar carbohydrate amount.” The reference is named with its JN ID, source ID, serving ID, household label, grams and dynamically calculated carbs.
- Illustration: “Each drawing represents one reference serving. Partial fills represent fractions; the drawing does not define a household bowl size.”
- Source limitation: “Household weight comes from legacy JN serving data. Independent serving/source review remains incomplete.”
- Qualification: “Carbohydrate amount only — not an equivalence in health effects or blood-glucose response.”
- Staple takeaway: “Kahit kaunti ang sugar, maaari pa ring marami ang total carbohydrate. Hindi natin kinukuwenta ang starch mula sa total carbohydrate.”
- General takeaway: “Low sugar does not always mean low carbohydrates. Total carbohydrates include more than sugar alone.”
- Context: “Magkasingdami lang ng carbohydrate ang ikinukumpara rito; hindi ibig sabihing pareho ang epekto ng mga pagkain sa katawan.”
- Reminder: “Fiber does not cancel sugar. This comparison does not measure starch or predict a blood-glucose response.”
- Missing food carbs: no equivalence. Unavailable reference: known food carbs stay visible. Zero, tiny positive, large capped illustration and numeric-range failure have distinct text.

Exact templates: [CarbohydrateLens.vue](../../src/features/food-visualizer/components/CarbohydrateLens.vue).

## Supporting copy and context assignment

The [page](../../src/pages/food-visualizer.vue) includes four short static lessons, states that missing values do not mean zero, and labels display rounding. “More nutrients” contains complete shared-core values for the same portion and explicitly says they are separate records, not values to add together. It has no daily-value percentages or added-sugar estimates.

The [source panel](../../src/features/food-visualizer/components/SourceDetails.vue) calls recipe values estimates, leaves missing contributions unknown, identifies unavailable public label links, and distinguishes provenance from certification. It explains that app handoff transfers the food identity, without transferring portion or lens.

Only exact matches on reviewed identity, source, taxonomy and preparation fields select special context: rice 78 and bread 119 → carbohydrate/staple; mango 678 → sugar/whole fruit; patis 1270 → sodium/condiment; gata 1715 → saturated fat/coconut cream. Other foods receive neutral sugar context. This is context classification only, not approval to feature those foods. Manual lens choice persists until “Use suggested view.”

## Sign-off record

- Reviewer name and role: **pending**
- Reviewed revision/date: **pending**
- English scientific meaning: **pending**
- Filipino/Taglish accuracy and clarity: **pending**
- Missing/zero/partial/inconsistent states: **pending**
- Source and serving qualifications: **pending**
- Decision and requested changes: **pending**

Re-review affected wording after any edits. Do not replace this record with an automated “pass.”

## Phase 11 accessibility wording update

Status remains **PENDING**, with no named reviewer/sign-off. The [announcement adapter](../../src/features/food-visualizer/announcements.js) now supplies persistent nonvisual result summaries in English: selected/last-valid portion, nutrient units, packet weight rather than packets added, salt-equivalent weight rather than salt added, saturated fat as a share of total fat, and carbohydrate equivalence without equivalent health effects. Missing/partial data, zero total fat, inconsistent fat and unavailable rice reference have explicit speech-accessible text. Review these variants with the visible lens explanations; automated tests verify consistency, not educational approval. Filipino/Taglish passages now have language markup; their scientific wording is unchanged.
