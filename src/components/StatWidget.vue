<script setup lang="ts">
/** Tuile de statistique. Label + valeur en props, détail via slot. */
defineProps<{ label: string; value: string | number; accent?: boolean }>()
</script>

<template>
  <div class="stat" :class="{ 'stat--accent': accent }">
    <p class="stat__value">{{ value }}</p>
    <p class="stat__label">{{ label }}</p>
    <!-- Injection de contenu optionnelle (graphe, liste, etc.). -->
    <div v-if="$slots.default" class="stat__detail">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.stat {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 0.6rem;
  padding: 1rem;
}
.stat--accent {
  border-color: var(--c-accent);
}
.stat__value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--c-text);
}
.stat__label {
  font-size: 0.8rem;
  color: var(--c-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.stat__detail {
  margin-top: 0.75rem;
}
</style>
