import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createFoodApi } from '../../src/features/food-visualizer/foodApi.js'
import { createFoodSelection } from '../../src/features/food-visualizer/selection.js'
const food = (id = 1) => ({ id, description: `Food ${id}`, description_slug: `food-${id}`, nutrients: [], source_metadata: { proof: ['preserve'] } })
const list = (ids = [1], page = 1) => ({ data: ids.map(food), current_page: page, last_page: 3, total: 5, per_page: 2 })
const response = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers })
const deferred = () => { let resolve, reject; const promise = new Promise((a,b) => { resolve=a; reject=b }); return { promise, resolve, reject } }
const flush = () => new Promise(resolve => setImmediate(resolve))

test('anonymous encoded requests preserve ranking and normalize the envelope', async () => {
  const calls = []
  const api = createFoodApi({ fetcher: async (...args) => { calls.push(args); return response(list([2,1])) } })
  const result = await api.searchFoods({query:' rice  & beans ',page:1})
  assert.deepEqual(result.items.map(row => row.id), [2,1])
  assert.match(calls[0][0], /description=rice\+%26\+beans&page=1/)
  assert.equal(calls[0][1].credentials, 'omit')
  assert.deepEqual(calls[0][1].headers, { Accept:'application/json' })
  assert(Object.isFrozen(result.items[0]))
})
test('search caches are normalized, page-specific, expiring and bounded', async () => {
  let calls = 0, time = 0
  const api = createFoodApi({ now:()=>time, searchTtl:10, searchLimit:2,
    fetcher: async url => { calls++; return response(list([1],Number(new URL(url).searchParams.get('page')))) } })
  await api.searchFoods({query:' Rice '}); await api.searchFoods({query:'rice'})
  assert.equal(calls,1)
  await api.searchFoods({query:'rice',page:2}); await api.searchFoods({query:'rice',page:3})
  await api.searchFoods({query:'rice'}); assert.equal(calls,4)
  time=11; await api.searchFoods({query:'rice'}); assert.equal(calls,5)
})
test('detail cache is independent, bounded and expires', async () => {
  let count=0,time=0
  const api=createFoodApi({now:()=>time,detailTtl:10,detailLimit:1,fetcher:async url=>{count++;return response(food(Number(url.split('-').at(-1))))}})
  await api.getFood({slug:'food-1'});await api.getFood({slug:'food-1'});assert.equal(count,1)
  await api.getFood({slug:'food-2'});await api.getFood({slug:'food-1'});assert.equal(count,3)
  time=11;await api.getFood({slug:'food-1'});assert.equal(count,4)
})
test('deduplicated callers cancel independently and abort transport only after the last subscriber', async () => {
  let calls=0, signal;const pending=deferred()
  const api=createFoodApi({fetcher:(_url,options)=>{calls++;signal=options.signal;return pending.promise}})
  const a=new AbortController(), b=new AbortController()
  const first=api.getFood({slug:'food-1',signal:a.signal}), second=api.getFood({slug:'food-1',signal:b.signal})
  a.abort(); await assert.rejects(first,{name:'AbortError'}); assert.equal(signal.aborted,false)
  pending.resolve(response(food()));assert.equal((await second).id,1);assert.equal(calls,1)
  const c=new AbortController();const third=api.getFood({slug:'food-2',signal:c.signal});c.abort()
  await assert.rejects(third,{name:'AbortError'});assert.equal(signal.aborted,true)
})
test('aborted responses are not cached; failed requests can be retried', async () => {
  const pending=deferred();let count=0
  const api=createFoodApi({fetcher:()=>++count===1?pending.promise:Promise.resolve(response(food()))})
  const controller=new AbortController();const request=api.getFood({slug:'food-1',signal:controller.signal});controller.abort()
  await assert.rejects(request,{name:'AbortError'});pending.resolve(response(food()));await flush()
  await api.getFood({slug:'food-1'});assert.equal(count,2)
})
test('full captured recipe and imported evidence remain deeply equal and immutable', async () => {
  const raw=JSON.parse(await readFile(new URL('./fixtures/captured/recipe.json',import.meta.url)))
  const api=createFoodApi({fetcher:async()=>response(raw)})
  const result=await api.getFood({slug:raw.description_slug});assert.deepEqual(result,raw)
  assert(Object.isFrozen(result.recipe_ingredients[0].ingredient.source_metadata))
})
test('network, 404, 5xx and malformed payloads become safe errors without server detail', async () => {
  for(const [fetcher,code] of [
    [async()=>{throw new Error('secret')},'network'],[async()=>response({trace:'secret'},404),'not_found'],
    [async()=>response({trace:'secret'},503),'server'],[async()=>response({data:food()}),'invalid_response'],
    [async()=>response(food(2)),'invalid_response'],[async()=>new Response('invalid json'),'invalid_response']]) {
    const api=createFoodApi({fetcher});await assert.rejects(api.getFood({slug:'food-1'}),error=>error.code===code&&!error.message.includes('secret'))
  }
})
test('429 honors seconds or date headers globally, with no automatic requests', async () => {
  for(const header of ['10',new Date(11000).toUTCString()]) {
    let count=0,time=1000
    const api=createFoodApi({now:()=>time,fetcher:async()=>{count++;return count===1?response({},429,{'Retry-After':header}):response(food())}})
    await assert.rejects(api.getFood({slug:'food-1'}),e=>e.code==='rate_limited'&&e.retryAt===11000)
    await assert.rejects(api.searchFoods({query:'rice'}),{code:'rate_limited'});assert.equal(count,1)
    time=11000;await api.getFood({slug:'food-1'});assert.equal(count,2)
  }
})
test('unexposed or malformed Retry-After permits a manual retry without a loop', async () => {
  for(const header of [null,'nonsense']) {
    let count=0;const api=createFoodApi({fetcher:async()=>{count++;return response({},429,header?{'Retry-After':header}:{})}})
    await assert.rejects(api.getFood({slug:'food-1'}),e=>e.retryAt===null);assert.equal(count,1)
    await assert.rejects(api.getFood({slug:'food-1'}));assert.equal(count,2)
  }
})
test('empty search, malformed envelope, invalid inputs and API base are explicit', async () => {
  const api=createFoodApi({fetcher:async()=>response(list([]))})
  assert.deepEqual((await api.searchFoods({query:'none'})).items,[])
  await assert.rejects(api.searchFoods({query:' '}),{code:'invalid_query'})
  await assert.rejects(api.searchFoods({query:'rice',page:0}),{code:'invalid_query'})
  await assert.rejects(createFoodApi({fetcher:async()=>response({data:[]})}).searchFoods({query:'rice'}),{code:'invalid_response'})
  assert.throws(()=>createFoodApi({baseUrl:'https://example.com'}))
})
test('typing is local; committed search and pagination survive editing the draft', async () => {
  const calls=[];const model=createFoodSelection({searchFoods:async args=>{calls.push(args);return {items:[food()],page:args.page,lastPage:3,total:5}}})
  model.state.query='rice';assert.equal(calls.length,0);await model.search()
  model.state.query='mango';await model.search(2,model.state.committedQuery)
  assert.deepEqual(calls.map(row=>[row.query,row.page]),[['rice',1],['rice',2]])
})
test('generation checks reject stale searches and selections even when transport ignores abort', async () => {
  const a=deferred(),b=deferred(),c=deferred(),d=deferred()
  const model=createFoodSelection({searchFoods:({query})=>query==='old'?a.promise:b.promise,getFood:({slug})=>slug==='food-1'?c.promise:d.promise})
  const old=model.search(1,'old'), fresh=model.search(1,'new')
  b.resolve({items:[{id:2}],page:1,lastPage:1,total:1});await fresh
  a.resolve({items:[{id:1}],page:1,lastPage:1,total:1});await old;assert.equal(model.state.results[0].id,2)
  const first=model.select({id:1,slug:'food-1'}), second=model.select({id:2,slug:'food-2'})
  d.resolve(food(2));await second;c.resolve(food(1));await first;assert.equal(model.state.selectedFood.id,2)
})
test('change food and disposal invalidate pending work; identity mismatches are not previewed', async () => {
  const pending=deferred();const model=createFoodSelection({getFood:()=>pending.promise})
  const request=model.select({id:1,slug:'food-1'});model.changeFood();pending.resolve(food());await request
  assert.equal(model.state.selectedFood,null);assert.equal(model.state.detailStatus,'idle')
  await model.select({id:2,slug:'food-1'});assert.equal(model.state.detailStatus,'error');assert.equal(model.state.selectedFood,null)
  const next=deferred();const other=createFoodSelection({searchFoods:()=>next.promise})
  const work=other.search(1,'rice');other.dispose();next.resolve({items:[food()],page:1,lastPage:1,total:1});await work
  assert.deepEqual(other.state.results,[])
})
test('search and detail errors support explicit retries and empty states', async () => {
  let count=0
  const model=createFoodSelection({searchFoods:async()=>{if(++count===1)throw new Error();return {items:[],page:1,lastPage:1,total:0}},getFood:async()=>{if(++count===3)throw new Error();return food()}})
  await model.search(1,'rice');assert.equal(model.state.searchStatus,'error');await model.retrySearch();assert.equal(model.state.searchStatus,'empty')
  await model.select({id:1,slug:'food-1'});assert.equal(model.state.detailStatus,'error');await model.retryDetail();assert.equal(model.state.detailStatus,'ready')
})
