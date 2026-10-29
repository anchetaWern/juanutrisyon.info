import { shallowReactive } from 'vue'
import { calculateFood, findNutrient, exactValue, parseAmount } from '../../vendor/jn-nutrition-core/index.mjs'
import { resolveServings, resolvePortion } from './portions.js'

// Identity and serving evidence only. Never store an independent carb denominator.
export const riceReferenceConfig = Object.freeze({ foodId: 78, slug: 'rice-well-milled-boiled',
  description: 'Rice, well-milled, boiled', source: 'ph_fct', sourceId: 'A020', profileId: 109,
  optionId: 206, label: '1/2 cup', grams: 80, servingSource: 'legacy_custom_servings' })
export function calculateRiceReference(food) {
  const config = riceReferenceConfig
  const options = food?.serving_profile?.options
  const matching = Array.isArray(options) ? options.filter(row => row.id === config.optionId) : []
  const option = matching[0]
  if (food?.id !== config.foodId || food.description_slug !== config.slug || food.description !== config.description ||
    food.data_source !== config.source || food.custom_id !== config.sourceId || food.serving_profile?.id !== config.profileId ||
    matching.length !== 1 || option.label !== config.label || option.source !== config.servingSource ||
    option.serving_profile_id !== config.profileId || parseAmount(option.gram_weight).value !== config.grams) throw new Error('invalid_reference')
  const resolved = resolveServings(food).options.find(row => row.key === `canonical:${config.optionId}`)
  const selection = resolvePortion(food, resolved, 1)
  if (!selection || selection.amount !== config.grams || selection.unit !== 'g' || selection.conversionEvidence.conversions.length) throw new Error('invalid_reference')
  const result = calculateFood(food, selection.amount, selection.unit)
  const node = findNutrient(result.nutrients, 'total carbohydrates')
  const carbs = node?.unit === 'g' ? exactValue(node) : null
  if (carbs === null || carbs <= 0) throw new Error('invalid_reference')
  return Object.freeze({ foodId: food.id, slug: food.description_slug, description: food.description,
    optionId: option.id, label: option.label, amount: selection.amount, unit: selection.unit,
    source: 'Philippine Food Composition Tables via JN', sourceId: food.custom_id,
    servingSource: option.source, carbs })
}
export function createRiceReference(api) {
  const state = shallowReactive({ status: 'idle', reference: null, error: null })
  let generation = 0, controller, pending, disposed = false, lastFood
  function accept(food) {
    try { state.reference = calculateRiceReference(food); state.status = 'ready'; state.error = null }
    catch { state.reference = null; state.status = 'error'; state.error = { code: 'invalid_reference', retryAt: null } }
    return state.reference
  }
  function ensure(selectedFood) {
    if (disposed) return Promise.resolve(null)
    if (selectedFood?.description_slug === riceReferenceConfig.slug) {
      if (lastFood === selectedFood) return Promise.resolve(state.reference)
      lastFood = selectedFood; ++generation; controller?.abort(); pending = null
      return Promise.resolve(accept(selectedFood))
    }
    if (pending) return pending
    if (state.status === 'ready' || state.status === 'error') return Promise.resolve(state.reference)
    const id = ++generation
    controller = new AbortController(); state.status = 'loading'; state.error = null
    pending = api.getFood({ slug: riceReferenceConfig.slug, signal: controller.signal }).then(food => {
      if (id !== generation || disposed) return null
      return accept(food)
    }, error => {
      if (id !== generation || disposed) return null
      state.status = 'error'; state.error = error; state.reference = null; return null
    }).finally(() => { if (id === generation) pending = null })
    return pending
  }
  return { state, ensure,
    retry(selectedFood) { if (state.status === 'loading' || disposed) return pending; state.status = 'idle'; lastFood = null; return ensure(selectedFood) },
    dispose() { disposed = true; ++generation; controller?.abort(); pending = null },
  }
}
