<script setup lang="ts">
import { computed, defineAsyncComponent, toRef } from 'vue'
import { RouterLink } from 'vue-router'
import { useLibraryStore } from '@/stores/library'
import { useAuthStore } from '@/stores/auth'
import { useGameDetail } from '@/composables/useGameDetail'
import { toHex, hexToRgb, toParagraphs } from '@/utils/format'
import RatingInput from '@/components/RatingInput.vue'
import TrailerList from '@/components/TrailerList.vue'
import GameRow from '@/components/GameRow.vue'
import ReviewSection from '@/components/ReviewSection.vue'
import GallerySkeleton from '@/components/GallerySkeleton.vue'
import type { GameStatus } from '@/types'

// Sous-arbre lourd (galerie + lightbox) chargé en différé avec fallback visuel.
const ScreenshotGallery = defineAsyncComponent({
  loader: () => import('@/components/ScreenshotGallery.vue'),
  loadingComponent: GallerySkeleton,
  delay: 0,
})

const props = defineProps<{ slug: string }>()

const library = useLibraryStore()
const auth = useAuthStore()
const needsAuth = computed(() => auth.enabled && !auth.isAuthenticated)
const { game, screenshots, movies, series, similar, loading, error } = useGameDetail(
  toRef(props, 'slug'),
)

// Couleur dominante du jeu → thématise la fiche dynamiquement.
const accent = computed(() => toHex(game.value?.dominant_color))
const heroStyle = computed(() => {
  const c = hexToRgb(accent.value)
  return {
    '--game-accent': accent.value,
    '--game-accent-rgb': `${c.r}, ${c.g}, ${c.b}`,
  }
})

const paragraphs = computed(() => toParagraphs(game.value?.description_raw))

const statuses: { value: GameStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'playing', label: 'Playing' },
  { value: 'done', label: 'Completed' },
]
</script>

<template>
  <div class="container">
    <RouterLink to="/" class="back">← Back to catalog</RouterLink>

    <p v-if="loading" class="state">Loading…</p>
    <p v-else-if="error" class="state state--error">{{ error }}</p>

    <article v-else-if="game" class="detail" :style="heroStyle">
      <!-- HERO -->
      <header
        class="hero"
        :style="{
          backgroundImage: game.background_image
            ? `linear-gradient(to top, rgba(var(--game-accent-rgb), 0.92), rgba(var(--game-accent-rgb), 0.25)), url(${game.background_image})`
            : `linear-gradient(135deg, rgba(var(--game-accent-rgb), 0.9), rgba(var(--game-accent-rgb), 0.5))`,
        }"
      >
        <div class="hero__content">
          <h1>{{ game.name }}</h1>
          <div class="hero__badges">
            <span v-if="game.metacritic" class="badge badge--score">{{ game.metacritic }} Metacritic</span>
            <span v-if="game.rating" class="badge badge--rating">★ {{ game.rating.toFixed(1) }}</span>
            <span v-if="game.released" class="badge">{{ game.released }}</span>
            <span v-if="game.playtime" class="badge">~{{ game.playtime }}h playtime</span>
            <span v-if="game.esrb_rating" class="badge">{{ game.esrb_rating.name }}</span>
          </div>
        </div>
      </header>

      <div class="layout">
        <!-- COLONNE PRINCIPALE -->
        <div class="main">
          <section v-if="game.genres.length" class="chips">
            <span v-for="g in game.genres" :key="g.id" class="chip chip--genre">{{ g.name }}</span>
          </section>

          <section v-if="paragraphs.length" class="block">
            <h2>About</h2>
            <div class="prose">
              <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>
            </div>
          </section>

          <section v-if="game.tags?.length" class="block">
            <h2>Tags</h2>
            <div class="chips">
              <span v-for="t in game.tags.slice(0, 18)" :key="t.id" class="chip">{{ t.name }}</span>
            </div>
          </section>

          <section v-if="screenshots.length" class="block">
            <h2>Screenshots</h2>
            <ScreenshotGallery :screenshots="screenshots" />
          </section>

          <section v-if="movies.length" class="block">
            <h2>Trailer</h2>
            <TrailerList :movies="movies.slice(0, 1)" />
          </section>

          <section v-if="series.length" class="block">
            <h2>Same series</h2>
            <GameRow :games="series" />
          </section>

          <section v-if="similar.length" class="block">
            <h2>Similar games</h2>
            <GameRow :games="similar" />
          </section>

          <ReviewSection :game="game" />
        </div>

        <!-- ASIDE : infos + bibliothèque personnelle -->
        <aside class="aside">
          <div class="panel">
            <h2>My library</h2>
            <template v-if="needsAuth">
              <p class="panel__cta">Sign in to add this game, rate it and take notes.</p>
              <RouterLink to="/login" class="btn btn--accent">Sign in</RouterLink>
            </template>
            <template v-else-if="library.has(game.id)">
              <label class="field">
                <span>Status</span>
                <select
                  :value="library.get(game.id)?.status"
                  @change="library.update(game.id, { status: ($event.target as HTMLSelectElement).value as GameStatus })"
                >
                  <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
              </label>
              <label class="field">
                <span>My rating</span>
                <RatingInput
                  :model-value="library.get(game.id)?.rating ?? 0"
                  @update:model-value="library.update(game.id, { rating: $event })"
                />
              </label>
              <button class="btn btn--accent btn--ghost" @click="library.remove(game.id)">Remove</button>
            </template>
            <button v-else class="btn btn--accent" @click="library.add(game)">
              + Add to my library
            </button>
          </div>

          <dl class="facts">
            <template v-if="game.developers?.length">
              <dt>Developer</dt>
              <dd>{{ game.developers.map((d) => d.name).join(', ') }}</dd>
            </template>
            <template v-if="game.publishers?.length">
              <dt>Publisher</dt>
              <dd>{{ game.publishers.map((p) => p.name).join(', ') }}</dd>
            </template>
            <template v-if="game.platforms.length">
              <dt>Platforms</dt>
              <dd>{{ game.platforms.map((p) => p.platform.name).join(', ') }}</dd>
            </template>
            <template v-if="game.website">
              <dt>Website</dt>
              <dd>
                <a :href="game.website" target="_blank" rel="noopener noreferrer">Visit ↗</a>
              </dd>
            </template>
          </dl>
        </aside>
      </div>
    </article>
  </div>
