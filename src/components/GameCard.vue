<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { toHex, hexToRgb, metacriticTone } from '@/utils/format'
import PlatformIcon from '@/components/PlatformIcon.vue'
import type { Game } from '@/types'

const props = defineProps<{ game: Game; inLibrary?: boolean }>()

const accent = computed(() => toHex(props.game.dominant_color))
const cardStyle = computed(() => {
  const c = hexToRgb(accent.value)
  return { '--card-accent': accent.value, '--card-accent-rgb': `${c.r}, ${c.g}, ${c.b}` }
})

const tone = computed(() => metacriticTone(props.game.metacritic))
const platforms = computed(() =>
  (props.game.parent_platforms ?? []).map((p) => p.platform.slug).slice(0, 5),
)
</script>

<template>
  <article class="card" :style="cardStyle">
    <RouterLink :to="`/game/${game.slug}`" class="card__media">
      <img
        v-if="game.background_image"
        :src="game.background_image"
        :alt="game.name"
        loading="lazy"
      />
      <div v-else class="card__placeholder">🎮</div>

      <div class="card__overlay" />

      <div class="card__top">
        <span v-if="platforms.length" class="card__platforms">
          <PlatformIcon v-for="p in platforms" :key="p" :slug="p" />
        </span>
        <span v-if="tone" class="card__score" :class="`card__score--${tone}`">
          {{ game.metacritic }}
        </span>
      </div>

      <span v-if="inLibrary" class="card__badge">✓ In library</span>

      <h3 class="card__title">{{ game.name }}</h3>
    </RouterLink>

    <div class="card__body">
      <div class="card__meta">
        <span v-if="game.released" class="card__year">{{ game.released.slice(0, 4) }}</span>
        <span v-if="game.rating" class="card__rating">★ {{ game.rating.toFixed(1) }}</span>
      </div>

      <div v-if="game.genres.length" class="card__genres">
        <span v-for="g in game.genres.slice(0, 2)" :key="g.id" class="card__genre">{{ g.name }}</span>
      </div>

      <!-- Slot d'actions : le parent injecte le contenu (ex. bouton ajouter). -->
      <div class="card__actions">
        <slot name="actions" :game="game" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}
.card:hover {
  transform: translateY(-4px);
  border-color: rgba(var(--card-accent-rgb), 0.7);
  box-shadow: 0 10px 28px -10px rgba(var(--card-accent-rgb), 0.65);
}

.card__media {
  position: relative;
  aspect-ratio: 16 / 10;
  display: block;
  overflow: hidden;
}
.card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.card:hover .card__media img {
  transform: scale(1.06);
}
.card__placeholder {
  display: grid;
  place-items: center;
  height: 100%;
  font-size: 2.5rem;
  background: linear-gradient(135deg, rgba(var(--card-accent-rgb), 0.5), var(--c-bg));
}
.card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(var(--card-accent-rgb), 0.92) 0%,
    rgba(var(--card-accent-rgb), 0.35) 35%,
    transparent 65%
  );
}

.card__top {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card__platforms {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  padding: 0.25rem 0.45rem;
  border-radius: 999px;
}
.card__score {
  font-size: 0.78rem;
  font-weight: 700;
  color: #fff;
  border-radius: 0.35rem;
  padding: 0.1rem 0.4rem;
  min-width: 1.6rem;
  text-align: center;
}
.card__score--high {
  background: #15803d;
}
.card__score--mid {
  background: #b45309;
}
.card__score--low {
  background: #b91c1c;
}

.card__badge {
  position: absolute;
  top: 2.4rem;
  left: 0.5rem;
  background: var(--card-accent);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.card__title {
  position: absolute;
  left: 0.7rem;
  right: 0.7rem;
  bottom: 0.55rem;
  margin: 0;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.7rem;
}
.card__meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--c-text-muted);
}
.card__rating {
  color: var(--c-star);
  font-weight: 600;
}
.card__genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.card__genre {
  font-size: 0.7rem;
  color: var(--c-text-muted);
  background: rgba(var(--card-accent-rgb), 0.12);
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
}
.card__actions {
  margin-top: auto;
}
</style>
