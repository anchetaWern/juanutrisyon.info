import { sugarResult, sodiumResult, saltTeaspoonGrams, saturatedFatResult, carbohydrateResult } from './lenses.js'

// Reuse lens presentation results; never derive nutrients or equivalents here.
export function resultAnnouncement(lens, result, referenceState) {
 if (lens === 'sugar') {
  const value = sugarResult(result, referenceState)
  const unit = value.count === 1 ? referenceState?.singular : referenceState?.plural
  if (referenceState?.mode === 'teaspoons') return `Total sugar: ${value.amountText}. ${value.countText === null
   ? 'Teaspoon equivalent unavailable.' : `About ${value.countText} ${unit} of sugar by weight. One teaspoon equivalent is ${referenceState.gramsPerUnit} g of sugar; this does not estimate added sugar.`}`
  return `Total sugar: ${value.amountText}. ${value.countText === null
   ? referenceState?.mode === 'cola' ? 'Cola comparison unavailable.' : 'Sugar comparison unavailable; food type is not available.'
   : `About the same total sugar as ${value.countText} ${unit} of cola. One reference glass is 260 g; this does not estimate added sugar.`}`
 }
 if (lens === 'sodium') {
  const value = sodiumResult(result)
  return `Sodium: ${value.amountText}. ${value.saltText === null
   ? 'Salt-equivalent weight and teaspoon equivalent unavailable.'
   : `Approximately ${value.saltText} salt-equivalent weight, or ${value.teaspoonText} ${value.teaspoons === 1 ? 'teaspoon equivalent' : 'teaspoon equivalents'} of salt; not salt added. One teaspoon equivalent is ${saltTeaspoonGrams} g salt.`}`
 }
 if (lens === 'saturated-fat') {
  const value = saturatedFatResult(result)
  const reason = value.status === 'inconsistent' ? 'Reported saturated fat exceeds total fat; share unavailable.'
   : value.status === 'zero-total' ? 'Zero total fat; share unavailable.'
   : value.percentText === null ? 'Complete fat values are needed; share unavailable.'
   : `${value.percentText}% of total fat is saturated fat.`
  return `Saturated fat: ${value.saturatedText}. Total fat: ${value.totalText}. ${reason}`
 }
 if (lens === 'carbohydrates') {
  const value = carbohydrateResult(result, referenceState)
  return `Total carbohydrates: ${value.amountText}. ${value.countText === null ? 'Rice comparison unavailable.'
   : `${value.countText} reference rice ${value.count === 1 ? 'serving' : 'servings'} with a similar carbohydrate amount; not equivalent health effects.`}`
 }
 return ''
}
