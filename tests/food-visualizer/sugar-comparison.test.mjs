import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { sugarComparison, sugarVisualization, sugarTeaspoonGrams } from '../../src/features/food-visualizer/sugarComparison.js'
import { sugarResult } from '../../src/features/food-visualizer/lenses.js'
import { resultAnnouncement } from '../../src/features/food-visualizer/announcements.js'
import { calculateFood } from '../../src/vendor/jn-nutrition-core/index.mjs'

const fruit = { type: { slug: 'fruits' } }
const prepared = { type: { slug: 'prepared-and-processed' } }
const result = amount => calculateFood({ serving_size: 100, serving_size_unit: 'g', nutrients: [{ name: 'sugar', amount, unit: 'g' }] }, 100, 'g')

test('only the identified top-level type chooses the visualization', () => {
  assert.equal(sugarVisualization(prepared), 'cola')
  for (const slug of ['fruits', 'beverages', 'cereals-and-grains', 'sugars-and-sweets']) {
    assert.equal(sugarVisualization({ type: { slug }, description: 'Prepared food', data_source: 'community_recipe',
      subtype: { slug: 'prepared-and-processed' }, category: { slug: 'prepared-and-processed' } }), 'teaspoons')
  }
  for (const food of [null, {}, { type: {} }, { type: { slug: ' ' } }, { food_type: 57 },
    { description: 'Prepared and Processed', subtype: prepared.type }]) assert.equal(sugarVisualization(food), null)
})

test('teaspoons represent exactly 4 g sugar and are independent of pending or failed cola', () => {
  assert.equal(sugarTeaspoonGrams, 4)
  for (const cola of [undefined, { status: 'loading' }, { status: 'error' }, { status: 'ready', reference: { sugar: 24.44 } }]) {
    const comparison = sugarComparison(fruit, cola)
    assert.equal(comparison.status, 'ready'); assert.equal(comparison.gramsPerUnit, 4)
    const output = sugarResult(result(10), comparison)
    assert.equal(output.count, 2.5); assert.deepEqual(output.fills, [1, 1, .5])
    assert.equal(sugarResult(result(0), comparison).count, 0)
    assert.equal(sugarResult(result(null), comparison).count, null)
    assert.equal(sugarResult(result(.001), comparison).countText, '<0.01')
    assert.equal(sugarResult(result(100), comparison).fills.length, 8)
    assert.equal(sugarResult(result(100), comparison).count, 25)
  }
})

test('missing classification keeps known grams without an assumed equivalent', () => {
  const output = sugarResult(result(10), sugarComparison({}))
  assert.equal(output.grams, 10); assert.equal(output.count, null); assert.equal(output.status, 'unavailable-classification')
  assert.match(resultAnnouncement('sugar', result(10), sugarComparison({})), /10 g.*food type is not available/)
})

test('current mango portion yields 2.42 teaspoon equivalents; a doubled portion yields 4.83', async () => {
  const food = JSON.parse(await readFile(new URL('./fixtures/captured/mango.json', import.meta.url))), before = structuredClone(food)
  const comparison = sugarComparison(food)
  assert.equal(sugarResult(calculateFood(food, 70, 'g'), comparison).countText, '2.42')
  assert.equal(sugarResult(calculateFood(food, 140, 'g'), comparison).countText, '4.83')
  assert.deepEqual(food, before)
})

test('both branches announce the matching units, including singular and unavailable cases', () => {
  const teaspoons = sugarComparison(fruit)
  assert.match(resultAnnouncement('sugar', result(4), teaspoons), /1 teaspoon of sugar.*4 g.*does not estimate added sugar/)
  assert.match(resultAnnouncement('sugar', result(8), teaspoons), /2 teaspoons of sugar/)
  assert.match(resultAnnouncement('sugar', result(null), teaspoons), /Teaspoon equivalent unavailable/)
  const cola = sugarComparison(prepared, { status: 'ready', reference: { sugar: 24.44 } })
  assert.match(resultAnnouncement('sugar', result(24.44), cola), /1 glass of cola/)
  assert.match(resultAnnouncement('sugar', result(10), sugarComparison(prepared, { status: 'error' })), /Cola comparison unavailable/)
})
