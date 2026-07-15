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

    <section class="featured-media">
      <h2>As Featured on DZMM and PTV</h2>
      <p>
        Juan Nutrisyon has also been featured in interviews discussing the need for
        more accessible nutrition information for Filipinos.
      </p>

      <div class="video-grid">
        <article class="video-card">
          <div class="video-frame">
            <iframe
              src="https://www.youtube.com/embed/BHW5CEzchQo"
              title="Juan Nutrisyon interview on DZMM"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            />
          </div>
          <h3>DZMM Interview</h3>
        </article>

        <article class="video-card">
          <div class="video-frame">
            <iframe
              src="https://www.youtube.com/embed/9tKA6UAW_5A"
              title="Juan Nutrisyon interview on PTV"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            />
          </div>
          <h3>PTV Interview</h3>
        </article>
      </div>
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

.featured-media {
  margin-top: 30px;
}

.featured-media p {
  margin-top: 0.75rem;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.video-card h3 {
  margin-top: 12px;
  font-size: 1rem;
}

.video-frame {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.video-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
