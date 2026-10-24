export const analyticsVersion = 'food-visualizer-1'
export const analyticsEvents = Object.freeze({ opened:'food_visualizer_opened', selected:'food_visualizer_food_selected',
 portion:'food_visualizer_portion_changed', lens:'food_visualizer_lens_changed', outbound:'food_visualizer_outbound_clicked' })
const sources = new Set(['ph_fct','usda_fdc','nutrition_label','community_recipe','openfoodfacts'])
const lenses = new Set(['sugar','sodium','saturated-fat','carbohydrates'])
const destinations = new Set(['food_details','comparison','source_report','source_label','source_recipe'])
const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0
export function localAnalyticsHost(hostname='') {
 const host=String(hostname).toLowerCase().replace(/\.$/,'')
 return !host.includes('.') || host.includes(':') || /^\d+(?:\.\d+){3}$/.test(host) ||
  /(^|\.)(localhost|local|internal|test|invalid)$/.test(host)
}
export function analyticsConfig(token, host) {
 if(typeof token!=='string'||!/^phc_[\w-]{8,200}$/.test(token))return null
 try {
  const url=new URL(host)
  if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash||localAnalyticsHost(url.hostname))return null
  return Object.freeze({token,host:url.origin})
 }catch{return null}
}
export function analyticsPolicy(config, context) {
 if(!context)return 'server'
 if(!config)return 'unconfigured'
 if(context.protocol!=='https:'||localAnalyticsHost(context.hostname))return 'local'
 if(context.doNotTrack==='1'||context.globalPrivacyControl===true)return 'privacy'
 return 'ready'
}
export function eventProperties(action, input={}) {
 if(!Object.hasOwn(analyticsEvents,action))return null
 const properties={surface:'food_visualizer',feature_version:analyticsVersion}
 if(action==='opened')return properties
 if(!Number.isSafeInteger(input.food_id)||input.food_id<=0||!lenses.has(input.lens))return null
 properties.food_id=input.food_id;properties.source=sources.has(input.source)?input.source:'unknown';properties.lens=input.lens
 const usablePortion=positive(input.quantity)&&['g','mL','serving','piece'].includes(input.unit)
 if(action==='portion'&&!usablePortion)return null
 if((action==='selected'||action==='portion')&&usablePortion) {
  properties.serving_option_id=Number.isSafeInteger(input.serving_option_id)&&input.serving_option_id>0?input.serving_option_id:null
  properties.unit=input.unit;properties.quantity=input.quantity
 }
 if(action==='selected') {
  if(!['search','example'].includes(input.selection_origin))return null
  properties.selection_origin=input.selection_origin
 }
 if(action==='outbound') {
  if(!destinations.has(input.destination_type))return null
  properties.destination_type=input.destination_type
 }
 return properties
}
function context(food,selection,lens) {
 if(String(food?.is_visible)==='0'||food?.is_visible===false)return {}
 return {food_id:food?.id,source:food?.data_source,lens,serving_option_id:selection?.optionId,
  unit:selection?.unit,quantity:selection?.quantity,optionKey:selection?.optionKey,amount:selection?.amount}
}
const portionKey = data => JSON.stringify([data.food_id,data.serving_option_id??null,data.optionKey,data.amount,data.unit,data.quantity])

export function createVisualizerAnalytics({config=null,getContext=()=>null,
 loadTransport=()=>import('./posthogCapture.js')}={}) {
 let consent=false,disposed=false,opened=false,generation=0,client=null,loading=null,lastPortion=null
 const pending=new Set()
 const policy=()=>{try{return analyticsPolicy(config,getContext())}catch{return 'privacy'}}
 const allowed=()=>!disposed&&consent&&policy()==='ready'
 function stop(){++generation;client?.dispose();client=null;loading=null}
 function capture(action,input) {
  const properties=eventProperties(action,input)
  if(!allowed()||!properties||pending.size>=50)return false
  const id=generation
  // No SDK, identity, import or request until the first permitted event.
  if(!loading)loading=Promise.resolve().then(loadTransport).then(module=>{
   if(id!==generation||!allowed())return null
   client=module.createCaptureTransport(config);return client
  })
  const work=loading.then(transport=>id===generation&&allowed()&&transport
   ? transport.capture(analyticsEvents[action],properties) : false).catch(()=>false)
  pending.add(work);work.finally(()=>pending.delete(work))
  return true
 }
 return {policy,
  setConsent(value) {
   if(disposed)return
   consent=value===true
   if(!consent){stop();return}
   if(!opened&&allowed()){opened=true;capture('opened')}
  },
  selected(food,selection,lens,origin='search') {
   const data=context(food,selection,lens);lastPortion=portionKey(data)
   return capture('selected',{...data,selection_origin:origin})
  },
  portionChanged(food,selection,lens) {
   const data=context(food,selection,lens),key=portionKey(data)
   if(!eventProperties('portion',data)||key===lastPortion)return false
   lastPortion=key;return capture('portion',data)
  },
  lensChanged(food,lens){return capture('lens',context(food,null,lens))},
  outbound(food,lens,destination){return capture('outbound',{...context(food,null,lens),destination_type:destination})},
  async whenIdle(){await Promise.allSettled([...pending])},
  dispose(){disposed=true;consent=false;stop()},
 }
}
