import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { calculateFood } from '../../src/vendor/jn-nutrition-core/index.mjs'
import { sugarResult, foodContext, createLensState, sugarCopy, lenses } from '../../src/features/food-visualizer/lenses.js'
const result = (amount, extra={}) => calculateFood({serving_size:100,serving_size_unit:'g',nutrients:[{name:'sugar',unit:'g',amount}],...extra},100,'g')
const captured = async key => JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`,import.meta.url)))
test('25 g means five 5-g weight equivalents, without scaling canonical results again', () => {
 const canonical=result(25), before=structuredClone(canonical), sugar=sugarResult(canonical)
 assert.equal(sugar.grams,25);assert.equal(sugar.count,5);assert.deepEqual(sugar.fills,[1,1,1,1,1]);assert.equal(sugar.capped,false)
 assert.deepEqual(canonical,before)
})
test('fractional packets preserve full precision and render partial fills', () => {
 assert.deepEqual(sugarResult(result(2.5)).fills,[0.5]);assert.equal(sugarResult(result(2.5)).countText,'0.5')
 const sugar=sugarResult(result(6.23456789));assert.equal(sugar.count,6.23456789/5)
 assert.equal(sugar.fills.length,2);assert.equal(sugar.fills[1],sugar.count-1)
})
test('zero has a numeric zero equivalent, distinct from missing', () => {
 const sugar=sugarResult(result(0));assert.equal(sugar.status,'zero');assert.equal(sugar.count,0);assert.equal(sugar.countText,'0');assert.deepEqual(sugar.fills,[])
})
test('small positive values never display zero packets or a misleading minimum fill', () => {
 for(const grams of [0.000001,0.01,0.049,Number.MIN_VALUE]) {
  const sugar=sugarResult(result(grams));assert.equal(sugar.status,'tiny');assert.equal(sugar.countText,'<0.01');assert.deepEqual(sugar.fills,[])
  assert.notEqual(sugar.amountText,'0 g')
 }
 const threshold=sugarResult(result(0.05));assert.equal(threshold.status,'positive');assert.equal(threshold.fills[0],0.01)
})
test('large counts are bounded to 20 illustrations with the full total retained', () => {
 for(const grams of [100,101,1000,Number.MAX_VALUE]) {
  const sugar=sugarResult(result(grams));assert.equal(sugar.fills.length,20);assert.equal(sugar.count,grams/5);assert.equal(sugar.capped,grams>100);if(grams>=1e6)assert(sugar.countText.includes('E'))
 }
})
test('null, omission, malformed, trace, unsupported units and invalid states never gain a count', () => {
 for(const canonical of [null,result(null),result('bad'),result(-1),result(Infinity),
  result(1,{nutrients:[]}),result(1,{nutrients:[{name:'sugar',amount:5,unit:'unknown'}]}),
  result(1,{nutrients:[{name:'sugar',amount:5,unit:'g',qualifier:'trace'}]})]) {
  const sugar=sugarResult(canonical);assert.equal(sugar.status,'unavailable');assert.equal(sugar.count,null);assert.deepEqual(sugar.fills,[])
 }
})
test('captured Coke duplicates and partial recipe do not become exact sugar totals', async () => {
 for(const key of ['coke','recipe','patis']) {
  const food=await captured(key), sugar=sugarResult(calculateFood(food,food.serving_size,food.serving_size_unit))
  assert.equal(sugar.status,'unavailable');assert.equal(sugar.partial,key==='recipe');assert.equal(sugar.count,null)
 }
})
test('actual liquid and whole-fruit portions are calculated once by the core', async () => {
 for(const [key,amount,unit,expected] of [['gata',50,'mL',1.2],['mango',70,'g',13.8*(70/100)]]) {
  const food=await captured(key),sugar=sugarResult(calculateFood(food,amount,unit))
  assert.equal(sugar.grams,expected);assert.equal(sugar.count,expected/5)
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
