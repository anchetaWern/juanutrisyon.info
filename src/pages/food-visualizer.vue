<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { usePageSeo } from '@/composables/usePageSeo'
import { createFoodApi } from '@/features/food-visualizer/foodApi'
import SourceDetails from '@/features/food-visualizer/components/SourceDetails.vue'
import { moreNutrients } from '@/features/food-visualizer/disclosure'
import { featuredFoods } from '@/features/food-visualizer/featuredFoods'
import { resultAnnouncement } from '@/features/food-visualizer/announcements'
import { useVisualizerAnalytics } from '@/composables/useVisualizerAnalytics'
import CarbohydrateLens from '@/features/food-visualizer/components/CarbohydrateLens.vue'
import { createRiceReference } from '@/features/food-visualizer/riceReference'
import { createColaReference } from '@/features/food-visualizer/colaReference'
import { sugarComparison, sugarVisualization } from '@/features/food-visualizer/sugarComparison'
import SaturatedFatLens from '@/features/food-visualizer/components/SaturatedFatLens.vue'
import SodiumLens from '@/features/food-visualizer/components/SodiumLens.vue'
import SugarLens from '@/features/food-visualizer/components/SugarLens.vue'
import { createLensState, lenses, sugarResult } from '@/features/food-visualizer/lenses'
import { createFoodSelection } from '@/features/food-visualizer/selection'
import { createPortionState, nutrientSummary, formatNutrient } from '@/features/food-visualizer/portions'

usePageSeo({ title: "Food Visualizer — Ano’ng Nasa Pagkain Ko?",
  description: 'Explore Filipino foods and learn about total sugar, sodium, saturated fat and carbohydrates. Search the Juan Nutrisyon food catalog without an account.',
  path: '/tools/food-visualizer' })
const foodApi = createFoodApi({ baseUrl: import.meta.env.VITE_FOOD_API_BASE_URL || undefined })
const analytics = useVisualizerAnalytics()
const selection = createFoodSelection(foodApi)
const rice = createRiceReference(foodApi)
const cola = createColaReference(foodApi)
const { state } = selection
const portions = createPortionState()
const portion = portions.state
const lensModel = createLensState()
const lens = lensModel.state
watch(() => [state.selectedFood, lens.active, portion.result], ([food, active]) => {
  if (food && active === 'carbohydrates') rice.ensure(food)
  if (food && active === 'sugar' && sugarVisualization(food) === 'cola' && sugarResult(portion.result).grams !== null) cola.ensure(food)
}, { immediate: true, flush: 'post' })
const activeLensLabel = computed(() => lenses.find(view => view.id === lens.active)?.label ?? '')
watch(() => state.selectedFood, food => lensModel.setFood(food), { immediate: true, flush: 'sync' })
watch(() => state.selectedFood, food => portions.setFood(food), { immediate: true, flush: 'sync' })
const additionalNutrients = computed(() => moreNutrients(portion.result))
const summary = computed(() => nutrientSummary(portion.result))
const sugarReference = computed(() => sugarComparison(state.selectedFood, cola.state))
const selectedBasis = computed(() => portion.selection
  ? `${new Intl.NumberFormat('en', { maximumSignificantDigits: 12 }).format(portion.selection.amount)} ${portion.selection.unit}` : '')
const announcement = computed(() => state.selectedFood
  ? `${state.selectedFood.description}. ${portion.error ? 'Last valid portion' : 'Selected portion'}: ${selectedBasis.value || 'unavailable'}. ${resultAnnouncement(lens.active, portion.result, lens.active === 'sugar' ? sugarReference.value : rice.state)}` : '')
