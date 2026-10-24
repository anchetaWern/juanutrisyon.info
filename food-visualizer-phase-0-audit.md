# Food Visualizer — Phase 0 audit

Date: 2026-10-23 (Asia/Manila). Scope: implementation planning, repository inspection, all seven supplied desktop mockups, and read-only queries against the connected `pinoyfood` catalog. No application code, database records, deployment settings, or sibling repositories were changed.

## Phase 1 correction — 2026-10-23

The [observed public contract](docs/food-visualizer/public-data-contract.md) supersedes this audit's incomplete source/serving serialization conclusions: `RecipeIngredientGraph::expand()` already attaches source metadata, and `serving_profile.options` already exposes canonical IDs/defaults/provenance. Rice option 206 maps to legacy unit ID 168. The live API verifies the candidate rice record/serving; its original FNRI report returns 503, so independent source review remains incomplete. Product label links sampled in Phase 1 point to localhost. The original audit below is retained as historical findings, not an instruction to add duplicate API fields.

## Outcome

Build the tool as a statically generated Vue page in this repository at `/tools/food-visualizer`, with client-side interaction against the existing Laravel API. Reuse the Nuxt app's framework-independent calculator through a generated, versioned ESM distribution. Do not embed the entire app or copy its Vuetify components.

The repository/data audit is complete for planning. Production API behavior, Cloudflare configuration, label-image review, and end-to-end portion parity are still implementation/release checks, not verified outcomes of this audit. The connected database has not been established as identical to production.

Companion: [implementation plan](food-visualizer-implementation-plan.md).

The companion plan now expands the spec's three implementation milestones into execution phases 1–14. Its Phase 1 verifies the runtime/source evidence still outstanding here; this Phase 0 document does not imply those checks have passed.

## 1. Deployments and reusable boundaries

| Surface | Observed implementation | Consequence |
| --- | --- | --- |
| Main site, this repo | Vue 3.5, Vue Router 4, Vite 6, `vite-ssg`; no Vuetify | Native Vue components and existing CSS tokens fit the tool. Add an explicit route; prerender its heading, introduction, examples and explanatory content. |
| Existing app, `~/projects/juanutrisyon/nuxt-juanutrisyon` | Nuxt 3, Vuetify 3, public food pages and comparison | Reuse calculation/data contracts and destination routes. UI components depend on Nuxt/Vuetify and should not be transplanted wholesale. |
| API, `~/projects/juanutrisyon/pinoy-food-api` | Laravel 10; public food search/details; serving profiles | Continue using these records and endpoints. Small additive provenance fields are needed. |
| Main-site delivery | Cloudflare Pages catch-all `functions/[[path]].js`; delegates ordinary requests with `context.next()` and can return Markdown | Verify the generated nested route through the deployed Pages function, including HTML/Markdown negotiation. Existing function is not a food API proxy. |

Inspected HEADs: main site `4907fe1`; Nuxt app `22f81d7`; API `ad1adae`. These identify the audit baseline, not a production release or a guarantee of a clean worktree. Existing uncommitted files were left untouched.

Main-site integration points:

- `src/router/index.js`: explicit, lazy-loaded routes.
- `src/main.js`: `ViteSSG` bootstrapping.
- `src/assets/base.css`, `src/assets/main.css`: existing green brand, typography, spacing, surfaces and controls.
- `src/components/TopNav.vue`, `src/pages/index.vue`: navigation and homepage discovery.
- `src/composables/usePageSeo.js`: title, description, canonical and social metadata.
- `public/sitemap-2026.xml`, `public/robots.txt`: manually maintained sitemap, already allowed public crawling.
- `functions/[[path]].js`, `src/composables/useWebMcp.js`: existing public page/tool discovery lists; extend their listings when the tool ships.
- No PostHog client is initialized in the main site's inspected source. The app's PostHog module/configuration does not automatically apply here.

## 2. Existing API contracts

Base URL must be configured explicitly for the main site; the app reads `NUXT_PUBLIC_API_BASE_URI` or `VITE_API_URI`. Proposed landing-site configuration is `VITE_FOOD_API_BASE_URL`, with the production value verified during integration, expected to be `https://api.juanutrisyon.info/api`.

