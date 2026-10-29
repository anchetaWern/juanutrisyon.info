import { makeVisualizerTestFood, visualizerSearchMeta, fulfillColaReference } from './visualizer-test-food.mjs'
// Run with an existing Playwright installation; no production API requests.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
const { chromium } = await import(process.env.JN_PLAYWRIGHT_PATH ? pathToFileURL(process.env.JN_PLAYWRIGHT_PATH).href : 'playwright')
const rice=makeVisualizerTestFood(JSON.parse(await readFile(new URL('./fixtures/captured/rice.json',import.meta.url))))
const patis=makeVisualizerTestFood(JSON.parse(await readFile(new URL('./fixtures/captured/patis.json',import.meta.url))))
const base=process.env.JN_VISUALIZER_URL ?? 'http://127.0.0.1:4327/tools/food-visualizer'
const browser=await chromium.launch({headless:true})
try {
  const page=await browser.newPage({viewport:{width:1280,height:1000}})
  const calls=[],errors=[]
  page.on('pageerror',error=>errors.push(error.message))
  await page.route('**/api/foods**', async route=>{
    const url=new URL(route.request().url());calls.push(url.href)
    if (await fulfillColaReference(route)) return
    if(url.pathname.endsWith(`/foods/${rice.description_slug}`)) return route.fulfill({json:rice})
    const query=url.searchParams.get('description'),number=Number(url.searchParams.get('page')??1)
    if(query==='fail') return route.fulfill({status:503,json:{trace:'SERVER_SECRET'}})
    if(query==='slow') return route.fulfill({status:429,json:{},headers:{'Retry-After':'10','Access-Control-Expose-Headers':'Retry-After'}})
    const rows=query==='none'?[]:[number===1?rice:patis]
    return route.fulfill({json:{...visualizerSearchMeta,data:rows,current_page:number,last_page:query==='none'?1:2,per_page:1,total:query==='none'?0:2}})
  })
  await page.goto(base)
  await page.getByRole('heading',{name:'Ano’ng Nasa Pagkain Ko?'}).waitFor()
  assert.equal(calls.length,0)
  await page.getByLabel('Food name').fill('rice');assert.equal(calls.length,0)
  await page.getByRole('button',{name:'Search',exact:true}).click()
  await page.getByRole('button',{name:new RegExp(rice.description)}).waitFor()
  assert.equal(calls.length,1)
  await page.getByRole('button',{name:new RegExp(rice.description)}).click()
  await page.getByRole('heading',{name:rice.description,exact:true}).waitFor()
  assert.equal(calls.length,2);assert(await page.getByText('100 g',{exact:true}).isVisible())
  await page.screenshot({path:'/private/tmp/jn-phase4-desktop.png',fullPage:true})
  await page.getByRole('button',{name:'Change food'}).click()
  assert(await page.getByLabel('Food name').evaluate(element=>element===document.activeElement))
  await page.getByRole('button',{name:new RegExp(rice.description)}).click()
  await page.getByRole('heading',{name:rice.description,exact:true}).waitFor();assert.equal(calls.length,2)
  await page.getByRole('button',{name:'Next',exact:true}).click()
  await page.getByRole('button',{name:new RegExp(patis.description)}).waitFor();assert.equal(calls.length,3)
  await page.getByRole('button',{name:'Previous',exact:true}).click()
  await page.getByRole('button',{name:new RegExp(rice.description)}).waitFor();assert.equal(calls.length,3)
  await page.setViewportSize({width:360,height:800})
  await page.screenshot({path:'/private/tmp/jn-phase4-mobile.png',fullPage:true})
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
  if (await page.locator('.back-results').isVisible()) await page.locator('.back-results').click()
  await page.getByLabel('Food name').fill('none');await page.getByLabel('Food name').press('Enter')
  await page.getByText('No matches for', {exact:false}).waitFor()
  await page.getByLabel('Food name').fill('fail');await page.getByLabel('Food name').press('Enter')
  await page.getByRole('button',{name:'Try search again'}).waitFor()
  assert(!(await page.locator('body').innerText()).includes('SERVER_SECRET'))
  await page.getByLabel('Food name').fill('slow');await page.getByLabel('Food name').press('Enter')
  await page.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.disabled&&b.textContent.includes('Try again in')))
  assert.deepEqual(errors,[])
  if (process.env.JN_VISUALIZER_LIVE === '1') {
    const live=await browser.newPage()
    await live.goto(base)
    await live.getByLabel('Food name').fill('rice')
    await live.getByLabel('Food name').press('Enter')
    const first=live.locator('.result-list button').first()
    await first.waitFor()
    const name=await first.locator('strong').innerText()
    await first.click()
    await live.getByRole('heading',{name,exact:true}).waitFor()
    console.log(JSON.stringify({liveAnonymousSelection:true,description:name}))
    await live.close()
  }
  console.log(JSON.stringify({passed:true,requests:calls.length,consoleErrors:errors,desktopScreenshot:'/private/tmp/jn-phase4-desktop.png',mobileScreenshot:'/private/tmp/jn-phase4-mobile.png'}))
} finally {await browser.close()}
