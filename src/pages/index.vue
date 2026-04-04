<template>

  <main>
    <Banner />
    <IntroLinks />
    <hr />

    <div class="sub-text">
      <h2>Why Nutrition Matters</h2>
      <p>
      In the Philippines, many diet-related health issues such as high blood pressure and diabetes are becoming more common. One challenge is that nutrition information is often difficult to access or understand, especially for everyday meals.

      By making nutrition information more accessible, we hope to help people make better food choices without removing the cultural importance of Filipino cuisine.
      </p>
    </div>
  </main>
</template>

<script setup>
import IntroLinks from '@/components/IntroLinks.vue'
import Banner from '@/components/Banner.vue';
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