function changeOption(event) {
  if (portions.setOption(event.target.value)) commitPortion()
  event.target.value = portion.optionKey
}
function commitPortion() {
  if (!portion.error && portion.selection) analytics.tracker.portionChanged(state.selectedFood, portion.selection, lens.active)
}
function stepPortion(direction) { if (portions.step(direction)) commitPortion() }
function chooseLens(id) {
  const before = lens.active
  if (lensModel.choose(id) && lens.active !== before) analytics.tracker.lensChanged(state.selectedFood, lens.active)
}
function useSuggested() {
  if (lens.mode !== 'manual') return
  const before = lens.active
  lensModel.useSuggested()
  if (lens.active !== before) analytics.tracker.lensChanged(state.selectedFood, lens.active)
}
const input = ref(null), results = ref(null), preview = ref(null), clock = ref(0)
const detailView = ref(false)
const resultList = ref(null)
let resultScroll = 0
let timer, focusRequest = 0, selectedAction = 0
onMounted(() => {
  clock.value = Date.now(); timer = setInterval(() => { clock.value = Date.now() }, 1000)
  window.addEventListener('visualizer:search', focusSearch)
})
onUnmounted(() => { selection.dispose(); rice.dispose(); cola.dispose(); clearInterval(timer); window.removeEventListener('visualizer:search', focusSearch) })
const sourceNames = { ph_fct: 'Philippine Food Composition Tables', usda_fdc: 'USDA FoodData Central',
  nutrition_label: 'Nutrition label', community_recipe: 'Community recipe', openfoodfacts: 'Open Food Facts' }
const sourceName = source => sourceNames[source] ?? 'Source not specified'
const basis = computed(() => {
  const food = state.selectedFood
  const amount = Number(food?.serving_size)
  return food?.serving_size != null && Number.isFinite(amount) && amount > 0 && food.serving_size_unit
    ? `${amount} ${food.serving_size_unit}` : 'Not available'
})
function errorText(error) {
  if (error?.code === 'ineligible_food') return 'This food no longer has an eligible source and usable custom serving. Please choose another food.'
  if (error?.code === 'rate_limited') return 'Too many requests. Please wait before trying again.'
  if (error?.code === 'not_found') return 'This food is no longer available. Please choose another food.'
  if (error?.code === 'invalid_response') return 'The food data could not be read. Please try again or choose another food.'
  return 'We could not load the food catalog. Check your connection and try again.'
}
function waitSeconds(error) { return Math.max(0, Math.ceil(((error?.retryAt ?? 0) - clock.value) / 1000)) }
async function choose(food, selectionOrigin = 'search') {
  resultScroll = resultList.value?.scrollTop ?? 0
  detailView.value = true
  const action = ++selectedAction
  const request = ++focusRequest, origin = document.activeElement
  await selection.select(food)
  if (action === selectedAction && state.detailStatus === 'ready' && state.selectedFood?.id === food.id)
    analytics.tracker.selected(state.selectedFood, portion.selection, lens.active, selectionOrigin)
  await nextTick()
  if (request === focusRequest && ['ready', 'error'].includes(state.detailStatus) &&
    (document.activeElement === origin || document.activeElement === document.body)) preview.value?.focus()
}
async function runSearch(page = 1, query = state.query) {
  if (!query.trim()) return
  detailView.value = false
  const request = ++focusRequest, origin = document.activeElement, inputValue = state.query
  await selection.search(page, query)
  await nextTick()
  if (request === focusRequest && state.query === inputValue && state.searchStatus !== 'loading' &&
    (document.activeElement === origin || document.activeElement === document.body)) results.value?.focus()
}
async function changeFood() {
  ++focusRequest; ++selectedAction; selection.changeFood(); detailView.value = false
  await nextTick(); input.value?.focus()
  if (resultList.value) resultList.value.scrollTop = resultScroll
}
async function backToResults() {
  ++focusRequest; detailView.value = false
  await nextTick()
  const selected = resultList.value?.querySelector('[aria-pressed="true"]')
  if (selected) selected.focus({ preventScroll: true })
  else input.value?.focus()
  if (resultList.value) resultList.value.scrollTop = resultScroll
  results.value?.scrollIntoView({ block: 'start' })
}
async function focusSearch() {
  ++focusRequest; detailView.value = false
  await nextTick(); input.value?.focus()
}
function suggestion(query) { state.query = query; runSearch() }
</script>

