import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
const {chromium}=await import(process.env.JN_PLAYWRIGHT_PATH?pathToFileURL(process.env.JN_PLAYWRIGHT_PATH).href:'playwright')
const captured=async key=>JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`,import.meta.url)))
const [rice,bread,coke]=await Promise.all(['rice','pandesal','coke'].map(captured))
const browser=await chromium.launch({headless:true})
try {
 const errors=[]
 async function open(initial,hold=false) {
  const page=await browser.newPage({viewport:{width:1280,height:1000}}),calls=[]
  page.on('pageerror',error=>errors.push(error.message))
  let mode=initial,release
  const gate=hold?new Promise(done=>release=done):Promise.resolve()
  await page.route('https://api.juanutrisyon.info/**',async route=>{
   const url=new URL(route.request().url());calls.push(url.href)
   if(url.search)return route.fulfill({json:{data:[rice,bread,coke],current_page:1,last_page:1,per_page:20,total:3}})
   if(url.pathname.endsWith('/'+rice.description_slug)) {
    await gate
    if(mode==='network')return route.fulfill({status:503,json:{trace:'PRIVATE_SERVER_TRACE'}})
    const copy=structuredClone(rice)
    if(mode==='changed')copy.serving_profile.options[0].gram_weight='81'
    if(mode==='zero')copy.nutrients=[{name:'total carbohydrates',amount:0,unit:'g'}]
    return route.fulfill({json:copy})
   }
   return route.fulfill({json:url.pathname.endsWith('/'+bread.description_slug)?bread:coke})
  })
  await page.goto(process.env.JN_VISUALIZER_URL??'http://127.0.0.1:4327/tools/food-visualizer')
  assert.equal(calls.length,0)
  await page.getByLabel('Food name').fill('rice');await page.getByLabel('Food name').press('Enter')
  await page.locator('.result-list button').filter({hasText:bread.description}).click()
  await page.locator('[data-carb-result]').waitFor()
  assert((await page.locator('[data-carb-amount]').innerText()).includes('14.67 g'))
  return {page,calls,release:()=>release?.(),setMode:value=>mode=value}
 }
 const main=await open('valid',true),{page,calls}=main
 assert((await page.locator('[data-rice-reference]').innerText()).includes('Loading rice reference'))
 assert.equal(await page.locator('[data-rice-equivalent]').count(),0)
 main.release();await page.locator('[data-rice-equivalent]').waitFor()
 assert((await page.locator('[data-rice-reference]').innerText()).includes('23.76 g'))
 assert((await page.locator('[data-staple-copy]').innerText()).includes('Hindi natin kinukuwenta ang starch'))
 assert.equal(calls.length,3)
 await page.locator('.result-list button').filter({hasText:rice.description}).click()
 await page.getByRole('heading',{name:rice.description,exact:true}).waitFor()
 assert.equal(calls.length,3,'Selecting cached reference rice should not refetch')
 assert((await page.locator('[data-rice-equivalent]').innerText()).includes('≈ 1 reference rice'))
 const before=calls.length
 await page.getByLabel('Quantity',{exact:true}).fill('0.5')
 assert((await page.locator('[data-rice-equivalent]').innerText()).includes('≈ 0.5 reference rice'))
 assert.equal(Number(await page.locator('.bowl').getAttribute('data-fill')),0.5)
 await page.getByLabel('Quantity',{exact:true}).fill('20');assert.equal(await page.locator('.bowl').count(),8)
 await page.getByRole('radio',{name:'Sugar',exact:true}).check();await page.getByRole('radio',{name:'Carbohydrates',exact:true}).check()
 assert.equal(calls.length,before)
 await page.getByLabel('Quantity',{exact:true}).fill('1')
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/private/tmp/jn-phase9-carbs-desktop.png',fullPage:true})
 await page.setViewportSize({width:360,height:800});await page.evaluate(()=>scrollTo(0,0))
 await page.screenshot({path:'/private/tmp/jn-phase9-carbs-mobile.png',fullPage:true})
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
 await page.locator('.result-list button').filter({hasText:coke.description}).click()
 await page.getByRole('heading',{name:coke.description,exact:true}).waitFor()
 assert.equal(await page.locator('[data-carb-result]').getAttribute('data-status'),'unavailable-food')
 assert.equal(await page.locator('[data-rice-equivalent]').count(),0)
 await page.close()
 const failure=await open('network')
 await failure.page.getByRole('button',{name:'Try reference again',exact:true}).waitFor()
 assert((await failure.page.locator('[data-carb-amount]').innerText()).includes('14.67 g'))
 assert(!(await failure.page.locator('body').innerText()).includes('PRIVATE_SERVER_TRACE'))
 failure.setMode('valid');await failure.page.getByRole('button',{name:'Try reference again',exact:true}).click()
 await failure.page.locator('[data-rice-equivalent]').waitFor();assert.equal(failure.calls.length,4)
 await failure.page.close()
 for(const mode of ['changed','zero']) {
  const check=await open(mode)
  await check.page.getByText('The configured rice identity, serving basis or nutrient evidence needs review. Comparison unavailable.',{exact:true}).waitFor()
  assert((await check.page.locator('[data-carb-amount]').innerText()).includes('14.67 g'))
  assert.equal(await check.page.locator('[data-rice-equivalent]').count(),0);assert.equal(await check.page.locator('.bowl').count(),0)
  await check.page.close()
 }
 assert.deepEqual(errors,[])
 console.log(JSON.stringify({passed:true,scenarios:4,pageErrors:errors,noRequestsOnPortionOrLensEdits:true}))
}finally {await browser.close()}
