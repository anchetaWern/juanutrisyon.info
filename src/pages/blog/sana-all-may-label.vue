<template>
  <article class="post-container">
    <header class="post-header">
      <p class="brand">Juan Nutrisyon</p>
      <h1>Sana All May Label! A Filipino Guide to Reading Nutrition Facts</h1>
      <p class="post-meta">Published April 3, 2026 by Wern Ancheta</p>
    </header>

    <section class="post-section">
      <p>
        In the world of dating, "walang label" is a headache. But in the world of nutrition,
        "walang label" is a health risk! Reading nutrition facts is your superpower. It's the
        difference between thinking a snack is healthy and actually knowing what's going into your
        body. Today, we're breaking down the labels of the "Big Three" in every Pinoy pantry:
        Instant Noodles, 3-in-1 Coffee, and Canned Fish.
      </p>
    </section>

    <section class="post-section">
      <h2>The Foundation - Serving Size</h2>
      <img
        src="/blog/sana-all-may-label/1.png"
        alt="Instant noodles nutrition label"
        class="post-image"
      />
      <p>
        Before you look at calories or sodium, look at the Serving Size. Manufacturers often list
        nutrients for a portion of the pack, not the whole thing. If the pack says "Servings per
        container: 2" and you eat the whole thing, you have to double every number you see.
      </p>
      <p>
        The Instant Noodle Trap: Instant noodles are deep-fried during processing to make them
        shelf-stable, which spikes the fat content. One pack can contain 680mg of sodium - nearly
        half of your daily 1,500mg limit!
      </p>
      <img
        src="/blog/sana-all-may-label/2.png"
        alt="How to balance instant noodles"
        class="post-image"
      />
      <p>
        Dietitian's Tip: Don't just eat them plain. Use only 50% of the flavoring packet to cut
        salt, and add a boiled egg for protein or kangkong/carrots for fiber.
      </p>
    </section>

    <section class="post-section">
      <h2>The Sweet Truth about 3-in-1 Coffee</h2>
      <img
        src="/blog/sana-all-may-label/3.png"
        alt="3-in-1 coffee nutrition label"
        class="post-image"
      />
      <p>
        Many of us start our day with a sachet of 3-in-1. But did you know a single 25g packet can
        contain 15g of sugar? That's equivalent to 3 full teaspoons of sugar in one small cup!
      </p>
      <img
        src="/blog/sana-all-may-label/4.png"
        alt="Ingredient list showing sugar content"
        class="post-image"
      />
      <p>
        Check the Ingredient List. Ingredients are listed by weight - from highest to lowest. If
        "Sugar" or "Coffee Creamer" is the first thing on the list, you're drinking a dessert, not
        just a morning pick-me-up.
      </p>
      <p>
        The Verdict: Keep it as an occasional treat. For your daily caffeine fix, try brewing plain
        coffee and adding a controlled amount of milk or a tiny bit of sugar.
      </p>
    </section>

    <section class="post-section">
      <h2>Canned Fish - Heart Healthy or Salt Heavy?</h2>
      <img
        src="/blog/sana-all-may-label/5.png"
        alt="Canned fish nutrition label"
        class="post-image"
      />
      <p>
        Canned tuna and sardines are Filipino staples for a reason - they are affordable and rich in
        Omega-3 and DHA, which are great for heart health. However, the "bath" the fish sits in
        matters.
      </p>
      <img
        src="/blog/sana-all-may-label/6.png"
        alt="Brine versus oil comparison"
        class="post-image"
      />
      <p>
        Look for keywords like "Brine" or "Water". These use a salt solution for preservation,
        which can drive the sodium up to 370mg or more per serving.
      </p>
      <p>
        Pro-Tip: If you buy fish in oil or brine, drain the liquid before eating. This significantly
        reduces the extra fat and salt you don't need.
      </p>
    </section>

    <section class="post-section">
      <h2>Deep Dive: 3 Things to Watch Out For</h2>
      <div class="tips-grid">
        <div class="tips-block">
          <h3>The % Daily Value (%DV)</h3>
          <p>
            This tells you how much a nutrient in a serving of food contributes to a daily diet. A
            general rule of thumb: 5% DV or less is low, and 20% DV or more is high. Aim for high in
            fiber and vitamins, and low in saturated fat and sodium.
          </p>
        </div>
        <div class="tips-block">
          <h3>Hidden Sugars</h3>
          <p>
            Sugar has many aliases. Look for corn syrup, maltodextrin, fructose, or cane juice in
            the ingredient list.
          </p>
        </div>
        <div class="tips-block">
          <h3>Fiber vs. Carbs</h3>
          <p>
            Not all carbs are equal. Always check the fiber line. In refined foods like 3-in-1
            coffee, fiber is usually 0g. Aim for snacks that offer at least 2-3g of fiber per
            serving.
          </p>
        </div>
      </div>
    </section>

    <section class="cta-card">
      <p>Want to take the guesswork out of your meals? Visit app.juanutrisyon.info today.</p>
      <a
        class="cta-button"
        href="https://app.juanutrisyon.info"
        target="_blank"
        rel="noopener noreferrer"
      >
        Try the App
      </a>
    </section>
  </article>
</template>

<script setup>
import { usePageSeo } from '@/composables/usePageSeo'

usePageSeo({
  title: 'Sana All May Label! A Filipino Guide to Reading Nutrition Facts',
  description:
    'Learn how to read nutrition facts for instant noodles, 3-in-1 coffee, and canned fish so you can spot sodium, sugar, and serving sizes.'
})
</script>

<style scoped>
.post-container {
  max-width: 800px;
  margin: 2.5rem auto 4rem;
  padding: 0 1.5rem;
  font-family: "Montserrat", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif;
  color: var(--color-text);
  line-height: 1.7;
}

.post-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.brand {
  font-size: 0.95rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-link);
  margin-bottom: 0.5rem;
}

.post-meta {
  margin: 0.6rem 0 0;
  font-size: 0.95rem;
  color: var(--color-text);
  opacity: 0.78;
}

h1 {
  color: var(--color-heading);
  font-size: 2.3rem;
  margin: 0;
}

h2 {
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

h3 {
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.post-section {
  margin-bottom: 2.5rem;
}

.post-image {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  margin: 1.5rem auto 0;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.tips-block {
  background: var(--color-surface-2);
  padding: 1.25rem;
  border-radius: 14px;
}

.tips-block p {
  margin: 0;
}

.cta-card {
  margin: 3rem 0 2rem;
  padding: 1.75rem;
  background: var(--color-surface-2);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  background: var(--color-link);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
}
</style>
