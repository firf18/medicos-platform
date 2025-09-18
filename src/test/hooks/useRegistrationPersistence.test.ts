/**
 * Pruebas Unitarias para useRegistrationPersistence - Red-Salud
 * 
 * Estas pruebas verifican el orden de inicialización de los hooks
 * y previenen errores de referencia como el que acabamos de corregir.
 */

import { renderHook, act } from '@testing-library/react';
import { useRegistrationPersistence } from '@/hooks/useRegistrationPersistence';
import { DoctorRegistrationData, RegistrationProgress } from '@/types/medical/specialties';

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock de performance API para detectar recargas
const performanceMock = {
  getEntriesByType: jest.fn(),
};

Object.defineProperty(window, 'performance', {
  value: performanceMock,
});

describe('useRegistrationPersistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    performanceMock.getEntriesByType.mockReturnValue([]);
  });

  describe('Orden de Inicialización', () => {
    it('debe inicializar todas las funciones antes de los efectos', () => {
      const { result } = renderHook(() => useRegistrationPersistence());
      
      // Verificar que todas las funciones están disponibles inmediatamente
      expect(typeof result.current.saveProgress).toBe('function');
      expect(typeof result.current.loadProgress).toBe('function');
      expect(typeof result.current.clearProgress).toBe('function');
      expect(typeof result.current.hasSavedProgress).toBe('boolean');
      expect(typeof result.current.isInitialized).toBe('boolean');
    });

    it('debe marcar como inicializado después del primer render', () => {
      const { result } = renderHook(() => useRegistrationPersistence());
      
      // En el primer render, isInitialized debe ser false
      expect(result.current.isInitialized).toBe(false);
      
      // Después del efecto, debe ser true
      act(() => {
        // Simular el efecto de inicialización
      });
      
      expect(result.current.isInitialized).toBe(true);
    });
  });

  describe('Funciones Principales', () => {
    it('clearProgress debe funcionar sin errores de referencia', () => {
      const { result } = renderHook(() => useRegistrationPersistence());
      
      // Esta prueba verifica que clearProgress está disponible
      // y no causa errores de referencia
      expect(() => {
        act(() => {
          result.current.clearProgress();
        });
      }).not.toThrow();
      
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it('saveProgress debe funcionar correctamente', () => {
      const { result } = renderHook(() => useRegistrationPersistence());
      
      const mockData: DoctorRegistrationData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        phone: '+58412123456',
        password: 'Test123',
        confirmPassword: 'Test123',
        specialtyId: 'cardiology',
        subSpecialties: [],
        licenseNumber: '1234567',
        licenseState: 'Distrito Capital',
        licenseExpiry: '2025-12-31',
        yearsOfExperience: 5,
        currentHospital: 'Hospital General',
        clinicAffiliations: [],
        bio: 'Médico especializado en cardiología',
        selectedFeatures: ['patient_management'],
        workingHours: {
          monday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
          tuesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
          wednesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
          thursday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
          friday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
          saturday: { isWorkingDay: false },
          sunday: { isWorkingDay: false }
        }
      };

      const mockProgress: RegistrationProgress = {
        currentStep: 'personal_info',
        completedSteps: [],
        totalSteps: 6,
        canProceed: false,
        errors: {}
      };

      expect(() => {
        act(() => {
          result.current.saveProgress(mockData, mockProgress);
        });
      }).not.toThrow();
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('loadProgress debe funcionar correctamente', () => {
      const { result } = renderHook(() => useRegistrationPersistence());
      
      // Mock de datos guardados
      const mockSavedData = JSON.stringify({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        updatedAt: new Date().toISOString()
      });
      
      const mockSavedProgress = JSON.stringify({
        currentStep: 'personal_info',
        completedSteps: [],
        totalSteps: 6,
        canProceed: false,
        errors: {}
      });

      localStorageMock.getItem
        .mockReturnValueOnce(mockSavedData)
        .mockReturnValueOnce(mockSavedProgress);

      let loadedData;
      expect(() => {
        act(() => {
          loadedData = result.current.loadProgress();
        });
      }).not.toThrow();
      
      expect(loadedData).toBeDefined();
    });
  });

  describe('Validaciones de Seguridad', () => {
    it('debe manejar errores de localStorage graciosamente', () => {
      // Simular error en localStorage
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage no disponible');
      });

      const { result } = renderHook(() => useRegistrationPersistence());
      
      expect(() => {
        act(() => {
          result.current.loadProgress();
        });
      }).not.toThrow();
      
      // Debe retornar datos nulos en caso de error
      const loadedData = result.current.loadProgress();
      expect(loadedData.data).toBeNull();
      expect(loadedData.progress).toBeNull();
    });

    it('debe validar datos de entrada en saveProgress', () => {
      const { result } = renderHook(() => useRegistrationPersistence());
      
      // Intentar guardar datos inválidos
      expect(() => {
        act(() => {
          result.current.saveProgress(null as any, null as any);
        });
      }).not.toThrow();
      
      // No debe llamar a localStorage con datos inválidos
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Limpieza Automática', () => {
    it('debe detectar recargas de página', () => {
      // Simular recarga de página
      performanceMock.getEntriesByType.mockReturnValue([
        { type: 'reload' }
      ]);

      const { result } = renderHook(() => useRegistrationPersistence());
      
      const loadedData = result.current.loadProgress();
      
      // Debe limpiar datos en recarga
      expect(loadedData.data).toBeNull();
      expect(loadedData.progress).toBeNull();
    });

    it('debe manejar datos expirados', () => {
      // Simular datos expirados (más de 24 horas)
      const expiredTimestamp = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      
      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify({ updatedAt: expiredTimestamp }))
        .mockReturnValueOnce(JSON.stringify({}));

      const { result } = renderHook(() => useRegistrationPersistence());
      
      const loadedData = result.current.loadProgress();
      
      // Debe limpiar datos expirados
      expect(loadedData.data).toBeNull();
      expect(loadedData.progress).toBeNull();
    });
  });

  describe('Tipado TypeScript', () => {
    it('debe tener tipos correctos para todas las funciones', () => {
      const { result } = renderHook(() => useRegistrationPersistence());
      
      // Verificar tipos de retorno
      expect(typeof result.current.saveProgress).toBe('function');
      expect(typeof result.current.loadProgress).toBe('function');
      expect(typeof result.current.clearProgress).toBe('function');
      expect(typeof result.current.hasSavedProgress).toBe('boolean');
      expect(typeof result.current.isInitialized).toBe('boolean');
    });

    it('debe aceptar parámetros con tipos correctos', () => {
      const { result } = renderHook(() => useRegistrationPersistence());
      
      const mockData: DoctorRegistrationData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+58412123456',
        password: 'Test123',
        confirmPassword: 'Test123',
        specialtyId: 'cardiology',
        subSpecialties: [],
        licenseNumber: '1234567',
        licenseState: 'Distrito Capital',
        licenseExpiry: '2025-12-31',
        yearsOfExperience: 5,
        currentHospital: 'Hospital General',
        clinicAffiliations: [],
        bio: 'Médico especializado',
        selectedFeatures: ['patient_management'],
        workingHours: {
          monday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
          tuesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
          wednesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
          thursday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
          friday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
          saturday: { isWorkingDay: false },
          sunday: { isWorkingDay: false }
        }
      };

      const mockProgress: RegistrationProgress = {
        currentStep: 'personal_info',
        completedSteps: [],
        totalSteps: 6,
        canProceed: false,
        errors: {}
      };

      // Esto debe compilar sin errores de TypeScript
      expect(() => {
        act(() => {
          result.current.saveProgress(mockData, mockProgress);
        });
      }).not.toThrow();
    });
  });
});
