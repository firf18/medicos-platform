'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Stethoscope, Star, MapPin, Clock, Users, Award, Loader2 } from 'lucide-react';

type Specialty = {
  id: number;
  name: string;
  description: string;
  doctor_count: number;
};

type Doctor = {
  id: string;
  first_name: string;
  last_name: string;
  specialty_name: string;
  experience_years: number;
  consultation_fee: number;
  rating: number;
  bio: string;
  is_available: boolean;
  license_number: string;
};

type Stats = {
  total_doctors: number;
  total_patients: number;
  total_specialties: number;
  total_appointments: number;
};

export function MedicosContent() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener especialidades
      const { data: specialtiesData, error: specialtiesError } = await supabase
        .from('specialties')
        .select('id, name, description');

      if (specialtiesError) throw specialtiesError;

      // Obtener conteo de médicos por especialidad
      const specialtiesWithCount = await Promise.all(
        (specialtiesData || []).map(async (specialty: any) => {
          const { count } = await supabase
            .from('doctors')
            .select('*', { count: 'exact', head: true })
            .eq('specialty_id', specialty.id);
          
          return {
            id: specialty.id,
            name: specialty.name,
            description: specialty.description,
            doctor_count: count || 0
          };
        })
      );

      // Obtener médicos con información de perfil y especialidad
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select(`
          id,
          experience_years,
          consultation_fee,
          rating,
          bio,
          is_available,
          license_number,
          specialty_id,
          profiles!inner(
            first_name,
            last_name
          )
        `)
        .eq('is_available', true)
        .limit(6);

      if (doctorsError) throw doctorsError;

      // Obtener especialidades para mapear nombres
      const specialtyMap = new Map(
        (specialtiesData || []).map((s: any) => [s.id, s.name])
      );

      // Procesar datos de médicos
      const processedDoctors = doctorsData?.map((doctor: any) => ({
        id: doctor.id,
        first_name: doctor.profiles?.first_name,
        last_name: doctor.profiles?.last_name,
        specialty_name: specialtyMap.get(doctor.specialty_id) || 'Especialidad no especificada',
        experience_years: doctor.experience_years || 0,
        consultation_fee: doctor.consultation_fee || 0,
        rating: doctor.rating || 0,
        bio: doctor.bio || '',
        is_available: doctor.is_available,
        license_number: doctor.license_number || ''
      })) || [];

      // Obtener estadísticas
      const [
        { count: doctorsCount },
        { count: patientsCount },
        { count: specialtiesCount },
        { count: appointmentsCount }
      ] = await Promise.all([
        supabase.from('doctors').select('*', { count: 'exact', head: true }),
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('specialties').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true })
      ]);

      const statsData: Stats = {
        total_doctors: doctorsCount || 0,
        total_patients: patientsCount || 0,
        total_specialties: specialtiesCount || 0,
        total_appointments: appointmentsCount || 0
      };

      setSpecialties(specialtiesWithCount);
      setDoctors(processedDoctors);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando información de médicos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg mb-4">
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Nuestros Médicos
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Conecta con profesionales de la salud altamente calificados en Venezuela
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Buscar Médico
              </Link>
              <Link
                href="/register?role=doctor"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Únete como Médico
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats?.total_doctors || 0}
              </h3>
              <p className="text-gray-600">Médicos Registrados</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats?.total_patients || 0}
              </h3>
              <p className="text-gray-600">Pacientes Registrados</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats?.total_specialties || 0}
              </h3>
              <p className="text-gray-600">Especialidades</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats?.total_appointments || 0}
              </h3>
              <p className="text-gray-600">Citas Realizadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Especialidades */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Especialidades Médicas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Encuentra el especialista que necesitas en nuestra amplia red de profesionales
            </p>
          </div>
          
          {specialties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {specialties.map((especialidad) => (
                <div
                  key={especialidad.id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <div className="text-center">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Stethoscope className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {especialidad.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {especialidad.doctor_count} médicos disponibles
                    </p>
                    <Link
                      href={`/register?specialty=${especialidad.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver médicos →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay especialidades disponibles
              </h3>
              <p className="text-gray-600">
                Pronto tendremos especialidades médicas disponibles.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Médicos Destacados */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Médicos Disponibles
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conoce a nuestros profesionales de la salud
            </p>
          </div>
          
          {doctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.map((medico) => (
                <div
                  key={medico.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                        <Stethoscope className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Dr. {medico.first_name} {medico.last_name}
                        </h3>
                        <p className="text-blue-600 font-medium">{medico.specialty_name}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Award className="h-4 w-4 mr-2" />
                        <span>{medico.experience_years} años de experiencia</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>Venezuela</span>
                      </div>
                      {medico.rating > 0 && (
                        <div className="flex items-center text-gray-600">
                          <Star className="h-4 w-4 mr-2 text-yellow-400 fill-current" />
                          <span>{medico.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    {medico.bio && (
                      <p className="text-gray-600 text-sm mb-4 overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {medico.bio}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          ${medico.consultation_fee}
                        </span>
                        <span className="text-gray-600">/consulta</span>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          medico.is_available ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        <span className={`text-sm ${
                          medico.is_available ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {medico.is_available ? 'Disponible' : 'No disponible'}
                        </span>
                      </div>
                    </div>
                    
                    <Link
                      href="/register"
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                    >
                      Agendar Cita
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay médicos disponibles
              </h3>
              <p className="text-gray-600 mb-6">
                Actualmente no tenemos médicos registrados en la plataforma.
              </p>
              <Link
                href="/register?role=doctor"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ser el primer médico
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Eres médico y quieres unirte?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Forma parte de nuestra red de profesionales y ayuda a más pacientes en Venezuela
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register?role=doctor"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Registrarse como Médico
            </Link>
            <Link
              href="/contacto"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Más Información
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
