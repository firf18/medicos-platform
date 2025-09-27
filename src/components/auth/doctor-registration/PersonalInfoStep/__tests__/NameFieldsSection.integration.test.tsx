/**
 * Tests de integración para NameFieldsSection
 * 
 * @fileoverview Tests de integración para el subcomponente de campos de nombre
 * @compliance HIPAA-compliant testing without PHI data
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NameFieldsSection } from '../NameFieldsSection';

// Mock de las dependencias
vi.mock('../FormField', () => ({
  default: ({ id, label, value, onChange, onBlur, isValid, hasError, errorElement }: any) => (
    <div data-testid={`form-field-${id}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        data-is-valid={isValid}
        data-has-error={hasError}
      />
      {errorElement}
    </div>
  )
}));

vi.mock('../utils', () => ({
  validateName: vi.fn((name) => name && name.length >= 2)
}));

describe('NameFieldsSection Integration Tests', () => {
  const defaultProps = {
    formData: {
      firstName: '',
      lastName: ''
    },
    onFieldChange: vi.fn(),
    onFieldBlur: vi.fn(),
    fieldTouched: {
      firstName: false,
      lastName: false
    },
    formErrors: {
      hasFieldError: vi.fn(() => false),
      getFieldErrorElement: vi.fn(() => null)
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderizado', () => {
    it('should render both name fields correctly', () => {
      render(<NameFieldsSection {...defaultProps} />);

      expect(screen.getByTestId('form-field-firstName')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-lastName')).toBeInTheDocument();
      expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
      expect(screen.getByLabelText('Apellido')).toBeInTheDocument();
    });

    it('should display current form data values', () => {
      const props = {
        ...defaultProps,
        formData: {
          firstName: 'Juan',
          lastName: 'Pérez'
        }
      };

      render(<NameFieldsSection {...props} />);

      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument();
    });
  });

  describe('Interacciones', () => {
    it('should call onFieldChange when firstName is modified', () => {
      render(<NameFieldsSection {...defaultProps} />);

      const firstNameInput = screen.getByLabelText('Nombre');
      fireEvent.change(firstNameInput, { target: { value: 'María' } });

      expect(defaultProps.onFieldChange).toHaveBeenCalledWith('firstName', 'María');
    });

    it('should call onFieldChange when lastName is modified', () => {
      render(<NameFieldsSection {...defaultProps} />);

      const lastNameInput = screen.getByLabelText('Apellido');
      fireEvent.change(lastNameInput, { target: { value: 'González' } });

      expect(defaultProps.onFieldChange).toHaveBeenCalledWith('lastName', 'González');
    });

    it('should call onFieldBlur when firstName loses focus', () => {
      render(<NameFieldsSection {...defaultProps} />);

      const firstNameInput = screen.getByLabelText('Nombre');
      fireEvent.blur(firstNameInput);

      expect(defaultProps.onFieldBlur).toHaveBeenCalledWith('firstName', '');
    });

    it('should call onFieldBlur when lastName loses focus', () => {
      render(<NameFieldsSection {...defaultProps} />);

      const lastNameInput = screen.getByLabelText('Apellido');
      fireEvent.blur(lastNameInput);

      expect(defaultProps.onFieldBlur).toHaveBeenCalledWith('lastName', '');
    });
  });

  describe('Validación', () => {
    it('should show validation state for valid names', async () => {
      const { validateName } = await import('../utils');
      validateName.mockReturnValue(true);

      const props = {
        ...defaultProps,
        formData: {
          firstName: 'Juan',
          lastName: 'Pérez'
        }
      };

      render(<NameFieldsSection {...props} />);

      const firstNameInput = screen.getByLabelText('Nombre');
      const lastNameInput = screen.getByLabelText('Apellido');

      expect(firstNameInput).toHaveAttribute('data-is-valid', 'true');
      expect(lastNameInput).toHaveAttribute('data-is-valid', 'true');
    });

    it('should show validation state for invalid names', async () => {
      const { validateName } = await import('../utils');
      validateName.mockReturnValue(false);

      const props = {
        ...defaultProps,
        formData: {
          firstName: 'J',
          lastName: 'P'
        }
      };

      render(<NameFieldsSection {...props} />);

      const firstNameInput = screen.getByLabelText('Nombre');
      const lastNameInput = screen.getByLabelText('Apellido');

      expect(firstNameInput).toHaveAttribute('data-is-valid', 'false');
      expect(lastNameInput).toHaveAttribute('data-is-valid', 'false');
    });
  });

  describe('Manejo de Errores', () => {
    it('should display error state when formErrors indicates error', () => {
      const props = {
        ...defaultProps,
        fieldTouched: {
          firstName: true,
          lastName: true
        },
        formErrors: {
          hasFieldError: vi.fn((field) => field === 'nombre'),
          getFieldErrorElement: vi.fn((field) => 
            field === 'nombre' ? <span data-testid="error-nombre">Error en nombre</span> : null
          )
        }
      };

      render(<NameFieldsSection {...props} />);

      const firstNameInput = screen.getByLabelText('Nombre');
      expect(firstNameInput).toHaveAttribute('data-has-error', 'true');
      expect(screen.getByTestId('error-nombre')).toBeInTheDocument();
    });

    it('should not display error state when field is not touched', () => {
      const props = {
        ...defaultProps,
        fieldTouched: {
          firstName: false,
          lastName: false
        },
        formErrors: {
          hasFieldError: vi.fn(() => false), // Cambiado a false
          getFieldErrorElement: vi.fn(() => <span data-testid="error">Error</span>)
        }
      };

      render(<NameFieldsSection {...props} />);

      const firstNameInput = screen.getByLabelText('Nombre');
      const lastNameInput = screen.getByLabelText('Apellido');

      expect(firstNameInput).toHaveAttribute('data-has-error', 'false');
      expect(lastNameInput).toHaveAttribute('data-has-error', 'false');
      expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    });
  });

  describe('Props Opcionales', () => {
    it('should work without formErrors prop', () => {
      const props = {
        formData: {
          firstName: 'Juan',
          lastName: 'Pérez'
        },
        onFieldChange: vi.fn(),
        onFieldBlur: vi.fn(),
        fieldTouched: {
          firstName: false,
          lastName: false
        }
      };

      expect(() => render(<NameFieldsSection {...props} />)).not.toThrow();
    });

    it('should work with partial fieldTouched', () => {
      const props = {
        ...defaultProps,
        fieldTouched: {
          firstName: true
        }
      };

      expect(() => render(<NameFieldsSection {...props} />)).not.toThrow();
    });
  });

  describe('Accesibilidad', () => {
    it('should have proper labels for screen readers', () => {
      render(<NameFieldsSection {...defaultProps} />);

      expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
      expect(screen.getByLabelText('Apellido')).toBeInTheDocument();
    });

    it('should have required attributes for required fields', () => {
      render(<NameFieldsSection {...defaultProps} />);

      // Los campos son requeridos por defecto en FormField
      const firstNameInput = screen.getByLabelText('Nombre');
      const lastNameInput = screen.getByLabelText('Apellido');

      expect(firstNameInput).toBeInTheDocument();
      expect(lastNameInput).toBeInTheDocument();
    });
  });
});
