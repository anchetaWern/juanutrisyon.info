import { onMounted } from 'vue'

const ADSENSE_SCRIPT_ID = 'adsense-script'
const ADSENSE_SRC =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2093406345516048'

function injectAdsenseScript() {
  if (typeof document === 'undefined') {
    return
  }

  if (document.getElementById(ADSENSE_SCRIPT_ID)) {
    return
  }

  const script = document.createElement('script')
  script.id = ADSENSE_SCRIPT_ID
  script.async = true
  script.src = ADSENSE_SRC
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}

function scheduleAdsenseLoad() {
  const loadScript = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => injectAdsenseScript(), { timeout: 2000 })
      return
    }

    window.setTimeout(injectAdsenseScript, 1500)
  }

  if (document.readyState === 'complete') {
    loadScript()
    return
  }

  window.addEventListener('load', loadScript, { once: true })
}

export function useAdsenseLoader() {
  onMounted(() => {
    if (typeof window === 'undefined') {
      return
    }

    scheduleAdsenseLoad()
  })
}
