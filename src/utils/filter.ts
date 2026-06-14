import type { Game } from '@/types'

// Idéogrammes Han (chinois, incl. variantes) + Hangul (coréen).
const CJK_KO_REGEX =
  /[㐀-䶿一-鿿豈-﫿가-힯ᄀ-ᇿ㄰-㆏]/

/** Détecte un titre contenant des caractères chinois ou coréens. */
export function hasChineseOrKorean(name: string): boolean {
  return CJK_KO_REGEX.test(name)
}

/**
 * Heuristique de qualité pour écarter le « spam » du catalogue :
 * - jeux sans image (souvent du shovelware) ;
 * - jeux au titre chinois / coréen (hors périmètre voulu).
 */
export function isQualityGame(game: Pick<Game, 'name' | 'background_image'>): boolean {
  if (!game.background_image) return false
  if (hasChineseOrKorean(game.name)) return false
  return true
}

/** Filtre une liste de jeux selon l'heuristique de qualité. */
export function filterGames(games: Game[]): Game[] {
  return games.filter(isQualityGame)
}
