<template>
  <div class="site-shell" :class="{ 'site-shell--visualizer': $route.name === 'food-visualizer' }">
    <a v-if="$route.name === 'food-visualizer'" class="visualizer-skip" href="#food-visualizer" @click.prevent="requestVisualizerSearch">Skip to food search</a>
    <TopNav />

    <div class="site-main">
      <RouterView />
    </div>

    <DonationSupport />

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
import DonationSupport from "@/components/DonationSupport.vue";
import TopNav from "@/components/TopNav.vue";
import { useWebMcp } from "@/composables/useWebMcp";

useWebMcp()
function requestVisualizerSearch() { window.dispatchEvent(new Event('visualizer:search')) }
</script>

<style>
.site-shell--visualizer {
  --brand-600: #49780b;
  --brand-700: #426e17;
  --text-secondary: #526175;
  --border-strong: #718096;
  --color-link: var(--brand-700);
}
.visualizer-skip { position: fixed; top: 8px; left: 8px; z-index: 50; transform: translateY(-200%); padding: 12px 16px; border: 2px solid var(--brand-900); border-radius: var(--radius-sm); background: white; color: var(--brand-900); font-weight: 700; }
.visualizer-skip:focus { transform: none; }
.site-shell--visualizer :is(a, button, input, select, summary, [tabindex="-1"]):focus-visible { outline: 3px solid var(--brand-900); outline-offset: 3px; }
.site-shell--visualizer :is(.method-note, .donation-support) a { text-decoration: underline; text-underline-offset: .18em; }
@media (prefers-reduced-motion: reduce) {
  .site-shell--visualizer *, .site-shell--visualizer *::before, .site-shell--visualizer *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; }
}
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
.site-shell.site-shell--visualizer { background: #f5f8f2; }
.site-shell--visualizer .donation-support :is(button, .support-button, a) { box-shadow: none; }

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

body.donation-modal-is-open {
  overflow: hidden;
}
</style>
