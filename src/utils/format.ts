// RAWG concatène parfois la description dans plusieurs langues, séparées
// par une ligne ne contenant que le nom de la langue.
const LANGUAGE_MARKERS = new Set([
  'Español',
  'Deutsch',
  'Français',
  'Italiano',
  'Polski',
  'Português',
  'Русский',
  '日本語',
  '한국어',
  '中文',
])

/**
 * Découpe une description brute en paragraphes propres et s'arrête à la
 * première section dans une autre langue (RAWG duplique le texte traduit).
 */
export function toParagraphs(text: string | undefined): string[] {
  if (!text) return []
  const result: string[] = []
  for (const raw of text.split(/\n+/)) {
    const p = raw.trim()
    if (!p) continue
    if (LANGUAGE_MARKERS.has(p)) break
    result.push(p)
  }
  return result
}

/** Normalise une couleur RAWG (hex sans #) en couleur CSS valide. */
export function toHex(color: string | undefined, fallback = '#6d28d9'): string {
  if (!color) return fallback
  const clean = color.replace(/^#/, '')
  return /^[0-9a-fA-F]{6}$/.test(clean) ? `#${clean}` : fallback
}

/** Convertit un hex en composantes RGB (pour les dégradés rgba). */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = toHex(hex).slice(1)
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

/** Classe de couleur d'un score Metacritic (vert / orange / rouge). */
export function metacriticTone(score: number | null): 'high' | 'mid' | 'low' | null {
  if (score == null) return null
  if (score >= 75) return 'high'
  if (score >= 50) return 'mid'
  return 'low'
}

/** Formate une date ISO en libellé court et lisible (ex. « Jun 14, 2026 »). */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** Renvoie une couleur de texte lisible (noir/blanc) sur un fond donné. */
export function readableOn(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  // Luminance perçue (recommandation W3C).
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#1a1c22' : '#ffffff'
}
