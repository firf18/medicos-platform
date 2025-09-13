import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthGuard } from '../auth-guard';
import * as authHook from '@/features/auth/hooks/use-auth';

// Mock del hook useAuth
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
  usePathname: () => '/protected',
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe mostrar estado de carga cuando se está verificando la autenticación', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });
    
    render(
      <AuthGuard>
        <div>Contenido protegido</div>
      </AuthGuard>
    );
    
    expect(screen.getByText('Verificando acceso...')).toBeInTheDocument();
  });

  it('debe redirigir al login cuando el usuario no está autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
    
    render(
      <AuthGuard>
        <div>Contenido protegido</div>
      </AuthGuard>
    );
    
    // Verificar que se haya llamado a router.push
    expect(mockRouter.push).toHaveBeenCalledWith('/login?redirect=%2Fprotected');
  });

  it('debe renderizar contenido cuando el usuario está autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'user-id',
        email: 'test@example.com',
        role: 'patient',
        firstName: 'John',
        lastName: 'Doe',
      },
    });
    
    render(
      <AuthGuard>
        <div>Contenido protegido</div>
      </AuthGuard>
    );
    
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('debe mostrar mensaje de acceso denegado cuando el rol no es adecuado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'user-id',
        email: 'test@example.com',
        role: 'patient',
        firstName: 'John',
        lastName: 'Doe',
      },
    });
    
    render(
      <AuthGuard requiredRole="admin">
        <div>Contenido protegido</div>
      </AuthGuard>
    );
    
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
  });

  it('debe permitir acceso cuando el rol coincide', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'user-id',
        email: 'test@example.com',
        role: 'admin',
        firstName: 'John',
        lastName: 'Doe',
      },
    });
    
    render(
      <AuthGuard requiredRole="admin">
        <div>Contenido protegido</div>
      </AuthGuard>
    );
    
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });
});