import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const ready = ref(false) // session restaurée ?

  const isAuthenticated = computed(() => user.value !== null)
  const email = computed(() => user.value?.email ?? null)
  // Pseudo public : ne jamais exposer l'email. Repli sur la partie locale.
  const displayName = computed(() => {
    const meta = user.value?.user_metadata as { display_name?: string } | undefined
    return meta?.display_name?.trim() || user.value?.email?.split('@')[0] || 'Player'
  })
  const enabled = isSupabaseConfigured

  /** Restaure la session au démarrage et écoute les changements d'auth. */
  async function init(): Promise<void> {
    if (!supabase) {
      ready.value = true
      return
    }
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
    ready.value = true
  }

  async function signUp(emailValue: string, password: string, name: string): Promise<void> {
    if (!supabase) throw new Error('Authentication is not configured.')
    const { error } = await supabase.auth.signUp({
      email: emailValue,
      password,
      options: { data: { display_name: name.trim() } },
    })
    if (error) throw new Error(error.message)
  }

  async function signIn(emailValue: string, password: string): Promise<void> {
    if (!supabase) throw new Error('Authentication is not configured.')
    const { error } = await supabase.auth.signInWithPassword({ email: emailValue, password })
    if (error) throw new Error(error.message)
  }

  async function signOut(): Promise<void> {
    if (!supabase) return
    await supabase.auth.signOut()
    user.value = null
  }

  return {
    user,
    ready,
    isAuthenticated,
    email,
    displayName,
    enabled,
    init,
    signUp,
    signIn,
    signOut,
  }
})
