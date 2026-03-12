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

<style scoped>
.legal-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: sans-serif;
  line-height: 1.6;
  color: #333;
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
  background: #f9f9f9;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #eee;
  text-align: center;
}

.method-card h3 { color: #007bff; margin-bottom: 10px; }

.contact-link {
  display: block;
  font-weight: bold;
  font-size: 1.1rem;
  color: #007bff;
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
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 20px;
  text-decoration: none;
  color: #555;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.social-links a:hover {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.response-time { text-align: center; color: #777; font-size: 0.9rem; }
.back-link { display: inline-block; margin-top: 40px; color: #007bff; text-decoration: none; }
</style>