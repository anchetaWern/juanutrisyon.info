<template>
  <div>
    <!-- Workflow: Creating a Recipe -->
    <section class="workflow-section">
      <div class="workflow-badge">Workflow 2</div>
      <h2>How to Create a Recipe</h2>
      <p class="intro-text">
        Combine multiple ingredients to build a complete dish and see the total nutritional 
        breakdown per serving. 
      </p>
      <p class="intro-text">
        Note: this is only available for logged in users. Signing up for an account is FREE.
      </p>

      <div class="step-card">
        <div class="step-number">01</div>
        <div class="step-content">
          <h3>Add Ingredients</h3>
          <p>
            From any food page, click the <span class="action-text green green-border">ADD TO RECIPE</span> 
            button. 
          </p>
          <p>
            A <strong>Modify Serving Size</strong> window will appear. Enter the 
            <strong>Weight as purchased (AP Weight)</strong>—the app will automatically 
            calculate the edible portion for you based on our food data. Click the blue 
            button to confirm.
          </p>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">02</div>
        <div class="step-content">
          <h3>Go to the Recipe Page</h3>
          <p>
            You can keep searching and adding more foods. Once you are done, click the 
            <strong>Chef's Hat icon</strong> in the top navigation bar to finalize your recipe.
          </p>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">03</div>
        <div class="step-content">
          <h3>Refine Your Ingredients</h3>
          <p>On the Recipe Page, you can fine-tune your list:</p>
          <ul>
            <li><strong>Description & Role:</strong> Add context like "minced" or "garnish."</li>
            <li><strong>Adjust Amounts:</strong> Change weights directly on the ingredient card.</li>
            <li><strong>Remove Items:</strong> Click the <span class="red-trash">🗑️ red garbage can icon</span> at the top right of an ingredient card to delete it.</li>
          </ul>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">04</div>
        <div class="step-content">
          <h3>Finalize and Privacy</h3>
          <p>Fill in the <strong>required</strong> fields in the center column:</p>
          <ul>
            <li><strong>Recipe details:</strong> Set the Number of Servings, Recipe Name, and <strong>upload</strong> a dish image.</li>
            <li><strong>Public Toggle:</strong> If toggled <strong>ON</strong>, your recipe will be searchable by other users. If <strong>OFF</strong>, it remains private to you (though you can still share it via a direct link).</li>
          </ul>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">05</div>
        <div class="step-content">
          <h3>Save Your Work</h3>
          <p>
            Check the <strong>Nutrient Breakdown</strong> on the right to see the total calories 
            and macros per serving. Once satisfied, click the <strong>SAVE RECIPE</strong> button 
            at the bottom to store it in your collection.
          </p>
        </div>
      </div>

    </section>

    <div class="top-bottom-margin">
        <p>Recipe saved? <strong>Would you like to move on to the final workflow: How to add food to the food diary for analysis?</strong></p>
    </div>
  </div>
</template>

<style scoped>
.workflow-section h2 {
  color: var(--color-accent-green);
  margin-top: 0.5rem;
}

.workflow-badge {
  display: inline-block;
  background: var(--color-tint-green-bg);
  color: var(--color-accent-green);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: bold;
}

.intro-text {
  font-style: italic;
  color: var(--color-text-muted);
  margin-bottom: 2rem;
}

.step-card {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border-radius: 8px;
  background: var(--color-card);
  border: 1px solid var(--color-card-border);
}

.save-step {
  background: var(--color-tint-blue-bg);
  border-left: 4px solid var(--color-accent-blue);
}

.step-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-accent-green);
  opacity: 0.4;
}

.step-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.action-text {
  font-weight: bold;
}

.green { color: var(--color-accent-green); }

.red-trash {
  color: var(--color-accent-red);
  font-weight: bold;
}

.guide-footer {
  margin-top: 3rem;
  padding: 2rem;
  background: var(--color-surface-2);
  text-align: center;
  border-radius: 8px;
}

@media (max-width: 600px) {
  .step-card {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.top-bottom-margin {
    margin: 20px 0;
}

.green-border { color: var(--color-accent-green); border: 1px solid var(--color-accent-green); padding: 2px 6px; border-radius: 4px; }
</style>
