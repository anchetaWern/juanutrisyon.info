<script setup>
defineProps({ label: { type: String, required: true }, portion: String, stale: Boolean })
</script>
<template>
  <section class="lens-result" aria-labelledby="lens-result-heading">
    <header>
      <p class="eyebrow">{{ label }} · selected portion</p>
      <h2 id="lens-result-heading">{{ label }} in {{ portion || 'this portion' }}</h2>
      <p v-if="stale" class="stale">Showing the last valid portion while you edit the quantity.</p>
    </header>
    <div class="result-columns">
      <div class="visual"><slot name="visual" /></div>
      <div class="takeaway">
        <h3 id="takeaway-heading" lang="fil">Ano ang ibig sabihin nito?</h3>
        <slot name="takeaway" />
      </div>
    </div>
  </section>
</template>
<style scoped>
.lens-result { margin-top: var(--space-5); }
header { margin-bottom: var(--space-4); }
header h2 { margin-top: var(--space-2); }
.result-columns { display: grid; grid-template-columns: 1.4fr 1fr; gap: var(--space-5); }
.visual, .takeaway { padding: var(--space-6); border: 1px solid var(--border-default); border-radius: var(--radius-lg); min-width: 0; }
.visual { background: var(--lens-background, var(--surface-subtle)); border-color: var(--lens-border, var(--border-default)); }
.takeaway { background: var(--surface-raised); }
h3 { margin-bottom: var(--space-4); }
.stale { color: var(--error); font-size: .9rem; }
@media (max-width: 800px) { .result-columns { grid-template-columns: 1fr; } }
@media (max-width: 440px) { .visual, .takeaway { padding: var(--space-4); } }
</style>
