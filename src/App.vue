<template>
  <div class="site-shell">
    <TopNav />

    <div class="site-main">
      <RouterView />
    </div>

    <footer class="site-footer">
      <nav aria-label="Footer navigation">
        <RouterLink to="/contact">Contact</RouterLink>
        <RouterLink to="/terms">Terms</RouterLink>
        <RouterLink to="/privacy">Privacy Policy</RouterLink>
        <a href="https://contribute.juanutrisyon.info" target="_blank" rel="noopener">Contribute</a>
      </nav>
      <p>
        Juan Nutrisyon is an independent Filipino food-literacy and nutrition-information project.
      </p>
    </footer>
  </div>
</template>

<script setup>
import TopNav from "@/components/TopNav.vue";
import { useWebMcp } from "@/composables/useWebMcp";

useWebMcp()
</script>

<style>
.site-shell {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  align-items: center;
  width: 100%;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--brand-soft) 55%, transparent), transparent 34rem),
    var(--surface-page);
}

.site-main {
  width: 100%;
  flex: 1;
}

.site-footer {
  width: 100%;
  margin-top: var(--space-8);
  padding: var(--space-8) var(--space-5) var(--space-10);
  border-top: 1px solid var(--border-subtle);
  background: var(--surface-subtle);
  text-align: center;
  color: var(--text-secondary);
}

.site-footer nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.site-footer a {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 700;
}

.site-footer a:hover {
  color: var(--brand-700);
}

.site-footer p {
  max-width: 680px;
  margin: 0 auto;
  color: var(--text-secondary);
  font-size: 0.9rem;
}
</style>
