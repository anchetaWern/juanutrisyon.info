import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { calculateFood } from '../../src/vendor/jn-nutrition-core/index.mjs'
import { sodiumResult, createLensState, foodContext } from '../../src/features/food-visualizer/lenses.js'
const food = (amount,unit='mg') => ({id:1,serving_size:100,serving_size_unit:'g',nutrients:[{name:'sodium',amount,unit}]})
const captured=async key=>JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`,import.meta.url)))
test('800 mg canonical sodium gives approximately 2 g salt without rescaling or mutation',()=>{
 const canonical=calculateFood(food(800),100,'g'),before=structuredClone(canonical),value=sodiumResult(canonical)
 assert.equal(value.milligrams,800);assert.equal(value.saltGrams,2);assert.equal(value.saltText,'2 g');assert.equal(value.status,'positive')
 assert.deepEqual(canonical,before)
})
test('source grams are normalized to mg by the shared core before lens conversion',()=>{
 const value=sodiumResult(calculateFood(food(0.8,'g'),100,'g'))
 assert.equal(value.milligrams,800);assert.equal(value.saltGrams,2)
})
test('zero is known zero, while tiny positives never display zero salt',()=>{
 const zero=sodiumResult(calculateFood(food(0),100,'g'));assert.equal(zero.status,'zero');assert.equal(zero.saltGrams,0);assert.equal(zero.saltText,'0 g')
 for(const mg of [0.000001,0.01,1,Number.MIN_VALUE]) {
  const result=sodiumResult(calculateFood(food(mg),100,'g'))
  assert.equal(result.status,'positive');assert.equal(result.saltText,'<0.01 g');assert.notEqual(result.amountText,'0 mg')
  if(result.saltGrams===null)assert.equal(mg,Number.MIN_VALUE)
 }
})
test('large finite sodium does not overflow an intermediate multiply and uses bounded display notation',()=>{
 const value=sodiumResult(calculateFood(food(Number.MAX_VALUE),100,'g'))
 assert(Number.isFinite(value.saltGrams));assert.equal(value.saltGrams,Number.MAX_VALUE*0.0025)
 assert(value.amountText.includes('E'));assert(value.saltText.includes('E'))
})
test('missing, invalid, unsupported, ambiguous and unverified results withhold salt equivalents',()=>{
 for(const input of [null,food(null),food(-1),food('bad'),food(Infinity),food(1,'unknown'),
  {...food(800),nutrients:[]},{...food(800),nutrients:[...food(800).nutrients,...food(800).nutrients]},
  {...food(800),data_source:'openfoodfacts'},
  {...food(800),nutrients:[{name:'sodium',amount:800,unit:'mg',qualifier:'trace'}]}]) {
  const result=sodiumResult(input?calculateFood(input,100,'g'):null)
  assert.equal(result.status,'unavailable');assert.equal(result.saltGrams,null);assert.equal(result.saltText,null)
 }
})
test('partial recipe sodium is not interpreted as a complete total',()=>{
 const recipe={id:2,data_source:'community_recipe',serving_size:200,serving_size_unit:'g',recipe:{final_prepared_weight_grams:200},
  recipe_ingredients:[food(800),{...food(0),id:3,nutrients:[]}].map(ingredient=>({serving_size:100,serving_size_unit:'g',ingredient}))}
 const result=sodiumResult(calculateFood(recipe,200,'g'))
 assert.equal(result.partial,true);assert.equal(result.status,'unavailable');assert.equal(result.saltGrams,null)
})
test('captured patis and recipe keep canonical selected-portion values',async()=>{
 const patis=await captured('patis'),sodium=sodiumResult(calculateFood(patis,15,'g'))
 assert.equal(sodium.milligrams,5061*(15/100));assert.equal(sodium.saltGrams,sodium.milligrams*0.0025)
 const recipe=await captured('recipe');assert.equal(sodiumResult(calculateFood(recipe,377,'g')).status,'positive')
})
test('reviewed condiment identity suggests sodium; manual view persists until reset and context mismatches fall back',async()=>{
 const patis=await captured('patis'),model=createLensState();model.setFood(patis)
 assert.equal(foodContext(patis),'condiment');assert.equal(model.state.active,'sodium');assert.equal(model.state.mode,'suggested')
 model.choose('sugar');model.setFood(patis);assert.equal(model.state.active,'sugar');assert.equal(model.state.mode,'manual')
 model.useSuggested();assert.equal(model.state.active,'sodium')
 model.choose('sodium');model.setFood(await captured('mango'));assert.equal(model.state.active,'sodium');assert.equal(model.state.context,'whole-fruit')
 model.useSuggested();assert.equal(model.state.active,'sugar')
 for(const change of [{id:0},{description:'Fish sauce powder'},{subtype:{slug:'beverages'}},{state:{id:1}}]) {
  model.setFood({...patis,...change});assert.equal(model.state.active,'sugar');assert.equal(foodContext({...patis,...change}),'neutral')
 }
 assert.equal(model.choose('unknown-lens'),false)
})
