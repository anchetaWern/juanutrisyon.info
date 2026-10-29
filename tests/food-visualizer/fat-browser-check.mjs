import { makeVisualizerTestFood, visualizerSearchMeta, fulfillColaReference } from './visualizer-test-food.mjs'
import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
const {chromium}=await import(process.env.JN_PLAYWRIGHT_PATH?pathToFileURL(process.env.JN_PLAYWRIGHT_PATH).href:'playwright')
const captured=async key=>makeVisualizerTestFood(JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`,import.meta.url))))
// Explicitly synthetic boundary fixtures; not production suggestions or nutrition claims.
const synthetic=(id,description,sat,total)=>({id,description,description_slug:`synthetic-${id}`,data_source:'nutrition_label',custom_servings:{serving_units:[{id:900000,name:'Synthetic test portion',weight:100,weight_unit:'g'}]},serving_size:100,serving_size_unit:'g',
 nutrients:[{name:'saturated fat',amount:sat,unit:'g'},{name:'total fat',amount:total,unit:'g'}]})
const partial={...synthetic(900008,'Synthetic partial fat fixture',0,0),data_source:'community_recipe',recipe:{final_prepared_weight_grams:200},
 recipe_ingredients:[synthetic(900009,'Synthetic ingredient A',8,10),synthetic(900010,'Synthetic ingredient B',null,2)].map(ingredient=>({data_source:'nutrition_label',custom_servings:{serving_units:[{id:900000,name:'Synthetic test portion',weight:100,weight_unit:'g'}]},serving_size:100,serving_size_unit:'g',ingredient}))}
const foods=[await captured('gata'),await captured('coke'),synthetic(900001,'Synthetic eight of ten',8,10),synthetic(900002,'Synthetic zero of ten',0,10),
 synthetic(900003,'Synthetic two zeros',0,0),synthetic(900004,'Synthetic positive over zero',8,0),synthetic(900005,'Synthetic inconsistent pair',11,10),
 synthetic(900006,'Synthetic missing total',8,null),synthetic(900007,'Synthetic missing saturated',null,10),partial]
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
 const choose=async index=>{if(await page.locator('.back-results').isVisible())await page.locator('.back-results').click();await page.locator('.result-list button').filter({hasText:foods[index].description}).click();await page.getByRole('heading',{name:foods[index].description,exact:true}).waitFor()}
 await choose(0)
 const visual=page.locator('[data-fat-result]')
 await visual.waitFor();assert.equal(await visual.getAttribute('data-status'),'valid')
 assert((await visual.locator('[data-fat-amount]').innerText()).includes('17.5 g'))
 assert((await visual.locator('[data-fat-dv]').innerText()).includes('87.5%'))
 await page.getByText('Suggested view: Saturated fat',{exact:true}).waitFor()
 const count=calls.length
 await page.getByLabel('Quantity',{exact:true}).fill('0.5')
 assert((await visual.locator('[data-fat-amount]').innerText()).includes('8.75 g'))
 assert((await visual.locator('[data-fat-dv]').innerText()).includes('43.75%'))
 assert.equal(await visual.locator('[data-fat-bar]').getAttribute('data-band'),'high')
 // Portion edits cross exact thresholds without fetching more food data.
 for(const [quantity,percent,band,color] of [['0.04','3.5%','low','rgb(66, 110, 23)'],['0.1','8.75%','mid','rgb(180, 83, 9)'],['0.3','26.25%','high','rgb(185, 28, 28)'],['2','175%','high','rgb(185, 28, 28)']]) {
  await page.getByLabel('Quantity',{exact:true}).fill(quantity)
  assert((await visual.locator('[data-fat-dv]').innerText()).includes(percent))
  assert.equal(await visual.locator('[data-fat-bar]').getAttribute('data-band'),band)
  assert.equal(await visual.locator('[data-fat-bar] span').evaluate(el=>getComputedStyle(el).backgroundColor),color)
 }
 assert.equal(await visual.locator('[data-fat-bar] span').evaluate(el=>el.style.width),'100%')
 await visual.locator('[data-fat-above]').waitFor()
 await page.getByLabel('Quantity',{exact:true}).fill('0.5')
 assert.equal(calls.length,count)
 await page.getByRole('radio',{name:'Saturated fat',exact:true}).press('ArrowLeft')
 await page.locator('[data-sodium-result]').waitFor()
 await page.getByRole('radio',{name:'Sodium',exact:true}).press('ArrowRight')
 await visual.waitFor();await page.getByText('Your chosen view: Saturated fat',{exact:true}).waitFor()
 assert.equal(calls.length,count)
 await writeFile('/private/tmp/jn-dv-fat-rendered.html',await page.evaluate(()=>{const copy=document.documentElement.cloneNode(true);copy.querySelectorAll('script').forEach(node=>node.remove());const base=document.createElement('base');base.href=location.origin;copy.querySelector('head').prepend(base);return '<!doctype html>'+copy.outerHTML}))
 await page.locator('.lens-result').screenshot({path:'/private/tmp/jn-dv-fat-desktop.png'})
 await page.setViewportSize({width:768,height:1000});await page.locator('.lens-result').screenshot({path:'/private/tmp/jn-dv-fat-tablet.png'})
 await page.setViewportSize({width:390,height:800});await page.evaluate(()=>scrollTo(0,0))
 await page.screenshot({path:'/private/tmp/jn-dv-fat-mobile.png',fullPage:true})
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
 await page.getByLabel('Quantity',{exact:true}).fill('')
 assert((await page.locator('.lens-result').innerText()).includes('last valid portion'))
 for(const index of [1,2,3,4,5,6,7,8,9]) {
  await choose(index);await visual.waitFor()
  const status=await visual.getAttribute('data-status')
  if(index===2) {
   for(const [quantity,percent,band] of [['0.125','5%','low'],['0.125001','>5%','mid'],['0.499999','<20%','mid'],['0.5','20%','high']]) {
    const before=calls.length
    await page.getByLabel('Quantity',{exact:true}).fill(quantity)
    assert((await visual.locator('[data-fat-dv]').innerText()).includes(percent))
    assert.equal(await visual.locator('[data-fat-bar]').getAttribute('data-band'),band)
    assert.equal(calls.length,before)
   }
   await page.getByLabel('Quantity',{exact:true}).fill('1')
  }
  if([1,2,3,4,7].includes(index)) {
   assert.equal(status,'valid');assert.equal(await visual.locator('[data-fat-bar]').count(),1)
   assert((await visual.locator('[data-fat-dv]').innerText()).includes([2,7].includes(index)?'40%':'0%'))
  }else {
   assert.equal(await visual.locator('[data-fat-bar]').count(),0)
   assert.equal(await visual.locator('[data-fat-dv]').count(),0)
   assert.equal(status,index===5||index===6?'inconsistent':'unavailable')
   if(index===5) assert.equal(await visual.locator('[data-fat-amount]').innerText(),'8 g')
   if(index===9) assert((await visual.locator('[data-fat-explanation]').innerText()).includes('incomplete'))
  }
 }
 assert.equal(calls.length,11);assert.deepEqual(errors,[])
 console.log(JSON.stringify({passed:true,requests:calls.length,foods:10,pageErrors:errors,noRequestsOnPortionOrLensEdits:true}))
}finally {await browser.close()}
