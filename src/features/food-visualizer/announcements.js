import { sugarResult, sodiumResult, saturatedFatResult, carbohydrateResult } from './lenses.js'

// Reuse lens presentation results; never derive nutrients or equivalents here.
export function resultAnnouncement(lens, result, referenceState) {
 if (lens === 'sugar') {
  const value = sugarResult(result)
  return `Total sugar: ${value.amountText}. ${value.countText === null
   ? 'Packet equivalent unavailable.' : `${value.countText} five-gram packet equivalents by weight; not packets added.`}`
 }
 if (lens === 'sodium') {
  const value = sodiumResult(result)
  return `Sodium: ${value.amountText}. ${value.saltText === null
   ? 'Salt-equivalent weight unavailable.' : `Approximately ${value.saltText} salt-equivalent weight; not salt added.`}`
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
