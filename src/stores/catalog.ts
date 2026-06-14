import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { CatalogQuery, Game, Genre } from '@/types'
import { fetchGames, fetchGenres, fetchParentPlatforms } from '@/api/rawg'
import { filterGames } from '@/utils/filter'

export const useCatalogStore = defineStore('catalog', () => {
  const games = ref<Game[]>([])
  const genres = ref<Genre[]>([])
  const platforms = ref<Genre[]>([])
  const totalCount = ref(0)
  const hasNext = ref(false)
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref<string | null>(null)

  const query = ref<CatalogQuery>({
    search: '',
    genre: null,
    platform: null,
    metacritic: null,
    // Par défaut : les jeux les plus populaires (les plus ajoutés sur RAWG).
    ordering: '-added',
    page: 1,
  })

  const isEmpty = computed(() => !loading.value && games.value.length === 0)

  // Une seule requête active à la fois : on annule la précédente.
  let controller: AbortController | null = null

  /** Charge la première page (remplace la liste). Utilisé à chaque changement de critère. */
  async function loadGames(): Promise<void> {
    controller?.abort()
    controller = new AbortController()
    query.value.page = 1
    loading.value = true
    error.value = null

    try {
      const data = await fetchGames(query.value, controller.signal)
      games.value = filterGames(data.results)
      totalCount.value = data.count
      hasNext.value = Boolean(data.next)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  /** Charge la page suivante et l'ajoute à la liste (scroll infini). */
  async function loadMore(): Promise<void> {
    if (loading.value || loadingMore.value || !hasNext.value) return
    loadingMore.value = true
    const nextPage = query.value.page + 1

    try {
      const data = await fetchGames({ ...query.value, page: nextPage }, controller?.signal)
      // Dédoublonnage : le filtrage peut décaler les pages.
      const seen = new Set(games.value.map((g) => g.id))
      games.value.push(...filterGames(data.results).filter((g) => !seen.has(g.id)))
      query.value.page = nextPage
      hasNext.value = Boolean(data.next)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loadingMore.value = false
    }
  }

  async function loadGenres(): Promise<void> {
    if (genres.value.length) return
    try {
      genres.value = await fetchGenres()
    } catch {
      // Les filtres restent simplement vides en cas d'échec.
    }
  }

  async function loadPlatforms(): Promise<void> {
    if (platforms.value.length) return
    try {
      platforms.value = await fetchParentPlatforms()
    } catch {
      // idem
    }
  }

  function setSearch(search: string): void {
    query.value.search = search
    loadGames()
  }

  function setGenre(genre: string | null): void {
    query.value.genre = genre
    loadGames()
  }

  function setPlatform(platform: number | null): void {
    query.value.platform = platform
    loadGames()
  }

  function setMetacritic(metacritic: string | null): void {
    query.value.metacritic = metacritic
    loadGames()
  }

  function setOrdering(ordering: string): void {
    query.value.ordering = ordering
    loadGames()
  }

  return {
    games,
    genres,
    platforms,
    totalCount,
    hasNext,
    loading,
    loadingMore,
    error,
    query,
    isEmpty,
    loadGames,
    loadMore,
    loadGenres,
    loadPlatforms,
    setSearch,
    setGenre,
    setPlatform,
    setMetacritic,
    setOrdering,
  }
})
