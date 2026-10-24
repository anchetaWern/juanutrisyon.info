<script setup>
import { computed } from 'vue'
import LensResult from './LensResult.vue'
import { saturatedFatResult } from '../lenses.js'
const props = defineProps({ result: Object, portion: String, stale: Boolean })
const fat = computed(() => saturatedFatResult(props.result))
const explanation = computed(() => fat.value.status === 'inconsistent'
  ? 'The reported saturated fat exceeds total fat. A share cannot be shown from these inconsistent values.'
  : fat.value.status === 'zero-total'
    ? 'Both reported amounts are zero. A percentage cannot be calculated from zero total fat.'
    : fat.value.partial
      ? 'Some recipe fat data is incomplete. Known subtotals cannot establish the totals or their share.'
      : 'Complete, usable saturated-fat and total-fat values are needed to show a share.')
</script>
<template>
  <LensResult style="--lens-background: #fff8e9; --lens-border: #f2dfb5" label="Saturated fat" :portion="portion" :stale="stale">
    <template #visual>
      <div data-fat-result :data-status="fat.status">
        <p class="question" lang="fil">Gaano karaming saturated fat?</p>
        <p class="amount" data-fat-amount>{{ fat.saturatedText }}</p>
        <p class="caption">Saturated fat in the selected portion</p>
        <p class="total" data-fat-total>Total fat: <strong>{{ fat.totalText }}</strong></p>
        <template v-if="fat.status === 'valid'">
          <div class="fat-bar" data-fat-bar aria-hidden="true"><span :style="{ width: `${fat.percent}%` }"></span></div>
          <p class="share" data-fat-share>{{ fat.percentText }}% of total fat is saturated fat.</p>
          <dl class="legend">
            <div><dt><span class="swatch saturated" aria-hidden="true"></span>Saturated fat</dt><dd>{{ fat.saturatedText }}</dd></div>
            <div><dt><span class="swatch other" aria-hidden="true"></span>Other fat</dt><dd data-fat-other>{{ fat.otherText }}</dd></div>
          </dl>
          <p v-if="fat.saturated > 0 && fat.percent < 0.01" class="caption">The saturated-fat share is too small to distinguish in the bar at this scale.</p>
          <p v-else-if="fat.saturated < fat.total && fat.percent > 99.99" class="caption">The other-fat share is too small to distinguish in the bar at this scale.</p>
        </template>
        <p v-else class="state-note" data-fat-explanation>{{ explanation }} No part-to-whole graphic is shown.</p>
        <p class="qualification">Saturated fat is part of total fat. The graphic compares grams of fat, not butter or oil equivalents.</p>
      </div>
    </template>
    <template #takeaway>
      <p lang="fil" v-if="fat.status === 'valid'">Ang saturated fat ay bahagi ng total fat: {{ fat.saturatedText }} sa kabuuang {{ fat.totalText }} fat sa portion na ito.</p>
      <p lang="fil" v-else>Magkaiba ang saturated fat at total fat. Hindi sapat ang pares ng datos na ito para magpakita ng porsiyento.</p>
      <p lang="fil" class="context-copy">Hindi lahat ng fat ay saturated fat. Ang “other fat” ay ang natitirang total fat matapos ibawas ang saturated fat; hindi nito tinutukoy ang bawat ibang uri ng fat.</p>
      <p lang="fil" class="reminder">Tingnan ang parehong total fat at saturated fat, pati ang napiling portion. Hindi ito health score o daily-value percentage.</p>
    </template>
  </LensResult>
</template>
<style scoped>
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.question { font-weight: 700; }
.amount { font-size: clamp(2rem, 5vw, 3.6rem); font-weight: 800; color: #875414; line-height: 1.25; margin: var(--space-3) 0 var(--space-2); overflow-wrap: anywhere; }
.caption, .qualification { color: var(--text-secondary); font-size: .875rem; }
.total { margin-top: var(--space-5); }
.total strong, .share { font-weight: 800; }
.fat-bar { height: 32px; width: 100%; background: #cbd5e1; border: 1px solid #66758a; border-radius: 8px; overflow: hidden; margin: var(--space-5) 0 var(--space-3); }
.fat-bar span { height: 100%; display: block; background: #bf7c22; }
.share { font-size: 1.1rem; }
.legend { display: flex; flex-wrap: wrap; gap: var(--space-5); margin: var(--space-4) 0; }
.legend dt { display: flex; gap: 8px; align-items: center; }
.legend dd { margin-left: 22px; font-weight: 700; }
.swatch { width: 14px; height: 14px; display: inline-block; border: 1px solid #66758a; }
.saturated { background: #bf7c22; }
.other { background: #cbd5e1; }
.qualification, .state-note { margin-top: var(--space-5); }
.context-copy { background: var(--brand-soft); padding: var(--space-4); border-radius: var(--radius-md); margin: var(--space-5) 0; }
.reminder { color: var(--text-secondary); font-size: .9rem; }
</style>
