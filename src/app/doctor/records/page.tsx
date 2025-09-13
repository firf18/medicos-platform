'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth';
import { createClient } from '@/lib/supabase/client';
import { FileText, User, Calendar, Search, Filter, Plus, Eye, Download } from 'lucide-react';
import Link from 'next/link';

interface MedicalRecord {
  id: string;
  patient_id: string;
  visit_date: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  created_at: string;
  patients?: {
    profiles?: {
      first_name?: string;
      last_name?: string;
      email?: string;
    };
  };
}

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [followUpFilter, setFollowUpFilter] = useState<'all' | 'required' | 'not_required'>('all');
  const supabase = createClient();

  useEffect(() => {
    fetchRecords();
  }, [dateFilter, followUpFilter]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      
      // Por ahora, vamos a obtener de appointments completadas como registros médicos
      let query = supabase
        .from('appointments')
        .select('*, patients(*, profiles(*))')
        .eq('doctor_id', user?.id || '')
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: false });

      // Aplicar filtros de fecha
      const now = new Date();
      switch (dateFilter) {
        case 'today':
          const today = now.toISOString().split('T')[0];
          query = query
            .gte('scheduled_at', `${today}T00:00:00`)
            .lt('scheduled_at', `${today}T23:59:59`);
          break;
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          query = query.gte('scheduled_at', weekAgo.toISOString());
          break;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          query = query.gte('scheduled_at', monthAgo.toISOString());
          break;
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transformar appointments en medical records
      const transformedRecords = data?.map(appointment => ({
        id: (appointment as any).id,
        patient_id: (appointment as any).patient_id,
        visit_date: (appointment as any).scheduled_at,
        diagnosis: (appointment as any).description || 'Consulta general',
        treatment: (appointment as any).notes || 'Tratamiento por definir',
        notes: (appointment as any).notes,
        follow_up_required: Math.random() > 0.7, // Simulado
        follow_up_date: null,
        created_at: (appointment as any).created_at,
        patients: (appointment as any).patients
      })) || [];

      // Aplicar filtro de seguimiento
      let filteredRecords = transformedRecords;
      if (followUpFilter === 'required') {
        filteredRecords = transformedRecords.filter(record => record.follow_up_required);
      } else if (followUpFilter === 'not_required') {
        filteredRecords = transformedRecords.filter(record => !record.follow_up_required);
      }

      setRecords(filteredRecords);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;
    const patientName = `${record.patients?.profiles?.first_name || ''} ${record.patients?.profiles?.last_name || ''}`.toLowerCase();
    const diagnosis = record.diagnosis.toLowerCase();
    return patientName.includes(searchTerm.toLowerCase()) || 
           diagnosis.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse border-b border-gray-200 pb-4 mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expedientes Médicos</h1>
            <p className="mt-1 text-gray-600">
              Historial de consultas y tratamientos de tus pacientes
            </p>
          </div>
          <Link
            href="/doctor/records/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Expediente
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por paciente o diagnóstico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro de fecha */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>

          {/* Filtro de seguimiento */}
          <select
            value={followUpFilter}
            onChange={(e) => setFollowUpFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los casos</option>
            <option value="required">Requieren seguimiento</option>
            <option value="not_required">No requieren seguimiento</option>
          </select>

          {/* Contador */}
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="mr-2 h-4 w-4" />
            {filteredRecords.length} expediente(s)
          </div>
        </div>
      </div>

      {/* Lista de Expedientes */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Expedientes Médicos
          </h3>
        </div>
        
        {filteredRecords.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredRecords.map((record) => (
              <div key={record.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {record.patients?.profiles?.first_name} {record.patients?.profiles?.last_name}
                        </p>
                        {record.follow_up_required && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            Seguimiento requerido
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        {record.diagnosis}
                      </p>
                      <p className="text-sm text-gray-500">
                        {record.treatment}
                      </p>
                      <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(record.visit_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {record.patients?.profiles?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/doctor/records/${record.id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ver
                    </Link>
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <Download className="mr-1 h-4 w-4" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay expedientes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'No se encontraron expedientes que coincidan con tu búsqueda.' 
                : 'Aún no has creado ningún expediente médico.'}
            </p>
            <div className="mt-6">
              <Link
                href="/doctor/records/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Expediente
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Expedientes
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {records.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Requieren Seguimiento
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {records.filter(r => r.follow_up_required).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pacientes Únicos
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {new Set(records.map(r => r.patient_id)).size}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
