# Food Visualizer — Implementation plan

Date: 2026-10-23 (Asia/Manila). Status: Phase 12 engineering delivered; analytics target-deployment/readback verification, source/serving review and human copy sign-off remain pending. The existing app has a documented comparison-mode handoff edge case.

Execution structure: the completed planning audit is Phase 0, followed by **14 focused implementation phases** in §5. The spec's three broad implementation phases remain milestone groupings.

**Phase 1 evidence update (2026-10-23):** API/fixture capture is delivered, but its gate is FAIL pending original-source review (FNRI HTTP 503; product labels use localhost URLs). See the [observed contract](docs/food-visualizer/public-data-contract.md) and [Phase 1 report](docs/food-visualizer/phase-01-report.md). That observed contract supersedes initial assumptions below: source metadata and canonical serving IDs/defaults/provenance already exist in the public detail response. Phase 2 must validate these existing fields and change only demonstrated gaps.

**Phase 2 update (2026-10-23):** completed at the user's explicit instruction while Phase 1 source review remains unresolved. Existing source/serving contracts passed five new anonymous-route tests and related regressions (21 tests, 150 assertions). No API behavior changes were necessary. See the [Phase 2 report](docs/food-visualizer/phase-02-report.md).

**Phase 3 update (2026-10-23):** shared export and generated landing artifact delivered; 26 parity tests, 245 combined app regressions and seven standalone artifact checks pass. Rebuilds are byte-reproducible and the isolated landing build succeeds. The captured Coke record has duplicate canonical carbohydrate parents, making its nested sugar unavailable; keep it unfeatured for sugar pending data/source resolution. See the [Phase 3 report](docs/food-visualizer/phase-03-report.md) and [update instructions](docs/food-visualizer/shared-calculator.md).

Inputs: [condensed spec](juan-nutrisyon-food-visualizer-condensed-spec.md), [seven desktop mockups](mockups/), and [Phase 0 audit](food-visualizer-phase-0-audit.md). The audit records actual frameworks, API contracts, source/data gaps, candidate food IDs and the proposed rice reference.

**Phase 10 update (2026-10-23):** expandable provenance, additional complete nutrients and standard/archive Food Details plus seeded comparison links are implemented. Official FNRI PDF text matches the seven summary fields in four captured/current API records; direct PDF downloads still fail and independent household-serving review remains incomplete. No candidate is featured. Educational wording has a concrete [review packet](docs/food-visualizer/phase-10-copy-review.md), with named reviewer/sign-off pending. See the [Phase 10 report](docs/food-visualizer/phase-10-report.md) for validation and the existing app's same-seed/mode-off recovery. No deployment or Phase 11 work is implied.

**Phase 11 update (2026-10-23):** responsive/keyboard integration, focus retention, persistent qualified result announcements, contrast, language/heading semantics and reduced motion are delivered. 82 Node tests, 43 axe audits with explicit gradient/symbol contrast review, existing lens/disclosure browser regressions and the 21-page offline build pass. Initial-page Lighthouse accessibility is 100. See the [Phase 11 report](docs/food-visualizer/phase-11-report.md) for actual viewport/zoom-equivalent coverage and review limits. Source/copy/app-handoff release gates remain; Phases 12–14 have not started.

**Phase 12 update (2026-10-23):** the five allowlisted analytics events and an opt-in preference control are implemented. The user explicitly chose analytics off by default. 93 Node tests, six built-browser scenarios and the 21-page offline build pass. The existing US PostHog capture endpoint acknowledged all five verification event types; deployed main-site delivery and project-side query visibility remain unverified. Public project values are prepared only in ignored local configuration. See the [Phase 12 report](docs/food-visualizer/phase-12-report.md). Overall gate **PARTIAL**; Phases 13–14 have not started.

## 1. Recommended architecture and scope

One canonical, public route: `https://juanutrisyon.info/tools/food-visualizer`.

```text
Vue/ViteSSG main-site page
  ├─ prerendered heading, intro, examples and educational explanations
  ├─ small client API adapter ───────► existing Laravel public food API
  ├─ selected portion ──────────────► versioned build of existing JN calculator
  └─ canonical nutrient results ────► four lens presentations
                                      ├─ total sugar / 5 g
                                      ├─ sodium mg × 2.5 / 1000
                                      ├─ saturated fat / total fat
                                      └─ carbs / calculated reference-rice carbs
```

Keep the main-site UI here, API records in Laravel, and authoritative portion/nutrient calculations in the existing app core. No iframe, Nuxt/Vuetify runtime, new database, live AI explanation service, meal builder or second comparison engine.

Use the supplied result-card designs as visual direction, the current main-site shell/tokens as the brand foundation, and the written spec as behavior/data authority. Mockup 07 remains outside V1. Correct mockup 06 to show saturated fat as part of total fat. All mockup numbers and package sizes are illustrative.

### Releasing the existing calculator

Recommended smallest durable reuse: add a narrow library build to `nuxt-juanutrisyon` and commit its generated ESM output plus manifest into this repo under `src/vendor/jn-nutrition-core/`.

The library entry re-exports the existing `calculateFood`, `findNutrient`, `exactValue`, `parseAmount`, `isExact`, `normalizeBasis`, `normalizeHouseholdMeasure`, `normalizeDensity` and `convertEdibleWeight`. It must retain recipe/import/completeness behavior and include its actual dependency closure, notably `RecipeCooking.js`. Do not reimplement these functions here or publish a framework component bundle.

- Build with the app's existing Vite/Rollup tooling; tree-shake broad helper imports.
- Artifact manifest: contract version, source commit, relevant source-content hashes, distribution hash and build command. Refuse an unrecorded dirty-source export.
- Keep generation/update commands reproducible; accept the source checkout as an explicit local argument only when updating. A clean production build must need only this repo and its installed dependencies.
- Add parity fixtures run against the source calculator and generated artifact. Distribute representative public fixtures without private food/user data.
- Verify the output contains no Vue/Nuxt/Vuetify runtime, planner/diary UI, clinical classifiers, daily-value snapshot or source credentials.
- If tree shaking cannot remove interpretation/reference dependencies, split pure calculation exports inside the app core while retaining existing exports and behavior; verify both consumers before proceeding. This is a build-boundary change, not a new calculator.

The app remains the owner of calculator source. Calculator updates regenerate the artifact and run the same parity suite; generated files are never hand-edited. A private package registry is not needed for V1 and can replace artifact delivery later without changing the feature contract.

## 2. Data and client contracts

### API boundary

`foodApi.js` exposes only public reads:

```js
searchFoods({ query, page, signal }) // backend-ranked, paginated summaries
getFood({ slug, signal })           // full raw calculation inputs
```

Use `GET /foods?description=...&page=...` for search and `GET /foods/<slug>` for selection. Do not fetch every result's nutrients or use `?agent=true`. Verify the configured base URL ends at the correct API prefix. Make unauthenticated requests without cookies/API secrets.

