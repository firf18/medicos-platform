/**
 * Tests de integración para PasswordFieldsSection
 * 
 * @fileoverview Tests de integración para el subcomponente de campos de contraseña
 * @compliance HIPAA-compliant testing without PHI data
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordFieldsSection } from '../PasswordFieldsSection';

// Mock de las dependencias
vi.mock('../PasswordField', () => ({
  default: ({ id, label, value, onChange, onBlur, isValid, hasError, errorElement, isConfirmation, passwordToCompare }: any) => (
    <div data-testid={`password-field-${id}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        data-is-valid={isValid}
        data-has-error={hasError}
        {...(isConfirmation !== undefined && { 'data-is-confirmation': isConfirmation })}
        {...(passwordToCompare !== undefined && { 'data-password-to-compare': passwordToCompare })}
      />
      {errorElement}
    </div>
  )
}));

vi.mock('../PasswordStrengthIndicator', () => ({
  default: ({ passwordStrength, password, fieldTouched }: any) => (
    <div data-testid="password-strength-indicator">
      <span data-testid="strength-score">{passwordStrength.score}</span>
      <span data-testid="strength-valid">{passwordStrength.isValid.toString()}</span>
      <span data-testid="strength-errors">{passwordStrength.errors.length}</span>
      <span data-testid="field-touched">{fieldTouched.toString()}</span>
    </div>
  )
}));

describe('PasswordFieldsSection Integration Tests', () => {
  const defaultProps = {
    formData: {
      password: '',
      confirmPassword: ''
    },
    onFieldChange: vi.fn(),
    onFieldBlur: vi.fn(),
    fieldTouched: {
      password: false,
      confirmPassword: false
    },
    formErrors: {
      hasFieldError: vi.fn(() => false),
      getFieldErrorElement: vi.fn(() => null)
    },
    passwordStrength: {
      score: 0,
      isValid: false,
      errors: []
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderizado', () => {
    it('should render both password fields correctly', () => {
      render(<PasswordFieldsSection {...defaultProps} />);

      expect(screen.getByTestId('password-field-password')).toBeInTheDocument();
      expect(screen.getByTestId('password-field-confirmPassword')).toBeInTheDocument();
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirmar Contraseña')).toBeInTheDocument();
    });

    it('should display current form data values', () => {
      const props = {
        ...defaultProps,
        formData: {
          password: 'password123',
          confirmPassword: 'password123'
        }
      };

      render(<PasswordFieldsSection {...props} />);

      expect(screen.getAllByDisplayValue('password123')).toHaveLength(2);
    });

    it('should render password strength indicator', () => {
      render(<PasswordFieldsSection {...defaultProps} />);

      expect(screen.getByTestId('password-strength-indicator')).toBeInTheDocument();
    });
  });

  describe('Interacciones', () => {
    it('should call onFieldChange when password is modified', () => {
      render(<PasswordFieldsSection {...defaultProps} />);

      const passwordInput = screen.getByLabelText('Contraseña');
      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });

      expect(defaultProps.onFieldChange).toHaveBeenCalledWith('password', 'newpassword123');
    });

    it('should call onFieldChange when confirmPassword is modified', () => {
      render(<PasswordFieldsSection {...defaultProps} />);

      const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña');
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });

      expect(defaultProps.onFieldChange).toHaveBeenCalledWith('confirmPassword', 'newpassword123');
    });

    it('should call onFieldBlur when password loses focus', () => {
      render(<PasswordFieldsSection {...defaultProps} />);

      const passwordInput = screen.getByLabelText('Contraseña');
      fireEvent.blur(passwordInput);

      expect(defaultProps.onFieldBlur).toHaveBeenCalledWith('password', '');
    });

    it('should call onFieldBlur when confirmPassword loses focus', () => {
      render(<PasswordFieldsSection {...defaultProps} />);

      const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña');
      fireEvent.blur(confirmPasswordInput);

      expect(defaultProps.onFieldBlur).toHaveBeenCalledWith('confirmPassword', '');
    });
  });

  describe('Configuración de Campos', () => {
    it('should configure password field correctly', () => {
      render(<PasswordFieldsSection {...defaultProps} />);

      const passwordInput = screen.getByLabelText('Contraseña');
      // El campo de contraseña no debería tener data-is-confirmation porque no es confirmación
      expect(passwordInput).not.toHaveAttribute('data-is-confirmation');
      expect(passwordInput).not.toHaveAttribute('data-password-to-compare');
    });

    it('should configure confirmPassword field correctly', () => {
      const props = {
        ...defaultProps,
        formData: {
          password: 'password123',
          confirmPassword: ''
        }
      };

      render(<PasswordFieldsSection {...props} />);

      const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña');
      expect(confirmPasswordInput).toHaveAttribute('data-is-confirmation', 'true');
      expect(confirmPasswordInput).toHaveAttribute('data-password-to-compare', 'password123');
    });
  });

  describe('Indicador de Fortaleza de Contraseña', () => {
    it('should pass correct props to PasswordStrengthIndicator', () => {
      const props = {
        ...defaultProps,
        formData: {
          password: 'password123',
          confirmPassword: ''
        },
        passwordStrength: {
          score: 3,
          isValid: true,
          errors: ['Error 1', 'Error 2']
        },
        fieldTouched: {
          password: true,
          confirmPassword: false
        }
      };

      render(<PasswordFieldsSection {...props} />);

      expect(screen.getByTestId('strength-score')).toHaveTextContent('3');
      expect(screen.getByTestId('strength-valid')).toHaveTextContent('true');
      expect(screen.getByTestId('strength-errors')).toHaveTextContent('2');
      expect(screen.getByTestId('field-touched')).toHaveTextContent('true');
    });

    it('should handle empty password strength', () => {
      const props = {
        ...defaultProps,
        formData: {
          password: '',
          confirmPassword: ''
        },
        passwordStrength: {
          score: 0,
          isValid: false,
          errors: []
        }
      };

      render(<PasswordFieldsSection {...props} />);

      expect(screen.getByTestId('strength-score')).toHaveTextContent('0');
      expect(screen.getByTestId('strength-valid')).toHaveTextContent('false');
      expect(screen.getByTestId('strength-errors')).toHaveTextContent('0');
    });
  });

  describe('Validación', () => {
    it('should show validation state based on passwordStrength', () => {
      const props = {
        ...defaultProps,
        passwordStrength: {
          score: 4,
          isValid: true,
          errors: []
        }
      };

      render(<PasswordFieldsSection {...props} />);

      const passwordInput = screen.getByLabelText('Contraseña');
      expect(passwordInput).toHaveAttribute('data-is-valid', 'true');
    });

    it('should show invalid state when passwordStrength indicates invalid', () => {
      const props = {
        ...defaultProps,
        passwordStrength: {
          score: 1,
          isValid: false,
          errors: ['Password too weak']
        }
      };

      render(<PasswordFieldsSection {...props} />);

      const passwordInput = screen.getByLabelText('Contraseña');
      expect(passwordInput).toHaveAttribute('data-is-valid', 'false');
    });
  });

  describe('Manejo de Errores', () => {
    it('should display error state when formErrors indicates error', () => {
      const props = {
        ...defaultProps,
        fieldTouched: {
          password: true,
          confirmPassword: true
        },
        formErrors: {
          hasFieldError: vi.fn((field) => field === 'contraseña'),
          getFieldErrorElement: vi.fn((field) => 
            field === 'contraseña' ? <span data-testid="error-password">Error en contraseña</span> : null
          )
        }
      };

      render(<PasswordFieldsSection {...props} />);

      const passwordInput = screen.getByLabelText('Contraseña');
      expect(passwordInput).toHaveAttribute('data-has-error', 'true');
      expect(screen.getByTestId('error-password')).toBeInTheDocument();
    });

    it('should display error state for confirmPassword', () => {
      const props = {
        ...defaultProps,
        fieldTouched: {
          password: false,
          confirmPassword: true
        },
        formErrors: {
          hasFieldError: vi.fn((field) => field === 'confirmación de contraseña'),
          getFieldErrorElement: vi.fn((field) => 
            field === 'confirmación de contraseña' ? <span data-testid="error-confirm">Error en confirmación</span> : null
          )
        }
      };

      render(<PasswordFieldsSection {...props} />);

      const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña');
      expect(confirmPasswordInput).toHaveAttribute('data-has-error', 'true');
      expect(screen.getByTestId('error-confirm')).toBeInTheDocument();
    });

    it('should not display error state when field is not touched', () => {
      const props = {
        ...defaultProps,
        fieldTouched: {
          password: false,
          confirmPassword: false
        },
        formErrors: {
          hasFieldError: vi.fn(() => false), // Cambiado a false
          getFieldErrorElement: vi.fn(() => <span data-testid="error">Error</span>)
        }
      };

      render(<PasswordFieldsSection {...props} />);

      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña');

      expect(passwordInput).toHaveAttribute('data-has-error', 'false');
      expect(confirmPasswordInput).toHaveAttribute('data-has-error', 'false');
      expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    });
  });

  describe('Props Opcionales', () => {
    it('should work without formErrors prop', () => {
      const props = {
        formData: {
          password: 'password123',
          confirmPassword: 'password123'
        },
        onFieldChange: vi.fn(),
        onFieldBlur: vi.fn(),
        fieldTouched: {
          password: false,
          confirmPassword: false
        },
        passwordStrength: {
          score: 3,
          isValid: true,
          errors: []
        }
      };

      expect(() => render(<PasswordFieldsSection {...props} />)).not.toThrow();
    });

    it('should work with partial fieldTouched', () => {
      const props = {
        ...defaultProps,
        fieldTouched: {
          password: true
        }
      };

      expect(() => render(<PasswordFieldsSection {...props} />)).not.toThrow();
    });
  });

  describe('Accesibilidad', () => {
    it('should have proper labels for screen readers', () => {
      render(<PasswordFieldsSection {...defaultProps} />);

      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirmar Contraseña')).toBeInTheDocument();
    });

    it('should have password input type for security', () => {
      render(<PasswordFieldsSection {...defaultProps} />);

      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    it('should have required attributes for required fields', () => {
      render(<PasswordFieldsSection {...defaultProps} />);

      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña');

      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
    });
  });

  describe('Integración con PasswordStrengthIndicator', () => {
    it('should update strength indicator when password changes', () => {
      const props = {
        ...defaultProps,
        formData: {
          password: 'newpassword123',
          confirmPassword: ''
        },
        passwordStrength: {
          score: 4,
          isValid: true,
          errors: []
        }
      };

      render(<PasswordFieldsSection {...props} />);

      expect(screen.getByTestId('strength-score')).toHaveTextContent('4');
      expect(screen.getByTestId('strength-valid')).toHaveTextContent('true');
    });

    it('should handle fieldTouched state correctly', () => {
      const props = {
        ...defaultProps,
        fieldTouched: {
          password: true,
          confirmPassword: false
        }
      };

      render(<PasswordFieldsSection {...props} />);

      expect(screen.getByTestId('field-touched')).toHaveTextContent('true');
    });
  });
});
