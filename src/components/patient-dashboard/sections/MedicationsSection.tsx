'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  BeakerIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BellIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface MedicationsSectionProps {
  userId: string;
}

interface Medication {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  instructions: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  side_effects_reported: string[];
  adherence_score: number | null;
  doctor_name?: string;
  reminders?: MedicationReminder[];
}

interface MedicationReminder {
  id: string;
  reminder_time: string;
  days_of_week: number[];
  is_active: boolean;
  last_taken_at: string | null;
}

export function MedicationsSection({ userId }: MedicationsSectionProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMedications();
  }, [userId, activeTab]);

  const fetchMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_medications')
        .select('*')
        .eq('patient_id', userId)
        .eq('is_active', activeTab === 'active')
        .order('start_date', { ascending: false });

      if (error) throw error;

      const formattedMedications = data?.map(med => ({
        ...med,
        doctor_name: 'Dr. García Martínez', // Mock data for now
        reminders: [] // Mock data for now
      })) || [];

      setMedications(formattedMedications);
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsTaken = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('medication_reminders')
        .update({ last_taken_at: new Date().toISOString() })
        .eq('id', reminderId);

      if (error) throw error;
      fetchMedications();
    } catch (error) {
      console.error('Error marking medication as taken:', error);
    }
  };

  const reportSideEffect = async (medicationId: string, sideEffect: string) => {
    try {
      const medication = medications.find(m => m.id === medicationId);
      if (!medication) return;

      const updatedSideEffects = [...medication.side_effects_reported, sideEffect];

      const { error } = await supabase
        .from('patient_medications')
        .update({ side_effects_reported: updatedSideEffects })
        .eq('id', medicationId);

      if (error) throw error;
      fetchMedications();
    } catch (error) {
      console.error('Error reporting side effect:', error);
    }
  };

  const getAdherenceColor = (score: number | null) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getAdherenceLabel = (score: number | null) => {
    if (!score) return 'Sin datos';
    if (score >= 0.9) return 'Excelente';
    if (score >= 0.7) return 'Buena';
    return 'Necesita mejorar';
  };

  const getDaysOfWeekText = (days: number[]) => {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days.map(day => dayNames[day]).join(', ');
  };

  const isTimeForMedication = (reminderTime: string, lastTaken: string | null) => {
    const now = new Date();
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const reminderDateTime = new Date();
    reminderDateTime.setHours(hours, minutes, 0, 0);

    if (lastTaken) {
      const lastTakenDate = new Date(lastTaken);
      const timeDiff = now.getTime() - lastTakenDate.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      return hoursDiff >= 23; // Allow taking again after 23 hours
    }

    return now >= reminderDateTime;
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
          <h1 className="text-2xl font-bold text-gray-900">Mis Medicamentos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus medicamentos y recordatorios
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <PlusIcon className="w-5 h-5" />
          <span>Agregar Medicamento</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'active', label: 'Medicamentos Activos' },
            { id: 'history', label: 'Historial' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Medications List */}
      {medications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BeakerIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'active' ? 'No tienes medicamentos activos' : 'No hay historial de medicamentos'}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'active' 
              ? 'Tus medicamentos prescritos aparecerán aquí'
              : 'El historial de medicamentos aparecerá aquí'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {medications.map((medication) => (
            <div key={medication.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BeakerIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {medication.medication_name}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {medication.dosage}
                      </span>
                      {medication.adherence_score !== null && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getAdherenceColor(medication.adherence_score)}`}>
                          Adherencia: {getAdherenceLabel(medication.adherence_score)}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4" />
                        <span>Frecuencia: {medication.frequency}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span>Prescrito por: {medication.doctor_name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span>
                          Inicio: {new Date(medication.start_date).toLocaleDateString('es-ES')}
                          {medication.end_date && (
                            <> - Fin: {new Date(medication.end_date).toLocaleDateString('es-ES')}</>
                          )}
                        </span>
                      </div>
                    </div>

                    {medication.instructions && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Instrucciones:</span> {medication.instructions}
                        </p>
                      </div>
                    )}

                    {/* Reminders */}
                    {medication.reminders && medication.reminders.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Recordatorios:</h4>
                        <div className="space-y-2">
                          {medication.reminders.map((reminder) => (
                            <div key={reminder.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <BellIcon className="w-4 h-4 text-blue-600" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {reminder.reminder_time}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {getDaysOfWeekText(reminder.days_of_week)}
                                  </p>
                                </div>
                              </div>
                              
                              {activeTab === 'active' && isTimeForMedication(reminder.reminder_time, reminder.last_taken_at) && (
                                <button
                                  onClick={() => markAsTaken(reminder.id)}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 flex items-center space-x-1"
                                >
                                  <CheckCircleIcon className="w-4 h-4" />
                                  <span>Marcar como tomado</span>
                                </button>
                              )}
                              
                              {reminder.last_taken_at && (
                                <div className="text-xs text-gray-500">
                                  Última toma: {new Date(reminder.last_taken_at).toLocaleString('es-ES')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Side Effects */}
                    {medication.side_effects_reported.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Efectos secundarios reportados:</h4>
                        <div className="flex flex-wrap gap-2">
                          {medication.side_effects_reported.map((effect, index) => (
                            <span key={index} className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                              {effect}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {activeTab === 'active' && (
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => {
                        const effect = prompt('Describe el efecto secundario:');
                        if (effect) reportSideEffect(medication.id, effect);
                      }}
                      className="bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 flex items-center space-x-1"
                    >
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span>Reportar Efecto</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