At the boundary, normalize envelope shape and display fields but preserve source basis, nested nutrient amounts/status/units, source metadata, density, recipe graph and recipe-status markers. Treat malformed records as recoverable unavailable/error states. Do not fill nulls or silently map uncertain nutrient aliases. If the shared calculator does not recognize a real source name, resolve/test the alias upstream once rather than adding visualizer-only nutrition mappings.

Cache policy:

- Search occurs on submit/Enter; ordinary typing makes no network requests. Curated food chips select their verified record directly.
- Cache search by normalized query + page and details by slug, with in-flight deduplication. Proposed defaults: 5-minute search TTL and 15-minute detail TTL, bounded to 20 search pages and 30 detail records in memory.
- Abort superseded searches/selections and also check a request generation ID before committing results. Aborting alone does not prevent every stale-response race.
- Fetch reference rice once when the carbohydrate visual is first needed, deduplicating against an identical selected-food request. Show the food's carb amount even if reference loading fails.
- No calls on quantity changes; no calls on lens changes once relevant food/reference data are cached. Do not fetch data during static generation.
- Show retry UI for network errors/5xx; respect readable `Retry-After` on 429. When it is unavailable, show a rate-limit message with manual retry rather than a request loop.
- Keep caches in memory; offline mode, persistent food catalogs and service workers are outside V1.

### Selected portion

Store selection as `{ foodId, slug, optionId, quantity, amount, unit, conversionEvidence }`, separately from immutable raw food data. Quantities permit fractions/decimals. Proposed stepper step is 0.5; direct input supports other positive decimal amounts. Reject blank, negative, zero and nonfinite UI quantities while preserving the last valid result; the underlying calculator's own explicit-zero semantics remain unchanged.

Serving resolution order:

1. Verified curated override pointing to a real serving option, if supplied.
2. Explicit API default option when its basis is usable.
3. A usable record-specific option, then a supported subtype option if already supplied by the existing API; disclose its source.
4. Original source serving/basis when no household conversion is supported.

Use supplied gram weight for gram-based household measures; use explicit volume for a volume-based source without unnecessary gram conversion. Cross-dimension conversion requires documented density and units. A numeric density with no unit does not establish g/mL. Do not parse “bottle,” “can,” “glass,” or “1/3 cup” from free text into an invented measure. Unverified free-text labels may be shown as source text alongside their actual numeric basis.

For a label record per 240 mL, allow quantity multiples of 240 mL and identify them by volume. Show gram amounts only when supported. Do not label that record “1 can (330 mL).” A later verified package serving can be added as source-backed serving data through the existing system.

Calculate via `calculateFood(food, selectedAmount, selectedUnit)`. Consume individual nutrient nodes with `findNutrient`/`exactValue`, not the overall aggregate state: a missing unrelated nutrient must not hide known sugar. Require complete, exact nodes for visual equivalents; partial recipe subtotals are not exact totals.

### Featured foods and rice reference

Configuration contains IDs/slugs, serving selectors, default lenses, reviewed context categories and display assets/copy keys. It contains no independent nutrient amounts.

Start with cooked rice `78`, Coke `1597`, pandesal `119`, generic patis `1270`, ripe mango `678`, and one reviewed gata record (`1715` or `19311`). C2 `1690` is optional. These are candidates until public-payload/source review passes. Launch can use the smaller verified set rather than the entire spec's suggested list.

Phase 3 qualification: Coke `1597` is not currently eligible for a sugar/carbohydrate example because duplicate canonical carbohydrate nodes invalidate those results. Resolve the catalog evidence or choose another reviewed record; do not bypass the core guard.

Rice reference: `78` / `rice-well-milled-boiled`, option `206`, ½ cup = 80 g; source code `A020`. Resolve the live serving and run it through the same calculator. At the audited snapshot it yields 23.76 g carbs. If the configured option disappears or its documented basis changes, withhold equivalence and flag recuration; never silently choose another rice record. Routine nutrient updates follow the current API and provenance, with release spot checks of the examples.

### Additive Laravel changes

1. Validate existing root/nested allowlisted source metadata from `RecipeIngredientGraph::expand()`; Phase 1 confirmed it already exposes Philippine evidence. Preserve USDA import-normalization evidence/guards and never expose full `raw_data`. Do not add a second serializer path without a demonstrated gap.
2. Consume existing `serving_profile.options` canonical IDs, defaults and source provenance. Preserve legacy fields; Phase 1 confirmed they use different identifiers. No duplicate legacy-field additions are required for this tool unless later evidence establishes a compatibility need.
3. Expose `Retry-After` through CORS if deployed responses supply it and the client uses timed retries. Validate actual middleware headers before making broader CORS changes.

No new food/nutrient table, search engine, calculation endpoint or database migration is expected. Prefer these small changes over a new visualizer-specific resource. Verify response/cache behavior after deployment; invalidate only relevant cached details if required by observed edge TTLs.

## 3. One-page interaction and visual rules

### States and layout

- **Initial:** crawlable Filipino title/intro, search, verified quick examples, four lens introductions and brief explanatory content.
- **Search:** submit/loading/results/empty/error states; precise food identity and source badges. Selecting a result loads its full record and preview. Keep search/change-food accessible from results.
- **Selected:** food title/preparation, serving selector, quantity, resolved g/mL/count basis, four lenses, prominent visual plus one short takeaway, compact nutrient summary, expandable sources and app links.
- **Unavailable:** retain food/portion controls and the known values; explain why an individual visual cannot be drawn. Allow all lens tabs to remain selectable.

Use one route rather than four nutrient routes or a separate search page. Food selection can reveal the selected-food preview with an “Explore nutrients” action as in mockup 02; curated examples can proceed directly. Keep only one active calculator panel and one source of selection state. Do not reproduce a second global search bar or redesign the site's header.

Mobile: one column, the main visual followed by its takeaway, two-column nutrient cards where space permits, and a 2×2 lens control at approximately 360 px. Labels wrap in full. Keep search/serving controls reachable and avoid a tall sticky panel or horizontal page overflow. Desktop can use the mockups' visual/takeaway columns.

### Default lens and copy context

Use curated per-ID overrides first, then reliable taxonomy/preparation fields: sweetened drink → sugar; rice/bread/starchy staple → carbs; condiment → sodium; reviewed coconut cream/fat-rich category → saturated fat; whole fruit → sugar with whole-fruit wording. Do not classify a powder as a prepared drink. Unknown categories fall back to sugar, with unavailable-data handling if needed.

Initial mode is suggested/automatic. A manual lens choice persists while exploring foods in this page session; provide “Use suggested view” to return to automatic selection. Never use a manual sugar selection to infer anything about a new food's category. Copy context is recalculated for the selected food. Unknown context gets neutral wording, not an invented fruit/drink claim.

