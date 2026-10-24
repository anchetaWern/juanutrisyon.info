# Phase 2 report — public API contract verification

Date: 2026-10-23 (Asia/Manila). **Gate: PASS for the Phase 2 contract-verification scope.** The user explicitly requested Phase 2 after the Phase 1 source-review failure was reported. This permits independent API contract checks; it does not clear Phase 1's source/label-review gate. Phase 3 has not started.

Recommended execution: GPT-6.1 Sol / High. The session's exact executing model/effort was not independently confirmed; no model-switch claim is made.

## Result

The existing public detail endpoint already provides the source and serving evidence the visualizer needs. No endpoint, serializer, CORS setting, migration, nutrient calculation or production configuration needed changing for this phase.

Added five backend feature tests in [FoodVisualizerPublicContractTest.php](/Users/wernancheta/projects/juanutrisyon/pinoy-food-api/tests/Feature/FoodVisualizerPublicContractTest.php), using an isolated SQLite `:memory:` database and synthetic catalog records. They exercise the actual public route with route bindings and anonymous-request middleware active. They do not call production or use production catalog data.

The tests establish:

1. Root Philippine provenance is allowlisted, unknown source edition remains null, and raw import fields stay hidden. Canonical option 206 and legacy unit 168 remain distinct. The selected default is deliberately the second sorted option, preventing a first-row assumption. Legacy serving keys stay compatible.
2. A 240-mL source basis remains volume-based, with null calories/profile/density. Explicit sodium zero, null total fat and an omitted sugar node remain distinct; no conversion or household serving is invented.
3. A recipe preserves source evidence in nested food and the `recipe.ingredients` alias, while excluding a private ingredient row, its cached name and raw-data sentinel. The private food's public detail route returns 404.
4. Corrected USDA `usda-v1` import evidence and its explicit zero survive public serialization without exposing raw data.
5. An unnormalized legacy USDA zero does not acquire corrected-import evidence. The frontend must continue enforcing its existing import guards; no frontend parity is claimed here.

## Input and version evidence

- Observed deployed inputs: unchanged [Phase 1 manifest](../../tests/food-visualizer/fixtures/manifest.json) and [contract](public-data-contract.md). These retain their capture dates and hashes; no new production behavior is claimed from local tests.
- Backend source HEAD: `ad1adae38c1ef73ee49a4e1676773234e7fec150`. The new test is an uncommitted addition, not part of that commit.
- New test SHA-256: `a1683880646bfff66b1466ce8657cd7c8a6b0c7e0ffd9fb5a1bfbae577f3a59d`.
- Inspected implementation: `FoodController::show()`, `RecipeIngredientGraph::expand()`, `NutrientSourceMetadata`, `Food::toArray()`, serving profiles/options and Eloquent private-food scopes.
- Existing unrelated backend `.DS_Store` files were left untouched. The backend diff contains only the new feature test; no tracked application source changes.

The captured production and local code contracts agree on the relevant metadata/default-serving fields. A matching source deployment SHA was not established. No server deployment is required for this test-only change.

## Validation actually run

Runtime: PHP 8.4.19; PHPUnit 10.5.58. Commands run from `~/projects/juanutrisyon/pinoy-food-api` using `/Users/wernancheta/Library/Application Support/Herd/bin/php84`:

```sh
vendor/bin/phpunit --do-not-cache-result tests/Feature/FoodVisualizerPublicContractTest.php
```

**PASS — 5 tests, 44 assertions.**

```sh
vendor/bin/phpunit --do-not-cache-result --filter 'FoodVisualizerPublicContractTest|NutrientSourceMetadataTest|ServingProfileArchitectureTest|UsdaFoodNormalizerTest'
```

**PASS — 21 tests, 150 assertions.** Covers the new endpoint contract plus existing source allowlisting, serving architecture and USDA normalization regressions.

From the landing repo:

```sh
python3 scripts/check-food-visualizer-fixtures.py
```

**PASS — 7 offline evidence checks.** Original fixtures and hashes remain unchanged.

### Baseline failures and test-harness correction

Before adding the new test, the baseline filter `FoodAgentResourceTest|NutrientSourceMetadataTest|ServingProfileArchitectureTest` ran 15 tests with 4 failures, all in the older `FoodAgentResourceTest`: both agent-response cases and both default-public-response cases. The metadata/serving tests passed. That older harness disables all middleware, including implicit route binding, and lacks some current schema; those failures were not introduced by this change. The full backend suite is not claimed green.

The first new-test run also failed four assertions because its initial harness copied that all-middleware-disabled pattern. Correcting the harness to keep bindings/middleware active made all five tests pass without changing application behavior or loosening expected contracts. The first failure and correction are retained here as verification history.

## CORS and deferred issues

No CORS changes: the plan supports manual retry when `Retry-After` is unreadable, and Phase 1 did not observe a production 429. Exposing additional headers is optional, not needed to satisfy this contract. Existing CORS/HTTP captures remain evidence of deployed behavior; these new tests do not certify browser execution or deployed rate-limit handling.

Still unresolved, outside this phase's passing scope:

- FNRI original rice report returned 503 in Phase 1; independent nutrient-source review remains incomplete.
- Sampled product-label image URLs point to localhost; label review and public URL/configuration correction remain pending.
- A production missing-food response exposed debug details. Backend hardening remains a separate finding; the visualizer must render generic errors.
- Four older food-resource tests fail at baseline. No full-suite, app UI, browser, numerical artifact-parity or release-readiness claim is made.

## Next allowed phase

On the user's next phase instruction, Phase 3 can export and verify the existing calculator using the captured, explicitly source-review-pending fixtures. Source-label review continues to gate featured-example promotion and release; it is not silently waived. Stop after this Phase 2 report for the current request.
