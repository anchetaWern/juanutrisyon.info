// Opt-in live, read-only app check. Isolated contexts never use the user's session.
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
const { chromium } = await import(process.env.JN_PLAYWRIGHT_PATH ? pathToFileURL(process.env.JN_PLAYWRIGHT_PATH).href : 'playwright')
const browser = await chromium.launch({ headless: true })
const origin = 'https://app.juanutrisyon.info', slug = 'rice-well-milled-boiled'
const results = []
try {
 for (const scenario of ['fresh', 'existing-other', 'existing-same-mode-off']) {
  const context = await browser.newContext()
  if (scenario !== 'fresh') await context.addInitScript(({ origin, slug, scenario }) => {
   if (location.origin !== origin) return
   sessionStorage.setItem('food_comparison_mode', '0')
   sessionStorage.setItem('food_comparison_selected_foods', JSON.stringify([
    { slug: scenario === 'existing-other' ? 'mango-manila-super-ripe' : slug, title: 'Isolated check' },
   ]))
  }, { origin, slug, scenario })
  const page = await context.newPage()
  const response = await page.goto(`${origin}/search?${new URLSearchParams({ food1: slug })}`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => !new URL(location.href).searchParams.has('food1'), { timeout: 30000 })
  const state = await page.evaluate(() => ({ mode: sessionStorage.getItem('food_comparison_mode'),
   foods: JSON.parse(sessionStorage.getItem('food_comparison_selected_foods') || '[]') }))
  assert.equal(response.status(), 200)
  assert(state.foods.some(food => food.slug === slug), `${scenario}: seed retained`)
  if (scenario !== 'existing-same-mode-off') assert.equal(state.mode, '1')
  if (scenario === 'existing-other') assert(state.foods.some(food => food.slug === 'mango-manila-super-ripe'))
  results.push({ scenario, status: response.status(), mode: state.mode, slugs: state.foods.map(food => food.slug),
   comparisonEnabled: state.mode === '1' })
  if (state.mode !== '1') {
   await page.getByRole('button', { name: 'Compare foods', exact: true }).click()
   await page.waitForFunction(() => sessionStorage.getItem('food_comparison_mode') === '1')
   results.at(-1).manualRecoveryVerified = true
  }
  console.log(JSON.stringify(results.at(-1)))
  await context.close()
 }
 for (const path of ['/food/rice-well-milled-boiled', '/food/archive/salt-table-iodized']) {
  const context = await browser.newContext(), page = await context.newPage()
  const response = await page.goto(origin + path, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => /rice, well-milled, boiled|salt, table, iodized/i.test(document.body.innerText), { timeout: 30000 })
  assert.equal(response.status(), 200)
  assert.equal(new URL(page.url()).pathname, path)
  results.push({ path, status: response.status(), foodIdentityVisible: true,
   headings: await page.locator('h1,h2,h3').allTextContents() })
  console.log(JSON.stringify(results.at(-1)))
  await context.close()
 }
 console.log(JSON.stringify({ checkedAt: new Date().toISOString(), origin, results }, null, 2))
} finally { await browser.close() }
