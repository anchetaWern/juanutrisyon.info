<script setup>
import { useId } from 'vue'
defineProps({ fills: { type: Array, default: () => [] } })
const spoonId = useId()
</script>
<template>
  <div class="teaspoon-illustration" aria-hidden="true">
    <svg v-for="(fill, index) in fills" :key="index" class="teaspoon" :data-fill="fill" viewBox="0 0 50 92" focusable="false">
      <defs><clipPath :id="`${spoonId}-${index}`"><ellipse cx="25" cy="23" rx="16" ry="21" /></clipPath></defs>
      <ellipse class="spoon-bowl" cx="25" cy="23" rx="16" ry="21" />
      <path class="spoon-handle" d="M25 45v39" />
      <rect class="spoon-fill" x="9" :y="44 - fill * 42" width="32" :height="fill * 42" :clip-path="`url(#${spoonId}-${index})`" />
    </svg>
  </div>
</template>
<style scoped>
.teaspoon-illustration { display: grid; grid-template-columns: repeat(auto-fit, 50px); gap: 12px; margin: var(--space-5) 0; }
.teaspoon { display: block; width: 50px; height: 92px; }
.spoon-bowl { fill: var(--surface-raised); stroke: var(--text-secondary); stroke-width: 2; }
.spoon-handle { fill: none; stroke: var(--text-secondary); stroke-width: 5; stroke-linecap: round; }
.spoon-fill { fill: var(--brand-700); }
</style>
