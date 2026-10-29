import { makeVisualizerTestFood, visualizerSearchMeta, fulfillColaReference } from './visualizer-test-food.mjs'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
const { chromium } = await import(process.env.JN_PLAYWRIGHT_PATH ? pathToFileURL(process.env.JN_PLAYWRIGHT_PATH).href : 'playwright')
const foods = await Promise.all(['rice', 'pandesal', 'mango', 'patis', 'coke', 'gata', 'recipe'].map(async key =>
 makeVisualizerTestFood(JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`, import.meta.url))))))
const browser = await chromium.launch({ headless: true })
try {
 const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } }), calls = [], errors = []
 page.on('pageerror', error => errors.push(error.message))
 await page.route('**/api/foods**', async route => {
  const url = new URL(route.request().url());calls.push(url.href)
  if (await fulfillColaReference(route)) return
  if(url.pathname.endsWith('/foods')) return route.fulfill({ json:{...visualizerSearchMeta,data: foods, current_page: 1, last_page: 1, per_page: 20, total: foods.length } })
  return route.fulfill({ json: foods.find(food => url.pathname.endsWith('/' + food.description_slug)) })
 })
 await page.goto(process.env.JN_VISUALIZER_URL ?? 'http://127.0.0.1:4327/tools/food-visualizer')
 assert.equal(calls.length, 0)
 assert.equal(await page.getByLabel('Reviewed examples').count(), 0)
 await page.getByLabel('Food name').fill('rice');await page.getByLabel('Food name').press('Enter')
 async function choose(index) {
  if(await page.locator('.back-results').isVisible())await page.locator('.back-results').click()
  await page.locator('.result-list button').filter({ hasText: foods[index].description }).click()
  await page.getByRole('heading', { name: foods[index].description, exact: true }).waitFor()
 }
 await choose(0)
 const source = page.locator('.source-panel'), more = page.locator('.more-nutrients')
 assert.equal(await source.locator('details').count(), 0)
 assert.equal(await page.getByRole('link', { name: 'Compare in the app' }).count(), 0)
 assert.equal(await source.getByRole('link', { name: 'Open Food Details' }).getAttribute('href'), 'https://app.juanutrisyon.info/food/rice-well-milled-boiled')
 await more.getByText('More nutrients', { exact: true }).click()
 assert((await more.innerText()).includes('1.68 g'));assert((await more.innerText()).includes('0 mg'))
 const before = calls.length
 await page.getByLabel('Quantity', { exact: true }).fill('0.5')
 assert((await more.innerText()).includes('0.84 g'))
 await page.getByLabel('Quantity', { exact: true }).fill('bad')
 assert((await more.innerText()).includes('0.84 g'))
 await page.getByLabel('Quantity', { exact: true }).fill('1')
 const beforeLenses = calls.length
 for (const label of ['Sugar', 'Sodium', 'Saturated fat', 'Carbohydrates']) await page.getByRole('radio', { name: label, exact: true }).check()
 assert.equal(calls.length, beforeLenses + 1, 'Switching to sugar loads the cola reference once')
 for (const link of await source.getByRole('link').all()) {
  assert.equal(await link.getAttribute('target'), '_blank')
  assert((await link.getAttribute('rel')).includes('noopener'))
 }
 await source.scrollIntoViewIfNeeded()
 await source.screenshot({ path: '/private/tmp/jn-phase10-source-desktop.png' })
 await page.setViewportSize({ width: 360, height: 800 })
 assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
 await source.screenshot({ path: '/private/tmp/jn-phase10-source-mobile.png' })
 await more.screenshot({ path: '/private/tmp/jn-phase10-more-mobile.png' })
 await choose(5)
 assert.equal(await source.getByRole('link', { name: 'Open Food Details' }).getAttribute('href'), 'https://app.juanutrisyon.info/food/' + foods[5].description_slug)
 assert.equal(await source.locator('details').count(), 0)
 if (await more.getAttribute('open') === null) await more.locator('summary').click()
 assert((await more.innerText()).includes('2 g'));assert(!(await more.innerText()).includes('calcium'))
 await choose(6)
 assert.equal(await source.getByRole('link', { name: 'Open Food Details' }).getAttribute('href'), 'https://app.juanutrisyon.info/food/' + foods[6].description_slug)
 if (await more.getAttribute('open') === null) await more.locator('summary').click()
 assert(!(await more.innerText()).includes('protein'))
 assert((await more.innerText()).includes('phosphorus'))
 assert(!await page.locator('a[href*="localhost"], img[src*="localhost"]').count())
 assert.deepEqual(errors, [])
 console.log(JSON.stringify({ passed: true, requests: calls.length, pageErrors: errors,
  noRequestsOnPortionOrLensEdits: true, noUnreviewedExamples: true, noMobileOverflow: true }))
} finally { await browser.close() }
