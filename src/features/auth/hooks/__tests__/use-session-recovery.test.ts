import { renderHook, act } from '@testing-library/react';
import { useSessionRecovery } from '../use-session-recovery';

// Mock de Supabase
const mockSupabaseAuth = {
  getSession: jest.fn(),
  refreshSession: jest.fn(),
  onAuthStateChange: jest.fn(),
  signOut: jest.fn(),
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
describe('useSessionRecovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock básico de onAuthStateChange
    mockSupabaseAuth.onAuthStateChange.mockImplementation((callback) => {
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
    
    mockSupabaseAuth.signOut.mockResolvedValue({ error: null });
  });

  it('debe manejar errores de sesión faltante', async () => {
    const mockError = { 
      name: 'AuthSessionMissingError',
      message: 'Auth session missing'
    };
    
    const { result } = renderHook(() => useSessionRecovery());
    
    await act(async () => {
      const response = await result.current.handleSessionError(mockError);
      expect(response.recovered).toBe(false);
    });
  });

  it('debe verificar la salud de la sesión', async () => {
    const mockSession = {
      session: {
        user: { id: 'user-id' },
        expires_at: Math.floor(Date.now() / 1000) + 3600
      }
    };
    
    mockSupabaseAuth.getSession.mockResolvedValue({ data: mockSession, error: null });
    
    const { result } = renderHook(() => useSessionRecovery());
    
    await act(async () => {
      const response = await result.current.checkSessionHealth();
      // Verificamos que tenga la propiedad healthy
      expect(response).toHaveProperty('healthy');
      if ('healthy' in response) {
        expect(response.healthy).toBe(true);
      }
    });
  });

  it('debe limpiar el estado de autenticación corrupto', async () => {
    // Mock de localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {
        'supabase-auth-token': 'token-data',
        'other-key': 'other-data'
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
    
    const { result } = renderHook(() => useSessionRecovery());
    
    await act(async () => {
      await result.current.cleanCorruptedAuthState();
    });
    
    // Verificar que se haya intentado limpiar
    expect(localStorageMock.length).toBe(1); // Solo debería quedar 'other-key'
  });
});