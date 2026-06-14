import { describe, it, expect } from 'vitest'
import { toParagraphs, toHex, hexToRgb, readableOn } from './format'

describe('toParagraphs', () => {
  it('renvoie un tableau vide pour une entrée vide', () => {
    expect(toParagraphs(undefined)).toEqual([])
    expect(toParagraphs('')).toEqual([])
  })

  it('découpe le texte en paragraphes en ignorant les lignes vides', () => {
    expect(toParagraphs('Intro\n\nMilieu\n\n\nFin')).toEqual(['Intro', 'Milieu', 'Fin'])
  })

  it("s'arrête à la première section dans une autre langue", () => {
    expect(toParagraphs('English text\n\nEspañol\n\nTexto en español')).toEqual(['English text'])
  })
})

describe('toHex', () => {
  it('préfixe une couleur RAWG valide avec #', () => {
    expect(toHex('0f0f0f')).toBe('#0f0f0f')
  })

  it('retombe sur la valeur par défaut si invalide', () => {
    expect(toHex(undefined)).toBe('#6d28d9')
    expect(toHex('xyz')).toBe('#6d28d9')
  })
})

describe('hexToRgb', () => {
  it('convertit un hex en composantes RGB', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('000000')).toEqual({ r: 0, g: 0, b: 0 })
  })
})

describe('readableOn', () => {
  it('renvoie du texte foncé sur fond clair', () => {
    expect(readableOn('#ffffff')).toBe('#1a1c22')
  })

  it('renvoie du texte clair sur fond foncé', () => {
    expect(readableOn('#000000')).toBe('#ffffff')
  })
})
