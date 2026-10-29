import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolvePortion, resolveServings, createPortionState, nutrientSummary, formatNutrient } from '../../src/features/food-visualizer/portions.js'
import { calculateFood } from '../../src/vendor/jn-nutrition-core/index.mjs'
const captured = async key => JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`, import.meta.url)))
const synthetic = extra => ({ id:1, description_slug:'synthetic', serving_size:100, serving_size_unit:'g',
 nutrients:[{name:'sugar',amount:10,unit:'g'}], ...extra })
const option = (id, grams, extra={}) => ({id,label:`Option ${id}`,gram_weight:grams,...extra})
const sugar = state => nutrientSummary(state.result).find(row=>row.id==='sugar')

test('canonical default is honored even when second; override uses canonical IDs, not legacy IDs', () => {
 const food=synthetic({serving_profile:{options:[option(10,20),option(11,80,{is_default:true,legacy_serving_unit_id:101})]}})
 assert.equal(resolveServings(food).defaultKey,'canonical:11')
 assert.equal(resolveServings(food,10).defaultKey,'canonical:10')
 assert.equal(resolveServings(food,101).defaultKey,'canonical:11')
 const selected=resolvePortion(food,resolveServings(food).options[1],0.375)
 assert.equal(selected.amount,30);assert.equal(selected.optionId,11);assert.equal(selected.conversionEvidence.legacyId,101)
})
test('unusable default is skipped; canonical fallback, legacy and source bases remain distinct', () => {
 const food=synthetic({serving_profile:{options:[option(1,null,{is_default:true}),option(2,30)]},custom_servings:{serving_units:[{id:77,name:'legacy',weight:80,weight_unit:'g'}]}})
 assert.equal(resolveServings(food).defaultKey,'canonical:2')
 food.serving_profile.options=[];assert.equal(resolveServings(food).defaultKey,'legacy:77')
 delete food.custom_servings;assert.equal(resolveServings(food).defaultKey,'source')
 food.serving_size_unit='can';assert.equal(resolveServings(food).options.length,0)
})
test('supplied subtype option is usable without catalog inference', () => {
 const food=synthetic({custom_serving_by_subtype:{serving_units:[{id:7,name:'subtype measure',weight:25,weight_unit:'g'}]}})
 food.custom_servings={serving_units:[{id:8,name:'unusable',weight:null}]}
 const resolved=resolveServings(food);assert.equal(resolved.defaultKey,'subtype:7')
 assert.equal(resolvePortion(food,resolved.options[0],1).conversionEvidence.origin,'subtype')
})
test('captured household portions, fractional quantities and source choices use unchanged raw food data', async () => {
 for(const key of ['rice','pandesal','mango','patis','coke','gata','recipe']) {
  const food=await captured(key), before=structuredClone(food), model=createPortionState()
  model.setFood(food)
  assert(model.state.selection,key)
  for(const option of model.state.options) for(const quantity of [0.125,0.375,1,1.5,2]) {
   assert(model.setQuantity(quantity));assert(model.setOption(option.key))
   const {amount,unit}=model.state.selection
   assert.deepEqual(model.state.result,calculateFood(food,amount,unit))
   assert.equal(nutrientSummary(model.state.result).length,7)
  }
  assert.deepEqual(food,before)
 }
})
test('rice 206 resolves 80 g; fractional pandesal preserves all portion decimals', async () => {
 const rice=createPortionState();rice.setFood(await captured('rice'))
 assert.equal(rice.state.selection.optionId,206);assert.equal(rice.state.selection.amount,80)
 assert.equal(nutrientSummary(rice.state.result).find(row=>row.id==='total carbohydrates').value,29.7*(80/100))
 const bread=createPortionState();bread.setFood(await captured('pandesal'));bread.setQuantity('0.375')
 assert.equal(bread.state.selection.amount,23.33*0.375)
})
test('volume source multiples never invent a can or grams without density', async () => {
 const model=createPortionState();model.setFood(await captured('coke'))
 assert.equal(model.state.optionKey,'source');assert.equal(model.state.selection.amount,240)
 model.setQuantity('2');assert.equal(model.state.selection.amount,480);assert.equal(model.state.selection.unit,'mL')
 assert(!model.state.options.some(option=>option.key==='g'||option.label.includes('can')))
 assert.equal(sugar(model.state).value,null) // Existing duplicate-parent guard.
 assert.equal(nutrientSummary(model.state.result).find(row=>row.id==='saturated fat').value,0)
})
test('household volume for a volume source works without density', () => {
 const food=synthetic({serving_size:100,serving_size_unit:'mL',serving_profile:{options:[option(2,null,{milliliter_volume:15})]}})
 const selected=resolvePortion(food,resolveServings(food).options[0],2)
 assert.equal(selected.amount,30);assert.equal(selected.unit,'mL')
 assert.equal(selected.conversionEvidence.measure,'supplied_volume')
})
test('cross-dimension measures require a documented density and preserve conversion evidence', () => {
 const food=synthetic({serving_size_unit:'mL',serving_profile:{options:[option(2,30)]},density:1.2})
 assert.equal(resolveServings(food).defaultKey,'source') // Scalar density with no unit rejected.
 food.density_unit='g/mL';assert.equal(resolveServings(food).defaultKey,'canonical:2')
 const model=createPortionState();model.setFood(food)
 assert.equal(sugar(model.state).value,2.5)
 assert.equal(model.state.selection.conversionEvidence.conversions[0].density,1.2)
 const legacy=synthetic({density:{density:1.2,unit:'g/mL'},custom_servings:{serving_units:[{id:8,name:'supplied volume',volume_in_ml:15}]}})
 const serving=resolveServings(legacy)
 const selection=resolvePortion(legacy,serving.options[0],2)
 assert.equal(selection.amount,36);assert.equal(selection.conversionEvidence.measure,'volume_times_density')
 assert.equal(selection.conversionEvidence.conversions[0].density,1.2)
})
test('count-based foods support count multiples, not arbitrary mass or volume', () => {
 const model=createPortionState();model.setFood(synthetic({serving_size:2,serving_size_unit:'serving'}));model.setQuantity('0.5')
 assert.equal(model.state.selection.amount,1);assert.equal(sugar(model.state).value,5)
 assert.equal(model.state.options.length,1)
})
test('explicit edible-basis conversion uses shared primitives and rejects missing evidence', () => {
 const food=synthetic({edible_basis:'edible',edible_portion:80,serving_profile:{options:[option(2,100,{edible_basis:'as_purchased'})]}})
 const model=createPortionState();model.setFood(food)
 assert.equal(model.state.selection.amount,80);assert.equal(sugar(model.state).value,8)
 assert.equal(model.state.selection.conversionEvidence.conversions[0].method,'ap_to_ep')
 food.edible_portion=null;assert.equal(resolveServings(food).defaultKey,'source')
 food.edible_portion=80;food.edible_basis='as_purchased';food.serving_profile.options[0].edible_basis='edible'
 model.setFood(food);assert.equal(model.state.selection.amount,125);assert.equal(sugar(model.state).value,12.5)
 assert.equal(model.state.selection.conversionEvidence.conversions[0].method,'ep_to_ap')
})
test('invalid quantities retain last valid selection and results; valid edits recover', () => {
 const model=createPortionState();model.setFood(synthetic());model.setQuantity('1.25')
 const selection=model.state.selection,result=model.state.result
 for(const value of ['',0,-1,'1/2','NaN','Infinity','1e999','abc']) {
  assert.equal(model.setQuantity(value),false)
  assert.equal(model.state.selection,selection);assert.equal(model.state.result,result);assert(model.state.error)
 }
 assert(model.setQuantity('0.125'));assert.equal(model.state.error,'');assert.equal(sugar(model.state).value,1.25)
 model.step(1);assert.equal(model.state.selection.quantity,0.625)
})
test('food changes reset portion, validation and result state', () => {
 const model=createPortionState();model.setFood(synthetic());model.setQuantity('bad');model.setFood(null)
 assert.equal(model.state.selection,null);assert.equal(model.state.result,null);assert.equal(model.state.error,'');assert.deepEqual(model.state.options,[])
})
test('seven fields distinguish zero, null, omission and partial recipe contributions', async () => {
 const model=createPortionState();model.setFood(synthetic({nutrients:[{name:'sugar',amount:0,unit:'g'},{name:'sodium',amount:null,unit:'mg'}]}))
 const summary=nutrientSummary(model.state.result)
 assert.equal(summary[0].value,0);assert.equal(summary.find(row=>row.id==='sodium').value,null)
 assert.equal(summary.find(row=>row.id==='dietary fiber').value,null)
 model.setFood(await captured('recipe'));const rows=nutrientSummary(model.state.result)
 assert(rows.find(row=>row.id==='sugar').partial);assert.equal(sugar(model.state).value,null)
 assert.notEqual(rows.find(row=>row.id==='sodium').value,null)
})
test('display rounding never converts small positive values into zero or changes exact results', () => {
 assert.equal(formatNutrient(0),'0');assert.equal(formatNutrient(0.00001),'<0.01')
 assert.equal(formatNutrient(null),'Data not available');assert.equal(formatNutrient(1.234567),'1.23')
 const model=createPortionState();model.setFood(synthetic());model.setQuantity('0.1234567')
 const value=sugar(model.state).value;formatNutrient(value);assert.equal(sugar(model.state).value,value)
})
