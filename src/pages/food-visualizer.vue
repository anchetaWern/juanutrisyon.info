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
import SaturatedFatLens from '@/features/food-visualizer/components/SaturatedFatLens.vue'
import SodiumLens from '@/features/food-visualizer/components/SodiumLens.vue'
import SugarLens from '@/features/food-visualizer/components/SugarLens.vue'
import { createLensState, lenses } from '@/features/food-visualizer/lenses'
import { createFoodSelection } from '@/features/food-visualizer/selection'
import { createPortionState, nutrientSummary, formatNutrient } from '@/features/food-visualizer/portions'

usePageSeo({ title: "Food Visualizer — Ano’ng Nasa Pagkain Ko?",
  description: 'Explore Filipino foods and learn about total sugar, sodium, saturated fat and carbohydrates. Search the Juan Nutrisyon food catalog without an account.',
  path: '/tools/food-visualizer' })
const foodApi = createFoodApi()
const analytics = useVisualizerAnalytics()
const selection = createFoodSelection(foodApi)
const rice = createRiceReference(foodApi)
const { state } = selection
const portions = createPortionState()
const portion = portions.state
const lensModel = createLensState()
const lens = lensModel.state
watch(() => [state.selectedFood, lens.active], ([food, active]) => {
  if (food && active === 'carbohydrates') rice.ensure(food)
}, { flush: 'post' })
const activeLensLabel = computed(() => lenses.find(view => view.id === lens.active)?.label ?? '')
watch(() => state.selectedFood, food => lensModel.setFood(food), { immediate: true, flush: 'sync' })
watch(() => state.selectedFood, food => portions.setFood(food), { immediate: true, flush: 'sync' })
const additionalNutrients = computed(() => moreNutrients(portion.result))
const summary = computed(() => nutrientSummary(portion.result))
const selectedBasis = computed(() => portion.selection
  ? `${new Intl.NumberFormat('en', { maximumSignificantDigits: 12 }).format(portion.selection.amount)} ${portion.selection.unit}` : '')
const announcement = computed(() => state.selectedFood
  ? `${state.selectedFood.description}. ${portion.error ? 'Last valid portion' : 'Selected portion'}: ${selectedBasis.value || 'unavailable'}. ${resultAnnouncement(lens.active, portion.result, rice.state)}` : '')
const conversionText = computed(() => {
  const evidence = portion.selection?.conversionEvidence
  if (!evidence) return ''
  const labels = { source: 'Recorded source serving', direct: 'Entered numeric amount',
    canonical: 'Food serving profile', legacy: 'Food-specific household measure', subtype: 'Food subtype household measure' }
  const parts = [labels[evidence.origin]]
  if (evidence.measure === 'supplied_gram_weight') parts.push('supplied gram weight')
  if (evidence.measure === 'supplied_volume') parts.push('supplied volume')
  for (const conversion of evidence.conversions) {
    parts.push(conversion.method === 'density' ? `density ${conversion.density} g/mL`
      : `${conversion.percent}% edible portion: ${conversion.method === 'ap_to_ep' ? 'as-purchased to edible weight' : 'edible to as-purchased weight'}`)
  }
  return parts.join(' · ')
})
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
let timer, focusRequest = 0, selectedAction = 0
onMounted(() => { clock.value = Date.now(); timer = setInterval(() => { clock.value = Date.now() }, 1000) })
onUnmounted(() => { selection.dispose(); rice.dispose(); clearInterval(timer) })
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
  if (error?.code === 'rate_limited') return 'Too many requests. Please wait before trying again.'
  if (error?.code === 'not_found') return 'This food is no longer available. Please choose another food.'
  if (error?.code === 'invalid_response') return 'The food data could not be read. Please try again or choose another food.'
  return 'We could not load the food catalog. Check your connection and try again.'
}
function waitSeconds(error) { return Math.max(0, Math.ceil(((error?.retryAt ?? 0) - clock.value) / 1000)) }
async function choose(food, selectionOrigin = 'search') {
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
  const request = ++focusRequest, origin = document.activeElement, inputValue = state.query
  await selection.search(page, query)
  await nextTick()
  if (request === focusRequest && state.query === inputValue && state.searchStatus !== 'loading' &&
    (document.activeElement === origin || document.activeElement === document.body)) results.value?.focus()
}
async function changeFood() { ++focusRequest; ++selectedAction; selection.changeFood(); await nextTick(); input.value?.focus() }
function suggestion(query) { state.query = query; runSearch() }
</script>