Educational copy is a reviewed deterministic lookup; do not reuse generic app health tips or total-sugar %DV. Prefer one sentence near each visual, with optional explanatory detail. Examples for review:

- Sugar: “Katumbas ito ng humigit-kumulang N pakete na tig-5 g ayon sa timbang; hindi nito sinasabi kung gaano karami ang added sugar.”
- Whole fruit: “May natural na asukal ang buong prutas; paghahambing lang ng timbang ang mga paketeng ito, hindi asukal na idinagdag sa prutas.”
- Sodium: “Tinatayang katumbas ito ng N g asin ayon sa timbang; hindi ito ang eksaktong asin na idinagdag.”
- Saturated fat: “Ang saturated fat ay bahagi ng total fat, kaya magkaibang bilang ang dalawang ito.”
- Carbs: “Magkasingdami lang ng carbohydrate ang ikinukumpara rito; hindi ibig sabihing pareho ang epekto ng mga pagkain sa katawan.”
- Rice/staple context: “Kahit kaunti ang sugar, maaari pa ring marami ang total carbohydrate.”

Do not claim to know a food's measured starch from total carbohydrates alone. Fiber does not cancel sugar; kcal describes energy. Keep clinical predictions and health scores out of this UI.

### Four lens acceptance rules

| Lens | Presentation | Boundary behavior |
| --- | --- | --- |
| Sugar | Big **total sugars (g)**, 5-g packets, numeric packet equivalents by weight | Compute `g / 5` at full precision. Fractional fills plus textual fractions/decimals; cap illustrated packets (proposed 20) with an explicit total/multiplier. Small positives must not appear as zero. Known zero has a truthful zero state; missing/partial gets no packet count. |
| Sodium | Big sodium mg, approximate salt-equivalent g, simple salt illustration | `mg × 2.5 / 1000`. Illustration must not imply teaspoons, added salt or a calibrated shaker count. 800 mg → ≈2 g. |
| Saturated fat | Big sat-fat g plus clearly labeled part-to-whole bar/donut with total-fat g | Ratio only when both complete values satisfy `0 ≤ sat ≤ total` and `total > 0`. 8/10 → 80%, remainder “other fat.” No clamp for invalid pairs. If total is unknown, retain known sat-fat g but withhold the share. 0/0 shows both reported zeros with no ratio. |
| Carbs | Big total-carbohydrate g plus reference-rice serving equivalents | Exact food carbs / positive exact rice-reference carbs. Label the precise rice/portion/source. No equivalence when denominator is missing/zero or reference fails. No health or blood-glucose equivalence. |

Round for display only. Proposed amount formatting: up to 2 decimals for nutrient grams and visual equivalents; whole kcal; sodium retains enough precision for small positives. Use a threshold label such as “<0.01 g” when a positive value would otherwise round to zero. Calculations and validity checks use unrounded results. Avoid lab-accuracy implications from extra decimal places.

Summary always identifies the seven requested fields—total sugar, total carbs, fiber, sodium, saturated fat, total fat, kcal—with values or a truthful unavailable state. A compact “More nutrients” section can show other available results such as protein. Never add hierarchy children to their parents. Do not show DV percentages or traffic-light health judgments.

### Sources, links and accessibility

Expandable source information includes JN ID, source name/code/reference ID, source basis, selected portion/quantity, serving conversion evidence, available report/label link, estimated recipe status, calculation-core version and rice-reference details when relevant. Unknown edition/date/conversion evidence stays unreported. Qualifications needed to interpret a visual stay visible beside it, outside the collapsed panel.

Food Details follows `/food/<slug>` or `/food/archive/<slug>` for USDA. Comparison links to `https://app.juanutrisyon.info/search?food1=<encoded-slug>` and uses the existing app to choose a second food. V1 does not promise to transfer portion/lens state or write cross-origin session storage.

Use semantic forms/buttons, labeled inputs and errors, accessible tab/radio-group semantics and keyboard navigation, visible focus, polite loading/result announcements, and focus movement only on intentional transitions. Repeated SVG packets/rice icons are decorative when equivalent text describes the result. Respect reduced motion. Check text contrast against actual site/lens colors and full use at 200% zoom.

Use lightweight inline SVG/CSS for the packet, salt, fat-share and rice visuals. Existing source food thumbnails can be used with fallbacks. The hero collage in mockup 01 can be deferred; do not slice screenshot food imagery into production assets. If photographic assets are wanted, source or generate them as a separate design task.

## 4. Concrete file plan

Paths below are new unless an existing file is explicitly described as an edit. Avoid creating empty abstraction layers if implementation can combine small responsibilities cleanly.

### Main site: `juanutrisyon-landing`

| Files | Responsibility |
| --- | --- |
| `src/pages/tools/FoodVisualizer.vue` | Page composition; prerendered copy; `usePageSeo`; initial/search/selected states. |
| `src/features/food-visualizer/components/FoodSearch.vue`, `FoodPreview.vue` | Committed search/results and selected-record preview. |
| `src/features/food-visualizer/components/ServingControls.vue`, `LensSelector.vue` | Supported portions/quantity and accessible lens selection. |
| `src/features/food-visualizer/components/LensResult.vue` and `visuals/{SugarPackets,SaltEquivalent,FatShare,RiceEquivalent}.vue` | One prominent result, short lesson and four code-native visuals. |
| `src/features/food-visualizer/components/NutrientSummary.vue`, `SourceDetails.vue` | Compact nutrient results, more nutrients, provenance and outgoing links. |
| `src/features/food-visualizer/useFoodVisualizer.js` | Selection/portion/lens state, request lifecycle and derived results. |
| `src/features/food-visualizer/foodApi.js`, `servings.js` | Public fetch/cache boundary and canonical primitive-based serving selection. No independent nutrient scaling. |
| `src/features/food-visualizer/lenses.js`, `format.js`, `content.js` | Equivalent calculations, formatting, deterministic contextual copy/defaults. |
| `src/features/food-visualizer/featuredFoods.js`, `referenceRice.js` | Verified identities/serving selectors; no copied nutrient database. |
| `src/vendor/jn-nutrition-core/index.mjs`, `manifest.json` | Generated canonical calculation distribution and provenance. |
| `scripts/update-nutrition-core.mjs` | Reproducible local artifact update/checksum validation from an explicit app export. |
| `src/composables/useVisualizerAnalytics.js` | Lazy client-only PostHog adapter, environment/config gating and event contract. |
| `tests/food-visualizer/`, `scripts/check-food-visualizer-build.mjs` | Focused numerical/state/API/parity coverage and generated HTML verification. |
| Edit `src/router/index.js` | Register `/tools/food-visualizer`. |
| Edit `src/components/TopNav.vue`, `src/pages/index.vue` | Food Visualizer link and small homepage entry; existing shell remains the base. |
| Edit `src/config/site.js`; add `.env.example` | API/app destinations and public analytics configuration; no secrets committed. |
| Edit `package.json`, lockfile | Focused test command/dependencies and client analytics dependency if needed. No framework migration. |
| Edit `public/sitemap-2026.xml` | Add canonical tool URL with accurate modification date. Existing robots rules should already allow it. |
| Edit `functions/[[path]].js`, `src/composables/useWebMcp.js` | Register the real tool in existing discovery listings; preserve ordinary Pages behavior. |
| Edit `src/pages/privacy.vue` if needed | Keep published analytics description consistent with the actual new PostHog configuration. |

