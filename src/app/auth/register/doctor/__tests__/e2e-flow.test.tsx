/**
 * Tests End-to-End del flujo completo de registro de médicos
 * 
 * @fileoverview Tests E2E que prueban todo el flujo de registro desde el frontend hasta la base de datos
 * @compliance HIPAA-compliant testing without PHI data
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DoctorRegistrationPage from '@/app/auth/register/doctor/page';

// Mock de las dependencias externas
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signIn: vi.fn()
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }))
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        createUser: vi.fn(),
        deleteUser: vi.fn()
      }
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn()
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }))
}));

vi.mock('@/lib/supabase/temporary-registration', () => ({
  createTemporaryRegistration: vi.fn()
}));

vi.mock('@/lib/supabase/final-registration', () => ({
  completeDoctorRegistration: vi.fn(),
  checkRegistrationReady: vi.fn()
}));

vi.mock('@/lib/validations', () => ({
  completeDoctorRegistrationSchema: {
    safeParse: vi.fn()
  }
}));

vi.mock('@/lib/validations/security.validations', () => ({
  logSecurityEvent: vi.fn()
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn()
  }
}));

// Mock de los hooks personalizados
vi.mock('@/hooks/useRegistrationValidation', () => ({
  useRegistrationValidation: vi.fn(() => ({
    validateCompleteForm: vi.fn(() => ({ isValid: true, errors: [] })),
    validateField: vi.fn(() => ({ isValid: true, error: null })),
    currentValidation: { isValid: true, errors: [] }
  }))
}));

vi.mock('@/hooks/useUnifiedVerification', () => ({
  useUnifiedVerification: vi.fn(() => ({
    verificationState: {
      isEmailVerified: false,
      verifiedEmail: null,
      isPhoneVerified: false,
      verifiedPhone: null
    },
    actions: {
      setEmailVerified: vi.fn(),
      setPhoneVerified: vi.fn(),
      clearEmailVerification: vi.fn(),
      clearPhoneVerification: vi.fn(),
      clearAllVerifications: vi.fn(),
      refreshVerificationState: vi.fn()
    },
    utils: {
      isEmailVerifiedFor: vi.fn(() => false),
      isPhoneVerifiedFor: vi.fn(() => false),
      getCompleteVerificationStatus: vi.fn(() => ({ isComplete: false, missing: ['email', 'phone'] }))
    }
  }))
}));

// Mock de los componentes de verificación
vi.mock('@/components/auth/doctor-registration/EmailVerification', () => ({
  default: ({ email, onVerificationComplete, onVerificationError }: any) => (
    <div data-testid="email-verification">
      <p>Verificando email: {email}</p>
      <button 
        onClick={() => onVerificationComplete?.({ success: true, token: 'test-token' })}
        data-testid="verify-email-btn"
      >
        Verificar Email
      </button>
      <button 
        onClick={() => onVerificationError?.({ error: 'Test error' })}
        data-testid="verify-email-error-btn"
      >
        Simular Error
      </button>
    </div>
  )
}));

describe('Flujo E2E de Registro de Médicos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock de fetch para las llamadas a la API
    global.fetch = vi.fn();
  });

  describe('Flujo Completo de Registro', () => {
    it('should complete full registration flow successfully', async () => {
      // Mock de respuestas de la API
      const mockFetch = vi.mocked(global.fetch);
      
      // Mock para registro temporal
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          step: 'temp',
          data: {
            registrationId: 'reg-123',
            verificationToken: 'token-123'
          }
        })
      } as Response);

      // Mock para completar registro
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          step: 'complete',
          data: {
            doctorId: 'doctor-123'
          }
        })
      } as Response);

      // Mock para finalizar registro
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          step: 'finalize',
          data: {
            userId: 'user-123',
            doctorId: 'doctor-123',
            email: 'test@example.com'
          }
        })
      } as Response);

      render(<DoctorRegistrationPage />);

      // Verificar que la página se renderiza correctamente
      expect(screen.getByText('Registro de Médicos')).toBeInTheDocument();
      expect(screen.getByText('Información Personal')).toBeInTheDocument();

      // Llenar formulario de información personal
      const firstNameInput = screen.getByLabelText('Nombre');
      const lastNameInput = screen.getByLabelText('Apellido');
      const emailInput = screen.getByLabelText('Correo Electrónico');
      const phoneInput = screen.getByLabelText('Número de Teléfono');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña');

      fireEvent.change(firstNameInput, { target: { value: 'Juan' } });
      fireEvent.change(lastNameInput, { target: { value: 'Pérez' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+584121234567' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      // Verificar que los campos se llenaron correctamente
      expect(firstNameInput).toHaveValue('Juan');
      expect(lastNameInput).toHaveValue('Pérez');
      expect(emailInput).toHaveValue('test@example.com');
      expect(phoneInput).toHaveValue('+584121234567');
      expect(passwordInput).toHaveValue('password123');
      expect(confirmPasswordInput).toHaveValue('password123');

      // Hacer clic en "Siguiente"
      const nextButton = screen.getByText('Siguiente');
      fireEvent.click(nextButton);

      // Verificar que se avanzó al siguiente paso
      await waitFor(() => {
        expect(screen.getByText('Información Profesional')).toBeInTheDocument();
      });

      // Llenar información profesional
      const specialtySelect = screen.getByLabelText('Especialidad Médica');
      const licenseInput = screen.getByLabelText('Número de Licencia');

      fireEvent.change(specialtySelect, { target: { value: '1' } });
      fireEvent.change(licenseInput, { target: { value: 'LIC123456' } });

      // Avanzar al paso de revisión final
      const nextButton2 = screen.getByText('Siguiente');
      fireEvent.click(nextButton2);

      await waitFor(() => {
        expect(screen.getByText('Revisión Final')).toBeInTheDocument();
      });

      // Verificar que se muestran todos los datos ingresados
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('+584121234567')).toBeInTheDocument();

      // Finalizar registro
      const finalizeButton = screen.getByText('Completar Registro');
      fireEvent.click(finalizeButton);

      // Verificar que se realizaron las llamadas a la API
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(3);
      });

      // Verificar que se muestra mensaje de éxito
      await waitFor(() => {
        expect(screen.getByText('Registro completado exitosamente')).toBeInTheDocument();
      });
    });

    it('should handle email verification flow', async () => {
      render(<DoctorRegistrationPage />);

      // Llenar formulario básico
      const firstNameInput = screen.getByLabelText('Nombre');
      const lastNameInput = screen.getByLabelText('Apellido');
      const emailInput = screen.getByLabelText('Correo Electrónico');
      const phoneInput = screen.getByLabelText('Número de Teléfono');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña');

      fireEvent.change(firstNameInput, { target: { value: 'María' } });
      fireEvent.change(lastNameInput, { target: { value: 'González' } });
      fireEvent.change(emailInput, { target: { value: 'maria@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+584121234567' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      // Simular que el email está disponible y mostrar verificación
      const verifyEmailButton = screen.getByText('Verificar correo electrónico');
      fireEvent.click(verifyEmailButton);

      // Verificar que aparece el componente de verificación
      await waitFor(() => {
        expect(screen.getByTestId('email-verification')).toBeInTheDocument();
      });

      // Simular verificación exitosa
      const verifyBtn = screen.getByTestId('verify-email-btn');
      fireEvent.click(verifyBtn);

      // Verificar que se muestra el estado de verificado
      await waitFor(() => {
        expect(screen.getByText('Email verificado correctamente')).toBeInTheDocument();
      });
    });

    it('should handle validation errors gracefully', async () => {
      // Mock de validación fallida
      const { useRegistrationValidation } = await import('@/hooks/useRegistrationValidation');
      vi.mocked(useRegistrationValidation).mockReturnValue({
        validateCompleteForm: vi.fn(() => ({ 
          isValid: false, 
          errors: [
            { field: 'firstName', message: 'Nombre es requerido' },
            { field: 'email', message: 'Email inválido' }
          ]
        })),
        validateField: vi.fn(() => ({ isValid: false, error: 'Campo inválido' })),
        currentValidation: { isValid: false, errors: [] }
      });

      render(<DoctorRegistrationPage />);

      // Intentar avanzar sin llenar campos requeridos
      const nextButton = screen.getByText('Siguiente');
      fireEvent.click(nextButton);

      // Verificar que se muestran errores de validación
      await waitFor(() => {
        expect(screen.getByText('Nombre es requerido')).toBeInTheDocument();
        expect(screen.getByText('Email inválido')).toBeInTheDocument();
      });

      // Verificar que no se avanzó al siguiente paso
      expect(screen.queryByText('Información Profesional')).not.toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      // Mock de error en la API
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'Error interno del servidor'
        })
      } as Response);

      render(<DoctorRegistrationPage />);

      // Llenar formulario
      const firstNameInput = screen.getByLabelText('Nombre');
      const lastNameInput = screen.getByLabelText('Apellido');
      const emailInput = screen.getByLabelText('Correo Electrónico');
      const phoneInput = screen.getByLabelText('Número de Teléfono');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña');

      fireEvent.change(firstNameInput, { target: { value: 'Juan' } });
      fireEvent.change(lastNameInput, { target: { value: 'Pérez' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+584121234567' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      // Intentar avanzar
      const nextButton = screen.getByText('Siguiente');
      fireEvent.click(nextButton);

      // Verificar que se muestra error de API
      await waitFor(() => {
        expect(screen.getByText('Error interno del servidor')).toBeInTheDocument();
      });
    });
  });

  describe('Navegación entre Pasos', () => {
    it('should navigate between steps correctly', async () => {
      render(<DoctorRegistrationPage />);

      // Verificar paso inicial
      expect(screen.getByText('Información Personal')).toBeInTheDocument();
      expect(screen.getByText('Paso 1 de 3')).toBeInTheDocument();

      // Llenar formulario y avanzar
      const firstNameInput = screen.getByLabelText('Nombre');
      const lastNameInput = screen.getByLabelText('Apellido');
      const emailInput = screen.getByLabelText('Correo Electrónico');
      const phoneInput = screen.getByLabelText('Número de Teléfono');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmPasswordInput = screen.getByLabelText('Confirmar Contraseña');

      fireEvent.change(firstNameInput, { target: { value: 'Juan' } });
      fireEvent.change(lastNameInput, { target: { value: 'Pérez' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+584121234567' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      const nextButton = screen.getByText('Siguiente');
      fireEvent.click(nextButton);

      // Verificar paso 2
      await waitFor(() => {
        expect(screen.getByText('Información Profesional')).toBeInTheDocument();
        expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument();
      });

      // Llenar información profesional y avanzar
      const specialtySelect = screen.getByLabelText('Especialidad Médica');
      fireEvent.change(specialtySelect, { target: { value: '1' } });

      const nextButton2 = screen.getByText('Siguiente');
      fireEvent.click(nextButton2);

      // Verificar paso 3
      await waitFor(() => {
        expect(screen.getByText('Revisión Final')).toBeInTheDocument();
        expect(screen.getByText('Paso 3 de 3')).toBeInTheDocument();
      });

      // Verificar botón de retroceso
      const backButton = screen.getByText('Anterior');
      fireEvent.click(backButton);

      // Verificar que regresó al paso anterior
      await waitFor(() => {
        expect(screen.getByText('Información Profesional')).toBeInTheDocument();
        expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument();
      });
    });
  });

  describe('Persistencia de Datos', () => {
    it('should persist data between steps', async () => {
      render(<DoctorRegistrationPage />);

      // Llenar información personal
      const firstNameInput = screen.getByLabelText('Nombre');
      const lastNameInput = screen.getByLabelText('Apellido');
      const emailInput = screen.getByLabelText('Correo Electrónico');

      fireEvent.change(firstNameInput, { target: { value: 'Juan' } });
      fireEvent.change(lastNameInput, { target: { value: 'Pérez' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      // Avanzar al siguiente paso
      const nextButton = screen.getByText('Siguiente');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Información Profesional')).toBeInTheDocument();
      });

      // Regresar al paso anterior
      const backButton = screen.getByText('Anterior');
      fireEvent.click(backButton);

      // Verificar que los datos se mantuvieron
      await waitFor(() => {
        expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument();
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      });
    });
  });

  describe('Accesibilidad E2E', () => {
    it('should be accessible throughout the flow', async () => {
      render(<DoctorRegistrationPage />);

      // Verificar que todos los campos tienen labels
      expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
      expect(screen.getByLabelText('Apellido')).toBeInTheDocument();
      expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
      expect(screen.getByLabelText('Número de Teléfono')).toBeInTheDocument();
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirmar Contraseña')).toBeInTheDocument();

      // Verificar que los botones tienen texto descriptivo
      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument();

      // Verificar que hay indicadores de progreso
      expect(screen.getByText('Paso 1 de 3')).toBeInTheDocument();
    });
  });
});
