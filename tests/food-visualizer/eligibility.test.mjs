import test from 'node:test'
import assert from 'node:assert/strict'
import { isVisualizerFood } from '../../src/features/food-visualizer/eligibility.js'
import { createFoodApi } from '../../src/features/food-visualizer/foodApi.js'
import { createFoodSelection } from '../../src/features/food-visualizer/selection.js'
import { resolveServings } from '../../src/features/food-visualizer/portions.js'

const base = extra => ({ id: 1, description: 'Synthetic eligibility fixture', description_slug: 'synthetic',
  data_source: 'ph_fct', serving_size: 100, serving_size_unit: 'g', nutrients: [], ...extra })
const canonical = { serving_profile: { options: [{ id: 7, label: 'Piece', gram_weight: 25 }] } }
const legacy = { serving_units: [{ id: 8, name: 'Piece', weight: 25, weight_unit: 'g' }] }

test('all three sources require usable custom servings; inherited servings count', () => {
  for (const data_source of ['ph_fct', 'community_recipe', 'nutrition_label']) {
    for (const serving of [canonical, { custom_servings: legacy }, { custom_serving_by_subtype: legacy }]) {
      assert.equal(isVisualizerFood(base({ data_source, ...serving })), true)
    }
    for (const serving of [{}, { custom_serving_size: '1 cup' }, { serving_profile: { id: 7, options: [] } },
      { custom_servings: { serving_units: [] } }]) {
      assert.equal(isVisualizerFood(base({ data_source, ...serving })), false)
    }
  }
  for (const data_source of ['usda_fdc', 'openfoodfacts', 'restaurant_declared', 'custom_food', 'unknown', null, undefined]) {
    assert.equal(isVisualizerFood(base({ data_source, ...canonical })), false)
  }
})

test('unsupported, zero, blank and incompatible serving evidence cannot qualify', () => {
  for (const changes of [{ gram_weight: null }, { gram_weight: 0 }, { gram_weight: -2 },
    { gram_weight: 'invalid' }, { label: ' ' }, { gram_weight: null, milliliter_volume: 20 }]) {
    assert.equal(isVisualizerFood(base({ serving_profile: { options: [{ ...canonical.serving_profile.options[0], ...changes }] } })), false)
  }
  for (const changes of [{ serving_size: 0 }, { serving_size_unit: 'piece' }, { serving_size_unit: 'can' }]) {
    assert.equal(isVisualizerFood(base({ ...canonical, ...changes })), false)
  }
  const liquid = { serving_size_unit: 'mL', custom_serving_by_subtype: { serving_units: [{ id: 9, name: 'Cup', volume_in_ml: 200 }] } }
  assert.equal(isVisualizerFood(base(liquid)), true, 'Same-dimension volume needs no density')
  assert.equal(isVisualizerFood(base({ ...canonical, serving_size_unit: 'mL', density: { density: 1 } })), false)
  assert.equal(isVisualizerFood(base({ ...canonical, serving_size_unit: 'mL', density: { density: 1, unit: 'g/mL' } })), true)
})

test('invalid canonical or food-specific options fall back to a usable subtype measure', () => {
  const food = base({ serving_profile: { options: [{ id: 7, label: ' ', gram_weight: 25 }] },
    custom_servings: { serving_units: [{ id: 8, name: 'Unusable' }] }, custom_serving_by_subtype: legacy })
  assert.equal(isVisualizerFood(food), true)
  assert.equal(resolveServings(food).defaultKey, 'subtype:8')
  assert.equal(isVisualizerFood(base({ ...canonical, custom_serving_by_subtype: legacy })), true)
  assert.equal(resolveServings(base({ ...canonical, custom_serving_by_subtype: legacy })).defaultKey, 'canonical:7')
})

test('search requires a versioned filtered contract and allowed row sources, including empty searches', async () => {
  const metadata = { catalog: 'food_visualizer', catalog_version: 1 }
  const envelope = { data: [base(canonical)], current_page: 1, last_page: 1, per_page: 20, total: 1 }
  for (const payload of [envelope, { ...envelope, catalog: 'food_visualizer' },
    { ...envelope, ...metadata, catalog_version: 2 }, { ...envelope, ...metadata, data: [base({ data_source: 'usda_fdc' })] },
    { ...envelope, data: [], total: 0 }]) {
    const api = createFoodApi({ fetcher: async () => Response.json(payload) })
    await assert.rejects(api.searchFoods({ query: 'rice' }), { code: 'invalid_response' })
  }
  const calls = []
  const api = createFoodApi({ fetcher: async url => {
    const parsed = new URL(url); calls.push(parsed)
    return Response.json(parsed.pathname.endsWith('/foods') ? { ...envelope, ...metadata } : base(canonical))
  } })
  assert.equal((await api.searchFoods({ query: 'rice' })).total, 1)
  assert.equal((await api.getFood({ slug: 'synthetic' })).id, 1)
  assert(calls.every(url => url.searchParams.get('catalog') === 'food_visualizer'))
})

test('changed source or missing custom servings cannot become a selected food; retry revalidates', async () => {
  let raw = base(canonical)
  const selection = createFoodSelection({ getFood: async () => raw })
  const row = { id: 1, slug: 'synthetic' }
  for (const food of [base({ ...canonical, data_source: 'usda_fdc' }), base({})]) {
    raw = food; await selection.select(row)
    assert.equal(selection.state.selectedFood, null)
    assert.equal(selection.state.detailError.code, 'ineligible_food')
  }
  raw = base({ custom_serving_by_subtype: legacy, recipe_ingredients: [{ ingredient: { data_source: 'usda_fdc' } }] })
  await selection.retryDetail()
  assert.equal(selection.state.detailStatus, 'ready')
  assert.equal(selection.state.selectedFood, raw, 'Nested sources and raw calculation evidence remain intact')
})
