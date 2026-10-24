<script setup>
import { computed } from 'vue'
import LensResult from './LensResult.vue'
import { sodiumResult } from '../lenses.js'
const props = defineProps({ result: Object, portion: String, stale: Boolean })
const sodium = computed(() => sodiumResult(props.result))
</script>
<template>
  <LensResult style="--lens-background: #edf7ff; --lens-border: #cde5f8" label="Sodium" :portion="portion" :stale="stale">
    <template #visual>
      <div data-sodium-result :data-status="sodium.status">
        <p class="question" lang="fil">Gaano karaming sodium?</p>
        <p class="amount">{{ sodium.amountText }}</p>
        <p class="caption">Sodium in the selected portion</p>
        <template v-if="sodium.status !== 'unavailable'">
          <div v-if="sodium.status === 'positive'" class="salt-illustration">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 180 90" width="180" height="90">
              <ellipse cx="90" cy="77" rx="72" ry="7" fill="#cde5f8" />
              <g fill="#fff" stroke="#6595b6" stroke-width="1.5" stroke-linejoin="round">
                <path d="M31 63 49 50 67 60 49 74Z M49 50V65 M31 63 49 65 67 60 M49 65V74" />
                <path d="M65 44 87 30 108 43 86 59Z M87 30V48 M65 44 87 48 108 43 M87 48 86 59" />
                <path d="M108 62 127 47 147 59 128 74Z M127 47 128 65 M108 62 128 65 147 59 M128 65V74" />
                <path d="M65 68 83 55 103 68 84 81Z M83 55 84 72 M65 68 84 72 103 68 M84 72V81" />
              </g>
            </svg>
            <p class="caption">Salt illustration only — not to scale.</p>
          </div>
          <p v-else class="state-note">Reported sodium is zero for this portion.</p>
          <p class="equivalent">≈ {{ sodium.saltText }} salt-equivalent weight</p>
          <p class="caption">Approximate mass comparison: sodium (mg) × 2.5 ÷ 1000 = salt-equivalent grams.</p>
        </template>
        <p v-else class="state-note">{{ sodium.partial ? 'The recipe has incomplete sodium data. A known subtotal cannot establish the total.' : 'A complete, usable sodium value is needed for this comparison.' }} No salt-equivalent weight is shown.</p>
        <p class="qualification">Sodium is not the same as salt. This comparison does not tell us how much salt was added.</p>
      </div>
    </template>
    <template #takeaway>
      <p lang="fil" v-if="sodium.status === 'unavailable'">Hindi sapat ang datos para ipakita ang kabuuang sodium sa napiling portion.</p>
      <p lang="fil" v-else-if="sodium.status === 'zero'">Zero ang naiulat na sodium sa portion na ito. Hindi ito health score.</p>
      <p lang="fil" v-else>Tinatayang katumbas ito ng {{ sodium.saltText }} asin ayon sa timbang; hindi ito ang eksaktong asin na idinagdag.</p>
      <p lang="fil" class="context-copy">Ang sodium ay hindi kapareho ng asin. Ang ipinapakita ay approximate salt-equivalent weight, hindi sukat ng asin na inilagay sa pagkain.</p>
      <p class="reminder">Recipes and packaged products can have different sodium values. Use the selected food and portion when reading this comparison.</p>
    </template>
  </LensResult>
</template>
<style scoped>
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.question { font-weight: 700; }
.amount { font-size: clamp(2rem, 5vw, 3.6rem); font-weight: 800; color: #17577f; line-height: 1.25; margin: var(--space-3) 0 var(--space-2); overflow-wrap: anywhere; }
.caption, .qualification { color: var(--text-secondary); font-size: .875rem; }
.salt-illustration { margin: var(--space-5) 0; }
svg { max-width: 100%; display: block; }
.equivalent { font-weight: 800; font-size: 1.2rem; margin: var(--space-4) 0 var(--space-2); overflow-wrap: anywhere; }
.qualification { margin-top: var(--space-5); }
.state-note { margin-top: var(--space-5); }
.context-copy { background: var(--brand-soft); padding: var(--space-4); border-radius: var(--radius-md); margin: var(--space-5) 0; }
.reminder { color: var(--text-secondary); font-size: .9rem; }
</style>
