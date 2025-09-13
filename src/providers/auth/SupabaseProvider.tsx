'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient())
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Refresh the page when auth state changes
      router.refresh()
    })

    return () => {
      try {
        subscription.unsubscribe()
      } catch (error) {
        console.warn('⚠️ Error cleaning up auth subscription:', error)
      }
    }
  }, [router, supabase])

  return children
}