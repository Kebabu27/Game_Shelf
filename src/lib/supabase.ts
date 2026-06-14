import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Indique si Supabase est configuré (sinon l'app fonctionne en local seul). */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * Client Supabase partagé, ou `null` si les variables d'environnement
 * sont absentes — l'authentification est alors simplement désactivée.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null
