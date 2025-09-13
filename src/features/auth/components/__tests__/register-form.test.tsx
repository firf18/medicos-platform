import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RegisterForm } from '../register-form';
import { AuthProvider } from '@/providers/auth/AuthProvider';

// Mock del hook useAuth
const mockSignUp = jest.fn();
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
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

const renderWithProvider = (component: React.ReactNode) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      signUp: mockSignUp,
    });
  });

  it('debe renderizar el formulario de registro', () => {
    renderWithProvider(<RegisterForm />);
    
    expect(screen.getByLabelText('Nombres')).toBeInTheDocument();
    expect(screen.getByLabelText('Apellidos')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Rol')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument();
  });

  it('debe mostrar errores de validación cuando los campos están vacíos', async () => {
    renderWithProvider(<RegisterForm />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    
    expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument();
    expect(screen.getByText('El apellido es requerido')).toBeInTheDocument();
    expect(screen.getByText('El email es requerido')).toBeInTheDocument();
    expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
    expect(screen.getByText('Por favor confirma tu contraseña')).toBeInTheDocument();
  });

  it('debe validar que las contraseñas coincidan', async () => {
    renderWithProvider(<RegisterForm />);
    
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: 'DifferentPassword' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    
    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
  });

  it('debe manejar el registro exitoso', async () => {
    mockSignUp.mockResolvedValue({ success: true });
    
    renderWithProvider(<RegisterForm />);
    
    // Llenar el formulario
    fireEvent.change(screen.getByLabelText('Nombres'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText('Apellidos'), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.select(screen.getByLabelText('Rol'), {
      target: { value: 'patient' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: 'Password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'john.doe@example.com',
      password: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'patient',
    });
    
    expect(mockRouter.push).toHaveBeenCalledWith('/auth/verify-email');
  });

  it('debe mostrar mensaje de error cuando el registro falla', async () => {
    const errorMessage = 'Error de registro';
    mockSignUp.mockResolvedValue({ 
      success: false, 
      error: { message: errorMessage } 
    });
    
    renderWithProvider(<RegisterForm />);
    
    // Llenar el formulario
    fireEvent.change(screen.getByLabelText('Nombres'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText('Apellidos'), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.select(screen.getByLabelText('Rol'), {
      target: { value: 'patient' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), {
      target: { value: 'Password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
});