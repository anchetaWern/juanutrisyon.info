import { shallowReactive } from 'vue'
import { exactValue, findNutrient } from '../../vendor/jn-nutrition-core/index.mjs'
import { formatNutrient } from './portions.js'

export const lenses = Object.freeze([
  { id: 'sugar', label: 'Sugar', available: true },
  { id: 'sodium', label: 'Sodium', available: true },
  { id: 'saturated-fat', label: 'Saturated fat', available: true },
  { id: 'carbohydrates', label: 'Carbohydrates', available: true },
])
// Context-only review of captured identity/preparation fields, not verification of
// nutrient values or permission to feature an example. Match all evidence below.
const contexts = [
  { id: 78, slug: 'rice-well-milled-boiled', description: 'Rice, well-milled, boiled', source: 'ph_fct', type: 'prepared-and-processed', state: 7, context: 'staple', suggested: 'carbohydrates' },
  { id: 119, slug: 'bread-pan-de-sal', description: 'Bread, pan de sal', source: 'ph_fct', type: 'cereals-and-grains', state: 1, context: 'staple', suggested: 'carbohydrates' },
  { id: 1715, slug: 'coco-mama-fresh-gata-coconut-cream', description: 'Coco mama fresh gata (coconut cream)', source: 'nutrition_label', type: 'prepared-and-processed', state: 2, context: 'coconut-cream', suggested: 'saturated-fat' },
  { id: 1270, slug: 'fish-sauce', description: 'Fish sauce', source: 'ph_fct', type: 'prepared-and-processed', subtype: 'condiments-and-sauces', state: 2, context: 'condiment', suggested: 'sodium' },
  { id: 678, slug: 'mango-manila-super-ripe', description: 'Mango, Manila super, ripe', source: 'ph_fct', type: 'fruits', state: 1, context: 'whole-fruit', suggested: 'sugar' },
]
export function foodContext(food) {
  return contexts.find(row => food?.id === row.id && food.description_slug === row.slug &&
    food.description === row.description && food.data_source === row.source &&
    food.type?.slug === row.type && (!row.subtype || food.subtype?.slug === row.subtype) && food.state?.id === row.state)?.context ?? 'neutral'
}
export function createLensState(available = lenses.filter(row => row.available).map(row => row.id)) {
  const state = shallowReactive({ food: null, context: 'neutral', mode: 'suggested', manual: null, active: 'sugar' })
  function update() {
    // Additional category suggestions are enabled alongside their implemented lenses.
    const suggested = contexts.find(row => row.context === foodContext(state.food))?.suggested ?? 'sugar'
    state.context = foodContext(state.food)
    state.active = state.manual ?? (available.includes(suggested) ? suggested : available[0])
    state.mode = state.manual ? 'manual' : 'suggested'
  }
  return { state,
    setFood(food) { state.food = food; update() },
    choose(id) { if (!available.includes(id)) return false; state.manual = id; update(); return true },
    useSuggested() { state.manual = null; update() },
  }
}
const formatEquivalent = value => value >= 1e6
  ? new Intl.NumberFormat('en', { notation: 'scientific', maximumFractionDigits: 2 }).format(value)
  : formatNutrient(value)
export function sugarResult(result, comparison) {
  const node = findNutrient(result?.nutrients, 'sugar')
  const grams = node?.unit === 'g' ? exactValue(node) : null
  const base = { grams, count: null, fills: [], capped: false, countText: null,
    amountText: grams === null ? 'Data not available' : `${formatEquivalent(grams)} g`, partial: node?.coverage === 'partial' }
  if (grams === null) return { ...base, status: 'unavailable' }
  if (!comparison?.mode) return { ...base, status: 'unavailable-classification' }
  const denominator = comparison.gramsPerUnit
  if (comparison.status !== 'ready' || !Number.isFinite(denominator) || denominator <= 0) return { ...base, status: 'unavailable-reference' }
  const count = grams / denominator
  if (!Number.isFinite(count)) return { ...base, status: 'unavailable-comparison' }
  const tiny = grams > 0 && count < 0.01
  const capped = count > 8
  const fills = grams === 0 || tiny ? [] : Array.from({ length: Math.min(8, Math.ceil(count)) }, (_, i) => Math.min(1, count - i))
  return { status: grams === 0 ? 'zero' : tiny ? 'tiny' : 'positive', grams, count, fills, capped,
    amountText: `${formatEquivalent(grams)} g`, countText: tiny ? '<0.01' : formatEquivalent(count), partial: false }
}
export const sugarCopy = Object.freeze({
  neutral: 'Dami ng total sugar ang ipinapakita rito. Maaaring natural na nasa pagkain o idinagdag ang asukal; hindi nito sinusukat ang added sugar.',
  'whole-fruit': 'May natural na asukal ang buong prutas. Ang katumbas sa larawan ay timbang ng total sugar, hindi asukal na idinagdag sa prutas.',
})

