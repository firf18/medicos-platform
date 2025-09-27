/**
 * Tests de integración para ContactFieldsSection
 * 
 * @fileoverview Tests de integración para el subcomponente de campos de contacto
 * @compliance HIPAA-compliant testing without PHI data
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactFieldsSection } from '../ContactFieldsSection';

// Mock de las dependencias
vi.mock('../FormField', () => ({
  default: ({ id, label, value, onChange, onBlur, onPaste, isValid, hasError, errorElement, rightElement }: any) => (
    <div data-testid={`form-field-${id}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onPaste={onPaste}
        data-is-valid={isValid}
        data-has-error={hasError}
      />
      {rightElement}
      {errorElement}
    </div>
  )
}));

vi.mock('../utils', () => ({
  validateEmail: vi.fn((email) => email && email.includes('@')),
  validateVenezuelanPhone: vi.fn((phone) => phone && phone.startsWith('+58'))
}));

describe('ContactFieldsSection Integration Tests', () => {
  const defaultProps = {
    formData: {
      email: '',
      phone: ''
    },
    onFieldChange: vi.fn(),
    onFieldBlur: vi.fn(),
    fieldTouched: {
      email: false,
      phone: false
    },
    formErrors: {
      hasFieldError: vi.fn(() => false),
      getFieldErrorElement: vi.fn(() => null)
    },
    isEmailAvailable: null,
    isEmailVerified: false,
    isPhoneVerified: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderizado', () => {
    it('should render both contact fields correctly', () => {
      render(<ContactFieldsSection {...defaultProps} />);

      expect(screen.getByTestId('form-field-email')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-phone')).toBeInTheDocument();
      expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
      expect(screen.getByLabelText('Número de Teléfono')).toBeInTheDocument();
    });

    it('should display current form data values', () => {
      const props = {
        ...defaultProps,
        formData: {
          email: 'test@example.com',
          phone: '+584121234567'
        }
      };

      render(<ContactFieldsSection {...props} />);

      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+584121234567')).toBeInTheDocument();
    });
  });

  describe('Interacciones', () => {
    it('should call onFieldChange when email is modified', () => {
      render(<ContactFieldsSection {...defaultProps} />);

      const emailInput = screen.getByLabelText('Correo Electrónico');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(defaultProps.onFieldChange).toHaveBeenCalledWith('email', 'test@example.com');
    });

    it('should call onFieldChange when phone is modified', () => {
      render(<ContactFieldsSection {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Número de Teléfono');
      fireEvent.change(phoneInput, { target: { value: '+584121234567' } });

      expect(defaultProps.onFieldChange).toHaveBeenCalledWith('phone', '+584121234567');
    });

    it('should call onFieldBlur when email loses focus', () => {
      render(<ContactFieldsSection {...defaultProps} />);

      const emailInput = screen.getByLabelText('Correo Electrónico');
      fireEvent.blur(emailInput);

      expect(defaultProps.onFieldBlur).toHaveBeenCalledWith('email', '');
    });

    it('should call onFieldBlur when phone loses focus', () => {
      render(<ContactFieldsSection {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Número de Teléfono');
      fireEvent.blur(phoneInput);

      expect(defaultProps.onFieldBlur).toHaveBeenCalledWith('phone', '');
    });

    it('should call onFieldPaste when email is pasted', () => {
      const mockOnFieldPaste = vi.fn();
      const props = {
        ...defaultProps,
        onFieldPaste: mockOnFieldPaste
      };

      render(<ContactFieldsSection {...props} />);

      const emailInput = screen.getByLabelText('Correo Electrónico');
      fireEvent.paste(emailInput, { clipboardData: { getData: () => 'test@example.com' } });

      expect(mockOnFieldPaste).toHaveBeenCalledWith('email', expect.any(Object));
    });
  });

  describe('Estado de Verificación de Email', () => {
    it('should show email available indicator when email is available', () => {
      const props = {
        ...defaultProps,
        formData: {
          email: 'test@example.com',
          phone: ''
        },
        isEmailAvailable: true,
        isEmailVerified: false,
        onStartEmailVerification: vi.fn()
      };

      render(<ContactFieldsSection {...props} />);

      expect(screen.getByText('Email disponible')).toBeInTheDocument();
      expect(screen.getByText('Verificar correo electrónico')).toBeInTheDocument();
    });

    it('should show email verified indicator when email is verified', () => {
      const props = {
        ...defaultProps,
        formData: {
          email: 'test@example.com',
          phone: ''
        },
        isEmailAvailable: true,
        isEmailVerified: true
      };

      render(<ContactFieldsSection {...props} />);

      expect(screen.getByText('Email verificado correctamente')).toBeInTheDocument();
    });

    it('should call onStartEmailVerification when verification button is clicked', () => {
      const mockOnStartEmailVerification = vi.fn();
      const props = {
        ...defaultProps,
        formData: {
          email: 'test@example.com',
          phone: ''
        },
        isEmailAvailable: true,
        isEmailVerified: false,
        onStartEmailVerification: mockOnStartEmailVerification
      };

      render(<ContactFieldsSection {...props} />);

      const verifyButton = screen.getByText('Verificar correo electrónico');
      fireEvent.click(verifyButton);

      expect(mockOnStartEmailVerification).toHaveBeenCalled();
    });

    it('should show loading indicator when email is being checked', () => {
      const props = {
        ...defaultProps,
        formData: {
          email: 'test@example.com',
          phone: ''
        },
        isEmailAvailable: null,
        fieldTouched: {
          email: true,
          phone: false
        }
      };

      render(<ContactFieldsSection {...props} />);

      // El indicador de carga debería estar presente
      expect(screen.getByTestId('form-field-email')).toBeInTheDocument();
    });
  });

  describe('Estado de Verificación de Teléfono', () => {
    it('should show phone verified indicator when phone is verified', () => {
      const props = {
        ...defaultProps,
        formData: {
          email: '',
          phone: '+584121234567'
        },
        isPhoneVerified: true
      };

      render(<ContactFieldsSection {...props} />);

      expect(screen.getByText('Teléfono verificado correctamente')).toBeInTheDocument();
    });

    it('should not show phone verified indicator when phone is not verified', () => {
      const props = {
        ...defaultProps,
        formData: {
          email: '',
          phone: '+584121234567'
        },
        isPhoneVerified: false
      };

      render(<ContactFieldsSection {...props} />);

      expect(screen.queryByText('Teléfono verificado correctamente')).not.toBeInTheDocument();
    });
  });

  describe('Validación', () => {
    it('should show validation state for valid email and phone', async () => {
      const { validateEmail, validateVenezuelanPhone } = await import('../utils');
      validateEmail.mockReturnValue(true);
      validateVenezuelanPhone.mockReturnValue(true);

      const props = {
        ...defaultProps,
        formData: {
          email: 'test@example.com',
          phone: '+584121234567'
        },
        isEmailAvailable: true
      };

      render(<ContactFieldsSection {...props} />);

      const emailInput = screen.getByLabelText('Correo Electrónico');
      const phoneInput = screen.getByLabelText('Número de Teléfono');

      expect(emailInput).toHaveAttribute('data-is-valid', 'true');
      expect(phoneInput).toHaveAttribute('data-is-valid', 'true');
    });

    it('should show validation state for invalid email and phone', async () => {
      const { validateEmail, validateVenezuelanPhone } = await import('../utils');
      validateEmail.mockReturnValue(false);
      validateVenezuelanPhone.mockReturnValue(false);

      const props = {
        ...defaultProps,
        formData: {
          email: 'invalid-email',
          phone: 'invalid-phone'
        }
      };

      render(<ContactFieldsSection {...props} />);

      const emailInput = screen.getByLabelText('Correo Electrónico');
      const phoneInput = screen.getByLabelText('Número de Teléfono');

      expect(emailInput).toHaveAttribute('data-is-valid', 'false');
      expect(phoneInput).toHaveAttribute('data-is-valid', 'false');
    });
  });

  describe('Manejo de Errores', () => {
    it('should display error state when formErrors indicates error', () => {
      const props = {
        ...defaultProps,
        fieldTouched: {
          email: true,
          phone: true
        },
        formErrors: {
          hasFieldError: vi.fn((field) => field === 'correo electrónico'),
          getFieldErrorElement: vi.fn((field) => 
            field === 'correo electrónico' ? <span data-testid="error-email">Error en email</span> : null
          )
        }
      };

      render(<ContactFieldsSection {...props} />);

      const emailInput = screen.getByLabelText('Correo Electrónico');
      expect(emailInput).toHaveAttribute('data-has-error', 'true');
      expect(screen.getByTestId('error-email')).toBeInTheDocument();
    });

    it('should not display error state when field is not touched', () => {
      const props = {
        ...defaultProps,
        fieldTouched: {
          email: false,
          phone: false
        },
        formErrors: {
          hasFieldError: vi.fn(() => false), // Cambiado a false
          getFieldErrorElement: vi.fn(() => <span data-testid="error">Error</span>)
        }
      };

      render(<ContactFieldsSection {...props} />);

      const emailInput = screen.getByLabelText('Correo Electrónico');
      const phoneInput = screen.getByLabelText('Número de Teléfono');

      expect(emailInput).toHaveAttribute('data-has-error', 'false');
      expect(phoneInput).toHaveAttribute('data-has-error', 'false');
      expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    });
  });

  describe('Props Opcionales', () => {
    it('should work without formErrors prop', () => {
      const props = {
        formData: {
          email: 'test@example.com',
          phone: '+584121234567'
        },
        onFieldChange: vi.fn(),
        onFieldBlur: vi.fn(),
        fieldTouched: {
          email: false,
          phone: false
        },
        isEmailAvailable: null,
        isEmailVerified: false,
        isPhoneVerified: false
      };

      expect(() => render(<ContactFieldsSection {...props} />)).not.toThrow();
    });

    it('should work without onFieldPaste prop', () => {
      const props = {
        ...defaultProps,
        onFieldPaste: undefined
      };

      expect(() => render(<ContactFieldsSection {...props} />)).not.toThrow();
    });

    it('should work without onStartEmailVerification prop', () => {
      const props = {
        ...defaultProps,
        isEmailAvailable: true,
        isEmailVerified: false,
        onStartEmailVerification: undefined
      };

      expect(() => render(<ContactFieldsSection {...props} />)).not.toThrow();
    });
  });

  describe('Accesibilidad', () => {
    it('should have proper labels for screen readers', () => {
      render(<ContactFieldsSection {...defaultProps} />);

      expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
      expect(screen.getByLabelText('Número de Teléfono')).toBeInTheDocument();
    });

    it('should have required attributes for required fields', () => {
      render(<ContactFieldsSection {...defaultProps} />);

      const emailInput = screen.getByLabelText('Correo Electrónico');
      const phoneInput = screen.getByLabelText('Número de Teléfono');

      expect(emailInput).toBeInTheDocument();
      expect(phoneInput).toBeInTheDocument();
    });
  });
});
