<script setup>
import { computed } from 'vue'
import { sourceDisclosure, foodHandoff } from '../disclosure.js'
import manifest from '../../../vendor/jn-nutrition-core/manifest.json'
const props = defineProps({ food: Object, selection: Object, conversionText: String, reference: Object })
defineEmits(['outbound'])
const source = computed(() => sourceDisclosure(props.food, props.selection))
const handoff = computed(() => foodHandoff(props.food))
</script>
<template>
 <section class="source-panel" aria-label="Sources and next steps">
  <nav v-if="handoff" class="handoff" aria-label="Continue in the Juan Nutrisyon app">
   <a :href="handoff.details" target="_blank" rel="noopener noreferrer" @click="$emit('outbound', 'food_details')" @auxclick.middle="$emit('outbound', 'food_details')">Open Food Details ↗</a>
   <a :href="handoff.compare" target="_blank" rel="noopener noreferrer" @click="$emit('outbound', 'comparison')" @auxclick.middle="$emit('outbound', 'comparison')">Compare in the app ↗</a>
  </nav>
  <p v-if="handoff" class="muted">Opens the app in a new tab with this food. Review the selected foods there; your portion and lens are not transferred. If comparison controls are hidden, select “Compare foods” in the app.</p>
  <details>
   <summary>Sources and calculation details</summary>
   <dl>
    <div v-for="row in source.rows" :key="row.label"><dt>{{ row.label }}</dt><dd>{{ row.value }}</dd></div>
    <div v-if="conversionText"><dt>Portion conversion</dt><dd>{{ conversionText }}</dd></div>
    <div><dt>Calculation core</dt><dd>{{ manifest.contract_version }} · {{ manifest.source.commit.slice(0,12) }}<span v-if="manifest.source.dirty"> + recorded source changes</span></dd></div>
   </dl>
   <p v-if="source.recipe">Recipe values are estimates calculated from available ingredient records and preparation/yield evidence. Missing contributions remain unknown.</p>
   <p v-if="source.structureUnavailable">The full recipe structure is unavailable; exact totals cannot be established from cached recipe values.</p>
   <ul v-if="source.links.length"><li v-for="link in source.links" :key="link.href"><a :href="link.href" target="_blank" rel="noopener noreferrer" @click="$emit('outbound', link.destination)" @auxclick.middle="$emit('outbound', link.destination)">{{ link.label }} ↗</a></li></ul>
   <p v-if="source.labelUnavailable">The published label image is not available as a usable public link.</p>
   <p v-if="reference">Rice reference: {{ reference.description }}, {{ reference.label }} ({{ reference.amount }} {{ reference.unit }}), {{ reference.carbs }} g carbohydrate, {{ reference.source }} / {{ reference.sourceId }}.</p>
   <p class="muted">Source links identify the record's provenance; they do not certify every value. Dates and editions are shown only when supplied. Household weights come from the stated JN serving data.</p>
  </details>
 </section>
</template>
<style scoped>
.source-panel { margin-top: var(--space-5); padding: var(--space-6); background: var(--surface-raised); border: 1px solid var(--border-default); border-radius: var(--radius-lg); }
.handoff { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-3); }
.handoff a { display: inline-block; padding: 10px 14px; min-height: 44px; border: 1px solid var(--border-default); border-radius: var(--radius-sm); background: var(--brand-soft); font-weight: 700; }
.muted { color: var(--text-secondary); font-size: .875rem; }
details { margin-top: var(--space-5); }
summary { cursor: pointer; font-weight: 700; min-height: 44px; padding: 8px 0; }
summary:focus-visible { outline: 3px solid var(--brand-700); outline-offset: 2px; }
dl { margin: var(--space-4) 0; display: grid; grid-template-columns: repeat(auto-fit,minmax(min(180px,100%),1fr)); gap: var(--space-4); }
dt { color: var(--text-secondary); font-size: .8rem; }
dd { overflow-wrap: anywhere; }
p + p, ul { margin-top: var(--space-3); }
ul { padding-left: 20px; }
@media(max-width:440px) { .source-panel { padding: var(--space-4); } }
</style>
