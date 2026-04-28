<template>
  <div class="legal-container">
    <h1>Terms and Conditions</h1>
    <p class="meta">Last Updated: April 28, 2026</p>

    <section>
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using Juan Nutrisyon ("the Service"), you agree to be
        bound by these Terms and Conditions. If you do not agree, you should not
        use the Service.
      </p>
    </section>

    <section class="disclaimer-box">
      <h2>2. Medical Disclaimer</h2>
      <p>
        Juan Nutrisyon is provided for informational and educational purposes
        only.
      </p>
      <p>
        Nutritional data sourced from the Philippine Food Composition Tables
        (PhilFCT) and the USDA is intended to support general understanding of
        food and nutrition and should not be considered medical advice.
      </p>
      <p>
        Always consult a qualified healthcare professional or registered
        dietitian before making significant changes to your diet, especially if
        you have existing health conditions.
      </p>
    </section>

    <section>
      <h2>3. User Accounts</h2>
      <p>
        To access certain features, you may be required to create an account.
      </p>
      <p>You agree to:</p>
      <ul>
        <li>Provide accurate and complete information</li>
        <li>Keep your login credentials secure</li>
        <li>Be responsible for all activities under your account</li>
      </ul>
      <p>
        We reserve the right to suspend or terminate accounts that violate these
        Terms.
      </p>
    </section>

    <section>
      <h2>4. Use of the Service</h2>
      <p>
        You agree to use Juan Nutrisyon only for lawful and personal purposes.
      </p>
      <p>You must not:</p>
      <ul>
        <li>Attempt to scrape, copy, or bulk download the database</li>
        <li>Reverse-engineer or interfere with the system</li>
        <li>
          Use the platform in a way that could harm its functionality or other
          users
        </li>
      </ul>
    </section>

    <section>
      <h2>5. Nutrition and Health Data</h2>
      <p>
        The Service allows you to input personal and nutrition-related
        information (e.g., food logs, body metrics, and dietary
        classifications).
      </p>
      <p>You acknowledge that:</p>
      <ul>
        <li>The accuracy of results depends on the accuracy of your inputs</li>
        <li>Outputs are estimates and should not replace professional advice</li>
      </ul>
    </section>

    <section>
      <h2>6. Accuracy of Data</h2>
      <p>
        While we strive to provide accurate nutritional information from
        sources such as PhilFCT and USDA, we do not guarantee that all data is
        complete or error-free.
      </p>
      <p>
        Food composition may vary due to preparation methods, brands, and
        regional differences.
      </p>
    </section>

    <section>
      <h2>7. Third-Party Services and Advertising</h2>
      <p>The Service may include third-party services such as:</p>
      <ul>
        <li>Google Analytics for usage analysis</li>
        <li>Google AdSense for advertisements</li>
      </ul>
      <p>
        We are not responsible for the content, policies, or practices of
        these third parties.
      </p>
    </section>

    <section>
      <h2>8. Intellectual Property</h2>
      <p>
        All content, features, and functionality of Juan Nutrisyon, including
        but not limited to text, design, and software, are the property of Juan
        Nutrisyon unless otherwise stated.
      </p>
      <p>
        You may not reproduce, distribute, or create derivative works without
        permission.
      </p>
    </section>

    <section>
      <h2>9. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, Juan Nutrisyon and its
        developers shall not be liable for:
      </p>
      <ul>
        <li>Any health outcomes resulting from use of the Service</li>
        <li>Errors or inaccuracies in nutritional data</li>
        <li>Loss of data, profits, or business opportunities</li>
        <li>Any indirect or consequential damages</li>
      </ul>
      <p>Use of the Service is at your own risk.</p>
    </section>

    <section>
      <h2>10. Account Termination</h2>
      <p>We reserve the right to suspend or terminate your account if:</p>
      <ul>
        <li>You violate these Terms</li>
        <li>You misuse the platform</li>
        <li>Required by law or security concerns</li>
      </ul>
      <p>
        Users may also request account deletion in accordance with our Privacy
        Policy.
      </p>
    </section>

    <section>
      <h2>11. Privacy</h2>
      <p>
        Your use of the Service is also governed by our Privacy Policy, which
        explains how we collect, use, and protect your data.
      </p>
    </section>

    <section>
      <h2>12. Changes to the Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the
        Service after changes are posted constitutes acceptance of the updated
        Terms.
      </p>
    </section>

    <section>
      <h2>13. Governing Law</h2>
      <p>
        These Terms shall be governed by and interpreted in accordance with the
        laws of the Philippines, including the Data Privacy Act of 2012 where
        applicable.
      </p>
    </section>

    <section>
      <h2>14. Contact</h2>
      <p>For questions regarding these Terms, you may contact:</p>
      <p>
        <strong>Email:</strong>
        <a href="mailto:juanutrisyon@gmail.com">juanutrisyon@gmail.com</a>
      </p>
    </section>

    <router-link to="/" class="back-link">← Back to Home</router-link>
  </div>
</template>

<script setup>
import { usePageSeo } from '@/composables/usePageSeo'

usePageSeo({
  title: 'Terms and Conditions',
  description:
    'Review the Juan Nutrisyon terms, medical disclaimer, data accuracy notes, third-party link policy, and service limitations.'
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
.legal-container section {
  margin-bottom: 24px;
}
.legal-container ul {
  margin: 12px 0 12px 20px;
  padding: 0;
}
.legal-container li + li {
  margin-top: 6px;
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
