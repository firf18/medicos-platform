import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSearch } from '@/hooks/useSearch'

// Mock de Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        or: vi.fn(() => ({
          limit: vi.fn(() => ({ data: [], error: null }))
        })),
        eq: vi.fn(function() { return this }),
        gte: vi.fn(function() { return this }),
        lte: vi.fn(function() { return this }),
        order: vi.fn(function() { return this })
      }))
    }))
  })
}))

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with empty results and default filters', () => {
    const { result } = renderHook(() => useSearch())
    
    expect(result.current.results).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.filters.query).toBe('')
    expect(result.current.filters.entityType).toBe('all')
  })

  it('updates filters when search is called', async () => {
    const { result } = renderHook(() => useSearch())
    
    const newFilters = {
      query: 'test search',
      dateRange: { from: '', to: '' },
      entityType: 'patients' as const,
      status: '',
      specialty: '',
      location: '',
      urgency: 'all' as const
    }
    
    act(() => {
      result.current.search(newFilters)
    })
    
    expect(result.current.filters.query).toBe('test search')
    expect(result.current.filters.entityType).toBe('patients')
  })

  it('clears results and filters when clearSearch is called', async () => {
    const { result } = renderHook(() => useSearch())
    
    // Primero hacer una búsqueda
    const searchFilters = {
      query: 'test',
      dateRange: { from: '', to: '' },
      entityType: 'all' as const,
      status: '',
      specialty: '',
      location: '',
      urgency: 'all' as const
    }
    
    act(() => {
      result.current.search(searchFilters)
    })
    
    // Luego limpiar
    act(() => {
      result.current.clearSearch()
    })
    
    expect(result.current.results).toEqual([])
    expect(result.current.filters.query).toBe('')
    expect(result.current.filters.entityType).toBe('all')
  })

  it('sets loading state during search', async () => {
    const { result } = renderHook(() => useSearch())
    
    const searchFilters = {
      query: 'test search',
      dateRange: { from: '', to: '' },
      entityType: 'all' as const,
      status: '',
      specialty: '',
      location: '',
      urgency: 'all' as const
    }
    
    act(() => {
      result.current.search(searchFilters)
    })
    
    // Durante la búsqueda debería estar loading
    expect(result.current.loading).toBe(true)
    
    // Esperar a que termine
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('handles search with empty query correctly', async () => {
    const { result } = renderHook(() => useSearch())
    
    const emptySearchFilters = {
      query: '',
      dateRange: { from: '', to: '' },
      entityType: 'all' as const,
      status: '',
      specialty: '',
      location: '',
      urgency: 'all' as const
    }
    
    act(() => {
      result.current.search(emptySearchFilters)
    })
    
    // Con query vacío, no debería hacer búsqueda
    expect(result.current.results).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('initializes with custom filters when provided', () => {
    const customFilters = {
      query: 'initial search',
      entityType: 'doctors' as const
    }
    
    const { result } = renderHook(() => useSearch({
      initialFilters: customFilters
    }))
    
    expect(result.current.filters.query).toBe('initial search')
    expect(result.current.filters.entityType).toBe('doctors')
  })

  it('debounces search when autoSearch is enabled', async () => {
    const { result } = renderHook(() => useSearch({
      autoSearch: true,
      debounceMs: 100
    }))
    
    const searchFilters = {
      query: 'test',
      dateRange: { from: '', to: '' },
      entityType: 'all' as const,
      status: '',
      specialty: '',
      location: '',
      urgency: 'all' as const
    }
    
    act(() => {
      result.current.search(searchFilters)
    })
    
    // Inmediatamente después no debería estar loading aún (por el debounce)
    expect(result.current.loading).toBe(false)
    
    // Después del debounce debería empezar a cargar
    await waitFor(() => {
      expect(result.current.loading).toBe(true)
    }, { timeout: 200 })
  })
})
