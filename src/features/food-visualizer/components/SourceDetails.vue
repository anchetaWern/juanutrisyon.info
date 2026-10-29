<script setup>
import { computed } from 'vue'
import { foodHandoff } from '../disclosure.js'
const props = defineProps({ food: Object })
defineEmits(['outbound'])
const handoff = computed(() => foodHandoff(props.food))
</script>
<template>
 <section class="source-panel" aria-label="Food details">
  <nav v-if="handoff" class="handoff" aria-label="Continue in the Juan Nutrisyon app">
   <a :href="handoff.details" target="_blank" rel="noopener noreferrer" @click="$emit('outbound', 'food_details')" @auxclick.middle="$emit('outbound', 'food_details')">Open Food Details ↗</a>
  </nav>
  <p v-if="handoff" class="muted">Opens Food Details in a new tab. Your portion and nutrient view are not transferred.</p>
 </section>
</template>
<style scoped>
.source-panel { margin-top: var(--space-5); padding: var(--space-6); background: var(--surface-raised); border: 1px solid var(--border-default); border-radius: var(--radius-lg); }
.handoff { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-3); }
.handoff a { display: inline-block; padding: 10px 14px; min-height: 44px; border: 1px solid var(--border-default); border-radius: var(--radius-sm); background: var(--brand-soft); font-weight: 700; }
.muted { color: var(--text-secondary); font-size: .875rem; }
@media(max-width:440px) { .source-panel { padding: var(--space-4); } }
</style>
