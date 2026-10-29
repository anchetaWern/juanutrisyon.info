# Food visualizer catalog eligibility plan

Date: 2026-10-29 (Asia/Manila). Status: implemented locally after the user authorized proceeding. Source and serving rules are confirmed. See the [implementation report](catalog-eligibility-report.md) for changes, verification and deployment order. The sequence below retains the implementation plan.

## Intended behavior

Restrict the food visualizer's selectable foods to the requested sources:

- PhilFCT: `ph_fct`
- Community recipe: `community_recipe`
- Nutrition label: `nutrition_label`

Exclude all other source values, including missing or unknown values. Apply this policy to the selected/root food. Preserve recipe ingredient records and their source evidence, including ingredients from other sources, so existing calculation and completeness rules continue to work.

Confirmed eligibility rule:

```text
source IN (ph_fct, community_recipe, nutrition_label)
AND at least one usable custom-serving option
```

Custom servings are required for **all three sources**. Qualifying options can come from an assigned serving profile, legacy food-specific servings, or servings inherited from the food subtype. Follow the existing resolver's precedence: usable canonical options, otherwise usable food-specific options, otherwise usable subtype options.

| Root food source | Usable profile, food-specific or subtype serving | No usable custom serving |
| --- | --- | --- |
| `ph_fct` | Include | Exclude |
| `community_recipe` | Include | Exclude |
| `nutrition_label` | Include | Exclude |
| Any other or missing source | Exclude | Exclude |

Recorded nutrient basis (`serving_size` / `serving_size_unit`), free-text `custom_serving_size`, and generated grams/milliliters controls do not establish the presence of custom servings. A profile ID alone is also insufficient: the profile must contain an option. Define a usable option as a named measure with a positive supported conversion to the food's recorded basis. Preserve existing density and edible-weight requirements.

## Findings from repository inspection

- `src/features/food-visualizer/foodApi.js` requests `/foods?description=...&page=...` without eligibility filters and maps the source field into search results.
- `selection.js` accepts any matching food detail; it currently has no source/serving eligibility guard.
- `portions.js` resolves canonical profiles, legacy food-specific servings, subtype servings, recorded servings and numeric units. Checking whether *any* resolved option exists would therefore be too permissive.
- The local API's public `FoodController::search()` does not currently pass a source or serving restriction into `FoodSearchQuery`.
- `FoodSearchQuery` supports one source or one excluded source, but no requested three-source policy or custom-serving requirement.
- `MysqlFoodSearchService::eligibleFoods()` is used by browse and every ranked search branch before totals and pagination. It is the appropriate query boundary for this restriction.
- The current backend serializes assigned serving profiles into both `serving_profile` and the legacy `custom_servings` representation; those are not independent assignments.
- Captured fixtures include profiles for rice, pandesal, mango and patis. Captured Coke, gata and chicken adobo have neither assigned profiles nor food-specific/subtype serving options, so those captured records would be excluded. These are historical fixture observations, not a current catalog inventory; a current record with usable inherited servings would qualify.

## Implementation sequence

### 1. Audit the confirmed eligibility rule

Check current catalog counts by source and serving origin using read-only queries before implementation, including subtype-inherited servings. Verify how subtype serving relationships are stored and exposed in current API details. Identify records with empty options or unsupported conversions; do not assign or fabricate servings to make them eligible.

### 2. Add opt-in filtering to the API

Implemented opt-in contract: `GET /api/foods?description=...&page=...&catalog=food_visualizer`. Filtered list responses declare `catalog: "food_visualizer"` and `catalog_version: 1`. Food detail requests use the same parameter to expose fallback serving evidence.

- Validate the catalog value and map it to the agreed policy on the server.
- Extend `FoodSearchQuery` with an optional catalog restriction and implement its constraints in `MysqlFoodSearchService::eligibleFoods()`.
- Filter before ranking totals, offsets and limits. Use an existence condition for qualifying serving options to avoid duplicate food rows.
- Encode the confirmed grouping explicitly: the three-source allowlist AND qualifying servings from a profile, food-specific data, or the food subtype, within existing visibility/privacy constraints. A subtype association alone is insufficient without a usable serving option.
- Match the agreed option-validity rules, including unit/density requirements where relevant. Test server eligibility against frontend serving resolution with shared representative cases.
- Ensure detail responses expose the same qualifying inherited serving evidence used by the filter. If current serialization omits it, add the minimum compatible field/relationship loading needed for the existing frontend resolver; avoid per-row relationship queries.
- Return a small explicit eligibility marker or summary in filtered search results so the client can verify the new contract without fetching every food's detail. Avoid loading nutrient trees or full recipe graphs for list rows.
- Preserve existing public visibility/privacy rules and ordinary catalog search behavior. Prevent visualizer-only misses from being recorded as global catalog `NoMatch` entries.

### 3. Enforce the policy in the visualizer

- Add the catalog parameter in `foodApi.js`; include policy identity in search cache keys if the adapter supports more than one policy.
- Validate the filtered-search contract. A server that ignores the new parameter must not silently expose the full catalog.
- Add a focused eligibility helper that checks the full food source and qualifying custom-serving options, reusing `resolveServings` / `resolvePortion` where appropriate.
- Check eligibility after detail identity validation and before setting `selectedFood` in `selection.js`. This also covers retries and future featured-food buttons.
- Give a specific unavailable message when a food's source or serving assignment has changed since search. Keep stale-response and cancellation protection.
- Keep recorded-basis and numeric quantity choices available for eligible foods; restricting which foods qualify does not itself require removing portion controls.
- Keep the carbohydrate rice reference's existing source, identity and serving checks.

### 4. Explain the catalog scope

Update the search help and empty-state text to explain that PhilFCT, community recipes and nutrition-label foods are available only when they have usable custom servings. Inherited subtype servings qualify. Keep this limited to the existing interface; no layout redesign is needed.

### 5. Verify and release in dependency order

- Backend: each allowed source with and without custom servings; absent/empty/invalid/valid profiles; food-specific and subtype-only eligibility; invalid higher-priority options falling back to usable subtype options; count and volume cases; privacy; duplicate prevention; accurate totals and multi-page ranking; unchanged ordinary searches; scoped no-match handling.
- Frontend: filtered request and response contract; allowed/disallowed details; usable subtype-only foods selectable with inherited options; source/serving/subtype assignment changed after search; retries; cache separation; cancellation; preservation of nested recipe evidence.
- Browser: eligible search and selection, pagination, filtered empty results, changed-record message, keyboard focus and mobile copy.
- Update browser mock responses to reflect the new filtered-list contract. Keep historical captured fixtures intact; add separately identified new captures or synthetic cases as needed.
- Run the food visualizer unit suite, relevant API search regressions, focused browser checks and the landing build.
- Deploy the compatible API change first, verify its opt-in contract, then deploy the visualizer client. Deployment has not been performed.

## Completion criteria

Only foods satisfying the agreed source/serving rule appear in visualizer search and become selected foods. Counts and pagination describe that restricted catalog. A changed or stale record cannot bypass eligibility. Ordinary food search, recipe calculations and nutrient missing-data behavior retain their existing contracts.
