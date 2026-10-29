<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import LensResult from './LensResult.vue'
import TeaspoonIllustration from './TeaspoonIllustration.vue'
import { sugarResult, sugarCopy } from '../lenses.js'
const props = defineProps({ result: Object, comparison: Object, context: String, portion: String, stale: Boolean })
defineEmits(['retry'])
const sugar = computed(() => sugarResult(props.result, props.comparison))
const copy = computed(() => sugarCopy[props.context] ?? sugarCopy.neutral)
const unitWord = computed(() => sugar.value.count === 1 ? props.comparison?.singular : props.comparison?.plural)
const isTeaspoon = computed(() => props.comparison?.mode === 'teaspoons')
const clock = ref(0)
let timer
onMounted(() => { clock.value = Date.now(); timer = setInterval(() => { clock.value = Date.now() }, 1000) })
onUnmounted(() => clearInterval(timer))
const wait = computed(() => Math.max(0, Math.ceil(((props.comparison?.error?.retryAt ?? 0) - clock.value) / 1000)))
</script>
<template>
  <LensResult label="Total sugar" :portion="portion" :stale="stale">
    <template #visual>
      <div data-sugar-result :data-status="sugar.status">
        <p class="amount" data-sugar-amount>{{ sugar.amountText }}</p>
        <template v-if="sugar.countText !== null">
          <div v-if="sugar.fills.length && !isTeaspoon" class="cola-glasses" aria-hidden="true">
            <svg v-for="(fill, index) in sugar.fills" :key="index" class="cola-glass" :data-fill="fill" viewBox="0 0 52 78" focusable="false">
              <rect class="cola-fill" x="8" :y="70 - fill * 60" width="36" :height="fill * 60" />
              <path class="glass-outline" d="M6 6v62q0 6 6 6h28q6 0 6-6V6M6 6h40" />
              <path class="glass-highlight" d="M12 15v49" />
            </svg>
          </div>
          <TeaspoonIllustration v-if="sugar.fills.length && isTeaspoon" :fills="sugar.fills" data-sugar-teaspoons />
          <p v-if="sugar.status === 'zero'" class="state-note">Reported total sugar is zero for this portion.</p>
          <p v-else-if="sugar.status === 'tiny'" class="state-note">A small positive amount — too small to illustrate at this scale.</p>
          <p v-if="isTeaspoon" class="equivalent" data-teaspoon-equivalent>About <strong>{{ sugar.countText }} {{ unitWord }} of sugar</strong> by weight.</p>
          <p v-else class="equivalent" data-cola-equivalent>About the same total sugar as <strong>{{ sugar.countText }} {{ unitWord }} of cola.</strong></p>
          <p v-if="sugar.capped" class="caption">Showing 8 {{ comparison.plural }} only. The total equivalent is {{ sugar.countText }} {{ comparison.plural }}.</p>
          <p v-else-if="sugar.fills.some(fill => fill < 1)" class="caption">{{ isTeaspoon ? 'The partial spoon shows a fraction of one teaspoon equivalent.' : 'A partial fill represents a fraction of one reference glass.' }}</p>
        </template>
        <p v-else-if="sugar.status === 'unavailable'" class="state-note">{{ sugar.partial ? 'The recipe has incomplete sugar data. A known subtotal cannot establish the total.' : 'A complete, usable total-sugar value is needed for this comparison.' }} No {{ isTeaspoon ? 'teaspoon' : 'sugar' }} equivalent is shown.</p>
        <p v-else-if="sugar.status === 'unavailable-comparison'" class="state-note">The comparison is outside the supported numeric range. The known sugar amount is shown above.</p>
        <p v-else-if="sugar.status === 'unavailable-classification'" class="state-note">The food type is not available. The known sugar amount is shown above.</p>
        <p v-if="isTeaspoon && sugar.grams !== null" class="reference caption" data-teaspoon-reference>1 teaspoon equivalent = {{ comparison.gramsPerUnit }} g of sugar.</p>
        <div v-if="comparison?.mode === 'cola' && sugar.grams !== null" class="reference" data-cola-reference>
          <p v-if="comparison?.status === 'ready'" class="caption">Reference glass: {{ comparison.reference.amount }} {{ comparison.reference.unit }} of cola.</p>
          <template v-else-if="comparison?.status === 'error'">
            <p role="status">{{ comparison.error?.code === 'invalid_reference' ? 'The cola reference needs review. Comparison unavailable.' : comparison.error?.code === 'rate_limited' ? 'The cola reference is temporarily rate limited.' : 'The cola reference could not be loaded.' }}</p>
            <button v-if="comparison.error?.code !== 'invalid_reference'" type="button" :disabled="wait > 0" @click="$emit('retry')">{{ wait ? `Try cola reference again in ${wait}s` : 'Try cola reference again' }}</button>
          </template>
          <p v-else-if="comparison?.status === 'loading'" role="status">Loading cola reference…</p>
          <button v-else type="button" @click="$emit('retry')">Load cola reference</button>
        </div>
      </div>
    </template>
    <template #takeaway>
      <p lang="fil" class="context-copy" data-sugar-context :data-context="context">{{ copy }}</p>
      <p class="reminder">Total sugar is not the same as added sugar. This comparison does not estimate added sugar or describe a daily limit.</p>
    </template>
  </LensResult>
</template>
<style scoped>
.amount { font-size: 32px; font-weight: 600; color: var(--brand-900); line-height: 1.2; margin: 0 0 12px; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
[data-status="unavailable"] .amount { font-size: 16px; color: var(--text-secondary); font-weight: 500; }
.caption { color: var(--text-secondary); font-size: .875rem; }
.cola-glasses { display: grid; grid-template-columns: repeat(auto-fit, 52px); gap: 12px; margin: var(--space-5) 0; }
.cola-glass { display: block; width: 52px; height: 78px; }
.cola-fill { fill: #593524; }
.glass-outline { fill: none; stroke: var(--text-secondary); stroke-width: 2; stroke-linejoin: round; }
.glass-highlight { fill: none; stroke: var(--surface-raised); stroke-width: 2; opacity: .6; }
.equivalent { margin: var(--space-4) 0 var(--space-2); overflow-wrap: anywhere; }
.equivalent strong { font-weight: 700; }
.state-note, .reference { margin-top: var(--space-4); }
.context-copy { margin: 0 0 12px; }
.reminder { color: var(--text-secondary); font-size: .9rem; }
button { cursor: pointer; min-height: 44px; border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 10px 14px; font: inherit; color: var(--brand-900); background: var(--surface-raised); margin-top: var(--space-3); }
button:disabled { opacity: .55; cursor: default; }
</style>
