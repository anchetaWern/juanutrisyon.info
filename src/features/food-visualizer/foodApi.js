import { hasVisualizerSource, visualizerCatalog, visualizerCatalogVersion } from './eligibility.js'

export class FoodApiError extends Error {
  constructor(code, status = 0, retryAt = null) {
    super(code); this.name = 'FoodApiError'; this.code = code; this.status = status; this.retryAt = retryAt
  }
}
const abortError = () => new DOMException('Request cancelled', 'AbortError')
const freeze = value => {
  if (value && typeof value === 'object') { Object.freeze(value); Object.values(value).forEach(freeze) }
  return value
}
const validFood = food => food && Number.isSafeInteger(food.id) && food.id > 0 &&
  typeof food.description === 'string' && food.description.trim() &&
  typeof food.description_slug === 'string' && food.description_slug.trim()
export const normalizeQuery = query => String(query ?? '').trim().replace(/\s+/g, ' ')

export function createFoodApi({ baseUrl = 'https://api.juanutrisyon.info/api',
  fetcher = (...args) => globalThis.fetch(...args), now = Date.now,
  searchTtl = 300000, detailTtl = 900000, searchLimit = 20, detailLimit = 30 } = {}) {
  const base = new URL(baseUrl)
  if (!['https:', 'http:'].includes(base.protocol) || !base.pathname.replace(/\/$/, '').endsWith('/api') || base.search || base.hash || base.username || base.password) throw new Error('Expected public API base ending in /api')
  const caches = { search: new Map(), detail: new Map() }, flights = new Map()
  let blockedUntil = 0
  function request(kind, key, path, signal, validate) {
    if (signal?.aborted) return Promise.reject(abortError())
    if (now() < blockedUntil) return Promise.reject(new FoodApiError('rate_limited', 429, blockedUntil))
    const cache = caches[kind], hit = cache.get(key)
    if (hit && hit.expires > now()) {
      cache.delete(key); cache.set(key, hit)
      return Promise.resolve(hit.value)
    }
    cache.delete(key)
    const flightKey = `${kind}:${key}`
    let flight = flights.get(flightKey)
    if (!flight) {
      const controller = new AbortController()
      flight = { controller, subscribers: 0 }
      flights.set(flightKey, flight)
      flight.promise = (async () => {
        try {
          const response = await fetcher(`${base.href.replace(/\/$/, '')}/${path}`, {
            method: 'GET', credentials: 'omit', headers: { Accept: 'application/json' }, signal: controller.signal,
          })
          if (!response.ok) {
            if (response.status === 429) {
              const retry = response.headers.get('Retry-After')
              const date = retry && (/^\d+$/.test(retry.trim()) ? now() + Number(retry) * 1000 : Date.parse(retry))
              const retryAt = Number.isFinite(date) && date > now() ? date : null
              blockedUntil = retryAt ?? 0
              throw new FoodApiError('rate_limited', 429, retryAt)
            }
            throw new FoodApiError(response.status === 404 ? 'not_found' : 'server', response.status)
          }
          let value
          try { value = validate(await response.json()) } catch { throw new FoodApiError('invalid_response') }
          if (controller.signal.aborted) throw abortError()
          freeze(value)
          cache.set(key, { value, expires: now() + (kind === 'search' ? searchTtl : detailTtl) })
          const limit = kind === 'search' ? searchLimit : detailLimit
          while (cache.size > limit) cache.delete(cache.keys().next().value)
          return value
        } catch (error) {
          if (error.name === 'AbortError' || error instanceof FoodApiError) throw error
          throw new FoodApiError('network')
        } finally { if (flights.get(flightKey) === flight) flights.delete(flightKey) }
      })()
    }
    flight.subscribers++
    return new Promise((resolve, reject) => {
      let done = false
      function finish(callback, value) {
        if (done) return
        done = true; signal?.removeEventListener('abort', cancel); flight.subscribers--; callback(value)
      }
      function cancel() {
        finish(reject, abortError())
        if (flight.subscribers === 0) {
          flight.controller.abort()
          if (flights.get(flightKey) === flight) flights.delete(flightKey)
        }
      }
      signal?.addEventListener('abort', cancel, { once: true })
      flight.promise.then(value => finish(resolve, value), error => finish(reject, error))
    })
  }
  return {
    searchFoods({ query, page = 1, signal } = {}) {
      query = normalizeQuery(query)
      if (!query || !Number.isSafeInteger(page) || page < 1) return Promise.reject(new FoodApiError('invalid_query'))
      const params = new URLSearchParams({ description: query, page: String(page), catalog: visualizerCatalog })
      return request('search', `${visualizerCatalog}:${visualizerCatalogVersion}:${query.toLowerCase()}:${page}`, `foods?${params}`, signal, data => {
        if (!data || data.catalog !== visualizerCatalog || data.catalog_version !== visualizerCatalogVersion ||
          !Array.isArray(data.data) || !data.data.every(food => validFood(food) && hasVisualizerSource(food)) ||
          !['current_page', 'last_page', 'per_page', 'total'].every(key => Number.isSafeInteger(data[key])) ||
          data.current_page !== page || data.last_page < 1 || data.per_page < 1 || data.total < 0) throw new Error()
        return { items: data.data.map(food => ({ id: food.id, slug: food.description_slug,
          description: food.description, brand: typeof food.brand === 'string' ? food.brand : null,
          source: food.data_source ?? null, category: food.subtype?.name ?? food.type?.name ?? null })),
        page: data.current_page, lastPage: data.last_page, total: data.total }
      })
    },
    getFood({ slug, signal } = {}) {
      if (typeof slug !== 'string' || !slug.trim()) return Promise.reject(new FoodApiError('invalid_query'))
      return request('detail', slug, `foods/${encodeURIComponent(slug)}?catalog=${visualizerCatalog}`, signal, food => {
        if (!validFood(food) || food.description_slug !== slug || !Array.isArray(food.nutrients)) throw new Error()
        return food // Full source/recipe/import evidence; no nutrient mapping or defaults.
      })
    },
  }
}
