import { renderHook, act } from '@testing-library/react';
import { useSessionExpiration } from '../use-session-expiration';

// Mock de Supabase
const mockSupabaseAuth = {
  getSession: jest.fn(),
  onAuthStateChange: jest.fn(),
};

const mockSupabase = {
  auth: mockSupabaseAuth,
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
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
describe('useSessionExpiration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock básico de onAuthStateChange
    mockSupabaseAuth.onAuthStateChange.mockImplementation((callback) => {
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
  });

  it('debe manejar la expiración de sesión', async () => {
    // Mock de localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {
        'supabase-auth-token': 'token-data',
      };
      
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
        key: (index: number) => Object.keys(store)[index] || null,
        length: Object.keys(store).length
      };
    })();
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    const { result } = renderHook(() => useSessionExpiration());
    
    await act(async () => {
      await result.current.handleSessionExpiration();
    });
    
    // Verificar que se haya llamado a router.push
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('debe monitorear la expiración de sesión', async () => {
    const futureExpiration = Math.floor(Date.now() / 1000) + 3600; // 1 hora en el futuro
    
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { 
        session: { 
          expires_at: futureExpiration 
        } 
      }, 
      error: null 
    });
    
    const { result } = renderHook(() => useSessionExpiration());
    
    // La verificación debería pasar sin mostrar advertencias
    // ya que la sesión expira en el futuro
  });

  it('debe detectar sesión expirada', async () => {
    const pastExpiration = Math.floor(Date.now() / 1000) - 3600; // 1 hora en el pasado
    
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { 
        session: { 
          expires_at: pastExpiration 
        } 
      }, 
      error: null 
    });
    
    const { result } = renderHook(() => useSessionExpiration());
    
    // La verificación debería detectar que la sesión expiró
  });
});