import { ref, watch, type Ref } from 'vue'
import {
  fetchGameBySlug,
  fetchGameSeries,
  fetchMovies,
  fetchScreenshots,
  fetchSimilarGames,
} from '@/api/rawg'
import type { Game, Movie, Screenshot } from '@/types'
import { filterGames } from '@/utils/filter'

/**
 * Charge la fiche complète d'un jeu et ses données associées
 * (captures, vidéos, série, similaires) à partir de son slug réactif.
 * Annule les requêtes en cours quand le slug change.
 */
export function useGameDetail(slug: Ref<string>) {
  const game = ref<Game | null>(null)
  const screenshots = ref<Screenshot[]>([])
  const movies = ref<Movie[]>([])
  const series = ref<Game[]>([])
  const similar = ref<Game[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  let controller: AbortController | null = null

  async function load(value: string): Promise<void> {
    controller?.abort()
    controller = new AbortController()
    const signal = controller.signal

    loading.value = true
    error.value = null
    screenshots.value = []
    movies.value = []
    series.value = []
    similar.value = []

    try {
      const data = await fetchGameBySlug(value, signal)
      game.value = data

      // Données secondaires : on les charge en parallèle, sans bloquer
      // l'affichage de la fiche si l'une d'elles échoue.
      const genreSlugs = data.genres.map((g) => g.slug)
      const [shots, vids, serie, reco] = await Promise.allSettled([
        fetchScreenshots(value, signal),
        fetchMovies(value, signal),
        fetchGameSeries(value, signal),
        fetchSimilarGames(genreSlugs, data.id, signal),
      ])

      if (shots.status === 'fulfilled') screenshots.value = shots.value
      if (vids.status === 'fulfilled') movies.value = vids.value
      if (serie.status === 'fulfilled') series.value = filterGames(serie.value)
      if (reco.status === 'fulfilled') similar.value = filterGames(reco.value)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  watch(slug, load, { immediate: true })

  return { game, screenshots, movies, series, similar, loading, error }
}
