import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginForm } from '../login-form';
import { AuthProvider } from '@/providers/auth/AuthProvider';

// Mock del hook useAuth
const mockSignIn = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('@/features/auth/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
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
  useRouter: () => mockRouter,
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

const renderWithProvider = (component: React.ReactNode) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
    });
  });

  it('debe renderizar el formulario de inicio de sesión', () => {
    renderWithProvider(<LoginForm />);
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument();
  });

  it('debe mostrar errores de validación cuando los campos están vacíos', async () => {
    renderWithProvider(<LoginForm />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    
    expect(await screen.findByText('El email es requerido')).toBeInTheDocument();
    expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
  });

  it('debe manejar el inicio de sesión exitoso', async () => {
    mockSignIn.mockResolvedValue({ success: true });
    
    renderWithProvider(<LoginForm />);
    
    // Llenar el formulario
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('debe mostrar mensaje de error cuando el inicio de sesión falla', async () => {
    const errorMessage = 'Credenciales inválidas';
    mockSignIn.mockResolvedValue({ 
      success: false, 
      error: { message: errorMessage } 
    });
    
    renderWithProvider(<LoginForm />);
    
    // Llenar el formulario
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'wrongpassword' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('debe redirigir a la página de recuperación de contraseña', () => {
    renderWithProvider(<LoginForm />);
    
    fireEvent.click(screen.getByText('¿Olvidaste tu contraseña?'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/auth/forgot-password');
  });
});