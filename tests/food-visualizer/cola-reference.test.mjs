import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { calculateFood } from '../../src/vendor/jn-nutrition-core/index.mjs'
import { calculateColaReference, createColaReference } from '../../src/features/food-visualizer/colaReference.js'
import { sugarResult } from '../../src/features/food-visualizer/lenses.js'
import { createFoodApi } from '../../src/features/food-visualizer/foodApi.js'
import { isVisualizerFood } from '../../src/features/food-visualizer/eligibility.js'

import { sugarComparison } from '../../src/features/food-visualizer/sugarComparison.js'
const captured = async () => JSON.parse(await readFile(new URL('./fixtures/captured/cola.json', import.meta.url)))
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done }); return { resolve, promise } }

test('captured generic cola supplies a calculated 260-g internal glass without becoming selectable', async () => {
  const food = await captured(), before = structuredClone(food), reference = calculateColaReference(food)
  assert.equal(reference.sugar, 24.44); assert.equal(reference.amount, 260); assert.equal(reference.unit, 'g')
  assert.equal(reference.sourceId, 'Q053'); assert.equal(reference.foodId, 1346)
  assert.equal(isVisualizerFood(food), false, 'The internal serving must not relax picker eligibility')
  for (const [grams, count] of [[130, .5], [260, 1], [520, 2]]) {
    assert.equal(sugarResult(calculateFood(food, grams, 'g'), sugarComparison({ type: { slug: 'prepared-and-processed' } }, { status: 'ready', reference })).count, count)
  }
  assert.deepEqual(food, before); assert(Object.isFrozen(reference))
  const bytes = await readFile(new URL('./fixtures/captured/cola.json', import.meta.url))
  const manifest = JSON.parse(await readFile(new URL('./fixtures/cola-manifest.json', import.meta.url)))
  assert.equal(createHash('sha256').update(bytes).digest('hex'), manifest.sanitized_sha256)
})

test('reference sugar follows updated nutrient evidence instead of a hardcoded denominator', async () => {
  const food = await captured()
  food.nutrients = [{ name: 'total carbohydrates', amount: 10, unit: 'g', composition: [{ name: 'sugar', amount: 10, unit: 'g' }] }]
  assert.equal(calculateColaReference(food).sugar, 26)
})

test('identity, source, source ID and incompatible basis changes invalidate the reference', async () => {
  const food = await captured()
  for (const mutation of [{ id: 1597 }, { description_slug: 'other' }, { description: 'Coca-Cola' },
    { data_source: 'nutrition_label' }, { custom_id: 'other' }, { serving_size: 0 },
    { serving_size_unit: 'mL' }, { serving_size_unit: 'piece' }]) {
    assert.throws(() => calculateColaReference({ ...food, ...mutation }), /invalid_reference/)
  }
})

test('missing, zero, trace, invalid, unsupported and duplicate sugar cannot establish a reference', async () => {
  const food = await captured()
  for (const nutrients of [[], [{ name: 'sugar', amount: 0, unit: 'g' }],
    [{ name: 'sugar', amount: null, unit: 'g' }], [{ name: 'sugar', amount: 'bad', unit: 'g' }],
    [{ name: 'sugar', amount: 9.4, unit: 'g', qualifier: 'trace' }],
    [{ name: 'sugar', amount: 9.4, unit: 'unknown' }],
    [{ name: 'sugar', amount: 9.4, unit: 'g' }, { name: 'sugar', amount: 9.4, unit: 'g' }]]) {
    assert.throws(() => calculateColaReference({ ...food, nutrients }), /invalid_reference/)
  }
})

test('partial ingredient evidence cannot establish the reference denominator', async () => {
  const cola = await captured()
  const recipe = JSON.parse(await readFile(new URL('./fixtures/captured/recipe.json', import.meta.url)))
  const food = { ...recipe, id: cola.id, description_slug: cola.description_slug, description: cola.description,
    data_source: cola.data_source, custom_id: cola.custom_id }
  assert.throws(() => calculateColaReference(food), /invalid_reference/)
})

test('lazy loading deduplicates with API requests and reuses a selected reference', async () => {
  const food = await captured(), pending = deferred(); let calls = 0
  const api = createFoodApi({ fetcher: () => { calls++; return pending.promise } })
  const loader = createColaReference(api); assert.equal(calls, 0)
  const selected = api.getFood({ slug: food.description_slug }), a = loader.ensure(), b = loader.ensure()
  pending.resolve(Response.json(food)); await Promise.all([selected, a, b])
  assert.equal(calls, 1); assert.equal(loader.state.reference.sugar, 24.44)
  await loader.ensure(); assert.equal(calls, 1)
  const direct = createColaReference({ getFood: () => { throw new Error('Unexpected request') } })
  await direct.ensure(food); assert.equal(direct.state.status, 'ready')
})

test('request failures retain retry metadata and require manual retry', async () => {
  const food = await captured(); let calls = 0
  const loader = createColaReference({ getFood: async () => {
    if (++calls === 1) throw { code: 'rate_limited', retryAt: 12345 }
    return food
  } })
  await loader.ensure(); assert.equal(loader.state.status, 'error'); assert.equal(loader.state.error.retryAt, 12345)
  await loader.ensure(); assert.equal(calls, 1)
  await loader.retry(); assert.equal(calls, 2); assert.equal(loader.state.status, 'ready')
})

test('updated selected references and disposal defeat stale responses', async () => {
  const food = await captured(), pending = deferred()
  const loader = createColaReference({ getFood: () => pending.promise }), work = loader.ensure()
  await loader.ensure({ ...food, custom_id: 'changed' })
  pending.resolve(food); await work; assert.equal(loader.state.status, 'error'); assert.equal(loader.state.reference, null)
  const otherPending = deferred(), other = createColaReference({ getFood: () => otherPending.promise })
  const otherWork = other.ensure(); other.dispose(); otherPending.resolve(food); await otherWork
  assert.equal(other.state.reference, null)
})
