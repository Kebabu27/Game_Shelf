<script setup lang="ts">
import { ref } from 'vue'
import type { Movie } from '@/types'

defineProps<{ movies: Movie[] }>()

// Vidéo actuellement lue (une seule à la fois).
const playingId = ref<number | null>(null)

function play(movie: Movie): void {
  playingId.value = movie.id
}

function sourceFor(movie: Movie): string | undefined {
  return movie.data.max ?? movie.data['480']
}
</script>

<template>
  <div class="trailers">
    <div v-for="movie in movies" :key="movie.id" class="trailer">
      <video
        v-if="playingId === movie.id && sourceFor(movie)"
        :src="sourceFor(movie)"
        class="trailer__video"
        controls
        autoplay
        playsinline
      />
      <button v-else type="button" class="trailer__poster" @click="play(movie)">
        <img :src="movie.preview" :alt="movie.name" loading="lazy" />
        <span class="trailer__play" aria-hidden="true">▶</span>
      </button>
      <p class="trailer__name">{{ movie.name }}</p>
    </div>
  </div>
</template>

<style scoped>
.trailers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.trailer {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.trailer__video,
.trailer__poster {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 0.5rem;
  border: 1px solid var(--c-border);
  overflow: hidden;
}
.trailer__poster {
  position: relative;
  padding: 0;
  cursor: pointer;
  background: var(--c-bg);
}
.trailer__poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.trailer__play {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 2rem;
  color: #fff;
  background: rgba(0, 0, 0, 0.35);
  transition: background 0.15s ease;
}
.trailer__poster:hover .trailer__play {
  background: rgba(0, 0, 0, 0.15);
}
.trailer__name {
  font-size: 0.85rem;
  color: var(--c-text-muted);
}
</style>
