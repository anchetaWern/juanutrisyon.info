<template>
  <div class="item">
    <i>
      <slot name="icon"></slot>
    </i>
    <div class="details">
      <h3>
        <slot name="heading"></slot>
      </h3>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.item {
  display: flex;
  gap: var(--space-3);
  min-height: 100%;
  padding: var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}

.item:hover {
  border-color: var(--border-strong);
  transform: translateY(-1px);
}

.details {
  flex: 1;
  min-width: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
}

i {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  background: var(--brand-soft);
  color: var(--brand-700);
}

h3 {
  margin: 0 0 var(--space-2);
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-primary);
}

.details :deep(a) {
  font-weight: 700;
}

@media (max-width: 560px) {
  .item {
    flex-direction: column;
  }
}
</style>
