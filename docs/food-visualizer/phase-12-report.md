# Phase 12 — analytics

Date: 2026-10-23 (Asia/Manila). **Engineering delivered; overall gate: PARTIAL.** Local event/privacy checks pass and the existing PostHog capture endpoint acknowledged all five verification event types. A deployed main-site build and project-side event readback have not been verified. No main-site preview URL was supplied during this phase; no deployment was changed.

## Implemented behavior

The user explicitly chose **analytics off by default with an opt-in control**, matching the existing app's opt-in approach. The visualizer now has a small Usage analytics control when valid configuration and a public HTTPS origin permit capture. Browser Do Not Track or Global Privacy Control keeps capture off. Localhost/local/IP origins, HTTP, SSR and missing/invalid configuration do not initialize the transport.

Only the on/off preference (`jn_visualizer_analytics`) is persisted in this browser. A cryptographically random visit identifier stays in memory, is not shared with the app's account identity, and changes on a new page visit. The adapter does not use cookies or save identifiers, search history, portions or event queues to browser storage. Withdrawal cancels pending initialization/requests; other open pages can receive the preference change through the storage event. Earlier actions are not replayed after opt-in.

The [Vue composable](../../src/composables/useVisualizerAnalytics.js) uses an isolated [event adapter](../../src/features/food-visualizer/analytics.js) and lazy [Capture API transport](../../src/features/food-visualizer/posthogCapture.js). No analytics SDK dependency, autocapture, session recording, automatic pageview/error capture or feature-flag client is loaded. This keeps payload construction explicit and avoids collecting SDK URL/referrer/device properties by default.

Requests omit credentials and referrers, reject redirects, have a five-second timeout and do not retry automatically. Pending work is bounded. Analytics promises are not awaited by the UI and failures are contained; search, portion calculations and app links remain usable. No shared calculator or food API behavior changed.

The transport follows PostHog's [public Capture API](https://posthog.com/docs/api/capture), using its public project token, a visit UUID and `$process_person_profile: false`. It also sends `$geoip_disable: true`, which PostHog documents as the [GeoIP enrichment skip flag](https://github.com/PostHog/posthog-plugin-geoip). These are fixed processing controls, not arbitrary caller-supplied properties. Ordinary request network information still reaches the provider; the privacy copy does not claim that individual event records are fully anonymous.

## Event contract and commit points

Every event has `surface: food_visualizer` and `feature_version: food-visualizer-1`. Unknown properties are discarded rather than copied from a caller or API record.

| Event | Commit point | Additional allowlisted properties |
| --- | --- | --- |
| `food_visualizer_opened` | First permitted opt-in/restored preference in a page visit; once for that visit | None |
| `food_visualizer_food_selected` | Latest successful public food-detail selection, after portion/context defaults resolve | `food_id`, bounded `source`, `lens`, `selection_origin`; supported portion fields if present |
| `food_visualizer_portion_changed` | Accepted quantity Enter/blur, serving change or stepper action, when the committed portion changes | `food_id`, `source`, `lens`, `serving_option_id`, `unit`, numeric `quantity` |
| `food_visualizer_lens_changed` | Explicit manual/suggested action that changes the active lens | `food_id`, `source`, `lens` |
| `food_visualizer_outbound_clicked` | Primary/keyboard or middle activation of a feature outbound link | `food_id`, `source`, `lens`, `destination_type` |

Sources are limited to `ph_fct`, `usda_fdc`, `nutrition_label`, `community_recipe`, `openfoodfacts`, or the fixed fallback `unknown`. Lenses are the four implemented IDs. Selection origin is `search` or `example`. Destination type is `food_details`, `comparison`, `source_report`, `source_label` or `source_recipe`; the URL itself is never captured. Units are bounded to supported `g`, `mL`, `serving` or `piece`; unknown portion evidence is omitted rather than invented. Explicitly private foods are rejected.

Quantity input still updates the calculator immediately, but typing does not emit events. Enter followed by blur is deduplicated, as are repeated handlers for the same lens. Internal portion fingerprints include the selected basis, so a recorded 100-g basis and a direct 1-g entry do not get mistaken for the same action. Invalid quantities retain the last valid display without emitting a portion event. Failed/stale food requests, rice-reference reads, automatic suggested-lens changes during food selection, reactive rerenders and already-active lens choices do not emit extra events.

Food names/slugs, raw queries, full URLs, nutrient values/payloads, recipe contents/authors, emails, account identity, health data and personal food logs are excluded. A public food selection may still reveal an explored catalog item and portion setting; the opt-in wording discloses that clearly.

## Configuration and privacy copy

