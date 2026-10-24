import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyticsConfig,analyticsPolicy,createVisualizerAnalytics,eventProperties,localAnalyticsHost } from '../../src/features/food-visualizer/analytics.js'
import { createCaptureTransport } from '../../src/features/food-visualizer/posthogCapture.js'
const config=analyticsConfig('phc_unit_test_public_project','https://us.i.posthog.com')
const client={hostname:'juanutrisyon.info',protocol:'https:'}
const food={id:78,data_source:'ph_fct',is_visible:1,description:'PRIVATE_NAME',nutrients:[{name:'PRIVATE_NUTRIENT'}]}
const portion={optionId:206,optionKey:'canonical:206',amount:80,unit:'g',quantity:1}
function setup(extra={}) {
 const calls=[];let imports=0,disposed=0
 const tracker=createVisualizerAnalytics({config,getContext:()=>client,loadTransport:async()=>{
  ++imports;return {createCaptureTransport:()=>({capture:(event,properties)=>{calls.push({event,properties});return true},dispose:()=>++disposed})}
 },...extra})
 return {tracker,calls,imports:()=>imports,disposed:()=>disposed}
}
test('only public HTTPS configuration and a nonlocal client can capture',()=>{
 assert(config)
 for(const host of ['localhost','tool.localhost','127.0.0.1','192.168.0.1','[::1]','tool.local','tool.test',''])assert(localAnalyticsHost(host))
 for(const host of ['http://us.i.posthog.com','https://user:secret@us.i.posthog.com','https://us.i.posthog.com/path','https://us.i.posthog.com/?token=secret','https://localhost'])assert.equal(analyticsConfig('phc_unit_test_public_project',host),null)
 assert.equal(analyticsConfig('phx_personal_secret','https://us.i.posthog.com'),null)
 assert.equal(analyticsPolicy(config,null),'server');assert.equal(analyticsPolicy(null,client),'unconfigured')
 assert.equal(analyticsPolicy(config,{...client,hostname:'localhost'}),'local')
 assert.equal(analyticsPolicy(config,{...client,doNotTrack:'1'}),'privacy')
 assert.equal(analyticsPolicy(config,{...client,globalPrivacyControl:true}),'privacy')
})
test('property projection discards all search, name, URL, nutrition, identity and log fields',()=>{
 const props=eventProperties('selected',{food_id:78,source:'ph_fct',lens:'sugar',serving_option_id:206,unit:'g',quantity:.375,selection_origin:'search',
  query:'PRIVATE_SEARCH',description:'PRIVATE_NAME',url:'PRIVATE_URL',nutrients:'PRIVATE_NUTRIENTS',email:'PRIVATE_EMAIL',diary:'PRIVATE_LOG'})
 assert.deepEqual(Object.keys(props).sort(),['surface','feature_version','food_id','source','lens','serving_option_id','unit','quantity','selection_origin'].sort())
 assert(!JSON.stringify(props).includes('PRIVATE'))
 assert.equal(eventProperties('made_up',{food_id:78}),null)
 assert.equal(eventProperties('portion',{food_id:78,lens:'sugar',quantity:Infinity,unit:'g'}),null)
 assert.equal(eventProperties('outbound',{food_id:78,lens:'sugar',destination_type:'https://secret'}),null)
})
test('unconfigured, server, localhost and privacy signals do not initialize transport',async()=>{
 for(const extra of [{config:null},{getContext:()=>null},{getContext:()=>({...client,hostname:'127.0.0.1'})},
  {getContext:()=>({...client,doNotTrack:'1'})},{getContext:()=>({...client,globalPrivacyControl:true})},{getContext:()=>{throw Error('blocked')}}]) {
  const {tracker,imports,calls}=setup(extra);tracker.setConsent(true);tracker.selected(food,portion,'sugar');await tracker.whenIdle()
  assert.equal(imports(),0);assert.deepEqual(calls,[])
 }
})
test('opt-in sends one open, does not replay earlier selections, and shares one lazy initialization',async()=>{
 const {tracker,calls,imports}=setup()
 tracker.selected(food,portion,'sugar');assert.equal(imports(),0)
 tracker.setConsent(true);tracker.setConsent(true)
 tracker.selected(food,portion,'sugar');tracker.lensChanged(food,'sodium');await tracker.whenIdle()
 assert.equal(imports(),1)
 assert.deepEqual(calls.map(row=>row.event),['food_visualizer_opened','food_visualizer_food_selected','food_visualizer_lens_changed'])
 assert(!JSON.stringify(calls).includes('PRIVATE'))
})
test('portion commits deduplicate accepted values but distinguish recorded versus direct units',async()=>{
 const {tracker,calls}=setup();tracker.setConsent(true);tracker.selected(food,portion,'sugar')
 assert.equal(tracker.portionChanged(food,{...portion},'sugar'),false)
 tracker.portionChanged(food,{...portion,quantity:.375,amount:30},'sugar')
 tracker.portionChanged(food,{...portion,quantity:.375,amount:30},'sugar')
 tracker.portionChanged(food,{optionId:null,optionKey:'source',quantity:1,amount:100,unit:'g'},'sugar')
 tracker.portionChanged(food,{optionId:null,optionKey:'g',quantity:1,amount:1,unit:'g'},'sugar')
 await tracker.whenIdle();assert.equal(calls.filter(row=>row.event.endsWith('portion_changed')).length,3)
})
test('a selected food without a supported portion still records only available public context',async()=>{
 const {tracker,calls}=setup();tracker.setConsent(true);tracker.selected(food,null,'sugar');await tracker.whenIdle()
 const props=calls[1].properties;assert.equal(props.food_id,78);assert(!('quantity'in props));assert(!('unit'in props))
 assert.equal(tracker.selected({...food,is_visible:0},portion,'sugar'),false)
})
test('revocation while initialization is pending drops queued events and prevents stale restoration',async()=>{
 let release,created=0
 const gate=new Promise(resolve=>release=resolve),{tracker,calls}=setup({loadTransport:async()=>{await gate;return {createCaptureTransport:()=>{++created;throw Error('must not run')}}}})
 tracker.setConsent(true);tracker.selected(food,portion,'sugar');tracker.setConsent(false)
 release();await tracker.whenIdle();assert.equal(created,0);assert.deepEqual(calls,[])
 tracker.dispose();tracker.setConsent(true);assert.equal(tracker.lensChanged(food,'sodium'),false)
})
test('loader and capture failures are contained and cannot reject a UI action',async()=>{
 for(const loadTransport of [async()=>{throw Error('import failed')},async()=>({createCaptureTransport:()=>{throw Error('crypto unavailable')}}),
  async()=>({createCaptureTransport:()=>({capture:()=>Promise.reject(Error('network'))})})]) {
  const {tracker}=setup({loadTransport});assert.doesNotThrow(()=>tracker.setConsent(true));assert.doesNotThrow(()=>tracker.selected(food,portion,'sugar'));await tracker.whenIdle()
 }
})
test('all five outbound destination categories are bounded and URLs never enter events',async()=>{
 const {tracker,calls}=setup();tracker.setConsent(true)
 for(const destination of ['food_details','comparison','source_report','source_label','source_recipe'])tracker.outbound(food,'sugar',destination)
 assert.equal(tracker.outbound(food,'sugar','https://private.example/path'),false)
 await tracker.whenIdle();assert.equal(calls.filter(row=>row.event.endsWith('outbound_clicked')).length,5)
})
test('Capture API requests omit credentials/referrers and use a visit-only identity with no person profile',async()=>{
 const requests=[]
 const transport=createCaptureTransport(config,{randomUUID:()=> 'unit-visit-uuid',fetcher:async(url,options)=>{requests.push({url,options});return {ok:true}}})
 await transport.capture('food_visualizer_opened',eventProperties('opened'))
 const {url,options}=requests[0],body=JSON.parse(options.body)
 assert.equal(url,'https://us.i.posthog.com/i/v0/e/');assert.equal(options.credentials,'omit');assert.equal(options.referrerPolicy,'no-referrer');assert.equal(options.redirect,'error')
 assert.equal(body.distinct_id,'unit-visit-uuid');assert.equal(body.properties.$process_person_profile,false);assert.equal(body.properties.$geoip_disable,true)
 assert.deepEqual(Object.keys(body).sort(),['api_key','distinct_id','event','properties'])
 assert(!('$current_url'in body.properties));assert(!('$referrer'in body.properties))
 transport.dispose();assert.equal(await transport.capture('food_visualizer_opened',{}),false)
})
test('timeouts and withdrawal abort capture without retries or surfacing errors',async()=>{
 let calls=0
 const transport=createCaptureTransport(config,{randomUUID:()=> 'unit-visit-uuid',timeout:5,fetcher:async(_,options)=>{
  ++calls;await new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(Error('aborted'))));return {ok:true}
 }})
 assert.equal(await transport.capture('food_visualizer_opened',{}),false);assert.equal(calls,1)
 const pending=transport.capture('food_visualizer_opened',{});transport.dispose();assert.equal(await pending,false);assert.equal(calls,2)
})
