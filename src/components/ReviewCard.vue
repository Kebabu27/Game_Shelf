<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useReviewsStore } from '@/stores/reviews'
import { formatDate } from '@/utils/format'
import RatingInput from '@/components/RatingInput.vue'
import type { Review } from '@/types'

const props = defineProps<{ review: Review; showGame?: boolean }>()

const auth = useAuthStore()
const reviews = useReviewsStore()

const isOwner = computed(() => auth.user?.id === props.review.user_id)
const comments = computed(() => props.review.review_comments ?? [])

const commentBody = ref('')
const posting = ref(false)
const showCommentBox = ref(false)

async function postComment(): Promise<void> {
  if (!commentBody.value.trim()) return
  posting.value = true
  try {
    await reviews.addComment(props.review.id, commentBody.value)
    commentBody.value = ''
    showCommentBox.value = false
  } finally {
    posting.value = false
  }
}

function initials(name: string): string {
  return name.slice(0, 2).toUpperCase()
}
</script>

<template>
  <article class="review">
    <header class="review__head">
      <span class="avatar">{{ initials(review.author_name) }}</span>
      <div class="review__who">
        <strong>{{ review.author_name }}</strong>
        <span class="review__meta">
          <template v-if="showGame">
            reviewed
            <RouterLink :to="`/game/${review.game_slug}`" class="review__game">{{
              review.game_name
            }}</RouterLink>
            ·
          </template>
          {{ formatDate(review.created_at) }}
        </span>
      </div>
      <RatingInput :model-value="review.rating" readonly class="review__stars" />
    </header>

    <p class="review__body">{{ review.body }}</p>

    <footer class="review__foot">
      <button v-if="auth.isAuthenticated" class="linkbtn" @click="showCommentBox = !showCommentBox">
        💬 Reply{{ comments.length ? ` (${comments.length})` : '' }}
      </button>
      <span v-else-if="comments.length" class="review__count">💬 {{ comments.length }}</span>
      <button v-if="isOwner" class="linkbtn linkbtn--danger" @click="reviews.deleteReview(review.id)">
        Delete
      </button>
    </footer>

    <!-- Commentaires -->
    <ul v-if="comments.length" class="comments">
      <li v-for="c in comments" :key="c.id" class="comment">
        <span class="avatar avatar--sm">{{ initials(c.author_name) }}</span>
        <div class="comment__bubble">
          <span class="comment__head">
            <strong>{{ c.author_name }}</strong>
            <span class="comment__date">{{ formatDate(c.created_at) }}</span>
            <button
              v-if="auth.user?.id === c.user_id"
              class="linkbtn linkbtn--danger"
              @click="reviews.deleteComment(review.id, c.id)"
            >
              ✕
            </button>
          </span>
          <p>{{ c.body }}</p>
        </div>
      </li>
    </ul>

    <form v-if="showCommentBox" class="replybox" @submit.prevent="postComment">
      <textarea
        v-model="commentBody"
        rows="2"
        placeholder="Write a reply…"
        maxlength="1000"
        required
      />
      <button class="btn btn--sm" type="submit" :disabled="posting || !commentBody.trim()">
        {{ posting ? '…' : 'Post' }}
      </button>
    </form>
  </article>
</template>

<style scoped>
.review {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 0.7rem;
  padding: 1rem;
}
.review__head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.avatar {
  display: grid;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  background: var(--c-accent);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}
.avatar--sm {
  width: 1.7rem;
  height: 1.7rem;
  font-size: 0.65rem;
}
.review__who {
  display: flex;
  flex-direction: column;
  margin-right: auto;
  min-width: 0;
}
.review__meta {
  font-size: 0.78rem;
  color: var(--c-text-muted);
}
.review__game {
  color: var(--c-accent);
  text-decoration: none;
  font-weight: 600;
}
.review__stars {
  flex-shrink: 0;
}
.review__body {
  margin: 0.75rem 0 0.5rem;
  white-space: pre-wrap;
  line-height: 1.5;
}
.review__foot {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.review__count {
  font-size: 0.8rem;
  color: var(--c-text-muted);
}
.linkbtn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  font-size: 0.8rem;
  color: var(--c-text-muted);
}
.linkbtn:hover {
  color: var(--c-accent);
}
.linkbtn--danger:hover {
  color: #dc2626;
}
.comments {
  list-style: none;
  margin: 0.8rem 0 0;
  padding: 0.8rem 0 0;
  border-top: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.comment {
  display: flex;
  gap: 0.5rem;
}
.comment__bubble {
  background: var(--c-bg);
  border-radius: 0.5rem;
  padding: 0.45rem 0.7rem;
  flex: 1;
  min-width: 0;
}
.comment__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--c-text-muted);
}
.comment__bubble p {
  margin: 0.2rem 0 0;
  font-size: 0.9rem;
  white-space: pre-wrap;
}
.replybox {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.7rem;
  align-items: flex-end;
}
.replybox textarea {
  flex: 1;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: 0.45rem;
  color: var(--c-text);
  padding: 0.5rem;
  font: inherit;
  resize: vertical;
}
.btn--sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}
</style>