| Need | Existing contract | Use |
| --- | --- | --- |
| Search | `GET /api/foods?description=<query>&page=<n>` | Lightweight search list. Preserve backend ranking and pagination. |
| Full selected record | `GET /api/foods/<description_slug>` | Raw source basis, energy, nested nutrients, density, serving options, recipe ingredient graph and source identity. |
| Search with nutrients | `GET /api/foods/search-with-nutrients`; optional `calculation_inputs=1` | Available but unnecessary for the V1 search list; avoid hydrating nutrients/recipes for every search result. |
| Agent summary | Food detail with `?agent=true` | Do not use for calculator input: it declares a universal per-100-g basis and emits a reduced nutrient/serving representation. This does not preserve arbitrary product-volume/count bases or full recipe evidence. |

`FoodController::show()` loads serving profiles, density, nutrients and recursive recipe evidence. `Food::toArray()` nests nutrient composition and serializes assigned profiles to `custom_servings.serving_units`.

Important fields:

| Field | Meaning / handling |
| --- | --- |
| `id`, `description_slug` | Stable JN catalog identity and detail lookup key. Store both in featured-food configuration. |
| `description`, `brand`, preparation/category fields | Display the exact record, not a generic substitute for its variant. |
| `serving_size`, `serving_size_unit` | Source nutrient basis. Not automatically grams or the user's desired serving. |
| `nutrients[].name/amount/unit/composition` | Source nutrient tree. Null/omitted nodes stay unknown; do not use `normalized_amount` as selected-portion nutrition. |
| `calories`, `calories_unit` | Separately stored source energy; preserve null and unit. |
| `custom_servings.serving_units` | Labels, `weight`, `weight_unit`, `volume_in_ml`, legacy identifiers. Prefer record-specific options. |
| `density` | May be a nested record. Current `food_densities` table/model has a numeric value but no explicit unit column. Do not invent its unit. |
| `edible_portion` | Edible-weight metadata; do not apply it a second time to an already edible serving. |
| `recipe`, `recipe_ingredients`, `recipe_structure_status` | Required for the existing calculator's completeness/recipe rules. Preserve through adaptation. |
| `data_source`, `custom_id`, `nutrition_label_image`, `source_metadata` | Provenance; do not infer a source edition, review date or label verification from record timestamps. |

### Public access, limits and caching

- Food routes are outside the authenticated route group. `optional.verify_key` accepts anonymous requests with throttling; no browser API secret is needed.
- `routes/public.php` applies `throttle.cloudflare:60,1`; `RouteServiceProvider` also defines an API limit of 60/minute, and optional-key middleware invokes throttling. Effective behavior depends on the deployed middleware/proxy stack. Do not infer capacity from comments saying 5 or 10 requests/minute.
- `config/cors.php` allows all origins for `api/*`, without credentials. It currently exposes no response headers. A cross-origin client cannot assume `Retry-After` is readable; expose it if it is used for timed retry UX.
- Actual Cloudflare cache keys, TTLs, query variation and rate-limit headers were not available from repository inspection. Probe them before release; do not add a same-origin proxy to sidestep limits.
- Use committed search (Enter/button), in-flight deduplication, abort/stale-response protection and short-lived memory caches. No API calls for quantity edits or lens switches after required records are loaded.

## 3. Calculation reuse

Canonical implementation is `nuxt-juanutrisyon/src/helpers/calculation/`:

- `feature.js`: `calculateFood`, `findNutrient`, `exactValue`.
- `basis.js`: source/selected basis, density, household measures and edible-weight conversion.
- `adapters.js`: API evidence adaptation and import guards.
- `occurrences.js`: recipe graph expansion and retained ingredient amounts.
- `aggregate.js`, `nutrients.js`, `numbers.js`, `units.js`, `source.js`: completeness, nesting, normalization, strict numeric parsing and source evidence.

Both Food Details and Comparison already call this core. `FoodServing.js` is only a four-line serving-size predicate; it is not the scaling engine.

The core is framework independent, but is not yet a separately released package. Its dependency closure includes `RecipeCooking.js`; the broad `index.js` also exports planner/diary helpers, and `feature.js` imports interpretation/reference helpers. Build a narrow ESM entry exporting calculation and serving primitives, with tree shaking and artifact checks. Avoid a permanent runtime import from a sibling checkout.

