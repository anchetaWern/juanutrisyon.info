<script setup>
import { computed } from 'vue'
import LensResult from './LensResult.vue'
import TeaspoonIllustration from './TeaspoonIllustration.vue'
import { sodiumResult, saltTeaspoonGrams } from '../lenses.js'
const props = defineProps({ result: Object, portion: String, stale: Boolean })
const sodium = computed(() => sodiumResult(props.result))
</script>
<template>
  <LensResult label="Sodium" :portion="portion" :stale="stale">
    <template #visual>
      <div data-sodium-result :data-status="sodium.status">
        <p class="amount" data-sodium-amount>{{ sodium.amountText }}</p>
        <template v-if="sodium.status !== 'unavailable'">
          <TeaspoonIllustration v-if="sodium.fills.length" :fills="sodium.fills" data-salt-teaspoons />
          <p v-if="sodium.status === 'zero'" class="state-note">Reported sodium is zero for this portion.</p>
          <p v-else-if="sodium.tiny" class="state-note">A small positive amount — too small to illustrate at this scale.</p>
          <p class="equivalent" data-salt-teaspoon-equivalent>About {{ sodium.teaspoonText }} {{ sodium.teaspoons === 1 ? 'teaspoon equivalent' : 'teaspoon equivalents' }} of salt.</p>
          <p v-if="sodium.capped" class="caption">Showing 8 teaspoons only. The total equivalent is {{ sodium.teaspoonText }} teaspoons.</p>
          <p v-else-if="sodium.fills.some(fill => fill < 1)" class="caption">The partial spoon shows a fraction of one teaspoon equivalent.</p>
          <p class="caption" data-salt-equivalent>≈ {{ sodium.saltText }} salt-equivalent weight</p>
          <p class="caption reference">1 teaspoon equivalent = {{ saltTeaspoonGrams }} g salt.</p>
          <details class="calculation"><summary>How this is calculated</summary><p class="caption">Approximate mass comparison: sodium (mg) × 2.5 ÷ 1000 = salt-equivalent grams. Divide by {{ saltTeaspoonGrams }} to get teaspoon equivalents.</p></details>
        </template>
        <p v-else class="state-note">{{ sodium.partial ? 'The recipe has incomplete sodium data. A known subtotal cannot establish the total.' : 'A complete, usable sodium value is needed for this comparison.' }} No salt-equivalent weight is shown.</p>
        <p class="qualification">Sodium is not the same as salt. This comparison does not tell us how much salt was added.</p>
      </div>
    </template>
    <template #takeaway>
      <p lang="fil" class="context-copy">Ang sodium ay hindi kapareho ng asin. Ang ipinapakita ay approximate salt-equivalent weight, hindi sukat ng asin na inilagay sa pagkain.</p>
      <p class="reminder">Recipes and packaged products can have different sodium values. Use the selected food and portion when reading this comparison.</p>
    </template>
  </LensResult>
</template>
<style scoped>
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.amount { font-size: 32px; font-weight: 600; color: var(--brand-900); line-height: 1.2; margin: 0 0 12px; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
[data-status^="unavailable"] .amount { font-size: 16px; color: var(--text-secondary); font-weight: 500; }
.caption, .qualification { color: var(--text-secondary); font-size: .875rem; }
.equivalent { font-weight: 600; font-size: 1rem; margin: var(--space-4) 0 var(--space-2); overflow-wrap: anywhere; }
.qualification { margin-top: var(--space-5); }
.state-note { margin-top: var(--space-5); }
.reference { margin-top: var(--space-3); }
.context-copy { margin: 0 0 12px; }
.reminder { color: var(--text-secondary); font-size: .9rem; }
.calculation { margin-top: 8px; }
.calculation summary { min-height: 44px; padding: 10px 0; cursor: pointer; font-size: 13px; color: var(--brand-900); }
</style>
