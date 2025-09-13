'use client';

import { useState, useEffect } from 'react';
import { useAppointmentSubscription } from '@/features/auth/hooks/use-realtime-subscription';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  patient_name?: string;
  doctor_name?: string;
}

export function RealtimeAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [upcomingCount, setUpcomingCount] = useState(0);

  // Callback para manejar cambios en citas en tiempo real
  const handleAppointmentChange = (payload: any) => {
    console.log('📅 Cambio en citas:', payload);
    
    if (payload.eventType === 'INSERT') {
      // Nueva cita
      const newAppointment = payload.newRecord as Appointment;
      setAppointments(prev => [newAppointment, ...prev]);
      
      // Si la cita es futura, incrementar el contador
      if (new Date(newAppointment.appointment_date) > new Date()) {
        setUpcomingCount(prev => prev + 1);
      }
    } else if (payload.eventType === 'UPDATE') {
      // Cita actualizada
      const updatedAppointment = payload.newRecord as Appointment;
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === updatedAppointment.id 
            ? updatedAppointment 
            : appointment
        )
      );
      
      // Actualizar contador de citas futuras si es necesario
      updateUpcomingCount();
    } else if (payload.eventType === 'DELETE') {
      // Cita eliminada
      const deletedId = payload.oldRecord?.id;
      if (deletedId) {
        setAppointments(prev => 
          prev.filter(appointment => appointment.id !== deletedId)
        );
        updateUpcomingCount();
      }
    }
  };

  // Suscribirse a cambios en citas en tiempo real
  const { error } = useAppointmentSubscription(
    user?.id || '',
    handleAppointmentChange
  );

  // Actualizar contador de citas futuras
  const updateUpcomingCount = () => {
    const count = appointments.filter(
      appointment => new Date(appointment.appointment_date) > new Date()
    ).length;
    setUpcomingCount(count);
  };

  // Cargar citas iniciales
  useEffect(() => {
    if (!user?.id) return;
    
    const loadInitialAppointments = async () => {
      try {
        const response = await fetch(`/api/appointments?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setAppointments(data.appointments || []);
          updateUpcomingCount();
        }
      } catch (err) {
        console.error('Error cargando citas iniciales:', err);
      }
    };
    
    loadInitialAppointments();
  }, [user?.id]);

  // Formatear fecha
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // Obtener color del badge según el estado
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'rescheduled':
        return 'outline';
      default:
        return 'default';
    }
  };

  // Obtener ícono según el estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Error en la suscripción a citas: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Mis Citas</h2>
        {upcomingCount > 0 && (
          <Badge variant="default">
            {upcomingCount} próximas
          </Badge>
        )}
      </div>
      
      <div className="space-y-3">
        <AnimatePresence>
          {appointments.map((appointment) => {
            const { date, time } = formatAppointmentDate(appointment.appointment_date);
            
            return (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {date}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {time}
                      </span>
                    </div>
                    
                    {user?.role === 'doctor' && appointment.patient_name && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {appointment.patient_name}
                        </span>
                      </div>
                    )}
                    
                    {user?.role === 'patient' && appointment.doctor_name && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Dr. {appointment.doctor_name}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant={getStatusBadgeVariant(appointment.status)}
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon(appointment.status)}
                      {appointment.status === 'scheduled' && 'Programada'}
                      {appointment.status === 'completed' && 'Completada'}
                      {appointment.status === 'cancelled' && 'Cancelada'}
                      {appointment.status === 'rescheduled' && 'Reprogramada'}
                    </Badge>
                  </div>
                </div>
                
                {appointment.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">{appointment.notes}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {appointments.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
          <p className="mt-1 text-sm text-gray-500">
            No tienes citas programadas en este momento.
          </p>
        </div>
      )}
    </div>
  );
}