- Added [.env.example](../../.env.example) with `VITE_POSTHOG_PROJECT_TOKEN` and `VITE_POSTHOG_HOST`. Only a public `phc_…` project token is accepted, not a personal/secret API key.
- Found a configured public token and `https://us.i.posthog.com` in the sibling app. Reused them in an ignored local `.env.local`, without printing or committing the token. `.gitignore` now protects environment files while permitting the example.
- A build using those public values succeeds. This prepares local configuration; it does **not** configure Cloudflare or another deployment environment. Set the same public values in the authorized main-site build environment and rebuild there.
- Updated [privacy wording](../../src/pages/privacy.vue) to name the conditional Food Visualizer PostHog integration, explain opt-in/withdrawal, preference versus identifier storage, event fields, absent replay/autocapture and ordinary network metadata. This is a local policy-copy update; no published policy deployment is claimed.

## Validation actually run

**93 Node tests pass**: 82 existing cases and 11 [analytics cases](../../tests/food-visualizer/analytics.test.mjs), covering public configuration/origin gates, property projection, opt-in/no replay, lazy initialization, portion deduplication and basis changes, unsupported portions/private records, revocation races, initialization/capture failures, bounded outbound categories, anonymous transport fields, credentials/referrer omission, timeout and abort without retries.

**Built-browser checks pass in six scenarios**, with zero page runtime errors. [Evidence](phase-12-browser-evidence.json) was generated by the [browser check](../../tests/food-visualizer/analytics-browser-check.mjs) using built static assets at an intercepted HTTPS origin, captured foods and intercepted PostHog traffic:

- Configured opt-in: no pre-consent events/transport load; no replay of earlier selection; exactly committed events; no raw search or URL data; no stale/failed selection event; primary, keyboard and middle outbound wiring; withdrawal; preference restoration; changed visit identity on reload; no cookies or persistent analytics ID.
- Localhost, absent configuration, Do Not Track and Global Privacy Control: zero events/transport initialization while the calculator remains usable.
- Failed analytics network requests: calculator still works and no page runtime error is raised.
- The preference panel has zero scoped axe violations. Its 390-pixel screenshot was inspected at `/private/tmp/jn-phase12/preference-mobile.png`.

**Offline static build passes: 21 pages**, with `fetch` disabled and the configured public project values. The transport is a separate lazy client chunk. Existing core/fixture integrity is covered by the passing suite. `git diff --check` passes for tracked changes.

## Real endpoint verification and its limit

The explicit [endpoint verification script](../../scripts/verify-food-visualizer-analytics.mjs) sent five labelled verification events to the existing project's US capture host. [Recorded evidence](phase-12-capture-evidence.json) shows HTTP 200 with `status: Ok` for all five event types, with no token recorded and person profiles disabled. The verification visit starts with `phase12-verification-` so these synthetic QA actions can be identified in project queries. It uses public rice ID 78 / canonical serving 206 as context, not a personal food log or invented catalog food.

The first sandbox attempt had no response; the approved network retry reached the host. One earlier response-format probe also received HTTP 200 for an opened event before the final five-event run. There is no application retry loop.

This is a **local Node capture-endpoint test**, not evidence of a deployed browser origin, real browser CORS delivery, or project query visibility. PostHog's [capture documentation](https://posthog.com/docs/api/capture) notes that some invalid events can receive HTTP 200 without ingestion. The local browser tests used interceptions and do not close that gap. Target-environment delivery/readback remains a required gate.

## Reproduction and remaining gate

Use Node 22, the existing Playwright installation, and the temporary axe-core installation described in Phase 11:

```sh
npm run test:food-visualizer
NODE_OPTIONS="--import=./tests/food-visualizer/disable-fetch.mjs" npm run build
node tests/food-visualizer/analytics-browser-check.mjs
```

The browser test defaults to the sibling app's Playwright and `/private/tmp/jn-phase11-a11y/node_modules/axe-core/axe.min.js`; PostHog is intercepted. It requires a build with public project configuration. It does not send telemetry to a real project.

The separate live smoke check is intentionally explicit and never runs during a build:

```sh
node scripts/verify-food-visualizer-analytics.mjs --send --env-file=.env.local --output=/private/tmp/jn-phase12-capture-evidence.json
```

To clear Phase 12's exit gate, use an authorized preview/main-site build with these public environment values, exercise opt-in and all five actions there, and confirm those events in the target project's event view/query. Do not provide personal/secret credentials in a report or chat. No preview URL was supplied; the earlier request for one remains unanswered. No production promotion, Phase 13 discovery work or deployment configuration change was performed. Source/serving review, educational-copy sign-off and the existing app handoff limitation also remain as previously recorded.
