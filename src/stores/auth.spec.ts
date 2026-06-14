import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// On force le mode "non configuré" indépendamment du .env local.
vi.mock('@/lib/supabase', () => ({ supabase: null, isSupabaseConfigured: false }))

import { useAuthStore } from './auth'

describe('useAuthStore (non configuré)', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('démarre déconnecté', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.email).toBeNull()
    expect(auth.enabled).toBe(false)
  })

  it('init marque la session comme prête sans client', async () => {
    const auth = useAuthStore()
    await auth.init()
    expect(auth.ready).toBe(true)
  })

  it('signIn et signUp échouent proprement sans configuration', async () => {
    const auth = useAuthStore()
    await expect(auth.signIn('a@b.c', 'secret123')).rejects.toThrow()
    await expect(auth.signUp('a@b.c', 'secret123', 'Tester')).rejects.toThrow()
  })

  it('signOut ne plante pas sans client', async () => {
    const auth = useAuthStore()
    await expect(auth.signOut()).resolves.toBeUndefined()
  })
})
