import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmailVerificationForm } from '../email-verification-form';
import { AuthProvider } from '@/providers/auth/AuthProvider';

// Mock del hook useEmailVerification
const mockVerifyEmail = jest.fn();
const mockUseEmailVerification = jest.fn();

jest.mock('@/features/auth/hooks/use-email-verification', () => ({
  useEmailVerification: () => mockUseEmailVerification(),
}));

// Mock de useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock de next/navigation
const mockRouter = {
  push: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

const renderWithProvider = (component: React.ReactNode) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

describe('EmailVerificationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEmailVerification.mockReturnValue({
      verifyEmail: mockVerifyEmail,
      loading: false,
    });
  });

  it('debe renderizar el formulario de verificación de email', () => {
    renderWithProvider(<EmailVerificationForm />);
    
    expect(screen.getByLabelText('Código de verificación')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verificar email' })).toBeInTheDocument();
    expect(screen.getByText('Reenviar código')).toBeInTheDocument();
  });

  it('debe mostrar error de validación cuando el código está vacío', async () => {
    renderWithProvider(<EmailVerificationForm />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Verificar email' }));
    
    expect(await screen.findByText('El código de verificación es requerido')).toBeInTheDocument();
  });

  it('debe manejar la verificación exitosa', async () => {
    mockVerifyEmail.mockResolvedValue({ success: true });
    
    renderWithProvider(<EmailVerificationForm />);
    
    fireEvent.change(screen.getByLabelText('Código de verificación'), {
      target: { value: '123456' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Verificar email' }));
    
    expect(mockVerifyEmail).toHaveBeenCalledWith('123456');
  });

  it('debe mostrar mensaje de error cuando la verificación falla', async () => {
    const errorMessage = 'Código inválido';
    mockVerifyEmail.mockResolvedValue({ 
      success: false, 
      error: { message: errorMessage } 
    });
    
    renderWithProvider(<EmailVerificationForm />);
    
    fireEvent.change(screen.getByLabelText('Código de verificación'), {
      target: { value: '123456' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Verificar email' }));
    
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('debe manejar el reenvío de código', async () => {
    const mockResendCode = jest.fn().mockResolvedValue({ success: true });
    mockUseEmailVerification.mockReturnValue({
      verifyEmail: mockVerifyEmail,
      resendVerificationCode: mockResendCode,
      loading: false,
    });
    
    renderWithProvider(<EmailVerificationForm />);
    
    fireEvent.click(screen.getByText('Reenviar código'));
    
    expect(mockResendCode).toHaveBeenCalled();
  });
});