<template>
  <main class="home-page">
    <Banner />

    <section class="home-section">
      <IntroLinks />
    </section>

    <div class="sub-text">
      <h2>Why Food Literacy Matters</h2>
      <p>
      In the Philippines, nutrition information is often difficult to access or understand, especially for home-cooked meals, carinderia dishes, and local ingredients.
      Juan Nutrisyon helps close that gap by turning food-composition data into tools people can actually use.
      </p>

      <div class="credibility-links">
        <RouterLink to="/data-methodology">Review data and methodology</RouterLink>
        <RouterLink to="/research-partners">Explore research and partner work</RouterLink>
        <RouterLink to="/media">View media appearances</RouterLink>
      </div>
    </div>

    <section class="featured-media">
      <h2>Media Discussions</h2>
      <p>
        Juan Nutrisyon has been featured in media discussions about accessible nutrition
        information for Filipino foods, including DZMM TeleRadyo's Win Today and PTV-4's
        Rise and Shine Pilipinas.
      </p>
      <RouterLink class="text-link" to="/media">See verified media appearances</RouterLink>
    </section>

    <section class="home-section">
      <PopularFoods />
    </section>

    <section class="home-section">
      <BlogPreview />
    </section>
  </main>
</template>

<script setup>
import IntroLinks from '@/components/IntroLinks.vue'
import Banner from '@/components/Banner.vue';
import BlogPreview from '@/components/BlogPreview.vue';
import PopularFoods from '@/components/PopularFoods.vue';
import { usePageSeo } from '@/composables/usePageSeo'
import { useAdsenseLoader } from '@/composables/useAdsenseLoader'

usePageSeo({
  title: 'Nutrition tools for Filipino food',
  description:
    'Explore Filipino nutrition tools, localized food data, recipe analysis, and practical food-literacy guidance made for everyday meals.',
  path: '/'
})

useAdsenseLoader()
</script>

<style scoped>
.home-page {
  width: min(100% - 40px, 980px);
  margin: 0 auto;
  padding: var(--space-8) 0 var(--space-12);
}

.home-section {
  margin-top: var(--space-12);
  padding-top: var(--space-12);
  border-top: 1px solid var(--border-subtle);
}

.sub-text {
  max-width: 820px;
  margin-top: var(--space-12);
  padding-top: var(--space-12);
  border-top: 1px solid var(--border-subtle);
}

.sub-text h2,
.featured-media h2 {
  margin-bottom: var(--space-3);
}

.sub-text p,
.featured-media p {
  max-width: 760px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.featured-media {
  max-width: 820px;
  margin-top: var(--space-12);
  padding-top: var(--space-12);
  border-top: 1px solid var(--border-subtle);
}

.featured-media p {
  margin-top: 0;
}

.credibility-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-5);
}

.credibility-links a {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  color: var(--text-primary);
  font-weight: 700;
}

.credibility-links a:hover {
  border-color: var(--brand-500);
  color: var(--brand-900);
}

.text-link {
  display: inline-flex;
  margin-top: var(--space-4);
}

@media (max-width: 720px) {
  .home-page {
    width: min(100% - 32px, 980px);
  }

  .home-section,
  .sub-text,
  .featured-media {
    margin-top: var(--space-8);
    padding-top: var(--space-8);
  }
}
</style>