Guardrails already implemented and essential to preserve:

- Explicit zero is distinct from missing, trace, invalid and unsupported data.
- Partial recipe coverage cannot become an exact nutrient total or an equivalence picture.
- Nutrient hierarchy must not double count parents and children.
- Open Food Facts inputs have an unverified-basis guard; legacy USDA zeros require matching normalization evidence. The visualizer must not bypass these to make examples look complete.
- Weight/volume conversion requires a documented density with an accepted unit. Same-dimension mL-to-mL scaling needs no density.
- Source records must not be modified while calculating.

The main site's own new math is limited to the four specified visual equivalents after canonical selected-portion calculation.

## 4. Verified catalog candidates

These are observed connected-catalog values, not independently verified nutrition labels or a production certification. Before featuring them, fetch the full public API payload, verify ID/slug/source/serving, inspect the upstream report or label, and check the calculator result.

| Candidate | JN ID / slug | Stored basis and suggested starting serving | Relevant stored values |
| --- | --- | --- | --- |
| Cooked rice | `78`, `rice-well-milled-boiled` | Per 100 g; profile `109`, option `206`: **½ cup = 80 g** | Carbs 29.7 g, sugar 0.1 g, fiber 0.4 g, 129 kcal per 100 g. |
| Pandesal | `119`, `bread-pan-de-sal` | Per 100 g; profile `116`, option `213`: 1 piece = 23.33 g | Carbs 62.9 g, sugar 7.6 g per 100 g. |
| Ripe mango | `678`, `mango-manila-super-ripe` | Per 100 g; profile `62`, option `159`: ½ cup = 70 g | Sugar 13.8 g, fiber 1.7 g per 100 g. Use edible fruit amount. |
| Generic fish sauce | `1270`, `fish-sauce` | Per 100 g; profile `854`, option `953`: **1 tbsp = 15 g** | Sodium 5,061 mg per 100 g; sugar omitted. Do not relabel its tablespoon as 15 mL. |
| Branded patis | `1586`, `silver-swan-patis-fish-sauce` | Per 15 mL; no assigned serving profile | Sodium 1,580 mg; sugar omitted. Keep this distinct from generic fish sauce. |
| Regular Coke | `1597`, `coca-cola-original-taste` | Per 240 mL; no assigned serving profile | Total sugar 18 g, sodium 25 mg, 72 kcal per source serving. No evidence here for a 330-mL can or 500-mL bottle. |
| C2 | `1690`, `c2-apple-flavored-green-tea` | Per 200 mL; `custom_serving_size` says “1 glass”; no assigned profile | Total sugar 17 g, carbs 18 g per source serving. Exact flavor matters. |
| Coconut cream | `1715`, `coco-mama-fresh-gata-coconut-cream` | Per 100 mL; no assigned serving profile | Sat fat 17.5 g, total fat 22 g. A usable volume-based candidate pending label review. |
| Alternative coconut cream | `19311`, `jolly-coconut-cream-kakang-gata` | Per 80 mL; label text “1/3 cup”; no assigned profile | Sat fat 16 g, total fat 17 g. Do not substitute another gata product's values. |

### Rice reference recommendation

Use JN `78`, source `ph_fct`, upstream code `A020`, serving option `206` (**½ cup cooked rice, 80 g**). The stored source report is `https://i.fnri.dost.gov.ph/fct/library/report/2982`, retrieved in the catalog on 2026-08-30.

At the audited source values: `29.7 × 80 / 100 = 23.76 g carbohydrate` per reference serving. Fetch this food at runtime and calculate that portion using the shared core; keep only its identifiers/serving selection in configuration. Do not ship `23.76` as a second nutrient source.

Display “≈ N servings of ½ cup cooked rice (80 g each), based on carbohydrate amount.” Two documented half-cup servings are 160 g and 47.52 g carbohydrate at this snapshot; the mockup's 45 g/cup is not the selected reference. If the reference is unavailable, retain the food's known carb amount and withhold the equivalence.

The serving option's provenance is `legacy_custom_servings`, not proof of laboratory-measured cup weight. Disclose it as the JN serving conversion and avoid claiming greater precision.

## 5. Provenance and existing sugar %DV findings

