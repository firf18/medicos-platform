'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  VideoCameraIcon,
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface AppointmentsSectionProps {
  userId: string;
}

interface Appointment {
  id: string;
  doctor_id: string;
  appointment_type: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  location: string | null;
  is_virtual: boolean;
  virtual_meeting_url: string | null;
  notes: string | null;
  doctor_name?: string;
  doctor_specialty?: string;
}

export function AppointmentsSection({ userId }: AppointmentsSectionProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAppointments();
  }, [userId, activeTab]);

  const fetchAppointments = async () => {
    try {
      const now = new Date().toISOString();
      const query = supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', userId);

      if (activeTab === 'upcoming') {
        query.gte('scheduled_at', now).order('scheduled_at', { ascending: true });
      } else {
        query.lt('scheduled_at', now).order('scheduled_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch doctor information for each appointment
      const doctorIds = [...new Set(data?.map(apt => apt.doctor_id) || [])];
      const { data: doctors } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, specialty')
        .in('id', doctorIds);

      const doctorMap = doctors?.reduce((acc, doctor) => {
        acc[doctor.id] = {
          name: `${doctor.first_name} ${doctor.last_name}`,
          specialty: doctor.specialty || 'Medicina General'
        };
        return acc;
      }, {} as Record<string, { name: string; specialty: string }>) || {};

      const formattedAppointments = data?.map(apt => {
        const doctor = doctorMap[apt.doctor_id];
        return {
          ...apt,
          doctor_name: doctor?.name || 'Médico no disponible',
          doctor_specialty: doctor?.specialty || 'Medicina General'
        };
      }) || [];

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800',
      'no_show': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'scheduled': 'Programada',
      'confirmed': 'Confirmada',
      'completed': 'Completada',
      'cancelled': 'Cancelada',
      'no_show': 'No asistió'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const cancelAppointment = async (appointmentId: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const joinVirtualMeeting = (url: string) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-64"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Mis Citas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus citas médicas programadas
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <PlusIcon className="w-5 h-5" />
          <span>Agendar Cita</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'upcoming', label: 'Próximas Citas' },
            { id: 'past', label: 'Historial' }
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

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'upcoming' ? 'No tienes citas programadas' : 'No hay historial de citas'}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'upcoming' 
              ? 'Agenda tu primera cita con uno de nuestros especialistas'
              : 'Tus citas pasadas aparecerán aquí'
            }
          </p>
          {activeTab === 'upcoming' && (
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Agendar Primera Cita
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4" />
                        <span>{appointment.doctor_name} - {appointment.doctor_specialty}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {new Date(appointment.scheduled_at).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4" />
                        <span>
                          {new Date(appointment.scheduled_at).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} ({appointment.duration_minutes} min)
                        </span>
                      </div>
                      
                      {appointment.is_virtual ? (
                        <div className="flex items-center space-x-2">
                          <VideoCameraIcon className="w-4 h-4" />
                          <span>Consulta Virtual</span>
                        </div>
                      ) : appointment.location && (
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{appointment.location}</span>
                        </div>
                      )}
                    </div>

                    {appointment.description && (
                      <p className="mt-3 text-sm text-gray-700">
                        {appointment.description}
                      </p>
                    )}

                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notas:</span> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2">
                  {activeTab === 'upcoming' && appointment.status !== 'cancelled' && (
                    <>
                      {appointment.is_virtual && appointment.virtual_meeting_url && (
                        <button
                          onClick={() => joinVirtualMeeting(appointment.virtual_meeting_url!)}
                          className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                        >
                          <VideoCameraIcon className="w-4 h-4" />
                          <span>Unirse</span>
                        </button>
                      )}
                      
                      <button className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center space-x-1">
                        <PencilIcon className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                      
                      <button
                        onClick={() => cancelAppointment(appointment.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 flex items-center space-x-1"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
