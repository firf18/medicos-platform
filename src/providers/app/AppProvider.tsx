'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { AuthProvider, SupabaseProvider } from '@/providers/auth'
import { ThemeProvider } from '@/providers/theme'
import { NotificationProvider } from '@/providers/notifications'
import { I18nProvider } from '@/providers/i18n'

type AppProviderProps = {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  // Configuración de React Query
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <AuthProvider>
          <I18nProvider>
            <ThemeProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </ThemeProvider>
          </I18nProvider>
        </AuthProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  )
}