<template>
  <article class="post-container">
    <header class="post-header">
      <p class="brand">Juan Nutrisyon</p>
      <h1>Is Using Asin a Sin? A Guide to Mindful Sodium Intake</h1>
      <p class="post-meta">Published April 10, 2026 by Wern Ancheta</p>
    </header>

    <section class="post-section">
      <p>
        In the Philippines, our food is defined by its bold, savory flavors. From the saltiness of
        patis in a warm bowl of Tinola to the rich toyo in Adobo, seasonings are the heart of our
        kitchen. But have you ever stopped to wonder: How much sodium is actually in that "dash" of
        salt? While sodium is a necessary mineral, too much can lead to hypertension.
      </p>
      <img
        src="/blog/is-using-asin-a-sin/1.png"
        alt="Sodium content of common seasonings"
        class="post-image"
      />
    </section>

    <section class="post-section">
      <h2>The Hidden Numbers</h2>
      <p>
        The American Heart Association recommends 1,500 mg of sodium per day for most adults.
      </p>
      <p>
        People with hypertension should aim for 1,000 mg per day to support better blood pressure
        control.
      </p>
      <img
        src="/blog/is-using-asin-a-sin/4.png"
        alt="Recommended sodium limits"
        class="post-image"
      />
    </section>

    <section class="post-section">
      <h2>Estimating Sodium in Your Cooking</h2>
      <p>
        You don't need to be a scientist to track your intake. You can estimate the sodium in your
        meals by dividing the total seasoning used by the number of servings.
      </p>
      <img
        src="/blog/is-using-asin-a-sin/2.png"
        alt="Soup estimation example"
        class="post-image"
      />
      <img
        src="/blog/is-using-asin-a-sin/3.png"
        alt="Stir-fry or salad estimation example"
        class="post-image"
      />
    </section>

    <section class="post-section">
      <h2>Tips for Consuming Less Sodium</h2>
      <div class="tips-grid">
        <div class="tips-block">
          <h3>DOs</h3>
          <ul>
            <li>Use low-sodium alternatives such as coco aminos or Worcestershire sauce.</li>
            <li>Use herbs like oregano and basil.</li>
            <li>Use acids like calamansi or vinegar.</li>
            <li>Use aromatics like garlic and onion.</li>
          </ul>
        </div>
        <div class="tips-block">
          <h3>DONTs</h3>
          <ul>
            <li>Avoid adding table salt to finished meals.</li>
            <li>Limit MSG.</li>
            <li>Reduce frequent restaurant or ordered food.</li>
          </ul>
        </div>
      </div>
      <img
        src="/blog/is-using-asin-a-sin/5.png"
        alt="Tips checklist for consuming less sodium"
        class="post-image"
      />
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

    <footer class="disclaimer">
      Note: If you are on hypertension medication, please consult your doctor before making
      significant dietary changes. We need at least 500 mg of sodium per day to maintain bodily
      functions.
    </footer>
  </article>
</template>

<script setup>
if (typeof document !== 'undefined') {
  document.title = 'Is Using Asin a Sin? A Guide to Mindful Sodium Intake | Juan Nutrisyon';
}
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

.tips-block ul {
  padding-left: 1.25rem;
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

.disclaimer {
  font-size: 0.9rem;
  color: var(--color-text-muted, #6b7280);
}
</style>
