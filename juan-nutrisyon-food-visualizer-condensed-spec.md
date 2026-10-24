# Juan Nutrisyon — Food Visualizer (Condensed Implementation Spec)

**Working name:** *Ano'ng Nasa Pagkain Ko?*  
**Goal:** Help Filipinos understand nutrients through familiar visuals and short explanations—not build another Nutrition Facts page.  
**Canonical public URL:** `https://juanutrisyon.info/tools/food-visualizer` (final path may follow current main-site routing conventions).  
**Access:** Public; no login.

## 1. Product scope

Build **one interactive tool**, with four selectable nutrient views ("lenses"):

| Lens | Main visual | Key lesson |
|---|---|---|
| **Sugar** | Equivalent number of 5 g sugar packets | Total sugar by weight is **not necessarily added sugar** |
| **Sodium** | Approximate equivalent weight of salt | Sodium is not identical to salt or the amount of salt added |
| **Saturated fat** | Saturated fat as part of total fat | Saturated fat and total fat are different |
| **Carbohydrates** | Carbs compared with a documented serving of cooked rice | Low sugar doesn't mean low carbohydrate/starch |

Also show **fiber, calories and the other available nutrients** in a compact supporting section. The selected lens gets the large visual and **one short Filipino/Taglish takeaway**. Users may switch lenses at any time.

**V1 includes:** Food search, curated Filipino suggestions, serving/quantity controls, four lenses, educational copy, source details, and links to JN Food Details / existing Comparison.

**Not V1:** Meal combination, a second comparison engine, quizzes, sharing cards, AI-generated advice, GI/GL or blood-glucose predictions, health scores, or claiming foods are condition-safe.

## 2. Where it lives & how to reuse JN

- **Host the interactive public page on `juanutrisyon.info`**, so the searchable landing page and calculator are together.
- Reuse the existing **Laravel API, food IDs, food search, nutrition data, portion conversion and calculation logic** from `app.juanutrisyon.info`. **Do not create another nutrient database or conflicting calculation engine.**
- The main site and app are separate deployments: audit their actual frameworks first, then choose the smallest integration (e.g., embeddable shared component or lightweight frontend calling the existing API). **Do not assume Vue/Vuetify already runs on the main site.** Match the main site's branding and visual conventions.
- Keep meaningful heading, introductory copy and examples in crawlable HTML. Avoid JavaScript-only SEO copy. Link to full JN food records on the app.
- Later: `/kanin-calculator` and other **genuinely distinct** SEO entry pages may preset a food/lens while using the **same shared calculator**. Do not mass-generate near-duplicates in V1.
- Respect existing Cloudflare caching and API limits; don't make unnecessary requests on every keystroke or portion change.

## 3. One-page user experience (mobile first)

1. **Search/select food.** Show quick examples such as kanin, Coke, pandesal, patis and mango. Show precise product/preparation/variant.
2. **Adjust serving.** Household measure, corresponding grams/mL where supported, and quantity +/-.
3. **Show the smart default lens.** Drink → sugar; rice/bread → carbs; condiment → sodium; coconut cream/fat-rich food → saturated fat; whole fruit → sugar with fruit-specific explanation. User can override.
4. **Hero:** Big measured value → intuitive visual → one educational sentence.
5. **Other nutrients:** Small, readable values for sugar, carbs, fiber, sodium, saturated fat, total fat and kcal (only when data exist); expandable details if crowded.
6. **Source & next step:** Expandable provenance/assumptions, link to original Food Details, and link to existing Comparison.

**Simple sketch:**

```text
Ano'ng Nasa Pagkain Ko?
[ Search a food or drink                  ]
[ Kanin ] [ Coke ] [ Pandesal ] [ Patis ]

Selected: C2 (exact variant) | 1 bottle (___ mL)
[ Sugar ] [ Sodium ] [ Saturated fat ] [ Carbs ]

  25 g TOTAL SUGAR
  [ 5 illustrated 5-g packets ]
  ≈ 5 packets by sugar weight
  "Hindi ito awtomatikong 25 g added sugar."

Sugar 25 g   Carbs 25 g   Fiber —
Sodium ...   Sat fat ...  Calories ...
[ Where did these numbers come from? ]
[ Full nutrition facts ]  [ Compare ]
```

*Numbers above are hypothetical placeholders, **not** production data.* Avoid truncating lens labels on small screens. Use existing accessibility conventions, meaningful text alongside visuals and reduced-motion support.

## 4. Calculations & scientific guardrails

| Lens | Calculation / condition | Required caution |
|---|---|---|
| Sugar | `total_sugars_g / 5` = 5-g packet equivalents | Clearly say **total sugars**, equivalent **by weight**. Don't infer added/free sugars or compare total sugar with WHO free-sugar limits. Fruit gets a natural-sugar explanation; avoid implying packets were poured into it. |
| Sodium | `sodium_mg × 2.5 / 1000` ≈ grams salt equivalent | **Approximate mass comparison**, not the literal salt added. No teaspoon-of-salt visual in V1. |
| Saturated fat | `saturated_fat_g / total_fat_g` for part-to-whole display | Only draw when both values exist and are consistent. Never calculate sat fat from total fat. |
| Carbs | `food_carbs_g / reference_rice_carbs_g` = servings of reference rice with similar carbohydrate amount | Find a **real JN cooked-rice record** and documented serving in audit; never hardcode “45 g per cup.” No implied equivalence in health or blood-glucose effect. |

