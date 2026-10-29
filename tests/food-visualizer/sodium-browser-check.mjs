import { makeVisualizerTestFood, visualizerSearchMeta, fulfillColaReference } from './visualizer-test-food.mjs'
import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
const {chromium}=await import(process.env.JN_PLAYWRIGHT_PATH?pathToFileURL(process.env.JN_PLAYWRIGHT_PATH).href:'playwright')
const captured=async key=>makeVisualizerTestFood(JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`,import.meta.url))))
// These synthetic boundary fixtures are test-only, never production suggestions.
const synthetic=(id,description,amount)=>({id,description,description_slug:`synthetic-${id}`,data_source:'nutrition_label',custom_servings:{serving_units:[{id:900000,name:'Synthetic test portion',weight:100,weight_unit:'g'}]},serving_size:100,serving_size_unit:'g',nutrients:[{name:'sodium',amount,unit:'mg'}]})
const partial={...synthetic(900004,'Synthetic partial recipe fixture',0),data_source:'community_recipe',recipe:{final_prepared_weight_grams:200},
 recipe_ingredients:[synthetic(900005,'Synthetic ingredient',800),{...synthetic(900006,'Missing ingredient sodium',null),nutrients:[]}].map(ingredient=>({data_source:'nutrition_label',custom_servings:{serving_units:[{id:900000,name:'Synthetic test portion',weight:100,weight_unit:'g'}]},serving_size:100,serving_size_unit:'g',ingredient}))}
const foods=[await captured('patis'),await captured('mango'),synthetic(900001,'Synthetic 800 mg fixture',800),synthetic(900002,'Synthetic zero fixture',0),synthetic(900003,'Synthetic missing fixture',null),partial,synthetic(900007,'Synthetic 2000 mg fixture',2000)]
const output=process.env.JN_SALT_OUTPUT ?? '/private/tmp/jn-salt-browser'
await mkdir(output,{recursive:true})
const browser=await chromium.launch({headless:true})
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),calls=[],errors=[]
 page.on('pageerror',error=>errors.push(error.message))
 await page.route('**/api/foods**',async route=>{
  const url=new URL(route.request().url());calls.push(url.href)
  if (await fulfillColaReference(route)) return
  await route.fulfill({json:url.pathname.endsWith('/foods')?{...visualizerSearchMeta,data:foods,current_page:1,last_page:1,per_page:20,total:foods.length}:foods.find(row=>url.pathname.endsWith(`/${row.description_slug}`))})
 })
 await page.goto(process.env.JN_VISUALIZER_URL??'http://127.0.0.1:4327/tools/food-visualizer')
 await page.getByLabel('Food name').fill('test');await page.getByLabel('Food name').press('Enter')
 const choose=async index=>{if(await page.locator('.back-results').isVisible())await page.locator('.back-results').click();
  await page.locator('.result-list button').filter({hasText:foods[index].description}).click()
  await page.getByRole('heading',{name:foods[index].description,exact:true}).waitFor()
 }
 await choose(0)
 const visual=page.locator('[data-sodium-result]')
 await visual.waitFor();assert((await visual.innerText()).includes('0.38 teaspoon equivalents'));assert.equal(await visual.locator('[data-salt-teaspoons] .teaspoon').count(),1);assert((await visual.innerText()).includes('759.15 mg'));assert((await visual.innerText()).includes('1.9 g salt-equivalent weight'))
 await page.getByText('Suggested view: Sodium',{exact:true}).waitFor()
 const count=calls.length
 await page.getByLabel('Quantity',{exact:true}).fill('2')
 assert((await visual.innerText()).includes('1,518.3 mg'))
 assert((await visual.innerText()).includes('3.8 g salt-equivalent weight'))
 assert.equal(calls.length,count)
 await page.getByRole('radio',{name:'Sodium',exact:true}).press('ArrowLeft')
 await page.locator('[data-sugar-result]').waitFor()
 assert((await page.locator('[data-sugar-result]').innerText()).includes('Data not available'))
 await page.getByRole('radio',{name:'Sugar',exact:true}).press('ArrowRight')
 await visual.waitFor();await page.getByText('Your chosen view: Sodium',{exact:true}).waitFor()
 assert.equal(calls.length,count)
 for(const width of [1440,768,390]) {
  await page.setViewportSize({width,height:1000})
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
  if(process.env.JN_AXE_PATH) {
   await page.addScriptTag({path:process.env.JN_AXE_PATH})
   const violations=await page.evaluate(async()=>(await axe.run(document.querySelector('.lens-controls'))).violations.map(v=>v.id))
   assert.deepEqual(violations,[])
  }
  await page.locator('.lens-controls').screenshot({path:`${output}/${width}-sodium.png`})
  if(width===1440) {
   const html=await page.evaluate(()=>{
    const root=document.documentElement.cloneNode(true);root.querySelectorAll('script').forEach(node=>node.remove())
    const base=document.createElement('base');base.href=location.origin+'/';root.querySelector('head').prepend(base)
    return '<!doctype html>'+root.outerHTML
   })
   await writeFile(`${output}/rendered-sodium.html`,html)
  }
 }
 await page.getByLabel('Quantity',{exact:true}).fill('0.000000001')
 assert((await visual.innerText()).includes('<0.01 g'));assert(!(await visual.innerText()).includes('≈ 0 g'))
 await page.getByLabel('Quantity',{exact:true}).fill('')
 assert((await page.locator('.lens-result').innerText()).includes('last valid portion'))
 await choose(1);await visual.waitFor()
 await page.getByText('Your chosen view: Sodium',{exact:true}).waitFor()
 await page.getByRole('button',{name:'Use suggested view',exact:true}).click()
 await page.locator('[data-sugar-result]').waitFor();assert.equal(await page.locator('[data-sugar-context]').getAttribute('data-context'),'whole-fruit')
 await page.getByRole('radio',{name:'Sodium',exact:true}).check()
 for(const index of [2,3,4,5]) {
  await choose(index);await visual.waitFor()
  const text=await visual.innerText()
  if(index===2) {assert(text.includes('800 mg'));assert(text.includes('≈ 2 g salt-equivalent weight'));assert(text.includes('0.4 teaspoon equivalents'));assert.equal(Number(await visual.locator('.teaspoon').getAttribute('data-fill')),.4)}
  if(index===3) {assert.equal(await visual.getAttribute('data-status'),'zero');assert(text.includes('≈ 0 g salt-equivalent weight'));assert.equal(await visual.locator('svg').count(),0)}
  if(index>=4) {assert.equal(await visual.getAttribute('data-status'),'unavailable');assert.equal(await visual.locator('svg').count(),0);assert(!text.includes('≈'))}
  if(index===5) assert(text.includes('incomplete sodium data'))
 }
 await choose(6);await visual.waitFor()
 assert((await visual.innerText()).includes('1 teaspoon equivalent of salt'))
 assert.equal(Number(await visual.locator('.teaspoon').getAttribute('data-fill')),1)
 const before=calls.length
 await page.getByLabel('Quantity',{exact:true}).fill('20')
 assert.equal(await visual.locator('.teaspoon').count(),8)
 assert((await visual.innerText()).includes('20 teaspoon equivalents'))
 await page.getByLabel('Quantity',{exact:true}).fill('0.0001')
 assert.equal(await visual.locator('.teaspoon').count(),0)
 assert((await visual.innerText()).includes('<0.01 teaspoon equivalents'))
 assert.equal(calls.length,before)
 assert.equal(calls.length,8)
 assert.equal(calls.filter(url=>url.includes('/softdrink-cola')).length,0)
 assert.equal(calls.filter(url=>url.includes('salt-reference')).length,0)
 assert.deepEqual(errors,[])
 console.log(JSON.stringify({passed:true,requests:calls.length,foods:7,pageErrors:errors,noRequestsOnPortionOrLensEdits:true}))
}finally {await browser.close()}
