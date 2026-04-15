<template>
  <div class="legal-container">
    <header class="contact-header">
      <h1>Contact Us</h1>
      <p>Have questions or feedback about Juan Nutrisyon? We'd love to hear from you.</p>
    </header>

    <section class="contact-methods">
      <!-- Email Section -->
      <div class="method-card">
        <h3>Email Support</h3>
        <p>For technical support or data inquiries, please reach out to:</p>
        <a href="mailto:juanutrisyon@gmail.com" class="contact-link">juanutrisyon@gmail.com</a>
      </div>

      <!-- Social Media Section -->
      <div class="method-card">
        <h3>Follow Our Journey</h3>
        <p>Stay updated with new features and nutrition tips via our social channels:</p>
        <div class="social-links">
          <a href="https://fb.me/juanutrisyon" target="_blank" rel="noopener">Facebook</a>
          <a href="https://www.instagram.com/juan_nutrisyon" target="_blank" rel="noopener">Instagram</a>
          <a href="https://www.tiktok.com/@juanutrisyon" target="_blank" rel="noopener">TikTok</a>
        </div>
      </div>
    </section>

    <section class="response-time">
      <p><em>We aim to respond to all email inquiries within 48 hours.</em></p>
    </section>

    <router-link to="/" class="back-link">← Back to Home</router-link>
  </div>
</template>

<script setup>
import { usePageSeo } from '@/composables/usePageSeo'

usePageSeo({
  title: 'Contact',
  description:
    'Contact Juan Nutrisyon for feedback, technical support, data questions, or social updates about Filipino nutrition tools.'
})
</script>

<style scoped>
.legal-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: sans-serif;
  line-height: 1.6;
  color: var(--color-text);
}
.contact-header { text-align: center; margin-bottom: 40px; }
h1 { font-size: 2.5rem; margin-bottom: 10px; }

.contact-methods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .contact-methods { grid-template-columns: 1fr; }
}

.method-card {
  background: var(--color-surface-2);
  padding: 25px;
  border-radius: 12px;
  border: 1px solid var(--color-card-border);
  text-align: center;
}

.method-card h3 { color: var(--color-link); margin-bottom: 10px; }

.contact-link {
  display: block;
  font-weight: bold;
  font-size: 1.1rem;
  color: var(--color-link);
  text-decoration: none;
  margin-top: 10px;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.social-links a {
  padding: 8px 16px;
  background: var(--color-card);
  border: 1px solid var(--color-card-border);
  border-radius: 20px;
  text-decoration: none;
  color: var(--color-text);
  font-size: 0.9rem;
  transition: all 0.2s;
}

.social-links a:hover {
  background: var(--color-link);
  color: white;
  border-color: var(--color-link);
}

.response-time { text-align: center; color: var(--color-text-muted); font-size: 0.9rem; }
.back-link { display: inline-block; margin-top: 40px; color: var(--color-link); text-decoration: none; }
</style>