export const saltTeaspoonGrams = 5

export function sodiumResult(result) {
  const node = findNutrient(result?.nutrients, 'sodium')
  const milligrams = node?.unit === 'mg' ? exactValue(node) : null
  if (milligrams === null) return { status: 'unavailable', milligrams: null, saltGrams: null,
    amountText: 'Data not available', saltText: null, partial: node?.coverage === 'partial',
    teaspoons: null, teaspoonText: null, fills: [], capped: false, tiny: false }
  // mg × 2.5 / 1000, combined to avoid overflowing the intermediate product.
  const salt = milligrams * 0.0025
  const teaspoons = milligrams * (0.0025 / saltTeaspoonGrams)
  const tiny = milligrams > 0 && teaspoons < 0.01
  return { status: milligrams === 0 ? 'zero' : 'positive', milligrams,
    saltGrams: milligrams > 0 && salt === 0 ? null : salt,
    amountText: `${formatEquivalent(milligrams)} mg`,
    saltText: `${milligrams > 0 && salt < 0.01 ? '<0.01' : formatEquivalent(salt)} g`, partial: false,
    teaspoons, teaspoonText: tiny ? '<0.01' : formatEquivalent(teaspoons), tiny, capped: teaspoons > 8,
    fills: milligrams === 0 || tiny ? [] : Array.from({ length: Math.min(8, Math.ceil(teaspoons)) }, (_, i) => Math.min(1, teaspoons - i)) }
}

export function saturatedFatResult(result) {
  const saturatedNode = findNutrient(result?.nutrients, 'saturated fat')
  const totalNode = findNutrient(result?.nutrients, 'total fat')
  const saturated = saturatedNode?.unit === 'g' ? exactValue(saturatedNode) : null
  const total = totalNode?.unit === 'g' ? exactValue(totalNode) : null
  const partial = saturatedNode?.coverage === 'partial' || totalNode?.coverage === 'partial'
  const base = { saturated, total, partial, ratio: null, percent: null, percentText: null, otherFat: null, otherText: null,
    saturatedText: saturated === null ? 'Data not available' : `${formatEquivalent(saturated)} g`,
    totalText: total === null ? 'Data not available' : `${formatEquivalent(total)} g` }
  if (saturated === null || total === null) return { ...base, status: 'unavailable' }
  if (saturated > total) return { ...base, status: 'inconsistent' }
  if (total === 0) return { ...base, status: 'zero-total' }
  const ratio = saturated / total
  const percent = ratio * 100
  const percentText = saturated > 0 && percent < 0.01 ? '<0.01'
    : saturated < total && percent > 99.99 ? '>99.99' : formatNutrient(percent)
  const otherFat = total - saturated
  return { ...base, status: 'valid', ratio, percent, percentText, otherFat, otherText: `${formatEquivalent(otherFat)} g` }
}

export function carbohydrateResult(result, referenceState) {
  const node = findNutrient(result?.nutrients, 'total carbohydrates')
  const grams = node?.unit === 'g' ? exactValue(node) : null
  const base = { grams, amountText: grams === null ? 'Data not available' : `${formatEquivalent(grams)} g`,
    partial: node?.coverage === 'partial', count: null, countText: null, fills: [], capped: false }
  if (grams === null) return { ...base, status: 'unavailable-food' }
  const denominator = referenceState?.reference?.carbs
  if (referenceState?.status !== 'ready' || !Number.isFinite(denominator) || denominator <= 0) return { ...base, status: 'unavailable-reference' }
  const count = grams / denominator
  if (!Number.isFinite(count)) return { ...base, status: 'unavailable-comparison' }
  const tiny = grams > 0 && count < 0.01
  return { ...base, status: grams === 0 ? 'zero' : tiny ? 'tiny' : 'valid', count,
    countText: tiny ? '<0.01' : formatEquivalent(count), capped: count > 8,
    fills: grams === 0 || tiny ? [] : Array.from({ length: Math.min(8, Math.ceil(count)) }, (_, i) => Math.min(1, count - i)) }
}
