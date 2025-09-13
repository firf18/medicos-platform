import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm'

describe('AdvancedSearchForm', () => {
  const mockOnSearch = vi.fn()
  const mockOnClear = vi.fn()

  const defaultProps = {
    onSearch: mockOnSearch,
    onClear: mockOnClear,
    loading: false,
    specialties: [
      { id: '1', name: 'Cardiología' },
      { id: '2', name: 'Pediatría' }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search form with placeholder', () => {
    render(<AdvancedSearchForm {...defaultProps} />)
    
    expect(screen.getByPlaceholderText(/buscar pacientes, médicos/i)).toBeInTheDocument()
  })

  it('calls onSearch when form is submitted', async () => {
    render(<AdvancedSearchForm {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText(/buscar pacientes, médicos/i)
    const searchButton = screen.getByRole('button', { name: /buscar/i })
    
    fireEvent.change(searchInput, { target: { value: 'test search' } })
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'test search'
        })
      )
    })
  })

  it('shows advanced filters when filter button is clicked', () => {
    render(<AdvancedSearchForm {...defaultProps} />)
    
    const filterButton = screen.getByRole('button', { name: /filtros/i })
    fireEvent.click(filterButton)
    
    expect(screen.getByText(/buscar en/i)).toBeInTheDocument()
  })

  it('calls onClear when clear button is clicked', async () => {
    render(<AdvancedSearchForm {...defaultProps} />)
    
    // Primero hacer una búsqueda para que aparezca el botón limpiar
    const searchInput = screen.getByPlaceholderText(/buscar pacientes, médicos/i)
    fireEvent.change(searchInput, { target: { value: 'test' } })
    
    const filterButton = screen.getByRole('button', { name: /filtros/i })
    fireEvent.click(filterButton)
    
    // Cambiar un filtro
    const entitySelect = screen.getByDisplayValue(/todo/i)
    fireEvent.change(entitySelect, { target: { value: 'patients' } })
    
    const clearButton = screen.getByRole('button', { name: /limpiar/i })
    fireEvent.click(clearButton)
    
    await waitFor(() => {
      expect(mockOnClear).toHaveBeenCalled()
    })
  })

  it('shows loading state correctly', () => {
    render(<AdvancedSearchForm {...defaultProps} loading={true} />)
    
    expect(screen.getByText(/buscando.../i)).toBeInTheDocument()
  })

  it('displays specialties in dropdown', () => {
    render(<AdvancedSearchForm {...defaultProps} />)
    
    const filterButton = screen.getByRole('button', { name: /filtros/i })
    fireEvent.click(filterButton)
    
    const specialtySelect = screen.getByDisplayValue(/todas las especialidades/i)
    fireEvent.click(specialtySelect)
    
    expect(screen.getByText('Cardiología')).toBeInTheDocument()
    expect(screen.getByText('Pediatría')).toBeInTheDocument()
  })

  it('shows active filters count when filters are applied', () => {
    render(<AdvancedSearchForm {...defaultProps} />)
    
    const filterButton = screen.getByRole('button', { name: /filtros/i })
    fireEvent.click(filterButton)
    
    // Aplicar un filtro
    const entitySelect = screen.getByDisplayValue(/todo/i)
    fireEvent.change(entitySelect, { target: { value: 'patients' } })
    
    // Debería mostrar el contador de filtros activos
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
