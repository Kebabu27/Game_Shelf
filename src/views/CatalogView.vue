<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCatalogStore } from '@/stores/catalog'
import { useLibraryStore } from '@/stores/library'
import { useAuthStore } from '@/stores/auth'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import GameCard from '@/components/GameCard.vue'
import GameCardSkeleton from '@/components/GameCardSkeleton.vue'
import SearchBar from '@/components/SearchBar.vue'
import FilterBar from '@/components/FilterBar.vue'
import type { Game } from '@/types'

const router = useRouter()
const catalog = useCatalogStore()
const library = useLibraryStore()
const auth = useAuthStore()
const { games, genres, platforms, loading, loadingMore, hasNext, error, query, isEmpty } =
  storeToRefs(catalog)

const { sentinel } = useInfiniteScroll(() => catalog.loadMore())

// Ajouter à la bibliothèque nécessite d'être connecté.
function toggleGame(game: Game): void {
  if (auth.enabled && !auth.isAuthenticated) {
    router.push('/login')
    return
  }
  library.toggle(game)
}

onMounted(() => {
  catalog.loadGenres()
  catalog.loadPlatforms()
  if (!games.value.length) catalog.loadGames()
})
</script>

<template>
  <div class="container">
    <h1>Catalog</h1>

    <div class="toolbar">
      <SearchBar @search="catalog.setSearch" />
      <FilterBar
        :genres="genres"
        :platforms="platforms"
        :selected-genre="query.genre"
        :selected-platform="query.platform"
        :selected-metacritic="query.metacritic"
        :ordering="query.ordering"
        @update:genre="catalog.setGenre"
        @update:platform="catalog.setPlatform"
        @update:metacritic="catalog.setMetacritic"
        @update:ordering="catalog.setOrdering"
      />
    </div>

    <p v-if="error" class="state state--error">{{ error }}</p>
    <p v-else-if="isEmpty" class="state">No games found.</p>

    <!-- Squelettes pendant le chargement initial -->
    <div v-if="loading" class="grid">
      <GameCardSkeleton v-for="n in 12" :key="n" />
    </div>

    <template v-else>
      <div class="grid">
        <GameCard
          v-for="game in games"
          :key="game.id"
          :game="game"
          :in-library="library.has(game.id)"
        >
          <template #actions="{ game: g }">
            <button class="btn" :class="{ 'btn--ghost': library.has(g.id) }" @click="toggleGame(g)">
              {{ library.has(g.id) ? '✓ Added' : '+ Add' }}
            </button>
          </template>
        </GameCard>

        <!-- Squelettes ajoutés pendant le chargement de la page suivante -->
        <GameCardSkeleton v-for="n in loadingMore ? 4 : 0" :key="`more-${n}`" />
      </div>

      <!-- Sentinelle observée pour déclencher le scroll infini -->
      <div v-if="hasNext" ref="sentinel" class="sentinel" />
      <p v-else-if="games.length" class="state state--end">You've reached the end.</p>
    </template>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0 1.5rem;
}
.state {
  padding: 2rem 0;
  color: var(--c-text-muted);
}
.state--error {
  color: #dc2626;
}
.state--end {
  text-align: center;
  font-size: 0.85rem;
}
.sentinel {
  height: 1px;
}
</style>
