import type { Directive } from 'vue'

type ClickOutsideEl = HTMLElement & { __clickOutside__?: (e: MouseEvent) => void }

/**
 * Directive transverse `v-click-outside` : exécute le handler fourni
 * quand un clic se produit en dehors de l'élément.
 * Usage : <div v-click-outside="close">
 */
export const vClickOutside: Directive<ClickOutsideEl, () => void> = {
  mounted(el, binding) {
    el.__clickOutside__ = (event: MouseEvent) => {
      if (!el.contains(event.target as Node)) {
        binding.value()
      }
    }
    document.addEventListener('mousedown', el.__clickOutside__)
  },
  unmounted(el) {
    if (el.__clickOutside__) {
      document.removeEventListener('mousedown', el.__clickOutside__)
      delete el.__clickOutside__
    }
  },
}
