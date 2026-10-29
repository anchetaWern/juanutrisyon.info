// Explicit, bounded capture-endpoint smoke test; never run during a build.
import { readFile,writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { analyticsConfig,eventProperties,analyticsEvents } from '../src/features/food-visualizer/analytics.js'
import { createCaptureTransport } from '../src/features/food-visualizer/posthogCapture.js'
const args=process.argv.slice(2)
if(!args.includes('--send'))throw Error('Use --send to explicitly submit five verification events to the configured project.')
const envFile=args.find(value=>value.startsWith('--env-file='))?.slice(11)??'.env.local'
const output=args.find(value=>value.startsWith('--output='))?.slice(9)??'/private/tmp/jn-phase12-capture-evidence.json'
const input=await readFile(envFile,'utf8')
const value=key=>input.match(new RegExp('^'+key+'=(.*)$','m'))?.[1].trim().replace(/^['"]|['"]$/g,'')
const config=analyticsConfig(value('VITE_POSTHOG_PROJECT_TOKEN'),value('VITE_POSTHOG_HOST'))
if(!config)throw Error('Public project configuration is missing or invalid.')
const visit=`phase12-verification-${randomUUID()}`,responses=[]
const transport=createCaptureTransport(config,{randomUUID:()=>visit,timeout:8000,fetcher:async(url,options)=>{
 const response=await fetch(url,options),body=await response.text()
 let acknowledged=false,acknowledgementFormat='unrecognized'
 try{
  const parsed=JSON.parse(body),status=parsed?.status
  acknowledged=parsed===1||status===1||['ok','success'].includes(String(status).toLowerCase())
  acknowledgementFormat=parsed===1?'numeric-one':typeof status==='string'?`status-${String(status).replace(/[^a-z]/gi,'').slice(0,20)}`:typeof status==='number'?'numeric-status':'json-other'
 }catch{acknowledged=body.trim().toLowerCase()==='ok';acknowledgementFormat=acknowledged?'text-ok':'non-json'}
 responses.push({event:JSON.parse(options.body).event,httpStatus:response.status,acknowledged,acknowledgementFormat})
 return {ok:response.ok&&acknowledged}
}})
const properties={food_id:78,source:'ph_fct',lens:'carbohydrates',serving_option_id:206,unit:'g',quantity:1,
 selection_origin:'example',destination_type:'food_details'}
try{
 for(const action of ['opened','selected','portion','lens','outbound']) {
  const accepted=await transport.capture(analyticsEvents[action],eventProperties(action,properties))
  if(!accepted)throw Error('A verification request was not acknowledged; inspect status-only evidence, not credentials.')
 }
}finally{
 transport.dispose()
 const evidence={checkedAt:new Date().toISOString(),host:config.host,method:'Local Node capture-endpoint smoke test; five explicit verification events using public rice catalog context.',
  verificationVisit:visit,tokenRecorded:false,personProfiles:false,responses,
  captureEndpointAcknowledged:responses.length===5&&responses.every(row=>row.acknowledged),
  mainSiteDeploymentVerified:false,projectQueryReadbackVerified:false,
  limitation:'A capture acknowledgement does not establish event query visibility or verify a deployed main-site build.'}
 await writeFile(output,JSON.stringify(evidence,null,2)+'\n')
 console.log(JSON.stringify(evidence,null,2))
}
