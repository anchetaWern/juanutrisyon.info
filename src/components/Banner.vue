<script setup>
defineProps({
  msg: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="greetings">
    <h1 class="green">Nutrition information for everyday food — without judgment.</h1>
  </div>
  <p>
    Juan Nutrisyon helps Filipinos understand the nutritional content of everyday foods — from lutong bahay meals to common ingredients found in local markets and carinderias.

Many foods we eat daily don’t come with nutrition labels, making it difficult to know how they affect our health. This platform aims to make that information more accessible and easier to understand.

Whether you’re tracking your diet, planning meals, or simply curious about what’s on your plate, Juan Nutrisyon provides tools and insights to guide your decisions.
  </p>
  <div class="main-text">
    <br>Visit <a href="https://app.juanutrisyon.info">app.juanutrisyon.info</a>
  </div>
</template>

<style scoped>
.greetings{
  margin: 20px 0;
}

.main-text {
  margin-bottom: 20px;
}

h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
  line-height: 45px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
