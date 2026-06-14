import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { Game, Review } from '@/types'

// État mutable piloté par chaque test pour simuler les réponses Supabase.
const state: {
  selectResult: { data: unknown; error: unknown }
  singleResult: { data: unknown; error: unknown }
  mutationError: unknown
  calls: Array<{ table: string; op: string; payload?: unknown; conflict?: unknown }>
} = {
  selectResult: { data: [], error: null },
  singleResult: { data: null, error: null },
  mutationError: null,
  calls: [],
}

// Faux query builder : chaînable ET « thenable », comme supabase-js.
function makeBuilder(table: string) {
  let op = 'select'
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(state.singleResult)),
    insert: vi.fn((payload: unknown) => {
      op = 'insert'
      state.calls.push({ table, op, payload })
      return builder
    }),
    upsert: vi.fn((payload: unknown, opts?: { onConflict?: string }) => {
      op = 'upsert'
      state.calls.push({ table, op, payload, conflict: opts?.onConflict })
      return builder
    }),
    delete: vi.fn(() => {
      op = 'delete'
      state.calls.push({ table, op })
      return builder
    }),
    then: (resolve: (v: unknown) => void) => {
      if (op === 'select') resolve(state.selectResult)
      else resolve({ error: state.mutationError })
    },
  }
  return builder
}

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: { from: vi.fn((table: string) => makeBuilder(table)) },
}))

import { useReviewsStore } from './reviews'
import { useAuthStore } from './auth'

const GAME: Game = {
  id: 42,
  slug: 'doom',
  name: 'DOOM',
  released: null,
  background_image: null,
  rating: 0,
  metacritic: null,
  genres: [],
  platforms: [],
}

function makeReview(overrides: Partial<Review> = {}): Review {
  return {
    id: 'r1',
    user_id: 'u1',
    author_name: 'Alice',
    game_id: 42,
    game_slug: 'doom',
    game_name: 'DOOM',
    rating: 5,
    body: 'top',
    created_at: '2026-01-01',
    review_comments: [],
    ...overrides,
  }
}

function signIn() {
  const auth = useAuthStore()
  auth.user = {
    id: 'u1',
    email: 'alice@x.com',
    user_metadata: { display_name: 'Alice' },
  } as never
  return auth
}

describe('useReviewsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    state.selectResult = { data: [], error: null }
    state.singleResult = { data: null, error: null }
    state.mutationError = null
    state.calls = []
  })

  it('fetchForGame charge les avis et trie les commentaires par date', async () => {
    state.selectResult = {
      data: [
        makeReview({
          review_comments: [
            { id: 'c2', review_id: 'r1', user_id: 'u2', author_name: 'Bob', body: 'b', created_at: '2026-02-02' },
            { id: 'c1', review_id: 'r1', user_id: 'u3', author_name: 'Cara', body: 'a', created_at: '2026-01-15' },
          ],
        }),
      ],
      error: null,
    }
    const reviews = useReviewsStore()
    await reviews.fetchForGame(42)
    expect(reviews.items).toHaveLength(1)
    expect(reviews.items[0].review_comments?.map((c) => c.id)).toEqual(['c1', 'c2'])
  })

  it('fetchLatest remplit la liste', async () => {
    state.selectResult = { data: [makeReview()], error: null }
    const reviews = useReviewsStore()
    await reviews.fetchLatest(10)
    expect(reviews.items).toHaveLength(1)
  })

  it('submitReview échoue si non connecté', async () => {
    const reviews = useReviewsStore()
    await expect(reviews.submitReview(GAME, 4, 'hello')).rejects.toThrow()
  })

  it('submitReview envoie un upsert avec le pseudo public et nettoie le texte', async () => {
    signIn()
    const reviews = useReviewsStore()
    await reviews.submitReview(GAME, 4, '  great  ')
    const upsert = state.calls.find((c) => c.op === 'upsert')
    expect(upsert?.payload).toMatchObject({
      user_id: 'u1',
      author_name: 'Alice',
      game_id: 42,
      rating: 4,
      body: 'great',
    })
    expect(upsert?.conflict).toBe('user_id,game_id')
  })

  it("deleteReview retire l'avis de la liste", async () => {
    state.selectResult = { data: [makeReview()], error: null }
    const reviews = useReviewsStore()
    await reviews.fetchForGame(42)
    expect(reviews.items).toHaveLength(1)
    await reviews.deleteReview('r1')
    expect(reviews.items).toHaveLength(0)
  })

  it("addComment ajoute le commentaire à l'avis ciblé", async () => {
    state.selectResult = { data: [makeReview()], error: null }
    const reviews = useReviewsStore()
    await reviews.fetchForGame(42)
    signIn()
    state.singleResult = {
      data: { id: 'c1', review_id: 'r1', user_id: 'u1', author_name: 'Alice', body: 'nice', created_at: '2026-03-03' },
      error: null,
    }
    await reviews.addComment('r1', 'nice')
    expect(reviews.items[0].review_comments).toHaveLength(1)
    expect(reviews.items[0].review_comments?.[0].body).toBe('nice')
  })

  it('deleteComment retire le commentaire', async () => {
    state.selectResult = {
      data: [
        makeReview({
          review_comments: [
            { id: 'c1', review_id: 'r1', user_id: 'u1', author_name: 'Alice', body: 'x', created_at: '2026-01-02' },
          ],
        }),
      ],
      error: null,
    }
    const reviews = useReviewsStore()
    await reviews.fetchForGame(42)
    await reviews.deleteComment('r1', 'c1')
    expect(reviews.items[0].review_comments).toHaveLength(0)
  })
})
