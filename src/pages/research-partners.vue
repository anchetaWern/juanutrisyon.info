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
  margin: 0 auto;
  padding: 44px 20px;
  line-height: 1.7;
  color: var(--color-text);
}

.page-header {
  margin-bottom: 36px;
  text-align: center;
}

.page-header p {
  max-width: 740px;
  margin: 0.85rem auto 0;
}

.eyebrow {
  margin-bottom: 0.5rem;
  color: var(--color-link);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

section {
  margin-top: 34px;
}

.content-panel,
.cta-panel {
  padding: 24px;
  border: 1px solid var(--color-card-border);
  border-radius: 8px;
  background: var(--color-surface-2);
}

.grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.grid-list article {
  padding: 18px;
  border: 1px solid var(--color-card-border);
  border-radius: 8px;
  background: var(--color-card);
}

h1,
h2,
h3 {
  color: var(--color-heading);
  line-height: 1.2;
}

h1 {
  font-size: 2.35rem;
}

h2 {
  margin-bottom: 0.75rem;
  font-size: 1.45rem;
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
  padding: 0.8rem 1.15rem;
  border-radius: 999px;
  background: #1f7a4a;
  color: #ffffff;
  font-weight: 700;
}

.cta-link:hover {
  background: #19643d;
}

@media (max-width: 640px) {
  h1 {
    font-size: 2rem;
  }
}
</style>
