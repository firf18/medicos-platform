'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  DocumentTextIcon, 
  CalendarIcon, 
  UserIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface MedicalHistorySectionProps {
  userId: string;
}

interface MedicalRecord {
  id: string;
  appointment_id: string;
  doctor_id: string;
  visit_date: string;
  diagnosis: string;
  treatment: string;
  symptoms: string[];
  notes: string | null;
  follow_up_required: boolean;
  follow_up_date: string | null;
  doctor_name?: string;
  doctor_specialty?: string;
}

export function MedicalHistorySection({ userId }: MedicalHistorySectionProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'follow_up'>('all');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMedicalHistory();
  }, [userId, filterType]);

  const fetchMedicalHistory = async () => {
    try {
      // For now, we'll simulate medical history from completed appointments
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', userId)
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: false });

      if (filterType === 'recent') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('scheduled_at', thirtyDaysAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform appointments into medical records format
      const medicalRecords: MedicalRecord[] = data?.map(apt => ({
        id: apt.id,
        appointment_id: apt.id,
        doctor_id: apt.doctor_id,
        visit_date: apt.scheduled_at,
        diagnosis: apt.notes || 'Consulta general',
        treatment: apt.description || 'Tratamiento no especificado',
        symptoms: [], // Would come from a separate symptoms table
        notes: apt.notes,
        follow_up_required: false, // Would be determined by doctor
        follow_up_date: null,
        doctor_name: 'Dr. García Martínez', // Mock data for now
        doctor_specialty: 'Cardiología' // Mock data for now
      })) || [];

      setRecords(medicalRecords);
    } catch (error) {
      console.error('Error fetching medical history:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportRecord = (record: MedicalRecord) => {
    const content = `
HISTORIAL MÉDICO
================

Fecha de Consulta: ${new Date(record.visit_date).toLocaleDateString('es-ES')}
Médico: ${record.doctor_name}
Especialidad: ${record.doctor_specialty}

DIAGNÓSTICO:
${record.diagnosis}

TRATAMIENTO:
${record.treatment}

NOTAS:
${record.notes || 'Sin notas adicionales'}

${record.follow_up_required ? `SEGUIMIENTO REQUERIDO: ${record.follow_up_date}` : ''}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-medico-${new Date(record.visit_date).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-64"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial Médico</h1>
          <p className="text-gray-600 mt-1">
            Registro completo de tus consultas y tratamientos
          </p>
        </div>
        
        {/* Filter */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los registros</option>
              <option value="recent">Últimos 30 días</option>
              <option value="follow_up">Requieren seguimiento</option>
            </select>
            <FunnelIcon className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Records List */}
      {records.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay historial médico</h3>
          <p className="text-gray-600 mb-6">
            Tu historial médico aparecerá aquí después de completar consultas
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {record.diagnosis}
                      </h3>
                      {record.follow_up_required && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                          Seguimiento requerido
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {new Date(record.visit_date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4" />
                        <span>{record.doctor_name} - {record.doctor_specialty}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Tratamiento:</span> {record.treatment}
                      </p>
                    </div>

                    {record.symptoms.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Síntomas:</p>
                        <div className="flex flex-wrap gap-2">
                          {record.symptoms.map((symptom, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notas:</span> {record.notes}
                        </p>
                      </div>
                    )}

                    {record.follow_up_required && record.follow_up_date && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <span className="font-medium">Próximo seguimiento:</span> {' '}
                          {new Date(record.follow_up_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>Ver Detalle</span>
                  </button>
                  
                  <button
                    onClick={() => exportRecord(record)}
                    className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 flex items-center space-x-1"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Exportar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Detalle de Consulta</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de Consulta</label>
                  <p className="text-gray-900">
                    {new Date(selectedRecord.visit_date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Médico</label>
                  <p className="text-gray-900">{selectedRecord.doctor_name}</p>
                  <p className="text-sm text-gray-600">{selectedRecord.doctor_specialty}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Diagnóstico</label>
                <p className="text-gray-900 mt-1">{selectedRecord.diagnosis}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Tratamiento</label>
                <p className="text-gray-900 mt-1">{selectedRecord.treatment}</p>
              </div>
              
              {selectedRecord.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Notas Adicionales</label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{selectedRecord.notes}</p>
                </div>
              )}
              
              {selectedRecord.follow_up_required && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900">Seguimiento Requerido</h4>
                  {selectedRecord.follow_up_date && (
                    <p className="text-yellow-800 mt-1">
                      Próxima cita: {new Date(selectedRecord.follow_up_date).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => exportRecord(selectedRecord)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Exportar
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}