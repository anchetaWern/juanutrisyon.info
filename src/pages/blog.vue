<template>
  <div class="blog-container">
    <header class="blog-header">
      <h1>Juan Nutrisyon Blog</h1>
      <p>Fresh takes, practical nutrition, and local context for Filipino plates.</p>
    </header>

    <section class="post-list">
      <RouterLink
        v-for="post in posts"
        :key="post.slug"
        :to="`/blog/${post.slug}`"
        class="post-link"
      >
        Read the article: {{ post.title }}
      </RouterLink>
    </section>
  </div>
</template>

<script setup>
import { usePageSeo } from '@/composables/usePageSeo'

const posts = [
  {
    title: "Busog Pero Kulang: Why Feeling Full Doesn't Mean You're Nourished",
    slug: 'busog-pero-kulang-why-feeling-full-doesnt-mean-youre-nourished'
  },
  {
    title: 'Hidden sugar in common Filipino foods',
    slug: 'hidden-sugar-in-common-filipino-foods'
  },
  {
    title: 'Carinderia survival guide (healthy choices)',
    slug: 'carinderia-survival-guide-healthy-choices'
  },
  { title: 'Why Filipino food is high in sodium', slug: 'why-filipino-food-is-high-in-sodium' },
  { title: 'Healthy eating on a budget', slug: 'healthy-eating-on-a-budget' },
  { title: 'Common nutrition mistakes filipinos make', slug: 'common-nutrition-mistakes-filipinos-make' },
  { title: 'Is using asin a sin?', slug: 'is-using-asin-a-sin' },
  {
    title: "Nature's Hidden Pantry: Discovering the Forgotten Superfoods of the Philippines",
    slug: 'natures-hidden-pantry'
  },
  { title: 'Sana all may label!', slug: 'sana-all-may-label' }
];

usePageSeo({
  title: 'Blog',
  description:
    'Browse Juan Nutrisyon articles on Filipino nutrition, hidden sugar, sodium, label reading, carinderia choices, and budget-friendly healthy eating.'
})
</script>

<style scoped>
.blog-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1.5rem 3rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--color-text);
  line-height: 1.6;
}

.blog-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.blog-header h1 {
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-link {
  display: block;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  background: var(--color-surface-2);
  color: var(--color-link);
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}
</style>
