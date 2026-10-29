import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { visualizerSearchMeta, fulfillColaReference } from './visualizer-test-food.mjs'

const { chromium } = await import(process.env.JN_PLAYWRIGHT_PATH ? pathToFileURL(process.env.JN_PLAYWRIGHT_PATH).href : 'playwright')
const captured = async key => JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`, import.meta.url)))
const rice = await captured('rice'), noServings = await captured('gata')
const inherited = { id: 900101, description: 'Synthetic inherited-serving food', description_slug: 'synthetic-inherited',
  data_source: 'nutrition_label', serving_size: 100, serving_size_unit: 'mL', nutrients: [],
  custom_serving_by_subtype: { serving_units: [{ id: 991, name: 'Synthetic cup', volume_in_ml: 200 }] } }
const changed = { ...rice, id: 900102, description: 'Synthetic changed-serving food', description_slug: 'synthetic-changed' }
const changedSource = { ...rice, id: 900103, description: 'Synthetic changed-source food', description_slug: 'synthetic-changed-source' }
const browser = await chromium.launch({ headless: true })
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }), errors = [], calls = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/api/foods**', async route => {
      const url = new URL(route.request().url()); calls.push(url.href)
      if (await fulfillColaReference(route)) return
      assert.equal(url.searchParams.get('catalog'), 'food_visualizer')
      if (url.pathname.endsWith('/foods')) {
        const query = url.searchParams.get('description'), pageNumber = Number(url.searchParams.get('page'))
        const rows = query === 'none' ? [] : pageNumber === 1 ? [rice, inherited] : [changed, changedSource]
        return route.fulfill({ json: { ...query === 'old-server' ? {} : visualizerSearchMeta,
          data: rows, current_page: pageNumber, last_page: query === 'none' ? 1 : 2, per_page: 2, total: query === 'none' ? 0 : 4 } })
      }
      const food = url.pathname.endsWith('/' + rice.description_slug) ? rice
        : url.pathname.endsWith('/' + inherited.description_slug) ? inherited
        : url.pathname.endsWith('/' + changedSource.description_slug) ? { ...changedSource, data_source: 'usda_fdc' }
        : { ...noServings, id: changed.id, description: changed.description, description_slug: changed.description_slug }
      return route.fulfill({ json: food })
    })
    await page.goto(process.env.JN_VISUALIZER_URL ?? 'http://127.0.0.1:4327/tools/food-visualizer')
    const search = async query => {
      if (await page.locator('.back-results').isVisible()) await page.locator('.back-results').click()
      await page.getByLabel('Food name').fill(query); await page.getByLabel('Food name').press('Enter')
    }
    await search('foods')
    await page.getByText('4 matches for “foods” · Page 1 of 2', { exact: true }).waitFor()
    await page.locator('.result-list button').filter({ hasText: inherited.description }).click()
    await page.getByLabel('Serving', { exact: true }).waitFor()
    assert.equal(await page.getByLabel('Serving', { exact: true }).inputValue(), 'subtype:991')
    await page.getByText('Selected portion: 200 mL', { exact: true }).waitFor()
    const before = calls.length
    await page.getByLabel('Quantity', { exact: true }).fill('0.5')
    await page.getByText('Selected portion: 100 mL', { exact: true }).waitFor()
    assert.equal(calls.length, before)
    if (await page.locator('.back-results').isVisible()) await page.locator('.back-results').click()
    await page.getByRole('button', { name: 'Next', exact: true }).click()
    await page.getByText('4 matches for “foods” · Page 2 of 2', { exact: true }).waitFor()
    for (const food of [changed, changedSource]) {
      if (await page.locator('.back-results').isVisible()) await page.locator('.back-results').click()
      await page.locator('.result-list button').filter({ hasText: food.description }).click()
      await page.getByRole('alert').filter({ hasText: 'no longer has an eligible source and usable custom serving' }).waitFor()
      assert.equal(await page.getByLabel('Serving', { exact: true }).count(), 0)
      assert.equal(await page.getByRole('button', { name: 'Try loading again' }).count(), 0)
    }
    await search('none')
    await page.getByText('No matches for', { exact: false }).waitFor()
    assert((await page.locator('.results').innerText()).includes('usable custom servings'))
    await search('old-server')
    await page.getByRole('button', { name: 'Try search again' }).waitFor()
    assert.equal(await page.locator('.result-list button').count(), 0, 'An unfiltered server must not expose foods')
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.screenshot({ path: `/private/tmp/jn-eligibility-${width}.png`, fullPage: true })
    assert.deepEqual(errors, [])
    await page.close()
  }
  console.log(JSON.stringify({ passed: true, viewports: [1280, 390], inheritedSelection: true,
    staleServingsRejected: true, staleSourceRejected: true, unfilteredServerRejected: true }))
} finally { await browser.close() }
