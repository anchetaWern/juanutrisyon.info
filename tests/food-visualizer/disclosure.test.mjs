import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { foodHandoff, publicSourceUrl, sourceDisclosure, moreNutrients } from '../../src/features/food-visualizer/disclosure.js'
import { featuredFoods } from '../../src/features/food-visualizer/featuredFoods.js'
import { createPortionState, summaryFields } from '../../src/features/food-visualizer/portions.js'
const captured = async key => JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`, import.meta.url)))

test('handoff preserves the exact slug, encodes delimiters and uses USDA archive routes only for USDA', () => {
 for (const source of ['ph_fct', 'usda_fdc', 'nutrition_label', 'community_recipe']) {
  const slug = 'a/b ?x=&ñ', links = foodHandoff({ description_slug: slug, data_source: source })
  const details = new URL(links.details), comparison = new URL(links.compare)
  assert.equal(details.origin, 'https://app.juanutrisyon.info')
  assert.equal(details.pathname, `/food/${source === 'usda_fdc' ? 'archive/' : ''}${encodeURIComponent(slug)}`)
  assert.equal(comparison.pathname, '/search');assert.equal(comparison.searchParams.get('food1'), slug)
  assert.deepEqual([...comparison.searchParams.keys()], ['food1'])
 }
 assert.equal(foodHandoff({description_slug:' '}), null)
 assert.equal(foodHandoff(null), null)
})
test('source links allow public HTTPS and reject local, credentialed and executable URLs without rewriting', () => {
 assert.equal(publicSourceUrl('https://i.fnri.dost.gov.ph/fct/library/report/2982'), 'https://i.fnri.dost.gov.ph/fct/library/report/2982')
 for (const input of ['http://localhost/storage/label.png', 'https://localhost/label', 'https://127.0.0.1/a',
  'https://[::1]/a', 'https://label.local/a', 'https://api.internal/a', 'https://a.test/a',
  'https://user:pass@example.com/a', 'javascript:alert(1)', '/storage/label.png', null, {}]) assert.equal(publicSourceUrl(input), null)
})
test('allowlisted provenance includes serving evidence and ignores payload, author and absent editions', async () => {
 const food = await captured('rice'), model = createPortionState();model.setFood(food);model.setQuantity('0.375')
 food.author = 'PRIVATE_AUTHOR';food.source_metadata.raw_payload = 'PRIVATE_PAYLOAD'
 const source = sourceDisclosure(food, model.state.selection), rows = Object.fromEntries(source.rows.map(row => [row.label, row.value]))
 assert.equal(rows['JN food ID'], '78');assert.equal(rows['Source food ID'], 'A020')
 assert.equal(rows['Selected portion'], '30 g');assert.equal(rows.Quantity, '0.375')
 assert.equal(rows['Serving option ID'], '206');assert.equal(rows['Legacy serving ID'], '168')
 assert.equal(rows['Household label'], '1/2 cup');assert.equal(rows['Serving evidence'], 'legacy_custom_servings')
 assert(!('Source edition/version' in rows));assert(!('Source publication date' in rows))
 assert(!JSON.stringify(source).includes('PRIVATE_'));assert.equal(source.links.length, 1)
 assert.equal(source.recipe, false)
})
test('unusable product labels and incomplete recipes retain explicit qualifications', async () => {
 const label = sourceDisclosure(await captured('gata'), null)
 assert.equal(label.labelUnavailable, true);assert.deepEqual(label.links, [])
 const recipe = await captured('recipe');recipe.recipe_structure_status = 'unavailable'
 const source = sourceDisclosure(recipe, null)
 assert.equal(source.recipe, true);assert.equal(source.structureUnavailable, true)
 assert(source.links.some(row => row.label === 'Recipe source'))
 assert(source.rows.some(row => row.label === 'Ingredient records' && row.value === '9'))
})
test('additional nutrients use complete shared-core results, preserve zeros and scale with the same portion', async () => {
 const model = createPortionState();model.setFood(await captured('rice'))
 const rows = moreNutrients(model.state.result)
 assert.equal(rows.find(row => row.id === 'protein').value, 2.1 * .8)
 assert.equal(rows.find(row => row.id === 'cholesterol').display, '0 mg')
 assert(!rows.some(row => summaryFields.some(([id]) => row.id === id)))
 model.setQuantity('0.5')
 assert.equal(moreNutrients(model.state.result).find(row => row.id === 'protein').value, 2.1 * .4)
 model.setFood(await captured('recipe'))
 assert(!moreNutrients(model.state.result).some(row => row.id === 'protein')) // partial contribution, not a complete total
 assert.deepEqual(moreNutrients(null), [])
})
test('no candidate is featured while complete source/serving review is pending', () => {
 assert.deepEqual(featuredFoods, [])
 assert(Object.isFrozen(featuredFoods))
})
