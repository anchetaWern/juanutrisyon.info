<template>
  <main class="page-container">
    <header class="page-header">
      <p class="eyebrow">Research & Partners</p>
      <h1>Collaboration for stronger Filipino food-literacy tools.</h1>
      <p>
        Juan Nutrisyon is an independent project seeking thoughtful collaboration with qualified
        professionals and organizations that care about nutrition information, food data, and public
        health in the Philippines.
      </p>
    </header>

    <section class="content-panel">
      <h2>Who This Page Is For</h2>
      <p>
        The project is especially interested in hearing from Registered Nutritionist-Dietitians,
        nutrition researchers, universities, public-health organizations, government nutrition
        agencies, LGUs, food-composition database organizations, food manufacturers, recipe
        developers, and food-data partners.
      </p>
    </section>

    <section>
      <h2>Collaboration Areas</h2>
      <div class="grid-list">
        <article>
          <h3>Nutrition Methodology Review</h3>
          <p>Reviewing nutrient calculations, assumptions, terminology, and professional-use flows.</p>
        </article>
        <article>
          <h3>Food-Composition Data</h3>
          <p>Improving data quality, source mapping, attribution, validation, and interoperability.</p>
        </article>
        <article>
          <h3>Recipe Standardization</h3>
          <p>Developing clearer ingredient, yield, portion, and serving conventions for Filipino recipes.</p>
        </article>
        <article>
          <h3>Nutrition Education</h3>
          <p>Creating accessible food-literacy content that remains scientifically careful.</p>
        </article>
        <article>
          <h3>Research and Usability Studies</h3>
          <p>Exploring how Filipinos understand and use nutrition information in real contexts.</p>
        </article>
        <article>
          <h3>Professional RND Tools</h3>
          <p>Reducing repetitive calculation and meal-planning tasks while supporting assessment and client care.</p>
        </article>
      </div>
    </section>

    <section>
      <h2>What Juan Nutrisyon Can Offer</h2>
      <ul>
        <li>A working software platform focused on Filipino food and nutrition information.</li>
        <li>Food database infrastructure and source-aware data workflows.</li>
        <li>Recipe analysis and food-search tools that can be tested and improved.</li>
        <li>Public-facing nutrition education channels and content experience.</li>
        <li>Technical development capacity for digital nutrition tools.</li>
        <li>A potential platform for usability research and food-literacy experiments.</li>
      </ul>
    </section>

    <section class="cta-panel">
      <h2>Discuss a Collaboration</h2>
      <p>
        If your work involves nutrition methodology, Filipino food data, public-health education,
        professional RND workflows, or research, Juan Nutrisyon would welcome a focused conversation.
      </p>
      <RouterLink class="cta-link" to="/contact">Contact Juan Nutrisyon</RouterLink>
    </section>
  </main>
</template>

<script setup>
import { usePageSeo } from '@/composables/usePageSeo'

usePageSeo({
  title: 'Research & Partners',
  description:
    'Collaborate with Juan Nutrisyon on nutrition methodology, Filipino food data, education, research, and professional RND tools.',
  path: '/research-partners'
})
</script>

<style scoped>
.page-container {
  max-width: 900px;
}

section {
  margin-top: var(--space-8);
}

.grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.grid-list article {
  padding: var(--space-4);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-md);
  background: var(--color-card);
}

h1,
h2,
h3 {
  line-height: 1.2;
}

h2 {
  margin-bottom: var(--space-3);
}

h3 {
  margin-bottom: 0.55rem;
  font-size: 1.05rem;
  font-weight: 700;
}

ul {
  padding-left: 1.3rem;
}

li + li {
  margin-top: 0.6rem;
}

.cta-link {
  display: inline-flex;
  margin-top: 1rem;
}
</style>
