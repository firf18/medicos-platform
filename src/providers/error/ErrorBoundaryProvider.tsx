'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface ErrorContextType {
  error: Error | null
  setError: (error: Error | null) => void
  clearError: () => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export function ErrorBoundaryProvider({ children }: { children: ReactNode }) {
  const [error, setErrorState] = useState<Error | null>(null)

  const setError = useCallback((error: Error | null) => {
    setErrorState(error)
  }, [])

  const clearError = useCallback(() => {
    setErrorState(null)
  }, [])

  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
    </ErrorContext.Provider>
  )
}

export const useError = () => {
  const context = useContext(ErrorContext)
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorBoundaryProvider')
  }
  return context
}