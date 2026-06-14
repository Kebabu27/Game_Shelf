import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'gameshelf:theme'

function initialTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (saved) return saved
  // Respecte la préférence système par défaut.
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const theme = ref<Theme>(initialTheme())

watch(
  theme,
  (value) => {
    document.documentElement.setAttribute('data-theme', value)
    localStorage.setItem(STORAGE_KEY, value)
  },
  { immediate: true },
)

/** Thème sombre persistant, partagé dans toute l'app. */
export function useTheme() {
  function toggle(): void {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }
  return { theme, toggle }
}
