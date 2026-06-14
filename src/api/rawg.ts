import type { CatalogQuery, Game, Genre, Movie, RawgResponse, Screenshot } from '@/types'

const BASE_URL = import.meta.env.VITE_RAWG_BASE_URL ?? 'https://api.rawg.io/api'
const API_KEY = import.meta.env.VITE_RAWG_KEY

if (!API_KEY) {
  console.warn(
    '[rawg] VITE_RAWG_KEY is missing. Copy .env.example to .env and set your key.',
  )
}

const PAGE_SIZE = 20

/** Construit une URL RAWG avec la clé API et les paramètres fournis. */
function buildUrl(path: string, params: Record<string, string | number> = {}): string {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('key', API_KEY)
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== null && value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

/** Effectue un fetch typé, en propageant le signal d'annulation. */
async function request<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) {
    throw new Error(`RAWG API error (${res.status})`)
  }
  return (await res.json()) as T
}

/** Récupère une page du catalogue, avec recherche/filtre/tri. */
export function fetchGames(
  query: CatalogQuery,
  signal?: AbortSignal,
): Promise<RawgResponse<Game>> {
  const url = buildUrl('/games', {
    search: query.search,
    genres: query.genre ?? '',
    parent_platforms: query.platform ?? '',
    metacritic: query.metacritic ?? '',
    ordering: query.ordering,
    page: query.page,
    page_size: PAGE_SIZE,
  })
  return request<RawgResponse<Game>>(url, signal)
}

/** Récupère les familles de plateformes (PC, PlayStation, Xbox…) pour les filtres. */
export async function fetchParentPlatforms(signal?: AbortSignal): Promise<Genre[]> {
  const data = await request<RawgResponse<Genre>>(buildUrl('/platforms/lists/parents'), signal)
  return data.results
}

/** Récupère le détail complet d'un jeu par son slug. */
export function fetchGameBySlug(slug: string, signal?: AbortSignal): Promise<Game> {
  return request<Game>(buildUrl(`/games/${slug}`), signal)
}

/** Récupère la liste des genres pour les filtres. */
export async function fetchGenres(signal?: AbortSignal): Promise<Genre[]> {
  const data = await request<RawgResponse<Genre>>(buildUrl('/genres'), signal)
  return data.results
}

/** Récupère les captures d'écran d'un jeu. */
export async function fetchScreenshots(slug: string, signal?: AbortSignal): Promise<Screenshot[]> {
  const data = await request<RawgResponse<Screenshot>>(
    buildUrl(`/games/${slug}/screenshots`),
    signal,
  )
  return data.results
}

/** Récupère les bandes-annonces vidéo d'un jeu. */
export async function fetchMovies(slug: string, signal?: AbortSignal): Promise<Movie[]> {
  const data = await request<RawgResponse<Movie>>(buildUrl(`/games/${slug}/movies`), signal)
  return data.results
}

/** Récupère les autres jeux de la même série. */
export async function fetchGameSeries(slug: string, signal?: AbortSignal): Promise<Game[]> {
  const data = await request<RawgResponse<Game>>(buildUrl(`/games/${slug}/game-series`), signal)
  return data.results
}

/**
 * Récupère des jeux similaires en se basant sur les genres.
 * (L'endpoint officiel /suggested est réservé au plan payant de RAWG ;
 * on reproduit la fonctionnalité via un filtre par genres.)
 */
export async function fetchSimilarGames(
  genreSlugs: string[],
  excludeId: number,
  signal?: AbortSignal,
): Promise<Game[]> {
  if (!genreSlugs.length) return []
  const data = await request<RawgResponse<Game>>(
    buildUrl('/games', {
      genres: genreSlugs.slice(0, 3).join(','),
      ordering: '-rating',
      page_size: 12,
    }),
    signal,
  )
  return data.results.filter((g) => g.id !== excludeId).slice(0, 8)
}
