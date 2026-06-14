import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCatalogStore } from './catalog'
import type { Game, Genre, RawgResponse } from '@/types'

// On simule le client API distant pour tester la logique du store.
vi.mock('@/api/rawg', () => ({
  fetchGames: vi.fn(),
  fetchGenres: vi.fn(),
}))

import { fetchGames, fetchGenres } from '@/api/rawg'

const mockedFetchGames = vi.mocked(fetchGames)
const mockedFetchGenres = vi.mocked(fetchGenres)

function makeResponse(games: Game[]): RawgResponse<Game> {
  return { count: games.length, next: null, previous: null, results: games }
}

function makeGame(id: number): Game {
  return {
    id,
    slug: `game-${id}`,
    name: `Game ${id}`,
    released: '2021-01-01',
    background_image: `https://img/${id}.jpg`,
    rating: 4,
    metacritic: 80,
    genres: [],
    platforms: [],
  }
}

describe('useCatalogStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('charge les jeux et met à jour le compteur', async () => {
    mockedFetchGames.mockResolvedValue(makeResponse([makeGame(1), makeGame(2)]))
    const catalog = useCatalogStore()
    await catalog.loadGames()
    expect(catalog.games).toHaveLength(2)
    expect(catalog.totalCount).toBe(2)
    expect(catalog.loading).toBe(false)
  })

  it('réinitialise la page à 1 lors d’une nouvelle recherche', async () => {
    mockedFetchGames.mockResolvedValue(makeResponse([]))
    const catalog = useCatalogStore()
    catalog.query.page = 5
    catalog.setSearch('zelda')
    expect(catalog.query.search).toBe('zelda')
    expect(catalog.query.page).toBe(1)
  })

  it('capture les erreurs de l’API dans error', async () => {
    mockedFetchGames.mockRejectedValue(new Error('Boom'))
    const catalog = useCatalogStore()
    await catalog.loadGames()
    expect(catalog.error).toBe('Boom')
  })

  it('ignore les annulations (AbortError)', async () => {
    mockedFetchGames.mockRejectedValue(new DOMException('aborted', 'AbortError'))
    const catalog = useCatalogStore()
    await catalog.loadGames()
    expect(catalog.error).toBeNull()
  })

  it('ne recharge pas les genres s’ils sont déjà chargés', async () => {
    const genres: Genre[] = [{ id: 1, name: 'RPG', slug: 'rpg' }]
    mockedFetchGenres.mockResolvedValue(genres)
    const catalog = useCatalogStore()
    await catalog.loadGenres()
    await catalog.loadGenres()
    expect(mockedFetchGenres).toHaveBeenCalledTimes(1)
    expect(catalog.genres).toEqual(genres)
  })
})
