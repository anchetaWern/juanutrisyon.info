<template>

  <main>
    <Banner />
    <IntroLinks />
    <hr>

    <div class="sub-text">
      <h2>Why Nutrition Matters</h2>
      <p>
      In the Philippines, many diet-related health issues such as high blood pressure and diabetes are becoming more common. One challenge is that nutrition information is often difficult to access or understand, especially for everyday meals.

      By making nutrition information more accessible, we hope to help people make better food choices without removing the cultural importance of Filipino cuisine.
        
      This is especially important since many Filipino meals are home-cooked or bought from carinderias, where nutrition labels are not available.
    </p>
    </div>

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
    'Explore Filipino nutrition tools, localized food data, recipe analysis, and practical healthy eating guidance made for everyday meals.'
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
</style>
