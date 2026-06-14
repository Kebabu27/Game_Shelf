import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useLibraryStore } from './library'
import type { Game } from '@/types'

function makeGame(id: number, name = `Game ${id}`): Game {
  return {
    id,
    slug: `game-${id}`,
    name,
    released: '2020-01-01',
    background_image: null,
    rating: 4,
    metacritic: 80,
    genres: [{ id: 1, name: 'RPG', slug: 'rpg' }],
    platforms: [],
  }
}

describe('useLibraryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('démarre vide', () => {
    const lib = useLibraryStore()
    expect(lib.isEmpty).toBe(true)
    expect(lib.entries).toHaveLength(0)
  })

  it('ajoute un jeu et le reflète via has()', () => {
    const lib = useLibraryStore()
    lib.add(makeGame(1))
    expect(lib.has(1)).toBe(true)
    expect(lib.isEmpty).toBe(false)
    expect(lib.entries[0].status).toBe('backlog')
  })

  it("n'ajoute pas deux fois le même jeu", () => {
    const lib = useLibraryStore()
    lib.add(makeGame(1))
    lib.add(makeGame(1))
    expect(lib.entries).toHaveLength(1)
  })

  it('toggle ajoute puis retire', () => {
    const lib = useLibraryStore()
    const game = makeGame(2)
    lib.toggle(game)
    expect(lib.has(2)).toBe(true)
    lib.toggle(game)
    expect(lib.has(2)).toBe(false)
  })

  it('met à jour la note, le statut et le commentaire', () => {
    const lib = useLibraryStore()
    lib.add(makeGame(3))
    lib.update(3, { rating: 5, status: 'done', comment: 'Excellent' })
    const entry = lib.get(3)
    expect(entry?.rating).toBe(5)
    expect(entry?.status).toBe('done')
    expect(entry?.comment).toBe('Excellent')
  })

  it('expose des statistiques dérivées réactives', () => {
    const lib = useLibraryStore()
    lib.add(makeGame(1))
    lib.add(makeGame(2))
    lib.update(1, { rating: 4 })
    lib.update(2, { rating: 2 })
    expect(lib.stats.total).toBe(2)
    expect(lib.stats.averageRating).toBe(3)
  })

  it('persiste dans localStorage', async () => {
    const lib = useLibraryStore()
    lib.add(makeGame(9))
    await nextTick() // le watcher de persistance se déclenche au flush
    const stored = JSON.parse(localStorage.getItem('gameshelf:library') ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].id).toBe(9)
  })
})
