import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'

// Función para crear un cliente de Supabase
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Alias para compatibilidad
export const getSupabaseBrowserClient = createClient

export type SupabaseClient = ReturnType<typeof createClient>
