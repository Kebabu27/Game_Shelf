import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('reprend la valeur initiale de la source', () => {
    const source = ref('a')
    const debounced = useDebounce(source, 300)
    expect(debounced.value).toBe('a')
  })

  it('ne met à jour la valeur qu’après le délai', async () => {
    const source = ref('a')
    const debounced = useDebounce(source, 300)

    source.value = 'b'
    await nextTick()
    expect(debounced.value).toBe('a') // pas encore propagé

    vi.advanceTimersByTime(300)
    expect(debounced.value).toBe('b')
  })

  it('réinitialise le minuteur à chaque frappe (seule la dernière compte)', async () => {
    const source = ref('')
    const debounced = useDebounce(source, 300)

    source.value = 'z'
    await nextTick()
    vi.advanceTimersByTime(200)

    source.value = 'ze'
    await nextTick()
    vi.advanceTimersByTime(200)
    expect(debounced.value).toBe('') // le 1er timer a été annulé

    vi.advanceTimersByTime(100)
    expect(debounced.value).toBe('ze')
  })
})
