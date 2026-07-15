<template>
  <!-- Added a class 'container' to the parent div -->
  <div class="container">

    <TopNav />

    <div class="wrapper">
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
/* 1. The Parent Container */
.container {
  display: flex;
  flex-direction: column; /* Stack nav and wrapper vertically */
  align-items: center;    /* Center them horizontally */
  width: 100%;
}

/* 2. The Nav Section */
.nav {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;    /* Centers the logo and the nav links */
  gap: 10px;              /* Adds space between logo and links */
}

.nav a {
  color: var(--color-text);
}

/* 3. The Content Wrapper */
.wrapper {
  width: 100%;
  max-width: 1200px;      /* Optional: Prevents content from getting too wide */
}

.site-footer {
  width: 100%;
  margin-top: 40px;
  padding: 32px 20px 40px;
  border-top: 1px solid var(--color-divider);
  text-align: center;
  color: var(--color-text-muted);
}

.site-footer nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.site-footer p {
  max-width: 680px;
  margin: 0 auto;
  font-size: 0.95rem;
}
</style>
