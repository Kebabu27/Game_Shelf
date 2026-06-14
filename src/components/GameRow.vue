<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useLibraryStore } from '@/stores/library'
import type { Game } from '@/types'

defineProps<{ games: Game[] }>()

const library = useLibraryStore()
</script>

<template>
  <ul class="row">
    <li v-for="game in games" :key="game.id" class="row__item">
      <RouterLink :to="`/game/${game.slug}`" class="mini">
        <span class="mini__media">
          <img
            v-if="game.background_image"
            :src="game.background_image"
            :alt="game.name"
            loading="lazy"
          />
          <span v-else class="mini__placeholder">🎮</span>
          <span v-if="library.has(game.id)" class="mini__badge" title="In my library">✓</span>
        </span>
        <span class="mini__name">{{ game.name }}</span>
        <span v-if="game.metacritic" class="mini__score">{{ game.metacritic }}</span>
      </RouterLink>
    </li>
  </ul>
</template>

<style scoped>
.row {
  list-style: none;
  margin: 0;
  padding: 0 0 0.5rem;
  display: flex;
  gap: 0.8rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.row__item {
  flex: 0 0 180px;
  scroll-snap-align: start;
}
.mini {
  display: block;
  text-decoration: none;
  color: var(--c-text);
}
.mini__media {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  border: 1px solid var(--c-border);
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--c-bg);
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.mini:hover .mini__media {
  border-color: var(--c-accent);
  transform: translateY(-2px);
}
.mini__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mini__placeholder {
  display: grid;
  place-items: center;
  height: 100%;
  font-size: 1.8rem;
}
.mini__badge {
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  background: var(--c-accent);
  color: #fff;
  border-radius: 999px;
  width: 1.4rem;
  height: 1.4rem;
  display: grid;
  place-items: center;
  font-size: 0.8rem;
}
.mini__name {
  display: block;
  margin-top: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.25;
}
.mini__score {
  font-size: 0.75rem;
  color: var(--c-accent);
  font-weight: 600;
}
</style>