**Universal rules:**
- Calculate from the actual selected portion using JN's existing scaling logic; don't assume mL = g without a documented conversion.
- **Missing/null is not zero.** Show "Data not available" instead of 0, fake estimates or a misleading picture.
- Differentiate cooked/raw, packaged/prepared, brand variants and source basis (per 100 g vs per serving).
- Retain source identifiers and disclose when values or conversions are estimated.
- Fiber does **not** cancel sugar; calories are energy, not a health score.
- Don't manufacture scientific accuracy percentages, clinical labels, added sugar estimates or medical advice.
- Audit existing **total-sugar %DV** presentation before reusing any DV display; do not treat total sugar as added sugar.
- Prefer reviewed deterministic educational copy, **not live AI explanations**.

## 5. Suggested food categories (curate from existing IDs)

- **Carbs:** white/brown/red rice, pandesal, monay, pancit, lugaw, kamote, cassava, corn, kakanin.
- **Sugary drinks/snacks:** regular Coke, C2, specific powdered juices, 3-in-1 coffee, Milo-type drinks, sweetened coffee, milk tea, banana cue, turon, taho.
- **Fruits:** mango, papaya, pineapple, watermelon, apple, and specific banana varieties (lakatan, latundan, saba).
- **Sodium:** patis, toyo, bagoong, instant noodles, canned sardines/corned beef, hotdogs.
- **Saturated fat:** coconut cream/gata, butter, cheese, and defined gata-based dishes.

**Only publish featured foods after verifying an existing food ID, usable source data, and realistic serving.** Some foods may fit several categories. Don't block release on completing the whole list. Handle drinks with actual brand/variant and prepared vs powder basis.

## 6. Implementation phases

### Phase 0 — Audit first

Inspect both deployments and document: main-site framework and routes; existing API and search; food IDs, nutrient fields/units, missing-value rules, portion conversions, caching, existing UI conventions, food details and comparison routes. Select a real rice reference. Check source consistency and existing total-sugar %DV behavior. **Produce `food-visualizer-phase-0-audit.md` and a concrete integration/file plan.** Do not assume Vue/Vuetify can simply be copied to the main domain.

### Phase 1 — Data & public page

Expose/reuse existing API data, sources, servings and scaling. Set up the public route on the **main domain** and loading/error/no-result states. Test selected-portion values against canonical Food Details results. No new nutrient records.

### Phase 2 — UI & four lenses

Build mobile-first search, portions, lens selection, one prominent result, nutrient summary, source panel and links. Add the four distinct calculations/visuals and short reviewed explanations. Handle unavailable and inconsistent data gracefully.

### Phase 3 — Release & discovery

Curate verified examples; connect homepage/nav; add crawlable explanatory content, metadata, indexability/canonical/sitemap checks; instrument basic PostHog actions (open, food select, portion change, lens switch, click-through). QA desktop/mobile/accessibility and the example foods. **Defer secondary SEO landing pages until the shared feature is working and search performance can be assessed.**

## 7. Definition of done

- [ ] Accessible on `juanutrisyon.info` without an account; usable at ~360 px width.
- [ ] Uses existing JN food data, source attribution and portion math; no duplicate database/engine.
- [ ] Shows one understandable visual + one concise lesson per lens, rather than another full Nutrition Facts page.
- [ ] 25 g total sugar → **5 × 5 g equivalents**, correctly labeled; no added-sugar inference.
- [ ] 800 mg sodium → **≈ 2 g salt-equivalent mass**.
- [ ] Saturated-fat proportion works only for valid sat-fat and total-fat pairs.
- [ ] Rice-carb equivalence uses a **verified real food/serving**.
- [ ] Null/missing values remain unavailable, never silently become zero.
- [ ] Changing portions updates values consistently with JN Food Details.
- [ ] Whole fruit, packaged drinks, cooked rice and condiments have suitable contextual explanations.
- [ ] Existing app Food Details and Comparison are unaffected.
- [ ] Source info and necessary qualifications are accessible; no unsupported clinical claims.
- [ ] SEO content appears in crawlable HTML; title, canonical and sitemap are correctly configured.

**Suggested usability check:** Ask 3–5 non-specialists to try a sweetened drink, rice and patis. Can they explain (a) what the sugar-packet picture means, (b) why low-sugar rice still has carbs, and (c) what salt-equivalent means? If not, simplify the explanation before expanding features.

## Instruction for the local AI agent

**Complete Phase 0 first.** Then implement in phases using existing components/services wherever possible. Preserve the two-domain architecture, keep the **main domain canonical for this tool**, add focused tests and summarize changed files, QA results and remaining issues after each phase. Flag any data gaps or clinically suggestive wording for review rather than inventing values or claims.
