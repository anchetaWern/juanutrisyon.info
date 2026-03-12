<template>
  <div class="legal-container">
    <h1>Privacy Policy</h1>
    <p class="meta">Last Updated: March 2026</p>

    <section>
      <h2>1. Information Collection</h2>
      <p>
        At Juan Nutrisyon, we collect standard log files. This includes IP addresses, browser types, and time stamps. 
        This information is used solely for analyzing trends and administering the site, and is not linked to any personally identifiable information.
      </p>
    </section>

    <section class="ad-notice">
      <h2>2. Google DoubleClick DART Cookie</h2>
      <p>
        Google, as a third-party vendor, uses cookies to serve ads on Juan Nutrisyon. Google's use of the DART cookie 
        enables it to serve ads to our users based on their visit to our site and other sites on the Internet. 
        Users may opt out of the use of the DART cookie by visiting the 
        <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">Google Ad and Content Network Privacy Policy</a>.
      </p>
    </section>

    <section>
      <h2>3. Advertising Partners</h2>
      <p>
        Our advertising partners include <strong>Google AdSense</strong>. These third-party ad servers or ad networks 
        use technology that appears on Juan Nutrisyon, which are sent directly to your browser.
      </p>
    </section>

    <section>
      <h2>4. User Consent</h2>
      <p>By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.</p>
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
.meta { color: #666; margin-bottom: 30px; }
h1 { font-size: 2.5rem; margin-bottom: 10px; }
h2 { font-size: 1.5rem; margin-top: 10px; margin-bottom: 10px; }
.ad-notice {
  background: #eef7ff;
  margin-top: 10px;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #cfe2ff;
}
.back-link {
  display: inline-block;
  margin-top: 40px;
  color: #70B30B;
  text-decoration: none;
}
.back-link:hover { text-decoration: underline; }
a { color: #70B30B; }
</style>