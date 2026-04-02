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
</script>

<style scoped>
.guide-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--color-text);
  line-height: 1.6;
}

.guide-header {
  text-align: center;
  margin-bottom: 2rem;
}

.guide-header h1 {
  margin-bottom: 0.5rem;
}

.separator {
  border: 0;
  height: 1px;
  background: var(--color-divider);
  margin: 2rem 0;
}

.guide-header h1 {
  color: var(--color-heading);
}
</style>
