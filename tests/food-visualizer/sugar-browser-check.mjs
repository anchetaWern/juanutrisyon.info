import { makeVisualizerTestFood, visualizerSearchMeta } from './visualizer-test-food.mjs'
import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { calculateColaReference } from '../../src/features/food-visualizer/colaReference.js'
const { chromium } = await import(process.env.JN_PLAYWRIGHT_PATH ? pathToFileURL(process.env.JN_PLAYWRIGHT_PATH).href : 'playwright')
const captured = async key => JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`, import.meta.url)))
const cola = await captured('cola'), denominator = calculateColaReference(cola).sugar
const captures = await Promise.all(['gata', 'mango', 'coke', 'recipe'].map(async key => makeVisualizerTestFood(await captured(key))))
// Explicitly synthetic food nutrient cases, separate from the real cola reference.
const synthetic = (id, description, sugar) => makeVisualizerTestFood({ id, description, description_slug: `synthetic-${id}`,
  type: { slug: 'prepared-and-processed' }, serving_size: 100, serving_size_unit: 'g', nutrients: [{ name: 'sugar', amount: sugar, unit: 'g' }] })
const foods = [...captures, synthetic(900001, 'Synthetic zero-sugar fixture', 0),
  synthetic(900002, 'Synthetic one-glass fixture', denominator), synthetic(900003, 'Synthetic half-glass fixture', denominator / 2),
  makeVisualizerTestFood(await captured('pandesal')), { ...synthetic(900004, 'Synthetic unclassified fixture', 8), type: null }]
const base = process.env.JN_VISUALIZER_URL ?? 'http://localhost:5173/tools/food-visualizer'
const output = process.env.JN_COLA_OUTPUT ?? '/private/tmp/jn-cola-browser'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true }), errors = [], checks = []
try {
  async function open(width, initial = 'valid', hold = false, startIndex = 5) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } }), calls = []
    page.on('pageerror', error => errors.push(error.message))
    let mode = initial, release
    const gate = hold ? new Promise(resolve => { release = resolve }) : Promise.resolve()
    await page.route('**/api/foods**', async route => {
      const url = new URL(route.request().url()); calls.push(url.href)
      if (url.pathname.endsWith('/foods')) return route.fulfill({ json: { ...visualizerSearchMeta,
        data: foods, current_page: 1, last_page: 1, per_page: 20, total: foods.length } })
      if (url.pathname.endsWith('/softdrink-cola')) {
        await gate
        if (mode === 'network') return route.fulfill({ status: 503, json: { trace: 'PRIVATE_TRACE' } })
        if (mode === 'limited') return route.fulfill({ status: 429, json: {}, headers: { 'Retry-After': '10', 'Access-Control-Expose-Headers': 'Retry-After' } })
        const copy = structuredClone(cola)
        if (mode === 'changed') copy.custom_id = 'changed'
        if (mode === 'zero') copy.nutrients = [{ name: 'sugar', amount: 0, unit: 'g' }]
        return route.fulfill({ json: copy })
      }
      return route.fulfill({ json: foods.find(food => url.pathname.endsWith('/' + food.description_slug)) })
    })
    await page.goto(base)
    assert.equal(calls.length, 0, 'No reference requests before a food is selected')
    await page.getByLabel('Food name').fill('test'); await page.getByLabel('Food name').press('Enter')
    const choose = async index => {
      if (await page.locator('.back-results').isVisible()) await page.locator('.back-results').click()
      await page.locator('.result-list button').filter({ hasText: foods[index].description }).click()
      await page.getByLabel('Serving', { exact: true }).waitFor()
    }
    await choose(startIndex)
    return { page, calls, choose, release: () => release?.(), setMode: value => { mode = value } }
  }
  for (const width of [1440, 768, 390]) {
    const item = await open(width, 'valid', true), { page, calls, choose } = item
    const visual = page.locator('[data-sugar-result]')
    await page.getByText('Loading cola reference…', { exact: true }).waitFor()
    assert((await visual.locator('[data-sugar-amount]').innerText()).includes('24.44 g'))
    assert.equal(await visual.locator('.cola-glass').count(), 0)
    item.release(); await page.locator('[data-cola-equivalent]').waitFor()
    assert.equal(await visual.locator('.cola-glass').count(), 1)
    assert.equal(Number(await visual.locator('.cola-glass').getAttribute('data-fill')), 1)
    assert((await visual.innerText()).includes('1 glass of cola'))
    assert((await visual.innerText()).includes('260 g of cola'))
    await page.getByRole('radio', { name: 'Sugar', exact: true }).check()
    const before = calls.length
    await page.getByLabel('Quantity', { exact: true }).fill('0.5')
    assert.equal(Number(await visual.locator('.cola-glass').getAttribute('data-fill')), .5)
    assert((await visual.innerText()).includes('0.5 glasses of cola'))
    await page.locator('.lens-controls').screenshot({ path: `${output}/${width}-half-glass.png` })
    await page.getByLabel('Quantity', { exact: true }).fill('20')
    assert.equal(await visual.locator('.cola-glass').count(), 8)
    assert((await visual.innerText()).includes('20 glasses'))
    await page.getByLabel('Quantity', { exact: true }).fill('0.0001')
    assert.equal(await visual.getAttribute('data-status'), 'tiny'); assert.equal(await visual.locator('.cola-glass').count(), 0)
    assert((await visual.innerText()).includes('<0.01'))
    await page.getByLabel('Quantity', { exact: true }).fill('1')
    assert.equal(calls.length, before, 'Quantity edits must not refetch the reference')
    await choose(1)
    assert.equal(await page.locator('[data-sugar-context]').getAttribute('data-context'), 'whole-fruit')
    assert((await page.locator('[data-sugar-context]').innerText()).includes('hindi asukal na idinagdag'))
    await page.locator('[data-teaspoon-equivalent]').waitFor()
    assert((await visual.innerText()).includes('2.42 teaspoons'))
    assert.equal(await visual.locator('[data-sugar-teaspoons] .teaspoon').count(), 3)
    assert.equal(await visual.locator('.cola-glass').count(), 0)
    assert.equal(await page.locator('[data-cola-reference]').count(), 0)
    const beforeTeaspoons = calls.length
    await page.getByLabel('Quantity', { exact: true }).fill('2')
    assert((await page.locator('[data-teaspoon-equivalent]').innerText()).includes('4.83 teaspoons'))
    assert.equal(calls.length, beforeTeaspoons)
    await page.locator('.lens-controls').screenshot({ path: `${output}/${width}-teaspoons.png` })
    if (width === 1440) {
      const html = await page.evaluate(() => {
        const root = document.documentElement.cloneNode(true)
        root.querySelectorAll('script').forEach(node => node.remove())
        const baseTag = document.createElement('base'); baseTag.href = location.origin + '/'; root.querySelector('head').prepend(baseTag)
        return '<!doctype html>' + root.outerHTML
      })
      await writeFile(`${output}/rendered-teaspoons.html`, html)
    }
    for (const index of [2, 3]) {
      await choose(index)
      assert.equal(await visual.getAttribute('data-status'), 'unavailable'); assert.equal(await visual.locator('.cola-glass').count(), 0)
      assert.equal(await page.locator('[data-cola-equivalent]').count(), 0)
    }
    await choose(4)
    assert.equal(await visual.getAttribute('data-status'), 'zero'); assert.equal(await visual.locator('.cola-glass').count(), 0)
    assert((await visual.innerText()).includes('0 glasses of cola'))
    assert.equal(await page.getByRole('status').filter({ hasText: 'Total sugar: 0 g' }).count(), 1)
    await choose(6)
    await page.getByRole('radio', { name: 'Sugar', exact: true }).focus()
    const tree = await visual.ariaSnapshot()
    assert(!tree.includes('img'), 'Glass shapes are decorative; the equivalent is announced once as text')
    assert(!tree.includes('packet'))
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    if (process.env.JN_AXE_PATH) {
      await page.addScriptTag({ path: process.env.JN_AXE_PATH })
      const violations = await page.evaluate(async () => (await axe.run(document.querySelector('.lens-controls'))).violations.map(v => v.id))
      assert.deepEqual(violations, [])
    }
    await page.locator('.lens-controls').screenshot({ path: `${output}/${width}-cola-lens.png` })
    // QA snapshot of the actual rendered component with its production styles.
    if (width === 1440) {
      const html = await page.evaluate(() => {
        const root = document.documentElement.cloneNode(true)
        root.querySelectorAll('script').forEach(node => node.remove())
        const baseTag = document.createElement('base'); baseTag.href = location.origin + '/'; root.querySelector('head').prepend(baseTag)
        return '<!doctype html>' + root.outerHTML
      })
      await writeFile(`${output}/rendered-page.html`, html)
    }
    assert.equal(calls.filter(url => url.includes('/softdrink-cola')).length, 1)
    checks.push({ width, fullFractionalZeroTinyAndCapped: true, categoryTeaspoons: true, referenceRequests: 1, noOverflow: true })
    await page.close()
  }
  for (const mode of ['network', 'limited', 'changed', 'zero']) {
    const item = await open(390, mode), { page } = item
    if (mode === 'network') {
      await page.getByRole('button', { name: 'Try cola reference again', exact: true }).waitFor()
      assert((await page.locator('[data-sugar-amount]').innerText()).includes('24.44 g'))
      item.setMode('valid'); await page.getByRole('button', { name: 'Try cola reference again', exact: true }).click()
      await page.locator('[data-cola-equivalent]').waitFor()
      assert.equal(item.calls.filter(url => url.includes('/softdrink-cola')).length, 2)
    } else if (mode === 'limited') {
      await page.getByRole('button', { name: /Try cola reference again in/ }).waitFor()
      assert(await page.getByRole('button', { name: /Try cola reference again in/ }).isDisabled())
      assert.equal(await page.locator('[data-cola-equivalent]').count(), 0)
    } else {
      await page.getByText('The cola reference needs review. Comparison unavailable.', { exact: true }).waitFor()
      assert.equal(await page.locator('.cola-glass').count(), 0)
      assert.equal(await page.getByRole('button', { name: 'Try cola reference again', exact: true }).count(), 0)
    }
    assert(!(await page.locator('body').innerText()).includes('PRIVATE_TRACE'))
    checks.push({ mode, knownSugarPreserved: true }); await page.close()
  }
  // Fresh teaspoon-only sessions never request cola, even if it would fail.
  const teaspoons = await open(390, 'network', false, 1)
  await teaspoons.page.locator('[data-teaspoon-equivalent]').waitFor()
  assert.equal(teaspoons.calls.filter(url => url.includes('/softdrink-cola')).length, 0)
  await teaspoons.page.getByRole('radio', { name: 'Sugar', exact: true }).press('Space')
  await teaspoons.choose(7)
  await teaspoons.page.locator('[data-teaspoon-equivalent]').waitFor()
  assert((await teaspoons.page.locator('[data-teaspoon-equivalent]').innerText()).includes('0.44 teaspoons'))
  assert.equal(teaspoons.calls.filter(url => url.includes('/softdrink-cola')).length, 0)
  await teaspoons.choose(8)
  assert((await teaspoons.page.locator('[data-sugar-result]').innerText()).includes('food type is not available'))
  assert.equal(await teaspoons.page.locator('[data-sugar-teaspoons] .teaspoon, .cola-glass').count(), 0)
  await teaspoons.page.close()
  // A late cola response cannot replace a currently selected teaspoon comparison.
  const switching = await open(390, 'valid', true)
  await switching.page.getByText('Loading cola reference…', { exact: true }).waitFor()
  await switching.choose(1)
  await switching.page.locator('[data-teaspoon-equivalent]').waitFor()
  const completed = switching.page.waitForResponse(response => response.url().includes('/softdrink-cola'))
  switching.release(); await completed
  await switching.page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  assert((await switching.page.locator('[data-teaspoon-equivalent]').innerText()).includes('2.42 teaspoons'))
  assert.equal(await switching.page.locator('[data-cola-reference], .cola-glass').count(), 0)
  await switching.page.close()
  const failedSwitch = await open(390, 'network')
  await failedSwitch.page.getByRole('button', { name: 'Try cola reference again', exact: true }).waitFor()
  await failedSwitch.choose(1)
  await failedSwitch.page.locator('[data-teaspoon-equivalent]').waitFor()
  assert.equal(await failedSwitch.page.getByRole('button', { name: 'Try cola reference again', exact: true }).count(), 0)
  await failedSwitch.page.close()
  checks.push({ teaspoonOnlyRequestsCola: false, staleColaCannotChangeMode: true, failedColaDoesNotBlockTeaspoons: true, missingClassification: true })
  assert.deepEqual(errors, [])
  await writeFile(`${output}/evidence.json`, JSON.stringify({ checks, pageErrors: errors }, null, 2) + '\n')
  console.log(JSON.stringify({ passed: true, checks, pageErrors: errors, screenshots: output }))
} finally { await browser.close() }
