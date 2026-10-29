# Food visualizer catalog eligibility implementation

Date: 2026-10-29 (Asia/Manila). Implemented locally in the landing and API repositories; not deployed.

## Behavior

The visualizer requires a root food source of `ph_fct`, `community_recipe` or `nutrition_label` **and** at least one usable custom serving. Assigned profiles, legacy food-specific servings and inherited subtype servings all qualify. Canonical, food-specific and subtype precedence is preserved. Recorded nutrient basis, a free-text serving label and generated numeric-unit controls cannot qualify a food alone.

API filtering happens before search ranking, counts and pagination. The visualizer checks eligibility again before setting the selected food. A source/serving change produces an unavailable message without a nutrient preview. Nested recipe sources and calculation evidence are preserved.

## Changes

In `pinoy-food-api`:

- Added `app/Services/FoodVisualizerCatalog.php` for the source allowlist, qualifying serving existence queries and root-only fallback evidence serialization.
- Extended `FoodSearchQuery` and `MysqlFoodSearchService::eligibleFoods()` with the opt-in catalog policy.
- Added validated `catalog=food_visualizer` support in public food search and details. Filtered lists include `catalog` and `catalog_version: 1`. Ordinary responses retain their existing contract.
- Scoped catalog misses no longer create global `NoMatch` records.
- Added filtered-search, pagination, inherited-serving and detail-contract regression coverage.

In the landing repository:

- Added `eligibility.js`, reusing existing serving resolution and conversion guards.
- Added catalog-scoped requests and filtered-contract validation in `foodApi.js`; unfiltered/older API responses are rejected.
- Added the selection guard and specific unavailable state; updated scope and empty-state copy.
- Rejected whitespace-only serving labels during resolution, allowing fallback to a usable option.
- Updated browser mocks for the filtered contract. Existing lens/disclosure scenarios that require formerly serving-less foods now use explicitly synthetic serving evidence through `visualizer-test-food.mjs`. Original captured fixture files and nutrient amounts were not changed.

## Verification

- `npm run test:food-visualizer`: **104 tests passed**.
- API PHPUnit filter `MysqlFoodSearchServiceTest|FoodVisualizerPublicContractTest|FoodSearchProviderSelectionTest`, using the isolated `juanutrisyon_search_testing` database and in-memory SQLite contract fixtures: **22 tests, 200 assertions passed**.
- Eight browser suites passed: eligibility, base search/selection, portions, sugar, sodium, saturated fat, carbohydrates and disclosure.
- The new eligibility browser suite covers 1280px and 390px widths, inherited volume servings, quantity changes without requests, pagination, changed sources/servings, filtered empty states and rejection of an older unfiltered server. Neither viewport overflows horizontally.
- `npm run build`: passed. Diff whitespace checks passed.

Browser API traffic was mocked; these checks do not claim the deployed API supports the new contract. Browser screenshots are local temporary artifacts under `/private/tmp`.

## Read-only connected catalog audit

The connected `pinoyfood` database contained the following visible, non-deleted, non-draft records in the requested sources. Counts are a local connected-catalog snapshot, not a production certification.

| Source | Catalog foods | Eligible under the implemented query |
| --- | ---: | ---: |
| `ph_fct` | 1,539 | 727 |
| `nutrition_label` | 275 | 31 |
| `community_recipe` | 45 | 0 |
| Total | 1,859 | 758 |

The community recipes currently lack assigned, food-specific and inherited servings. They remain supported by the policy and become eligible when usable serving evidence exists. No food or serving records were modified.

Stored density records currently have no declared unit. Cross-dimension conversions therefore do not establish usable servings; grams must match a weight basis and milliliters a volume basis. Inherited subtype evidence must identify a single unambiguous legacy profile, matching the migration's existing policy; duplicate subtype profiles are not guessed. The connected audit found no duplicate subtype associations.

## Deployment dependency

Deploy the API changes first and verify `catalog` / `catalog_version` on filtered searches plus inherited serving evidence on details. Then deploy the landing change. The new client deliberately rejects the older unfiltered API contract, so deploying it first would make visualizer searches unavailable. Ordinary API consumers do not need to opt into the new policy.

No deployment or catalog mutation was performed.

## Local development connection fix

The initial implementation still called the public API, which had not received the opt-in catalog changes. Its unfiltered response lacked `catalog` / `catalog_version` and included excluded sources, causing the visualizer's response validation to fail. Mocked browser tests did not reveal this integration problem.

The page now accepts `VITE_FOOD_API_BASE_URL`. The uncommitted `.env.development.local` points local Vite development at `https://pinoy-food-api.test/api`, where the new contract is available. `.env.example` documents this override. Production builds retain the public API default; they do not load the development-only setting. Browser mocks match the food API path across either host.

A real browser check against `http://localhost:5173/tools/food-visualizer` and the Herd API successfully searched for rice (26 filtered matches), selected Rice flour and displayed its custom serving without errors. Requests went to the local API; this was not a mocked response. The public deployment still requires the API-first deployment order above.
