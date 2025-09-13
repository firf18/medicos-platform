import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../use-auth';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useToast } from '@/hooks/use-toast';

// Mock de Supabase
const mockSupabaseAuth = {
  onAuthStateChange: jest.fn(),
  getUser: jest.fn(),
  signInWithPassword: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPasswordForEmail: jest.fn(),
  updateUser: jest.fn(),
  resend: jest.fn(),
};

const mockSupabase = {
  auth: mockSupabaseAuth,
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

// Mock de createClient
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
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
  refresh: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/test',
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe inicializar con estado de carga', () => {
    mockSupabaseAuth.onAuthStateChange.mockImplementation((callback) => {
      callback('INITIAL_SESSION', null);
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
    
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it('debe manejar el inicio de sesión exitoso', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
    };
    
    const mockSession = {
      user: mockUser,
    };
    
    const mockProfile = {
      id: 'user-id',
      email: 'test@example.com',
      role: 'patient',
      first_name: 'John',
      last_name: 'Doe',
    };
    
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({ data: mockSession, error: null });
    mockSupabase.from().select().eq().single.mockResolvedValue({ data: mockProfile, error: null });
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      const response = await result.current.signIn('test@example.com', 'password123');
      expect(response.success).toBe(true);
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({
      id: 'user-id',
      email: 'test@example.com',
      role: 'patient',
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('debe manejar errores en el inicio de sesión', async () => {
    const mockError = { message: 'Credenciales inválidas' };
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({ data: null, error: mockError });
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      const response = await result.current.signIn('test@example.com', 'wrongpassword');
      expect(response.success).toBe(false);
      expect(response.error).toBe(mockError);
    });
    
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('debe manejar el registro exitoso', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      identities: [{ id: 'identity-id' }],
    };
    
    const mockSession = {
      user: mockUser,
    };
    
    mockSupabaseAuth.signUp.mockResolvedValue({ data: mockSession, error: null });
    mockSupabase.from().insert.mockResolvedValue({ error: null });
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      const response = await result.current.signUp('test@example.com', 'Password123', {
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient',
      });
      expect(response.success).toBe(true);
    });
  });

  it('debe manejar el cierre de sesión', async () => {
    mockSupabaseAuth.signOut.mockResolvedValue({ error: null });
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      const response = await result.current.signOut();
      expect(response.success).toBe(true);
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });
});