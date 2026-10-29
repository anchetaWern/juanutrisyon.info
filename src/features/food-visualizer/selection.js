import { shallowReactive } from 'vue'
import { FoodApiError, normalizeQuery } from './foodApi.js'
import { isVisualizerFood } from './eligibility.js'

export function createFoodSelection(api) {
  const state = shallowReactive({ query: '', committedQuery: '', page: 1, lastPage: 1, total: 0,
    results: [], searchStatus: 'idle', searchError: null, detailStatus: 'idle', detailError: null,
    selectedFood: null, pendingFood: null })
  let searchId = 0, detailId = 0, searchController, detailController
  async function search(page = 1, query = state.query) {
    query = normalizeQuery(query)
    if (!query) return
    const id = ++searchId
    searchController?.abort(); searchController = new AbortController()
    state.committedQuery = query; state.page = page; state.searchStatus = 'loading'
    state.searchError = null; state.results = []; state.total = 0
    try {
      const result = await api.searchFoods({ query, page, signal: searchController.signal })
      if (id !== searchId) return
      state.results = result.items; state.page = result.page; state.lastPage = result.lastPage; state.total = result.total
      state.searchStatus = result.items.length ? 'ready' : 'empty'
    } catch (error) {
      if (id !== searchId || error.name === 'AbortError') return
      state.searchError = error; state.searchStatus = 'error'
    }
  }
  async function select(food) {
    const id = ++detailId
    detailController?.abort(); detailController = new AbortController()
    state.selectedFood = null; state.pendingFood = food; state.detailStatus = 'loading'; state.detailError = null
    try {
      const raw = await api.getFood({ slug: food.slug, signal: detailController.signal })
      if (id !== detailId) return
      if (raw.id !== food.id) throw new Error('Selected food identity changed')
      if (!isVisualizerFood(raw)) throw new FoodApiError('ineligible_food')
      state.selectedFood = raw; state.detailStatus = 'ready'
    } catch (error) {
      if (id !== detailId || error.name === 'AbortError') return
      state.detailError = error; state.detailStatus = 'error'
    }
  }
  function changeFood() {
    ++detailId; detailController?.abort(); state.selectedFood = null; state.pendingFood = null
    state.detailStatus = 'idle'; state.detailError = null
  }
  return { state, search, select, changeFood,
    retrySearch: () => search(state.page, state.committedQuery),
    retryDetail: () => state.pendingFood && select(state.pendingFood),
    dispose() { ++searchId; ++detailId; searchController?.abort(); detailController?.abort() },
  }
}
