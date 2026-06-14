import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type { Game, Review, ReviewComment } from '@/types'

const REVIEWS = 'reviews'
const COMMENTS = 'review_comments'
// On récupère l'avis et ses commentaires en une seule requête (jointure RLS).
const SELECT = '*, review_comments(*)'

export const useReviewsStore = defineStore('reviews', () => {
  const auth = useAuthStore()
  const items = ref<Review[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function sortComments(): void {
    for (const r of items.value) {
      r.review_comments?.sort((a, b) => a.created_at.localeCompare(b.created_at))
    }
  }

  /** Avis d'un jeu précis (page détail). */
  async function fetchForGame(gameId: number): Promise<void> {
    if (!supabase) {
      items.value = []
      return
    }
    loading.value = true
    error.value = null
    const { data, error: e } = await supabase
      .from(REVIEWS)
      .select(SELECT)
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })
    if (e) error.value = e.message
    items.value = (data as Review[] | null) ?? []
    sortComments()
    loading.value = false
  }

  /** Derniers avis tous jeux confondus (fil communautaire). */
  async function fetchLatest(limit = 30): Promise<void> {
    if (!supabase) {
      items.value = []
      return
    }
    loading.value = true
    error.value = null
    const { data, error: e } = await supabase
      .from(REVIEWS)
      .select(SELECT)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (e) error.value = e.message
    items.value = (data as Review[] | null) ?? []
    sortComments()
    loading.value = false
  }

  /** Publie (ou met à jour) son avis sur un jeu. */
  async function submitReview(game: Game, rating: number, body: string): Promise<void> {
    if (!supabase) throw new Error('Reviews are not available.')
    const userId = auth.user?.id
    if (!userId) throw new Error('You must be signed in.')
    const { error: e } = await supabase.from(REVIEWS).upsert(
      {
        user_id: userId,
        author_name: auth.displayName,
        game_id: game.id,
        game_slug: game.slug,
        game_name: game.name,
        rating,
        body: body.trim(),
      },
      { onConflict: 'user_id,game_id' },
    )
    if (e) throw new Error(e.message)
    await fetchForGame(game.id)
  }

  async function deleteReview(id: string): Promise<void> {
    if (!supabase) return
    const { error: e } = await supabase.from(REVIEWS).delete().eq('id', id)
    if (e) throw new Error(e.message)
    items.value = items.value.filter((r) => r.id !== id)
  }

  async function addComment(reviewId: string, body: string): Promise<void> {
    if (!supabase) throw new Error('Comments are not available.')
    const userId = auth.user?.id
    if (!userId) throw new Error('You must be signed in.')
    const { data, error: e } = await supabase
      .from(COMMENTS)
      .insert({ review_id: reviewId, user_id: userId, author_name: auth.displayName, body: body.trim() })
      .select()
      .single()
    if (e) throw new Error(e.message)
    const review = items.value.find((r) => r.id === reviewId)
    if (review && data) {
      review.review_comments = [...(review.review_comments ?? []), data as ReviewComment]
    }
  }

  async function deleteComment(reviewId: string, commentId: string): Promise<void> {
    if (!supabase) return
    const { error: e } = await supabase.from(COMMENTS).delete().eq('id', commentId)
    if (e) throw new Error(e.message)
    const review = items.value.find((r) => r.id === reviewId)
    if (review) {
      review.review_comments = review.review_comments?.filter((c) => c.id !== commentId)
    }
  }

  return {
    items,
    loading,
    error,
    fetchForGame,
    fetchLatest,
    submitReview,
    deleteReview,
    addComment,
    deleteComment,
  }
})
