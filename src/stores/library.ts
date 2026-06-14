import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Game, GameStatus, LibraryEntry } from '@/types'
import { computeStats } from '@/utils/stats'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const STORAGE_KEY = 'gameshelf:library'
const TABLE = 'user_libraries'

function loadFromStorage(): LibraryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as LibraryEntry[]) : []
  } catch {
    return []
  }
}

export const useLibraryStore = defineStore('library', () => {
  // Avec Supabase, la bibliothèque est liée au compte : vide tant qu'on n'est
  // pas connecté. Sans Supabase, on retombe sur la persistance localStorage.
  const entries = ref<LibraryEntry[]>(isSupabaseConfigured ? [] : loadFromStorage())
  const auth = useAuthStore()

  // Empêche la réécriture vers le cloud quand on applique une donnée distante.
  let applyingRemote = false
  let pushTimer: ReturnType<typeof setTimeout> | undefined

  // Persistance : localStorage (toujours) + cloud (si connecté).
  watch(
    entries,
    (value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      if (!applyingRemote) schedulePush()
    },
    { deep: true },
  )

  function schedulePush(): void {
    const userId = auth.user?.id
    if (!supabase || !userId) return
    clearTimeout(pushTimer)
    pushTimer = setTimeout(async () => {
      // En supabase-js, la requête n'est envoyée que si elle est attendue.
      const { error } = await supabase!
        .from(TABLE)
        .upsert({ user_id: userId, entries: entries.value, updated_at: new Date().toISOString() })
      if (error) console.error('[library] cloud sync failed:', error.message)
    }, 600)
  }

  /** À la connexion : charge la bibliothèque cloud, ou migre la liste locale. */
  async function pullFromCloud(userId: string): Promise<void> {
    if (!supabase) return
    const { data } = await supabase.from(TABLE).select('entries').eq('user_id', userId).maybeSingle()
    applyingRemote = true
    if (data?.entries) {
      entries.value = data.entries as LibraryEntry[]
    } else if (entries.value.length) {
      // Compte neuf : on téléverse la liste locale existante.
      await supabase
        .from(TABLE)
        .upsert({ user_id: userId, entries: entries.value, updated_at: new Date().toISOString() })
    }
    applyingRemote = false
  }

  // Réagit à la connexion / déconnexion.
  watch(
    () => auth.user?.id,
    (userId) => {
      if (userId) {
        pullFromCloud(userId)
      } else if (isSupabaseConfigured) {
        // Déconnexion : on vide la bibliothèque en mémoire.
        applyingRemote = true
        entries.value = []
        applyingRemote = false
      }
    },
  )

  const ids = computed(() => new Set(entries.value.map((e) => e.id)))
  const isEmpty = computed(() => entries.value.length === 0)
  const stats = computed(() => computeStats(entries.value))

  /** Indique si un jeu est déjà dans la bibliothèque (reflété partout). */
  function has(id: number): boolean {
    return ids.value.has(id)
  }

  function get(id: number): LibraryEntry | undefined {
    return entries.value.find((e) => e.id === id)
  }

  /** Ajoute un jeu (issu du catalogue) à la bibliothèque. */
  function add(game: Game, status: GameStatus = 'backlog'): void {
    if (has(game.id)) return
    entries.value.push({
      id: game.id,
      slug: game.slug,
      name: game.name,
      background_image: game.background_image,
      genres: game.genres ?? [],
      status,
      rating: 0,
      comment: '',
      addedAt: Date.now(),
    })
  }

  function remove(id: number): void {
    entries.value = entries.value.filter((e) => e.id !== id)
  }

  /** Bascule l'appartenance d'un jeu à la bibliothèque. */
  function toggle(game: Game): void {
    if (has(game.id)) remove(game.id)
    else add(game)
  }

  function update(
    id: number,
    patch: Partial<Pick<LibraryEntry, 'status' | 'rating' | 'comment'>>,
  ): void {
    const entry = get(id)
    if (entry) Object.assign(entry, patch)
  }

  return { entries, ids, isEmpty, stats, has, get, add, remove, toggle, update }
})
