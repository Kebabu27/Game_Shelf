<script setup lang="ts">
import { vClickOutside } from '@/directives/clickOutside'

/**
 * Modale rendue hors de l'arbre DOM via <Teleport>.
 * - v-model:open : liaison bidirectionnelle d'ouverture
 * - slots header / default : injection de contenu par le parent
 * - directive v-click-outside : fermeture au clic extérieur
 */
const open = defineModel<boolean>('open', { default: false })

defineProps<{ title?: string }>()

function close(): void {
  open.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="overlay" @keydown.esc="close" tabindex="-1">
        <div v-click-outside="close" class="modal" role="dialog" aria-modal="true">
          <header class="modal__header">
            <slot name="header">
              <h2>{{ title }}</h2>
            </slot>
            <button class="modal__close" aria-label="Fermer" @click="close">✕</button>
          </header>
          <div class="modal__body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 100;
}
.modal {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 0.7rem;
  width: min(480px, 100%);
  max-height: 85vh;
  overflow-y: auto;
}
.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--c-border);
}
.modal__close {
  background: none;
  border: none;
  color: var(--c-text-muted);
  font-size: 1.1rem;
  cursor: pointer;
}
.modal__body {
  padding: 1rem;
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
