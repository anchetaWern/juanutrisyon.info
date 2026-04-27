<template>
  <article class="post-container">
    <header class="post-header">
      <p class="brand">Juan Nutrisyon</p>
      <h1>Nature's Hidden Pantry: Discovering the Forgotten Superfoods of the Philippines</h1>
      <p class="post-meta">Published April 6, 2026 by Wern Ancheta</p>
    </header>

    <section class="post-section">
      <p>
        While most of us look to supermarket shelves for our next meal, a vibrant, nutrient-dense
        pantry is waiting just outside our doors. From the coastal coves to the mountain trails,
        the Philippines is home to foraged foods that have sustained our ancestors for generations.
        At Juan Nutrisyon, we believe these native foods are the key to a sustainable and healthy
        future. It's time to look past the "imported" labels and rediscover the power of what grows
        wild and free in our own backyard.
      </p>
    </section>

    <section class="post-section">
      <h2>The Beauty of the Wild</h2>
      <img
        src="/blog/natures-hidden-pantry/forage-1.jpg"
        alt="Wide shot of foraged greens and plants"
        class="post-image"
      />
      <p>
        Foraging isn't just about survival; it's about reconnecting with the land. Native plants
        often require no pesticides, no chemical fertilizers, and very little water compared to
        commercial crops. They are the ultimate "slow food."
      </p>
      <p>
        Cultural Heritage: Many of these plants are known by different names across our 7,107
        islands. What might be a "weed" in one province is a prized delicacy in another. By
        documenting these, we preserve the culinary identity of our various regions.
      </p>
    </section>

    <section class="post-section">
      <h2>Spotlighting the Harvest</h2>
      <img
        src="/blog/natures-hidden-pantry/forage-2.jpg"
        alt="Detailed shot of a foraged plant"
        class="post-image"
      />
      <p>
        One of the most exciting aspects of foraged food is the nutritional density. Wild plants
        often contain higher concentrations of antioxidants and minerals than their farmed
        counterparts because they have to be "tougher" to survive in the wild.
      </p>
      <img
        src="/blog/natures-hidden-pantry/forage-3.jpg"
        alt="Close-up of native fruit or leafy greens"
        class="post-image"
      />
      <p>
        Take, for example, our native berries and leafy greens. Unlike store-bought lettuce, which
        is mostly water, native greens like talinum, pako (fern), or kulitis (native amaranth) are
        packed with iron, calcium, and Vitamin C. These are foods that don't just fill your
        stomach - they fuel your recovery and boost your immune system.
      </p>
    </section>

    <section class="post-section">
      <h2>Safe Foraging &amp; Sustainability</h2>
      <img
        src="/blog/natures-hidden-pantry/forage-4.jpg"
        alt="Harvested basket and foraging process"
        class="post-image"
      />
      <p>
        Before you head out into the wild, remember the golden rule of foraging: If you aren't
        100% sure what it is, don't eat it.
      </p>
      <ul class="list">
        <li>
          Know Your Sources: Ensure you aren't foraging near busy roadsides or areas sprayed with
          chemicals.
        </li>
        <li>
          Take Only What You Need: Sustainable foraging means leaving enough for the plant to
          regrow and for the local wildlife to thrive.
        </li>
        <li>
          Wash Thoroughly: Just like store-bought produce, foraged items need a good soak and scrub
          to remove wild soil and tiny "residents."
        </li>
      </ul>
    </section>

    <section class="post-section">
      <h2>Deep Dive: Why Go Native?</h2>
      <div class="tips-grid">
        <div class="tips-block">
          <h3>Climate Resilience</h3>
          <p>
            Native plants are naturally adapted to the Philippine climate. They can withstand our
            typhoons and our dry seasons far better than introduced species. Promoting these foods
            is a step toward a more climate-resilient food system.
          </p>
        </div>
        <div class="tips-block">
          <h3>Economic Empowerment</h3>
          <p>
            By creating a demand for native and foraged foods, we support local communities and
            indigenous groups who have the knowledge to harvest these items. It keeps the
            "Juan Nutrisyon" philosophy alive - nutrition for the people, by the people.
          </p>
        </div>
        <div class="tips-block">
          <h3>Flavor Profile</h3>
          <p>
            Wild foods offer unique flavor profiles - bitter, sour, and earthy - that you simply
            can't find in a supermarket. These flavors are often indicators of high phytonutrient
            content.
          </p>
        </div>
      </div>
    </section>

    <section class="post-section">
      <p>
        The next time you take a walk through your community, keep your eyes open. You might just
        find a superfood hiding in plain sight. Let's bring these native treasures back to the
        Filipino dinner table.
      </p>
    </section>

    <section class="cta-card">
      <p>
        Check out the foraged foods section on our website
      </p>
      <a
        class="cta-button"
        href="https://app.juanutrisyon.info/search?category=foraged-foods"
        target="_blank"
        rel="noopener noreferrer"
      >
        View foraged foods
      </a>
    </section>
  </article>
</template>

<script setup>
import { useBlogPostSeo } from '@/composables/useBlogPostSeo'

const seo = {
  title: "Nature's Hidden Pantry: Discovering the Forgotten Superfoods of the Philippines",
  description:
    'Rediscover native Philippine superfoods, foraged ingredients, and sustainable food traditions that support nutrition, culture, and biodiversity.',
  path: '/blog/natures-hidden-pantry',
  publishedTime: '2026-04-06',
  modifiedTime: '2026-04-06',
  authorName: 'Wern Ancheta',
  image: '/blog/natures-hidden-pantry/forage-1.jpg',
  imageAlt: 'Foraged Philippine ingredients featured in Nature’s Hidden Pantry',
  section: 'Nutrition',
  tags: ['superfoods', 'foraged foods', 'philippine food', 'biodiversity']
}

useBlogPostSeo(seo)
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

.list {
  margin: 1.25rem 0 0;
  padding-left: 1.25rem;
}

.list li {
  margin-bottom: 0.75rem;
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