</template>

<style scoped>
.back {
  display: inline-block;
  margin-bottom: 1rem;
  text-decoration: none;
}
.state {
  padding: 2rem 0;
  color: var(--c-text-muted);
}
.state--error {
  color: #dc2626;
}

/* HERO */
.hero {
  border-radius: 0.9rem;
  background-size: cover;
  background-position: center;
  min-height: 280px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.hero__content {
  padding: 1.5rem;
  color: #fff;
}
.hero__content h1 {
  margin: 0 0 0.6rem;
  font-size: clamp(1.6rem, 4vw, 2.6rem);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}
.hero__badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.badge {
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  border-radius: 999px;
  padding: 0.25rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 600;
}
.badge--score {
  background: var(--game-accent);
  border-color: transparent;
}
.badge--rating {
  color: var(--c-star);
}

/* LAYOUT */
.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}
@media (min-width: 860px) {
  .layout {
    grid-template-columns: 1fr 320px;
    align-items: start;
  }
}
.main {
  min-width: 0;
}
.block {
  margin-bottom: 2rem;
}
.block h2 {
  font-size: 1.15rem;
  border-left: 4px solid var(--game-accent);
  padding-left: 0.6rem;
  margin-bottom: 0.9rem;
}
.prose p {
  margin: 0 0 0.8rem;
  color: var(--c-text);
}

/* CHIPS */
.chips {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.chip {
  background: var(--c-surface);
  border: 1px solid var(--c-border-strong);
  border-radius: 999px;
  padding: 0.2rem 0.7rem;
  font-size: 0.78rem;
  color: var(--c-text);
}
.chip--genre {
  background: rgba(var(--game-accent-rgb), 0.14);
  border-color: transparent;
  color: var(--game-accent);
  font-weight: 600;
}

/* ASIDE */
.aside {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 5rem;
}
.panel {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-top: 3px solid var(--game-accent);
  border-radius: 0.7rem;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: stretch;
}
.panel__cta {
  margin: 0;
  font-size: 0.88rem;
  color: var(--c-text-muted);
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--c-text-muted);
}
.field select,
.field textarea {
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: 0.4rem;
  color: var(--c-text);
  padding: 0.5rem;
  font: inherit;
}
.btn--accent {
  background: var(--game-accent);
  border-color: var(--game-accent);
}
.btn--accent.btn--ghost {
  background: transparent;
  color: var(--game-accent);
}
.facts {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 0.7rem;
  padding: 1.1rem;
  margin: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1rem;
  font-size: 0.85rem;
}
.facts dt {
  color: var(--c-text-muted);
}
.facts dd {
  margin: 0;
  text-align: right;
}
</style>
