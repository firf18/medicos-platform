'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface Patient {
  id: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export default function NewAppointmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    patient_id: '',
    scheduled_at: '',
    description: '',
    notes: '',
    status: 'scheduled' as const
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('id, profiles(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Por favor selecciona un paciente';
    }

    if (!formData.scheduled_at) {
      newErrors.scheduled_at = 'Por favor selecciona fecha y hora';
    } else {
      const selectedDate = new Date(formData.scheduled_at);
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.scheduled_at = 'La fecha debe ser en el futuro';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Por favor describe el motivo de la cita';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('appointments')
        // @ts-ignore - Temporal fix for database types
        .insert({
          doctor_id: user?.id,
          patient_id: formData.patient_id,
          scheduled_at: formData.scheduled_at,
          description: formData.description,
          notes: formData.notes,
          status: formData.status
        });

      if (error) throw error;

      router.push('/doctor/appointments');
    } catch (error) {
      console.error('Error creating appointment:', error);
      setErrors({ submit: 'Error al crear la cita. Por favor intenta de nuevo.' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Generar opciones de horario (8 AM - 6 PM, cada 30 minutos)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Obtener fecha mínima (mañana)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Nueva Cita</h1>
              <p className="mt-1 text-gray-600">
                Programa una nueva cita con un paciente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{errors.submit}</div>
            </div>
          )}

          {/* Selección de Paciente */}
          <div>
            <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Paciente
            </label>
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
            ) : (
              <select
                id="patient_id"
                value={formData.patient_id}
                onChange={(e) => handleInputChange('patient_id', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.patient_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona un paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.profiles?.first_name} {patient.profiles?.last_name} - {patient.profiles?.email}
                  </option>
                ))}
              </select>
            )}
            {errors.patient_id && (
              <p className="mt-1 text-sm text-red-600">{errors.patient_id}</p>
            )}
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Fecha
              </label>
              <input
                type="date"
                id="date"
                min={getMinDate()}
                value={formData.scheduled_at.split('T')[0] || ''}
                onChange={(e) => {
                  const currentTime = formData.scheduled_at.split('T')[1] || '09:00';
                  handleInputChange('scheduled_at', `${e.target.value}T${currentTime}`);
                }}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.scheduled_at ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>

            {/* Hora */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Hora
              </label>
              <select
                id="time"
                value={formData.scheduled_at.split('T')[1]?.substr(0, 5) || ''}
                onChange={(e) => {
                  const currentDate = formData.scheduled_at.split('T')[0] || getMinDate();
                  handleInputChange('scheduled_at', `${currentDate}T${e.target.value}:00`);
                }}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.scheduled_at ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona hora</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {errors.scheduled_at && (
            <p className="text-sm text-red-600">{errors.scheduled_at}</p>
          )}

          {/* Motivo de la cita */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de la cita
            </label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Consulta general, seguimiento, revisión..."
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Notas adicionales */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Preparación especial, recordatorios, observaciones..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Estado */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Estado inicial
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="scheduled">Programada</option>
              <option value="confirmed">Confirmada</option>
            </select>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/doctor/appointments"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Crear Cita
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Información importante:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Las citas solo se pueden programar con al menos 24 horas de anticipación</li>
          <li>• Los horarios disponibles son de 8:00 AM a 6:00 PM, de lunes a viernes</li>
          <li>• Se enviará una notificación automática al paciente</li>
          <li>• Puedes cambiar el estado de la cita más tarde desde la lista de citas</li>
        </ul>
      </div>
    </div>
  );
}
