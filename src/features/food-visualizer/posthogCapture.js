// Isolated Capture API transport: no SDK/autocapture/replay/URL collection.
export function createCaptureTransport({token,host}, {fetcher=(...args)=>fetch(...args),
 randomUUID=()=>crypto.randomUUID(),timeout=5000}={}) {
 const distinctId=randomUUID(),controllers=new Set()
 let disposed=false
 return {
  async capture(event,properties) {
   if(disposed)return false
   const controller=new AbortController();controllers.add(controller)
   const timer=setTimeout(()=>controller.abort(),timeout)
   try {
    const response=await fetcher(`${host}/i/v0/e/`,{method:'POST',credentials:'omit',referrerPolicy:'no-referrer',
     redirect:'error',keepalive:true,headers:{'Content-Type':'application/json'},signal:controller.signal,
     body:JSON.stringify({api_key:token,distinct_id:distinctId,event,
      properties:{...properties,$process_person_profile:false,$geoip_disable:true}})})
    return response.ok
   }catch{return false}
   finally{clearTimeout(timer);controllers.delete(controller)}
  },
  dispose(){disposed=true;for(const controller of controllers)controller.abort();controllers.clear()},
 }
}
