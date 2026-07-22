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
  max-width: var(--content-max);
}

.post-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

.post-link {
  display: flex;
  min-height: 92px;
  align-items: center;
  padding: var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 800;
  line-height: 1.35;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}

.post-link:hover {
  border-color: var(--brand-500);
  color: var(--brand-900);
  transform: translateY(-1px);
}
</style>
