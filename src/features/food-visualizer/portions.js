import { shallowReactive } from 'vue'
import { calculateFood, findNutrient, exactValue, parseAmount, isExact, normalizeBasis,
  normalizeDensity, normalizeHouseholdMeasure, convertEdibleWeight } from '../../vendor/jn-nutrition-core/index.mjs'

const positive = value => { const parsed = parseAmount(value); return isExact(parsed) && parsed.value > 0 ? parsed.value : null }
export const summaryFields = [
  ['sugar', 'Total sugar', 'g'], ['total carbohydrates', 'Total carbohydrates', 'g'],
  ['dietary fiber', 'Fiber', 'g'], ['sodium', 'Sodium', 'mg'],
  ['saturated fat', 'Saturated fat', 'g'], ['total fat', 'Total fat', 'g'], ['calories', 'Energy', 'kcal'],
]

// This adapter resolves portion evidence only. All nutrient calculations stay in the shared core.
export function resolvePortion(food, option, quantity) {
  quantity = positive(quantity)
  if (!food || !option || quantity === null) return null
  const source = normalizeBasis({ amount: food.serving_size, unit: food.serving_size_unit })
  if (source.state !== 'known') return null
  const evidence = { origin: option.origin, optionId: option.optionId, legacyId: option.legacyId ?? null,
    source: option.source ?? null, conversions: [] }
  let amount, unit
  if (option.origin === 'source' || option.origin === 'direct') {
    amount = option.amount * quantity; unit = option.unit
  } else if (source.dimension === 'volume' && positive(option.volume) !== null) {
    amount = positive(option.volume) * quantity; unit = 'mL'
    evidence.measure = 'supplied_volume'
  } else {
    const measure = normalizeHouseholdMeasure({ quantity, weight_in_grams: option.grams,
      volume_in_ml: option.volume, density: food.density, density_unit: food.density_unit })
    if (!['known', 'explicit_zero'].includes(measure.state) || measure.weight_grams === null) return null
    amount = measure.weight_grams; unit = 'g'; evidence.measure = measure.provenance
    if (measure.provenance === 'volume_times_density') evidence.conversions.push({ method: 'density', density: measure.density_g_per_ml })
  }
  if (positive(amount) === null) return null
  let basis = normalizeBasis({ amount, unit }, 'selected')
  if (basis.state !== 'known') return null
  const selectedEdible = option.edibleBasis ?? food.edible_basis ?? null
  if (selectedEdible !== (food.edible_basis ?? null)) {
    if (basis.dimension !== 'weight' || source.dimension !== 'weight' ||
      !['edible', 'as_purchased'].includes(selectedEdible) || !['edible', 'as_purchased'].includes(food.edible_basis)) return null
    const direction = food.edible_basis === 'edible' ? 'ap_to_ep' : 'ep_to_ap'
    const converted = convertEdibleWeight(basis.amount, food.edible_portion_percent ?? food.edible_portion, direction)
    if (!isExact(converted)) return null
    evidence.conversions.push({ method: direction, enteredGrams: basis.amount, percent: food.edible_portion_percent ?? food.edible_portion })
    amount = converted.value; unit = 'g'; basis = normalizeBasis({ amount, unit }, 'selected')
  }
  if (basis.dimension !== source.dimension) {
    if (![basis.dimension, source.dimension].every(value => ['volume', 'weight'].includes(value))) return null
    const density = normalizeDensity(food.density, food.density_unit)
    if (!isExact(density)) return null
    evidence.conversions.push({ method: 'density', density: density.value })
  } else if (basis.unit !== source.unit) return null
  return { foodId: food.id, slug: food.description_slug, optionId: option.optionId,
    optionKey: option.key, quantity, amount, unit, conversionEvidence: evidence }
}

