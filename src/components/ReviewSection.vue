<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useReviewsStore } from '@/stores/reviews'
import RatingInput from '@/components/RatingInput.vue'
import ReviewCard from '@/components/ReviewCard.vue'
import type { Game } from '@/types'

const props = defineProps<{ game: Game }>()

const auth = useAuthStore()
const reviews = useReviewsStore()

const rating = ref(0)
const body = ref('')
const submitting = ref(false)
const formError = ref<string | null>(null)

// L'avis de l'utilisateur courant, s'il existe déjà.
const myReview = computed(() =>
  reviews.items.find((r) => r.user_id === auth.user?.id),
)

// Recharge les avis dès que le jeu change, puis pré-remplit le formulaire.
watch(
  () => props.game.id,
  (id) => {
    if (id) reviews.fetchForGame(id)
  },
  { immediate: true },
)

watch(myReview, (mine) => {
  rating.value = mine?.rating ?? 0
  body.value = mine?.body ?? ''
})

async function submit(): Promise<void> {
  formError.value = null
  if (rating.value < 1) {
    formError.value = 'Please pick a rating.'
    return
  }
  if (!body.value.trim()) {
    formError.value = 'Please write a few words.'
    return
  }
  submitting.value = true
  try {
    await reviews.submitReview(props.game, rating.value, body.value)
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Could not post your review.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="block">
    <h2>Community reviews</h2>

    <!-- Écriture (connecté uniquement) -->
    <form v-if="auth.isAuthenticated" class="writer" @submit.prevent="submit">
      <p class="writer__title">{{ myReview ? 'Edit your review' : 'Write a review' }}</p>
      <RatingInput v-model="rating" />
      <textarea
        v-model="body"
        rows="3"
        maxlength="2000"
        placeholder="Share what you think about this game…"
      />
      <p v-if="formError" class="writer__error">{{ formError }}</p>
      <button class="btn" type="submit" :disabled="submitting">
        {{ submitting ? 'Posting…' : myReview ? 'Update review' : 'Post review' }}
      </button>
    </form>
    <p v-else-if="auth.enabled" class="signin-cta">
      <RouterLink to="/login">Sign in</RouterLink> to share your review and reply to others.
    </p>

    <!-- Liste -->
    <p v-if="reviews.loading" class="state">Loading reviews…</p>
    <p v-else-if="!reviews.items.length" class="state">
      No reviews yet. Be the first to share your thoughts!
    </p>
    <div v-else class="list">
      <ReviewCard v-for="r in reviews.items" :key="r.id" :review="r" />
    </div>
  </section>
</template>

<style scoped>
.writer {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 0.7rem;
  padding: 1rem;
  margin-bottom: 1.2rem;
}
.writer__title {
  margin: 0;
  font-weight: 600;
}
.writer textarea {
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: 0.45rem;
  color: var(--c-text);
  padding: 0.6rem;
  font: inherit;
  resize: vertical;
}
.writer__error {
  margin: 0;
  font-size: 0.85rem;
  color: #dc2626;
}
.btn {
  align-self: flex-start;
}
.signin-cta {
  color: var(--c-text-muted);
  margin-bottom: 1.2rem;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.state {
  color: var(--c-text-muted);
  padding: 0.5rem 0;
}
</style>
