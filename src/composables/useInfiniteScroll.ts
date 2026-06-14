import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * Déclenche `onLoadMore` quand l'élément sentinelle entre dans le viewport.
 * Renvoie la ref à attacher à un élément placé en bas de la liste.
 */
export function useInfiniteScroll(onLoadMore: () => void) {
  const sentinel = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null

  function observe(el: HTMLElement): void {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore()
      },
      { rootMargin: '400px' }, // précharge avant d'atteindre le bas
    )
    observer.observe(el)
  }

  onMounted(() => {
    if (sentinel.value) observe(sentinel.value)
  })

  // Si la sentinelle apparaît/disparaît (v-if), on (ré)observe.
  watch(sentinel, (el) => {
    observer?.disconnect()
    if (el) observe(el)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { sentinel }
}
