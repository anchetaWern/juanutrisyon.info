import { makeVisualizerTestFood, visualizerSearchMeta, fulfillColaReference } from './visualizer-test-food.mjs'
// Built assets at an intercepted HTTPS origin; all API and PostHog traffic mocked.
import assert from 'node:assert/strict'
import { readFile,writeFile,mkdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
const {chromium}=await import(pathToFileURL(process.env.JN_PLAYWRIGHT_PATH??'/Users/wernancheta/projects/juanutrisyon/nuxt-juanutrisyon/node_modules/playwright/index.mjs').href)
const foods=await Promise.all(['rice','mango','gata'].map(async key=>makeVisualizerTestFood(JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`,import.meta.url))))))
const missing={...foods[1],id:900003,description:'Synthetic missing analytics fixture',description_slug:'synthetic-missing-analytics'}
const rows=[...foods,missing],browser=await chromium.launch({headless:true}),errors=[],checks=[]
const output='/private/tmp/jn-phase12';await mkdir(output,{recursive:true})
try {
 async function open(mode='normal') {
  const context=await browser.newContext({viewport:{width:390,height:844}}),events=[],requests=[]
  const origin=mode==='localhost'?'https://localhost':'https://visualizer.example.com'
  if(['dnt','gpc','localhost'].includes(mode))await context.addInitScript(mode=>{
   localStorage.setItem('jn_visualizer_analytics','on')
   if(mode==='dnt')Object.defineProperty(navigator,'doNotTrack',{value:'1'})
   if(mode==='gpc')Object.defineProperty(navigator,'globalPrivacyControl',{value:true})
  },mode)
  let release,hold=false
  await context.route(origin+'/**',async route=>{
   const path=new URL(route.request().url()).pathname
   const file=path.startsWith('/assets/')?new URL('../../dist'+path,import.meta.url):new URL('../../dist/tools/food-visualizer.html',import.meta.url)
   let body=await readFile(file)
   if(mode==='unconfigured'&&path.endsWith('.js'))body=Buffer.from(body.toString().replace(/phc_[\w-]+/g,''))
   await route.fulfill({body,contentType:path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':'text/html'})
  })
  await context.route('**/api/foods**',async route=>{
   const url=new URL(route.request().url())
   if (await fulfillColaReference(route)) return
   if(url.pathname.endsWith('/foods')){if(url.searchParams.get('description')==='fail')return route.fulfill({status:503,json:{trace:'PRIVATE_SERVER_TRACE'}})
    return route.fulfill({json:{...visualizerSearchMeta,data:rows,current_page:1,last_page:1,per_page:20,total:rows.length}})}
   if(url.pathname.endsWith('/'+missing.description_slug))return route.fulfill({status:404,json:{trace:'PRIVATE_SERVER_TRACE'}})
   if(hold&&url.pathname.endsWith('/'+foods[2].description_slug))await new Promise(resolve=>release=resolve)
   await route.fulfill({json:foods.find(food=>url.pathname.endsWith('/'+food.description_slug))})
  })
  await context.route('https://us.i.posthog.com/**',async route=>{
   if(mode==='failure')return route.abort('failed')
   if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'},body:''})
   const request=route.request(),body=request.postDataJSON(),headers=request.headers()
   assert.equal(new URL(request.url()).pathname,'/i/v0/e/')
   assert.equal(headers.cookie,undefined);assert.equal(headers.referer,undefined)
   assert.equal(body.properties.$process_person_profile,false);assert.equal(body.properties.$geoip_disable,true)
   assert(!JSON.stringify(body).includes('PRIVATE_'))
   const allowed=new Set(['surface','feature_version','food_id','source','lens','serving_option_id','unit','quantity','selection_origin','destination_type','$process_person_profile','$geoip_disable'])
   assert(Object.keys(body.properties).every(key=>allowed.has(key)))
   // Never save the public project token in test evidence.
   events.push({event:body.event,properties:body.properties,visit:body.distinct_id})
   await route.fulfill({headers:{'Access-Control-Allow-Origin':origin},json:{status:1}})
  })
  for(const pattern of ['https://app.juanutrisyon.info/**','https://i.fnri.dost.gov.ph/**'])await context.route(pattern,route=>route.fulfill({body:'Intercepted outbound destination',contentType:'text/plain'}))
  const page=await context.newPage()
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>requests.push(request.url()))
  await page.goto(origin+'/tools/food-visualizer?PRIVATE_URL_PARAMETER=not-for-analytics')
  await page.getByRole('heading',{name:'Ano’ng Nasa Pagkain Ko?',exact:true}).waitFor()
  await page.waitForFunction(()=>document.querySelector('.search-panel'))
  return {page,context,events,requests,hold:()=>hold=true,release:()=>release?.()}
 }
 async function showResults(page){if(await page.locator('.back-results').isVisible())await page.locator('.back-results').click()}
 async function choose(page,food){await showResults(page);await page.locator('.result-list button').filter({hasText:food.description}).click();await page.getByRole('heading',{name:food.description,exact:true}).waitFor()}
 async function search(page,query='PRIVATE_SEARCH_TEXT'){await showResults(page);await page.getByLabel('Food name').fill(query);await page.getByLabel('Food name').press('Enter')}
 const main=await open(),{page,events,context,requests}=main
 const count=suffix=>events.filter(event=>event.event.endsWith(suffix)).length
 async function expectCount(suffix,total){
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
  for(let i=0;i<180&&count(suffix)<total;i++)await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)))
  assert.equal(count(suffix),total,suffix)
 }
 const opted=page.getByRole('checkbox',{name:'Share usage analytics to help improve this tool',exact:true})
 await opted.waitFor();assert(!await opted.isChecked())
 await search(page);await choose(page,foods[0]);assert.equal(events.length,0)
 assert(!requests.some(url=>url.includes('posthogCapture')))
 await opted.check();await expectCount('opened',1)
 await page.waitForFunction(()=>localStorage.getItem('jn_visualizer_analytics')==='on')
 await expectCount('opened',1);assert.equal(count('food_selected'),0,'Opt-in must not replay previous actions')
 await choose(page,foods[0]);await page.waitForFunction(()=>document.activeElement?.classList.contains('preview'))
 await expectCount('food_selected',1)
 const quantity=page.getByLabel('Quantity',{exact:true})
 await quantity.fill('0.375');await expectCount('portion_changed',0)
 await quantity.press('Enter');await quantity.press('Enter')
 await page.getByRole('radio',{name:'Sugar',exact:true}).click()
 await expectCount('portion_changed',1);await expectCount('lens_changed',1)
 await quantity.fill('bad');await quantity.press('Enter');await expectCount('portion_changed',1)
 await quantity.fill('0.5');await page.getByRole('radio',{name:'Sugar',exact:true}).press('Space')
 await expectCount('portion_changed',2);await expectCount('lens_changed',1)
 await page.getByRole('radio',{name:'Sodium',exact:true}).click();await expectCount('lens_changed',2)
 await page.getByRole('button',{name:'Use suggested view',exact:true}).click();await expectCount('lens_changed',3)
 await page.getByRole('button',{name:'Increase quantity by 0.5',exact:true}).click();await expectCount('portion_changed',3)
 await page.getByLabel('Serving',{exact:true}).selectOption('g');await expectCount('portion_changed',4)
 await page.getByLabel('Serving',{exact:true}).selectOption('source');await expectCount('portion_changed',5)
 for(const [name,destination]of [['Open Food Details','food_details']]){
  const popup=context.waitForEvent('page');await page.getByRole('link',{name}).click();await(await popup).close()
  assert.equal(events.at(-1).properties.destination_type,destination)
 }
 await expectCount('outbound_clicked',1)
 await page.getByRole('link',{name:'Open Food Details'}).dispatchEvent('auxclick',{button:1})
 await expectCount('outbound_clicked',2)
 main.hold();await showResults(page);await page.locator('.result-list button').filter({hasText:foods[2].description}).click()
 await page.getByText('Loading '+foods[2].description+'…',{exact:true}).waitFor()
 await choose(page,foods[1]);main.release()
 await expectCount('food_selected',2);assert.equal(events.filter(row=>row.event.endsWith('food_selected')).at(-1).properties.food_id,foods[1].id)
 await showResults(page);await page.locator('.result-list button').filter({hasText:missing.description}).click()
 await page.getByText('This food is no longer available. Please choose another food.',{exact:true}).waitFor()
 await expectCount('food_selected',2)
 await choose(page,foods[0])
 await page.locator('.analytics-preferences').screenshot({path:output+'/preference-mobile.png'})
 await page.addScriptTag({path:process.env.JN_AXE_PATH ?? '/private/tmp/jn-phase11-a11y/node_modules/axe-core/axe.min.js'})
 const a11y=await page.evaluate(()=>axe.run(document.querySelector('.analytics-preferences')))
 assert.deepEqual(a11y.violations.map(row=>row.id),[])
 await opted.uncheck();const before=events.length
 await quantity.fill('2');await quantity.press('Enter');await page.getByRole('radio',{name:'Sugar',exact:true}).check()
 assert.equal(events.length,before)
 await page.reload();await page.getByRole('heading',{name:'Usage analytics',exact:true}).waitFor();assert(!await opted.isChecked());assert.equal(events.length,before)
 await opted.check();await page.waitForFunction(()=>localStorage.getItem('jn_visualizer_analytics')==='on')
 await expectCount('opened',2)
 const visit=events.at(-1).visit
 await page.reload();await page.getByRole('heading',{name:'Usage analytics',exact:true}).waitFor()
 assert(await opted.isChecked());await expectCount('opened',3);assert.notEqual(events.at(-1).visit,visit)
 assert.deepEqual(await context.cookies(),[])
 assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),['jn_visualizer_analytics'])
 checks.push({scenario:'configured-opt-in',eventTypes:[...new Set(events.map(row=>row.event))],counts:Object.fromEntries(['opened','food_selected','portion_changed','lens_changed','outbound_clicked'].map(key=>[key,count(key)])),
  noPreOptInEvents:true,noKeystrokeEvents:true,noRawSearchOrUrl:true,noStaleOrFailedSelectionEvents:true,preferenceAxeViolations:0,rotatingVisitIdentity:true})
 await context.close()
 for(const mode of ['localhost','unconfigured','dnt','gpc','failure']) {
  const item=await open(mode)
  if(mode==='failure'){await item.page.getByRole('checkbox').check()}
  await search(item.page);await choose(item.page,foods[0]);await item.page.getByLabel('Quantity',{exact:true}).fill('0.5')
  await item.page.getByLabel('Quantity',{exact:true}).press('Enter');await item.page.getByText('Selected portion: 40 g',{exact:true}).waitFor()
  assert.equal(item.events.length,0)
  if(mode!=='failure')assert(!item.requests.some(url=>url.includes('posthogCapture')))
  checks.push({scenario:mode,capturedEvents:0,calculatorUsable:true});await item.context.close()
 }
 assert.deepEqual(errors,[])
 await writeFile(process.env.JN_ANALYTICS_EVIDENCE_PATH ?? new URL('../../docs/food-visualizer/phase-12-browser-evidence.json',import.meta.url),JSON.stringify({checkedAt:new Date().toISOString(),browser:browser.version(),method:'Built assets at intercepted HTTPS origin; captured food fixtures; PostHog requests intercepted, never delivered to a real project.',checks,pageErrors:errors},null,2)+'\n')
 console.log(JSON.stringify({passed:true,scenarios:checks.length,pageErrors:errors}))
}finally{await browser.close()}
