import { makeVisualizerTestFood, visualizerSearchMeta, fulfillColaReference } from './visualizer-test-food.mjs'
// Workspace regression checks; serving-only fixture additions are explicitly synthetic.
import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
const { chromium } = await import(pathToFileURL(process.env.JN_PLAYWRIGHT_PATH ?? '/Users/wernancheta/projects/juanutrisyon/nuxt-juanutrisyon/node_modules/playwright/index.mjs').href)
const foods = await Promise.all(['rice', 'pandesal', 'mango', 'patis', 'coke', 'gata', 'recipe'].map(async key => makeVisualizerTestFood(JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`, import.meta.url))))))
const rows = [...foods, ...Array.from({ length: 13 }, (_, i) => ({ ...foods[0], id: 900000 + i, description: `Synthetic scroll test food ${i + 1}`, description_slug: `synthetic-scroll-${i + 1}` }))]
const base = process.env.JN_VISUALIZER_URL ?? 'http://127.0.0.1:4327/tools/food-visualizer'
const out = '.taste-skill/after/workspace'
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ headless: true })
const evidence = []
const audits = []
async function audit(page, state) {
  if (!process.env.JN_AXE_PATH) return
  const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, impact: v.impact, targets: v.nodes.flatMap(n => n.target) })))
  audits.push({ state, violations })
  assert.deepEqual(violations, [], `${state}: accessibility violations`)
}
try {
  for (const [width, height, label] of [[1440, 900, 'desktop'], [768, 1024, 'tablet'], [390, 844, 'mobile']]) {
    const page = await browser.newPage({ viewport: { width, height } }), calls = [], errors = []
    page.on('pageerror', e => errors.push(e.message))
    await page.route('**/api/foods**', async route => {
      const url = new URL(route.request().url()); calls.push(url.href)
      if (await fulfillColaReference(route)) return
      if(url.pathname.endsWith('/foods')) return route.fulfill({ json:{...visualizerSearchMeta,data: url.searchParams.get('description') === 'none' ? [] : rows, current_page: 1, last_page: 1, per_page: 20, total: url.searchParams.get('description') === 'none' ? 0 : 20 } })
      return route.fulfill({ json: rows.find(f => url.pathname.endsWith('/' + f.description_slug)) })
    })
    await page.goto(base)
    if (process.env.JN_AXE_PATH) await page.addScriptTag({ path: process.env.JN_AXE_PATH })
    await page.getByRole('heading', { name: 'Ano’ng Nasa Pagkain Ko?', exact: true }).waitFor()
    assert.equal(calls.length, 0)
    await audit(page, `${label}-initial`)
    const searchTop = await page.getByLabel('Food name').evaluate(e => e.getBoundingClientRect().top)
    assert(searchTop < height * .6, 'Search belongs on the first screen')
    if (width <= 900) {
      const toggle = page.getByRole('button', { name: 'Menu', exact: true })
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
      await toggle.click()
      await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About', exact: true }).focus()
      await page.keyboard.press('Escape')
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false')
      assert(await page.locator('.menu-toggle').evaluate(e => e === document.activeElement))
    }
    await page.getByLabel('Food name').fill('rice')
    await page.getByLabel('Food name').press('Enter')
    await page.locator('.result-list button').first().waitFor()
    assert(await page.locator('.result-list').evaluate(e => e.scrollHeight > e.clientHeight))
    await page.screenshot({ path: `${out}/${label}-search.jpg` })
    const selected = page.locator('.result-list button').filter({ hasText: foods[2].description })
    await selected.click()
    await page.getByLabel('Quantity', { exact: true }).waitFor()
    await page.waitForFunction(() => document.activeElement?.classList.contains('preview'))
    const savedScroll = await page.locator('.result-list').evaluate(e => e.scrollTop)
    if (width <= 900) assert(!await page.locator('.food-picker').isVisible())
    else assert(await page.locator('.food-picker').isVisible())
    await page.locator('.preview').screenshot({ path: `${out}/${label}-portion.jpg` })
    const geometry = await page.evaluate(() => {
      const rect = s => { const r = document.querySelector(s).getBoundingClientRect(); return { top: Math.round(r.top + scrollY), height: Math.round(r.height), width: Math.round(r.width) } }
      return { preview: rect('.preview'), lens: rect('.lens-controls'), summary: rect('.nutrient-summary'), overflow: document.documentElement.scrollWidth > innerWidth }
    })
    assert.equal(geometry.overflow, false)
    assert(geometry.lens.top - geometry.preview.top < 650, 'Portion controls stay close to the result')
    const before = calls.length
    await page.getByLabel('Quantity', { exact: true }).fill('1.5')
    await page.getByRole('button', { name: 'Increase quantity by 0.5', exact: true }).click()
    assert.equal(await page.getByLabel('Quantity', { exact: true }).inputValue(), '2')
    await page.getByRole('button', { name: 'Decrease quantity by 0.5', exact: true }).click()
    assert.equal(await page.getByLabel('Quantity', { exact: true }).inputValue(), '1.5')
    await page.getByLabel('Serving', { exact: true }).selectOption('g')
    await page.getByLabel('Quantity', { exact: true }).fill('150')
    await page.getByText('Selected portion: 150 g', { exact: true }).waitFor()
    for (const lens of ['Sugar', 'Sodium', 'Saturated fat', 'Carbohydrates']) {
      await page.getByRole('radio', { name: lens, exact: true }).check()
      if (lens === 'Carbohydrates') await page.locator('[data-rice-equivalent]').waitFor()
      await page.locator('.lens-controls').screenshot({ path: `${out}/${label}-${lens.toLowerCase().replaceAll(' ', '-')}.jpg` })
      await audit(page, `${label}-${lens}`)
    }
    assert.equal(calls.length, before + 1, 'Only the first rice-reference load may fetch; mango uses teaspoons without cola')
    await page.getByLabel('Quantity', { exact: true }).fill('bad')
    assert.equal(await page.getByLabel('Quantity', { exact: true }).getAttribute('aria-invalid'), 'true')
    assert((await page.locator('.lens-result').innerText()).includes('last valid portion'))
    await page.getByLabel('Quantity', { exact: true }).fill('150')
    if (width <= 900) {
      await page.getByRole('button', { name: 'Back to results', exact: false }).click()
      assert(await page.locator('.food-picker').isVisible())
      assert(!await page.locator('.lens-controls').isVisible(), 'The results view hides the nutrient workspace')
      assert(await selected.evaluate(e => e === document.activeElement))
      assert(Math.abs(await page.locator('.result-list').evaluate(e => e.scrollTop) - savedScroll) < 2)
      assert.equal(await page.getByLabel('Food name').inputValue(), 'rice')
      await selected.click()
      await page.getByLabel('Quantity', { exact: true }).waitFor()
      // The global skip link must reveal and focus search even from the detail view.
      await page.getByRole('link', { name: 'Skip to food search' }).focus()
      await page.keyboard.press('Enter')
      assert(await page.getByLabel('Food name').evaluate(e => e === document.activeElement))
      assert(await page.locator('.food-picker').isVisible())
    } else await page.getByRole('button', { name: 'Change food', exact: true }).click()
    await page.getByLabel('Food name').fill('none')
    await page.getByLabel('Food name').press('Enter')
    await page.getByText('No matches for', { exact: false }).waitFor()
    assert.deepEqual(errors, [])
    evidence.push({ viewport: label, width, searchTop, geometry, requests: calls.length, pageErrors: errors, navigation: 'passed', portionControls: 'passed', lenses: 4 })
    await page.close()
  }
  await writeFile(`${out}/evidence.json`, JSON.stringify({ evidence, audits }, null, 2))
  console.log(JSON.stringify({ passed: true, evidence, audits: audits.length }))
} finally { await browser.close() }
