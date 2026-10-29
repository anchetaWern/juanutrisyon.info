<script setup>
defineProps({ label: { type: String, required: true }, portion: String, stale: Boolean })
</script>
<template>
  <section class="lens-result" aria-labelledby="lens-result-heading">
    <header>
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
.lens-result { margin-top: 16px; padding: 20px; border: 1px solid var(--border-default); border-radius: 8px; background: var(--surface-raised); }
header { margin-bottom: 16px; }
header h2 { font-size: 18px; font-weight: 600; }
.result-columns { display: grid; gap: 20px; }
.visual, .takeaway { min-width: 0; }
.takeaway { border-top: 1px solid var(--border-default); padding-top: 16px; font-size: 14px; }
h3 { margin-bottom: 8px; font-size: 14px; font-weight: 600; }
.stale { color: var(--error); font-size: .9rem; }
@media (max-width: 440px) { .lens-result { padding: 16px; } }
</style>
