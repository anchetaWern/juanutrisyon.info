<script setup>
import { computed } from 'vue'
import LensResult from './LensResult.vue'
import { sugarResult, sugarCopy } from '../lenses.js'
const props = defineProps({ result: Object, context: String, portion: String, stale: Boolean })
const sugar = computed(() => sugarResult(props.result))
const copy = computed(() => sugarCopy[props.context] ?? sugarCopy.neutral)
</script>
<template>
  <LensResult style="--lens-background: #fff3f6; --lens-border: #f4dbe4" label="Total sugar" :portion="portion" :stale="stale">
    <template #visual>
      <div data-sugar-result :data-status="sugar.status">
        <p class="question" lang="fil">Gaano karaming asukal?</p>
        <p class="amount">{{ sugar.amountText }}</p>
        <p class="caption">Total sugar in the selected portion</p>
        <template v-if="sugar.status !== 'unavailable'">
          <div v-if="sugar.fills.length" class="packets" aria-hidden="true">
            <div v-for="(fill, index) in sugar.fills" :key="index" class="packet" :data-fill="fill">
              <span class="fill" :style="{ height: `${fill * 100}%` }"></span><span class="packet-label">5 g</span>
            </div>
          </div>
          <p v-if="sugar.status === 'zero'" class="state-note">Reported total sugar is zero for this portion.</p>
          <p v-else-if="sugar.status === 'tiny'" class="state-note">A small positive amount — too small to illustrate at this scale.</p>
          <p class="equivalent"><strong>{{ sugar.countText }}</strong> × 5 g packet equivalents by weight.</p>
          <p v-if="sugar.capped" class="caption">Showing 20 packets only. The total equivalent is {{ sugar.countText }} packets.</p>
          <p v-else-if="sugar.fills.some(fill => fill < 1)" class="caption">A partially filled packet represents a fraction of 5 g.</p>
        </template>
        <p v-else class="state-note">{{ sugar.partial ? 'The recipe has incomplete sugar data. A known subtotal cannot establish the total.' : 'A complete, usable total-sugar value is needed for this comparison.' }} No packet equivalent is shown.</p>
        <p class="qualification">A weight comparison — not a count of packets added to this food.</p>
      </div>
    </template>
    <template #takeaway>
      <p lang="fil" v-if="sugar.status === 'unavailable'">Hindi sapat ang datos para ipakita ang kabuuang sugar sa napiling portion.</p>
      <p lang="fil" v-else-if="sugar.status === 'zero'">Zero ang naiulat na total sugar sa portion na ito. Hindi ito health score.</p>
      <p lang="fil" v-else>Katumbas ito ng humigit-kumulang {{ sugar.countText }} pakete na tig-5 g ayon sa timbang.</p>
      <p lang="fil" class="context-copy" data-sugar-context :data-context="context">{{ copy }}</p>
      <p class="reminder">Total sugar is not the same as added sugar. This comparison does not estimate added sugar or describe a daily limit.</p>
    </template>
  </LensResult>
</template>
<style scoped>
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.question { font-weight: 700; }
.amount { font-size: clamp(2rem, 5vw, 3.6rem); font-weight: 800; color: #9d2850; line-height: 1.25; margin: var(--space-3) 0 var(--space-2); overflow-wrap: anywhere; }
.caption, .qualification { color: var(--text-secondary); font-size: .875rem; }
.packets { display: grid; grid-template-columns: repeat(auto-fit, 42px); gap: 10px; margin: var(--space-6) 0; }
.packet { position: relative; isolation: isolate; height: 65px; width: 42px; border: 1px solid #ab5471; border-radius: 5px; overflow: hidden; background: white; display: grid; place-items: center; }
.fill { position: absolute; inset: auto 0 0; z-index: -1; background: #edb2c6; }
.packet-label { color: #68203b; font-size: .8rem; font-weight: 700; }
.equivalent { margin: var(--space-4) 0 var(--space-2); }
.equivalent strong { font-weight: 800; }
.qualification { margin-top: var(--space-5); }
.state-note { margin-top: var(--space-5); }
.context-copy { background: var(--brand-soft); padding: var(--space-4); border-radius: var(--radius-md); margin: var(--space-5) 0; }
.reminder { color: var(--text-secondary); font-size: .9rem; }
</style>
