import { describe, it, expect } from 'vitest'
import { computeStats } from './stats'
import type { LibraryEntry } from '@/types'

function entry(partial: Partial<LibraryEntry>): LibraryEntry {
  return {
    id: 1,
    slug: 'g',
    name: 'Game',
    background_image: null,
    genres: [],
    status: 'backlog',
    rating: 0,
    comment: '',
    addedAt: 0,
    ...partial,
  }
}

describe('computeStats', () => {
  it('renvoie des agrégats vides pour une liste vide', () => {
    const stats = computeStats([])
    expect(stats.total).toBe(0)
    expect(stats.averageRating).toBe(0)
    expect(stats.byStatus).toEqual({ backlog: 0, playing: 0, done: 0 })
    expect(stats.topRated).toHaveLength(0)
  })

  it('compte les jeux par statut', () => {
    const stats = computeStats([
      entry({ id: 1, status: 'backlog' }),
      entry({ id: 2, status: 'playing' }),
      entry({ id: 3, status: 'done' }),
      entry({ id: 4, status: 'done' }),
    ])
    expect(stats.total).toBe(4)
    expect(stats.byStatus).toEqual({ backlog: 1, playing: 1, done: 2 })
  })

  it("calcule la moyenne uniquement sur les jeux notés", () => {
    const stats = computeStats([
      entry({ id: 1, rating: 4 }),
      entry({ id: 2, rating: 2 }),
      entry({ id: 3, rating: 0 }), // non noté, ignoré
    ])
    expect(stats.averageRating).toBe(3)
  })

  it('agrège et trie la répartition par genre', () => {
    const rpg = { id: 1, name: 'RPG', slug: 'rpg' }
    const action = { id: 2, name: 'Action', slug: 'action' }
    const stats = computeStats([
      entry({ id: 1, genres: [rpg, action] }),
      entry({ id: 2, genres: [rpg] }),
    ])
    expect(stats.genreDistribution[0]).toEqual({ name: 'RPG', count: 2 })
    expect(stats.genreDistribution[1]).toEqual({ name: 'Action', count: 1 })
  })

  it('limite le top N et le trie par note décroissante', () => {
    const entries = Array.from({ length: 7 }, (_, i) =>
      entry({ id: i + 1, rating: i + 1 > 5 ? 5 : i + 1 }),
    )
    const stats = computeStats(entries, 3)
    expect(stats.topRated).toHaveLength(3)
    expect(stats.topRated[0].rating).toBe(5)
  })
})
