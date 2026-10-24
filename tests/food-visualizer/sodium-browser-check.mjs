import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
const {chromium}=await import(process.env.JN_PLAYWRIGHT_PATH?pathToFileURL(process.env.JN_PLAYWRIGHT_PATH).href:'playwright')
const captured=async key=>JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`,import.meta.url)))
// These synthetic boundary fixtures are test-only, never production suggestions.
const synthetic=(id,description,amount)=>({id,description,description_slug:`synthetic-${id}`,serving_size:100,serving_size_unit:'g',nutrients:[{name:'sodium',amount,unit:'mg'}]})
const partial={...synthetic(900004,'Synthetic partial recipe fixture',0),data_source:'community_recipe',recipe:{final_prepared_weight_grams:200},
 recipe_ingredients:[synthetic(900005,'Synthetic ingredient',800),{...synthetic(900006,'Missing ingredient sodium',null),nutrients:[]}].map(ingredient=>({serving_size:100,serving_size_unit:'g',ingredient}))}
const foods=[await captured('patis'),await captured('mango'),synthetic(900001,'Synthetic 800 mg fixture',800),synthetic(900002,'Synthetic zero fixture',0),synthetic(900003,'Synthetic missing fixture',null),partial]
const browser=await chromium.launch({headless:true})
try {
 const page=await browser.newPage({viewport:{width:1280,height:1000}}),calls=[],errors=[]
 page.on('pageerror',error=>errors.push(error.message))
 await page.route('https://api.juanutrisyon.info/**',async route=>{
  const url=new URL(route.request().url());calls.push(url.href)
  await route.fulfill({json:url.search?{data:foods,current_page:1,last_page:1,per_page:20,total:foods.length}:foods.find(row=>url.pathname.endsWith(`/${row.description_slug}`))})
 })
 await page.goto(process.env.JN_VISUALIZER_URL??'http://127.0.0.1:4327/tools/food-visualizer')
 await page.getByLabel('Food name').fill('test');await page.getByLabel('Food name').press('Enter')
 const choose=async index=>{
  await page.locator('.result-list button').filter({hasText:foods[index].description}).click()
  await page.getByRole('heading',{name:foods[index].description,exact:true}).waitFor()
 }
 await choose(0)
 const visual=page.locator('[data-sodium-result]')
 await visual.waitFor();assert((await visual.innerText()).includes('759.15 mg'));assert((await visual.innerText()).includes('1.9 g salt-equivalent weight'))
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
 await page.locator('.lens-controls').screenshot({path:'/private/tmp/jn-phase7-sodium-desktop.png'})
 await page.setViewportSize({width:360,height:800})
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/private/tmp/jn-phase7-sodium-mobile.png',fullPage:true})
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
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
  if(index===2) {assert(text.includes('800 mg'));assert(text.includes('≈ 2 g salt-equivalent weight'))}
  if(index===3) {assert.equal(await visual.getAttribute('data-status'),'zero');assert(text.includes('≈ 0 g salt-equivalent weight'));assert.equal(await visual.locator('svg').count(),0)}
  if(index>=4) {assert.equal(await visual.getAttribute('data-status'),'unavailable');assert.equal(await visual.locator('svg').count(),0);assert(!text.includes('≈'))}
  if(index===5) assert(text.includes('incomplete sodium data'))
 }
 assert.equal(calls.length,7)
 assert.deepEqual(errors,[])
 console.log(JSON.stringify({passed:true,requests:calls.length,foods:6,pageErrors:errors,noRequestsOnPortionOrLensEdits:true}))
}finally {await browser.close()}
