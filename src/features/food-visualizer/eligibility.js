import { resolveServings } from './portions.js'

export const visualizerCatalog = 'food_visualizer'
export const visualizerCatalogVersion = 1
const sources = new Set(['ph_fct', 'community_recipe', 'nutrition_label'])
const customOrigins = new Set(['canonical', 'legacy', 'subtype'])

export const hasVisualizerSource = food => sources.has(food?.data_source)

// Recorded basis and generated g/mL controls cannot make a food eligible.
// Serving resolution preserves its existing conversion guards and fallback order.
export function isVisualizerFood(food) {
  return hasVisualizerSource(food) && resolveServings(food).options.some(option =>
    customOrigins.has(option.origin) && option.label.trim().length > 0)
}
