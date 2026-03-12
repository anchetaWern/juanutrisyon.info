<template>
  <div>
    <!-- Workflow: Food Diary & Diet Analysis -->
    <section class="workflow-section">
      <div class="workflow-badge">Workflow 3</div>
      <h2>How to Use the Food Diary</h2>
      <p class="intro-text">
        Track your daily intake, monitor water consumption, and get a deep dive into your 
        nutritional health.
      </p>

      <div class="step-card">
        <div class="step-number">01</div>
        <div class="step-content">
          <h3>Open Your Diary</h3>
          <p>
            Click the <strong>Diary icon</strong> (📔) in the top navigation bar. If it's your 
            first time visiting today, click the <span class="action-text blue blue-border">ADD MEAL</span> 
            button to get started.
          </p>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">02</div>
        <div class="step-content">
          <h3>Log Your Meals</h3>
          <ol>
            <li><strong>Select Meal Type:</strong> A window will pop up—choose Breakfast, Lunch, Dinner, or a Snack.</li>
            <li><strong>Find Food:</strong> Click the <span class="plus-btn">+</span> button on your new meal card. This opens the search box.</li>
            <li><strong>Log It:</strong> Search for your food, select it, and click <span class="action-text blue blue-border">LOG AS MEAL</span>. Just like the recipe builder, you can enter the AP weight or serving size.</li>
          </ol>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">03</div>
        <div class="step-content">
          <h3>Track Your Hydration</h3>
          <p>
            In the <strong>Water Logger</strong> section, tap the empty cup icon to add 1 cup (250ml) 
            of water. If you made a mistake, simply <strong>hold a filled cup for 2 seconds</strong> 
            to delete it.
          </p>
        </div>
      </div>

      <div class="step-card highlight-analysis">
        <div class="step-content">
          <h3>Understanding Your Analysis</h3>
          <p>At any point, scroll down to see your real-time <strong>Diet Analysis</strong>:</p>
          <ul>
            <li><strong>The Big Picture:</strong> View remaining calories and your Macro (Carbs/Protein/Fat) bars.</li>
            <li><strong>Health Risks:</strong> Keep an eye on the "Watch Out" cards for Sodium, Saturated Fat, and Sugar.</li>
            <li><strong>Smart Sorting:</strong> 
              <ul>
                <li><em>Deficient:</em> Arranged from "least deficient" so you know what's easiest to fix first.</li>
                <li><em>Over-consumed:</em> Arranged by highest excess so you know what to cut back.</li>
                <li><em>Good Coverage:</em> Celebrate the nutrients where you've hit your goals!</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <footer class="guide-footer">
      <p><h3>Guide Complete!</h3> You are now ready to master your nutrition with Juan Nutrisyon.</p>
      <button class="blue-btn" @click="printGuide">Save Guide as PDF</button>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'FoodDiary',
  methods: {
    printGuide() {
      window.print();
    }
  }
}
</script>

<style scoped>
.workflow-section h2 {
  color: #D3302F;
  margin-top: 0.5rem;
}

.workflow-badge {
  display: inline-block;
  background: #ffcece;
  color: #D3302F;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: bold;
}

.step-card {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
}

.highlight-analysis {
  background: #fdf7e3;
  border-left: 5px solid #fbc02d;
}

.step-number {
  font-size: 1.5rem;
  font-weight: 900;
  color: #D3302F;
  opacity: 0.3;
}

.action-text { font-weight: bold; }
.green-border { color: #D3302F; border: 1px solid #D3302F; padding: 2px 6px; border-radius: 4px; }
.blue { color: #1976d2; }

.plus-btn {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 18px;
  text-align: center;
  border: 1px solid #333;
  border-radius: 50%;
  font-weight: bold;
}

.blue-btn {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
}

.guide-footer {
  margin-top: 4rem;
  padding: 2rem;
  background: #f5f5f5;
  text-align: center;
  border-radius: 12px;
}

@media print {
  .blue-btn { display: none; }
}

@media (max-width: 600px) {
  .step-card { flex-direction: column; gap: 0.5rem; }
}

.blue-border {
    color: #1B76D3;
    border: 1px solid #1B76D3;
    padding: 2px 6px;
    border-radius: 4px;
}
</style>