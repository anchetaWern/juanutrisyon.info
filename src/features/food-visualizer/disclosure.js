import { exactValue } from '../../vendor/jn-nutrition-core/index.mjs'
import { summaryFields, formatNutrient } from './portions.js'
import { siteConfig } from '../../config/site.js'

export const sourceNames = Object.freeze({ ph_fct: 'Philippine Food Composition Tables', usda_fdc: 'USDA FoodData Central',
 nutrition_label: 'Nutrition label', community_recipe: 'Community recipe', openfoodfacts: 'Open Food Facts' })
export function publicSourceUrl(input) {
 if (typeof input !== 'string') return null
 try {
  const url = new URL(input)
  if (url.protocol !== 'https:' || url.username || url.password || !url.hostname.includes('.') ||
    /^\[|^\d+(?:\.\d+){3}$/.test(url.hostname) || /(^|\.)(localhost|local|internal|test|invalid)$/.test(url.hostname)) return null
  return url.href
 } catch { return null }
}
export function foodHandoff(food) {
 const slug = food?.description_slug
 if (typeof slug !== 'string' || !slug.trim()) return null
 const encoded = encodeURIComponent(slug)
 return { details: `${siteConfig.appUrl}/food/${food.data_source === 'usda_fdc' ? 'archive/' : ''}${encoded}`,
  compare: `${siteConfig.appUrl}/search?${new URLSearchParams({ food1: slug })}` }
}
const text = value => typeof value === 'string' && value.trim() ? value : typeof value === 'number' && Number.isFinite(value) ? String(value) : null
export function sourceDisclosure(food, selection) {
 if (!food) return { rows: [], links: [], labelUnavailable: false, recipe: false }
 const metadata = food.source_metadata ?? {}, rows = []
 const add = (label, value) => { const safe = text(value); if (safe !== null) rows.push({ label, value: safe }) }
 add('JN food ID', food.id);add('Source', sourceNames[food.data_source] ?? food.data_source ?? 'Not specified')
 add('Source food ID', metadata.source_food_id ?? food.custom_id)
 add('Database subset', metadata.database_subset);add('Source edition/version', metadata.source_version)
 add('Source publication date', metadata.source_published_at);add('Source update date', metadata.source_updated_at)
 add('Source retrieved at', metadata.retrieved_at)
 if (food.serving_size != null && food.serving_size_unit) add('Recorded nutrient basis', `${food.serving_size} ${food.serving_size_unit}`)
 if (food.edible_basis) add('Weight basis', food.edible_basis)
 else add('Weight basis', 'Not specified in the supplied record; no edible-portion conversion is inferred')
 if (food.edible_portion != null) add('Recorded edible portion', `${food.edible_portion}%`)
 if (metadata.import_normalization?.version) add('Import normalization', metadata.import_normalization.version)
 if (selection) {
  add('Selected portion', `${selection.amount} ${selection.unit}`);add('Quantity', selection.quantity)
  add('Serving option ID', selection.optionId)
  const option = food.serving_profile?.options?.find(row => row.id === selection.optionId)
  add('Household label', option?.label)
  add('Serving profile ID', option?.serving_profile_id)
  add('Legacy serving ID', selection.conversionEvidence?.legacyId)
  add('Serving evidence', selection.conversionEvidence?.source ?? selection.conversionEvidence?.origin)
 }
 if (food.recipe) {
  add('Recipe yield method', food.recipe.yield_method)
  add('Prepared recipe weight (g)', food.recipe.final_prepared_weight_grams)
  add('Ingredient records', Array.isArray(food.recipe.ingredients) ? food.recipe.ingredients.length : null)
 }
 const links = [['Original nutrient report', metadata.source_url, 'source_report'], ['Product nutrition label', food.nutrition_label_image, 'source_label'],
  ['Recipe source', food.recipe?.source_url ?? food.recipe_source?.source_url, 'source_recipe']].flatMap(([label, raw, destination]) => {
   const href = publicSourceUrl(raw);return href ? [{label,href,destination}] : []
  })
 return {rows,links,labelUnavailable:!!food.nutrition_label_image&&!publicSourceUrl(food.nutrition_label_image),
  recipe: food.data_source === 'community_recipe' || !!food.recipe,
  structureUnavailable: !!food.recipe_structure_status}
}
export function moreNutrients(result) {
 const excluded = new Set(summaryFields.map(([id]) => id)), seen = new Set(), rows = []
 function visit(nodes) {
  for (const node of nodes ?? []) {
   const value = exactValue(node)
   if (!excluded.has(node.nutrient_id) && !seen.has(node.nutrient_id) && value !== null && node.unit &&
     !['food type','added sugar','water','ash','total ash'].includes(node.nutrient_id)) {
    seen.add(node.nutrient_id);rows.push({id:node.nutrient_id, label:node.nutrient_id, value, unit:node.unit, display:`${formatNutrient(value)} ${node.unit}`})
   }
   visit(node.composition)
  }
 }
 visit(result?.nutrients)
 return rows
}
