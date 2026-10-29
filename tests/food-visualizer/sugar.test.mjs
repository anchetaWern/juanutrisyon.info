import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { calculateFood } from '../../src/vendor/jn-nutrition-core/index.mjs'
import { sugarResult, foodContext, createLensState, sugarCopy, lenses } from '../../src/features/food-visualizer/lenses.js'
import { sugarComparison } from '../../src/features/food-visualizer/sugarComparison.js'
const prepared = { type: { slug: 'prepared-and-processed' } }
const result = (amount, extra={}) => calculateFood({serving_size:100,serving_size_unit:'g',nutrients:[{name:'sugar',unit:'g',amount}],...extra},100,'g')
const captured = async key => JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`,import.meta.url)))
// Synthetic 20-g denominator isolates the presentation math from reference loading.
const reference = sugarComparison(prepared, { status: 'ready', reference: { sugar: 20 } })
const sugar = value => sugarResult(value, reference)
test('the comparison uses the supplied sugar denominator without scaling canonical results again', () => {
 const canonical=result(25), before=structuredClone(canonical), output=sugar(canonical)
 assert.equal(output.grams,25);assert.equal(output.count,1.25);assert.deepEqual(output.fills,[1,.25]);assert.equal(output.capped,false)
 assert.deepEqual(canonical,before)
})
test('fractional glasses preserve full precision and render partial fills', () => {
 assert.deepEqual(sugar(result(10)).fills,[0.5]);assert.equal(sugar(result(10)).countText,'0.5')
 const output=sugar(result(26.23456789));assert.equal(output.count,26.23456789/20)
 assert.equal(output.fills.length,2);assert.equal(output.fills[1],output.count-1)
})
test('zero has a numeric zero equivalent, distinct from missing', () => {
 const output=sugar(result(0));assert.equal(output.status,'zero');assert.equal(output.count,0);assert.equal(output.countText,'0');assert.deepEqual(output.fills,[])
})
test('small positive values never display zero glasses or a misleading minimum fill', () => {
 for(const grams of [0.000001,0.01,0.199,Number.MIN_VALUE]) {
  const output=sugar(result(grams));assert.equal(output.status,'tiny');assert.equal(output.countText,'<0.01');assert.deepEqual(output.fills,[])
  assert.notEqual(output.amountText,'0 g')
 }
 const threshold=sugar(result(0.2));assert.equal(threshold.status,'positive');assert.equal(threshold.fills[0],0.01)
})
test('large counts are bounded to eight glasses with the full total retained', () => {
 for(const grams of [160,161,1000,Number.MAX_VALUE]) {
  const output=sugar(result(grams));assert.equal(output.fills.length,8);assert.equal(output.count,grams/20);assert.equal(output.capped,grams>160);if(grams>=1e6)assert(output.countText.includes('E'))
 }
})
test('null, omission, malformed, trace, unsupported units and invalid states never gain a count', () => {
 for(const canonical of [null,result(null),result('bad'),result(-1),result(Infinity),
  result(1,{nutrients:[]}),result(1,{nutrients:[{name:'sugar',amount:5,unit:'unknown'}]}),
  result(1,{nutrients:[{name:'sugar',amount:5,unit:'g',qualifier:'trace'}]})]) {
  const output=sugar(canonical);assert.equal(output.status,'unavailable');assert.equal(output.count,null);assert.deepEqual(output.fills,[])
 }
})
test('reference failure preserves known sugar, without inventing glasses', () => {
 for(const state of [undefined,{status:'idle'},{status:'loading'},{status:'error'},
  {status:'ready',reference:{sugar:0}},{status:'ready',reference:{sugar:null}},{status:'ready',reference:{sugar:Infinity}}]) {
  const output=sugarResult(result(10),sugarComparison(prepared,state))
  assert.equal(output.grams,10);assert.equal(output.count,null);assert.equal(output.status,'unavailable-reference')
 }
 const output=sugarResult(result(Number.MAX_VALUE),sugarComparison(prepared,{status:'ready',reference:{sugar:.001}}))
 assert.equal(output.status,'unavailable-comparison');assert.equal(output.count,null);assert.deepEqual(output.fills,[])
})
test('captured Coke duplicates and partial recipe do not become exact sugar totals', async () => {
 for(const key of ['coke','recipe','patis']) {
  const food=await captured(key), output=sugar(calculateFood(food,food.serving_size,food.serving_size_unit))
  assert.equal(output.status,'unavailable');assert.equal(output.partial,key==='recipe');assert.equal(output.count,null)
 }
})
test('actual liquid and whole-fruit portions are calculated once by the core', async () => {
 for(const [key,amount,unit,expected] of [['gata',50,'mL',1.2],['mango',70,'g',13.8*(70/100)]]) {
  const food=await captured(key),output=sugar(calculateFood(food,amount,unit))
  assert.equal(output.grams,expected);assert.equal(output.count,expected/20)
 }
})
test('whole-fruit context requires all reviewed identity/preparation evidence; names alone do not classify', async () => {
 const mango=await captured('mango');assert.equal(foodContext(mango),'whole-fruit')
 for(const mutation of [{id:9000},{description_slug:'mango-drink'},{description:'Mango puree'},
  {type:{slug:'beverages'}},{state:{id:2}},{data_source:'nutrition_label'}]) assert.equal(foodContext({...mango,...mutation}),'neutral')
 assert.equal(foodContext({description:'Fresh mango juice powder'}),'neutral')
 assert(sugarCopy['whole-fruit'].includes('hindi asukal na idinagdag'))
})
test('manual choice survives food/portion changes; suggested mode is explicit and unimplemented views cannot be selected', async () => {
 const model=createLensState();model.setFood(await captured('gata'));assert.equal(model.state.mode,'suggested')
 assert.equal(model.choose('sugar'),true);model.setFood(await captured('mango'))
 assert.equal(model.state.mode,'manual');assert.equal(model.state.active,'sugar');assert.equal(model.state.context,'whole-fruit')
 model.setFood(null);assert.equal(model.state.mode,'manual')
 model.setFood({id:7,description:'unknown'});assert.equal(model.state.context,'neutral')
 assert.equal(model.choose('unknown-lens'),false);assert.equal(model.state.active,'sugar')
 model.useSuggested();assert.equal(model.state.mode,'suggested');assert.equal(model.state.manual,null)
 assert.equal(lenses.filter(row=>row.available).length,4)
})
