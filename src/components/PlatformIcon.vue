<script setup lang="ts">
import { computed } from 'vue'
import { platformIconDef } from '@/utils/platformIcons'

const props = defineProps<{ slug: string }>()
const def = computed(() => platformIconDef(props.slug))
</script>

<template>
  <svg
    v-if="def"
    class="pf-icon"
    viewBox="0 0 24 24"
    role="img"
    :aria-label="def.label"
    fill="currentColor"
  >
    <title>{{ def.label }}</title>
    <path :d="def.path" />
  </svg>
  <span v-else class="pf-icon pf-icon--fallback" :title="slug">•</span>
</template>

<style scoped>
.pf-icon {
  width: 0.95em;
  height: 0.95em;
  display: inline-block;
  vertical-align: middle;
}
.pf-icon--fallback {
  width: auto;
  line-height: 1;
}
</style>
