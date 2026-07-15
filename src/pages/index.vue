<template>

  <main>
    <Banner />
    <IntroLinks />
    <hr>

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

    <hr>

    <section class="featured-media">
      <h2>Media Discussions</h2>
      <p>
        Juan Nutrisyon has been featured in media discussions about accessible nutrition
        information for Filipino foods, including DZMM TeleRadyo's Win Today and PTV-4's
        Rise and Shine Pilipinas.
      </p>
      <RouterLink class="text-link" to="/media">See verified media appearances</RouterLink>
    </section>

    <hr>

    <PopularFoods />

    <hr>

    <BlogPreview />
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
header {
  line-height: 1.5;
}

main {
    max-width: 600px;
    padding: 40px 20px;
    margin: 0 auto;
}

hr {
  margin-top: 10px;
  border: none;
  height: 1px;
  background-color: #E7E7E7;
}

.sub-text {
  margin-top: 30px;
}

.featured-media {
  margin-top: 30px;
}

.featured-media p {
  margin-top: 0.75rem;
}

.credibility-links {
  display: grid;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.credibility-links a,
.text-link {
  font-weight: 700;
}
</style>
