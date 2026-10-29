# Food Visualizer — observed public data contract

Captured 2026-10-23 (Asia/Manila). This is Phase 1 evidence, superseding assumptions in the Phase 0 audit. See [capture manifest](../../tests/food-visualizer/fixtures/manifest.json) for exact URLs, UTC dates, statuses, headers and sanitized hashes; [fixture notes](../../tests/food-visualizer/fixtures/README.md) describe the allowlisted projection.

## Verified entry points

The local app environment, its `nuxt.config.ts`, and the **deployed** public app HTML agree on `https://api.juanutrisyon.info/api`. Only the API-base value is retained from the deployed configuration; no analytics tokens/configuration were copied into fixtures.

Successful API reads used no login, cookies or API key and sent `Origin: https://juanutrisyon.info`. Responses returned `Access-Control-Allow-Origin: *`. The OPTIONS request returned 204 with allowed method GET. This establishes observed HTTP/CORS compatibility for anonymous, credential-free reads; a browser end-to-end fetch has not yet been exercised.

| Operation | Observed contract |
| --- | --- |
| `GET /foods?description=rice&page=1` | 200; object with `current_page`, `data`, `per_page`, `total`, `last_page`; 20 entries, 528 total, ordered as delivered. No nutrient array in sampled list entries. |
| `GET /foods?description=kanin&page=1` | 200; same envelope, empty data and total 0. Do not manufacture matches or claim the deployed search already resolves this Filipino synonym. Verified Kanin suggestion chips can point directly to rice ID/slug. |
| `GET /foods/<slug>` | 200 for the seven representative foods/recipe; root food object, not `{data: food}`. Contains nested nutrients, source basis, serving-profile/legacy representations and recipe relationships. |
| Missing food | 404 JSON. Actual response also contained exception/file/trace fields. These were removed from the fixture; the client must use status-based generic error copy and never render raw error bodies. Server debug-response hardening is a separate backend issue. |
| Rate limit | Sampled headers declare limit 60 and remaining budget. No real 429 was triggered. Explicitly synthetic 429 scenarios cover readable vs unexposed retry headers for later tests. |

Responses sampled for detail and search had `Cache-Control: no-cache, private` and `CF-Cache-Status: DYNAMIC`. A second rice request returned identical JSON with the same observed cache policy. This is evidence about these responses, not a complete Cloudflare configuration audit or proof of a global cache policy. No `Access-Control-Expose-Headers` was observed; browser JavaScript cannot assume it can read rate-limit or Retry-After headers. Do not enable credentials, introduce an API secret or implement a request loop.

## Food and nutrient input

Use `id` plus `description_slug` to verify configured examples. Display the exact `description`/brand/preparation rather than making generic substitutions. Nutrients and energy are tied to the declared `serving_size` / `serving_size_unit`; these are **not universally per 100 g**.

The captured response includes numeric strings such as `"100.000"`, nutrient `amount` strings, explicit nulls and omitted nutrients. Preserve those distinctions through the shared core. Nutrient children appear under `composition`: rice sugar is nested inside total carbohydrates; saturated fat inside total fat. Searching root nodes only will miss these values. Never sum a parent with its children.

Source energy remains separately declared in `calories` / `calories_unit`. Do not substitute 4/4/9 energy or use search summaries as authoritative full calculation inputs. Recipe evidence and import-normalization/source metadata must pass intact to the existing calculator. Fixtures remove unrelated identity/editorial fields, not calculation-critical source basis or nutrient state.

## Serving identity: use the canonical profile already available

The Phase 0 audit looked at the legacy serializer but missed the already-loaded `serving_profile.options` relationship. The deployed response exposes:

```text
serving_profile.options[].id                     canonical option ID
serving_profile.options[].legacy_serving_unit_id legacy ID, if present
serving_profile.options[].label
serving_profile.options[].gram_weight
serving_profile.options[].milliliter_volume
serving_profile.options[].sort_order
serving_profile.options[].is_default
serving_profile.options[].source
```

Rice's canonical option is **206**, legacy unit ID **168**, profile **109**; `label: "1/2 cup"`, `gram_weight: "80.0000"`, `is_default: true`, `source: "legacy_custom_servings"`. The legacy `custom_servings.serving_units[].id` is 168, not 206. Other sampled legacy IDs also differ from canonical IDs. Do not interchange these identifiers or assume the first legacy row proves default status.

Use the canonical profile as primary serving evidence, with a documented fallback to legacy/source-basis behavior when a record has no profile. Keep supplied gram and volume fields distinct. Drink/gata records here have volume-based source servings and no assigned profile. Never infer grams from mL or invent a bottle/can measure. No density unit was established by these examples.

## Provenance is already present

The Phase 0 conclusion that Philippine metadata was absent was incomplete. `FoodController::show()` returns `RecipeIngredientGraph::load()`, whose `expand()` attaches allowlisted `NutrientSourceMetadata::forFood()` evidence to root and nested foods. It exists in the inspected local code as well as the live samples. Inspecting `Food::toArray()` alone did not capture this path.

