<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import LensResult from './LensResult.vue'
import { carbohydrateResult } from '../lenses.js'
import { formatNutrient } from '../portions.js'
const props = defineProps({ result: Object, referenceState: Object, context: String, portion: String, stale: Boolean })
defineEmits(['retry'])
const carbs = computed(() => carbohydrateResult(props.result, props.referenceState))
const servingWord = computed(() => carbs.value.count === 1 ? 'serving' : 'servings')
const reference = computed(() => props.referenceState?.reference)
const clock = ref(0)
let timer
onMounted(() => { clock.value = Date.now(); timer = setInterval(() => { clock.value = Date.now() }, 1000) })
onUnmounted(() => clearInterval(timer))
const wait = computed(() => Math.max(0, Math.ceil(((props.referenceState?.error?.retryAt ?? 0) - clock.value) / 1000)))
</script>
<template>
  <LensResult style="--lens-background: #eff9ef; --lens-border: #d1e8d1" label="Carbohydrates" :portion="portion" :stale="stale">
    <template #visual>
      <div data-carb-result :data-status="carbs.status">
        <p class="question" lang="fil">Hindi lang sugar ang dapat tingnan</p>
        <p class="amount" data-carb-amount>{{ carbs.amountText }}</p>
        <p class="caption">Total carbohydrates in the selected portion</p>
        <template v-if="carbs.countText !== null">
          <div v-if="carbs.fills.length" class="rice-drawings" aria-hidden="true">
            <div v-for="(fill,index) in carbs.fills" :key="index" class="bowl" :data-fill="fill"><span :style="{ width: `${fill * 100}%` }"></span></div>
          </div>
          <p v-if="carbs.status === 'zero'" class="state-note">Reported total carbohydrates are zero for this portion.</p>
          <p v-else-if="carbs.status === 'tiny'" class="state-note">A small positive amount — too small to illustrate at this scale.</p>
          <p class="equivalent" data-rice-equivalent>≈ {{ carbs.countText }} reference rice {{ servingWord }} with a similar carbohydrate amount.</p>
          <p v-if="carbs.capped" class="caption">Showing 8 reference servings only. The total equivalent is {{ carbs.countText }} reference servings.</p>
          <p class="caption">Each drawing represents one reference serving. Partial fills represent fractions; the drawing does not define a household bowl size.</p>
        </template>
        <p v-else-if="carbs.status === 'unavailable-food'" class="state-note">{{ carbs.partial ? 'Recipe carbohydrate data is incomplete; a known subtotal cannot establish the total.' : 'A complete, usable carbohydrate value is needed for this comparison.' }} No rice equivalent is shown.</p>
        <p v-else-if="carbs.status === 'unavailable-comparison'" class="state-note">The comparison is outside the supported numeric range. The known food carbohydrate amount is shown above.</p>
        <p v-else class="state-note">The known food carbohydrate amount is shown above. The rice comparison is not available yet.</p>
        <div class="reference" data-rice-reference>
          <template v-if="reference">
            <h3>Reference rice</h3>
            <p>{{ reference.description }} · {{ reference.label }} ({{ reference.amount }} {{ reference.unit }})</p>
            <p>{{ formatNutrient(reference.carbs) }} g carbohydrates per reference serving, calculated from the loaded JN record.</p>
            <p class="caption">{{ reference.source }} · {{ reference.sourceId }} · JN food {{ reference.foodId }} / serving {{ reference.optionId }}</p>
            <p class="caption">Household weight comes from legacy JN serving data. Independent serving/source review remains incomplete.</p>
          </template>
          <template v-else-if="referenceState?.status === 'error'">
            <p role="status">{{ referenceState.error?.code === 'invalid_reference' ? 'The configured rice identity, serving basis or nutrient evidence needs review. Comparison unavailable.' : referenceState.error?.code === 'rate_limited' ? 'The rice reference is temporarily rate limited.' : 'The rice reference could not be loaded.' }}</p>
            <button v-if="referenceState.error?.code !== 'invalid_reference'" type="button" :disabled="wait > 0" @click="$emit('retry')">{{ wait ? `Try reference again in ${wait}s` : 'Try reference again' }}</button>
          </template>
          <p v-else role="status">Loading rice reference…</p>
        </div>
        <p class="qualification">Carbohydrate amount only — not an equivalence in health effects or blood-glucose response.</p>
      </div>
    </template>
    <template #takeaway>
      <p v-if="context === 'staple'" lang="fil" data-staple-copy>Kahit kaunti ang sugar, maaari pa ring marami ang total carbohydrate. Hindi natin kinukuwenta ang starch mula sa total carbohydrate.</p>
      <p v-else>Low sugar does not always mean low carbohydrates. Total carbohydrates include more than sugar alone.</p>
      <p class="context-copy" lang="fil">Magkasingdami lang ng carbohydrate ang ikinukumpara rito; hindi ibig sabihing pareho ang epekto ng mga pagkain sa katawan.</p>
      <p class="reminder">Fiber does not cancel sugar. This comparison does not measure starch or predict a blood-glucose response.</p>
    </template>
  </LensResult>
</template>
<style scoped>
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.question { font-weight: 700; }
.amount { font-size: clamp(2rem, 5vw, 3.6rem); font-weight: 800; color: #286333; line-height: 1.25; margin: var(--space-3) 0 var(--space-2); overflow-wrap: anywhere; }
.caption, .qualification { color: var(--text-secondary); font-size: .875rem; }
.rice-drawings { display: grid; grid-template-columns: repeat(auto-fit,60px); gap: 12px; margin: var(--space-5) 0; }
.bowl { position: relative; width: 60px; height: 38px; overflow: hidden; border: 1px solid #527761; border-radius: 6px 6px 28px 28px; background: white; }
.bowl span { display: block; height: 100%; background: repeating-linear-gradient(25deg, #a5d4b7 0 6px, #c9e5d3 6px 9px); }
.equivalent { font-weight: 800; font-size: 1.1rem; margin: var(--space-4) 0 var(--space-2); overflow-wrap: anywhere; }
.state-note, .qualification { margin-top: var(--space-5); }
.reference { margin-top: var(--space-5); padding-top: var(--space-4); border-top: 1px solid #bad4bf; }
.reference h3 { margin-bottom: var(--space-2); }
.reference p + p { margin-top: var(--space-2); }
button { cursor: pointer; min-height: 44px; border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 10px 14px; font: inherit; color: var(--brand-900); background: white; margin-top: var(--space-3); }
button:disabled { opacity: .55; cursor: default; }
.context-copy { background: var(--brand-soft); padding: var(--space-4); border-radius: var(--radius-md); margin: var(--space-5) 0; }
.reminder { color: var(--text-secondary); font-size: .9rem; }
</style>
