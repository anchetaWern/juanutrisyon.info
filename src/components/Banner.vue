<template>
  <section class="home-hero">
    <h1>Filipino food nutrition information, made easier to access and understand.</h1>
    <p>
      Juan Nutrisyon is an independent Filipino food-literacy and nutrition-information initiative developing digital tools for everyday foods, local ingredients, recipes, and professional nutrition workflows.
    </p>

    <p>
      Many Filipino meals do not come with nutrition labels. The project aims to make food-composition data more understandable while being clear about sources, assumptions, and limitations.
    </p>
    <a
      class="visit-button"
      href="https://app.juanutrisyon.info"
      target="_blank"
      rel="noopener"
    >
      Find Foods
    </a>
  </section>
</template>

<style scoped>
.home-hero {
  display: grid;
  gap: var(--space-4);
  max-width: 820px;
  padding: var(--space-8) 0 var(--space-6);
}

.home-hero h1 {
  max-width: 760px;
  margin: 0;
}

.home-hero p {
  max-width: 720px;
  margin: 0;
  color: var(--text-secondary);
  font-size: 1.05rem;
  line-height: 1.55;
}

.visit-button {
  justify-self: start;
  margin-top: var(--space-2);
}

@media (max-width: 640px) {
  .home-hero {
    padding-top: var(--space-6);
  }
}
</style>
