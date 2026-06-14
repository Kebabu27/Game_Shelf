import { ref, watch, type Ref } from 'vue'

/**
 * Renvoie une référence dérivée qui ne se met à jour que `delay` ms
 * après la dernière modification de la source — évite de déclencher
 * une action (ex. requête) à chaque frappe.
 */
export function useDebounce<T>(source: Ref<T>, delay = 400): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(source, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = value
    }, delay)
  })

  return debounced
}
