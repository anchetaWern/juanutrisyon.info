import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { calculateFood } from '../../src/vendor/jn-nutrition-core/index.mjs'
import { calculateRiceReference, createRiceReference } from '../../src/features/food-visualizer/riceReference.js'
import { carbohydrateResult, createLensState } from '../../src/features/food-visualizer/lenses.js'
import { createFoodApi } from '../../src/features/food-visualizer/foodApi.js'
const captured=async key=>JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`,import.meta.url)))
const result=amount=>calculateFood({serving_size:100,serving_size_unit:'g',nutrients:[{name:'total carbohydrates',amount,unit:'g'}]},100,'g')
const deferred=()=>{let resolve;const promise=new Promise(done=>resolve=done);return {resolve,promise}}
test('reference is calculated from the actual canonical 80-g option; equal carbs give one serving',async()=>{
 const rice=await captured('rice'),before=structuredClone(rice),ref=calculateRiceReference(rice)
 assert.equal(ref.amount,80);assert.equal(ref.carbs,23.76);assert.equal(ref.optionId,206)
 assert.equal(carbohydrateResult(calculateFood(rice,80,'g'),{status:'ready',reference:ref}).count,1)
 assert.deepEqual(rice,before)
 const changed=structuredClone(rice);changed.nutrients.find(row=>row.name==='total carbohydrates').amount='30'
 assert.equal(calculateRiceReference(changed).carbs,24) // Never a hardcoded denominator.
})
test('missing/changed option, identity, weight or provenance fail closed',async()=>{
 const rice=await captured('rice')
 for(const mutate of [f=>f.id=99,f=>f.custom_id='other',f=>f.serving_profile.options=[],
  f=>f.serving_profile.options[0].gram_weight='81',f=>f.serving_profile.options[0].id=168,
  f=>f.serving_profile.options[0].label='1 cup',f=>f.serving_profile.options[0].source='unknown',
  f=>f.serving_profile.options.push({...f.serving_profile.options[0]})]) {
  const copy=structuredClone(rice);mutate(copy);assert.throws(()=>calculateRiceReference(copy))
 }
})
test('missing/zero/duplicate reference carbs cannot establish a denominator',async()=>{
 for(const amount of [null,0,'bad']) {
  const rice=await captured('rice');rice.nutrients=[{name:'total carbohydrates',amount,unit:'g'}]
  assert.throws(()=>calculateRiceReference(rice))
 }
 const rice=await captured('rice');rice.nutrients.push({name:'total carbohydrates',amount:29.7,unit:'g'})
 assert.throws(()=>calculateRiceReference(rice))
})
test('fractional, capped, tiny and zero comparisons retain exact math and bounded illustrations',()=>{
 const ref={status:'ready',reference:{carbs:20}}
 assert.equal(carbohydrateResult(result(10),ref).count,0.5)
 assert.deepEqual(carbohydrateResult(result(10),ref).fills,[0.5])
 const large=carbohydrateResult(result(200),ref);assert.equal(large.fills.length,8);assert.equal(large.count,10);assert(large.capped)
 const tiny=carbohydrateResult(result(0.00001),ref);assert.equal(tiny.status,'tiny');assert.equal(tiny.countText,'<0.01');assert.deepEqual(tiny.fills,[])
 const zero=carbohydrateResult(result(0),ref);assert.equal(zero.status,'zero');assert.equal(zero.count,0);assert.equal(zero.countText,'0')
})
test('reference errors never hide known food carbs or invent equivalents, including numeric overflow',()=>{
 for(const state of [{status:'idle'},{status:'loading'},{status:'error'},{status:'ready',reference:{carbs:0}},{status:'ready',reference:{carbs:null}}]) {
  const output=carbohydrateResult(result(10),state);assert.equal(output.grams,10);assert.equal(output.count,null);assert.equal(output.status,'unavailable-reference')
 }
 assert.equal(carbohydrateResult(result(Number.MAX_VALUE),{status:'ready',reference:{carbs:0.001}}).status,'unavailable-comparison')
})
test('Coke duplicates and partial recipes withhold equivalence; sugar absence does not hide carbs',async()=>{
 const ref={status:'ready',reference:calculateRiceReference(await captured('rice'))}
 for(const key of ['coke','recipe']) {
  const food=await captured(key);const output=carbohydrateResult(calculateFood(food,food.serving_size,food.serving_size_unit),ref)
  assert.equal(output.status,'unavailable-food');assert.equal(output.count,null)
 }
 assert.equal(carbohydrateResult(result(20),ref).status,'valid')
})
test('lazy loader deduplicates against selected-food requests and reuses a selected rice object',async()=>{
 const rice=await captured('rice'),pending=deferred();let count=0
 const api=createFoodApi({fetcher:()=>{count++;return pending.promise}})
 const loader=createRiceReference(api);assert.equal(count,0)
 const selected=api.getFood({slug:rice.description_slug}),a=loader.ensure(),b=loader.ensure()
 pending.resolve(new Response(JSON.stringify(rice)));await Promise.all([selected,a,b]);assert.equal(count,1)
 assert.equal(loader.state.reference.carbs,23.76)
 await loader.ensure();assert.equal(count,1)
 const direct=createRiceReference({getFood:()=>{throw new Error('No request expected')}})
 await direct.ensure(rice);assert.equal(direct.state.status,'ready')
})
test('reference failure needs manual retry; retry is independent of food results',async()=>{
 const rice=await captured('rice');let count=0
 const loader=createRiceReference({getFood:async()=>{if(++count===1)throw new Error('offline');return rice}})
 await loader.ensure();assert.equal(loader.state.status,'error');await loader.ensure();assert.equal(count,1)
 await loader.retry();assert.equal(count,2);assert.equal(loader.state.status,'ready')
})
test('updated selected reference and disposal defeat stale loader responses',async()=>{
 const rice=await captured('rice'),pending=deferred()
 const loader=createRiceReference({getFood:()=>pending.promise});const work=loader.ensure()
 const changed=structuredClone(rice);changed.serving_profile.options[0].gram_weight=81
 await loader.ensure(changed);pending.resolve(rice);await work;assert.equal(loader.state.status,'error');assert.equal(loader.state.reference,null)
 const pending2=deferred(),other=createRiceReference({getFood:()=>pending2.promise});const work2=other.ensure();other.dispose();pending2.resolve(rice);await work2
 assert.equal(other.state.reference,null)
})
test('staples suggest carbs without inventing measured starch; manual lenses persist',async()=>{
 const model=createLensState();model.setFood(await captured('rice'));assert.equal(model.state.active,'carbohydrates');assert.equal(model.state.context,'staple')
 model.choose('sugar');model.setFood(await captured('pandesal'));assert.equal(model.state.active,'sugar');model.useSuggested();assert.equal(model.state.active,'carbohydrates')
 assert.equal(model.choose('unknown-lens'),false)
})
