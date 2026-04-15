<template>
  <section class="blog-preview">
    <h2>From the Blog</h2>
    <p>Fresh takes, practical nutrition, and local context for Filipino plates.</p>
    <div class="posts">
      <article class="post">
        <h3>
          <a class="post-link" href="/blog/busog-pero-kulang-why-feeling-full-doesnt-mean-youre-nourished">
            Busog Pero Kulang
          </a>
        </h3>
        <p>
          A practical look at hidden hunger, why being full is not the same as being nourished,
          and how to improve a simple rice meal without spending more.
        </p>
      </article>
      <article class="post">
        <h3>
          <a class="post-link" href="/blog/hidden-sugar-in-common-filipino-foods">
            Hidden Sugar in Common Filipino Foods
          </a>
        </h3>
        <p>
          A practical guide to the sweeteners hiding in tocino, spaghetti, 3-in-1 coffee, bottled
          bagoong, and fruit juices that seem healthier than they are.
        </p>
      </article>
      <article class="post">
        <h3>
          <a class="post-link" href="/blog/carinderia-survival-guide-healthy-choices">
            Carinderia Survival Guide
          </a>
        </h3>
        <p>
          Practical ways to eat better at your neighborhood turo-turo without giving up budget,
          convenience, or familiar Filipino flavors.
        </p>
      </article>
      <article class="post">
        <h3>
          <a class="post-link" href="/blog/why-filipino-food-is-high-in-sodium">
            Why Filipino Food Is High in Sodium
          </a>
        </h3>
        <p>
          A closer look at how preservation, condiments, and modern pantry staples made salty
          flavors a defining part of Filipino food.
        </p>
      </article>
      <article class="post">
        <h3>
          <a class="post-link" href="/blog/sana-all-may-label">Sana All May Label</a>
        </h3>
        <p>
          A Filipino guide to reading nutrition facts, from instant noodles to 3-in-1 coffee and
          canned fish, so you actually know what's on your plate.
        </p>
      </article>
      <article class="post">
        <h3>
          <a class="post-link" href="/blog/healthy-eating-on-a-budget">Healthy Eating on a Budget</a>
        </h3>
        <p>
          Proof that healthy eating doesn't need to be expensive, with practical tips, a daily
          budget breakdown, and recipes you can cook this week.
        </p>
      </article>
      <article class="post">
        <h3>
          <a class="post-link" href="/blog/is-using-asin-a-sin">Is Using Asin a Sin</a>
        </h3>
        <p>
          A clear, no-guilt look at salt in Filipino cooking, how much is too much, and easy swaps
          that still keep your food flavorful.
        </p>
      </article>
    </div>
    <a class="more-link" href="/blog">Read more</a>
  </section>
</template>

<style scoped>
.blog-preview {
  margin-top: 32px;
}

.posts {
  display: grid;
  gap: 16px;
  margin-top: 12px;
}

.post {
  border: 1px solid var(--color-card-border);
  border-radius: 12px;
  padding: 16px;
  background-color: var(--color-card);
  color: var(--color-text);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.post h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.post-link {
  color: inherit;
  text-decoration: none;
}

.post-link:hover {
  text-decoration: underline;
}

.post p {
  margin: 0;
  color: var(--color-text-muted);
}

.more-link {
  display: block;
  margin-top: 12px;
  color: var(--color-link);
  text-decoration: none;
  font-weight: 600;
  text-align: center;
}

.more-link:hover {
  color: var(--color-link-hover);
  text-decoration: underline;
}
</style>