<template>
  <main id="food-visualizer" tabindex="-1" class="page-container visualizer" :class="{ 'visualizer--detail': detailView }">
    <p class="sr-only" role="status" aria-live="polite" aria-atomic="true" data-result-announcement>{{ announcement }}</p>
    <header class="intro">
      <h1 lang="fil">Ano’ng Nasa Pagkain Ko?</h1>
      <p>Explore Filipino foods, choose your portion and see the nutrient story. <span class="access-note">Free, no sign-in.</span></p>
    </header>

    <!-- 1180px sheet: 48px padding + 320px picker + 24px gutter + 788px workspace. -->
    <div class="selection-grid">
    <aside class="food-picker" aria-label="Find a food">
    <section class="search-panel" aria-labelledby="search-heading">
      <h2 id="search-heading">Choose a food or drink</h2>
      <form role="search" @submit.prevent="runSearch()">
        <label for="food-search">Food name</label>
        <div class="search-row">
          <input id="food-search" ref="input" v-model="state.query" type="search" maxlength="200"
            placeholder="e.g. rice, pandesal, mango" autocomplete="off" aria-describedby="search-help" />
          <button class="primary" type="submit" :disabled="!state.query.trim()">Search</button>
        </div>
        <p id="search-help" class="muted">PhilFCT, community recipes and nutrition-label foods with custom servings. Check the exact food, brand and preparation.</p>
      </form>
      <div class="suggestions" role="group" aria-label="Search suggestions">
        <span>Search ideas:</span>
        <button v-for="query in ['rice', 'pandesal', 'mango', 'patis']" :key="query" type="button" @click="suggestion(query)">{{ query }}</button>
      </div>
      <div v-if="featuredFoods.length" class="suggestions" role="group" aria-label="Reviewed examples">
        <span>Reviewed examples:</span>
        <button v-for="food in featuredFoods" :key="food.id" type="button" @click="choose(food, 'example')">{{ food.description }}</button>
      </div>
    </section>

      <section ref="results" tabindex="-1" class="panel results" aria-labelledby="results-heading">
        <h2 id="results-heading">Matching foods</h2>
        <div role="status" aria-live="polite" aria-atomic="true">
          <p v-if="state.searchStatus === 'idle'" class="muted">Enter a food name to explore the catalog.</p>
          <p v-else-if="state.searchStatus === 'loading'">Searching for “{{ state.committedQuery }}”…</p>
          <p v-else-if="state.searchStatus === 'empty'">No matches for “{{ state.committedQuery }}” among PhilFCT, community recipes and nutrition-label foods with usable custom servings. Try a different spelling or a broader food name.</p>
          <p v-else-if="state.searchStatus === 'ready'" class="muted">{{ state.total }} matches for “{{ state.committedQuery }}” · Page {{ state.page }} of {{ state.lastPage }}</p>
        </div>
        <div v-if="state.searchStatus === 'error'" class="error">
          <p role="alert">{{ errorText(state.searchError) }}</p>
          <button type="button" :disabled="waitSeconds(state.searchError) > 0" @click="runSearch(state.page, state.committedQuery)">{{ waitSeconds(state.searchError) ? `Try again in ${waitSeconds(state.searchError)}s` : 'Try search again' }}</button>
        </div>
        <ol v-if="state.results.length" ref="resultList" class="result-list">
          <li v-for="food in state.results" :key="food.id">
            <button type="button" :aria-pressed="state.selectedFood?.id === food.id" @click="choose(food)">
              <span><strong>{{ food.description }}</strong><span class="result-meta">{{ [food.brand, food.category, sourceName(food.source)].filter(Boolean).join(' · ') }}</span></span>
              <span class="select-label">{{ state.selectedFood?.id === food.id ? 'Selected' : 'Select' }} →</span>
            </button>
          </li>
        </ol>
        <nav v-if="state.searchStatus === 'ready' && state.lastPage > 1" aria-label="Food search pages" class="pagination">
          <button type="button" :disabled="state.page <= 1" @click="runSearch(state.page - 1, state.committedQuery)">Previous</button>
          <span>{{ state.page }} / {{ state.lastPage }}</span>
          <button type="button" :disabled="state.page >= state.lastPage" @click="runSearch(state.page + 1, state.committedQuery)">Next</button>
        </nav>
      </section>
    </aside>

    <div class="food-workspace">
      <button v-if="detailView" class="back-results" type="button" @click="backToResults">← Back to results</button>
      <section ref="preview" tabindex="-1" class="panel preview" aria-labelledby="preview-heading">
        <h2 id="preview-heading">{{ state.selectedFood?.description ?? 'Your food preview' }}</h2>
        <div role="status" aria-live="polite">
          <p v-if="state.detailStatus === 'idle'" class="muted">Choose a food to explore sugar, sodium, saturated fat and carbohydrates for your portion.</p>
          <p v-else-if="state.detailStatus === 'loading'">Loading {{ state.pendingFood?.description }}…</p>
        </div>
        <div v-if="state.detailStatus === 'error'" class="error">
          <p role="alert">{{ errorText(state.detailError) }}</p>
          <button v-if="!['not_found', 'ineligible_food'].includes(state.detailError?.code)" type="button" :disabled="waitSeconds(state.detailError) > 0" @click="choose(state.pendingFood)">{{ waitSeconds(state.detailError) ? `Try again in ${waitSeconds(state.detailError)}s` : 'Try loading again' }}</button>
        </div>
        <template v-if="state.selectedFood">
          <dl class="food-identity">
            <div v-if="state.selectedFood.brand"><dt>Brand</dt><dd>{{ state.selectedFood.brand }}</dd></div>
            <div><dt>Source</dt><dd>{{ sourceName(state.selectedFood.data_source) }}</dd></div>
            <div><dt>Recorded nutrient basis</dt><dd>{{ basis }}</dd></div>
          </dl>
          <div v-if="portion.options.length" class="portion-controls">
            <h3>Choose your portion</h3>
            <div class="portion-fields">
            <div>
            <label for="serving-option">Serving</label>
            <select id="serving-option" :value="portion.optionKey" @change="changeOption">
              <option v-for="option in portion.options" :key="option.key" :value="option.key">{{ option.label }}</option>
            </select>
            </div>
            <div>
            <label for="portion-quantity">Quantity</label>
            <div class="quantity-row">
              <button type="button" aria-label="Decrease quantity by 0.5" :disabled="(portion.selection?.quantity ?? 0) <= 0.5" @click="stepPortion(-1)">−</button>
              <input id="portion-quantity" :value="portion.quantity" type="text" inputmode="decimal" :aria-invalid="!!portion.error"
                aria-describedby="quantity-help quantity-error" @input="portions.setQuantity($event.target.value)" @change="commitPortion" @keydown.enter.prevent="commitPortion" />
              <button type="button" aria-label="Increase quantity by 0.5" @click="stepPortion(1)">+</button>
            </div>
            </div>
            </div>
            <p id="quantity-help" class="muted">Decimals accepted, e.g. 0.5 or 1.25. Buttons adjust by 0.5.</p>
            <p id="quantity-error" class="validation-error" role="status">{{ portion.error }}</p>
          </div>
          <p v-else class="muted">No supported serving basis is available for this record.</p>
          <div v-if="portion.selection" class="selected-basis">
            <p><strong>{{ portion.error ? 'Last valid portion' : 'Selected portion' }}: {{ selectedBasis }}</strong><span v-if="state.selectedFood.edible_basis === 'edible'"> (edible weight)</span><span v-else-if="state.selectedFood.edible_basis === 'as_purchased'"> (as-purchased weight)</span></p>
          </div>
        </template>
        <button v-if="state.detailStatus !== 'idle'" type="button" class="change" @click="changeFood">Change food</button>
      </section>

    <div v-if="state.selectedFood" class="lens-controls">
      <fieldset>
        <legend>Explore a nutrient</legend>
        <div class="lens-options">
          <label v-for="view in lenses" :key="view.id" :class="{ unavailable: !view.available }">
            <input type="radio" name="nutrient-lens" :value="view.id" :checked="lens.active === view.id" :disabled="!view.available" @keydown.space.prevent="chooseLens(view.id)" @click="chooseLens(view.id)" @change="chooseLens(view.id)" />
            <span>{{ view.label }}<small v-if="!view.available">Not available yet</small></span>
          </label>
        </div>
      </fieldset>
      <div class="lens-mode"><p>{{ lens.mode === 'manual' ? 'Your chosen view' : 'Suggested view' }}: {{ activeLensLabel }}</p><button type="button" :aria-disabled="lens.mode === 'suggested'" @click="useSuggested">Use suggested view</button></div>
      <CarbohydrateLens v-if="lens.active === 'carbohydrates'" :result="portion.result" :reference-state="rice.state" :context="lens.context" :portion="selectedBasis" :stale="!!portion.error" @retry="rice.retry(state.selectedFood)" />
      <SaturatedFatLens v-if="lens.active === 'saturated-fat'" :result="portion.result" :portion="selectedBasis" :stale="!!portion.error" />
      <SodiumLens v-if="lens.active === 'sodium'" :result="portion.result" :portion="selectedBasis" :stale="!!portion.error" />
      <SugarLens v-if="lens.active === 'sugar'" :key="sugarReference.mode" :result="portion.result" :comparison="sugarReference" :context="lens.context" :portion="selectedBasis" :stale="!!portion.error" @retry="cola.retry(state.selectedFood)" />
    </div>

    <section v-if="state.selectedFood" class="panel nutrient-summary" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Nutrients in {{ portion.selection ? selectedBasis : 'this portion' }}</h2>
      <p v-if="portion.error" class="validation-error">Showing the last valid portion while you edit the quantity.</p>
      <p class="muted">Values are rounded for display. Missing or incomplete data does not mean zero.</p>
      <dl class="summary-grid">
        <div v-for="field in summary" :key="field.id" :data-nutrient="field.id">
          <dt>{{ field.label }}</dt>
          <dd><strong>{{ formatNutrient(field.value) }}{{ field.value !== null ? ' ' + field.unit : '' }}</strong></dd>
          <dd v-if="field.partial" class="muted">Incomplete recipe data<span v-if="field.node.countsAreExact"> · {{ field.node.knownItemCount }} of {{ field.node.totalItemCount }} contributions known</span></dd>
        </div>
      </dl>
      <details v-if="additionalNutrients.length" class="more-nutrients">
        <summary>More nutrients</summary>
        <p class="muted">Other complete values for the same portion. These are separate nutrient records, not amounts to add together.</p>
        <dl class="summary-grid"><div v-for="field in additionalNutrients" :key="field.id"><dt>{{ field.label }}</dt><dd>{{ field.display }}</dd></div></dl>
      </details>
    </section>
    <SourceDetails v-if="state.selectedFood" :food="state.selectedFood" @outbound="analytics.tracker.outbound(state.selectedFood, lens.active, $event)" />
    <section class="lessons" aria-labelledby="lessons-heading">
      <h2 id="lessons-heading">Four ways to understand food</h2>
      <p>Start with the food and the portion. Each nutrient tells a different part of the story.</p>
      <div class="lesson-grid">
        <article>
          <svg class="lesson-art" viewBox="0 0 96 88" aria-hidden="true" focusable="false">
            <path d="M25 65C8 52 14 22 37 17c17-4 38 9 39 28S47 82 25 65Z" fill="#e8eccb" stroke="#426e17" stroke-width="2"/>
            <path d="M29 62C17 52 22 30 39 26c13-3 28 7 29 20S45 74 29 62Z" fill="#e8c466"/>
            <path d="m30 31 27 28m-34-13 26 26M42 26l25 26M23 57l34-28m-25 39 34-28" fill="none" stroke="#fff8dc" stroke-width="2"/>
            <path d="M47 16c0-7 5-10 10-10-1 7-5 10-10 10Z" fill="#426e17"/>
          </svg>
          <div><h3>Total sugar</h3><p>Total sugar is not necessarily added sugar. Fruit naturally contains sugar, too.</p></div>
        </article>
        <article>
          <svg class="lesson-art" viewBox="0 0 96 88" aria-hidden="true" focusable="false">
            <path d="M37 18h22v15l9 12v30H28V45l9-12Z" fill="#f0e5c9" stroke="#426e17" stroke-width="2" stroke-linejoin="round"/>
            <path d="M29 48h38v26H29Z" fill="#c8ad70"/>
            <path d="M36 10h24v10H36Z" fill="#426e17"/>
            <path d="M35 49h26v18H35Z" fill="#fff"/>
            <path d="M41 55h14m-14 6h9" stroke="#426e17" stroke-width="2" stroke-linecap="round"/>
            <path d="m75 59 5-3 5 3-5 4Zm-1 13 4-3 4 3-4 3Z" fill="#fff" stroke="#7c8b6e" stroke-width="1.5"/>
          </svg>
          <div><h3>Sodium</h3><p>Sodium and salt are different. A salt-equivalent comparison describes weight, not how much salt was added.</p></div>
        </article>
        <article>
          <svg class="lesson-art" viewBox="0 0 96 88" aria-hidden="true" focusable="false">
            <path d="M13 43c0 24 16 36 35 36S83 67 83 43Z" fill="#9b825b" stroke="#6f634b" stroke-width="2"/>
            <ellipse cx="48" cy="43" rx="35" ry="17" fill="#fff" stroke="#6f634b" stroke-width="2"/>
            <ellipse cx="48" cy="43" rx="23" ry="9" fill="#e8eddf" stroke="#a8b89a" stroke-width="1.5"/>
            <path d="m23 59 4 7m42-7-4 8M45 65v8" stroke="#c4b08a" stroke-width="2" stroke-linecap="round"/>
            <path d="M69 8c0 0-7 9-7 13a7 7 0 0 0 14 0c0-4-7-13-7-13Z" fill="#fff" stroke="#426e17" stroke-width="1.5"/>
          </svg>
          <div><h3>Saturated fat</h3><p>See how much the selected portion contributes to the FDA Daily Value of 20 g saturated fat.</p></div>
        </article>
        <article>
          <svg class="lesson-art" viewBox="0 0 96 88" aria-hidden="true" focusable="false">
            <path d="M18 43c0-13 13-24 30-24s30 11 30 24" fill="#fff" stroke="#a8b89a" stroke-width="1.5"/>
            <g stroke="#a8b89a" stroke-width="2" stroke-linecap="round"><path d="m33 32 4 2m8-7 3 3m9 1 4-2m-35 11 4-1m13-3 4 2m10 2 4-2m7 1 3 3"/></g>
            <path d="M12 44h72c-3 21-17 31-36 31S15 65 12 44Z" fill="#dfeacb" stroke="#426e17" stroke-width="2"/>
            <path d="M11 44h74M36 76h24" stroke="#426e17" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <div><h3>Carbohydrates</h3><p>Low sugar does not always mean low carbohydrates. Starch contributes carbohydrates as well.</p></div>
        </article>
      </div>
      <p class="method-note">Food data can be incomplete. Missing values do not mean zero. <RouterLink to="/data-methodology">Read about our data and methods.</RouterLink></p>
    </section>
    </div>
    </div>
    <section v-if="['ready', 'privacy'].includes(analytics.policy.value)" class="analytics-preferences" aria-labelledby="analytics-heading">
      <h2 id="analytics-heading">Usage analytics</h2>
      <label v-if="analytics.policy.value === 'ready'"><input type="checkbox" :checked="analytics.enabled.value" @change="analytics.setEnabled($event.target.checked)" aria-describedby="analytics-help" />Share usage analytics to help improve this tool</label>
      <p v-else>Your browser privacy setting keeps usage analytics off.</p>
      <p id="analytics-help" class="muted">Optional and off by default. Includes catalog food IDs, portion settings and lens choices; excludes search text, account identity and personal food logs. Your choice is remembered in this browser. <RouterLink to="/privacy">Privacy policy</RouterLink></p>
    </section>
    <noscript><p class="panel">Enable JavaScript to search and select foods. You can still read the nutrient explanations above.</p></noscript>
  </main>
