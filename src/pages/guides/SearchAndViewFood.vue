<template>
    <!-- Workflow: Search and View -->
    <section class="workflow-section">
      <div class="workflow-badge">Workflow 1</div>
      <h2>How to Search & View Food Data</h2>
      <p class="intro-text">
        Whether you're looking for common ingredients or local Filipino delicacies, 
        Juan Nutrisyon allows you to find nutritional data using English or local dialects.
      </p>

      <div class="step-card">
        <div class="step-number">01</div>
        <div class="step-content">
          <h3>Access the Search Tool</h3>
          <p>
            The search function is available on <strong>every page</strong>. Look for the 
            <span class="icon-text">🔍 Search Icon</span> at the top right corner of your screen. 
            Click it to open the search bar.
          </p>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">02</div>
        <div class="step-content">
          <h3>Enter Your Query</h3>
          <p>
            Type the name of the food in the text box. 
            <strong>Pro-tip:</strong> You can search in local dialects (e.g., searching for "Petsay" 
            will help you find Pechay). Click the <strong>SEARCH</strong> button to proceed.
          </p>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">03</div>
        <div class="step-content">
          <h3>Select from Results</h3>
          <p>
            Browse through the list of matches. Each result shows the food name and its calorie count. 
            If you don't see what you're looking for, use the <strong>pagination buttons</strong> 
            at the bottom to see more results. Click on a food item to view its full profile.
          </p>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">04</div>
        <div class="step-content">
          <h3>Understand the Food Profile</h3>
          <p>Once the food page opens, you can explore several key areas:</p>
          <ul>
            <li><strong>Source & Names:</strong> View the data origin (e.g., PhilFCT) and alternate names at the top left.</li>
            <li><strong>Modify Serving:</strong> Click the <button class="mini-btn">MODIFY</button> button to change the grams to match your actual portion.</li>
            <li><strong>Nutrient Details:</strong> Click any <span class="info-circle">i</span> icon to learn more about a specific nutrient or its daily limits.</li>
            <li><strong>Actions:</strong> Use <strong>"Add to Recipe"</strong> for building meals or <strong>"Log as Meal"</strong> to record it in your diary.</li>
          </ul>
        </div>
      </div>
    </section>

    <div class="top-bottom-margin">
        <p>Need more help? Look for the <strong>?</strong> icon in the app header.</p>
    </div>

</template>

<style>
.workflow-section h2 {
  color: var(--color-accent-blue); /* Search blue */
  margin-top: 0.5rem;
}

.workflow-badge {
  display: inline-block;
  background: var(--color-tint-blue-bg);
  color: var(--color-accent-blue);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.intro-text {
  font-style: italic;
  color: var(--color-text-muted);
  margin-bottom: 2rem;
}

.step-card {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background: var(--color-card);
  border: 1px solid var(--color-card-border);
}

.step-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-accent-blue);
  opacity: 0.5;
}

.step-content h3 {
  margin: 0 0 0.5rem 0;
}

.step-content ul {
  margin-top: 1rem;
  padding-left: 1.2rem;
}

.step-content li {
  margin-bottom: 0.5rem;
}

.mini-btn {
  padding: 2px 8px;
  font-size: 0.7rem;
  border: 1px solid var(--color-border);
  background: var(--color-card);
  border-radius: 4px;
  cursor: default;
}

.info-circle {
  display: inline-block;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  font-size: 0.7rem;
  font-style: italic;
  color: var(--color-text-muted);
}

.guide-footer {
  margin-top: 4rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--color-text-soft);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .step-card {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.top-bottom-margin {
    margin: 20px 0;
}
</style>
