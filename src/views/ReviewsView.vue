<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useReviewsStore } from '@/stores/reviews'
import { useAuthStore } from '@/stores/auth'
import ReviewCard from '@/components/ReviewCard.vue'

const reviews = useReviewsStore()
const auth = useAuthStore()
const { items, loading } = storeToRefs(reviews)

onMounted(() => reviews.fetchLatest(40))
</script>

<template>
  <div class="container">
    <h1>Community reviews</h1>
    <p class="sub">The latest player reviews across the whole catalog.</p>

    <p v-if="!auth.enabled" class="state">Reviews aren't available on this deployment.</p>
    <p v-else-if="loading" class="state">Loading reviews…</p>
    <p v-else-if="!items.length" class="state">
      No reviews yet. Open a game and be the first to write one!
    </p>
    <div v-else class="feed">
      <ReviewCard v-for="r in items" :key="r.id" :review="r" show-game />
    </div>
  </div>
</template>

<style scoped>
.sub {
  color: var(--c-text-muted);
  margin-top: -0.5rem;
}
.feed {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  max-width: 720px;
}
.state {
  color: var(--c-text-muted);
  padding: 1.5rem 0;
}
</style>
