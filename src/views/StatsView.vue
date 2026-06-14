<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLibraryStore } from '@/stores/library'
import StatWidget from '@/components/StatWidget.vue'

const library = useLibraryStore()
// Agrégats réactifs : recalculés dès qu'un jeu change.
const { stats } = storeToRefs(library)

const maxGenre = () => Math.max(1, ...stats.value.genreDistribution.map((g) => g.count))
</script>

<template>
  <div class="container">
    <h1>Stats</h1>

    <div class="grid">
      <StatWidget label="Total games" :value="stats.total" accent />
      <StatWidget label="Backlog" :value="stats.byStatus.backlog" />
      <StatWidget label="Playing" :value="stats.byStatus.playing" />
      <StatWidget label="Completed" :value="stats.byStatus.done" />
      <StatWidget label="Average rating" :value="stats.averageRating || '—'" />
    </div>

    <section class="block">
      <h2>Genre breakdown</h2>
      <ul class="bars">
        <li v-for="g in stats.genreDistribution" :key="g.name" class="bar">
          <span class="bar__label">{{ g.name }}</span>
          <span class="bar__track">
            <span class="bar__fill" :style="{ width: `${(g.count / maxGenre()) * 100}%` }" />
          </span>
          <span class="bar__count">{{ g.count }}</span>
        </li>
      </ul>
    </section>

    <section v-if="stats.topRated.length" class="block">
      <h2>Top {{ stats.topRated.length }} — best rated</h2>
      <ol class="top">
        <li v-for="entry in stats.topRated" :key="entry.id">
          {{ entry.name }} <strong>{{ entry.rating }}★</strong>
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped>
.block {
  margin-top: 2rem;
}
.bars {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.bar {
  display: grid;
  grid-template-columns: 140px 1fr 40px;
  align-items: center;
  gap: 0.75rem;
}
.bar__label {
  font-size: 0.85rem;
}
.bar__track {
  background: var(--c-border);
  border-radius: 999px;
  height: 0.6rem;
  overflow: hidden;
}
.bar__fill {
  display: block;
  height: 100%;
  background: var(--c-accent);
  transition: width 0.3s ease;
}
.bar__count {
  text-align: right;
  font-size: 0.85rem;
  color: var(--c-text-muted);
}
.top {
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
</style>
