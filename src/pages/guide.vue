<template>
  <div class="guide-container">
    <header class="guide-header">
      <h1>Juan Nutrisyon User Guide</h1>
      <p>Master the art of tracking your nutrition with our easy-to-follow instructions.</p>
    </header>

    <hr class="separator" />

    <SearchAndViewFood />

    <hr class="separator" />

    <CreateRecipe />

    <hr class="separator" />

    <FoodDiary />
  </div>
</template>

<script setup>
import SearchAndViewFood from './guides/SearchAndViewFood.vue';
import CreateRecipe from './guides/CreateRecipe.vue';
import FoodDiary from './guides/FoodDiary.vue';
import { usePageSeo } from '@/composables/usePageSeo'

usePageSeo({
  title: 'User Guide',
  description:
    'Follow the Juan Nutrisyon user guide to search foods, create recipes, and track your daily nutrition with confidence.',
  path: '/guide'
})
</script>

<style scoped>
.guide-container {
  max-width: var(--content-max);
}

.guide-header h1 {
  margin-bottom: var(--space-2);
}

.separator {
  border: 0;
  height: 1px;
  background: var(--border-subtle);
  margin: var(--space-8) 0;
}
</style>
