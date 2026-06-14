<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLibraryStore } from '@/stores/library'
import { useAuthStore } from '@/stores/auth'
import RatingInput from '@/components/RatingInput.vue'
import BaseModal from '@/components/BaseModal.vue'
import type { GameStatus, LibraryEntry } from '@/types'

const library = useLibraryStore()
const auth = useAuthStore()
const needsAuth = computed(() => auth.enabled && !auth.isAuthenticated)
const { entries } = storeToRefs(library)

const filter = ref<GameStatus | 'all'>('all')
const filters: { value: GameStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'backlog', label: 'Backlog' },
  { value: 'playing', label: 'Playing' },
  { value: 'done', label: 'Completed' },
]

const visible = computed(() =>
  filter.value === 'all'
    ? entries.value
    : entries.value.filter((e) => e.status === filter.value),
)

// Édition rapide via la modale (Teleport).
const editing = ref<LibraryEntry | null>(null)
const modalOpen = ref(false)

function openEdit(entry: LibraryEntry): void {
  editing.value = entry
  modalOpen.value = true
}
</script>

<template>
  <div class="container">
    <h1>My library</h1>

    <p v-if="needsAuth" class="state">
      <RouterLink to="/login">Sign in</RouterLink> to build your library, rate games and take
      notes — synced across all your devices.
    </p>

    <p v-else-if="library.isEmpty" class="state">
      Your library is empty.
      <RouterLink to="/">Browse the catalog</RouterLink> to add games.
    </p>

    <template v-else>
      <div class="tabs">
        <button
          v-for="f in filters"
          :key="f.value"
          class="tab"
          :class="{ 'tab--active': filter === f.value }"
          @click="filter = f.value"
        >
          {{ f.label }}
        </button>
      </div>

      <ul class="list">
        <li v-for="entry in visible" :key="entry.id" class="row">
          <img
            v-if="entry.background_image"
            :src="entry.background_image"
            :alt="entry.name"
            class="row__img"
          />
          <div class="row__info">
            <RouterLink :to="`/game/${entry.slug}`" class="row__name">{{ entry.name }}</RouterLink>
            <RatingInput :model-value="entry.rating" readonly />
          </div>
          <div class="row__actions">
            <button class="btn btn--ghost" @click="openEdit(entry)">Edit</button>
            <button class="btn btn--ghost" @click="library.remove(entry.id)">Remove</button>
          </div>
        </li>
      </ul>
    </template>

    <BaseModal v-model:open="modalOpen" :title="editing?.name">
      <template v-if="editing">
        <label class="field">
          <span>Status</span>
          <select
            :value="editing.status"
            @change="library.update(editing.id, { status: ($event.target as HTMLSelectElement).value as GameStatus })"
          >
            <option value="backlog">Backlog</option>
            <option value="playing">Playing</option>
            <option value="done">Completed</option>
          </select>
        </label>
        <label class="field">
          <span>Rating</span>
          <RatingInput
            :model-value="editing.rating"
            @update:model-value="library.update(editing!.id, { rating: $event })"
          />
        </label>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0 1.5rem;
  flex-wrap: wrap;
}
.tab {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  cursor: pointer;
  color: var(--c-text-muted);
}
.tab--active {
  border-color: var(--c-accent);
  color: var(--c-accent);
}
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.row {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 0.6rem;
  padding: 0.6rem;
}
.row__img {
  width: 80px;
  height: 50px;
  object-fit: cover;
  border-radius: 0.35rem;
}
.row__info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-right: auto;
}
.row__name {
  font-weight: 600;
  text-decoration: none;
  color: var(--c-text);
}
.row__actions {
  display: flex;
  gap: 0.4rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: var(--c-text-muted);
}
.field select,
.field textarea {
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: 0.4rem;
  color: var(--c-text);
  padding: 0.5rem;
  font: inherit;
}
.state {
  padding: 2rem 0;
  color: var(--c-text-muted);
}
</style>
