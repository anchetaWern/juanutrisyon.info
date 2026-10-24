# Phase 13 — SEO, discovery and deployment behavior

Date: 2026-10-23 (Asia/Manila). **Engineering delivered; overall gate: PARTIAL.** Local built-page, discovery, negotiation and browser checks pass. Actual anonymous cross-origin API reads also pass. The existing production URL still returns the homepage, and no preview deployment of this implementation was supplied or created. No deployment, promotion, food API change or sibling-repository edit was performed.

## Release changes prepared locally

- Added a homepage Food Visualizer section with a descriptive internal link, clear free/no-sign-in wording, an underlined action and a visible keyboard focus outline.
- Added Food Visualizer to shared navigation and added its query-free main-domain URL once to `public/sitemap-2026.xml`, with a 2026-10-23 modification date. Existing robots rules allow the route and advertise that sitemap.
- Updated existing discovery surfaces together: browser WebMCP's `open_site_page` and summary; the Pages function's `/api/discovery`, public API documentation, MCP overview/page list/discovery result; and an educational navigation skill in the existing agent-skills index. The skill's served body and SHA-256 digest agree. These resources link to the tool; they do not add a nutrient-calculation API.
- Fixed the Pages function's HTML/Markdown response helpers: an extra argument previously prevented `varyAccept` from reaching `decorateResponse`. Both representations now emit `Vary: Accept`. Negotiation respects explicit `q=0` rejection and a stronger HTML preference, including `/docs/api`.
- Screenshot review found the Search label wrapping at desktop width. Kept that button from shrinking or wrapping. This is a layout correction; nutrient calculations and API behavior are unchanged.

The homepage, navigation, sitemap and machine-readable additions form one local release change. They have not been published ahead of the outstanding feature gates.

## Metadata and crawlable content

The existing route metadata was retained and verified in generated HTML:

- Title: `Food Visualizer — Ano’ng Nasa Pagkain Ko? | Juan Nutrisyon`.
- Description: `Explore Filipino foods and learn about total sugar, sodium, saturated fat and carbohydrates. Search the Juan Nutrisyon food catalog without an account.`
- Exactly one canonical: `https://juanutrisyon.info/tools/food-visualizer`, matching `og:url`, the sitemap and internal discovery paths. Arbitrary query parameters do not alter this canonical or preselect a food/lens.
- Document language `en`, Filipino heading language `fil`, one page title/description/H1, and no generated `noindex` directive.
- The heading, introduction, search ideas, all four nutrient explanations, missing-data qualification, methodology link and JavaScript-disabled explanation exist in static HTML. Food selection and numerical results require JavaScript. No candidate was promoted to a reviewed example for SEO.

Using a consistent canonical and sitemap URL follows Google's [canonicalization guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls). These checks establish crawlable local content and consistent signals; they do not establish that a search engine has indexed the feature.

## Validation actually run

| Check | Result and evidence boundary |
| --- | --- |
| Node suite | **99 pass**: 93 existing cases plus six discovery/Pages-function cases. Covers discovery/MCP links, skill content digest, preserved HTML/status, Markdown conversion/absolute links, variation headers and Accept preferences. |
| Offline SSG build | **21 pages pass**, with `globalThis.fetch` disabled by the existing preload. No food API read is needed to generate the tool. |
| Built browser routing | Homepage entry, direct nested route, trailing slash, arbitrary query and refresh return the feature in a local HTTP harness. JavaScript-disabled checks verify static copy and exactly one main-domain canonical. |
| Machine-readable integration | Node tests exercise the imported Pages `onRequest`; browser checks invoke the WebMCP `open_site_page` entry and reach the tool. Sitemap/robots and generated HTML/Markdown are checked from built assets. |
| Responsive/keyboard | Homepage and tool navigation fit 360, 390, 768 and 1280 CSS pixels, without horizontal overflow; the new navigation link accepts keyboard focus. Search remains on one line. |
| Scoped accessibility | Four axe 4.10.3 audits: new homepage card and tool navigation at 390/1280px, **zero violations**. Navigation gradient flags are explicitly reviewed rather than counted as automatic passes. Actual flagged foreground `#526175` against the same conservative `#f5fbed` gradient bound used in Phase 11 gives **5.98:1**, above 4.5:1. All 14 flagged node/viewport instances are recorded. |
| Rate-limit UX | A **synthetic** 429 without readable `Retry-After` displays the wait message and an enabled manual retry. There is no automatic retry loop. No production throttling was deliberately induced. |
| Tracked whitespace check | `git diff --check` passes. |

