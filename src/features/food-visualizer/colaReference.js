import { shallowReactive } from 'vue'
import { calculateFood, findNutrient, exactValue, normalizeBasis } from '../../vendor/jn-nutrition-core/index.mjs'

// User-defined internal reference serving. No catalog serving assignment or nutrient constant.
export const colaReferenceConfig = Object.freeze({ foodId: 1346, slug: 'softdrink-cola',
  description: 'Softdrink, cola', source: 'ph_fct', sourceId: 'Q053', grams: 260 })

export function calculateColaReference(food) {
  const config = colaReferenceConfig
  const basis = normalizeBasis({ amount: food?.serving_size, unit: food?.serving_size_unit })
  if (food?.id !== config.foodId || food.description_slug !== config.slug || food.description !== config.description ||
    food.data_source !== config.source || food.custom_id !== config.sourceId ||
    basis.state !== 'known' || basis.dimension !== 'weight') throw new Error('invalid_reference')
  const result = calculateFood(food, config.grams, 'g')
  const node = findNutrient(result.nutrients, 'sugar')
  const sugar = node?.unit === 'g' ? exactValue(node) : null
  if (sugar === null || sugar <= 0) throw new Error('invalid_reference')
  return Object.freeze({ foodId: food.id, slug: food.description_slug, description: food.description,
    amount: config.grams, unit: 'g', source: 'PhilFCT', sourceId: config.sourceId, sugar })
}

export function createColaReference(api) {
  const state = shallowReactive({ status: 'idle', reference: null, error: null })
  let generation = 0, controller, pending, disposed = false, lastFood
  function accept(food) {
    try { state.reference = calculateColaReference(food); state.status = 'ready'; state.error = null }
    catch { state.reference = null; state.status = 'error'; state.error = { code: 'invalid_reference', retryAt: null } }
    return state.reference
  }
  function ensure(selectedFood) {
    if (disposed) return Promise.resolve(null)
    if (selectedFood?.description_slug === colaReferenceConfig.slug) {
      if (lastFood === selectedFood) return Promise.resolve(state.reference)
      lastFood = selectedFood; ++generation; controller?.abort(); pending = null
      return Promise.resolve(accept(selectedFood))
    }
    if (pending) return pending
    if (state.status === 'ready' || state.status === 'error') return Promise.resolve(state.reference)
    const id = ++generation
    controller = new AbortController(); state.status = 'loading'; state.error = null
    pending = api.getFood({ slug: colaReferenceConfig.slug, signal: controller.signal }).then(food => {
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
