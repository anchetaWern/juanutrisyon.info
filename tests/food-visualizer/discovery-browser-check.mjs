// Built SSG + Pages function in a Node HTTP harness, not a Cloudflare deployment.
// --live additionally reads the published site and real API, without sending analytics.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { onRequest } from '../../functions/[[path]].js'
const { chromium } = await import(pathToFileURL(process.env.JN_PLAYWRIGHT_PATH ?? '/Users/wernancheta/projects/juanutrisyon/nuxt-juanutrisyon/node_modules/playwright/index.mjs').href)
const routePath = '/tools/food-visualizer', canonical = 'https://juanutrisyon.info' + routePath
const output = '/private/tmp/jn-phase13'
await mkdir(output, { recursive: true })
const html = await readFile(new URL('../../dist/tools/food-visualizer.html', import.meta.url), 'utf8')
const evidence = { testedAt: new Date().toISOString(), localEnvironment: 'Node HTTP harness: built Vite SSG assets + imported Pages onRequest; not deployed Cloudflare runtime', artifactSha256: createHash('sha256').update(html).digest('hex'), checks: [], errors: [] }
evidence.homeHtmlSha256 = createHash('sha256').update(await readFile(new URL('../../dist/index.html', import.meta.url))).digest('hex')
evidence.pagesFunctionSha256 = createHash('sha256').update(await readFile(new URL('../../functions/[[path]].js', import.meta.url))).digest('hex')
async function asset(pathname) {
  if (pathname.includes('..')) return new Response('Not found', { status: 404 })
  const path = pathname === '/' ? '/index.html' : pathname.endsWith('/') ? pathname.slice(0, -1) + '.html' : /\.[a-z\d]+$/i.test(pathname) ? pathname : pathname + '.html'
  try {
    const body = await readFile(new URL('../../dist' + path, import.meta.url))
    const ext = path.split('.').at(-1)
    const type = { html: 'text/html', js: 'text/javascript', css: 'text/css', xml: 'application/xml', txt: 'text/plain', png: 'image/png', ico: 'image/x-icon' }[ext] ?? 'application/octet-stream'
    return new Response(body, { headers: { 'Content-Type': type + (['html', 'js', 'css'].includes(ext) ? '; charset=utf-8' : '') } })
  } catch { return new Response('Not found', { status: 404 }) }
}
const server = createServer(async (req, res) => {
  try {
    const request = new Request('http://127.0.0.1:' + server.address().port + req.url, { headers: req.headers })
    const response = await onRequest({ request, next: () => asset(new URL(request.url).pathname) })
    res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(Buffer.from(await response.arrayBuffer()))
  } catch (error) { res.writeHead(500); res.end(String(error)); evidence.errors.push(String(error)) }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const base = 'http://127.0.0.1:' + server.address().port
const browser = await chromium.launch({ headless: true })
const record = label => evidence.checks.push(label)
const headersOf = response => Object.fromEntries(['content-type', 'cache-control', 'cf-cache-status', 'vary', 'access-control-allow-origin', 'access-control-expose-headers', 'retry-after', 'x-ratelimit-limit', 'x-ratelimit-remaining', 'etag', 'last-modified', 'x-robots-tag'].map(key => [key, response.headers.get(key)]).filter(([, value]) => value !== null))
try {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  await context.route('https://api.juanutrisyon.info/**', route => route.abort())
  const page = await context.newPage()
  let apiRequests = 0
  page.on('request', req => { if (req.url().includes('api.juanutrisyon.info') && ['fetch', 'xhr'].includes(req.resourceType())) apiRequests++ })
  await page.goto(base + '/')
  await page.getByRole('link', { name: 'Try the Food Visualizer', exact: true }).click()
  assert.equal(new URL(page.url()).pathname, routePath)
  await page.getByRole('heading', { name: 'Ano’ng Nasa Pagkain Ko?', exact: true }).waitFor()
  assert.equal(await page.locator('html').getAttribute('lang'), 'en')
  assert.equal(await page.locator('h1').getAttribute('lang'), 'fil')
  const copy = await page.locator('main').innerText()
  for (const term of ['Total sugar', 'Sodium', 'Saturated fat', 'Carbohydrates', 'Enable JavaScript']) assert(copy.includes(term), term)
  for (const suffix of ['', '?food=ignored&lens=sodium&utm_source=phase13', '/']) {
    const response = await page.goto(base + routePath + suffix)
    assert.equal(response.status(), 200)
    await page.reload()
    assert.equal(await page.locator('link[rel=canonical]').count(), 1)
    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), canonical)
    assert.equal(await page.locator('meta[name=description]').count(), 1)
    assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'), canonical)
    assert.equal(await page.locator('title').count(), 1)
    assert.match(await page.title(), /^Food Visualizer/)
    assert.equal(await page.locator('h1').count(), 1)
    assert.equal(await page.locator('meta[name=robots][content*=noindex]').count(), 0)
    await page.getByText('Enter a food name to explore the catalog.', { exact: true }).waitFor()
  }
  assert.equal(apiRequests, 0)
  record('JavaScript-disabled homepage entry, direct nested route, query, trailing slash and refresh: 200, static copy, empty selection, one query-free main-domain canonical; no API reads')
  const sitemap = await (await fetch(base + '/sitemap-2026.xml')).text()
  assert.equal(sitemap.split('<loc>' + canonical + '</loc>').length - 1, 1)
  const robots = await (await fetch(base + '/robots.txt')).text()
  assert(robots.includes('Sitemap: https://juanutrisyon.info/sitemap-2026.xml'))
  assert(!/Disallow:\s*(?:\/tools|\/$)/m.test(robots))
  for (const accept of ['text/html', 'text/markdown']) {
    const response = await fetch(base + routePath + '?utm_source=qa', { headers: { Accept: accept } })
    assert.equal(response.status, 200); assert(response.headers.get('vary').includes('Accept'))
    const body = await response.text()
    assert(body.includes('Ano’ng Nasa Pagkain Ko?')); assert(!body.includes('PRIVATE_SCRIPT'))
    if (accept === 'text/markdown') { assert(body.includes('# Ano’ng Nasa Pagkain Ko?')); assert(!body.includes('<script')) }
  }
  record('Built sitemap/robots and Pages function HTML/Markdown negotiation pass locally; Accept variation present on both representations')
  await context.close()

  const interactive = await browser.newContext()
  const active = await interactive.newPage()
  active.on('pageerror', error => evidence.errors.push(error.message))
  let calls = 0
  await active.route('https://api.juanutrisyon.info/**', route => {
    if (!['fetch', 'xhr'].includes(route.request().resourceType())) return route.abort()
    calls++; return route.fulfill({ status: 429, json: { message: 'synthetic test response' } })
  })
  await active.addInitScript(() => Object.defineProperty(navigator, 'modelContext', { value: { provideContext: value => { window.qaWebMcp = value } }, configurable: true }))
  await active.goto(base + '/')
  await active.waitForFunction(() => window.qaWebMcp?.tools)
  assert((await active.evaluate(() => window.qaWebMcp.tools.find(tool => tool.name === 'open_site_page').inputSchema.properties.slug.description)).includes('food-visualizer'))
  await active.evaluate(() => window.qaWebMcp.tools.find(tool => tool.name === 'open_site_page').execute({ slug: 'food-visualizer' }))
  await active.waitForURL(base + routePath)
  await active.getByLabel('Food name', { exact: true }).fill('synthetic rate limit')
  await active.getByLabel('Food name', { exact: true }).press('Enter')
  await active.getByRole('alert').filter({ hasText: 'Too many requests' }).waitFor()
  const retry = active.getByRole('button', { name: 'Try search again', exact: true })
  assert(await retry.isEnabled()); assert.equal(calls, 1)
  await active.waitForTimeout(1100); assert.equal(calls, 1, 'No automatic retry')
  await retry.click(); await active.getByRole('alert').filter({ hasText: 'Too many requests' }).waitFor(); assert.equal(calls, 2)
  record('Browser WebMCP entry navigates to nested route; synthetic 429 without readable Retry-After shows manual retry and no automatic request loop')
  for (const width of [360, 390, 768, 1280]) {
    await active.setViewportSize({ width, height: 900 })
    for (const pathname of ['/', routePath]) {
      await active.goto(base + pathname)
      const link = active.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Food Visualizer', exact: true })
      await link.focus(); assert(await link.evaluate(el => el === document.activeElement))
      assert(await active.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      if (pathname === routePath) {
        const dimensions = await active.getByRole('button', { name: 'Search', exact: true }).evaluate(el => ({ height: el.getBoundingClientRect().height, lineHeight: parseFloat(getComputedStyle(el).lineHeight) }))
        assert(dimensions.height < 2 * dimensions.lineHeight + 24, 'Search label stays on one line')
      }
      if (width === 390 || width === 1280) await active.screenshot({ path: `${output}/${pathname === '/' ? 'home' : 'tool'}-${width}.png`, fullPage: true })
      if (pathname === '/' && width === 390) await active.locator('.visualizer-intro').screenshot({ path: `${output}/home-card-390.png` })
      if (process.env.JN_AXE_PATH && [390, 1280].includes(width)) {
        await active.addScriptTag({ path: process.env.JN_AXE_PATH })
        const selector = pathname === '/' ? '.visualizer-intro' : '.header-nav'
        const result = await active.evaluate(async selector => {
          const result = await window.axe.run({ include: [selector] }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })
          return { violations: result.violations.map(item => item.id), incomplete: result.incomplete.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, reason: node.failureSummary })) })) }
        }, selector)
        assert.deepEqual(result.violations, [], selector + ' axe violations')
        for (const rule of result.incomplete) {
          assert.equal(rule.id, 'color-contrast', 'Unreviewed manual-check rule')
          for (const node of rule.nodes) {
            assert(node.reason.includes('background gradient'), 'Unreviewed contrast reason: ' + node.reason)
            const colors = await active.locator(node.target[0]).evaluate(el => ({ foreground: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor }))
            const rgb = value => value.match(/[\d.]+/g).map(Number)
            const fg = rgb(colors.foreground), bg = rgb(colors.background)
            // Same conservative #eef8df-at-55%-over-white gradient bound as Phase 11.
            const backdrop = bg.length === 3 || bg[3] === 1 ? bg.slice(0, 3) : [245, 251, 237]
            const luminance = channels => channels.slice(0, 3).map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0)
            const a = luminance(fg), b = luminance(backdrop), ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05)
            assert(ratio >= 4.5, 'Flagged navigation text contrast: ' + ratio)
            ;(evidence.manualContrastReview ??= []).push({ selector: node.target[0], width, ...colors, reviewedBackdrop: backdrop, ratio })
          }
        }
        record(`Scoped axe audit: ${selector}, ${width}px, zero violations; ${result.incomplete.length} gradient-rule flags explicitly contrast-checked`)
      }
    }
  }
  record('Homepage and tool navigation fit 360/390/768/1280px, with keyboard-focusable Food Visualizer link')
  await interactive.close()

  if (process.argv.includes('--live')) {
    evidence.live = { environment: 'Existing public main-site deployment, version unknown; local feature not deployed', site: [] }
    for (const accept of ['text/html', 'text/markdown']) {
      const response = await fetch(canonical, { headers: { Accept: accept }, signal: AbortSignal.timeout(45000) })
      const body = await response.text()
      evidence.live.site.push({ accept, status: response.status, url: response.url, headers: headersOf(response), bodySha256: createHash('sha256').update(body).digest('hex'), title: body.match(/<title>(.*?)<\/title>/)?.[1] ?? body.match(/^title: (.+)$/m)?.[1], visualizerHeading: body.includes('Ano’ng Nasa Pagkain Ko?') })
    }
    const discovery = await fetch('https://juanutrisyon.info/api/discovery', { signal: AbortSignal.timeout(45000) })
    const data = await discovery.json()
    evidence.live.discovery = { status: discovery.status, visualizerListed: data.tools?.some(tool => tool.name === 'food-visualizer') ?? false }
    // Only local built assets are intercepted. API responses below are real network reads.
    const liveContext = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await liveContext.route('https://juanutrisyon.info/**', async route => {
      const response = await asset(new URL(route.request().url()).pathname)
      await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: Buffer.from(await response.arrayBuffer()) })
    })
    const livePage = await liveContext.newPage(), responses = [], credentials = []
    livePage.on('pageerror', error => evidence.errors.push(error.message))
    livePage.on('request', request => { if (request.url().startsWith('https://api.juanutrisyon.info/')) credentials.push({ method: request.method(), origin: request.headers().origin ?? null, cookiePresent: Boolean(request.headers().cookie), authorizationPresent: Boolean(request.headers().authorization) }) })
    livePage.on('response', response => { if (response.url().startsWith('https://api.juanutrisyon.info/')) responses.push({ url: response.url(), status: response.status(), headers: Object.fromEntries(Object.entries(response.headers()).filter(([key]) => ['cache-control', 'cf-cache-status', 'access-control-allow-origin', 'access-control-expose-headers', 'retry-after', 'x-ratelimit-limit', 'x-ratelimit-remaining', 'vary'].includes(key))) }) })
    await livePage.goto(canonical)
    assert.equal(responses.length, 0)
    await livePage.getByLabel('Food name', { exact: true }).fill('rice')
    await livePage.getByLabel('Food name', { exact: true }).press('Enter')
    const rice = livePage.locator('.result-list button').filter({ hasText: 'Rice, well-milled, boiled' }).first()
    await rice.waitFor({ timeout: 45000 }); await rice.click()
    await livePage.getByRole('heading', { name: 'Rice, well-milled, boiled', exact: true }).waitFor({ timeout: 45000 })
    const before = responses.length
    await livePage.getByRole('radio', { name: 'Sugar', exact: true }).click()
    await livePage.getByRole('radio', { name: 'Sodium', exact: true }).click()
    await livePage.getByLabel('Quantity', { exact: true }).fill('0.5')
    await livePage.getByLabel('Quantity', { exact: true }).press('Enter')
    await livePage.getByLabel('Food name', { exact: true }).press('Enter')
    await livePage.waitForTimeout(1100)
    assert.equal(responses.length, before, 'Portions/lenses/repeated cached search do not read API')
    assert(credentials.every(row => !row.cookiePresent && !row.authorizationPresent))
    assert(responses.every(row => row.status === 200))
    evidence.live.api = { environment: 'Local built assets intercepted at main-site HTTPS origin in Chromium; actual anonymous cross-origin API responses, NOT deployed feature', responses, credentials, cachedRepeatAndPortionLensReadCount: responses.length - before, readableHeaders: await livePage.evaluate(async () => { const response = await fetch('https://api.juanutrisyon.info/api/foods/rice-well-milled-boiled', { credentials: 'omit', headers: { Accept: 'application/json' } }); return { status: response.status, cacheControl: response.headers.get('cache-control'), retryAfter: response.headers.get('retry-after'), exposeHeaders: response.headers.get('access-control-expose-headers') } }) }
    await liveContext.close()
    record('Actual anonymous cross-origin rice search/detail succeeds at controlled main-site browser origin; quantity/lens/cache interactions add no API requests. No real 429 induced')
  }
  assert.deepEqual(evidence.errors, [])
  evidence.passed = true
  await writeFile(new URL('../../docs/food-visualizer/phase-13-browser-evidence.json', import.meta.url), JSON.stringify(evidence, null, 2) + '\n')
  console.log(JSON.stringify(evidence, null, 2))
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)) }
