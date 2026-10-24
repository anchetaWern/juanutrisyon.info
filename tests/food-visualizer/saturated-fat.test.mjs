import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { calculateFood } from '../../src/vendor/jn-nutrition-core/index.mjs'
import { saturatedFatResult, createLensState, foodContext } from '../../src/features/food-visualizer/lenses.js'
const food=(sat,total,unit='g')=>({id:1,serving_size:100,serving_size_unit:'g',nutrients:[
 ...(total===undefined?[]:[{name:'total fat',amount:total,unit:'g'}]),
 ...(sat===undefined?[]:[{name:'saturated fat',amount:sat,unit}]),
]})
const result=(sat,total,unit)=>saturatedFatResult(calculateFood(food(sat,total,unit),100,'g'))
const captured=async key=>JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`,import.meta.url)))
test('8/10 yields 80 percent with 2 g other fat, preserving canonical inputs',()=>{
 const canonical=calculateFood(food(8,10),100,'g'),before=structuredClone(canonical),fat=saturatedFatResult(canonical)
 assert.equal(fat.status,'valid');assert.equal(fat.ratio,0.8);assert.equal(fat.percent,80);assert.equal(fat.percentText,'80')
 assert.equal(fat.otherFat,2);assert.deepEqual(canonical,before)
})
test('0/10 and 10/10 are valid endpoints; 0/0 has known zeros without ratio',()=>{
 const zero=result(0,10);assert.equal(zero.status,'valid');assert.equal(zero.percent,0);assert.equal(zero.otherFat,10)
 const full=result(10,10);assert.equal(full.status,'valid');assert.equal(full.percent,100);assert.equal(full.otherFat,0)
 const both=result(0,0);assert.equal(both.status,'zero-total');assert.equal(both.saturated,0);assert.equal(both.total,0);assert.equal(both.ratio,null);assert.equal(both.otherFat,null)
})
test('positive saturated fat over zero or a smaller total never clamps into a share',()=>{
 for(const [sat,total] of [[8,0],[11,10],[8.000001,8]]) {
  const fat=result(sat,total);assert.equal(fat.status,'inconsistent');assert.equal(fat.saturated,sat);assert.equal(fat.total,total)
  assert.equal(fat.ratio,null);assert.equal(fat.percentText,null);assert.equal(fat.otherFat,null)
 }
})
test('missing partners preserve individually known gram amounts without inferring saturated fat',()=>{
 for(const total of [null,undefined]) {
  const fat=result(8,total);assert.equal(fat.status,'unavailable');assert.equal(fat.saturated,8);assert.equal(fat.saturatedText,'8 g');assert.equal(fat.total,null);assert.equal(fat.ratio,null)
 }
 const fat=result(undefined,10);assert.equal(fat.total,10);assert.equal(fat.saturated,null);assert.equal(fat.ratio,null)
 assert.equal(saturatedFatResult(null).status,'unavailable')
})
test('source mg normalize through the core; unsupported and invalid records cannot establish a pair',()=>{
 assert.equal(result(8000,10,'mg').percent,80)
 for(const sat of [null,-1,Infinity,'bad']) assert.equal(result(sat,10).ratio,null)
 const unsupported=result(8,10,'unknown');assert.equal(unsupported.saturated,null);assert.equal(unsupported.total,10)
 const source=food(8,10);source.nutrients.push({...source.nutrients[0]})
 const duplicate=saturatedFatResult(calculateFood(source,100,'g'));assert.equal(duplicate.ratio,null);assert.equal(duplicate.saturated,8)
 const imported={...food(0,10),data_source:'usda_fdc'}
 assert.equal(saturatedFatResult(calculateFood(imported,100,'g')).ratio,null)
})
test('partial recipes preserve a known partner but cannot use numeric subtotals as totals',()=>{
 const recipe=children=>({id:50,data_source:'community_recipe',serving_size:200,serving_size_unit:'g',recipe:{final_prepared_weight_grams:200},
  recipe_ingredients:children.map((ingredient,index)=>({serving_size:100,serving_size_unit:'g',ingredient:{...ingredient,id:index+1}}))})
 const satPartial=saturatedFatResult(calculateFood(recipe([food(8,10),food(undefined,2)]),200,'g'))
 assert.equal(satPartial.partial,true);assert.equal(satPartial.saturated,null);assert.equal(satPartial.total,12);assert.equal(satPartial.ratio,null)
 const totalPartial=saturatedFatResult(calculateFood(recipe([food(0,10),food(0,undefined)]),200,'g'))
 assert.equal(totalPartial.partial,true);assert.equal(totalPartial.saturated,0);assert.equal(totalPartial.total,null);assert.equal(totalPartial.ratio,null)
})
test('tiny and nearly complete shares do not display false zero or 100-percent claims',()=>{
 const tiny=result(0.000001,10);assert.equal(tiny.status,'valid');assert.equal(tiny.percentText,'<0.01');assert(tiny.ratio>0)
 const near=result(9.999999,10);assert.equal(near.percentText,'>99.99');assert(near.otherFat>0);assert.notEqual(near.otherText,'0 g')
 const extreme=result(Number.MIN_VALUE,Number.MAX_VALUE);assert.equal(extreme.status,'valid');assert.equal(extreme.percentText,'<0.01')
})
test('large finite pairs compute without intermediate overflow; display rounding never drives validity',()=>{
 const fat=result(Number.MAX_VALUE/2,Number.MAX_VALUE)
 assert.equal(fat.percent,50);assert(Number.isFinite(fat.otherFat));assert(fat.saturatedText.includes('E'))
 const rounded=result(1.234567,2.345678);assert.equal(rounded.ratio,1.234567/2.345678)
 assert.equal(rounded.saturatedText,'1.23 g');assert.equal(rounded.totalText,'2.35 g')
})
test('captured gata supplies the actual part-to-whole result; Coke has two zeros and recipe remains partial',async()=>{
 const gata=await captured('gata'),value=saturatedFatResult(calculateFood(gata,50,'mL'))
 assert.equal(value.saturated,8.75);assert.equal(value.total,11);assert.equal(value.otherFat,2.25);assert.equal(value.ratio,8.75/11)
 const coke=await captured('coke');assert.equal(saturatedFatResult(calculateFood(coke,240,'mL')).status,'zero-total')
 const recipe=await captured('recipe');assert.equal(saturatedFatResult(calculateFood(recipe,377,'g')).partial,true)
})
test('gata context suggests the enabled fat lens; manual choices persist and identity mismatches do not classify',async()=>{
 const gata=await captured('gata'),model=createLensState();model.setFood(gata)
 assert.equal(foodContext(gata),'coconut-cream');assert.equal(model.state.active,'saturated-fat')
 model.choose('sugar');model.setFood(gata);assert.equal(model.state.active,'sugar');model.useSuggested();assert.equal(model.state.active,'saturated-fat')
 model.choose('saturated-fat');model.setFood(await captured('patis'));assert.equal(model.state.active,'saturated-fat')
 model.useSuggested();assert.equal(model.state.active,'sodium')
 for(const change of [{id:2},{description:'Coconut drink'},{description_slug:'coconut-powder'},{state:{id:1}},{data_source:'unknown'}]) {
  model.setFood({...gata,...change});assert.equal(model.state.active,'sugar');assert.equal(foodContext({...gata,...change}),'neutral')
 }
 assert.equal(model.choose('unknown-lens'),false)
})
