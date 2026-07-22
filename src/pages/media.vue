<template>
  <main class="page-container">
    <header class="page-header">
      <p class="eyebrow">Media</p>
      <h1>Media discussions about Filipino food literacy.</h1>
      <p>
        Juan Nutrisyon and its food-literacy advocacy have been featured in media discussions about
        making nutrition information more accessible to Filipinos.
      </p>
    </header>

    <section class="media-grid" aria-label="Media appearances">
      <article class="media-card">
        <div class="video-frame">
          <iframe
            src="https://www.youtube.com/embed/BHW5CEzchQo"
            title="Juan Nutrisyon interview on Win Today with Winnie Cordero"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          />
        </div>
        <div class="media-content">
          <p class="eyebrow">July 4, 2026</p>
          <h2>DZMM TeleRadyo - Win Today</h2>
          <p>
            Interview with host Winnie Cordero about Juan Nutrisyon and the need for accessible
            nutrition information for Filipino foods.
          </p>
        </div>
      </article>

      <article class="media-card">
        <div class="video-frame">
          <iframe
            src="https://www.youtube.com/embed/9tKA6UAW_5A"
            title="Juan Nutrisyon interview on Rise and Shine Pilipinas"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          />
        </div>
        <div class="media-content">
          <p class="eyebrow">July 10, 2026</p>
          <h2>PTV-4 - Rise and Shine Pilipinas</h2>
          <p>
            Interview with Ms. Ice and Sir Joshua about food awareness, Filipino nutrition
            information, and the Juan Nutrisyon project.
          </p>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup>
import { usePageSeo } from '@/composables/usePageSeo'

usePageSeo({
  title: 'Media',
  description:
    'Media appearances and interviews featuring Juan Nutrisyon and its Filipino food-literacy advocacy.',
  path: '/media'
})
</script>

<style scoped>
.page-container {
  max-width: 960px;
}

h1,
h2 {
  line-height: 1.2;
}

h2 {
  margin-bottom: var(--space-3);
}

.media-grid {
  display: grid;
  gap: var(--space-5);
}

.media-card {
  display: grid;
  grid-template-columns: minmax(280px, 1.2fr) minmax(260px, 0.8fr);
  gap: var(--space-6);
  align-items: center;
  padding: var(--space-5);
  background: var(--surface-subtle);
}

.video-frame {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--color-surface-3);
}

.video-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

@media (max-width: 760px) {
  .media-card {
    grid-template-columns: 1fr;
    padding: var(--space-4);
  }
}
</style>
