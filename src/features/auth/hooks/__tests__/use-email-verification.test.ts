import { renderHook, act } from '@testing-library/react';
import { useEmailVerification } from '../use-email-verification';

// Mock de Supabase
const mockSupabaseAuth = {
  verifyOtp: jest.fn(),
  resend: jest.fn(),
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

describe('useEmailVerification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe verificar el email correctamente', async () => {
    mockSupabaseAuth.verifyOtp.mockResolvedValue({ error: null });
    
    const { result } = renderHook(() => useEmailVerification());
    
    await act(async () => {
      const response = await result.current.verifyEmail('token-hash');
      expect(response.success).toBe(true);
    });
    
    expect(mockSupabaseAuth.verifyOtp).toHaveBeenCalledWith({
      type: 'email',
      token_hash: 'token-hash',
    });
  });

  it('debe manejar errores al verificar el email', async () => {
    const mockError = { message: 'Token inválido' };
    mockSupabaseAuth.verifyOtp.mockResolvedValue({ error: mockError });
    
    const { result } = renderHook(() => useEmailVerification());
    
    await act(async () => {
      const response = await result.current.verifyEmail('invalid-token');
      expect(response.success).toBe(false);
      expect(response.error).toBe(mockError);
    });
  });

  it('debe reenviar el email de verificación correctamente', async () => {
    mockSupabaseAuth.resend.mockResolvedValue({ error: null });
    
    const { result } = renderHook(() => useEmailVerification());
    
    await act(async () => {
      const response = await result.current.resendVerificationEmail('test@example.com');
      expect(response.success).toBe(true);
    });
    
    expect(mockSupabaseAuth.resend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'test@example.com',
      options: {
        emailRedirectTo: expect.stringContaining('/auth/verify-email'),
      },
    });
  });

  it('debe manejar errores al reenviar el email de verificación', async () => {
    const mockError = { message: 'Error al enviar email' };
    mockSupabaseAuth.resend.mockResolvedValue({ error: mockError });
    
    const { result } = renderHook(() => useEmailVerification());
    
    await act(async () => {
      const response = await result.current.resendVerificationEmail('test@example.com');
      expect(response.success).toBe(false);
      expect(response.error).toBe(mockError);
    });
  });

  it('debe establecer el estado de carga correctamente', async () => {
    mockSupabaseAuth.verifyOtp.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve({ error: null }), 100);
      });
    });
    
    const { result } = renderHook(() => useEmailVerification());
    
    expect(result.current.isLoading).toBe(false);
    
    act(() => {
      result.current.verifyEmail('token-hash');
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });
    
    expect(result.current.isLoading).toBe(false);
  });
});