<template>
  <div class="legal-container">
    <header class="legal-header">
      <h1>About Juan Nutrisyon</h1>
    </header>
    
    <section class="content-box">
      <p class="highlight-text">
        <strong>Juan Nutrisyon</strong> is a dedicated nutrition management platform designed specifically for the Filipino context. Our mission is to empower individuals to take control of their health through precise, data-driven nutritional tracking and meal analysis.
      </p>
    </section>

    <section class="details">
      <h2>Our Data Methodology</h2>
      <p>To ensure the highest level of accuracy for our users, Juan Nutrisyon sources its nutritional data from world-class institutions:</p>
      
      <div class="source-item">
        <h3>DOST-FNRI (Philippines)</h3>
        <p>We utilize the Philippine Food Composition Tables (PhilFCT) to provide culturally relevant data for local Filipino dishes and ingredients.</p>
      </div>

      <div class="source-item">
        <h3>USDA (United States)</h3>
        <p>We supplement our database with the U.S. Department of Agriculture FoodData Central for international ingredients and standardized global items.</p>
      </div>
    </section>

    <hr />

    <section class="vision">
      <h2>The Vision</h2>
      <p>Developed in the Philippines, Juan Nutrisyon was born out of a need for a localized tool that understands the Filipino diet. Whether you are tracking macros for fitness, managing a health condition, or simply curious about your nutrition, we are here to help you make informed choices, one meal at a time.</p>
    </section>
  </div>
</template>

<style scoped>
.legal-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: sans-serif;
  line-height: 1.6;
  color: var(--color-text);
}
.legal-header { margin-bottom: 30px; text-align: center; }
.content-box {
  background: var(--color-surface-2);
  padding: 20px;
  border-left: 5px solid var(--color-link);
  margin-bottom: 30px;
}
.highlight-text { font-size: 1.1rem; }
.source-item { margin-bottom: 20px; }
.source-item h3 { color: var(--color-link); margin-bottom: 5px; }
hr { border: 0; border-top: 1px solid var(--color-divider); margin: 40px 0; }
h1 { font-size: 2.5rem; margin-bottom: 10px; }
h2 { font-size: 1.5rem; margin-bottom: 15px; }
h1, h2 { color: var(--color-heading); }
</style>
