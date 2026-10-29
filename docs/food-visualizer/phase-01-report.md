# Phase 1 report — runtime contracts and evidence fixtures

Date: 2026-10-23 (Asia/Manila). **Gate: FAIL — required original-source review incomplete.** Phase 1 evidence capture is delivered; it is not marked fully complete. No later implementation phase was started.

Recommended execution: GPT-6.1 Sol / High. Actual exact model identifier/reasoning setting was not independently observable through the tools used; no claim that the session was switched to that recommendation is made.

## Scope and changed files

- Added [observed public contract](public-data-contract.md).
- Added [fixture manifest](../../tests/food-visualizer/fixtures/manifest.json), 14 sanitized captured response/evidence files, one explicitly synthetic 429 fixture and [fixture notes](../../tests/food-visualizer/fixtures/README.md).
- Added `scripts/capture-food-visualizer-fixtures.py` for allowlisted offline projection and `scripts/check-food-visualizer-fixtures.py` for evidence checks.
- Updated the implementation plan/current-status notes and appended the Phase 0 correction concerning metadata and serving-profile availability.
- No application feature, server code, database record or deployment configuration was changed. Public search may have ordinary server-side telemetry effects; no catalog mutations were requested.

## Evidence and findings

14 low-volume, anonymous public requests covered seven representative food/recipe payloads, a repeated rice read, successful and empty searches, missing-food JSON, preflight, the deployed app's public API base and the official rice report. Raw downloads stay in `/private/tmp`; checked-in fixtures exclude user/author identifiers, raw import payloads, analytics tokens and server exception details.

The production API origin matches configuration: `https://api.juanutrisyon.info/api`. GET responses allow the main-site Origin without credentials; OPTIONS returns 204. Sampled responses declare private/no-cache and Cloudflare DYNAMIC. Rate-limit headers declare 60; no real 429 was induced and no complete edge/rate-limit configuration was audited.

Corrections to Phase 0:

1. Source metadata is **already exposed** through `RecipeIngredientGraph::expand()`, including Philippine source links and nested foods. The initial audit missed this path.
2. Canonical serving IDs/default/provenance are **already exposed** through `serving_profile.options`. Rice canonical option 206 maps to legacy ID 168. New legacy fields are not currently necessary for the visualizer.

Other findings:

- Rice 78/A020 and documented JN ½ cup/80 g are confirmed live; source carbs are 29.7 g/100 g. Snapshot arithmetic gives 23.76 g per reference, pending actual shared-core parity.
- `kanin` search returns no results, while `rice` returns 528. Do not fabricate synonym support; use verified-ID quick suggestions.
- Chicken-adobo ingredient 1884 has omitted nutrients, supplying a real incomplete-recipe input without author identifiers.
- Product label URLs for Coke and gata point to localhost. No label review was claimed.
- Missing-food 404 includes server debug details. Only its message is retained in evidence; the client must show generic status-based errors. Backend hardening remains a separate finding.

## Checks actually run

`python3 scripts/capture-food-visualizer-fixtures.py /private/tmp` — PASS: generated 14 sanitized captures and one explicitly synthetic transport fixture.

`python3 scripts/check-food-visualizer-fixtures.py` — PASS: seven offline checks covering hashes/origins, privacy/debug-field exclusion, canonical versus legacy serving identity, rice snapshot arithmetic, preserved volume/missing data, incomplete recipe evidence, search envelopes and explicit transport/source limitations.

These checks validate the evidence fixture set. They do not verify the existing calculator, browser CORS execution, Food Details selected-portion parity, accessibility, label accuracy or release readiness. No app build was needed because this phase changes only documents and evidence tooling/fixtures.

## Remaining issues and next allowed action

The FNRI rice report returned HTTP 503. Its contents could not be independently checked, so the required source-review gate remains FAIL. Coke/gata source-label review also awaits usable published URLs. Pandesal/mango/patis report-content reviews remain pending; their identities/servings and links are captured, but they are not promoted as verified examples.

Next action: resume Phase 1 source review once evidence becomes available, updating the manifest/report rather than inventing or silently substituting evidence. Phase 2 should validate existing metadata/default-serving behavior and implement only proven gaps. Advancing to later feature implementation as though Phase 1 passed is not authorized by this gate.
