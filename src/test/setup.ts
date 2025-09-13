import '@testing-library/jest-dom'
import { beforeAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Limpiar después de cada test
afterEach(() => {
  cleanup()
})

// Mock de Supabase
beforeAll(() => {
  // Mock del cliente de Supabase
  global.mockSupabase = {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      delete: () => ({ data: [], error: null }),
      eq: function() { return this },
      limit: function() { return this },
      order: function() { return this },
      single: function() { return this }
    }),
    auth: {
      getUser: () => ({ data: { user: null }, error: null }),
      signIn: () => ({ data: null, error: null }),
      signOut: () => ({ error: null })
    },
    rpc: () => ({ data: [], error: null })
  }
})

// Mock de Next.js router
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  }),
})

// Mock de ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
