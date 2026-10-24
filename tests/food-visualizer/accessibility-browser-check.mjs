// Opt-in local UI review: captured foods and explicitly synthetic error/stress cases.
import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
const { chromium } = await import(pathToFileURL(process.env.JN_PLAYWRIGHT_PATH ?? '/Users/wernancheta/projects/juanutrisyon/nuxt-juanutrisyon/node_modules/playwright/index.mjs').href)
const axePath = process.env.JN_AXE_PATH ?? '/private/tmp/jn-phase11-a11y/node_modules/axe-core/axe.min.js'
const base = process.env.JN_VISUALIZER_URL ?? 'http://127.0.0.1:4327/tools/food-visualizer'
const foods = await Promise.all(['rice','pandesal','mango','patis','coke','gata','recipe'].map(async key =>
 JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`, import.meta.url)))))
const long = { ...structuredClone(foods[2]), id: 900001, description_slug: 'synthetic-accessibility-long-label',
 description: 'Synthetic accessibility stress fixture: ' + 'VeryLongFoodPreparationAndBrandLabel'.repeat(8) }
long.serving_profile.options[0].label = 'Synthetic household measure with a long label '.repeat(5)
const retry = {...foods[2],id:900002,description_slug:'synthetic-retry',description:'Synthetic retry fixture'}
const missing = {...foods[2],id:900003,description_slug:'synthetic-missing',description:'Synthetic missing fixture'}
const rows = [...foods,long,retry,missing], errors = [], audits = [], checks = []
const gradientReview = new Map()
const luminance = channels => channels.map(value=>value/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4)
 .reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0)
const contrast = (a,b) => {const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
const output = '/private/tmp/jn-phase11'
await mkdir(output,{recursive:true})
const browser = await chromium.launch({headless:true})
try {
 async function open(viewport, extra={}) {
  const page = await browser.newPage({viewport,...extra}), calls=[]
  let failDetail=true, releaseSearch, releaseDetail, holdDetail=false
  page.on('pageerror',error=>errors.push(error.message))
  await page.route('https://api.juanutrisyon.info/**',async route=>{
   const url=new URL(route.request().url());calls.push(url.href)
   const query=url.searchParams.get('description')
   if(query==='delayed') await new Promise(resolve=>releaseSearch=resolve)
   if(query==='fail')return route.fulfill({status:503,json:{trace:'SERVER_SECRET'}})
   if(query==='limited')return route.fulfill({status:429,json:{},headers:{'Retry-After':'10','Access-Control-Expose-Headers':'Retry-After'}})
   if(query!==null)return route.fulfill({json:{data:query==='none'?[]:rows,current_page:1,last_page:1,per_page:20,total:query==='none'?0:rows.length}})
   if(url.pathname.endsWith('/'+missing.description_slug))return route.fulfill({status:404,json:{trace:'SERVER_SECRET'}})
   if(url.pathname.endsWith('/'+retry.description_slug)&&failDetail){failDetail=false;return route.fulfill({status:503,json:{trace:'SERVER_SECRET'}})}
   if(url.pathname.endsWith('/'+long.description_slug)&&holdDetail)await new Promise(resolve=>releaseDetail=resolve)
   return route.fulfill({json:rows.find(food=>url.pathname.endsWith('/'+food.description_slug))})
  })
  await page.goto(base);await page.getByRole('heading',{name:'Ano’ng Nasa Pagkain Ko?',exact:true}).waitFor()
  await page.addScriptTag({path:axePath})
  assert.equal(calls.length,0)
  return {page,calls,releaseSearch:()=>releaseSearch?.(),releaseDetail:()=>releaseDetail?.(),holdDetail:()=>holdDetail=true}
 }
 async function audit(page,state) {
  const focused=await page.evaluateHandle(()=>document.activeElement)
  const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}}))
  // axe temporarily focuses the skip link to assess its contrast. Restore the
  // original focus so screenshots and subsequent keyboard checks reflect the UI.
  await focused.evaluate(node=>{if(node.isConnected&&node!==document.body)node.focus({preventScroll:true});else document.activeElement?.blur()})
  await focused.dispose()
  const violations=result.violations.map(row=>({id:row.id,impact:row.impact,targets:row.nodes.flatMap(node=>node.target)}))
  // axe cannot sample CSS gradients. The shell's #eef8df at at most 55%
  // opacity over white is bounded conservatively by #f5fbed. Check the actual
  // foreground of each flagged text node against that darkest backdrop.
  for(const item of result.incomplete) {
   assert.equal(item.id,'color-contrast',`${state}: unreviewed manual-check rule`)
   for(const node of item.nodes) {
    const selector=node.target[0], gradient=node.failureSummary.includes('background gradient')
    const symbol=node.failureSummary.includes('only non-text characters')&&/^button\[aria-label="(?:Decrease|Increase) quantity by 0\.5"\]$/.test(selector)
    assert(gradient||symbol,`${state}: unreviewed contrast reason: ${JSON.stringify(node)}`)
    const colors=await page.locator(selector).evaluate(node=>({foreground:getComputedStyle(node).color,background:getComputedStyle(node).backgroundColor}))
    const color=colors.foreground, rgb=color.match(/[\d.]+/g).slice(0,3).map(Number)
    const backdrop=gradient?[245,251,237]:colors.background.match(/[\d.]+/g).slice(0,3).map(Number)
    const ratio=contrast(rgb,backdrop)
    assert(ratio>=4.5,`${state}: gradient-bound contrast ${ratio} for ${selector}`)
    gradientReview.set(selector+color,{selector,foreground:color,background:gradient?'#f5fbed (conservative gradient bound)':colors.background,reason:gradient?'gradient':'labelled stepper symbol',ratio})
   }
  }
  audits.push({state,violations,incomplete:result.incomplete.map(row=>row.id)})
  assert.deepEqual(violations,[],state)
 }
 async function reflow(page,state) {
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${state}: horizontal overflow`)
  const clipped=await page.locator('.lens-options label span').evaluateAll(nodes=>nodes.filter(node=>node.scrollWidth>node.clientWidth+1).map(node=>node.textContent))
  assert.deepEqual(clipped,[],`${state}: clipped lens labels`)
 }
 async function search(page,query='foods') {
  await page.getByLabel('Food name').fill(query);await page.getByLabel('Food name').press('Enter')
 }
 async function choose(page,food) {
  await page.locator('.result-list button').filter({hasText:food.description}).press('Enter')
  await page.getByRole('heading',{name:food.description,exact:true}).waitFor()
 }
 const keyboardOnly=process.argv.includes('--keyboard-only')
 for(const width of keyboardOnly?[]:[360,390,1280]) {
  const {page,calls}=await open({width,height:900})
  await audit(page,`${width}-initial`);await reflow(page,`${width}-initial`)
  await page.screenshot({path:`${output}/${width}-initial.png`,fullPage:true})
  await search(page)
  await page.locator('.result-list button').first().waitFor()
  await audit(page,`${width}-search`)
  for(const [index,lens] of [[2,'Sugar'],[3,'Sodium'],[5,'Saturated fat'],[0,'Carbohydrates']]) {
   await choose(page,foods[index])
   await page.waitForFunction(()=>document.activeElement?.classList.contains('preview'))
   assert(await page.getByRole('radio',{name:lens,exact:true}).isChecked())
   const before=calls.length, quantity=page.getByLabel('Quantity',{exact:true})
   await quantity.fill('0.375');const valid=await page.locator('[data-result-announcement]').innerText()
   await quantity.fill('');assert.equal(await quantity.getAttribute('aria-invalid'),'true')
   assert((await page.locator('[data-result-announcement]').innerText()).includes('Last valid portion'))
   assert((await page.locator('[data-result-announcement]').innerText()).endsWith(valid.split('. Selected portion: ')[1]))
   await quantity.fill('1');assert.equal(await quantity.getAttribute('aria-invalid'),'false')
   assert.equal(calls.length,before)
   await audit(page,`${width}-${lens}`);await reflow(page,`${width}-${lens}`)
   await page.locator('.lens-result').screenshot({path:`${output}/${width}-${lens.replaceAll(' ','-')}.png`})
  }
  await choose(page,foods[4]);await audit(page,`${width}-unavailable`)
  await choose(page,foods[6]);await audit(page,`${width}-partial-recipe`)
  await page.locator('.source-panel summary').press('Enter');await page.locator('.more-nutrients summary').press('Enter')
  await audit(page,`${width}-expanded-source`);await reflow(page,`${width}-expanded-source`)
  await choose(page,long);await audit(page,`${width}-long-label`);await reflow(page,`${width}-long-label`)
  assert.equal(await page.getByLabel('Serving',{exact:true}).locator('option').first().textContent(),long.serving_profile.options[0].label)
  await search(page,'none');await page.getByText('No matches for',{exact:false}).waitFor();await audit(page,`${width}-empty`)
  await search(page,'fail');await page.getByRole('alert').waitFor();await audit(page,`${width}-server-error`)
  assert(!(await page.locator('body').innerText()).includes('SERVER_SECRET'))
  await page.locator('.results').screenshot({path:`${output}/${width}-error.png`})
  await search(page,'limited');await page.getByRole('button',{name:/Try again in/}).waitFor();await audit(page,`${width}-rate-limited`)
  assert.equal(await page.getByRole('alert').locator('button').count(),0,'Countdown must not repeat inside an alert')
  checks.push({viewport:width,completeLenses:4,emptyAndErrorStates:true,longLabels:true,noOverflow:true})
  console.log(JSON.stringify(checks.at(-1)));await page.close()
 }
 // Keyboard-only control path, focus visibility and asynchronous focus ownership.
 const flow=await open({width:390,height:844},{reducedMotion:'reduce'}),{page,calls}=flow
 await page.keyboard.press('Tab');assert(await page.locator('.visualizer-skip').evaluate(node=>node===document.activeElement))
 await page.keyboard.press('Enter');assert(await page.getByLabel('Food name').evaluate(node=>node===document.activeElement))
 await page.keyboard.type('foods');await page.keyboard.press('Enter')
 await page.waitForFunction(()=>document.activeElement?.classList.contains('results'))
 await page.keyboard.press('Tab');await page.keyboard.press('Enter') // first rice result
 await page.waitForFunction(()=>document.activeElement?.classList.contains('preview'))
 await page.keyboard.press('Tab')
 assert.equal(await page.evaluate(()=>document.activeElement.id),'serving-option')
 // Native select supports type-ahead without relying on OS popup rendering.
 await page.keyboard.press('r')
 await page.waitForFunction(()=>document.querySelector('#serving-option').value==='source')
 await page.keyboard.press('Tab');await page.keyboard.press('Tab')
 assert.equal(await page.evaluate(()=>document.activeElement.id),'portion-quantity')
 await page.keyboard.press('ControlOrMeta+A');await page.keyboard.type('0.375')
 await page.getByText('Selected portion: 37.5 g',{exact:true}).waitFor()
 await page.keyboard.press('ControlOrMeta+A');await page.keyboard.press('Backspace')
 await page.getByText('Last valid portion: 37.5 g',{exact:true}).waitFor()
 await page.keyboard.type('0.5');await page.keyboard.press('Tab');await page.keyboard.press('Space')
 await page.getByText('Selected portion: 100 g',{exact:true}).waitFor()
 console.log(JSON.stringify({keyboardServingAndDecimalControls:true}))
 await page.keyboard.press('Tab');await page.keyboard.press('Tab')
 assert.equal(await page.evaluate(()=>document.activeElement.value),'carbohydrates')
 const before=calls.length
 for(const lens of ['sugar','sodium','saturated-fat','carbohydrates']) {
  await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>document.activeElement.value),lens)
  await page.waitForFunction(()=>document.querySelector('.lens-mode p').textContent.includes('Your chosen view'))
 }
 assert.equal(calls.length,before)
 await page.keyboard.press('Tab');await page.keyboard.press('Enter')
 assert((await page.locator('.lens-mode').innerText()).includes('Suggested view: Carbohydrates'))
 assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Use suggested view')
 await page.keyboard.press('Tab')
 assert(await page.evaluate(()=>document.activeElement.matches('.more-nutrients summary')))
 await page.getByRole('button',{name:'Change food',exact:true}).press('Enter')
 assert.equal(await page.evaluate(()=>document.activeElement.id),'food-search')
 // Don't steal focus when the user moves on while a request is pending.
 await search(page,'delayed');await page.getByText('Searching for',{exact:false}).waitFor()
 await audit(page,'keyboard-search-loading')
 await page.keyboard.press('Tab');const focusBefore=await page.evaluate(()=>document.activeElement.textContent)
 flow.releaseSearch();await page.locator('.result-list button').first().waitFor()
 assert.equal(await page.evaluate(()=>document.activeElement.textContent),focusBefore)
 flow.holdDetail();await page.locator('.result-list button').filter({hasText:long.description}).press('Enter')
 await page.getByText('Loading '+long.description+'…',{exact:true}).waitFor()
 await audit(page,'keyboard-detail-loading')
 await page.keyboard.press('Tab')
 const focusName=await page.evaluate(()=>document.activeElement.textContent)
 flow.releaseDetail();await page.getByRole('heading',{name:long.description,exact:true}).waitFor()
 assert.equal(await page.evaluate(()=>document.activeElement.textContent),focusName)
 // Error and retry also lead to a stable, named preview focus target.
 await page.locator('.result-list button').filter({hasText:retry.description}).press('Enter')
 await page.getByRole('button',{name:'Try loading again',exact:true}).waitFor()
 await page.getByRole('button',{name:'Try loading again',exact:true}).press('Enter')
 await page.getByRole('heading',{name:retry.description,exact:true}).waitFor()
 await page.waitForFunction(()=>document.activeElement?.classList.contains('preview'))
 await page.locator('.result-list button').filter({hasText:missing.description}).press('Enter')
 await page.getByText('This food is no longer available. Please choose another food.',{exact:true}).waitFor()
 assert.equal(await page.getByRole('button',{name:'Try loading again',exact:true}).count(),0)
 await choose(page,foods[0])
 await page.getByRole('radio',{name:'Sugar',exact:true}).press('Space')
 await choose(page,foods[3]);assert(await page.getByRole('radio',{name:'Sugar',exact:true}).isChecked())
 await page.getByRole('button',{name:'Use suggested view',exact:true}).press('Enter')
 assert(await page.getByRole('radio',{name:'Sodium',exact:true}).isChecked())
 // Both native disclosures remain operable by keyboard.
 for(const selector of ['.more-nutrients summary','.source-panel summary']) {
  const control=page.locator(selector);await control.press('Enter')
  assert.notEqual(await control.locator('..').getAttribute('open'),null)
  assert.equal(await control.evaluate(node=>getComputedStyle(node).outlineWidth),'3px')
 }
 assert(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches))
 assert(await page.locator('main a').evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).transitionDuration==='0s')))
 const tree=await page.locator('main').ariaSnapshot()
 assert(tree.includes('Explore a nutrient'));assert(!tree.includes('packet-label'))
 await writeFile(`${output}/keyboard-aria.yml`,tree)
 checks.push({keyboard:true,asyncFocusPreserved:true,reducedMotion:true,ariaTreeReviewed:true})
 await page.close()
 // 1280-pixel desktop at 200% has a 640 CSS-pixel layout viewport, rasterized at 2x.
 for(const width of [640,320]) {
  const {page}=await open({width,height:width===640?450:800},{deviceScaleFactor:width===640?2:1})
  await search(page);await page.locator('.result-list button').first().waitFor();await choose(page,long)
  for(const lens of ['Sugar','Sodium','Saturated fat','Carbohydrates']) {
   await page.getByRole('radio',{name:lens,exact:true}).press('Space');await reflow(page,`${width}-${lens}`)
  }
  await page.locator('.source-panel summary').press('Enter');await page.locator('.more-nutrients summary').press('Enter')
  await audit(page,`${width}-reflow-expanded`);await reflow(page,`${width}-reflow-expanded`)
  await page.screenshot({path:`${output}/${width}-reflow.png`,fullPage:true})
  checks.push({viewport:width,zoomEquivalent:width===640?'200% of 1280px desktop':null,longLabels:true,completeLenses:4,noOverflow:true})
  await page.close()
 }
 assert.deepEqual(errors,[])
 const evidence={checkedAt:new Date().toISOString(),browser:browser.version(),axeVersion:'4.10.3',
  method:'Local Chromium; intercepted captured API records plus explicitly synthetic error/long-label cases; no real catalog writes or API traffic.',
  checks,audits,manualContrastReview:[...gradientReview.values()],pageErrors:errors,screenshots:output,
  limitations:['Keyboard, ARIA tree and live-region DOM semantics were checked; no claim of listening to VoiceOver/NVDA speech.',
   '200% desktop zoom is verified through equivalent CSS viewport and device scale, not browser toolbar zoom.']}
 await writeFile(keyboardOnly?`${output}/keyboard-debug-evidence.json`:new URL('../../docs/food-visualizer/phase-11-accessibility-evidence.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n')
 console.log(JSON.stringify({passed:true,audits:audits.length,checks:checks.length,pageErrors:errors,evidence:keyboardOnly?`${output}/keyboard-debug-evidence.json`:'docs/food-visualizer/phase-11-accessibility-evidence.json'}))
} finally {await browser.close()}
