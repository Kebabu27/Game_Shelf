<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounce } from '@/composables/useDebounce'

const props = withDefaults(
  defineProps<{ placeholder?: string; delay?: number }>(),
  { placeholder: 'Search for a game…', delay: 400 },
)

const emit = defineEmits<{ search: [value: string] }>()

const input = ref('')
const debounced = useDebounce(input, props.delay)

// La recherche ne se déclenche qu'après la pause de frappe (debounce).
watch(debounced, (value) => emit('search', value.trim()))

function clear(): void {
  input.value = ''
}
</script>

<template>
  <div class="search">
    <span class="search__icon" aria-hidden="true">🔍</span>
    <input
      v-model="input"
      type="search"
      class="search__input"
      :placeholder="placeholder"
      aria-label="Search for a game"
    />
    <button v-if="input" type="button" class="search__clear" aria-label="Clear" @click="clear">
      ✕
    </button>
  </div>
</template>

<style scoped>
.search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 0.5rem;
  padding: 0 0.6rem;
}
.search:focus-within {
  border-color: var(--c-accent);
}
.search__input {
  flex: 1;
  border: none;
  background: none;
  color: var(--c-text);
  padding: 0.6rem 0;
  font-size: 0.95rem;
  outline: none;
}
.search__clear {
  background: none;
  border: none;
  color: var(--c-text-muted);
  cursor: pointer;
  font-size: 0.9rem;
}
</style>
