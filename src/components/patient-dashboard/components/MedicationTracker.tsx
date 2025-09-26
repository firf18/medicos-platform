'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  BeakerIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BellIcon,
  CalendarIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface MedicationTrackerProps {
  userId: string;
  darkMode: boolean;
  realTimeData?: any;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  startDate: string;
  endDate?: string;
  instructions: string;
  isActive: boolean;
  totalDoses: number;
  missedDoses: number;
  sideEffects?: string[];
  doctorPrescribed: string;
  notes?: string;
}

interface MedicationSchedule {
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  actualTime?: string;
  notes?: string;
}

export function MedicationTracker({ userId, darkMode, realTimeData }: MedicationTrackerProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<MedicationSchedule[]>([]);
  const [adherenceStats, setAdherenceStats] = useState({
    totalDoses: 0,
    takenDoses: 0,
    missedDoses: 0,
    adherencePercentage: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    timeOfDay: [] as string[],
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    doctorPrescribed: '',
    notes: ''
  });
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadMedications();
    loadTodaySchedule();
  }, [userId]);

  const loadMedications = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('patient_medications')
        .select('*')
        .eq('patient_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const processedMedications: Medication[] = data.map(med => ({
          id: med.id,
          name: med.medication_name,
          dosage: med.dosage,
          frequency: med.frequency,
          timeOfDay: med.time_of_day || [],
          startDate: med.start_date,
          endDate: med.end_date,
          instructions: med.instructions || '',
          isActive: med.is_active,
          totalDoses: med.total_doses || 0,
          missedDoses: med.missed_doses || 0,
          sideEffects: med.side_effects || [],
          doctorPrescribed: med.doctor_prescribed || '',
          notes: med.notes || ''
        }));

        setMedications(processedMedications);
        
        // Calcular estadísticas de adherencia
        const totalDoses = processedMedications.reduce((sum, med) => sum + med.totalDoses, 0);
        const missedDoses = processedMedications.reduce((sum, med) => sum + med.missedDoses, 0);
        const takenDoses = totalDoses - missedDoses;
        
        setAdherenceStats({
          totalDoses,
          takenDoses,
          missedDoses,
          adherencePercentage: totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100
        });
      }

    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodaySchedule = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('medication_schedule')
        .select(`
          *,
          medication:medication_id (
            medication_name,
            dosage
          )
        `)
        .eq('patient_id', userId)
        .eq('scheduled_date', today)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;

      if (data) {
        const processedSchedule: MedicationSchedule[] = data.map(schedule => ({
          medicationId: schedule.medication_id,
          medicationName: schedule.medication?.medication_name || 'Medicamento',
          dosage: schedule.medication?.dosage || '',
          scheduledTime: schedule.scheduled_time,
          status: schedule.status,
          actualTime: schedule.actual_time,
          notes: schedule.notes
        }));

        setTodaySchedule(processedSchedule);
      }

    } catch (error) {
      console.error('Error loading today schedule:', error);
    }
  };

  const addMedication = async () => {
    try {
      const medicationData = {
        patient_id: userId,
        medication_name: newMedication.name,
        dosage: newMedication.dosage,
        frequency: newMedication.frequency,
        time_of_day: newMedication.timeOfDay,
        start_date: newMedication.startDate,
        end_date: newMedication.endDate || null,
        instructions: newMedication.instructions,
        doctor_prescribed: newMedication.doctorPrescribed,
        notes: newMedication.notes,
        is_active: true,
        total_doses: 0,
        missed_doses: 0
      };

      const { error } = await supabase
        .from('patient_medications')
        .insert([medicationData]);

      if (error) throw error;

      setNewMedication({
        name: '',
        dosage: '',
        frequency: '',
        timeOfDay: [],
        instructions: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        doctorPrescribed: '',
        notes: ''
      });
      setShowAddMedication(false);
      loadMedications();

    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  const markMedicationTaken = async (scheduleId: string, medicationId: string) => {
    try {
      const now = new Date();
      
      // Actualizar el horario
      const { error: scheduleError } = await supabase
        .from('medication_schedule')
        .update({ 
          status: 'taken',
          actual_time: now.toTimeString().slice(0, 8)
        })
        .eq('id', scheduleId);

      if (scheduleError) throw scheduleError;

      // Incrementar dosis totales
      const { error: medError } = await supabase
        .rpc('increment_total_doses', { 
          medication_id: medicationId 
        });

      if (medError) throw medError;

      loadTodaySchedule();
      loadMedications();

    } catch (error) {
      console.error('Error marking medication as taken:', error);
    }
  };

  const markMedicationMissed = async (scheduleId: string, medicationId: string) => {
    try {
      // Actualizar el horario
      const { error: scheduleError } = await supabase
        .from('medication_schedule')
        .update({ status: 'missed' })
        .eq('id', scheduleId);

      if (scheduleError) throw scheduleError;

      // Incrementar dosis perdidas
      const { error: medError } = await supabase
        .rpc('increment_missed_doses', { 
          medication_id: medicationId 
        });

      if (medError) throw medError;

      loadTodaySchedule();
      loadMedications();

    } catch (error) {
      console.error('Error marking medication as missed:', error);
    }
  };

  const deleteMedication = async (medicationId: string) => {
    try {
      const { error } = await supabase
        .from('patient_medications')
        .update({ is_active: false })
        .eq('id', medicationId);

      if (error) throw error;

      loadMedications();

    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  };

  const getScheduleStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return 'text-green-600 bg-green-50';
      case 'missed': return 'text-red-600 bg-red-50';
      case 'skipped': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getScheduleStatusText = (status: string) => {
    switch (status) {
      case 'taken': return 'Tomado';
      case 'missed': return 'Perdido';
      case 'skipped': return 'Omitido';
      default: return 'Pendiente';
    }
  };

  const getAdherenceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Seguimiento de Medicamentos
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {medications.length} medicamentos activos
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={loadMedications}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            <ArrowPathIcon className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            onClick={() => setShowAddMedication(true)}
            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Estadísticas de adherencia */}
      <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
        <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Adherencia al Tratamiento
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getAdherenceColor(adherenceStats.adherencePercentage).split(' ')[0]}`}>
              {adherenceStats.adherencePercentage}%
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Adherencia General
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {adherenceStats.takenDoses}
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Dosis Tomadas
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {adherenceStats.missedDoses}
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Dosis Perdidas
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {adherenceStats.totalDoses}
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Dosis Totales
            </p>
          </div>
        </div>
      </div>

      {/* Horario de hoy */}
      {todaySchedule.length > 0 && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
          <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-blue-900'}`}>
            Medicamentos de Hoy
          </h4>
          <div className="space-y-2">
            {todaySchedule.map((schedule, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'} border ${darkMode ? 'border-gray-500' : 'border-blue-200'} flex items-center justify-between`}
              >
                <div className="flex items-center space-x-3">
                  <BeakerIcon className="w-5 h-5 text-green-500" />
                  <div>
                    <h5 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {schedule.medicationName}
                    </h5>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {schedule.dosage} - {formatTime(schedule.scheduledTime)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScheduleStatusColor(schedule.status)}`}>
                    {getScheduleStatusText(schedule.status)}
                  </span>
                  
                  {schedule.status === 'pending' && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => markMedicationTaken(schedule.medicationId, schedule.medicationId)}
                        className="p-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => markMedicationMissed(schedule.medicationId, schedule.medicationId)}
                        className="p-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                      >
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de medicamentos */}
      <div className="space-y-3">
        {medications.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <BeakerIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay medicamentos registrados</p>
          </div>
        ) : (
          medications.map((medication) => (
            <div
              key={medication.id}
              className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <BeakerIcon className="w-6 h-6 text-green-500" />
                  <div>
                    <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {medication.name}
                    </h5>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {medication.dosage} - {medication.frequency}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAdherenceColor(
                    medication.totalDoses > 0 ? ((medication.totalDoses - medication.missedDoses) / medication.totalDoses) * 100 : 100
                  )}`}>
                    {medication.totalDoses > 0 ? 
                      `${Math.round(((medication.totalDoses - medication.missedDoses) / medication.totalDoses) * 100)}%` : 
                      '100%'
                    }
                  </span>
                  
                  <button
                    onClick={() => setSelectedMedication(selectedMedication === medication.id ? null : medication.id)}
                    className={`p-1 rounded ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} transition-colors`}
                  >
                    <InformationCircleIcon className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  <button
                    onClick={() => deleteMedication(medication.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {medication.timeOfDay.join(', ')}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Desde {new Date(medication.startDate).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
              
              {selectedMedication === medication.id && (
                <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-50'} border ${darkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className="space-y-2 text-sm">
                    {medication.instructions && (
                      <p>
                        <strong>Instrucciones:</strong> {medication.instructions}
                      </p>
                    )}
                    {medication.doctorPrescribed && (
                      <p>
                        <strong>Prescrito por:</strong> {medication.doctorPrescribed}
                      </p>
                    )}
                    {medication.sideEffects && medication.sideEffects.length > 0 && (
                      <p>
                        <strong>Efectos secundarios:</strong> {medication.sideEffects.join(', ')}
                      </p>
                    )}
                    {medication.notes && (
                      <p>
                        <strong>Notas:</strong> {medication.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal para agregar medicamento */}
      {showAddMedication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96 max-w-full mx-4 max-h-[80vh] overflow-y-auto`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Agregar Medicamento
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre del Medicamento
                </label>
                <input
                  type="text"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Ej: Ibuprofeno"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Dosis
                </label>
                <input
                  type="text"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Ej: 400mg"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Frecuencia
                </label>
                <select
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="">Seleccionar frecuencia</option>
                  <option value="Una vez al día">Una vez al día</option>
                  <option value="Dos veces al día">Dos veces al día</option>
                  <option value="Tres veces al día">Tres veces al día</option>
                  <option value="Cada 8 horas">Cada 8 horas</option>
                  <option value="Cada 12 horas">Cada 12 horas</option>
                  <option value="Según necesidad">Según necesidad</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={newMedication.startDate}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, startDate: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Instrucciones
                </label>
                <textarea
                  value={newMedication.instructions}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Ej: Tomar con comida"
                  className={`w-full p-2 rounded-lg border resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddMedication(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} text-gray-900 transition-colors`}
              >
                Cancelar
              </button>
              <button
                onClick={addMedication}
                disabled={!newMedication.name || !newMedication.dosage}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
