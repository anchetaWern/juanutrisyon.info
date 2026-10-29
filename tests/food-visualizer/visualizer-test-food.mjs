import { isVisualizerFood } from '../../src/features/food-visualizer/eligibility.js'
import { readFile } from 'node:fs/promises'

export const visualizerSearchMeta = Object.freeze({ catalog: 'food_visualizer', catalog_version: 1 })
const cola = JSON.parse(await readFile(new URL('./fixtures/captured/cola.json', import.meta.url)))

export async function fulfillColaReference(route) {
  if (!new URL(route.request().url()).pathname.endsWith('/foods/softdrink-cola')) return false
  await route.fulfill({ json: cola })
  return true
}

// Explicitly synthetic SERVING evidence for existing lens/disclosure scenarios.
// Captured nutrients stay untouched; these derived records are not API captures
// or production serving claims. Eligibility tests use unmodified fixtures.
export function makeVisualizerTestFood(input) {
  if (isVisualizerFood(input)) return input
  const food = structuredClone(input)
  food.data_source ??= 'nutrition_label' // Synthetic boundary fixtures declare a source.
  const unit = food.serving_size_unit.toLowerCase()
  const amount = Number(food.serving_size)
  food.custom_servings = { serving_units: [{ id: 900000 + food.id, name: 'Synthetic test portion',
    ...['ml', 'l'].includes(unit) ? { volume_in_ml: amount * (unit === 'l' ? 1000 : 1) }
      : { weight: amount * (unit === 'kg' ? 1000 : 1), weight_unit: 'g' } }] }
  return food
}
