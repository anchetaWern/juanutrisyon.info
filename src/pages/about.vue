<template>
  <div class="legal-container">
    <header class="legal-header">
      <h1>About Juan Nutrisyon</h1>
    </header>
    
    <section class="content-box">
      <p class="highlight-text">
        <strong>Juan Nutrisyon</strong> is a dedicated nutrition management platform designed specifically for Filipinos. Our mission is to empower individuals to take control of their health through precise, data-driven meal planning, nutritional tracking, and meal analysis.
      </p>
    </section>

    <section class="story">
      <h2>Our Story: Why Juan Nutrisyon Exists</h2>
      <p>In the Philippines, we show love through food. But for many Filipino families, the food we love is often tied to a silent reality: the rise of lifestyle diseases like hypertension and diabetes.</p>
      <p>Juan Nutrisyon started with a personal realization.</p>
      <p>When my mother suffered a stroke, my perspective on food changed overnight. I realized that so many of these health challenges could be managed—or even prevented—if we were simply empowered with the right information. "Prevention is better than cure" isn't just a saying; it’s a life-saving practice. But to prevent these diseases, we need to know exactly what we are putting into our bodies.</p>
    </section>

    <hr>
    
    <section class="problem">
      <h2>The Problem</h2>
      <p>Most nutrition apps are built for Western diets. They understand kale and quinoa, but they struggle with Sinigang, Longganisa, or the quick meal you grab at your local carinderia. Without localized data, Filipinos are left guessing, and mindless consumption becomes the default.</p>
    </section>

    <hr>

    <section class="vision">
      <h2>The Vision</h2>
      <p>We want to inspire a new generation of Filipinos—one that is mindful, informed, and proactive about their health. By making the "nutrition label" a staple of the Filipino dining experience, we’re helping our community make informed choices, one meal at a time.</p>
      <p>Because at the end of the day, when you know better, you eat better.</p>
    </section>

    <section class="mission">
      <h2>Our Mission</h2>
      <p>I created Juan Nutrisyon to be a tool for every Juan. Our goal is to make nutrition data accessible and easy to understand for every Filipino.</p>

      <div class="source-item">
        <h3>Localized Data</h3>
        <p>We’re building a database that covers everything from processed snacks to your favorite home-cooked recipes.</p>
      </div>

      <div class="source-item">
        <h3>Context Over Numbers</h3>
        <p>We don’t just show you macros; we give you the context. We celebrate when you meet your iron or fiber goals and help you stay mindful of sugar and saturated fats.</p>
      </div>

      <div class="source-item">
        <h3>Empowering Professionals</h3>
        <p>We provide tools for Filipino Dietitians to automate the technical "boring stuff," allowing them to focus on what they do best: helping people live healthier lives.</p>
      </div>
    </section>

    <hr>

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
.legal-container section + section { margin-top: 32px; }
.content-box {
  background: var(--color-surface-2);
  padding: 20px;
  border-left: 5px solid var(--color-link);
}
.highlight-text { font-size: 1.1rem; }
.source-item { margin-top: 20px; }
.source-item h3 { color: var(--color-link); margin-bottom: 5px; }
hr { border: 0; border-top: 1px solid var(--color-divider); margin: 40px 0; }
h1 { font-size: 2.5rem; margin-bottom: 10px; }
h2 { font-size: 1.5rem; margin-bottom: 15px; }
h1, h2 { color: var(--color-heading); }
</style>