<template>
  <main class="page-container visualizer">
    <p class="sr-only" role="status" aria-live="polite" aria-atomic="true" data-result-announcement>{{ announcement }}</p>
    <header class="intro">
      <p class="eyebrow">FOOD EXPLORER</p>
      <h1 lang="fil">Ano’ng Nasa Pagkain Ko?</h1>
      <p class="lead">Get to know your food, one nutrient at a time.</p>
      <p>Search Filipino foods and drinks. Learn how sugar, sodium, saturated fat and carbohydrates tell different parts of the story.</p>
      <span class="access-note">Free · No sign-in required</span>
    </header>

    <section class="search-panel" aria-labelledby="search-heading">
      <h2 id="search-heading">Choose a food or drink</h2>
      <form role="search" @submit.prevent="runSearch()">
        <label for="food-search">Food name</label>
        <div class="search-row">
          <input id="food-search" ref="input" v-model="state.query" type="search" maxlength="200"
            placeholder="e.g. rice, pandesal, mango" autocomplete="off" aria-describedby="search-help" />
          <button class="primary" type="submit" :disabled="!state.query.trim()">Search</button>
        </div>
        <p id="search-help" class="muted">Press Search or Enter to see matches. Check the exact food, brand and preparation.</p>
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

    <div class="selection-grid">
      <section ref="results" tabindex="-1" class="panel results" aria-labelledby="results-heading">
        <h2 id="results-heading">Matching foods</h2>
        <div role="status" aria-live="polite" aria-atomic="true">
          <p v-if="state.searchStatus === 'idle'" class="muted">Enter a food name to explore the catalog.</p>
          <p v-else-if="state.searchStatus === 'loading'">Searching for “{{ state.committedQuery }}”…</p>
          <p v-else-if="state.searchStatus === 'empty'">No matches for “{{ state.committedQuery }}”. Try a different spelling or a broader food name.</p>
          <p v-else-if="state.searchStatus === 'ready'" class="muted">{{ state.total }} matches for “{{ state.committedQuery }}” · Page {{ state.page }} of {{ state.lastPage }}</p>
        </div>
        <div v-if="state.searchStatus === 'error'" class="error">
          <p role="alert">{{ errorText(state.searchError) }}</p>
          <button type="button" :disabled="waitSeconds(state.searchError) > 0" @click="runSearch(state.page, state.committedQuery)">{{ waitSeconds(state.searchError) ? `Try again in ${waitSeconds(state.searchError)}s` : 'Try search again' }}</button>
        </div>
        <ol v-if="state.results.length" class="result-list">
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

      <section ref="preview" tabindex="-1" class="panel preview" aria-labelledby="preview-heading">
        <p class="eyebrow">SELECTED FOOD</p>
        <h2 id="preview-heading">{{ state.selectedFood?.description ?? 'Your food preview' }}</h2>
        <div role="status" aria-live="polite">
          <p v-if="state.detailStatus === 'idle'" class="muted">Choose a matching food to see its identity, source and recorded serving basis here.</p>
          <p v-else-if="state.detailStatus === 'loading'">Loading {{ state.pendingFood?.description }}…</p>
        </div>
        <div v-if="state.detailStatus === 'error'" class="error">
          <p role="alert">{{ errorText(state.detailError) }}</p>
          <button v-if="state.detailError?.code !== 'not_found'" type="button" :disabled="waitSeconds(state.detailError) > 0" @click="choose(state.pendingFood)">{{ waitSeconds(state.detailError) ? `Try again in ${waitSeconds(state.detailError)}s` : 'Try loading again' }}</button>
        </div>
        <template v-if="state.selectedFood">
          <dl>
            <div v-if="state.selectedFood.brand"><dt>Brand</dt><dd>{{ state.selectedFood.brand }}</dd></div>
            <div><dt>Source</dt><dd>{{ sourceName(state.selectedFood.data_source) }}</dd></div>
            <div><dt>Recorded nutrient basis</dt><dd>{{ basis }}</dd></div>
          </dl>
          <div v-if="portion.options.length" class="portion-controls">
            <h3>Choose your portion</h3>
            <label for="serving-option">Serving</label>
            <select id="serving-option" :value="portion.optionKey" @change="changeOption">
              <option v-for="option in portion.options" :key="option.key" :value="option.key">{{ option.label }}</option>
            </select>
            <label for="portion-quantity">Quantity</label>
            <div class="quantity-row">
              <button type="button" aria-label="Decrease quantity by 0.5" :disabled="(portion.selection?.quantity ?? 0) <= 0.5" @click="stepPortion(-1)">−</button>
              <input id="portion-quantity" :value="portion.quantity" type="text" inputmode="decimal" :aria-invalid="!!portion.error"
                aria-describedby="quantity-help quantity-error" @input="portions.setQuantity($event.target.value)" @change="commitPortion" @keydown.enter.prevent="commitPortion" />
              <button type="button" aria-label="Increase quantity by 0.5" @click="stepPortion(1)">+</button>
            </div>
            <p id="quantity-help" class="muted">Use decimals for fractions, such as 0.5 or 1.25. Buttons change quantity by 0.5.</p>
            <p id="quantity-error" class="validation-error" role="status">{{ portion.error }}</p>
          </div>
          <p v-else class="muted">No supported serving basis is available for this record.</p>
          <div v-if="portion.selection" class="selected-basis">
            <p><strong>{{ portion.error ? 'Last valid portion' : 'Selected portion' }}: {{ selectedBasis }}</strong><span v-if="state.selectedFood.edible_basis === 'edible'"> (edible weight)</span><span v-else-if="state.selectedFood.edible_basis === 'as_purchased'"> (as-purchased weight)</span></p>
            <p class="muted">{{ conversionText }}</p>
          </div>
        </template>
        <button v-if="state.detailStatus !== 'idle'" type="button" class="change" @click="changeFood">Change food</button>
      </section>
    </div>

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
      <SugarLens v-if="lens.active === 'sugar'" :result="portion.result" :context="lens.context" :portion="selectedBasis" :stale="!!portion.error" />
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
    <SourceDetails v-if="state.selectedFood" :food="state.selectedFood" :selection="portion.selection" :conversion-text="conversionText" :reference="rice.state.reference" @outbound="analytics.tracker.outbound(state.selectedFood, lens.active, $event)" />

    <section class="lessons" aria-labelledby="lessons-heading">
      <h2 id="lessons-heading">Four ways to understand food</h2>
      <p>Rice, fruit, condiments and coconut cream can tell very different nutrient stories. Food identity and portion size matter.</p>
      <div class="lesson-grid">
        <article><h3>Total sugar</h3><p>Total sugar is not necessarily added sugar. Fruit naturally contains sugar, too.</p></article>
        <article><h3>Sodium</h3><p>Sodium and salt are different. A salt-equivalent comparison describes weight, not how much salt was added.</p></article>
        <article><h3>Saturated fat</h3><p>Saturated fat is one part of total fat. Both values are needed to understand the proportion.</p></article>
        <article><h3>Carbohydrates</h3><p>Low sugar does not always mean low carbohydrates. Starch contributes carbohydrates as well.</p></article>
      </div>
      <p class="method-note">Food data can be incomplete. Missing values do not mean zero. <RouterLink to="/data-methodology">Read about our data and methods.</RouterLink></p>
    </section>
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
.visualizer { max-width: var(--shell-max); }
.intro { max-width: 760px; margin-bottom: var(--space-8); }
h1 { margin: var(--space-3) 0; }
.intro p + p { margin-top: var(--space-3); }
.lead { font-size: 1.25rem; }
.access-note { display: inline-block; margin-top: var(--space-4); color: var(--brand-900); background: var(--brand-soft); border-radius: var(--radius-pill); padding: 5px 12px; font-size: .875rem; }
.search-panel, .panel { padding: var(--space-6); border: 1px solid var(--border-default); background: var(--surface-raised); border-radius: var(--radius-lg); }
.search-panel h2 { margin-bottom: var(--space-4); }
label { display: block; font-weight: 700; margin-bottom: var(--space-2); }
.search-row { display: flex; gap: var(--space-3); }
.search-row button { flex: 0 0 auto; white-space: nowrap; }
input { width: 100%; min-width: 0; padding: 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); font: inherit; color: var(--text-primary); background: white; }
input:focus-visible { outline: 3px solid var(--brand-700); outline-offset: 2px; }
button { cursor: pointer; font: inherit; color: var(--brand-900); background: var(--brand-soft); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); padding: 10px 16px; min-height: 44px; }
button:hover { border-color: var(--brand-700); }
button:disabled, button[aria-disabled=true] { cursor: default; opacity: .55; }
.primary { color: white; background: var(--brand-900); font-weight: 700; }
.muted, .result-meta { color: var(--text-secondary); font-size: .9rem; }
#search-help { margin-top: var(--space-2); }
.suggestions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); margin-top: var(--space-4); font-size: .875rem; }
.suggestions button { padding: 5px 14px; border-radius: var(--radius-pill); }
.selection-grid { display: grid; grid-template-columns: minmax(0,1.15fr) minmax(0,1fr); gap: var(--space-5); margin-top: var(--space-5); align-items: start; }
.selection-grid > *, .result-list button > span:first-child { min-width: 0; }
.visualizer { overflow-wrap: anywhere; }
.panel h2 { margin-bottom: var(--space-3); overflow-wrap: anywhere; }
.preview .eyebrow { margin-bottom: var(--space-3); }
.result-list { list-style: none; padding: 0; margin-top: var(--space-4); }
.result-list li + li { border-top: 1px solid var(--border-default); }
.result-list button { display: flex; align-items: center; justify-content: space-between; gap: 12px; text-align: left; width: 100%; border: 0; border-radius: var(--radius-xs); background: transparent; padding: 16px 8px; }
.result-list button:hover, .result-list button[aria-pressed=true] { background: var(--brand-soft); }
.result-list strong { color: var(--text-primary); font-weight: 700; overflow-wrap: anywhere; }
.result-meta { display: block; }
.select-label { font-size: .8rem; white-space: nowrap; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-5); gap: 8px; }
dl { margin: var(--space-5) 0; }
dl div + div { margin-top: var(--space-3); }
dt { font-size: .8rem; color: var(--text-secondary); }
dd { overflow-wrap: anywhere; }
.change { margin-top: var(--space-5); }
.error { padding: var(--space-4); background: var(--nutrition-limit-bg); border-radius: var(--radius-sm); }
.error button { margin-top: var(--space-3); }
select { width: 100%; min-width: 0; padding: 12px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: white; color: var(--text-primary); font: inherit; }
select:focus-visible { outline: 3px solid var(--brand-700); outline-offset: 2px; }
.portion-controls { margin-top: var(--space-5); }
.portion-controls label { margin-top: var(--space-4); }
.quantity-row { display: flex; gap: 8px; }
.quantity-row input { text-align: center; }
.quantity-row button { flex: 0 0 44px; padding: 8px; }
.selected-basis { margin-top: var(--space-4); padding: var(--space-4); border-radius: var(--radius-sm); background: var(--surface-subtle); overflow-wrap: anywhere; }
.selected-basis strong { font-weight: 700; }
.validation-error { color: var(--error); font-size: .9rem; }
.lens-controls { margin-top: var(--space-6); }
fieldset { border: 0; min-width: 0; }
legend { font-weight: 700; margin-bottom: var(--space-3); }
.lens-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(160px,100%), 1fr)); gap: 8px; }
.lens-options label { display: flex; align-items: center; gap: 8px; min-width: 0; padding: 12px; border: 1px solid var(--border-default); border-radius: var(--radius-sm); margin: 0; background: var(--surface-raised); cursor: pointer; }
.lens-options label:has(input:checked) { background: var(--brand-soft); border-color: var(--brand-700); }
.lens-options input { width: 16px; height: 16px; flex: 0 0 16px; padding: 0; accent-color: var(--brand-900); }
.lens-options small { display: block; font-size: .75rem; font-weight: 400; color: var(--text-secondary); }
.lens-options .unavailable { cursor: default; background: var(--surface-subtle); }
.lens-mode { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: var(--space-3); font-size: .875rem; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.more-nutrients { margin-top: var(--space-5); }
.more-nutrients summary { cursor: pointer; font-weight: 700; min-height: 44px; padding: 8px 0; }
.nutrient-summary { margin-top: var(--space-5); }
.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(170px,100%), 1fr)); gap: var(--space-4); }
.summary-grid > div { padding: var(--space-4); background: var(--surface-subtle); border-radius: var(--radius-sm); }
.summary-grid strong { font-weight: 700; }
.lessons { margin-top: var(--space-10); }
.analytics-preferences { margin-top: var(--space-6); padding: var(--space-4); border: 1px solid var(--border-default); border-radius: var(--radius-md); background: var(--surface-subtle); }
.analytics-preferences h2 { margin-bottom: var(--space-3); }
.analytics-preferences label { display: flex; align-items: center; gap: 12px; min-height: 44px; cursor: pointer; }
.analytics-preferences input { flex: 0 0 18px; width: 18px; height: 18px; padding: 0; accent-color: var(--brand-900); }
.analytics-preferences a { text-decoration: underline; }
.lessons > p { margin-top: var(--space-3); }
.lesson-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); margin-top: var(--space-5); }
.lesson-grid article { background: var(--surface-subtle); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-5); }
.lesson-grid h3 { margin-bottom: var(--space-2); }
.lesson-grid p, .method-note { font-size: .9rem; }
@media (max-width: 800px) { .selection-grid { grid-template-columns: 1fr; } .lesson-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 440px) { .panel, .search-panel { padding: var(--space-4); } .lesson-grid { grid-template-columns: 1fr; } .search-row { gap: 8px; } .search-row button { padding: 10px 12px; } }
</style>
