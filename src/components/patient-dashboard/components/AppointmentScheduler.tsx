'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon,
  MapPinIcon,
  PhoneIcon,
  VideoCameraIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface AppointmentSchedulerProps {
  userId: string;
  darkMode: boolean;
  realTimeData?: any;
}

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  type: 'in-person' | 'video' | 'phone';
  location?: string;
  notes?: string;
  symptoms?: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
  doctorId: string;
}

export function AppointmentScheduler({ userId, darkMode, realTimeData }: AppointmentSchedulerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'video' | 'phone'>('in-person');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadAppointments();
    loadAvailableDoctors();
  }, [userId]);

  useEffect(() => {
    if (selectedDate && selectedDoctor) {
      loadTimeSlots(selectedDate, selectedDoctor);
    }
  }, [selectedDate, selectedDoctor]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctor_id (
            id,
            full_name,
            specialty
          )
        `)
        .eq('patient_id', userId)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const processedAppointments: Appointment[] = data.map(appointment => ({
          id: appointment.id,
          doctorId: appointment.doctor_id,
          doctorName: appointment.doctor?.full_name || 'Doctor',
          doctorSpecialty: appointment.doctor?.specialty || 'General',
          scheduledAt: appointment.scheduled_at,
          duration: appointment.duration || 30,
          status: appointment.status,
          type: appointment.appointment_type,
          location: appointment.location,
          notes: appointment.notes,
          symptoms: appointment.symptoms || []
        }));

        setAppointments(processedAppointments);
        
        // Separar citas próximas
        const now = new Date();
        const upcoming = processedAppointments.filter(apt => 
          new Date(apt.scheduledAt) > now && apt.status === 'scheduled'
        );
        setUpcomingAppointments(upcoming);
      }

    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, full_name, specialty, is_available')
        .eq('is_available', true);

      if (error) throw error;

      if (data) {
        setAvailableDoctors(data);
      }

    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const loadTimeSlots = async (date: string, doctorId: string) => {
    try {
      // Simular slots de tiempo disponibles
      const slots: TimeSlot[] = [];
      const startHour = 9;
      const endHour = 17;
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push({
            time: timeString,
            available: Math.random() > 0.3, // Simular disponibilidad
            doctorId: doctorId
          });
        }
      }
      
      setTimeSlots(slots);

    } catch (error) {
      console.error('Error loading time slots:', error);
    }
  };

  const scheduleAppointment = async () => {
    if (!selectedDoctor || !selectedTimeSlot) return;

    try {
      const appointmentData = {
        patient_id: userId,
        doctor_id: selectedDoctor,
        scheduled_at: `${selectedDate}T${selectedTimeSlot}:00`,
        duration: 30,
        appointment_type: appointmentType,
        status: 'scheduled',
        notes: appointmentNotes
      };

      const { error } = await supabase
        .from('appointments')
        .insert([appointmentData]);

      if (error) throw error;

      setShowScheduleModal(false);
      setSelectedDoctor('');
      setSelectedTimeSlot('');
      setAppointmentNotes('');
      loadAppointments();

    } catch (error) {
      console.error('Error scheduling appointment:', error);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;

      loadAppointments();

    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const rescheduleAppointment = async (appointmentId: string, newDateTime: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          scheduled_at: newDateTime,
          status: 'rescheduled'
        })
        .eq('id', appointmentId);

      if (error) throw error;

      loadAppointments();

    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'rescheduled': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'rescheduled': return 'Reprogramada';
      default: return 'Desconocido';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoCameraIcon className="w-4 h-4 text-blue-500" />;
      case 'phone': return <PhoneIcon className="w-4 h-4 text-green-500" />;
      default: return <MapPinIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAppointments = filterStatus === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === filterStatus);

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
            Gestión de Citas
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {upcomingAppointments.length} citas próximas
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={loadAppointments}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            <ArrowPathIcon className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            onClick={() => setShowScheduleModal(true)}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: 'Todas', count: appointments.length },
          { key: 'scheduled', label: 'Programadas', count: appointments.filter(a => a.status === 'scheduled').length },
          { key: 'completed', label: 'Completadas', count: appointments.filter(a => a.status === 'completed').length },
          { key: 'cancelled', label: 'Canceladas', count: appointments.filter(a => a.status === 'cancelled').length }
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setFilterStatus(filter.key)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === filter.key
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Próximas citas */}
      {upcomingAppointments.length > 0 && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
          <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-blue-900'}`}>
            Próximas Citas
          </h4>
          <div className="space-y-2">
            {upcomingAppointments.slice(0, 3).map((appointment) => (
              <div
                key={appointment.id}
                className={`p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'} border ${darkMode ? 'border-gray-500' : 'border-blue-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(appointment.type)}
                    <div>
                      <h5 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {appointment.doctorName}
                      </h5>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {appointment.doctorSpecialty}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatDateTime(appointment.scheduledAt)}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <button
                        onClick={() => cancelAppointment(appointment.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de citas */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay citas</p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(appointment.type)}
                  <div>
                    <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {appointment.doctorName}
                    </h5>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {appointment.doctorSpecialty}
                    </p>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {getStatusText(appointment.status)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDateTime(appointment.scheduledAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4 text-gray-500" />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {appointment.duration} min
                    </span>
                  </div>
                </div>
                
                {appointment.status === 'scheduled' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => cancelAppointment(appointment.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
              
              {appointment.notes && (
                <div className="mt-3 p-2 bg-gray-100 rounded text-sm text-gray-700">
                  <strong>Notas:</strong> {appointment.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal para programar cita */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96 max-w-full mx-4`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Programar Nueva Cita
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Doctor
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="">Seleccionar doctor</option>
                  {availableDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.full_name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fecha
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              
              {selectedDoctor && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Hora
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="">Seleccionar hora</option>
                    {timeSlots.filter(slot => slot.available).map((slot) => (
                      <option key={slot.time} value={slot.time}>
                        {slot.time}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tipo de Cita
                </label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value as any)}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="in-person">Presencial</option>
                  <option value="video">Video llamada</option>
                  <option value="phone">Llamada telefónica</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notas (opcional)
                </label>
                <textarea
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  placeholder="Describe tus síntomas o motivo de la consulta..."
                  className={`w-full p-2 rounded-lg border resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} text-gray-900 transition-colors`}
              >
                Cancelar
              </button>
              <button
                onClick={scheduleAppointment}
                disabled={!selectedDoctor || !selectedTimeSlot}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Programar Cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
