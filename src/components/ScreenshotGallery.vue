<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import type { Screenshot } from '@/types'

defineProps<{ screenshots: Screenshot[] }>()

const lightboxOpen = ref(false)
const current = ref<Screenshot | null>(null)

function open(shot: Screenshot): void {
  current.value = shot
  lightboxOpen.value = true
}
</script>

<template>
  <div class="gallery">
    <button
      v-for="shot in screenshots"
      :key="shot.id"
      type="button"
      class="gallery__thumb"
      @click="open(shot)"
    >
      <img :src="shot.image" :alt="`Screenshot ${shot.id}`" loading="lazy" />
    </button>

    <BaseModal v-model:open="lightboxOpen">
      <img v-if="current" :src="current.image" alt="Full screenshot" class="gallery__full" />
    </BaseModal>
  </div>
</template>

<style scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.6rem;
}
.gallery__thumb {
  padding: 0;
  border: 1px solid var(--c-border);
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  background: var(--c-bg);
  aspect-ratio: 16 / 9;
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.gallery__thumb:hover {
  transform: scale(1.02);
  border-color: var(--c-accent);
}
.gallery__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.gallery__full {
  width: 100%;
  border-radius: 0.4rem;
  display: block;
}
</style>