export function resolveServings(food, overrideId = null) {
  if (!food) return { options: [], defaultKey: null }
  const canonical = Array.isArray(food.serving_profile?.options) ? food.serving_profile.options : []
  const canonicalOptions = canonical.map(row => ({ key: `canonical:${row.id}`, optionId: row.id,
    legacyId: row.legacy_serving_unit_id, label: row.label, grams: row.gram_weight, volume: row.milliliter_volume,
    source: row.source, isDefault: row.is_default === true || row.is_default === 1,
    edibleBasis: row.edible_basis, origin: 'canonical' }))
    .filter(row => row.optionId != null && typeof row.label === 'string' && resolvePortion(food, row, 1))
  const legacyOptions = (legacy, origin) => (Array.isArray(legacy?.serving_units) ? legacy.serving_units : []).map((row, index) => {
    const measure = normalizeHouseholdMeasure({ ...row, quantity: 1, density: food.density, density_unit: food.density_unit })
    return { key: `${origin}:${row.id ?? index}`, optionId: null, legacyId: row.id ?? null,
      label: row.name, grams: measure.provenance === 'supplied_gram_weight' ? measure.weight_grams : null, volume: row.volume_in_ml,
      source: origin, origin, edibleBasis: row.edible_basis }
  }).filter(row => typeof row.label === 'string' && resolvePortion(food, row, 1))
  const specific = legacyOptions(food.custom_servings, 'legacy')
  const subtype = legacyOptions(food.custom_serving_by_subtype, 'subtype')
  const households = canonicalOptions.length ? canonicalOptions : specific.length ? specific : subtype
  const sourceOption = { key: 'source', optionId: null, label: `Recorded serving (${food.serving_size} ${food.serving_size_unit})`,
    amount: positive(food.serving_size), unit: food.serving_size_unit, origin: 'source' }
  const options = [...households]
  if (resolvePortion(food, sourceOption, 1)) options.push(sourceOption)
  const dimension = normalizeBasis({ amount: food.serving_size, unit: food.serving_size_unit }).dimension
  const density = normalizeDensity(food.density, food.density_unit)
  for (const [unit, label, expectedDimension] of [['g', 'Grams', 'weight'], ['mL', 'Milliliters', 'volume']]) {
    if (dimension !== expectedDimension && !(['weight','volume'].includes(dimension) && isExact(density))) continue
    const option = { key: unit, optionId: null, label, amount: 1, unit, origin: 'direct' }
    if (resolvePortion(food, option, 1)) options.push(option)
  }
  const preferred = canonicalOptions.find(row => overrideId !== null && row.optionId === overrideId)
    ?? households.find(row => row.isDefault) ?? households[0] ?? options[0]
  return { options, defaultKey: preferred?.key ?? null }
}

export function nutrientSummary(result) {
  return summaryFields.map(([id, label, unit]) => {
    const node = findNutrient(result?.nutrients, id)
    return { id, label, unit, node, value: node?.unit === unit ? exactValue(node) : null,
      partial: node?.coverage === 'partial' }
  })
}
export function formatNutrient(value) {
  if (value === null) return 'Data not available'
  if (value > 0 && value < 0.01) return '<0.01'
  return new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value)
}

export function createPortionState() {
  const state = shallowReactive({ food: null, options: [], optionKey: null, quantity: '1', error: '', selection: null, result: null })
  function commit(key, input) {
    const option = state.options.find(row => row.key === key)
    const selection = resolvePortion(state.food, option, input)
    if (!selection) { state.error = 'Enter a positive quantity, such as 0.5 or 1.25, with a supported serving.'; return false }
    state.optionKey = key; state.selection = selection
    state.result = calculateFood(state.food, selection.amount, selection.unit)
    state.error = ''; return true
  }
  return { state,
    setFood(food, overrideId = null) {
      state.food = food; state.quantity = '1'; state.error = ''; state.selection = null; state.result = null
      const resolved = resolveServings(food, overrideId); state.options = resolved.options; state.optionKey = resolved.defaultKey
      if (resolved.defaultKey) commit(resolved.defaultKey, '1')
    },
    setQuantity(input) { state.quantity = String(input); return commit(state.optionKey, input) },
    setOption(key) { return commit(key, state.quantity) },
    step(direction) {
      const quantity = (positive(state.quantity) ?? state.selection?.quantity ?? 1) + direction * 0.5
      if (quantity <= 0) return false
      state.quantity = String(quantity); return commit(state.optionKey, state.quantity)
    },
  }
}
