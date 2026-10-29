<script setup>
import { computed } from 'vue'
import LensResult from './LensResult.vue'
import { saturatedFatResult, saturatedFatDailyValueGrams, saturatedFatDailyValueSource } from '../lenses.js'
const props = defineProps({ result: Object, portion: String, stale: Boolean })
const fat = computed(() => saturatedFatResult(props.result))
const explanation = computed(() => fat.value.status === 'inconsistent'
  ? 'The reported saturated fat exceeds total fat. A Daily Value percentage cannot be shown from these inconsistent values.'
  : fat.value.status === 'unavailable-percentage'
    ? 'The reported amount is too large to display a usable Daily Value percentage.'
    : fat.value.partial
      ? 'Some recipe saturated-fat data is incomplete. A known subtotal cannot establish the Daily Value percentage.'
      : 'A complete, usable saturated-fat value is needed to show the Daily Value percentage.')
</script>
<template>
  <LensResult label="Saturated fat" :portion="portion" :stale="stale">
    <template #visual>
      <div data-fat-result :data-status="fat.status">
        <p class="amount" data-fat-amount>{{ fat.saturatedText }}</p>
        <template v-if="fat.status === 'valid'">
          <p class="daily-value" data-fat-dv>{{ fat.percentText }}% Daily Value · <span data-fat-band>{{ fat.bandLabel }}</span></p>
          <div class="fat-bar" data-fat-bar :data-band="fat.band" aria-hidden="true"><span :style="{ width: `${fat.barPercent}%` }"></span></div>
          <p v-if="fat.aboveDailyValue" class="caption" data-fat-above>Above the Daily Value reference. The bar stops at 100%.</p>
          <p v-else-if="fat.saturated > 0 && fat.percent < 0.01" class="caption">This amount is too small to distinguish in the bar at this scale.</p>
        </template>
        <p v-else class="state-note" data-fat-explanation>{{ explanation }}</p>
        <p class="reference"><a :href="saturatedFatDailyValueSource" target="_blank" rel="noopener noreferrer">FDA Daily Value: {{ saturatedFatDailyValueGrams }} g saturated fat</a></p>
        <p class="qualification">The percentage shows this portion’s contribution to the Daily Value, using the general 2,000-calorie labeling reference.</p>
      </div>
    </template>
    <template #takeaway>
      <p lang="fil" class="context-copy">Ang porsiyento ay batay sa saturated fat ng napiling portion. Kapag binago ang portion, magbabago rin ang % Daily Value.</p>
      <p lang="fil" class="reminder">Pangkalahatang sanggunian ang Daily Value, hindi personal na target na kailangang punuin o health score ng pagkain.</p>
    </template>
  </LensResult>
</template>
<style scoped>
.amount { font-size: 32px; font-weight: 600; color: var(--brand-900); line-height: 1.2; margin: 0 0 12px; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
[data-status^="unavailable"] .amount { font-size: 16px; color: var(--text-secondary); font-weight: 500; }
.caption, .qualification { color: var(--text-secondary); font-size: .875rem; }
.daily-value { font-size: 1.1rem; font-weight: 600; font-variant-numeric: tabular-nums; }
.fat-bar { height: 16px; width: 100%; background: #f1f5f9; border: 1px solid #66758a; border-radius: 8px; overflow: hidden; margin: var(--space-3) 0 var(--space-5); }
.fat-bar span { height: 100%; display: block; }
.fat-bar[data-band="low"] span { background: #426e17; }
.fat-bar[data-band="mid"] span { background: #b45309; }
.fat-bar[data-band="high"] span { background: #b91c1c; }
.reference { margin-top: var(--space-5); }
.reference a { color: var(--brand-700); text-underline-offset: 3px; }
.qualification, .state-note { margin-top: var(--space-5); }
.context-copy { margin: 0 0 12px; }
.reminder { color: var(--text-secondary); font-size: .9rem; }
</style>
