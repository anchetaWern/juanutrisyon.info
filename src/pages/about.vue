<template>
  <main class="page-container">
    <header class="page-header">
      <p class="eyebrow">About the project</p>
      <h1>Juan Nutrisyon is an independent Filipino food-literacy initiative.</h1>
      <p>
        The project develops nutrition-information tools that help Filipinos better understand
        everyday foods, local ingredients, recipes, and meals that often do not come with nutrition
        labels.
      </p>
    </header>

    <section class="content-panel">
      <h2>What Juan Nutrisyon Does</h2>
      <p>
        Juan Nutrisyon makes food-composition information easier to search, compare, and apply to
        real Filipino eating patterns. The broader platform includes food nutrient search, recipe
        nutrient analysis, food comparison, food diary tools, educational content, and professional
        workflow tools being developed for Registered Nutritionist-Dietitians.
      </p>
      <p>
        It is a nutrition-information platform, not a medical service. It does not diagnose
        nutritional deficiencies, diseases, or clinical conditions, and it should not replace advice
        from a physician, Registered Nutritionist-Dietitian, or other qualified health professional.
      </p>
    </section>

    <section>
      <h2>Why It Exists</h2>
      <p>
        Juan Nutrisyon started from a personal realization. My mother's stroke changed the way I
        thought about food and prevention. It made me realize how difficult it can be for ordinary
        families to understand the nutritional content of the foods they eat every day, and how
        important accessible, reliable nutrition information can be in supporting healthier
        decisions.
      </p>
      <p>
        In the Philippines, many meals are cooked at home, bought from carinderias, or prepared from
        local ingredients without labels. Juan Nutrisyon exists to reduce that information gap while
        respecting the cultural importance of Filipino food.
      </p>
    </section>

    <section class="founder-card">
      <p class="eyebrow">Founder & Developer</p>
      <h2>Wern Ancheta</h2>
      <p>
        Juan Nutrisyon is currently led and primarily developed by Wern Ancheta, a software
        developer based in San Fernando City, La Union, Philippines.
      </p>
      <p>
        Wern created Juan Nutrisyon and leads its software development, product design, and data
        infrastructure. He is not presenting himself as a Registered Nutritionist-Dietitian,
        physician, nutrition researcher, or clinical authority.
      </p>
      <p>
        For nutrition methodology and professional-use features, the project seeks and incorporates
        input from qualified nutrition professionals where appropriate.
      </p>
    </section>

    <section>
      <h2>Professional Input and Validation</h2>
      <p>
        Portions of Juan Nutrisyon's nutrient-calculation methodology have been reviewed with or
        discussed with a licensed nutrition professional. The platform has not undergone formal
        clinical or academic validation.
      </p>
      <p>
        This distinction matters: professional input can improve methodology and usability, while
        formal validation requires a separate clinical or academic process. Juan Nutrisyon aims to
        be transparent about that boundary.
      </p>
    </section>

    <section>
      <h2>Long-Term Direction</h2>
      <p>
        The long-term goal is to support better food literacy in the Philippines by making nutrition
        information more accessible, more locally relevant, and easier to use in everyday and
        professional contexts.
      </p>
      <p>
        The project is actively interested in collaboration around nutrition methodology review,
        food-composition data, recipe standardization, nutrition education, academic research,
        usability studies, professional RND tools, and Philippine food-data interoperability.
      </p>
      <RouterLink class="text-link" to="/research-partners">Explore collaboration areas</RouterLink>
    </section>
  </main>
</template>

<script setup>
import { usePageSeo } from '@/composables/usePageSeo'

usePageSeo({
  title: 'About',
  description:
    'Learn about Juan Nutrisyon, an independent Filipino food-literacy and nutrition-information initiative led by Founder and Developer Wern Ancheta.',
  path: '/about'
})
</script>

<style scoped>
.page-container {
  max-width: var(--content-max);
}

section {
  margin-top: var(--space-8);
}

h1,
h2 {
  line-height: 1.2;
}

h2 {
  margin-bottom: var(--space-3);
}

p + p {
  margin-top: 1rem;
}

.text-link {
  display: inline-block;
  margin-top: 1rem;
  font-weight: 700;
}
</style>
