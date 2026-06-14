<script setup lang="ts">
// Carte fantôme affichée pendant le chargement du catalogue.
</script>

<template>
  <div class="skel" aria-hidden="true">
    <div class="skel__media" />
    <div class="skel__body">
      <div class="skel__line skel__line--short" />
      <div class="skel__line" />
    </div>
  </div>
</template>

<style scoped>
.skel {
  border: 1px solid var(--c-border);
  border-radius: 0.75rem;
  overflow: hidden;
  background: var(--c-surface);
}
.skel__media {
  aspect-ratio: 16 / 10;
}
.skel__body {
  padding: 0.7rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.skel__line {
  height: 0.7rem;
  border-radius: 999px;
}
.skel__line--short {
  width: 55%;
}
.skel__media,
.skel__line {
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
