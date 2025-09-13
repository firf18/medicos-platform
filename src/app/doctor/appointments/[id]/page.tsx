'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { Calendar, Clock, User, FileText, ArrowLeft, Edit, Trash2, Check, X } from 'lucide-react';
import Link from 'next/link';

interface AppointmentDetails {
  id: string;
  scheduled_at: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  description?: string;
  notes?: string;
  created_at: string;
  patients?: {
    id: string;
    profiles?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
    };
  };
}

export default function AppointmentDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;
  
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [newNotes, setNewNotes] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*, patients(*, profiles(*))')
        .eq('id', appointmentId)
        .eq('doctor_id', user?.id || '')
        .single();

      if (error || !data) throw error;

      setAppointment(data);
      setNewNotes((data as any).notes || '');
    } catch (error) {
      console.error('Error fetching appointment:', error);
      router.push('/doctor/appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (newStatus: string) => {
    if (!appointment) return;

    try {
      setUpdating(true);
      const { error } = await supabase
        .from('appointments')
        // @ts-ignore - Temporal fix for database types
        .update({ status: newStatus })
        .eq('id', appointment.id);

      if (error) throw error;

      setAppointment(prev => prev ? { ...prev, status: newStatus as any } : null);
    } catch (error) {
      console.error('Error updating appointment:', error);
    } finally {
      setUpdating(false);
    }
  };

  const updateNotes = async () => {
    if (!appointment) return;

    try {
      setUpdating(true);
      const { error } = await supabase
        .from('appointments')
        // @ts-ignore - Temporal fix for database types
        .update({ notes: newNotes })
        .eq('id', appointment.id);

      if (error) throw error;

      setAppointment(prev => prev ? { ...prev, notes: newNotes } : null);
      setEditingNotes(false);
    } catch (error) {
      console.error('Error updating notes:', error);
    } finally {
      setUpdating(false);
    }
  };

  const deleteAppointment = async () => {
    if (!appointment) return;
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setUpdating(true);
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointment.id);

      if (error) throw error;

      router.push('/doctor/appointments');
    } catch (error) {
      console.error('Error deleting appointment:', error);
    } finally {
      setUpdating(false);
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

  const canEdit = appointment && ['scheduled', 'confirmed'].includes(appointment.status);
  const isPast = appointment && new Date(appointment.scheduled_at) < new Date();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white shadow rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">Cita no encontrada</h3>
        <p className="mt-1 text-sm text-gray-500">
          La cita que buscas no existe o no tienes permisos para verla.
        </p>
        <div className="mt-6">
          <Link
            href="/doctor/appointments"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Volver a citas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/doctor/appointments"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Volver a citas
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Detalle de Cita
              </h1>
              <p className="mt-1 text-gray-600">
                Información completa de la cita médica
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
              {getStatusText(appointment.status)}
            </span>
            {isPast && appointment.status === 'scheduled' && (
              <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                Cita vencida
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Paciente */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="mr-2 h-5 w-5" />
            Información del Paciente
          </h3>
          <div className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nombre completo</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {appointment.patients?.profiles?.first_name} {appointment.patients?.profiles?.last_name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {appointment.patients?.profiles?.email}
              </dd>
            </div>
            {appointment.patients?.profiles?.phone && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {appointment.patients?.profiles?.phone}
                </dd>
              </div>
            )}
            <div className="pt-3 border-t border-gray-200">
              <Link
                href={`/doctor/patients/${appointment.patients?.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver historial del paciente →
              </Link>
            </div>
          </div>
        </div>

        {/* Información de la Cita */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Información de la Cita
          </h3>
          <div className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Fecha</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(appointment.scheduled_at).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Hora</dt>
              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {new Date(appointment.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Motivo</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {appointment.description || 'No especificado'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Creada el</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(appointment.created_at).toLocaleDateString()}
              </dd>
            </div>
          </div>
        </div>

        {/* Notas y Acciones */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Notas
          </h3>
          
          {editingNotes ? (
            <div className="space-y-3">
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Agregar notas sobre la cita..."
              />
              <div className="flex space-x-2">
                <button
                  onClick={updateNotes}
                  disabled={updating}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <Check className="mr-1 h-4 w-4" />
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setEditingNotes(false);
                    setNewNotes(appointment.notes || '');
                  }}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-900 min-h-[100px] p-3 bg-gray-50 rounded-md">
                {appointment.notes || 'No hay notas para esta cita.'}
              </div>
              {canEdit && (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Editar notas
                </button>
              )}
            </div>
          )}

          {/* Acciones de Estado */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Acciones</h4>
            <div className="space-y-2">
              {appointment.status === 'scheduled' && (
                <button
                  onClick={() => updateAppointmentStatus('confirmed')}
                  disabled={updating}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar Cita
                </button>
              )}
              
              {appointment.status === 'confirmed' && (
                <button
                  onClick={() => updateAppointmentStatus('completed')}
                  disabled={updating}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Marcar como Completada
                </button>
              )}

              {['scheduled', 'confirmed'].includes(appointment.status) && (
                <button
                  onClick={() => updateAppointmentStatus('cancelled')}
                  disabled={updating}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar Cita
                </button>
              )}

              {canEdit && (
                <button
                  onClick={deleteAppointment}
                  disabled={updating}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Cita
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
