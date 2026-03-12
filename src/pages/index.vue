<template>

  <main>
    <Banner />
    <IntroLinks />
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
</style>