`NutrientSourceMetadata::forFood()` already extracts allowlisted Philippine report URLs/source IDs/retrieval dates from `raw_data`, with tests. However, `Food::toArray()` currently attaches metadata only for USDA records that have `import_normalization`. Consequently Philippine report evidence exists in the database but is not exposed by that serializer path. Plan an additive serialization change using the existing service; do not expose `raw_data`.

Serving-profile serialization currently omits the option's `is_default`, provenance `source`, and canonical option ID when a legacy ID replaces it. Add these as optional fields to the existing representation, preserving legacy fields, so clients can select/document the real default without first-option guesses.

The existing reference snapshot `docs/reference-values-api-2026-09-16.json` contains `sugar: 63 g`. `references.js` permits a sugar percentage; `useNutrientRows.js` and `useFoodComparison.js` can display it. Thus total-sugar %DV is not safe to inherit for this tool. Do not export reference/interpretation UI or show any %DV in V1. Correcting the existing app's reference policy is a separate review item and is not silently bundled into the visualizer.

## 6. Mockup interpretation

| Mockup | Adopt | Required adjustment |
| --- | --- | --- |
| `01-landing` | Filipino title, introductory search, four lens explanations, familiar examples | Keep within the one tool route; use existing main-site navigation/tokens. Hero photo is an asset/design choice, not required functionality. Only publish verified foods. |
| `02-search` | Search results, exact selected-food preview, portion selection | One-page state, not a separate route. Results must be real search matches; sample result lists/package sizes are not data fixtures. |
| `03-sugar` | Packets labeled 5 g, total-sugar value, weight-based explanation | Add quantity controls, fractions/large-count handling, fruit-specific copy, complete summary and sources. |
| `04-carbohydrates` | Rice comparison and low-sugar/total-carb lesson | Replace all sample values with the verified reference and selected portion; avoid inferring measured starch or blood-glucose response. |
| `05-sodium` | Sodium mg plus salt-equivalent g; missing nutrient presentation | No teaspoon visual; keep the approximate mass qualification close to the result. |
| `06-saturated-fat` | Amber lens treatment and sat-fat vs total-fat lesson | Replace standalone gram blocks with a valid **part-to-whole** graphic. With 8 g sat fat / 10 g total fat, show 8 of 10 or 80%; label the remainder “other fat,” not “healthy fat.” |
| `07-comparison` | Context for the existing app destination | Exclude the new comparison UI from V1. Link to existing comparison selection. |

Mockups are desktop references with different headers/languages. Proposed resolution: reuse the actual site shell, the result-card treatment of `02–06`, and Filipino/Taglish educational copy. Derive a single-column mobile layout with full lens labels. No site-wide navigation redesign is necessary.

## 7. Destination routes

- Standard Food Details: `https://app.juanutrisyon.info/food/<slug>`.
- USDA archive record: `https://app.juanutrisyon.info/food/archive/<slug>`; follows existing app search routing.
- Existing comparison selection can be seeded with `https://app.juanutrisyon.info/search?food1=<encoded-slug>`. `search.vue::hydrateComparisonState()` reads `food1`, enables comparison mode and seeds the tray. No cross-origin storage writes are needed.
- Existing final comparison route takes `/compare?food1=<slug>&food2=<slug>`. Sending only one food there would not load a full comparison. V1 should use the seeded search route and let the user choose the second food in the app.
- Existing destination URLs do not establish a supported selected-portion transfer contract. Do not promise that the current portion/lens carries over.

## 8. Remaining gates

1. Probe configured/deployed API with the main-site origin: anonymous access, CORS, actual caching, rate limits, error/429 handling and nested recipes.
2. Generate a narrow calculator distribution and prove source-to-artifact parity; verify no Vue/Nuxt/Vuetify or daily-target data ships with it.
3. Add and test provenance/default-serving fields; confirm legacy consumers and USDA guards are unaffected.
4. Validate featured source reports/label images, production identity and realistic serving text. Keep unreviewed foods searchable but unfeatured, with truthful data states.
5. Name the educational-copy reviewer and configure the main site's PostHog project token/host before analytics release validation.

There is no unresolved product decision blocking implementation planning. The defaults and release decisions are recorded in the companion plan.
