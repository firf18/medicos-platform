# 🛠️ Guía de Desarrollo - Platform Médicos

Esta guía contiene información detallada para desarrolladores que trabajen en Platform Médicos.

## 📋 Índice

1. [Configuración del Entorno](#-configuración-del-entorno)
2. [Arquitectura del Código](#-arquitectura-del-código)
3. [Patrones y Convenciones](#-patrones-y-convenciones)
4. [Base de Datos](#-base-de-datos)
5. [Testing](#-testing)
6. [Performance](#-performance)
7. [Seguridad](#-seguridad)
8. [Deployment](#-deployment)

## 🔧 Configuración del Entorno

### Herramientas Requeridas

```bash
# Node.js (v18.17+)
node --version

# Package Manager
npm --version  # o yarn --version

# Git
git --version

# Editor recomendado: VS Code con extensiones:
# - TypeScript + JavaScript
# - Tailwind CSS IntelliSense
# - ES7+ React/Redux/React-Native snippets
# - Auto Rename Tag
# - GitLens
```

### Setup Inicial

```bash
# 1. Clonar y configurar
git clone https://github.com/tu-usuario/platform-medicos.git
cd platform-medicos
npm install

# 2. Configurar pre-commit hooks
npm run prepare

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Configurar base de datos
npm run db:reset    # Reset completo
npm run db:migrate  # Solo migraciones
npm run db:seed     # Datos de prueba

# 5. Verificar instalación
npm run dev
npm run test
npm run lint
npm run type-check
```

## 🏗️ Arquitectura del Código

### Principios Arquitectónicos

#### 1. Domain-Driven Design (DDD)
```typescript
// Estructura por dominios médicos
src/domains/
├── auth/           # Autenticación y registro
├── medical-records/# Historiales médicos
├── appointments/   # Citas médicas
├── compliance/     # Verificación y auditoría
└── emergency/      # Servicios de emergencia
```

#### 2. Clean Architecture
```typescript
// Capas bien definidas
src/
├── components/     # UI Layer (Presentación)
├── hooks/         # Application Layer (Casos de uso)
├── domains/       # Domain Layer (Lógica de negocio)
├── lib/          # Infrastructure Layer (Datos y servicios)
└── types/        # Shared Layer (Contratos)
```

#### 3. Feature-First Organization
```typescript
// Organización por características
src/features/auth/
├── components/    # Componentes específicos
├── hooks/        # Hooks del feature
├── services/     # Lógica de negocio
├── types/        # Tipos específicos
└── __tests__/    # Tests del feature
```

### Patrones de Diseño Implementados

#### 1. Repository Pattern
```typescript
// src/lib/repositories/PatientRepository.ts
export class PatientRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Patient | null> {
    const { data, error } = await this.supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
}
```

#### 2. Service Layer Pattern
```typescript
// src/services/PatientService.ts
export class PatientService {
  constructor(
    private patientRepo: PatientRepository,
    private auditService: AuditService
  ) {}

  async getPatient(id: string, requesterId: string): Promise<Patient> {
    // Verificar permisos
    await this.checkPermissions(requesterId, id);
    
    // Obtener datos
    const patient = await this.patientRepo.findById(id);
    
    // Auditar acceso
    await this.auditService.logAccess({
      resourceType: 'patient',
      resourceId: id,
      userId: requesterId,
      action: 'read'
    });
    
    return patient;
  }
}
```

#### 3. Custom Hooks Pattern
```typescript
// src/hooks/usePatient.ts
export const usePatient = (patientId: string) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatient = useCallback(async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatient(patientId, userId);
      setPatient(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [patientId, userId]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  return { patient, loading, error, refetch: fetchPatient };
};
```

## 📝 Patrones y Convenciones

### Nomenclatura de Archivos

```bash
# Componentes React
PascalCase.tsx           # MedicalRecordForm.tsx
kebab-case.tsx          # medical-record-form.tsx (alternativo)

# Hooks
camelCase.ts            # useMedicalHistory.ts

# Servicios y utilidades
camelCase.ts            # medicalRecordService.ts

# Tipos
PascalCase.types.ts     # MedicalRecord.types.ts

# Tests
*.test.ts               # medicalRecord.test.ts
*.spec.ts               # medicalRecord.spec.ts
```

### Estructura de Componentes

```typescript
// src/components/medical/MedicalRecordForm.tsx
import React, { useState, useCallback, memo } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useMedicalRecord } from '@/hooks/useMedicalRecord';
import type { MedicalRecord, FormErrors } from '@/types/medical';

// 1. Schemas de validación
const MedicalRecordSchema = z.object({
  diagnosis: z.string().min(1, 'Diagnóstico requerido'),
  treatment: z.string().min(1, 'Tratamiento requerido'),
  notes: z.string().optional()
});

// 2. Interfaces
interface MedicalRecordFormProps {
  patientId: string;
  initialData?: Partial<MedicalRecord>;
  onSave: (record: MedicalRecord) => Promise<void>;
  onCancel: () => void;
}

// 3. Componente principal
const MedicalRecordForm: React.FC<MedicalRecordFormProps> = memo(({
  patientId,
  initialData,
  onSave,
  onCancel
}) => {
  // Estados
  const [formData, setFormData] = useState<Partial<MedicalRecord>>(
    initialData || {}
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const { createRecord, updateRecord } = useMedicalRecord();

  // Handlers
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validar
      const validatedData = MedicalRecordSchema.parse(formData);
      
      // Guardar
      const record = initialData?.id
        ? await updateRecord(initialData.id, validatedData)
        : await createRecord(patientId, validatedData);
      
      await onSave(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(formatZodErrors(error));
      } else {
        setErrors({ general: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, initialData, patientId, onSave, createRecord, updateRecord]);

  // Render
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Campos del formulario */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {initialData?.id ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
});

MedicalRecordForm.displayName = 'MedicalRecordForm';

export default MedicalRecordForm;
```

### Manejo de Estados

#### 1. Estado Local vs Global
```typescript
// ✅ Estado local para UI temporal
const [isModalOpen, setIsModalOpen] = useState(false);
const [formData, setFormData] = useState({});

// ✅ Estado global para datos compartidos
const { user } = useAuth();
const { notifications } = useNotifications();

// ❌ Evitar estado global innecesario
// const { modalState } = useGlobalModal(); // Mejor local
```

#### 2. React Query para Estado del Servidor
```typescript
// src/hooks/useMedicalRecords.ts
export const useMedicalRecords = (patientId: string) => {
  return useQuery({
    queryKey: ['medicalRecords', patientId],
    queryFn: () => medicalRecordService.getByPatient(patientId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      logSecurityEvent('data_access_error', 'Failed to fetch medical records', {
        patientId,
        error: error.message
      });
    }
  });
};

// Mutation con optimistic updates
export const useCreateMedicalRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createMedicalRecord,
    onMutate: async (newRecord) => {
      // Cancelar queries outgoing
      await queryClient.cancelQueries(['medicalRecords', newRecord.patientId]);
      
      // Snapshot del estado anterior
      const previousRecords = queryClient.getQueryData(['medicalRecords', newRecord.patientId]);
      
      // Optimistic update
      queryClient.setQueryData(['medicalRecords', newRecord.patientId], (old: any) => [
        ...old,
        { ...newRecord, id: 'temp-' + Date.now(), isOptimistic: true }
      ]);
      
      return { previousRecords };
    },
    onError: (err, newRecord, context) => {
      // Rollback en caso de error
      queryClient.setQueryData(
        ['medicalRecords', newRecord.patientId],
        context?.previousRecords
      );
    },
    onSettled: (data, error, variables) => {
      // Invalidar cache
      queryClient.invalidateQueries(['medicalRecords', variables.patientId]);
    }
  });
};
```

### Validaciones con Zod

```typescript
// src/lib/validations/medical.validations.ts
import { z } from 'zod';

// Schemas base
export const PatientSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  lastName: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\+58\d{10}$/, 'Teléfono venezolano inválido'),
  dateOfBirth: z.string().datetime(),
  bloodType: z.enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']).optional(),
  allergies: z.array(z.string()).default([]),
  medicalHistory: z.string().optional()
});

// Schemas para formularios
export const CreatePatientSchema = PatientSchema.omit({ id: true });
export const UpdatePatientSchema = PatientSchema.partial().required({ id: true });

// Validación médica específica
export const VitalSignsSchema = z.object({
  bloodPressureSystolic: z.number().min(70).max(250),
  bloodPressureDiastolic: z.number().min(40).max(150),
  heartRate: z.number().min(30).max(220),
  temperature: z.number().min(35).max(42),
  oxygenSaturation: z.number().min(80).max(100),
  weight: z.number().min(1).max(300).optional(),
  height: z.number().min(30).max(250).optional()
}).refine(
  (data) => data.bloodPressureSystolic > data.bloodPressureDiastolic,
  {
    message: "Presión sistólica debe ser mayor que diastólica",
    path: ["bloodPressureSystolic"]
  }
);

// Helper para validación en runtime
export const validateAndTransform = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { success: false, errors: ['Error de validación desconocido'] };
  }
};
```

## 🗄️ Base de Datos

### Row Level Security (RLS)

```sql
-- Política para médicos: solo pueden acceder a sus pacientes
CREATE POLICY "doctors_access_their_patients" ON medical_records
  FOR ALL USING (
    auth.role() = 'doctor' AND
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.patient_id = medical_records.patient_id
      AND appointments.doctor_id = auth.uid()
      AND appointments.status = 'active'
    )
  );

-- Política para pacientes: solo sus propios datos
CREATE POLICY "patients_access_own_data" ON medical_records
  FOR SELECT USING (
    auth.role() = 'patient' AND
    patient_id = auth.uid()
  );

-- Política para emergencias: acceso temporal
CREATE POLICY "emergency_access" ON medical_records
  FOR SELECT USING (
    auth.role() = 'emergency_personnel' AND
    EXISTS (
      SELECT 1 FROM emergency_sessions
      WHERE emergency_sessions.patient_id = medical_records.patient_id
      AND emergency_sessions.is_active = true
      AND emergency_sessions.expires_at > NOW()
    )
  );
```

### Migraciones

```typescript
// migrations/001_create_medical_records.ts
export const up = async (sql: any) => {
  await sql`
    CREATE TABLE medical_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
      diagnosis TEXT NOT NULL,
      treatment TEXT NOT NULL,
      medications JSONB DEFAULT '[]',
      notes TEXT,
      is_confidential BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by UUID NOT NULL REFERENCES auth.users(id),
      updated_by UUID REFERENCES auth.users(id)
    );

    -- Indexes para performance
    CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
    CREATE INDEX idx_medical_records_doctor_id ON medical_records(doctor_id);
    CREATE INDEX idx_medical_records_created_at ON medical_records(created_at DESC);

    -- Trigger para updated_at
    CREATE TRIGGER update_medical_records_updated_at
      BEFORE UPDATE ON medical_records
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    -- Habilitar RLS
    ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
  `;
};

export const down = async (sql: any) => {
  await sql`DROP TABLE IF EXISTS medical_records CASCADE;`;
};
```

## 🧪 Testing

### Estructura de Tests

```bash
src/
├── __tests__/          # Tests globales
├── components/
│   └── __tests__/      # Tests de componentes
├── hooks/
│   └── __tests__/      # Tests de hooks
├── lib/
│   └── __tests__/      # Tests de utilidades
└── test/
    ├── setup.ts        # Configuración global
    ├── mocks/          # Mocks reutilizables
    └── utils/          # Utilidades de testing
```

### Testing de Componentes

```typescript
// src/components/__tests__/MedicalRecordForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MedicalRecordForm from '../MedicalRecordForm';
import { mockMedicalRecord, mockPatient } from '@/test/mocks';

// Setup helper
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('MedicalRecordForm', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields correctly', () => {
    renderWithProviders(
      <MedicalRecordForm
        patientId={mockPatient.id}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/diagnóstico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tratamiento/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear/i })).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <MedicalRecordForm
        patientId={mockPatient.id}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Intentar enviar sin llenar campos
    await user.click(screen.getByRole('button', { name: /crear/i }));

    await waitFor(() => {
      expect(screen.getByText(/diagnóstico requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/tratamiento requerido/i)).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <MedicalRecordForm
        patientId={mockPatient.id}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Llenar formulario
    await user.type(screen.getByLabelText(/diagnóstico/i), 'Hipertensión arterial');
    await user.type(screen.getByLabelText(/tratamiento/i), 'Medicación antihipertensiva');

    // Enviar
    await user.click(screen.getByRole('button', { name: /crear/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          diagnosis: 'Hipertensión arterial',
          treatment: 'Medicación antihipertensiva'
        })
      );
    });
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();
    mockOnSave.mockRejectedValueOnce(new Error('API Error'));

    renderWithProviders(
      <MedicalRecordForm
        patientId={mockPatient.id}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Llenar y enviar formulario
    await user.type(screen.getByLabelText(/diagnóstico/i), 'Test');
    await user.type(screen.getByLabelText(/tratamiento/i), 'Test');
    await user.click(screen.getByRole('button', { name: /crear/i }));

    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });
  });
});
```

### Testing de Hooks

```typescript
// src/hooks/__tests__/useMedicalRecord.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMedicalRecord } from '../useMedicalRecord';
import { mockMedicalRecord } from '@/test/mocks';
import * as medicalRecordService from '@/services/medicalRecordService';

jest.mock('@/services/medicalRecordService');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useMedicalRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch medical record successfully', async () => {
    const mockService = jest.mocked(medicalRecordService);
    mockService.getById.mockResolvedValueOnce(mockMedicalRecord);

    const { result } = renderHook(
      () => useMedicalRecord(mockMedicalRecord.id),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockMedicalRecord);
      expect(result.current.error).toBeNull();
    });

    expect(mockService.getById).toHaveBeenCalledWith(mockMedicalRecord.id);
  });

  it('should handle fetch errors', async () => {
    const mockService = jest.mocked(medicalRecordService);
    const error = new Error('Not found');
    mockService.getById.mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => useMedicalRecord('non-existent-id'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toEqual(error);
      expect(result.current.data).toBeUndefined();
    });
  });
});
```

### E2E Testing con Cypress

```typescript
// cypress/e2e/medical-record-flow.cy.ts
describe('Medical Record Flow', () => {
  beforeEach(() => {
    cy.login('doctor@test.com', 'password');
    cy.visit('/doctor/dashboard');
  });

  it('should create a new medical record', () => {
    // Navegar a paciente
    cy.get('[data-testid=patients-section]').click();
    cy.get('[data-testid=patient-item]').first().click();

    // Crear registro médico
    cy.get('[data-testid=new-record-button]').click();
    
    // Llenar formulario
    cy.get('[data-testid=diagnosis-input]').type('Hipertensión arterial');
    cy.get('[data-testid=treatment-input]').type('Medicación antihipertensiva');
    
    // Enviar
    cy.get('[data-testid=save-record-button]').click();

    // Verificar éxito
    cy.get('[data-testid=success-message]').should('contain', 'Registro médico creado');
    cy.get('[data-testid=medical-records-list]').should('contain', 'Hipertensión arterial');
  });

  it('should validate required fields', () => {
    cy.get('[data-testid=patients-section]').click();
    cy.get('[data-testid=patient-item]').first().click();
    cy.get('[data-testid=new-record-button]').click();
    
    // Intentar enviar sin datos
    cy.get('[data-testid=save-record-button]').click();
    
    // Verificar errores
    cy.get('[data-testid=diagnosis-error]').should('contain', 'Diagnóstico requerido');
    cy.get('[data-testid=treatment-error]').should('contain', 'Tratamiento requerido');
  });
});
```

## ⚡ Performance

### Optimizaciones de React

```typescript
// 1. Memoización selectiva
const MedicalRecordCard = memo<MedicalRecordCardProps>(({ record, onEdit }) => {
  return (
    <div className="medical-record-card">
      <h3>{record.diagnosis}</h3>
      <p>{record.treatment}</p>
      <Button onClick={() => onEdit(record.id)}>Editar</Button>
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparación personalizada
  return prevProps.record.id === nextProps.record.id &&
         prevProps.record.updated_at === nextProps.record.updated_at;
});

// 2. useCallback para funciones estables
const PatientDashboard = ({ patientId }: { patientId: string }) => {
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);

  const handleRecordSelect = useCallback((recordId: string) => {
    setSelectedRecord(recordId);
    logAnalyticsEvent('medical_record_selected', { recordId, patientId });
  }, [patientId]); // Solo recrear si cambia patientId

  // ... resto del componente
};

// 3. Lazy loading de componentes pesados
const MedicalRecordEditor = lazy(() => import('./MedicalRecordEditor'));
const ImagingViewer = lazy(() => import('./ImagingViewer'));

const PatientView = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <Suspense fallback={<LoadingSkeleton />}>
        {activeTab === 'records' && <MedicalRecordEditor />}
        {activeTab === 'imaging' && <ImagingViewer />}
      </Suspense>
    </div>
  );
};
```

### Optimizaciones de Base de Datos

```typescript
// 1. Paginación eficiente
export const useMedicalRecordsPaginated = (
  patientId: string,
  pageSize: number = 20
) => {
  return useInfiniteQuery({
    queryKey: ['medicalRecords', patientId, 'paginated'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          id,
          diagnosis,
          treatment,
          created_at,
          doctor:doctors(id, first_name, last_name)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);

      if (error) throw error;
      return {
        data,
        nextPage: data.length === pageSize ? pageParam + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000
  });
};

// 2. Prefetching inteligente
export const usePrefetchPatientData = () => {
  const queryClient = useQueryClient();

  const prefetchPatient = useCallback(async (patientId: string) => {
    await Promise.all([
      // Prefetch datos básicos
      queryClient.prefetchQuery({
        queryKey: ['patient', patientId],
        queryFn: () => patientService.getById(patientId),
        staleTime: 10 * 60 * 1000
      }),
      
      // Prefetch registros recientes
      queryClient.prefetchQuery({
        queryKey: ['medicalRecords', patientId, 'recent'],
        queryFn: () => medicalRecordService.getRecent(patientId, 5),
        staleTime: 5 * 60 * 1000
      })
    ]);
  }, [queryClient]);

  return { prefetchPatient };
};

// 3. Optimistic updates
export const useUpdateMedicalRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMedicalRecord,
    onMutate: async ({ id, updates }) => {
      // Cancelar queries relacionadas
      await queryClient.cancelQueries(['medicalRecord', id]);
      await queryClient.cancelQueries(['medicalRecords']);

      // Snapshot del estado anterior
      const previousRecord = queryClient.getQueryData(['medicalRecord', id]);
      
      // Optimistic update
      queryClient.setQueryData(['medicalRecord', id], (old: any) => ({
        ...old,
        ...updates,
        updated_at: new Date().toISOString(),
        isOptimistic: true
      }));

      return { previousRecord };
    },
    onError: (err, { id }, context) => {
      // Rollback en caso de error
      if (context?.previousRecord) {
        queryClient.setQueryData(['medicalRecord', id], context.previousRecord);
      }
    },
    onSettled: (data, error, { id }) => {
      // Refetch para sincronizar
      queryClient.invalidateQueries(['medicalRecord', id]);
      queryClient.invalidateQueries(['medicalRecords']);
    }
  });
};
```

## 🔐 Seguridad

### Autenticación y Autorización

```typescript
// src/lib/auth/permissions.ts
export enum MedicalRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  ADMIN = 'admin',
  EMERGENCY = 'emergency'
}

export enum Permission {
  READ_MEDICAL_RECORDS = 'read:medical_records',
  WRITE_MEDICAL_RECORDS = 'write:medical_records',
  READ_PATIENT_DATA = 'read:patient_data',
  MANAGE_APPOINTMENTS = 'manage:appointments',
  ACCESS_EMERGENCY_DATA = 'access:emergency_data'
}

// Matriz de permisos por rol
const ROLE_PERMISSIONS: Record<MedicalRole, Permission[]> = {
  [MedicalRole.PATIENT]: [
    Permission.READ_PATIENT_DATA // Solo sus propios datos
  ],
  [MedicalRole.DOCTOR]: [
    Permission.READ_MEDICAL_RECORDS,
    Permission.WRITE_MEDICAL_RECORDS,
    Permission.READ_PATIENT_DATA,
    Permission.MANAGE_APPOINTMENTS
  ],
  [MedicalRole.NURSE]: [
    Permission.READ_MEDICAL_RECORDS,
    Permission.READ_PATIENT_DATA,
    Permission.MANAGE_APPOINTMENTS
  ],
  [MedicalRole.EMERGENCY]: [
    Permission.READ_MEDICAL_RECORDS,
    Permission.READ_PATIENT_DATA,
    Permission.ACCESS_EMERGENCY_DATA
  ],
  [MedicalRole.ADMIN]: Object.values(Permission)
};

export const hasPermission = (
  userRole: MedicalRole,
  permission: Permission
): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
};

// Hook para verificar permisos
export const usePermissions = () => {
  const { user } = useAuth();
  
  const checkPermission = useCallback((permission: Permission): boolean => {
    if (!user?.role) return false;
    return hasPermission(user.role, permission);
  }, [user?.role]);

  const requirePermission = useCallback((permission: Permission): void => {
    if (!checkPermission(permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
  }, [checkPermission]);

  return { checkPermission, requirePermission };
};
```

### Validación de Datos Médicos

```typescript
// src/lib/security/dataValidation.ts
import DOMPurify from 'dompurify';
import { z } from 'zod';

// Sanitización de datos de entrada
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No permitir HTML
    ALLOWED_ATTR: []
  });
};

// Validación de datos médicos sensibles
export const validateMedicalData = (data: unknown) => {
  const schema = z.object({
    patientId: z.string().uuid(),
    diagnosis: z.string().min(1).max(1000).transform(sanitizeInput),
    treatment: z.string().min(1).max(2000).transform(sanitizeInput),
    medications: z.array(z.object({
      name: z.string().min(1).max(200).transform(sanitizeInput),
      dosage: z.string().min(1).max(100).transform(sanitizeInput),
      frequency: z.string().min(1).max(100).transform(sanitizeInput)
    })).default([]),
    notes: z.string().max(5000).optional().transform(val => 
      val ? sanitizeInput(val) : undefined
    )
  });

  return schema.parse(data);
};

// Rate limiting para operaciones sensibles
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minuto
): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
};
```

### Logging de Seguridad

```typescript
// src/lib/security/auditLog.ts
export interface AuditLogEntry {
  eventType: 'access' | 'modification' | 'deletion' | 'export' | 'login' | 'logout';
  userId: string;
  userRole: string;
  resourceType: 'patient' | 'medical_record' | 'appointment' | 'user';
  resourceId: string;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];

  async log(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    // Log local para desarrollo
    console.log('[AUDIT]', fullEntry);

    // En producción, enviar a servicio de auditoría
    if (process.env.NODE_ENV === 'production') {
      try {
        await this.sendToAuditService(fullEntry);
      } catch (error) {
        console.error('Failed to send audit log:', error);
        // Fallback: almacenar localmente para reintento
        this.logs.push(fullEntry);
      }
    }

    // Para eventos críticos, notificar inmediatamente
    if (entry.severity === 'critical') {
      await this.sendCriticalAlert(fullEntry);
    }
  }

  private async sendToAuditService(entry: AuditLogEntry): Promise<void> {
    // Implementar envío a servicio de auditoría externo
    const response = await fetch('/api/audit/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AUDIT_SERVICE_TOKEN}`
      },
      body: JSON.stringify(entry)
    });

    if (!response.ok) {
      throw new Error(`Audit service error: ${response.status}`);
    }
  }

  private async sendCriticalAlert(entry: AuditLogEntry): Promise<void> {
    // Notificar eventos críticos inmediatamente
    console.error('[CRITICAL AUDIT EVENT]', entry);
    
    // Aquí se podría integrar con servicios como:
    // - Slack/Discord webhooks
    // - Email alerts
    // - SMS notifications
    // - PagerDuty/OpsGenie
  }
}

export const auditLogger = new AuditLogger();

// Hook para logging automático
export const useAuditLog = () => {
  const { user } = useAuth();

  const logAccess = useCallback(async (
    resourceType: AuditLogEntry['resourceType'],
    resourceId: string,
    action: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!user) return;

    await auditLogger.log({
      eventType: 'access',
      userId: user.id,
      userRole: user.role,
      resourceType,
      resourceId,
      action,
      metadata,
      severity: 'low'
    });
  }, [user]);

  const logModification = useCallback(async (
    resourceType: AuditLogEntry['resourceType'],
    resourceId: string,
    action: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!user) return;

    await auditLogger.log({
      eventType: 'modification',
      userId: user.id,
      userRole: user.role,
      resourceType,
      resourceId,
      action,
      metadata,
      severity: 'medium'
    });
  }, [user]);

  return { logAccess, logModification };
};
```

## 🚀 Deployment

### Configuración de Producción

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: https: blob:;
              connect-src 'self' https://*.supabase.co https://api.didit.me;
              frame-src 'self' https://js.stripe.com;
            `.replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ];
  },

  // Rewrites para API
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health/check'
      }
    ];
  },

  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString()
  }
};

module.exports = nextConfig;
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  security:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run security audit
        run: npm audit --audit-level=high
      
      - name: Run Snyk security check
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  deploy:
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Run health checks
        run: |
          sleep 30  # Wait for deployment
          curl -f https://platform-medicos.vercel.app/api/health || exit 1
      
      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

Esta guía cubre los aspectos más importantes del desarrollo en Platform Médicos. Para más información específica, consulta la documentación de cada módulo individual.
