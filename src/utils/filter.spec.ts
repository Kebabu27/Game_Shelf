import { describe, it, expect } from 'vitest'
import { hasChineseOrKorean, isQualityGame, filterGames } from './filter'
import type { Game } from '@/types'

function game(partial: Partial<Game>): Game {
  return {
    id: 1,
    slug: 'g',
    name: 'Game',
    released: null,
    background_image: 'https://img/x.jpg',
    rating: 0,
    metacritic: null,
    genres: [],
    platforms: [],
    ...partial,
  }
}

describe('hasChineseOrKorean', () => {
  it('détecte un titre chinois', () => {
    expect(hasChineseOrKorean('原神')).toBe(true)
  })

  it('détecte un titre coréen', () => {
    expect(hasChineseOrKorean('배틀그라운드')).toBe(true)
  })

  it('laisse passer un titre latin', () => {
    expect(hasChineseOrKorean('The Witcher 3')).toBe(false)
  })
})

describe('isQualityGame', () => {
  it('écarte un jeu sans image', () => {
    expect(isQualityGame({ name: 'Foo', background_image: null })).toBe(false)
  })

  it('écarte un jeu chinois ou coréen', () => {
    expect(isQualityGame({ name: '王者荣耀', background_image: 'x.jpg' })).toBe(false)
  })

  it('garde un jeu latin avec image', () => {
    expect(isQualityGame({ name: 'Portal 2', background_image: 'x.jpg' })).toBe(true)
  })
})

describe('filterGames', () => {
  it('ne conserve que les jeux valides', () => {
    const list = [
      game({ id: 1, name: 'Portal 2' }),
      game({ id: 2, name: '原神' }),
      game({ id: 3, name: 'No Image', background_image: null }),
    ]
    expect(filterGames(list).map((g) => g.id)).toEqual([1])
  })
})