The [browser evidence](phase-13-browser-evidence.json) records test time, environment, artifact/function hashes, nine check groups, contrast review and sanitized live observations. Local `passed: true` describes the exercised checks; the overall phase gate remains partial. Screenshots under `/private/tmp/jn-phase13` include homepage/tool at 390/1280px and the cropped homepage card. The mobile card and desktop tool were visually inspected after the final build.

The local harness imports `functions/[[path]].js` and supplies built assets through `context.next()`. Cloudflare documents that fallback mechanism in its [Pages Functions API reference](https://developers.cloudflare.com/pages/functions/api-reference/). This harness is **not** Wrangler/workerd or a deployed Cloudflare environment; it does not prove Pages routing, edge caching, redirects, preview indexing headers or deployed bindings.

## Fresh deployed observations

Final browser run: **2026-10-23 14:08:46 UTC** (22:08:46 Asia/Manila). The deployment commit/version was not exposed or established. Local repository baseline is `4907fe1eb619dea4bcadf1600ba561a66cfd69b1` with the existing uncommitted implementation; the evidence's SHA-256 values identify the built tool HTML, homepage HTML and Pages function actually checked.

### Existing public main site

Read `https://juanutrisyon.info/tools/food-visualizer` with HTML and Markdown Accept headers:

- Both return **200 with homepage content**, titled `Nutrition tools for Filipino food | Juan Nutrisyon`, without the visualizer heading. A successful status alone does not establish that the feature route is deployed.
- HTML is `text/html`, `Cache-Control: public, max-age=0, must-revalidate`, Cloudflare `DYNAMIC`, and varies by Accept.
- Markdown is `text/markdown` and Cloudflare `DYNAMIC`, but its observed Vary only names `accept-encoding`. The local Accept-variation fix has not been deployed.
- Live `/api/discovery` returns 200 and **does not list** `food-visualizer`.

### Actual cross-origin food API

Chromium loaded the **local built assets intercepted at `https://juanutrisyon.info`** and then made real, unintercepted requests to `https://api.juanutrisyon.info`. This verifies browser CORS from the intended origin, not deployment of the feature itself.

- Anonymous rice search and rice detail both return **200**, with Origin `https://juanutrisyon.info` and no Cookie or Authorization header. The loaded record is `Rice, well-milled, boiled`.
- The two UI reads report `Access-Control-Allow-Origin: *`, `Cache-Control: no-cache, private`, Cloudflare `DYNAMIC` and `X-RateLimit-Limit: 60`. Remaining-count headers are sample observations, not evidence of sustained capacity or a definitive effective limit across the deployed middleware stack.
- Repeating the committed search and changing quantity/lenses adds **zero API reads** during the check. The adapter's in-memory cache supplies the repeated search.
- A third, explicit browser header probe repeats the detail GET. It is recorded separately from the UI interaction count; it also returns 200. Browser-visible `cache-control` is available, but `Retry-After` and `Access-Control-Expose-Headers` are null on that successful response. No actual 429 response or deployed exposure of its retry header is claimed.
- Analytics remained off. No capture event was sent by this phase's browser check.

## Reproduction and remaining release gate

Use Node 22. The browser script defaults to the existing sibling app's Playwright installation; `JN_PLAYWRIGHT_PATH` can override it. `JN_AXE_PATH` enables the four scoped accessibility audits and points to the temporary axe installation used in Phase 11; no dependency was added to this project.

```sh
npm run test:food-visualizer
NODE_OPTIONS="--import=./tests/food-visualizer/disable-fetch.mjs" npm run build
JN_AXE_PATH=/private/tmp/jn-phase11-a11y/node_modules/axe-core/axe.min.js node tests/food-visualizer/discovery-browser-check.mjs --live
git diff --check
```

Without `--live`, the script skips public site/API probes. It always starts and closes its own local built-site harness. The JSON evidence file is replaced by each successful run; preserve the recorded live evidence if running a local-only check later.

To close Phase 13, test an authorized preview deployment containing **both `dist` and the Pages function**, record its deployment ID/commit, and repeat direct navigation/refresh, query-free canonical, HTML/Markdown variation, discovery and actual browser API checks there. Verify the preview's intended indexing policy and production's indexability separately. An unavailable route must not be accepted merely because a homepage fallback returns 200.

Production promotion still requires the previously recorded original-source/household-serving review and named educational-copy sign-off. Phase 12 target-deployment analytics delivery/project-side readback remains incomplete. The existing app comparison-mode handoff limitation also remains recorded. No production release or Phase 14 work was performed.