Use existing CSS tokens and scoped feature CSS. Add feature-specific tint tokens only where necessary; no general design-system rewrite. Set page language to Filipino using existing head support, with language annotations for English phrases as needed; avoid an unrelated global language change.

### Existing app: `~/projects/juanutrisyon/nuxt-juanutrisyon`

| Files | Responsibility |
| --- | --- |
| New `src/exports/nutrition-core.js` | Narrow re-export entry from current calculator. |
| New `vite.nutrition-core.config.js`, `scripts/build-nutrition-core.mjs` | Generate ESM distribution and deterministic manifest in a dedicated output directory. |
| New `src/exports/nutrition-core.test.js` | Source-to-distribution parity across portions, units, unknown values and recipes. |
| Edit `package.json` | Add `build:nutrition-core`; retain existing app build/widget/deploy behavior. |

No Food Details/Comparison UI changes or comparison-engine changes are required. If pure exports need isolation for bundling, keep that refactor narrow and covered by existing calculator tests. Existing dirty files are outside this plan's changes.

### API: `~/projects/juanutrisyon/pinoy-food-api`

| Files | Responsibility |
| --- | --- |
| Inspect `app/Models/Food.php`, `app/Services/RecipeIngredientGraph.php`; edit only for proven gaps | Phase 1 confirmed the graph loader already exposes allowlisted root/nested source metadata. |
| Inspect `app/Models/ServingOption.php`; edit only for proven gaps | Consume the existing canonical profile options; preserve different legacy IDs. |
| Reuse `app/Services/NutrientSourceMetadata.php`, `app/Services/ServingResolver.php` | Authoritative source/serving resolution; extend only for demonstrated missing evidence. |
| Extend `tests/Unit/NutrientSourceMetadataTest.php`; add `tests/Feature/FoodVisualizerPublicContractTest.php` | Public/nested evidence, legacy compatibility, private-food boundary and raw-data exclusion. |
| Edit `config/cors.php` only if required by header probe | Expose actual retry headers for anonymous cross-origin requests. |

## 5. Focused execution phases and evidence gates

The spec's three implementation phases remain **milestones**, not individual agent tasks. Execute the smaller phases below to keep evidence gathering, backend changes, calculation reuse and UI work independently verifiable. Smaller tasks reduce the amount of context an agent must infer; the evidence and checks are what constrain incorrect assumptions.

| Milestone | Execution phases | Result |
| --- | --- | --- |
| Phase 0 — audit | 0 | Repository/catalog findings and proposed contracts. |
| Spec Phase 1 — data and public page | 1–5 | Verified contracts, reusable calculator, searchable page and canonical portion results. |
| Spec Phase 2 — UI and four lenses | 6–11 | Four individually verified lenses, provenance, curated examples and accessible layouts. |
| Spec Phase 3 — release and discovery | 12–14 | Analytics, discoverability and release evidence. |

**Current status:** Phase 0 planning, Phases 2–9 engineering and Phase 11 engineering are complete. Phase 1's full source-review gate remains unresolved, with new text-level evidence in Phase 10. Phase 10 engineering is delivered; its overall gate is **PARTIAL** pending complete source/serving review, human copy sign-off and resolution or acceptance of the documented app handoff limitation. Phase 12 engineering is delivered with gate **PARTIAL** pending analytics target-deployment delivery and project readback. Phases 13–14 have not started. Automated checks do not clear those review gates.

### Recommended OpenAI model and reasoning effort

These are recommendations for the **coding agent executing each phase**, not models to embed in the food visualizer. The product still uses deterministic educational copy and has no live AI explanation service.

