<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const menuOpen = ref(false)
const menuToggle = ref(null)
function closeMenu() {
  if (!menuOpen.value) return
  menuOpen.value = false
  menuToggle.value?.focus()
}
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>

<template>
  <header class="site-header" :class="{ 'site-header--visualizer': $route.name === 'food-visualizer' }" @keydown.esc="closeMenu">
    <div class="site-header__inner">
      <RouterLink to="/" class="brand-link" aria-label="Juan Nutrisyon home">
        <img src="/logo.png" alt="Juan Nutrisyon" class="logo" width="176" height="46" />
      </RouterLink>

      <button v-if="$route.name === 'food-visualizer'" ref="menuToggle" class="menu-toggle" type="button" :aria-expanded="menuOpen" aria-controls="main-navigation" @click="menuOpen = !menuOpen">{{ menuOpen ? 'Close menu' : 'Menu' }}</button>
      <nav id="main-navigation" class="header-nav" :class="{ 'header-nav--open': menuOpen }" aria-label="Main navigation">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/tools/food-visualizer">Food Visualizer</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/data-methodology">Data & Methodology</RouterLink>
        <RouterLink to="/collaborate">Collaborate</RouterLink>
        <RouterLink to="/research">Research</RouterLink>
        <RouterLink to="/blog">Blog</RouterLink>
        <RouterLink to="/media">Media</RouterLink>
        <a
          class="nav-cta"
          href="https://app.juanutrisyon.info"
          target="_blank"
          rel="noopener"
        >
          Find Foods
        </a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  width: 100%;
  border-bottom: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--surface-page) 94%, transparent);
  backdrop-filter: blur(14px);
  box-shadow: var(--shadow-sticky);
}

/* Keep the long, keyboard-driven tool clear of the shared navigation. */
.site-header.site-header--visualizer { position: static; }
.site-header--visualizer { background: transparent; backdrop-filter: none; box-shadow: none; border: 0; }
.site-header--visualizer .site-header__inner { min-height: 64px; }
.site-header--visualizer .header-nav .nav-cta { background: var(--brand-900); }
.menu-toggle { display: none; min-height: 44px; padding: 8px 12px; border: 1px solid var(--border-default); border-radius: var(--radius-sm); color: var(--text-primary); background: var(--surface-raised); font: inherit; cursor: pointer; }

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
  width: min(100% - 40px, var(--shell-max));
  margin: 0 auto;
  padding: var(--space-3) 0;
}

.brand-link {
  display: inline-flex;
  flex: 0 0 auto;
  padding: 0;
}

.logo {
  max-width: 176px;
  width: 100%;
  height: auto;
}

.header-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-1);
  text-align: right;
}

.header-nav a {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0.45rem 0.65rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.2;
}

.header-nav a:hover,
.header-nav a.router-link-active {
  background: var(--brand-soft);
  color: var(--brand-900);
}

.header-nav .nav-cta {
  min-height: 40px;
  margin-left: var(--space-2);
  padding: 0.6rem 0.95rem;
  border-radius: var(--radius-pill);
  background: var(--brand-600);
  color: #ffffff;
}

.header-nav .nav-cta:hover {
  background: var(--brand-700);
  color: #ffffff;
}

@media (max-width: 900px) {
  .site-header--visualizer .site-header__inner { flex-direction: row; align-items: center; flex-wrap: wrap; gap: 0; padding: 8px 0; }
  .site-header--visualizer .menu-toggle { display: inline-flex; align-items: center; }
  .site-header--visualizer .header-nav { display: none; flex-basis: 100%; padding-top: 12px; }
  .site-header--visualizer .header-nav--open { display: flex; }
  .site-header--visualizer .header-nav a { min-height: 44px; }
  .site-header__inner {
    align-items: flex-start;
    flex-direction: column;
    width: min(100% - 32px, var(--shell-max));
  }

  .header-nav {
    justify-content: flex-start;
    text-align: left;
  }
}

@media (max-width: 520px) {
  .logo {
    max-width: 150px;
  }

  .header-nav a {
    font-size: 0.84rem;
    padding: 0.42rem 0.5rem;
  }

  .header-nav .nav-cta {
    width: 100%;
    justify-content: center;
    margin-left: 0;
  }
}
</style>
