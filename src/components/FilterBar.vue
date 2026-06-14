<script setup lang="ts">
import type { Genre } from '@/types'

defineProps<{
  genres: Genre[]
  platforms: Genre[]
  selectedGenre: string | null
  selectedPlatform: number | null
  selectedMetacritic: string | null
  ordering: string
}>()

const emit = defineEmits<{
  'update:genre': [value: string | null]
  'update:platform': [value: number | null]
  'update:metacritic': [value: string | null]
  'update:ordering': [value: string]
}>()

const orderings = [
  { value: '-added', label: 'Trending' },
  { value: '-rating', label: 'Top rated' },
  { value: '-released', label: 'Newest' },
  { value: 'name', label: 'Name (A→Z)' },
  { value: '-metacritic', label: 'Metacritic' },
]

const metacriticRanges = [
  { value: '', label: 'Any score' },
  { value: '90,100', label: '90+ Masterpiece' },
  { value: '80,100', label: '80+ Great' },
  { value: '70,100', label: '70+ Good' },
]
</script>

<template>
  <div class="filters">
    <label class="filters__field">
      <span>Genre</span>
      <select
        :value="selectedGenre ?? ''"
        @change="emit('update:genre', ($event.target as HTMLSelectElement).value || null)"
      >
        <option value="">All</option>
        <option v-for="genre in genres" :key="genre.id" :value="genre.slug">
          {{ genre.name }}
        </option>
      </select>
    </label>

    <label class="filters__field">
      <span>Platform</span>
      <select
        :value="selectedPlatform ?? ''"
        @change="emit('update:platform', Number(($event.target as HTMLSelectElement).value) || null)"
      >
        <option value="">All</option>
        <option v-for="p in platforms" :key="p.id" :value="p.id">
          {{ p.name }}
        </option>
      </select>
    </label>

    <label class="filters__field">
      <span>Metacritic</span>
      <select
        :value="selectedMetacritic ?? ''"
        @change="emit('update:metacritic', ($event.target as HTMLSelectElement).value || null)"
      >
        <option v-for="r in metacriticRanges" :key="r.value" :value="r.value">
          {{ r.label }}
        </option>
      </select>
    </label>

    <label class="filters__field">
      <span>Sort by</span>
      <select
        :value="ordering"
        @change="emit('update:ordering', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="opt in orderings" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </label>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.filters__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--c-text-muted);
}
.filters__field select {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 0.4rem;
  color: var(--c-text);
  padding: 0.45rem 0.6rem;
  font-size: 0.9rem;
}
</style>