Philippine records expose report URLs, upstream IDs and retrieval dates. Null source edition/published dates stay null. Label records contain source type but no invented upstream reference. No new source-metadata serializer or legacy serving-field duplication is currently required for this tool.

**Revised Phase 2:** validate the existing root/nested provenance and canonical serving-profile contract with backend tests, and fix only demonstrated missing behavior. Consider CORS retry-header exposure if needed. Keep the label URL/configuration issue and verbose production 404 response visible as separate findings; do not silently bundle unrelated server changes.

## Representative captured records

| Fixture | JN ID / source | Source basis | Evidence/outcome |
| --- | --- | --- | --- |
| `rice` | 78 / `ph_fct`, A020 | 100 g | Live identity and canonical ½-cup/80-g option verified. Source report currently unavailable. |
| `coke` | 1597 / `nutrition_label` | 240 mL | Stored sugar 18 g, but Phase 3 calculation rejects it: duplicate canonical carbohydrate parents invalidate nested sugar (`duplicate_ancestor_path`). No profile; label URL unusable. Unfeatured pending data resolution and source review. |
| `pandesal` | 119 / `ph_fct`, A042 | 100 g | Profile supplies 1 piece/23.33 g; report URL exposed. Independent report-content review not performed. |
| `mango` | 678 / `ph_fct`, E051 | 100 g | Ripe Manila-super variant; profile supplies ½ cup/70 g. Independent report-content review not performed. |
| `patis` | 1270 / `ph_fct`, N011 | 100 g | Profile supplies 1 tbsp/**15 g**; sugar omitted. Do not show 15 mL or turn omitted sugar into zero. |
| `gata` | 1715 / `nutrition_label` | 100 ml | Stored saturated fat 17.5 g and total fat 22 g form a valid pair. Label URL unusable as published. Unfeatured pending source review. |
| `recipe` | 19346 / `community_recipe` | See full fixture | Chicken adobo, nine ingredient rows. Phase 3 confirms partial sugar, saturated fat, total fat and carbohydrates at 377 g; exact values remain null. Sodium is complete. Omitted nutrients and guarded USDA zeros remain unknown. |

Recipe fixtures preserve retained amounts, yield/cooking fields, nested ingredients, import/source evidence and the top-level `recipe.ingredients` alias. Author/user records and cooking procedures are removed. Do not treat the recipe's cached nutrition as proof of ingredient completeness.

## Rice denominator and external source review

**Phase 9 update:** a fresh public API read reconfirmed the same identity and canonical 80-g option, and the shared calculator produced 23.76 g carbs for it. The implementation calculates from the loaded record rather than storing that denominator. See [Phase 9 report](phase-09-report.md) and [live contract evidence](phase-09-reference-evidence.json). Original-source review remains pending; the following Phase 1 notes retain their historical capture scope.

API identity A020, slug `rice-well-milled-boiled`, per-100-g carbs **29.700 g**, canonical option 206's **80 g** are verified in the live response. Snapshot arithmetic gives `29.7 × 80 / 100 = 23.76 g` carbohydrate per reference serving. This arithmetic is evidence checking, **not yet shared-calculator parity**. The implementation must calculate from current API inputs, not hardcode the snapshot denominator.

The official report at `https://i.fnri.dost.gov.ph/fct/library/report/2982` returned **HTTP 503** with title “Service Temporarily Unavailable | DOST-FNRI”. Therefore the original report's nutrient contents could not be independently checked. The 80-g cup conversion's actual provenance is legacy JN serving data, not established laboratory evidence from that inaccessible report.

The Coke and gata payloads publish label images at `http://localhost/storage/...`. Those are unusable public source links. Preserve the observed URLs in test evidence, hide/reject localhost links in production UI, and resolve source URL generation with the backend before label review. Do not silently rewrite the hostname and claim that this validates the label. No label image has been reviewed in this phase.

All featured-food eligibility remains pending individual source/label review. Candidate data can support integration tests, not claims that the labels have been verified.

## Phase 1 gate

**FAIL — source review incomplete.** API origin, anonymous HTTP access, CORS responses, response envelopes, reference identity/serving, real missing nutrient cases and source/default-serving availability are captured. The required original rice-report check is blocked by upstream HTTP 503. Label candidates remain unverified because the published URLs are unusable. Do not change this gate to PASS merely because offline fixture checks pass.

Resume by rechecking the original rice source when available (or obtaining explicitly documented source evidence), resolving usable public label links, and recording the review outcome. Phase 2's proposed metadata additions must be reassessed against this observed contract before any server edit. No later implementation phase was started here.

## Phase 2 follow-up — 2026-10-23

The user authorized independent backend contract verification while the source-review gate remains unresolved. Five new endpoint tests and existing related regressions pass (21 tests, 150 assertions); see the [Phase 2 report](phase-02-report.md). Existing root/nested source metadata, canonical versus legacy serving identities, missing/zero semantics, private-food exclusion and USDA import evidence required no API behavior changes. The captured fixtures/hashes above remain unchanged. Source review and label URL issues are not cleared by these tests.
