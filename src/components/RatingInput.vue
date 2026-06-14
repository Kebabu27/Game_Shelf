<script setup lang="ts">
/**
 * Notation par étoiles avec liaison bidirectionnelle personnalisée.
 * Se branche comme un input natif : <RatingInput v-model="note" />
 */
const model = defineModel<number>({ default: 0 })

const props = withDefaults(defineProps<{ max?: number; readonly?: boolean }>(), {
  max: 5,
  readonly: false,
})

function select(value: number): void {
  if (props.readonly) return
  // Cliquer la note déjà active la remet à zéro.
  model.value = model.value === value ? 0 : value
}
</script>

<template>
  <div class="rating" :class="{ 'rating--readonly': readonly }" role="radiogroup">
    <button
      v-for="star in max"
      :key="star"
      type="button"
      class="rating__star"
      :class="{ 'rating__star--active': star <= model }"
      :aria-label="`${star} star${star > 1 ? 's' : ''}`"
      :aria-checked="star === model"
      role="radio"
      :disabled="readonly"
      @click="select(star)"
    >
      ★
    </button>
  </div>
</template>

<style scoped>
.rating {
  display: inline-flex;
  gap: 0.15rem;
}
.rating__star {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.4rem;
  line-height: 1;
  color: var(--c-star-empty);
  padding: 0;
  transition: color 0.15s ease;
}
.rating__star--active {
  color: var(--c-star);
}
.rating:not(.rating--readonly) .rating__star:hover {
  color: var(--c-star);
}
.rating--readonly .rating__star {
  cursor: default;
}
</style>
