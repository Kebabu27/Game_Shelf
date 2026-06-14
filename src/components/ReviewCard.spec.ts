import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

// Pas de vrai client : les actions réseau sont des no-op dans ce test.
vi.mock('@/lib/supabase', () => ({ supabase: null, isSupabaseConfigured: true }))

import ReviewCard from './ReviewCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useReviewsStore } from '@/stores/reviews'
import type { Review } from '@/types'

function makeReview(overrides: Partial<Review> = {}): Review {
  return {
    id: 'r1',
    user_id: 'owner',
    author_name: 'Alice',
    game_id: 1,
    game_slug: 'doom',
    game_name: 'DOOM',
    rating: 4,
    body: 'Great game',
    created_at: '2026-01-01',
    review_comments: [
      { id: 'c1', review_id: 'r1', user_id: 'u2', author_name: 'Bob', body: 'agreed', created_at: '2026-01-02' },
    ],
    ...overrides,
  }
}

function mountCard(review: Review) {
  return mount(ReviewCard, {
    props: { review },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('ReviewCard', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('affiche auteur, texte, note et commentaires', () => {
    const wrapper = mountCard(makeReview())
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Great game')
    expect(wrapper.findAll('.rating__star--active')).toHaveLength(4)
    expect(wrapper.findAll('.comment')).toHaveLength(1)
    expect(wrapper.text()).toContain('Bob')
  })

  it("affiche Delete pour l'auteur, le masque pour les autres", () => {
    const auth = useAuthStore()
    auth.user = { id: 'owner' } as never
    const ownerView = mountCard(makeReview())
    expect(ownerView.findAll('button').some((b) => b.text() === 'Delete')).toBe(true)

    setActivePinia(createPinia())
    const other = useAuthStore()
    other.user = { id: 'someone-else' } as never
    const otherView = mountCard(makeReview())
    expect(otherView.findAll('button').some((b) => b.text() === 'Delete')).toBe(false)
  })

  it('appelle deleteReview au clic sur Delete', async () => {
    const auth = useAuthStore()
    auth.user = { id: 'owner' } as never
    const reviews = useReviewsStore()
    const spy = vi.spyOn(reviews, 'deleteReview').mockResolvedValue()
    const wrapper = mountCard(makeReview())
    const del = wrapper.findAll('button').find((b) => b.text() === 'Delete')
    await del?.trigger('click')
    expect(spy).toHaveBeenCalledWith('r1')
  })

  it('bascule la zone de réponse pour un utilisateur connecté', async () => {
    const auth = useAuthStore()
    auth.user = { id: 'u2' } as never
    const wrapper = mountCard(makeReview())
    expect(wrapper.find('textarea').exists()).toBe(false)
    const reply = wrapper.findAll('button').find((b) => b.text().includes('Reply'))
    await reply?.trigger('click')
    expect(wrapper.find('textarea').exists()).toBe(true)
  })
})
