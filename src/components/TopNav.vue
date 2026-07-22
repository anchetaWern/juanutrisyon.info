<template>
  <header class="site-header">
    <div class="site-header__inner">
      <RouterLink to="/" class="brand-link" aria-label="Juan Nutrisyon home">
        <img src="/logo.png" alt="Juan Nutrisyon" class="logo" width="176" height="46" />
      </RouterLink>

      <nav class="header-nav" aria-label="Main navigation">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/data-methodology">Data & Methodology</RouterLink>
        <RouterLink to="/research-partners">Research & Partners</RouterLink>
        <RouterLink to="/guide">Guide</RouterLink>
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
