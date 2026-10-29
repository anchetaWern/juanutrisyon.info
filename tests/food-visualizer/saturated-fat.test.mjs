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
test('selected portion uses 20 g Daily Value, preserving canonical inputs',()=>{
 const source=food(8,10),canonical=calculateFood(source,50,'g'),before=structuredClone(canonical),fat=saturatedFatResult(canonical)
 assert.equal(fat.status,'valid');assert.equal(fat.saturated,4);assert.equal(fat.percent,20);assert.equal(fat.percentText,'20')
 assert.equal(fat.band,'high');assert.deepEqual(canonical,before)
})
test('exact boundaries and fractions select the band before rounding',()=>{
 for(const [grams,percent,band] of [[0,0,'low'],[1,5,'low'],[1.02,5.1,'mid'],[1.2,6,'mid'],[3.8,19,'mid'],[3.98,19.9,'mid'],[4,20,'high'],[20,100,'high'],[30,150,'high']]) {
  const fat=result(grams,grams);assert.equal(fat.status,'valid');assert.equal(fat.percent,percent);assert.equal(fat.band,band)
  assert.equal(fat.barPercent,Math.min(percent,100));assert.equal(fat.aboveDailyValue,percent>100)
 }
 for(const [grams,text,band] of [[0.999999,'<5','low'],[1.000001,'>5','mid'],[3.999999,'<20','mid'],[4.000001,'>20','high'],[19.999999,'<100','high'],[20.000001,'>100','high']]) {
  const fat=result(grams,grams);assert.equal(fat.percentText,text);assert.equal(fat.band,band)
 }
})
test('explicit zero is valid even with zero or missing total fat',()=>{
 for(const total of [0,10,undefined]) {const fat=result(0,total);assert.equal(fat.status,'valid');assert.equal(fat.percent,0);assert.equal(fat.band,'low')}
})
test('known inconsistent pairs preserve grams and withhold the visualization',()=>{
 for(const [sat,total] of [[8,0],[11,10],[8.000001,8]]) {
  const fat=result(sat,total);assert.equal(fat.status,'inconsistent');assert.equal(fat.saturated,sat);assert.equal(fat.total,total)
  assert.equal(fat.percent,null);assert.equal(fat.band,null)
 }
})
test('missing total fat does not block saturated fat; missing saturated fat remains unavailable',()=>{
 for(const total of [null,undefined]) {
  const fat=result(8,total);assert.equal(fat.status,'valid');assert.equal(fat.saturatedText,'8 g');assert.equal(fat.percent,40)
 }
 const fat=result(undefined,10);assert.equal(fat.total,10);assert.equal(fat.saturated,null);assert.equal(fat.percent,null)
 assert.equal(saturatedFatResult(null).status,'unavailable')
})
test('core normalizes mg and retains invalid, duplicate and import guards',()=>{
 assert.equal(result(8000,10,'mg').percent,40)
 for(const sat of [null,-1,Infinity,'bad']) assert.equal(result(sat,10).percent,null)
 assert.equal(result(8,10,'unknown').saturated,null)
 const source=food(8,10);source.nutrients.push({...source.nutrients[1]})
 assert.equal(saturatedFatResult(calculateFood(source,100,'g')).percent,null)
 const imported={...food(0,10),data_source:'usda_fdc'}
 assert.equal(saturatedFatResult(calculateFood(imported,100,'g')).percent,null)
})
test('partial saturated fat is unavailable; partial total fat alone allows complete saturated fat',()=>{
 const recipe=children=>({id:50,data_source:'community_recipe',serving_size:200,serving_size_unit:'g',recipe:{final_prepared_weight_grams:200},
  recipe_ingredients:children.map((ingredient,index)=>({serving_size:100,serving_size_unit:'g',ingredient:{...ingredient,id:index+1}}))})
 const satPartial=saturatedFatResult(calculateFood(recipe([food(8,10),food(undefined,2)]),200,'g'))
 assert.equal(satPartial.partial,true);assert.equal(satPartial.saturated,null);assert.equal(satPartial.percent,null)
 const totalPartial=saturatedFatResult(calculateFood(recipe([food(1,10),food(2,undefined)]),200,'g'))
 assert.equal(totalPartial.partial,false);assert.equal(totalPartial.saturated,3);assert.equal(totalPartial.total,null);assert.equal(totalPartial.percent,15)
})
test('tiny positive amounts stay distinct from zero, and overflow cannot render infinity',()=>{
 for(const grams of [0.000001,Number.MIN_VALUE]) {
  const tiny=result(grams,grams);assert.equal(tiny.status,'valid');assert.equal(tiny.percentText,'<0.01');assert(tiny.percent>0)
 }
 const large=result(1e100,1e100);assert.equal(large.status,'valid');assert.equal(large.barPercent,100);assert(large.percentText.includes('E'))
 const overflow=result(Number.MAX_VALUE,Number.MAX_VALUE);assert.equal(overflow.status,'unavailable-percentage');assert.equal(overflow.percent,null);assert(overflow.saturatedText.includes('E'))
})
test('captured gata uses portion saturated fat; Coke zero is valid and partial recipe stays unavailable',async()=>{
 const gata=await captured('gata'),value=saturatedFatResult(calculateFood(gata,50,'mL'))
 assert.equal(value.saturated,8.75);assert.equal(value.percent,43.75);assert.equal(value.band,'high')
 const coke=await captured('coke');assert.equal(saturatedFatResult(calculateFood(coke,240,'mL')).percent,0)
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
