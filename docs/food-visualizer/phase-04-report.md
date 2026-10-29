# Phase 4 — public page, API client and food selection

Date: 2026-10-23 (Asia/Manila). **Gate: PASS for Phase 4.** The user explicitly authorized this phase after the Phase 3 report. Phase 1 original-source/label review remains unresolved. Those limits still gate featured examples and release; this phase does not waive them.

## Delivered

- Direct route `/tools/food-visualizer`, with statically rendered heading, introduction, four nutrient explanations and nonnumeric food examples. Uses the current site shell/tokens; no homepage, navigation or sitemap promotion.
- Committed search by button/Enter; typing does not fetch. Backend ranking and pagination are preserved. Search ideas submit generic queries, rather than promoting unreviewed catalog records as featured foods.
- Exact selected-food preview with food name, brand when supplied, source type and recorded numeric source basis. Change food clears selection and returns keyboard focus to search. No inferred package sizes, images, serving conversions or nutrient values.
- Anonymous GET boundary using `credentials: omit`, no API secret, and the verified public `/api` base. Full detail/recipe/source/import data is preserved and deeply frozen, separate from selection state.
- In-memory search cache: 5 minutes / 20 pages. Detail cache: 15 minutes / 30 foods. LRU eviction; in-flight deduplication; independently cancellable subscribers; transport abort when no subscribers remain; generation checks reject stale results even when transport ignores cancellation.
- Loading, empty, malformed-response, missing-food, network/server and rate-limit states. Raw server bodies are never displayed. Readable Retry-After seconds/dates block requests until the deadline. Unexposed/malformed headers permit manual retry; no automatic loop.

Files: [page](../../src/pages/food-visualizer.vue), [API client](../../src/features/food-visualizer/foodApi.js), [selection state](../../src/features/food-visualizer/selection.js), [unit tests](../../tests/food-visualizer/selection.test.mjs), [browser checks](../../tests/food-visualizer/browser-check.mjs).

## Verification

**21 Node tests passed**: 14 new API/selection tests plus the seven existing artifact checks. These cover request encoding/ranking, page-aware normalized cache keys, TTL/limits, cancellation/deduplication, ignored-abort races, full captured recipe preservation, identity mismatch, errors/retries, rate limits and selection disposal. No new dependencies were installed.

```sh
npm run test:food-visualizer
```

**Production SSG build passed with global fetch disabled**, generating 21 pages including `dist/tools/food-visualizer.html`. The generated HTML contains the heading, all four explanations and the canonical URL. A reusable preload is included for repeating this check (run with Node 22):

```sh
NODE_OPTIONS="--import=./tests/food-visualizer/disable-fetch.mjs" npm run build
```

This blocks accidental fetch-based API calls during generation. There are no API calls on component setup/mount, no browser globals used during SSR, and no API data needed to render the shell. This check is not an operating-system-wide network isolation claim.

**Chromium browser checks passed at desktop 1280×1000 and mobile 360×800**, using six intercepted requests with captured public food records and synthetic pagination/errors. Verified: no initial/typing request, submit, exact selection/source basis, change-food focus, cached reselection, real pagination controls, empty search, generic server error, readable rate-limit countdown, no horizontal overflow and zero page runtime errors. Desktop/mobile screenshots were inspected at `/private/tmp/jn-phase4-desktop.png` and `/private/tmp/jn-phase4-mobile.png`.

The first browser rate-limit assertion expected a readable header without exposing it through CORS. The browser correctly hid it. The mocked response was corrected to expose Retry-After explicitly for the countdown case; unit tests separately cover unexposed fallback. Product code was not loosened.

Run against a local server using an existing Playwright installation:

```sh
npm run dev -- --host 127.0.0.1 --port 4327
# In a second terminal; adjust the explicit tool path for your environment:
JN_PLAYWRIGHT_PATH=/Users/wernancheta/projects/juanutrisyon/nuxt-juanutrisyon/node_modules/playwright/index.mjs node tests/food-visualizer/browser-check.mjs
```

The external path is test tooling only. The application/build does not import or require the sibling app. Default browser tests mock all food API requests. `JN_VISUALIZER_URL` can target another local preview.

**One separate live anonymous browser search and detail selection passed**, selecting the returned catalog entry named “Rice”. This used two real public requests and confirmed browser CORS and current search/detail integration. Opt-in repeat: set `JN_VISUALIZER_LIVE=1` on the browser command. No label/source review or catalog correction is claimed from those reads.

Sandbox restrictions required approval to listen on localhost and launch Chromium; both then succeeded. No production API/server changes or deployments were made.

## Scope remaining

This phase stops at selection and educational shell content. Phase 5 adds portions and the canonical nutrient summary using the Phase 3 artifact; four equivalence visuals follow in Phases 6–9. The current page performs no nutrient calculation. The recorded source basis is not a chosen household portion.

Source-review issues remain: unavailable FNRI report, localhost product-label URLs and duplicate carbohydrate parents invalidating the captured Coke sugar result. No featured-food selection shortcuts or verified-source claims were added. Full accessibility testing, Food Details numerical comparison, discovery and release checks remain in their planned phases.
