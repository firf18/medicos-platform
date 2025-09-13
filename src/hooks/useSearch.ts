'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SearchFilters } from '@/components/search/AdvancedSearchForm';
import type { SearchResult } from '@/components/search/SearchResultsList';

interface UseSearchOptions {
  debounceMs?: number;
  initialFilters?: Partial<SearchFilters>;
  autoSearch?: boolean;
}

export const useSearch = (options: UseSearchOptions = {}) => {
  const {
    debounceMs = 300,
    initialFilters = {},
    autoSearch = false
  } = options;

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    dateRange: { from: '', to: '' },
    entityType: 'all',
    status: '',
    specialty: '',
    location: '',
    urgency: 'all',
    ...initialFilters
  });

  const supabase = createClient();

  const searchPatients = async (query: string, filters: SearchFilters): Promise<SearchResult[]> => {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        id,
        created_at,
        profiles!inner(first_name, last_name, email, phone)
      `)
      .or(`profiles.first_name.ilike.%${query}%,profiles.last_name.ilike.%${query}%,profiles.email.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;

    return (data || []).map(patient => ({
      id: patient.id,
      type: 'patient' as const,
      title: `${patient.profiles?.first_name} ${patient.profiles?.last_name}`,
      subtitle: patient.profiles?.email,
      description: `Paciente registrado el ${new Date(patient.created_at).toLocaleDateString()}`,
      metadata: {
        email: patient.profiles?.email,
        phone: patient.profiles?.phone,
        date: patient.created_at
      },
      url: `/doctor/patients/${patient.id}`,
      highlighted: [query]
    }));
  };

  const searchDoctors = async (query: string, filters: SearchFilters): Promise<SearchResult[]> => {
    let doctorsQuery = supabase
      .from('doctors')
      .select(`
        id,
        license_number,
        created_at,
        profiles!inner(first_name, last_name, email, phone),
        specialties!inner(name)
      `)
      .or(`profiles.first_name.ilike.%${query}%,profiles.last_name.ilike.%${query}%,profiles.email.ilike.%${query}%,specialties.name.ilike.%${query}%`)
      .limit(10);

    if (filters.specialty) {
      doctorsQuery = doctorsQuery.eq('specialty_id', filters.specialty);
    }

    const { data, error } = await doctorsQuery;

    if (error) throw error;

    return (data || []).map(doctor => ({
      id: doctor.id,
      type: 'doctor' as const,
      title: `Dr. ${doctor.profiles?.first_name} ${doctor.profiles?.last_name}`,
      subtitle: doctor.specialties?.name,
      description: `Licencia: ${doctor.license_number}`,
      metadata: {
        email: doctor.profiles?.email,
        phone: doctor.profiles?.phone,
        specialty: doctor.specialties?.name,
        date: doctor.created_at
      },
      url: `/patient/doctors/${doctor.id}`,
      highlighted: [query],
      badge: {
        text: doctor.specialties?.name || 'Médico',
        color: 'green'
      }
    }));
  };

  const searchAppointments = async (query: string, filters: SearchFilters): Promise<SearchResult[]> => {
    let appointmentsQuery = supabase
      .from('appointments')
      .select(`
        id,
        scheduled_at,
        status,
        description,
        notes,
        patients!inner(profiles!inner(first_name, last_name, email)),
        doctors!inner(profiles!inner(first_name, last_name))
      `)
      .or(`description.ilike.%${query}%,notes.ilike.%${query}%,patients.profiles.first_name.ilike.%${query}%,patients.profiles.last_name.ilike.%${query}%`)
      .order('scheduled_at', { ascending: false })
      .limit(10);

    // Aplicar filtros de fecha
    if (filters.dateRange.from) {
      appointmentsQuery = appointmentsQuery.gte('scheduled_at', filters.dateRange.from);
    }
    if (filters.dateRange.to) {
      appointmentsQuery = appointmentsQuery.lte('scheduled_at', filters.dateRange.to);
    }

    // Aplicar filtro de estado
    if (filters.status) {
      appointmentsQuery = appointmentsQuery.eq('status', filters.status);
    }

    const { data, error } = await appointmentsQuery;

    if (error) throw error;

    return (data || []).map(appointment => {
      const patientName = `${appointment.patients?.profiles?.first_name} ${appointment.patients?.profiles?.last_name}`;
      const doctorName = `Dr. ${appointment.doctors?.profiles?.first_name} ${appointment.doctors?.profiles?.last_name}`;
      
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'confirmed': return 'green';
          case 'scheduled': return 'yellow';
          case 'completed': return 'blue';
          case 'cancelled': return 'red';
          default: return 'gray';
        }
      };

      const getStatusText = (status: string) => {
        switch (status) {
          case 'confirmed': return 'Confirmada';
          case 'scheduled': return 'Programada';
          case 'completed': return 'Completada';
          case 'cancelled': return 'Cancelada';
          default: return status;
        }
      };

      return {
        id: appointment.id,
        type: 'appointment' as const,
        title: `Cita: ${patientName}`,
        subtitle: `${doctorName} - ${appointment.description}`,
        description: appointment.notes || 'Sin notas adicionales',
        metadata: {
          date: appointment.scheduled_at,
          email: appointment.patients?.profiles?.email,
          status: appointment.status
        },
        url: `/doctor/appointments/${appointment.id}`,
        highlighted: [query],
        badge: {
          text: getStatusText(appointment.status),
          color: getStatusColor(appointment.status) as any
        },
        urgency: appointment.status === 'scheduled' && new Date(appointment.scheduled_at) < new Date(Date.now() + 24 * 60 * 60 * 1000) ? 'high' : 'medium'
      };
    });
  };

  const searchLabResults = async (query: string, filters: SearchFilters): Promise<SearchResult[]> => {
    // En un entorno real, esto buscaría en resultados de laboratorio
    // Por ahora simulamos algunos resultados
    if (!query.toLowerCase().includes('lab') && !query.toLowerCase().includes('análisis') && !query.toLowerCase().includes('resultado')) {
      return [];
    }

    return [
      {
        id: 'lab-1',
        type: 'lab_result',
        title: 'Análisis de Sangre - Juan Pérez',
        subtitle: 'Dr. García Martínez',
        description: 'Análisis completo de sangre con resultados normales',
        metadata: {
          date: '2024-01-15',
          status: 'completed'
        },
        url: '/doctor/lab-results/lab-1',
        highlighted: [query],
        badge: {
          text: 'Normal',
          color: 'green'
        }
      }
    ];
  };

  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    if (!searchFilters.query.trim() && searchFilters.entityType === 'all') {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let allResults: SearchResult[] = [];

      // Buscar según el tipo de entidad
      if (searchFilters.entityType === 'all' || searchFilters.entityType === 'patients') {
        const patientResults = await searchPatients(searchFilters.query, searchFilters);
        allResults = [...allResults, ...patientResults];
      }

      if (searchFilters.entityType === 'all' || searchFilters.entityType === 'doctors') {
        const doctorResults = await searchDoctors(searchFilters.query, searchFilters);
        allResults = [...allResults, ...doctorResults];
      }

      if (searchFilters.entityType === 'all' || searchFilters.entityType === 'appointments') {
        const appointmentResults = await searchAppointments(searchFilters.query, searchFilters);
        allResults = [...allResults, ...appointmentResults];
      }

      if (searchFilters.entityType === 'all' || searchFilters.entityType === 'lab_results') {
        const labResults = await searchLabResults(searchFilters.query, searchFilters);
        allResults = [...allResults, ...labResults];
      }

      // Ordenar por relevancia (simulado)
      allResults.sort((a, b) => {
        // Priorizar por urgencia
        if (a.urgency === 'high' && b.urgency !== 'high') return -1;
        if (b.urgency === 'high' && a.urgency !== 'high') return 1;
        
        // Luego por tipo (pacientes y citas primero)
        const typeOrder = { patient: 0, appointment: 1, doctor: 2, lab_result: 3, clinic: 4 };
        return typeOrder[a.type] - typeOrder[b.type];
      });

      setResults(allResults);
    } catch (err) {
      console.error('Search error:', err);
      setError('Error al realizar la búsqueda. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (!autoSearch || !filters.query.trim()) return;

    const timeoutId = setTimeout(() => {
      performSearch(filters);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [filters, performSearch, debounceMs, autoSearch]);

  const search = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (!autoSearch) {
      performSearch(newFilters);
    }
  }, [performSearch, autoSearch]);

  const clearSearch = useCallback(() => {
    setResults([]);
    setError(null);
    setFilters({
      query: '',
      dateRange: { from: '', to: '' },
      entityType: 'all',
      status: '',
      specialty: '',
      location: '',
      urgency: 'all'
    });
  }, []);

  return {
    results,
    loading,
    error,
    filters,
    search,
    clearSearch,
    performSearch
  };
}