</template>

<style scoped>
.visualizer { width: min(100% - 32px, var(--shell-max)); max-width: var(--shell-max); padding: 24px; margin: 8px auto 24px; background: var(--surface-raised); border: 1px solid var(--border-default); border-radius: 16px; line-height: 1.5; }
.intro { margin-bottom: 24px; }
h1 { margin: 0 0 8px; font-size: 28px; line-height: 1.2; font-weight: 700; }
h2 { font-size: 20px; line-height: 1.3; font-weight: 700; }
h3 { font-size: 16px; font-weight: 600; }
.intro p { color: var(--text-secondary); font-size: 14px; }
.access-note { white-space: nowrap; }
.selection-grid { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 24px; align-items: start; }
.food-picker { position: sticky; top: 16px; min-width: 0; }
.food-workspace { min-width: 0; }
.search-panel, .panel { padding: 20px; background: var(--surface-raised); border: 1px solid var(--border-default); border-radius: 8px; }
.search-panel { background: var(--surface-subtle); }
.search-panel h2 { font-size: 16px; margin-bottom: 16px; }
label { display: block; font-weight: 600; font-size: 14px; margin-bottom: 8px; }
.search-row { display: flex; gap: 8px; }
.search-row button { flex: 0 0 auto; white-space: nowrap; }
input, select { width: 100%; min-width: 0; height: 44px; padding: 10px 12px; border: 1px solid var(--border-strong); border-radius: 6px; font: inherit; font-size: 14px; color: var(--text-primary); background: white; }
input:focus-visible, select:focus-visible { outline: 3px solid var(--brand-700); outline-offset: 2px; }
button { cursor: pointer; font: inherit; font-size: 14px; color: var(--text-primary); background: white; border: 1px solid var(--border-default); border-radius: 6px; padding: 8px 12px; min-height: 44px; }
button:hover { background: var(--surface-subtle); border-color: var(--brand-700); }
button:disabled, button[aria-disabled=true] { cursor: default; opacity: .65; }
.primary { color: white; background: var(--brand-900); border-color: var(--brand-900); font-weight: 600; }
.primary:hover { color: white; background: var(--brand-700); }
.muted, .result-meta { color: var(--text-secondary); font-size: 13px; }
#search-help { margin-top: 8px; }
.suggestions { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 12px; font-size: 13px; }
.suggestions > span { flex-basis: 100%; color: var(--text-secondary); }
.suggestions button { padding: 6px 10px; background: transparent; border-color: transparent; text-decoration: underline; text-underline-offset: 3px; }
.results { margin-top: 16px; padding: 16px 0 0; overflow: hidden; }
.results h2, .results > div, .pagination { margin-left: 16px; margin-right: 16px; }
.results h2 { font-size: 16px; margin-bottom: 8px; }
.results > div { margin-bottom: 16px; }
.result-list { list-style: none; padding: 0 8px; margin: 0; max-height: 420px; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; scrollbar-color: var(--border-strong) transparent; }
.result-list li + li { border-top: 1px solid var(--border-default); }
.result-list button { display: flex; align-items: center; justify-content: space-between; gap: 8px; text-align: left; width: 100%; border: 0; border-radius: 6px; background: transparent; padding: 12px 8px; }
.result-list button > span:first-child { min-width: 0; }
.result-list button:hover { background: var(--surface-subtle); }
.result-list button[aria-pressed=true] { background: var(--brand-soft); }
.result-list strong { color: var(--text-primary); font-weight: 600; overflow-wrap: anywhere; }
.result-meta { display: block; margin-top: 4px; font-size: 12px; }
.select-label { font-size: 12px; white-space: nowrap; color: var(--brand-900); }
.pagination { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; gap: 8px; font-size: 13px; }
.preview { position: relative; }
.preview h2 { padding-right: 100px; margin-bottom: 12px; overflow-wrap: anywhere; }
.food-identity { display: flex; flex-wrap: wrap; gap: 12px 24px; margin: 0 0 20px; }
dt { font-size: 12px; color: var(--text-secondary); }
dd { font-size: 14px; overflow-wrap: anywhere; }
.change { position: absolute; top: 8px; right: 12px; border-color: transparent; color: var(--brand-900); font-size: 13px; }
.error { padding: 16px; background: var(--nutrition-limit-bg); border-radius: 6px; }
.error button { margin-top: 12px; }
.portion-controls h3 { margin-bottom: 12px; }
.portion-fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(150px, .65fr); gap: 16px; }
.quantity-row { display: flex; gap: 4px; }
.quantity-row input { text-align: center; font-variant-numeric: tabular-nums; }
.quantity-row button { flex: 0 0 44px; padding: 8px; }
#quantity-help { margin-top: 8px; font-size: 12px; }
.selected-basis { margin-top: 12px; font-size: 14px; }
.selected-basis strong { font-weight: 600; }
.validation-error { color: var(--error); font-size: 13px; }
.lens-controls { margin-top: 24px; }
fieldset { border: 0; min-width: 0; }
legend { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
.lens-options { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; }
.lens-options label { display: flex; align-items: center; gap: 6px; min-width: 0; min-height: 44px; padding: 8px 4px; border-bottom: 2px solid var(--border-default); margin: 0; cursor: pointer; font-size: 13px; }
.lens-options label:has(input:checked) { border-color: var(--brand-900); color: var(--brand-900); }
.lens-options input { width: 16px; height: 16px; flex: 0 0 16px; padding: 0; accent-color: var(--brand-900); }
.lens-options small { display: block; font-size: 12px; font-weight: 400; color: var(--text-secondary); }
.lens-options .unavailable { cursor: default; }
.lens-mode { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px; margin-top: 4px; font-size: 12px; }
.lens-mode p { color: var(--text-secondary); }
.lens-mode button { border-color: transparent; font-size: 12px; color: var(--brand-900); padding: 4px 0 4px 8px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.more-nutrients { margin-top: 12px; }
.more-nutrients summary { cursor: pointer; font-weight: 600; min-height: 44px; padding: 12px 0; font-size: 14px; }
.nutrient-summary { margin-top: 24px; }
.nutrient-summary h2 { font-size: 16px; margin-bottom: 8px; }
.summary-grid { margin-top: 12px; }
.summary-grid > div { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 16px; padding: 8px 0; border-bottom: 1px solid var(--border-default); }
.summary-grid dt { font-size: 14px; color: var(--text-primary); }
.summary-grid dd { text-align: right; font-variant-numeric: tabular-nums; }
.summary-grid dd.muted { grid-column: 1 / -1; font-size: 12px; }
.summary-grid strong { font-weight: 600; }
.lessons { margin-top: 24px; padding: 24px; background: #f5f8ef; border-radius: 8px; }
.lessons h2 { font-size: 20px; letter-spacing: -.02em; }
.lessons > p { margin-top: 8px; font-size: 14px; color: var(--text-secondary); max-width: 58ch; }
.lesson-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 24px; margin-top: 28px; }
.lesson-grid article { display: flex; gap: 16px; align-items: flex-start; min-width: 0; }
.lesson-art { flex: 0 0 72px; width: 72px; height: 72px; }
.lesson-grid h3 { margin: 4px 0 8px; font-size: 16px; font-weight: 700; color: var(--brand-900); }
.lesson-grid p { font-size: 13px; line-height: 1.6; }
.lessons > .method-note { max-width: none; margin-top: 24px; padding-top: 16px; border-top: 1px solid #dce5d1; font-size: 12px; }
.analytics-preferences { margin-top: 24px; padding: 16px; border-radius: 8px; background: var(--surface-subtle); }
.analytics-preferences h2 { font-size: 16px; margin-bottom: 12px; }
.analytics-preferences label { display: flex; align-items: center; gap: 12px; min-height: 44px; cursor: pointer; }
.analytics-preferences input { flex: 0 0 18px; width: 18px; height: 18px; padding: 0; accent-color: var(--brand-900); }
.analytics-preferences a { text-decoration: underline; }
.back-results { display: none; }
@media (max-width: 1100px) {
  .selection-grid { grid-template-columns: 280px minmax(0, 1fr); gap: 20px; }
  .portion-fields { grid-template-columns: 1fr; gap: 12px; }
  .lens-options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .visualizer { width: 100%; margin: 0; border: 0; border-radius: 0; padding: 20px; }
  .selection-grid { display: block; }
  .food-picker { position: static; }
  .food-workspace { margin-top: 20px; }
  .visualizer--detail .food-picker { display: none; }
  .visualizer--detail .food-workspace { margin-top: 0; }
  .visualizer:not(.visualizer--detail) .food-workspace { display: contents; }
  .visualizer:not(.visualizer--detail) .food-workspace > :not(.lessons) { display: none; }
  .visualizer--detail .back-results { display: inline-flex; align-items: center; margin-bottom: 12px; border-color: transparent; color: var(--brand-900); padding-left: 0; }
  .portion-fields { grid-template-columns: minmax(0, 1fr) minmax(150px, .65fr); }
  .lens-options { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .result-list { max-height: 55vh; }
  .lesson-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 520px) {
  .visualizer { padding: 16px; }
  h1 { font-size: 24px; }
  .intro { margin-bottom: 20px; }
  .panel, .search-panel { padding: 16px; }
  .results { padding: 16px 0 0; }
  .preview h2 { padding-right: 0; margin-top: 32px; }
  .change { right: 8px; top: 0; }
  .portion-fields { grid-template-columns: 1fr; gap: 12px; }
  .food-identity { gap: 12px; }
  .lens-options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lesson-grid { grid-template-columns: 1fr; gap: 16px; }
  .lessons { padding: 20px 16px; }
  .lesson-grid article { gap: 12px; }
  .lesson-art { flex-basis: 64px; width: 64px; height: 64px; }
  .result-list { max-height: 50vh; }
}
</style>