Official OpenAI documentation recommends GPT-6.1 Sol for complex coding/agentic work, Luna for focused repeatable work, and Astra for the most demanding workflows. It also explains that higher reasoning effort can improve difficult work while increasing time/token use. The phase assignments below are project-specific engineering judgment, not an OpenAI benchmark or a guarantee against incorrect assumptions. See [OpenAI Codex models and reasoning guidance](https://developers.openai.com/codex/models), checked 2026-10-23.

| Phase | Recommended model | Reasoning effort | Why this setting fits |
| --- | --- | --- | --- |
| 0 — repository and catalog audit | GPT-6.1 Sol (`gpt-6.1-sol`) | `high` | Trace contracts across three repositories and reconcile the spec, mockups and catalog evidence. |
| 1 — verify runtime contracts and freeze evidence fixtures | GPT-6.1 Sol (`gpt-6.1-sol`) | `high` | Distinguish observed API/source facts from assumptions and preserve fixture provenance. |
| 2 — expose source and serving metadata compatibly | GPT-6.1 Sol (`gpt-6.1-sol`) | `high` | Make compatible serialization changes while checking nested records and private-data boundaries. |
| 3 — export and prove the shared calculator | GPT-6 Astra (`gpt-6-astra`) | `high` | Resolve the cross-repository dependency boundary and prove calculator parity without weakening source guards. |
| 4 — public page, API client and food selection | GPT-6.1 Sol (`gpt-6.1-sol`) | `high` | Coordinate static generation, API adaptation, cache behavior and asynchronous request races. |
| 5 — portions and canonical nutrient results | GPT-6.1 Sol (`gpt-6.1-sol`) | `high` | Verify portion dimensions, edible basis, recipe completeness and full-precision canonical results. |
| 6 — sugar vertical slice and common result layout | GPT-6.1 Sol (`gpt-6.1-sol`) | `high` | Establish the reusable visual/result pattern, fractional packets and context-sensitive sugar qualifications. |
| 7 — sodium lens | GPT-6 Luna (`gpt-6-luna`) | `high` | Implement a bounded conversion and presentation using the already validated result and portion contracts. |
| 8 — saturated-fat lens | GPT-6.1 Sol (`gpt-6.1-sol`) | `high` | Handle paired nutrient validity, zero denominators and inconsistent data without misleading graphics. |
| 9 — carbohydrate and reference-rice lens | GPT-6.1 Sol (`gpt-6.1-sol`) | `high` | Coordinate sourced reference loading, serving identity, denominator validity and carbohydrate-only wording. |
| 10 — source disclosure, verified examples and app handoff | GPT-6.1 Sol (`gpt-6.1-sol`) | `high` | Reconcile source evidence, verified example configuration, contextual copy and existing app destinations. |
| 11 — responsive and accessibility integration | GPT-6.1 Sol (`gpt-6.1-sol`) | `high` | Inspect integrated browser behavior across responsive layouts, keyboard flows and accessibility states. |
| 12 — analytics | GPT-6.1 Sol (`gpt-6.1-sol`) | `medium` | Wire a specified event contract and verify client-only delivery, deduplication and property allowlists. |
| 13 — SEO, discovery and deployment behavior | GPT-6.1 Sol (`gpt-6.1-sol`) | `high` | Check generated HTML, route delivery, canonical behavior and Cloudflare content negotiation together. |
| 14 — final regression, usability and release handoff | GPT-6 Astra (`gpt-6-astra`) | `high` | Assess evidence across all phases, investigate contradictory results and judge release readiness against the spec. |

Use these as starting settings when the model/effort is available in the executing client. `high` means **High** and `medium` means **Medium** in the model picker; these are reasoning levels, not output verbosity. Phase 0's row is a recommendation for a future repeat audit, not a claim about the model/settings used for the completed audit.

- If keeping one model throughout is easier, use **GPT-6.1 Sol / High** for all phases; the table provides selective use of Astra and Luna.
- If Astra is unavailable, use GPT-6.1 Sol / High and preserve the full gate checks. If Luna encounters scope ambiguity or shared-contract changes, move that phase to GPT-6.1 Sol / High before expanding its implementation.
- If a failure reveals a deeper problem, first inspect the failing evidence and narrow the unresolved task; then consider Extra High (`xhigh`) on Sol or Astra. More reasoning cannot supply missing API evidence, permissions or human review.
- Max/Ultra and parallel agents are not required by this plan. These recommendations do not authorize delegation or change any execution permissions.
- Record the actual model/effort when available in each phase report. Carry the source contract, fixture references and previous report across model changes; a model change does not reset completed work or waive a failed gate.
- This document does not change the current session model, app/workspace defaults or production configuration. Model access still depends on the account/client settings.

### Execution rules for every phase

- Read this phase's prerequisites, its referenced code and the previous phase report before editing. Recheck relevant contracts if the repository or API has changed since the audit.
- Use existing file paths and source/API evidence to establish facts. The proposed new paths in §4 are planned additions, not evidence that those files already exist.
- Limit edits to the phase's stated repositories/responsibilities. Record a necessary scope expansion and its reason; do not use it to begin unrelated later work. Respect filesystem permissions for sibling repositories.
- Capture and validate real payload shape before writing adapters. Never invent an API field, nutrient value, serving conversion, density unit or food identity to unblock a phase.
- Treat synthetic numerical fixtures as tests only. Mark their origin, keep them separate from captured source fixtures and never publish them as real food data.
- For clinical/source uncertainty, retain an unavailable state and record the gap. Missing evidence does not justify weakening shared calculation guards or changing expected test results to fit the implementation.
- Add focused checks with the relevant implementation, rather than postponing verification to the final phase. A passing build alone does not establish numerical correctness, accessibility or production behavior.
- A phase is complete only when its exit gate has evidence. An external dependency may leave it incomplete even if its code is ready; dependent work may use explicitly labeled fixtures, but cannot claim the unresolved contract is verified.
- After completion, report the result and next gate. If asked to implement only Phase N, stop there. If authorized to implement the whole feature, continue sequentially through passing gates without requesting approval after every phase. Actual approval/permission requirements still apply.

Keep reports in `docs/food-visualizer/phase-NN-report.md`. Each report must contain: scope and changed files; input evidence/fixture origins; exact checks run and results; untested behavior; unresolved issues; and **gate PASS/FAIL with the evidence and next allowed phase**. Do not mark PASS with an unresolved required check. Do not create empty reports for future phases.

### Phase 0 — repository and catalog audit

**Recommended execution:** GPT-6.1 Sol (`gpt-6.1-sol`), reasoning **High**.

**Status:** planning audit completed; see [audit](food-visualizer-phase-0-audit.md).

**Delivered:** framework/API/calculator tracing, seven-mockup review, catalog candidates and stored rice serving, provenance/%DV findings, and concrete integration/file plan.

**Limit:** production API/source-label verification and source-to-artifact parity have not been performed. They are explicit work in the phases below, not implied by “audit complete.”

### Phase 1 — verify runtime contracts and freeze evidence fixtures

**Recommended execution:** GPT-6.1 Sol (`gpt-6.1-sol`), reasoning **High**.

**Prerequisite:** Phase 0 audit. **Scope:** read-only API/source inspection and test evidence; no feature UI or backend behavior changes.

- Verify the actual configured public API origin/prefix and anonymous access from the main-site origin. Capture request URLs, response shape and relevant CORS/cache/rate-limit headers without secrets.
- Capture representative full food payloads: rice, a volume-based drink, pandesal, fruit, patis, a valid sat-fat/total-fat pair, and an incomplete recipe. Record endpoint, capture date, ID, slug, source and declared basis.
- Check the rice identity and serving against production and its source report. Distinguish serving-profile provenance from independently measured cup weight. Review label/report evidence for candidate examples; keep unverified candidates clearly marked.
- Record which provenance/default-serving fields are actually absent and confirm the minimal additive API change. Use observed or simulated 429 fixtures without deliberately saturating the public service.
- Write `docs/food-visualizer/public-data-contract.md` and sanitized public fixture files under `tests/food-visualizer/fixtures/`. Do not include user identity/private data or require live API access in automated tests.

**Exit gate:** observed payloads support the planned adapter and candidate rice reference; discrepancies and missing evidence have explicit outcomes. Required live contracts that cannot be verified remain a failed gate, not invented fixtures presented as captured data.

### Phase 2 — expose source and serving metadata compatibly

**Recommended execution:** GPT-6.1 Sol (`gpt-6.1-sol`), reasoning **High**.

**Prerequisite:** Phase 1 observed contract. The user explicitly authorized Phase 2 despite pending source review; that review still gates featured-example promotion/release. **Scope:** Laravel contract verification and only demonstrated backend gaps, apart from updating contract fixtures/report. Phase 1 already observed source/default-serving metadata; do not implement the earlier assumed additions by default.

- Validate the existing source metadata and canonical serving-profile fields described in the Phase 1 contract. Add focused backend contract tests; change `Food.php`/`ServingOption.php` only if those tests or a concrete consumer requirement demonstrate missing behavior.
- Verify Philippine source evidence, canonical option IDs/defaults/provenance, nested recipe records, legacy fields, private-food exclusion and raw-data exclusion.
- Preserve USDA import evidence and guards. Change CORS exposed retry headers only when justified by Phase 1 observations.
- Extend API tests, run the affected PHPUnit tests and record public payload compatibility. Keep API deployment status separate from local code/test status.

**Exit gate:** existing or necessary added fields are verified with no altered nutrient records/calculation behavior. Evidence identifies the tested source version separately from deployed captures. Deploy only if an actual behavior change was needed; do not silently substitute missing defaults. **Result: PASS; no API behavior/deployment change needed.**

### Phase 3 — export and prove the shared calculator

**Recommended execution:** GPT-6 Astra (`gpt-6-astra`), reasoning **High**.

**Status:** PASS — completed; see [Phase 3 report](docs/food-visualizer/phase-03-report.md). Original-source review remains a separate unresolved gate.

**Prerequisite:** Phase 1 evidence; use Phase 2 metadata where applicable. **Scope:** narrow app-core build/export and generated landing-site artifact, not visualizer UI.

- Add the narrow ESM entry/build/manifest and reproducible update path described in §1/§4. Add the focused parity harness needed to test the artifact.
- Test the same captured inputs through source core and exported artifact at source portions, household grams, fractional multiples and volume selections.
- Include nested/partial recipes, explicit zero, null, duplicate nutrients, unverified USDA zeros, uncertain Open Food Facts basis and unsupported conversions. Keep input data immutable.
- Check distribution dependencies and provenance hashes. Prove that a clean landing-site build does not need the sibling app checkout. If a pure-export refactor is necessary, preserve existing app exports and run affected calculator regressions.

**Exit gate:** source/artifact results match at full precision; source guards survive; generated output/manifest are reproducible and free of framework/clinical-reference payloads. No hand-written nutrient scaling is introduced in the main site.

### Phase 4 — public page, API client and food selection

**Status:** PASS — see [Phase 4 report](docs/food-visualizer/phase-04-report.md). Source-review gates remain unresolved; no release or discovery promotion.

**Recommended execution:** GPT-6.1 Sol (`gpt-6.1-sol`), reasoning **High**.

**Prerequisites:** Phases 1–3 pass; required API fields are available in the environment under test. **Scope:** main-site API boundary, search/preview state and statically generated page shell.

- Register the canonical route and prerender the heading, introduction, lens explanations and nonnumeric example content.
- Implement public API reads, committed search, real ranked results/pagination, exact selected-food preview and change-food behavior.
- Implement bounded caches, in-flight deduplication, abort plus stale-response protection, and loading/empty/404/network/429 states. Preserve the full calculation input evidence.
- Add the landing-site focused test setup if the Phase 3 artifact harness did not already establish it. Verify request races/cache behavior with deterministic mocked transport, not repeated public requests.
- Build with the API unavailable to prove static generation has no runtime-data dependency. Keep the page out of homepage/nav/sitemap promotion during implementation.

**Exit gate:** a public, directly navigable page can select a real food without fabricated data; request/selection state is verified; the build has crawlable copy and no build-time API/browser-global dependency. No equivalence pictures are needed yet.

### Phase 5 — portions and canonical nutrient results

**Status:** PASS — see [Phase 5 report](docs/food-visualizer/phase-05-report.md). Canonical results are verified; source-review gates remain unresolved.

**Recommended execution:** GPT-6.1 Sol (`gpt-6.1-sol`), reasoning **High**.

**Prerequisite:** Phase 4. **Scope:** serving resolution, quantity controls and seven-field nutrient summary; no equivalence visuals.

- Implement serving selection and quantity validation using the documented resolution order and shared primitives. Display the selected numeric basis and conversion evidence.
- Calculate the seven summary nutrients from immutable raw food inputs. Preserve exact zero, missing/partial states, recipe coverage and individual known values.
- Check source-unit selections and household grams, fractional quantities, count-based foods, edible weight, and rejected g/mL conversion without documented density units. Do not infer package sizes from labels.
- Compare the same selected amount/unit in the source calculator, exported artifact and existing Food Details. Record any Food Details presentation/default discrepancy rather than introducing a visualizer-only correction.
- Verify quantity edits recalculate locally and do not refetch food data.

**Exit gate:** selected-portion results match canonical values at full precision; display rounding does not change math; incomplete or invalid data cannot become zero. This validated result contract is the input to every lens.

### Phase 6 — sugar vertical slice and common result layout

**Status:** PASS — see [Phase 6 report](docs/food-visualizer/phase-06-report.md). Other lens controls remain disabled; source-review gates remain unresolved.

**Recommended execution:** GPT-6.1 Sol (`gpt-6.1-sol`), reasoning **High**.

**Prerequisite:** Phase 5. **Scope:** common lens/result layout plus sugar only; do not stub other lenses with sample values.

- Build the common accessible lens selector and result/takeaway composition using the sugar mockup. Other not-yet-implemented lens controls must not pretend to produce results in the implementation preview.
- Add total-sugar packet equivalents, fractional/large-count/small-positive formatting, known-zero and unavailable states.
- Add neutral and whole-fruit wording keyed to reviewed context. Keep the weight comparison and total-versus-added-sugar distinction visible near the picture.
- Implement suggested/manual lens state and ensure portion changes preserve an explicit user choice. Complete the drink/fruit flow on desktop and at 360 px before extending the pattern.

**Exit gate:** 25 g → 5 packets and all sugar boundary cases in §6 pass; textual meaning is accessible and no total-sugar %DV/added-sugar inference is introduced. The common component accepts canonical results without performing its own scaling.

### Phase 7 — sodium lens

**Status:** PASS — see [Phase 7 report](docs/food-visualizer/phase-07-report.md). Sugar regression checks pass; source-review gates remain unresolved.

**Recommended execution:** GPT-6 Luna (`gpt-6-luna`), reasoning **High**.

**Prerequisite:** Phase 6 common result contract. **Scope:** sodium result, illustration, deterministic copy and focused tests.

- Use canonical sodium mg to derive approximate salt-equivalent mass.
- Keep the sodium/salt distinction and “not literal salt added” qualification visible. Use no teaspoon visual or calibrated shaker count.
- Verify 800 mg → approximately 2 g, unit-normalized input, small positives, zero, missing and partial values using the validated portion controls.

**Exit gate:** numerical conversion and uncertainty behavior pass, with a usable 360-px/desktop presentation. Existing sugar behavior still passes affected checks.

### Phase 8 — saturated-fat lens

**Status:** PASS — see [Phase 8 report](docs/food-visualizer/phase-08-report.md). Sugar/Sodium regressions pass; source-review gates remain unresolved.

**Recommended execution:** GPT-6.1 Sol (`gpt-6.1-sol`), reasoning **High**.

**Prerequisite:** Phase 6 common result contract. **Scope:** sat-fat part-to-whole result and focused tests.

- Implement the corrected mockup: saturated-fat g within total-fat g, with a labeled part-to-whole graphic and “other fat” remainder.
- Require complete, compatible values and `0 ≤ sat ≤ total`, `total > 0` for the ratio. Keep known sat-fat g visible if its partner is unavailable, without fabricating a share.
- Verify valid 8/10 and 0/10, 0/0 without ratio, positive sat/zero total, sat greater than total, missing partners and partial data. Never clamp inconsistent data into a valid graphic.

**Exit gate:** only valid pairs produce a share; all other cases preserve known values and a truthful explanation. No butter/oil equivalence or inferred sat-fat amount is introduced.

### Phase 9 — carbohydrate and reference-rice lens

**Status:** PASS for engineering scope — see [Phase 9 report](docs/food-visualizer/phase-09-report.md). The live reference API contract was rechecked; original-source review remains unresolved.

**Recommended execution:** GPT-6.1 Sol (`gpt-6.1-sol`), reasoning **High**.

**Prerequisites:** Phase 6 common result contract and Phase 1's verified reference identity/serving. **Scope:** reference loading/configuration and carbohydrate comparison.

- Resolve rice `78` / option `206` only after verifying the current contract. Calculate the documented reference portion through the same artifact; store identifiers, not a copied carb denominator.
- Deduplicate reference/selected-food fetches and make reference errors independent of the food's known carbohydrate amount.
- Show reference serving size, mass, source and carbohydrate-only equivalence. Handle fractional multiples and missing/zero reference carbs. Withhold equivalence if the configured option disappears/changes basis.
- Verify equal carbs → one reference serving, the audited fixture's 23.76 g denominator, changed/unavailable references, and low-sugar staple context without a measured-starch or blood-glucose claim.

**Exit gate:** the denominator is source-backed and calculated; reference failure cannot fabricate equivalence or hide known food carbs. All four lens numerical contracts now pass.

### Phase 10 — source disclosure, verified examples and app handoff

**Recommended execution:** GPT-6.1 Sol (`gpt-6.1-sol`), reasoning **High**.

**Status:** Engineering delivered; overall gate **PARTIAL** — see the [Phase 10 report](docs/food-visualizer/phase-10-report.md). No unreviewed candidate was promoted. Source/serving review and named educational-copy sign-off remain release gates; the existing app's same-seed/mode-off limitation is documented with verified manual recovery.

**Prerequisites:** Phases 2 and 5–9. **Scope:** provenance UI, featured-food configuration/copy review and existing app links.

- Present allowlisted source evidence, selected/source bases, serving provenance, recipe uncertainty and rice-reference details. Keep essential qualifications outside the collapsed source panel.
- Promote only the reviewed candidate IDs/servings to featured examples. Record source/label review evidence and exact display names; leave incomplete candidates unfeatured rather than filling gaps.
- Finish deterministic suggested lenses/context copy and “More nutrients” presentation using known results. Educational wording remains pending sign-off until the named reviewer actually reviews it.
- Verify standard/archive Food Details paths and seeded comparison search in fresh/existing app sessions. Do not add a comparison engine or promise portion transfer.

**Exit gate:** every published example and outgoing route has evidence; provenance explains the displayed result; no synthetic fixture is published as a food. Copy sign-off status is recorded explicitly and remains a release gate if pending.

### Phase 11 — responsive and accessibility integration

**Recommended execution:** GPT-6.1 Sol (`gpt-6.1-sol`), reasoning **High**.

**Status:** PASS for local engineering scope — see the [Phase 11 report](docs/food-visualizer/phase-11-report.md). Mobile/desktop states, keyboard flows, reduced motion, 200% desktop layout equivalence and 320-pixel reflow were reviewed. The report distinguishes tested ARIA/keyboard behavior from unperformed screen-reader speech or physical-device testing. Prior release review gates remain pending.

**Prerequisite:** Phase 10 feature-complete flow. **Scope:** integrated layout/interaction refinement, not nutrient-contract changes.

- Review initial/search/preview/results/error/unavailable states across 360/390 px and desktop, including 200% zoom and long food/lens labels.
- Verify keyboard search/selection/servings/lenses, focus placement, live announcements, decimal validation, visual-equivalent text, contrast and reduced motion.
- Recheck cross-flow behaviors: food changes, manual/suggested lens modes, stale results and portion changes across all lenses.
- Record screenshots and automated/manual accessibility evidence. Fix numerical defects in their owning layer and rerun the affected numerical checks; do not patch values inside templates.

**Exit gate:** all four complete flows are usable on mobile and desktop with documented keyboard/accessibility review and no unresolved critical defects.

### Phase 12 — analytics

**Recommended execution:** GPT-6.1 Sol (`gpt-6.1-sol`), reasoning **Medium**.

**Status:** Engineering delivered; overall gate **PARTIAL** — see the [Phase 12 report](docs/food-visualizer/phase-12-report.md). Default-off opt-in was explicitly approved. Local privacy/event tests and live endpoint acknowledgements pass; no preview deployment URL or project readback was verified.

**Prerequisite:** Phase 11 stable interactions. **Scope:** main-site PostHog adapter/configuration and event contract only.

- Add the five allowlisted actions/properties in §7, client-only initialization and disabled localhost/SSR behavior.
- Verify events fire once per committed action, not on every reactive render/keystroke, and that no raw search text, food logs or API payloads are captured.
- Confirm failure/unconfigured analytics does not affect tool behavior; review published privacy wording for consistency.
- Validate configured project/host event delivery in the target environment. Local spy tests alone do not establish delivery to PostHog.

**Exit gate:** local event/privacy checks and target-project delivery are verified. Missing deployment configuration leaves this gate incomplete; do not request or store secret credentials in reports.

### Phase 13 — SEO, discovery and deployment behavior

**Recommended execution:** GPT-6.1 Sol (`gpt-6.1-sol`), reasoning **High**.

**Status:** Engineering delivered; overall gate **PARTIAL** — see the [Phase 13 report](docs/food-visualizer/phase-13-report.md). Built metadata/copy, discovery, response negotiation and actual anonymous cross-origin API reads pass. The current public tool URL still returns the homepage; no preview of this implementation or deployment version was verified. Release changes remain local pending the earlier review gates.

**Prerequisite:** Phase 11 UI complete; feature gates must pass before production promotion. **Scope:** metadata/build checks and discovery changes, without new calculator behavior.

- Finalize title/description/page language/canonical and static explanatory content; inspect generated HTML with JavaScript disabled or raw HTML inspection.
- Add homepage/nav, sitemap and existing machine-readable discovery entries as one reviewable release change. Prepare these locally before actual promotion; do not publish an incomplete feature to satisfy a discovery check.
- Verify direct nested-route navigation/refresh, indexability, canonical/query behavior, and Cloudflare HTML/Markdown negotiation in a preview or other authorized deployment environment.
- Recheck actual anonymous cross-origin API reads, observed caching and rate-limit error UX; distinguish mocked errors from observed deployed behavior.

**Exit gate:** built/deployed page and discovery links resolve correctly with crawlable copy, one main-domain canonical and no API build dependency. Record the deployment version/environment tested.

### Phase 14 — final regression, usability and release handoff

**Recommended execution:** GPT-6 Astra (`gpt-6-astra`), reasoning **High**.

**Prerequisites:** Phases 1–13 pass; source/copy review complete. **Scope:** final verification and release evidence, not speculative feature additions.

- Run the relevant numerical/state/API/build checks and focused app regressions for shared-boundary changes. Complete browser smoke tests of verified drink, rice, patis, fruit and sat-fat examples across all lenses/portion changes.
- Check every spec definition-of-done item against evidence rather than asserting completion from the phase count.
- Arrange the spec's suggested 3–5-person usability check with drink/rice/patis when participants are available. An agent cannot impersonate participants or mark human review complete. If it is not performed, report that explicitly; it is recommended validation, not an extra mandatory release condition unless the owner adopts it. Correct misunderstandings and repeat affected checks when results arrive.
- Prepare the exact release summary, limitations, deployment/version references and rollback procedure. Apply any required publishing/deployment approval only after the result is concrete and reviewable.

**Exit gate:** required numerical, data, accessibility, SEO, analytics and educational-copy review gates pass with evidence; tool is available anonymously on its canonical domain. Record the optional usability-check status separately. A local build or preview alone does not establish a production release. Secondary SEO pages and comparison expansion remain deferred.

## 6. Validation matrix

| Area | Required cases / evidence |
| --- | --- |
| Canonical parity | Same raw food/amount/unit produces matching full-precision results in source core and exported artifact; compare Food Details at the same basis before display rounding. |
| Sugar | 25 g → 5 packets; 2.5 g → ½ packet; 0 remains known zero; small positive does not become zero; large count stays bounded; null/omitted/partial has no count; fruit copy never implies added packets. |
| Sodium | 800 mg → ≈2 g salt; mg/g source normalization through the core; no teaspoon/added-salt claim. |
| Fat | 8/10 valid; 0/10 valid; 0/0 without ratio; positive sat/0, sat > total, missing partner, negative and partial inputs withhold the share. No clamping. |
| Carbs | Real rice reference at 80 g gives 23.76 g in audit fixtures; equal carbs → one reference serving; unavailable/zero denominator, reference failure or changed option withholds equivalence. Unknown sugar does not prevent known-carb display. |
| Portions | Quantity fractions/multiples; source mL→mL without density; g↔mL rejected without explicit density evidence; household grams; edible basis once; count-based records; different raw/cooked/powder/prepared variants. |
| Data uncertainty | Null/blank/omitted/trace/invalid/unsupported-unit/duplicate nutrients; incomplete or cyclic recipe; USDA unverified zero; Open Food Facts unverified basis; source immutability. |
| Requests | Search submit, pagination, no matches, retry, 404, 429 and unreadable retry header; stale search/selection responses; duplicate requests; cache expiry; no calls on ordinary quantity/lens updates. |
| Links | Exact selected slug and USDA archive route; comparison starts with the selected food in an existing app session and a fresh session; no claim of portion transfer. |
| UI/accessibility | 360/390 px and desktop widths, 200% zoom, full lens labels, decimal-input errors, keyboard search/lenses/servings, focus/announcements, reduced motion and textual equivalents. |
| SEO/delivery | Built HTML has heading/intro/examples/explanations and one canonical; API unavailable at build time; correct title/description/sitemap; HTTP 200 on direct nested navigation/refresh; consistent HTML and negotiated Markdown. |
| API regression | New fields additive; source metadata allowlisted; no raw/private data; nested food serialization; existing search ranking and selected Food Details/Comparison behavior unchanged. |
| Analytics | No tracking during SSR/build or localhost; no duplicate events on reactive recalculation; no food log, source payload or search-text capture. |

Use focused automated tests for the numerical/state/API boundaries, then browser smoke tests for the integrated flow. The landing repo currently has no test command: add a small Vitest setup for this feature and a build-output script. Use existing app Vitest and API PHPUnit tooling for shared-boundary changes. Add only the browser harness needed to repeat the meaningful user-flow checks.

## 7. Analytics and release controls

Implemented PostHog events: `food_visualizer_opened`, `food_visualizer_food_selected`, `food_visualizer_portion_changed`, `food_visualizer_lens_changed`, `food_visualizer_outbound_clicked`.

Allowlisted properties: feature version, selected public food ID/source, lens, serving option ID/unit, quantity where useful, selection origin (search/example), and destination type. Commit portion events on an accepted edit, not every keystroke. Never send full API records, health data, free-text searches or personal food logs. Disable autocapture/session recording for this integration unless separately reviewed; initialize lazily on the client and disable locally. Analytics failure must not block the tool.

Use `VITE_POSTHOG_PROJECT_TOKEN` and `VITE_POSTHOG_HOST`; recommend the existing project's configuration, with `surface: food_visualizer` to separate events. These values still need to be configured and verified for the main-site deployment.

Phase 12 configuration: the existing public project token and US host are prepared in ignored local `.env.local`; no token is committed or included in reports. The user chose default-off opt-in. Only the on/off preference persists; visit identifiers remain in memory. The adapter uses the public Capture API without SDK autocapture/replay, includes anonymous-processing flags, honors DNT/GPC and fails without blocking the UI. See the report for exact event schemas/commit points and the remaining target-environment gate.

Rollback: revert the main-site feature/discovery release to the previous deployment. The additive API metadata and calculator build entry can remain, since neither changes existing nutrient records or app calculations. Keep artifact versions reproducible so rollback does not pick up a newer sibling checkout.

## 8. Decisions and assumptions

Recommended defaults that can be implemented without another product decision:

- Canonical path `/tools/food-visualizer`; one-page flow.
- Main-site shell with mockup `02–06` layout direction; Filipino/Taglish educational content.
- Comparison mockup excluded; existing app handoff retained.
- Generated versioned ESM artifact from the existing app core; direct public API reads.
- JN rice `78`, option `206`, ½ cup/80 g reference, subject to production/source checks.
- Small verified example set; no dependency on completing all suggested categories or sourcing a hero collage.
- No %DV/health score, persistent catalog, offline mode, stateful URL presets or secondary SEO pages in V1.

Remaining launch inputs: **who signs off on the educational wording**, and **an authorized main-site preview/build environment for analytics delivery and project readback**. The existing PostHog public token/host were found and prepared locally in Phase 12; they are not yet verified as deployment configuration. Recommend owner review of the copy and reuse of that project. The user explicitly chose default-off opt-in. Keep the deployment/readback gate incomplete until verified.

No blocking product questions were found. API deployment parity, source review and calculator-artifact validation are engineering checks to resolve during implementation, not decisions to push back to the user.
