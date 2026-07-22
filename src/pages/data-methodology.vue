<template>
  <main class="page-container">
    <header class="page-header">
      <p class="eyebrow">Data & Methodology</p>
      <h1>How Juan Nutrisyon approaches food data and nutrient calculations.</h1>
      <p>
        This page summarizes the project's data sources, calculation approach, and current
        limitations for users, nutrition professionals, researchers, and potential partners.
      </p>
    </header>

    <section class="content-panel">
      <h2>Data Sources</h2>
      <p>
        Juan Nutrisyon currently uses food-composition data from the Philippine Food Composition Tables (PhilFCT) developed by DOST-FNRI and USDA FoodData Central.
      </p>
      <p>
        The project does not list a source unless it is actually used. As the database grows, food
        records should retain source attribution and traceability wherever possible.
      </p>
    </section>

    <section>
      <h2>Source Priority and Food Matching</h2>
      <p>
        For Filipino foods and ingredients, Philippine data is preferred when a suitable record is
        available. Other sources may be used to supplement items that are not yet covered locally.
      </p>
      <p>
        When a food must be matched to an equivalent or similar item from another database, the
        mapping should consider food identity, preparation method, raw or cooked state, edible
        portion, cut, and other details that affect nutrient values.
      </p>
    </section>

    <section>
      <h2>Raw, Cooked, and Food State</h2>
      <p>
        Nutrient values can change depending on whether a food is raw or cooked, edible portion or
        as-purchased, and how it was prepared. Moisture loss or gain can also affect nutrient values
        per 100 grams.
      </p>
      <p>
        Juan Nutrisyon aims to make food state clear when that information is available, but users
        should expect variation for home-cooked meals and mixed dishes.
      </p>
    </section>

    <section>
      <h2>Recipe Calculations</h2>
      <p>
        For recipes, ingredient-level nutrient values are combined to estimate the total nutrient
        composition of the recipe. Serving or portion estimates are then used to show nutrient
        values for the amount a person intends to eat.
      </p>
      <p>
        These estimates depend on the selected ingredient records, ingredient weights, serving
        counts, and preparation assumptions. The public site does not currently document formal
        cooking-yield or nutrient-retention factors, so this page does not claim that those methods
        are implemented.
      </p>
    </section>

    <section>
      <h2>Reference Values and Conversions</h2>
      <p>
        The site currently describes nutrient values being normalized per 100 grams and adjusted
        based on portion size. Existing public pages also describe source attribution and recipe
        nutrient aggregation.
      </p>
      <p>
        Where daily targets, recommended limits, or nutrient reference values are shown in the app,
        they should be interpreted as food-literacy guidance rather than diagnosis. Specific
        standards should be documented only where the implementation or public content confirms
        them.
      </p>
    </section>

    <section class="content-panel">
      <h2>Limitations</h2>
      <ul>
        <li>Food composition naturally varies by variety, region, season, and supplier.</li>
        <li>Filipino recipes vary widely by household, restaurant, and province.</li>
        <li>Cooking methods, moisture changes, and ingredient substitutions can affect results.</li>
        <li>Serving sizes and user-entered amounts may be estimates.</li>
        <li>Some database records may have incomplete nutrient coverage.</li>
        <li>Packaged products may change formulation over time.</li>
        <li>Community-submitted information is reviewed before trusted database use.</li>
      </ul>
    </section>

    <section>
      <h2>Professional Review and Validation</h2>
      <p>
        Portions of Juan Nutrisyon's nutrient-calculation methodology have been reviewed with or
        discussed with a licensed nutrition professional. This is not the same as formal clinical or
        academic validation.
      </p>
      <p>
        Juan Nutrisyon welcomes collaboration with qualified professionals and researchers who can
        help strengthen methodology, documentation, usability, and data quality.
      </p>
    </section>
  </main>
</template>

<script setup>
import { usePageSeo } from '@/composables/usePageSeo'

usePageSeo({
  title: 'Data & Methodology',
  description:
    'Understand Juan Nutrisyon data sources, food matching, recipe calculations, limitations, and professional review status.',
  path: '/data-methodology'
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

ul {
  padding-left: 1.3rem;
}

li + li {
  margin-top: 0.6rem;
}
</style>
