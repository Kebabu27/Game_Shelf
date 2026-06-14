<script setup lang="ts">
// Fallback visuel affiché pendant le chargement différé de la galerie.
</script>

<template>
  <div class="skeleton" aria-busy="true" aria-label="Loading gallery">
    <span v-for="n in 6" :key="n" class="skeleton__tile" />
  </div>
</template>

<style scoped>
.skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.6rem;
}
.skeleton__tile {
  aspect-ratio: 16 / 9;
  border-radius: 0.5rem;
  background: linear-gradient(
    100deg,
    var(--c-border) 30%,
    var(--c-surface) 50%,
    var(--c-border) 70%
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
}
@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
</style>
