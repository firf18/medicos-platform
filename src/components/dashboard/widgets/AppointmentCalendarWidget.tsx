'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  Video,
  AlertTriangle
} from 'lucide-react';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  duration: number; // minutes
  type: 'consultation' | 'follow_up' | 'emergency' | 'telemedicine';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  notes?: string;
  location: 'office' | 'telemedicine' | 'home_visit';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface AppointmentCalendarWidgetProps {
  specialtyId: string;
}

export default function AppointmentCalendarWidget({ specialtyId }: AppointmentCalendarWidgetProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, specialtyId]);

  const loadAppointments = async () => {
    setIsLoading(true);
    
    // Simular datos de citas
    // En producción, esto vendría de Supabase filtrado por fecha y especialidad
    const today = new Date();
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        patientId: 'p1',
        patientName: 'María González',
        patientPhone: '+52 55 1234 5678',
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(),
        duration: 30,
        type: 'consultation',
        status: 'confirmed',
        reason: 'Control rutinario',
        location: 'office',
        priority: 'medium'
      },
      {
        id: '2',
        patientId: 'p2',
        patientName: 'Carlos Mendoza',
        patientPhone: '+52 55 2345 6789',
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30).toISOString(),
        duration: 45,
        type: 'follow_up',
        status: 'scheduled',
        reason: 'Seguimiento de hipertensión',
        notes: 'Revisar resultados de laboratorio',
        location: 'office',
        priority: 'high'
      },
      {
        id: '3',
        patientId: 'p3',
        patientName: 'Ana Rodríguez',
        patientPhone: '+52 55 3456 7890',
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0).toISOString(),
        duration: 30,
        type: 'telemedicine',
        status: 'confirmed',
        reason: 'Consulta de resultados',
        location: 'telemedicine',
        priority: 'low'
      },
      {
        id: '4',
        patientId: 'p4',
        patientName: 'Roberto Silva',
        patientPhone: '+52 55 4567 8901',
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30).toISOString(),
        duration: 60,
        type: 'consultation',
        status: 'in_progress',
        reason: 'Dolor de pecho',
        location: 'office',
        priority: 'urgent'
      },
      {
        id: '5',
        patientId: 'p5',
        patientName: 'Lucía Hernández',
        patientPhone: '+52 55 5678 9012',
        appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0).toISOString(),
        duration: 30,
        type: 'consultation',
        status: 'scheduled',
        reason: 'Primera consulta',
        location: 'office',
        priority: 'medium'
      }
    ];

    setAppointments(mockAppointments);
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-orange-600 bg-orange-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'no_show': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getTypeIcon = (type: string, location: string) => {
    if (location === 'telemedicine') return <Video className="h-4 w-4" />;
    switch (type) {
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      case 'follow_up': return <Clock className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  const getAppointmentTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.getHours() * 60 + date.getMinutes();
  };

  const isCurrentAppointment = (appointment: Appointment) => {
    const now = getCurrentTime();
    const appointmentTime = getAppointmentTime(appointment.appointmentDate);
    const endTime = appointmentTime + appointment.duration;
    
    return now >= appointmentTime && now <= endTime;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setSelectedDate(newDate);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles de navegación */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="font-medium text-gray-900">
            {selectedDate.toLocaleDateString('es-MX', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Día
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Semana
          </Button>
          <Button size="sm" className="ml-2">
            <Plus className="h-4 w-4 mr-1" />
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Lista de citas */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {appointments.map((appointment) => (
          <Card 
            key={appointment.id} 
            className={`border-l-4 ${getPriorityColor(appointment.priority)} hover:shadow-md transition-shadow ${
              isCurrentAppointment(appointment) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getTypeIcon(appointment.type, appointment.location)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {appointment.patientName}
                      </h4>
                      {isCurrentAppointment(appointment) && (
                        <Badge variant="default" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          En curso
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatTime(appointment.appointmentDate)} 
                          ({appointment.duration} min)
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{appointment.patientPhone}</span>
                      </div>
                      
                      {appointment.location === 'telemedicine' && (
                        <div className="flex items-center space-x-1">
                          <Video className="h-3 w-3" />
                          <span>Telemedicina</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Motivo:</span> {appointment.reason}
                    </p>
                    
                    {appointment.notes && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Notas:</span> {appointment.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                    {appointment.status === 'scheduled' ? 'Programada' :
                     appointment.status === 'confirmed' ? 'Confirmada' :
                     appointment.status === 'in_progress' ? 'En curso' :
                     appointment.status === 'completed' ? 'Completada' :
                     appointment.status === 'cancelled' ? 'Cancelada' : 'No asistió'}
                  </Badge>
                  
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      appointment.priority === 'urgent' ? 'border-red-500 text-red-700' :
                      appointment.priority === 'high' ? 'border-orange-500 text-orange-700' :
                      'border-gray-300 text-gray-600'
                    }`}
                  >
                    {appointment.priority === 'urgent' ? 'Urgente' :
                     appointment.priority === 'high' ? 'Alta' :
                     appointment.priority === 'medium' ? 'Media' : 'Baja'}
                  </Badge>
                </div>
              </div>
              
              {/* Acciones rápidas */}
              <div className="flex space-x-2 mt-3">
                {appointment.status === 'scheduled' && (
                  <Button size="sm" variant="outline">
                    Confirmar
                  </Button>
                )}
                
                {appointment.status === 'confirmed' && (
                  <Button size="sm" variant="default">
                    Iniciar consulta
                  </Button>
                )}
                
                {appointment.location === 'telemedicine' && (
                  <Button size="sm" variant="outline">
                    <Video className="h-3 w-3 mr-1" />
                    Unirse
                  </Button>
                )}
                
                <Button size="sm" variant="outline">
                  Ver expediente
                </Button>
                
                <Button size="sm" variant="outline">
                  Reprogramar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {appointments.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay citas programadas
          </h3>
          <p className="text-gray-600 mb-4">
            No tienes citas programadas para esta fecha.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Agendar Nueva Cita
          </Button>
        </div>
      )}

      {/* Resumen del día */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-blue-900">
            Resumen del día: {appointments.length} citas
          </span>
          <div className="flex space-x-4 text-blue-700">
            <span>Confirmadas: {appointments.filter(a => a.status === 'confirmed').length}</span>
            <span>Pendientes: {appointments.filter(a => a.status === 'scheduled').length}</span>
            <span>Urgentes: {appointments.filter(a => a.priority === 'urgent').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
