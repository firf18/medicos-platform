/**
 * Tests para el endpoint unificado de registro de médicos
 * 
 * @fileoverview Tests de integración para el endpoint unificado
 * @compliance HIPAA-compliant testing without PHI data
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/register/doctor/route';

// Mock de las dependencias
vi.mock('@/lib/supabase/temporary-registration', () => ({
  createTemporaryRegistration: vi.fn()
}));

vi.mock('@/lib/supabase/final-registration', () => ({
  completeDoctorRegistration: vi.fn(),
  checkRegistrationReady: vi.fn()
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

describe('Endpoint Unificado de Registro de Médicos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Registro Temporal (step: temp)', () => {
    it('should create temporary registration successfully', async () => {
      const mockData = {
        step: 'temp',
        email: 'test@example.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '+584121234567',
        password: 'password123',
        confirmPassword: 'password123',
        specialtyId: '1'
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register/doctor', {
        method: 'POST',
        body: JSON.stringify(mockData)
      });

      // Mock de validación exitosa
      const { completeDoctorRegistrationSchema } = await import('@/lib/validations');
      vi.mocked(completeDoctorRegistrationSchema.safeParse).mockReturnValue({
        success: true,
        data: mockData
      });

      // Mock de creación exitosa
      const { createTemporaryRegistration } = await import('@/lib/supabase/temporary-registration');
      vi.mocked(createTemporaryRegistration).mockResolvedValue({
        success: true,
        data: {
          id: 'reg-123',
          verification_token: 'token-123'
        }
      });

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.step).toBe('temp');
      expect(responseData.data.registrationId).toBe('reg-123');
      expect(responseData.data.verificationToken).toBe('token-123');
    });

    it('should return validation error for invalid data', async () => {
      const mockData = {
        step: 'temp',
        email: 'invalid-email',
        firstName: '',
        lastName: '',
        phone: 'invalid-phone',
        password: '123',
        confirmPassword: '456',
        specialtyId: ''
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register/doctor', {
        method: 'POST',
        body: JSON.stringify(mockData)
      });

      // Mock de validación fallida
      const { completeDoctorRegistrationSchema } = await import('@/lib/validations');
      vi.mocked(completeDoctorRegistrationSchema.safeParse).mockReturnValue({
        success: false,
        error: {
          errors: [
            { path: ['email'], message: 'Email inválido' },
            { path: ['firstName'], message: 'Nombre requerido' }
          ]
        }
      });

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.step).toBe('temp');
      expect(responseData.details).toHaveLength(2);
    });
  });

  describe('Completación de Registro (step: complete)', () => {
    it('should complete registration successfully', async () => {
      const mockData = {
        step: 'complete',
        verification_token: 'token-123'
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register/doctor', {
        method: 'POST',
        body: JSON.stringify(mockData)
      });

      // Mock de verificación exitosa
      const { checkRegistrationReady } = await import('@/lib/supabase/final-registration');
      vi.mocked(checkRegistrationReady).mockResolvedValue({
        success: true
      });

      // Mock de completación exitosa
      const { completeDoctorRegistration } = await import('@/lib/supabase/final-registration');
      vi.mocked(completeDoctorRegistration).mockResolvedValue({
        success: true,
        data: {
          id: 'doctor-123'
        }
      });

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.step).toBe('complete');
      expect(responseData.data.doctorId).toBe('doctor-123');
    });

    it('should return error for missing verification token', async () => {
      const mockData = {
        step: 'complete'
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register/doctor', {
        method: 'POST',
        body: JSON.stringify(mockData)
      });

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.step).toBe('complete');
      expect(responseData.error).toBe('verification_token es requerido');
    });
  });

  describe('Finalización de Registro (step: finalize)', () => {
    it('should finalize registration successfully', async () => {
      const mockData = {
        step: 'finalize',
        email: 'test@example.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '+584121234567',
        password: 'password123',
        specialtyId: '1'
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register/doctor', {
        method: 'POST',
        body: JSON.stringify(mockData)
      });

      // Mock de bcrypt
      const bcrypt = await import('bcrypt');
      vi.mocked(bcrypt.default.hash).mockResolvedValue('hashed-password');

      // Mock de admin client
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const mockAdmin = {
        auth: {
          admin: {
            createUser: vi.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null
            }),
            deleteUser: vi.fn()
          }
        },
        from: vi.fn(() => ({
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { id: 'doctor-123' },
                error: null
              })
            }))
          }))
        }))
      };
      vi.mocked(createAdminClient).mockReturnValue(mockAdmin as any);

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.step).toBe('finalize');
      expect(responseData.data.userId).toBe('user-123');
      expect(responseData.data.doctorId).toBe('doctor-123');
    });

    it('should return error for weak password', async () => {
      const mockData = {
        step: 'finalize',
        email: 'test@example.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '+584121234567',
        password: '123',
        specialtyId: '1'
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register/doctor', {
        method: 'POST',
        body: JSON.stringify(mockData)
      });

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.step).toBe('finalize');
      expect(responseData.error).toBe('Contraseña debe tener al menos 6 caracteres');
    });
  });

  describe('Marcado de Verificación (step: verify)', () => {
    it('should mark verification as complete successfully', async () => {
      const mockData = {
        step: 'verify',
        sessionId: 'session-123',
        diditStatus: 'completed'
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register/doctor', {
        method: 'POST',
        body: JSON.stringify(mockData)
      });

      // Mock de admin client
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const mockAdmin = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { id: 'reg-123' },
                error: null
              })
            }))
          })),
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              error: null
            })
          }))
        }))
      };
      vi.mocked(createAdminClient).mockReturnValue(mockAdmin as any);

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.step).toBe('verify');
      expect(responseData.data.registrationId).toBe('reg-123');
      expect(responseData.data.verificationCompleted).toBe(true);
    });

    it('should return error for missing sessionId', async () => {
      const mockData = {
        step: 'verify',
        diditStatus: 'completed'
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register/doctor', {
        method: 'POST',
        body: JSON.stringify(mockData)
      });

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.step).toBe('verify');
      expect(responseData.error).toBe('sessionId es requerido');
    });
  });

  describe('Manejo de Errores', () => {
    it('should handle invalid step', async () => {
      const mockData = {
        step: 'invalid',
        email: 'test@example.com'
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register/doctor', {
        method: 'POST',
        body: JSON.stringify(mockData)
      });

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.step).toBe('error');
      expect(responseData.error).toBe('Step debe ser: temp, complete, finalize, o verify');
    });

    it('should handle server errors gracefully', async () => {
      const mockData = {
        step: 'temp',
        email: 'test@example.com'
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register/doctor', {
        method: 'POST',
        body: JSON.stringify(mockData)
      });

      // Mock de error en validación
      const { completeDoctorRegistrationSchema } = await import('@/lib/validations');
      vi.mocked(completeDoctorRegistrationSchema.safeParse).mockImplementation(() => {
        throw new Error('Error interno');
      });

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.step).toBe('error');
      expect(responseData.message).toBe('Error procesando registro temporal');
    });
  });
});
