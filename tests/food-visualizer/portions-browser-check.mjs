import { makeVisualizerTestFood, visualizerSearchMeta, fulfillColaReference } from './visualizer-test-food.mjs'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
const { chromium }=await import(process.env.JN_PLAYWRIGHT_PATH?pathToFileURL(process.env.JN_PLAYWRIGHT_PATH).href:'playwright')
const foods=await Promise.all(['rice','pandesal','mango','patis','coke','gata','recipe'].map(async key=>makeVisualizerTestFood(JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`,import.meta.url))))))
const browser=await chromium.launch({headless:true})
try {
 const page=await browser.newPage({viewport:{width:1280,height:1000}}),calls=[],errors=[]
 page.on('pageerror',error=>errors.push(error.message))
 await page.route('**/api/foods**',async route=>{
  const url=new URL(route.request().url());calls.push(url.href)
  if (await fulfillColaReference(route)) return
  if(url.pathname.endsWith('/foods')) return route.fulfill({json:{...visualizerSearchMeta,data:foods,current_page:1,last_page:1,per_page:20,total:7}})
  const food=foods.find(row=>url.pathname.endsWith(`/${row.description_slug}`))
  return route.fulfill({json:food})
 })
 const summary=id=>page.locator(`[data-nutrient="${id}"]`)
 await page.goto(process.env.JN_VISUALIZER_URL??'http://127.0.0.1:4327/tools/food-visualizer')
 await page.getByLabel('Food name').fill('rice');await page.getByLabel('Food name').press('Enter')
 await page.locator('.result-list button').filter({hasText:foods[0].description}).click()
 await page.getByLabel('Serving',{exact:true}).waitFor()
 assert.equal(await page.getByLabel('Serving',{exact:true}).inputValue(),'canonical:206')
 assert((await summary('total carbohydrates').innerText()).includes('23.76 g'))
 const count=calls.length
 await page.getByLabel('Quantity',{exact:true}).fill('0.375')
 await page.getByText('Selected portion: 30 g',{exact:true}).waitFor()
 assert((await summary('total carbohydrates').innerText()).includes('8.91 g'))
 await page.getByLabel('Quantity',{exact:true}).fill('')
 await page.getByText('Last valid portion: 30 g',{exact:true}).waitFor()
 assert.equal(await page.getByLabel('Quantity',{exact:true}).getAttribute('aria-invalid'),'true')
 assert((await summary('total carbohydrates').innerText()).includes('8.91 g'))
 await page.getByLabel('Quantity',{exact:true}).fill('1')
 await page.getByRole('button',{name:'Increase quantity by 0.5',exact:true}).click()
 await page.getByText('Selected portion: 120 g',{exact:true}).waitFor()
 await page.getByLabel('Serving',{exact:true}).selectOption('g')
 await page.getByLabel('Quantity',{exact:true}).fill('1')
 assert((await summary('sugar').innerText()).includes('<0.01 g'))
 assert.equal(calls.length,count,'Portion changes must not refetch')
 await page.getByLabel('Serving',{exact:true}).selectOption('canonical:206')
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/private/tmp/jn-phase5-desktop.png',fullPage:true})
 await page.setViewportSize({width:360,height:800})
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/private/tmp/jn-phase5-mobile.png',fullPage:true})
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
 for(const index of [1,2,3,4,5,6]) {
  await page.getByRole('button',{name:'Change food',exact:true}).click()
  await page.locator('.result-list button').filter({hasText:foods[index].description}).click()
  await page.getByLabel('Serving',{exact:true}).waitFor()
  assert.equal(await page.getByLabel('Quantity',{exact:true}).inputValue(),'1')
  const before=calls.length
  if(index===3) assert((await summary('sugar').innerText()).includes('Data not available'))
  if(index===4) {
   await page.getByLabel('Serving',{exact:true}).selectOption('source')
   assert.equal(await page.getByLabel('Serving',{exact:true}).inputValue(),'source')
   assert(!(await page.getByLabel('Serving',{exact:true}).locator('option').allTextContents()).some(text=>/can|grams/i.test(text)))
   assert((await summary('saturated fat').innerText()).includes('0 g'))
   assert((await summary('sugar').innerText()).includes('Data not available'))
   await page.getByLabel('Quantity',{exact:true}).fill('2')
   await page.getByText('Selected portion: 480 mL',{exact:true}).waitFor()
  }
  if(index===5) {
   await page.getByLabel('Quantity',{exact:true}).fill('0.5')
   assert((await summary('saturated fat').innerText()).includes('8.75 g'))
  }
  if(index===6) {
   assert((await summary('sugar').innerText()).includes('Incomplete recipe data'))
   assert((await summary('sugar').innerText()).includes('Data not available'))
   assert(!(await summary('sodium').innerText()).includes('Data not available'))
  }
  assert.equal(calls.length,before)
 }
 assert.deepEqual(errors,[])
 console.log(JSON.stringify({passed:true,requests:calls.length,foods:7,noRequestsOnPortionEdits:true,pageErrors:errors}))
} finally {await browser.close()}
