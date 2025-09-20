/**
 * Laboratory Data Hook - Red-Salud Platform
 * 
 * Hook personalizado para manejo de datos del laboratorio médico.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  LabStats, 
  LabTest, 
  TestType, 
  TestStatus,
  UseLabDataReturn,
  TestResult 
} from '@/types/laboratory.types';
import { calculateAverageProcessingTime, calculateTestStatistics } from '@/lib/laboratory/lab-utils';

// ============================================================================
// HOOK PRINCIPAL PARA DATOS DEL LABORATORIO
// ============================================================================

export function useLabData(): UseLabDataReturn {
  const [stats, setStats] = useState<LabStats>({
    totalTests: 0,
    pendingResults: 0,
    completedToday: 0,
    urgentTests: 0,
    averageProcessingTime: 0,
    monthlyRevenue: 0
  });
  
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // DATOS MOCK PARA DESARROLLO
  // ============================================================================

  const generateMockTests = useCallback((): LabTest[] => {
    const mockTests: LabTest[] = [
      {
        id: '1',
        patient_name: 'María García',
        doctor_name: 'Dr. López',
        test_type: 'Hemograma completo',
        priority: 'medium',
        status: 'processing',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        expected_completion: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
        notes: 'Paciente en ayunas',
        sample_id: 'LAB240315001',
        technician_id: 'tech_001'
      },
      {
        id: '2',
        patient_name: 'Juan Pérez',
        doctor_name: 'Dr. Martínez',
        test_type: 'Perfil lipídico',
        priority: 'high',
        status: 'completed',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        expected_completion: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
        sample_id: 'LAB240315002',
        technician_id: 'tech_002'
      },
      {
        id: '3',
        patient_name: 'Ana Rodríguez',
        doctor_name: 'Dr. Silva',
        test_type: 'Glucosa en sangre',
        priority: 'urgent',
        status: 'received',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        expected_completion: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
        notes: 'Urgente - paciente diabético',
        sample_id: 'LAB240315003'
      },
      {
        id: '4',
        patient_name: 'Carlos Mendoza',
        doctor_name: 'Dr. García',
        test_type: 'Función renal',
        priority: 'medium',
        status: 'sent',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        expected_completion: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        sample_id: 'LAB240315004',
        technician_id: 'tech_001'
      },
      {
        id: '5',
        patient_name: 'Laura González',
        doctor_name: 'Dr. Torres',
        test_type: 'Cultivo de orina',
        priority: 'low',
        status: 'processing',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        expected_completion: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
        sample_id: 'LAB240315005',
        technician_id: 'tech_003'
      },
      {
        id: '6',
        patient_name: 'Roberto Silva',
        doctor_name: 'Dr. Morales',
        test_type: 'TSH',
        priority: 'medium',
        status: 'reviewed',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        expected_completion: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        sample_id: 'LAB240315006',
        technician_id: 'tech_002'
      }
    ];

    return mockTests;
  }, []);

  const generateMockTestTypes = useCallback((): TestType[] => {
    return [
      { 
        id: '1', 
        name: 'Hemograma completo', 
        category: 'Hematología', 
        processing_time: 24, 
        price: 85, 
        tests_count: 156,
        description: 'Análisis completo de células sanguíneas',
        preparation_instructions: 'No requiere ayuno'
      },
      { 
        id: '2', 
        name: 'Perfil lipídico', 
        category: 'Bioquímica', 
        processing_time: 4, 
        price: 65, 
        tests_count: 89,
        description: 'Evaluación de lípidos en sangre',
        preparation_instructions: '12 horas de ayuno'
      },
      { 
        id: '3', 
        name: 'Glucosa en sangre', 
        category: 'Bioquímica', 
        processing_time: 2, 
        price: 25, 
        tests_count: 234,
        description: 'Medición de glucosa sérica',
        preparation_instructions: '8 horas de ayuno'
      },
      { 
        id: '4', 
        name: 'Función renal', 
        category: 'Bioquímica', 
        processing_time: 6, 
        price: 95, 
        tests_count: 67,
        description: 'Evaluación de función renal (creatinina, BUN)',
        preparation_instructions: 'Hidratación normal'
      },
      { 
        id: '5', 
        name: 'Cultivo de orina', 
        category: 'Microbiología', 
        processing_time: 48, 
        price: 120, 
        tests_count: 45,
        description: 'Identificación de bacterias en orina',
        preparation_instructions: 'Primera orina de la mañana'
      },
      { 
        id: '6', 
        name: 'TSH', 
        category: 'Endocrinología', 
        processing_time: 8, 
        price: 75, 
        tests_count: 123,
        description: 'Hormona estimulante de tiroides',
        preparation_instructions: 'No requiere ayuno'
      },
      {
        id: '7',
        name: 'Troponinas',
        category: 'Bioquímica',
        processing_time: 1,
        price: 150,
        tests_count: 34,
        description: 'Marcadores de daño cardíaco',
        preparation_instructions: 'No requiere preparación especial'
      },
      {
        id: '8',
        name: 'PCR COVID-19',
        category: 'Microbiología',
        processing_time: 6,
        price: 180,
        tests_count: 89,
        description: 'Detección de SARS-CoV-2',
        preparation_instructions: 'Evitar comer/beber 30min antes'
      }
    ];
  }, []);

  // ============================================================================
  // FUNCIÓN PRINCIPAL DE CARGA DE DATOS
  // ============================================================================

  const fetchLaboratoryData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // En producción, aquí irían las llamadas reales a la API
      // const response = await supabase.from('lab_tests').select('*');
      
      const mockTests = generateMockTests();
      const mockTestTypes = generateMockTestTypes();

      setLabTests(mockTests);
      setTestTypes(mockTestTypes);

      // Calcular estadísticas
      const statistics = calculateTestStatistics(mockTests);
      const avgProcessingTime = calculateAverageProcessingTime(mockTests);

      setStats({
        totalTests: statistics.total * 50, // Simular más tests para el dashboard
        pendingResults: statistics.pending,
        completedToday: statistics.completedToday,
        urgentTests: statistics.urgent,
        averageProcessingTime: avgProcessingTime,
        monthlyRevenue: 285000 // Simulado
      });

    } catch (error) {
      console.error('Error fetching laboratory data:', error);
      setError('Error al cargar datos del laboratorio');
    } finally {
      setLoading(false);
    }
  }, [generateMockTests, generateMockTestTypes]);

  // ============================================================================
  // FUNCIONES DE ACTUALIZACIÓN
  // ============================================================================

  const updateTestStatus = useCallback(async (testId: string, status: TestStatus): Promise<void> => {
    try {
      // En producción, actualizar en la base de datos
      // await supabase.from('lab_tests').update({ status }).eq('id', testId);

      // Actualizar estado local
      setLabTests(prevTests => 
        prevTests.map(test => 
          test.id === testId 
            ? { ...test, status }
            : test
        )
      );

      // Recalcular estadísticas
      const updatedTests = labTests.map(test => 
        test.id === testId ? { ...test, status } : test
      );
      const statistics = calculateTestStatistics(updatedTests);
      
      setStats(prevStats => ({
        ...prevStats,
        pendingResults: statistics.pending,
        completedToday: statistics.completedToday
      }));

    } catch (error) {
      console.error('Error updating test status:', error);
      throw new Error('Error al actualizar el estado del test');
    }
  }, [labTests]);

  const addTestResult = useCallback(async (testId: string, result: Partial<TestResult>): Promise<void> => {
    try {
      // En producción, guardar resultado en la base de datos
      // await supabase.from('test_results').insert({ test_id: testId, ...result });

      // Actualizar el estado del test a completado
      await updateTestStatus(testId, 'completed');

      console.log('Test result added:', { testId, result });

    } catch (error) {
      console.error('Error adding test result:', error);
      throw new Error('Error al agregar resultado del test');
    }
  }, [updateTestStatus]);

  // ============================================================================
  // EFECTO DE INICIALIZACIÓN
  // ============================================================================

  useEffect(() => {
    fetchLaboratoryData();
  }, [fetchLaboratoryData]);

  // Refetch automático cada 5 minutos para datos en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchLaboratoryData();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [fetchLaboratoryData, loading]);

  // ============================================================================
  // RETURN DEL HOOK
  // ============================================================================

  return {
    stats,
    labTests,
    testTypes,
    loading,
    error,
    refetch: fetchLaboratoryData,
    updateTestStatus,
    addTestResult
  };
}

// ============================================================================
// HOOK PARA FILTRADO Y BÚSQUEDA
// ============================================================================

export function useLabFilters(tests: LabTest[]) {
  const [filteredTests, setFilteredTests] = useState<LabTest[]>(tests);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: '',
    dateRange: { start: '', end: '' }
  });

  const applyFilters = useCallback(() => {
    let filtered = tests;

    // Filtro por estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(test => test.status === filters.status);
    }

    // Filtro por prioridad
    if (filters.priority !== 'all') {
      filtered = filtered.filter(test => test.priority === filters.priority);
    }

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(test =>
        test.patient_name.toLowerCase().includes(searchLower) ||
        test.doctor_name.toLowerCase().includes(searchLower) ||
        test.test_type.toLowerCase().includes(searchLower) ||
        (test.notes && test.notes.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por rango de fechas
    if (filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      filtered = filtered.filter(test => {
        const testDate = new Date(test.created_at);
        return testDate >= startDate && testDate <= endDate;
      });
    }

    setFilteredTests(filtered);
  }, [tests, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const updateFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      status: 'all',
      priority: 'all',
      category: 'all',
      search: '',
      dateRange: { start: '', end: '' }
    });
  }, []);

  return {
    filteredTests,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters: Object.values(filters).some(v => v !== 'all' && v !== '')
  };
}

// ============================================================================
// HOOK PARA ESTADÍSTICAS EN TIEMPO REAL
// ============================================================================

export function useLabStatistics(tests: LabTest[]) {
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    urgent: 0,
    overdue: 0,
    avgProcessingTime: 0
  });

  useEffect(() => {
    const stats = calculateTestStatistics(tests);
    const avgTime = calculateAverageProcessingTime(tests);

    setStatistics({
      ...stats,
      avgProcessingTime: avgTime
    });
  }, [tests]);

  return statistics;
}
