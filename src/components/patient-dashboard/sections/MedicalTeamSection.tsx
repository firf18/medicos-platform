'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface MedicalTeamSectionProps {
  userId: string;
}

interface Doctor {
  id: string;
  full_name: string;
  email: string;
  specialty: string;
  phone?: string;
  bio?: string;
  rating?: number;
  total_appointments: number;
  last_appointment?: string;
  next_appointment?: string;
}

export function MedicalTeamSection({ userId }: MedicalTeamSectionProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMedicalTeam();
  }, [userId]);

  const fetchMedicalTeam = async () => {
    try {
      // Get doctors from appointments
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('doctor_id, scheduled_at, status')
        .eq('patient_id', userId)
        .not('doctor_id', 'is', null);

      if (error) throw error;

      // Group appointments by doctor
      const doctorMap = new Map();
      
      appointments?.forEach(appointment => {
        const doctorId = appointment.doctor_id;
        
        if (!doctorMap.has(doctorId)) {
          doctorMap.set(doctorId, {
            id: doctorId,
            full_name: 'García Martínez', // Mock data
            email: 'doctor@example.com', // Mock data
            specialty: 'Cardiología', // Mock data
            phone: '+1234567890', // Mock data
            bio: 'Especialista en cardiología con 15 años de experiencia', // Mock data
            rating: 4.5, // Mock data
            appointments: [],
            total_appointments: 0
          });
        }

        const doctorData = doctorMap.get(doctorId);
        doctorData.appointments.push(appointment);
        doctorData.total_appointments++;
      });

      // Process appointments to get last and next appointment dates
      const doctorsArray = Array.from(doctorMap.values()).map(doctor => {
        const now = new Date();
        const pastAppointments = doctor.appointments
          .filter((apt: any) => new Date(apt.scheduled_at) < now && apt.status === 'completed')
          .sort((a: any, b: any) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
        
        const futureAppointments = doctor.appointments
          .filter((apt: any) => new Date(apt.scheduled_at) > now && apt.status === 'scheduled')
          .sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

        return {
          ...doctor,
          last_appointment: pastAppointments[0]?.scheduled_at,
          next_appointment: futureAppointments[0]?.scheduled_at
        };
      });

      setDoctors(doctorsArray);
    } catch (error) {
      console.error('Error fetching medical team:', error);
    } finally {
      setLoading(false);
    }
  };

  const scheduleAppointment = (doctorId: string) => {
    // This would open the appointment scheduling modal/page
    console.log('Schedule appointment with doctor:', doctorId);
  };

  const sendMessage = (doctorId: string) => {
    // This would open the messaging interface
    console.log('Send message to doctor:', doctorId);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="w-4 h-4 text-yellow-400" />
          <StarIconSolid className="w-4 h-4 text-yellow-400 absolute top-0 left-0" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </div>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Equipo Médico</h1>
        <p className="text-gray-600 mt-1">
          Médicos y especialistas que forman parte de tu atención médica
        </p>
      </div>

      {/* Doctors Grid */}
      {doctors.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes médicos asignados</h3>
          <p className="text-gray-600 mb-6">
            Tu equipo médico aparecerá aquí después de tener citas programadas
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start space-x-4">
                {/* Doctor Avatar */}
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-xl">
                    {doctor.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>

                {/* Doctor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      Dr. {doctor.full_name}
                    </h3>
                  </div>
                  
                  <p className="text-blue-600 font-medium text-sm mb-2">
                    {doctor.specialty}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center space-x-1">
                      {renderStars(doctor.rating || 0)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {doctor.rating?.toFixed(1)} ({doctor.total_appointments} consultas)
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="w-4 h-4" />
                      <span className="truncate">{doctor.email}</span>
                    </div>
                    {doctor.phone && (
                      <div className="flex items-center space-x-2">
                        <PhoneIcon className="w-4 h-4" />
                        <span>{doctor.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Appointment Info */}
                  <div className="space-y-2 text-sm">
                    {doctor.last_appointment && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          Última consulta: {new Date(doctor.last_appointment).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                    {doctor.next_appointment && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          Próxima cita: {new Date(doctor.next_appointment).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {doctor.bio && (
                    <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                      {doctor.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => scheduleAppointment(doctor.id)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Agendar Cita</span>
                </button>
                <button
                  onClick={() => sendMessage(doctor.id)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-2 text-sm"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  <span>Mensaje</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {doctors.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de tu Equipo Médico</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{doctors.length}</div>
              <div className="text-sm text-gray-600">Médicos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {doctors.reduce((sum, doctor) => sum + doctor.total_appointments, 0)}
              </div>
              <div className="text-sm text-gray-600">Consultas Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(doctors.map(doctor => doctor.specialty)).size}
              </div>
              <div className="text-sm text-gray-600">Especialidades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {(doctors.reduce((sum, doctor) => sum + (doctor.rating || 0), 0) / doctors.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Calificación Promedio</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
