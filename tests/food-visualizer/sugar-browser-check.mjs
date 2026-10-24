import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
const {chromium}=await import(process.env.JN_PLAYWRIGHT_PATH?pathToFileURL(process.env.JN_PLAYWRIGHT_PATH).href:'playwright')
const captures=await Promise.all(['gata','mango','coke','recipe'].map(async key=>JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`,import.meta.url)))))
// Explicitly synthetic test fixture, never offered by the production feature.
const zero={id:900001,description:'Synthetic zero-sugar test fixture',description_slug:'synthetic-zero',serving_size:100,serving_size_unit:'mL',nutrients:[{name:'sugar',amount:0,unit:'g'}]}
const foods=[...captures,zero]
const browser=await chromium.launch({headless:true})
try {
 const page=await browser.newPage({viewport:{width:1280,height:1000}}),calls=[],errors=[]
 page.on('pageerror',error=>errors.push(error.message))
 await page.route('https://api.juanutrisyon.info/**',async route=>{
  const url=new URL(route.request().url());calls.push(url.href)
  return route.fulfill({json:url.search?{data:foods,current_page:1,last_page:1,per_page:20,total:5}:foods.find(row=>url.pathname.endsWith(`/${row.description_slug}`))})
 })
 await page.goto(process.env.JN_VISUALIZER_URL??'http://127.0.0.1:4327/tools/food-visualizer')
 await page.getByLabel('Food name').fill('test');await page.getByLabel('Food name').press('Enter')
 const choose=async index=>{await page.locator('.result-list button').filter({hasText:foods[index].description}).click();await page.getByLabel('Serving',{exact:true}).waitFor()}
 await choose(0)
 await page.getByRole('radio',{name:'Sugar',exact:true}).check()
 const visual=page.locator('[data-sugar-result]')
 assert((await visual.innerText()).includes('2.4 g'));assert.equal(await visual.locator('.packet').count(),1)
 assert.equal(Number(await visual.locator('.packet').getAttribute('data-fill')),0.48)
 assert(await page.getByRole('radio',{name:'Carbohydrates',exact:true}).isEnabled())
 await page.locator('.lens-controls').screenshot({path:'/private/tmp/jn-phase6-initial.png'})
 await page.getByRole('radio',{name:'Sugar',exact:true}).press('Space')
 await page.getByText('Your chosen view: Sugar',{exact:true}).waitFor({timeout:5000})
 const before=calls.length
 await page.getByLabel('Quantity',{exact:true}).fill('100')
 assert.equal(await visual.locator('.packet').count(),20);assert((await visual.innerText()).includes('48 packets'))
 await page.getByLabel('Quantity',{exact:true}).fill('0.0001')
 assert.equal(await visual.getAttribute('data-status'),'tiny');assert.equal(await visual.locator('.packet').count(),0)
 assert((await visual.innerText()).includes('<0.01'))
 await page.getByLabel('Quantity',{exact:true}).fill('1')
 assert.equal(calls.length,before)
 await page.locator('.lens-controls').screenshot({path:'/private/tmp/jn-phase6-drink-desktop.png'})
 await page.setViewportSize({width:360,height:800})
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/private/tmp/jn-phase6-drink-mobile.png',fullPage:true})
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
 await choose(1)
 assert.equal(await page.locator('[data-sugar-context]').getAttribute('data-context'),'whole-fruit')
 assert((await page.locator('[data-sugar-context]').innerText()).includes('hindi asukal na idinagdag'))
 await page.getByText('Your chosen view: Sugar',{exact:true}).waitFor({timeout:5000})
 const fruitCalls=calls.length
 await page.getByLabel('Quantity',{exact:true}).fill('0.5')
 assert.equal(calls.length,fruitCalls)
 await page.getByText('Your chosen view: Sugar',{exact:true}).waitFor({timeout:5000})
 await page.getByRole('button',{name:'Use suggested view',exact:true}).click()
 await page.getByText('Suggested view: Sugar',{exact:true}).waitFor()
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/private/tmp/jn-phase6-fruit-mobile.png',fullPage:true})
 await page.setViewportSize({width:1280,height:1000})
 await page.locator('.lens-controls').screenshot({path:'/private/tmp/jn-phase6-fruit-desktop.png'})
 for(const index of [2,3]) {
  await choose(index)
  assert.equal(await visual.getAttribute('data-status'),'unavailable');assert.equal(await visual.locator('.packet').count(),0)
  assert(!(await visual.innerText()).includes('× 5 g packet equivalents'))
  assert.equal(await page.locator('[data-sugar-context]').getAttribute('data-context'),'neutral')
 }
 await choose(4);assert.equal(await visual.getAttribute('data-status'),'zero');assert.equal(await visual.locator('.packet').count(),0)
 assert((await visual.innerText()).includes('0 × 5 g packet equivalents'))
 assert.equal(await page.getByRole('status').filter({hasText:'Total sugar: 0 g'}).count(),1)
 assert.deepEqual(errors,[])
 console.log(JSON.stringify({passed:true,requests:calls.length,foods:5,pageErrors:errors,noRequestsOnPortionOrLensEdits:true}))
}finally {await browser.close()}
