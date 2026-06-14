import type { GameStatus, LibraryEntry } from '@/types'

export interface LibraryStats {
  total: number
  byStatus: Record<GameStatus, number>
  averageRating: number
  genreDistribution: { name: string; count: number }[]
  topRated: LibraryEntry[]
}

/**
 * Agrège une bibliothèque personnelle en statistiques dérivées :
 * totaux par statut, note moyenne (sur les jeux notés), répartition
 * par genre et top N des mieux notés.
 *
 * Fonction pure : sans effet de bord, facilement testable.
 */
export function computeStats(entries: LibraryEntry[], topN = 5): LibraryStats {
  const byStatus: Record<GameStatus, number> = { backlog: 0, playing: 0, done: 0 }
  const genreCounts = new Map<string, number>()
  let ratingSum = 0
  let ratedCount = 0

  for (const entry of entries) {
    byStatus[entry.status]++

    if (entry.rating > 0) {
      ratingSum += entry.rating
      ratedCount++
    }

    for (const genre of entry.genres) {
      genreCounts.set(genre.name, (genreCounts.get(genre.name) ?? 0) + 1)
    }
  }

  const genreDistribution = [...genreCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const topRated = [...entries]
    .filter((e) => e.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, topN)

  return {
    total: entries.length,
    byStatus,
    averageRating: ratedCount > 0 ? Math.round((ratingSum / ratedCount) * 10) / 10 : 0,
    genreDistribution,
    topRated,
  }
}
