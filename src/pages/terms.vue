<template>
  <div class="legal-container">
    <h1>Terms and Conditions</h1>
    <p class="meta">Last Updated: March 2026</p>

    <section class="disclaimer-box">
      <h2>⚠️ Medical Disclaimer</h2>
      <p>
        <strong>Juan Nutrisyon is for informational purposes only.</strong> The nutritional data provided (sourced from PhilFCT and USDA) should not be considered medical advice. Always consult with a qualified healthcare professional or registered dietitian before making significant changes to your diet.
      </p>
    </section>

    <section>
      <h2>1. Use of the Service</h2>
      <p>By accessing Juan Nutrisyon, you agree to use the tool for personal, non-commercial purposes. You agree not to attempt to scrape, "bulk download," or reverse-engineer the database architecture of this application.</p>
    </section>

    <section>
      <h2>2. Accuracy of Data</h2>
      <p>While we strive to provide the most accurate data from the Philippine Food Composition Tables (PhilFCT) and the USDA, Juan Nutrisyon does not warrant that the information is 100% error-free. Food compositions can vary based on preparation, brand, and regional differences.</p>
    </section>

    <section>
      <h2>3. Third-Party Links & Ads</h2>
      <p>Our service contains links to third-party websites and advertisements (Google AdSense). We are not responsible for the content, privacy policies, or practices of any third-party sites.</p>
    </section>

    <section>
      <h2>4. Limitation of Liability</h2>
      <p>Juan Nutrisyon and its developers shall not be held liable for any health issues, damages, or losses resulting from the use or misuse of the information provided on this platform.</p>
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
  color: var(--color-text);
}
.meta { color: var(--color-text-muted); margin-bottom: 30px; }
h1 { font-size: 2.5rem; margin-bottom: 10px; }
h2 { font-size: 1.5rem; margin-top: 10px; margin-bottom: 10px; }

.disclaimer-box {
  background: var(--color-tint-amber-bg);
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid var(--color-tint-amber-border);
  color: var(--color-tint-amber-text);
}

.back-link {
  display: inline-block;
  margin-top: 40px;
  color: var(--color-link);
  text-decoration: none;
}
h1, h2 { color: var(--color-heading); }
</style>
