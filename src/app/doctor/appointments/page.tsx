'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth';
import { createClient } from '@/lib/supabase/client';
import { Calendar, Clock, User, Filter, Plus, Search } from 'lucide-react';
import Link from 'next/link';

interface Appointment {
  id: string;
  scheduled_at: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  description?: string;
  patients?: {
    profiles?: {
      first_name?: string;
      last_name?: string;
      email?: string;
    };
  };
}

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, filter, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('appointments')
        .select('*, patients(*, profiles(*))')
        .eq('doctor_id', user?.id || '')
        .order('scheduled_at', { ascending: true });

      // Aplicar filtros de fecha
      const now = new Date();
      switch (filter) {
        case 'today':
          const today = now.toISOString().split('T')[0];
          query = query
            .gte('scheduled_at', `${today}T00:00:00`)
            .lt('scheduled_at', `${today}T23:59:59`);
          break;
        case 'week':
          const weekEnd = new Date(now);
          weekEnd.setDate(weekEnd.getDate() + 7);
          query = query
            .gte('scheduled_at', now.toISOString())
            .lte('scheduled_at', weekEnd.toISOString());
          break;
        case 'month':
          const monthEnd = new Date(now);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          query = query
            .gte('scheduled_at', now.toISOString())
            .lte('scheduled_at', monthEnd.toISOString());
          break;
      }

      // Aplicar filtro de estado
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        // @ts-ignore - Temporal fix for database types
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      // Actualizar la lista
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    const patientName = `${appointment.patients?.profiles?.first_name || ''} ${appointment.patients?.profiles?.last_name || ''}`.toLowerCase();
    return patientName.includes(searchTerm.toLowerCase());
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
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
            <p className="mt-1 text-gray-600">
              Administra y programa las citas con tus pacientes
            </p>
          </div>
          <Link
            href="/doctor/appointments/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cita
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
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro de fecha */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>

          {/* Filtro de estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="scheduled">Programadas</option>
            <option value="confirmed">Confirmadas</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>

          {/* Contador de resultados */}
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="mr-2 h-4 w-4" />
            {filteredAppointments.length} cita(s)
          </div>
        </div>
      </div>

      {/* Lista de Citas */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Citas {filter !== 'all' && `- ${filter === 'today' ? 'Hoy' : filter === 'week' ? 'Esta semana' : 'Este mes'}`}
          </h3>
        </div>
        
        {filteredAppointments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {appointment.patients?.profiles?.first_name} {appointment.patients?.profiles?.last_name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {appointment.patients?.profiles?.email}
                      </p>
                      {appointment.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {appointment.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(appointment.scheduled_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="mr-1 h-4 w-4" />
                        {new Date(appointment.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                    <div className="flex space-x-2">
                      {appointment.status === 'scheduled' && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Confirmar
                        </button>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Completar
                        </button>
                      )}
                      {['scheduled', 'confirmed'].includes(appointment.status) && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Cancelar
                        </button>
                      )}
                      <Link
                        href={`/doctor/appointments/${appointment.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'No se encontraron citas que coincidan con tu búsqueda.' : 'Comienza programando una nueva cita.'}
            </p>
            <div className="mt-6">
              <Link
                href="/doctor/appointments/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Cita
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
