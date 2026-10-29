import { onMounted, onUnmounted, ref } from 'vue'
import { analyticsConfig, createVisualizerAnalytics } from '../features/food-visualizer/analytics.js'
const preferenceKey='jn_visualizer_analytics'
export function useVisualizerAnalytics() {
 const config=analyticsConfig(import.meta.env.VITE_POSTHOG_PROJECT_TOKEN,import.meta.env.VITE_POSTHOG_HOST)
 const policy=ref('server'),enabled=ref(false)
 const tracker=createVisualizerAnalytics({config,getContext:()=>typeof window==='undefined'?null:{
  hostname:window.location.hostname,protocol:window.location.protocol,
  doNotTrack:window.navigator.doNotTrack,globalPrivacyControl:window.navigator.globalPrivacyControl}})
 function restore() {
  policy.value=tracker.policy()
  let choice=false
  try{choice=localStorage.getItem(preferenceKey)==='on'}catch{}
  enabled.value=choice&&policy.value==='ready';tracker.setConsent(enabled.value)
 }
 function setEnabled(choice) {
  policy.value=tracker.policy();enabled.value=choice===true&&policy.value==='ready'
  try{localStorage.setItem(preferenceKey,enabled.value?'on':'off')}catch{}
  tracker.setConsent(enabled.value)
 }
 function storage(event){if(event.key===preferenceKey||event.key===null)restore()}
 onMounted(()=>{restore();window.addEventListener('storage',storage)})
 onUnmounted(()=>{window.removeEventListener('storage',storage);tracker.dispose()})
 return {tracker,policy,enabled,setEnabled}
}
