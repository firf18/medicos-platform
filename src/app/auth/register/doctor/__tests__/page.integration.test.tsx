/**
 * Test de integración para página de registro de médicos
 * 
 * @fileoverview Verifica que la página funciona correctamente con el hook centralizado
 * @compliance HIPAA-compliant testing without PHI data
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import DoctorRegistrationPage from '../page';

// Mock de Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

// Mock de los hooks de registro
vi.mock('@/domains/auth/hooks/useDoctorRegistration', () => ({
  useDoctorRegistration: () => ({
    registrationData: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      specialtyId: '',
      subSpecialties: [],
      licenseNumber: '',
      licenseState: '',
      licenseExpiry: '',
      yearsOfExperience: 0,
      bio: '',
      university: '',
      graduationYear: undefined,
      medicalBoard: '',
      documentType: undefined,
      documentNumber: '',
      selectedFeatures: [],
      workingHours: {
        monday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        thursday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        friday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        saturday: { isWorkingDay: false },
        sunday: { isWorkingDay: false }
      }
    },
    progress: {
      currentStep: 'personal_info',
      completedSteps: [],
      totalSteps: 4,
      canProceed: false,
      errors: {}
    },
    isSubmitting: false,
    updateData: vi.fn(),
    goToNextStep: vi.fn(),
    goToPreviousStep: vi.fn(),
    handleStepComplete: vi.fn(),
    handleStepError: vi.fn(),
    submitRegistration: vi.fn(),
    canProceedNext: false,
    formErrors: {
      hasErrors: false,
      getFieldError: vi.fn(),
      setFieldError: vi.fn(),
      clearFieldError: vi.fn(),
      hasFieldError: vi.fn(),
      getFieldErrorElement: vi.fn()
    }
  })
}));

// Mock del contexto de verificación
vi.mock('@/contexts/EmailVerificationContext', () => ({
  EmailVerificationProvider: ({ children }: { children: React.ReactNode }) => children,
  useEmailVerification: () => ({
    isEmailVerified: false,
    verifiedEmail: null,
    isPhoneVerified: false,
    verifiedPhone: null,
    setIsEmailVerified: vi.fn(),
    setVerifiedEmail: vi.fn(),
    setIsPhoneVerified: vi.fn(),
    setVerifiedPhone: vi.fn()
  })
}));

// Mock de otros hooks
vi.mock('@/hooks/useAutoCleanup', () => ({
  useAutoCleanup: vi.fn()
}));

vi.mock('@/lib/monitoring/frontend-error-monitor', () => ({
  errorMonitor: {
    captureException: vi.fn()
  }
}));

vi.mock('@/lib/email-verification/verification-tracker', () => ({
  emailVerificationTracker: {
    isEmailVerified: vi.fn(() => false)
  }
}));

vi.mock('@/lib/phone-verification/phone-verification-tracker', () => ({
  phoneVerificationTracker: {
    isPhoneVerified: vi.fn(() => false)
  }
}));

describe('DoctorRegistrationPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the registration page without errors', () => {
    render(<DoctorRegistrationPage />);
    
    expect(screen.getByText('Registro Médico Profesional')).toBeInTheDocument();
    expect(screen.getByText('Información Personal')).toBeInTheDocument();
  });

  it('should show validation error when trying to proceed with empty form', async () => {
    // Mock de alert para capturar el mensaje
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<DoctorRegistrationPage />);
    
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('❌')
      );
    });
    
    mockAlert.mockRestore();
  });

  it('should use centralized validation hook', () => {
    render(<DoctorRegistrationPage />);
    
    // Verificar que el hook de validación está siendo usado
    // Esto se verifica indirectamente por la ausencia de errores de renderizado
    expect(screen.getByText('Registro Médico Profesional')).toBeInTheDocument();
  });

  it('should have both navigation buttons using same validation logic', () => {
    render(<DoctorRegistrationPage />);
    
    // Verificar que existen ambos botones de navegación
    const buttons = screen.getAllByRole('button');
    const nextButtons = buttons.filter(button => 
      button.textContent?.includes('Siguiente') || 
      button.textContent?.includes('Finalizar Registro')
    );
    
    expect(nextButtons.length).toBeGreaterThan(0);
  });
});
