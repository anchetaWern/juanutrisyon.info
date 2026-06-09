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
    <a
      class="visit-button"
      href="https://app.juanutrisyon.info"
      target="_blank"
      rel="noopener"
    >
      Find Foods
    </a>
  </div>
</template>

<style scoped>
.greetings{
  margin: 20px 0;
}

.main-text {
  margin-top: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
}

.visit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
  min-height: 3.5rem;
  border-radius: 9999px;
  background: #1f7a4a;
  color: #ffffff;
  font-weight: 700;
  font-size: 1.05rem;
  text-decoration: none;
  box-shadow: 0 10px 24px rgba(31, 122, 74, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.visit-button:hover {
  background: #19643d;
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(31, 122, 74, 0.3);
}

.visit-button:focus-visible {
  outline: 3px solid rgba(31, 122, 74, 0.35);
  outline-offset: 3px;
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
