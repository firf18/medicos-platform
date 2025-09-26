'use client';

import Link from 'next/link';
import { 
  Calendar, 
  FileText, 
  Shield, 
  Smartphone, 
  Users, 
  Heart,
  Clock,
  MapPin,
  Star,
  CheckCircle
} from 'lucide-react';

export function ServiciosContent() {
  const servicios = [
    {
      icon: <Calendar className="h-12 w-12 text-blue-600" />,
      title: "Citas médicas digitales",
      description: "Agenda citas con especialistas de manera rápida y sencilla desde cualquier dispositivo.",
      features: ["Disponibilidad en tiempo real", "Recordatorios automáticos", "Reagendamiento fácil"]
    },
    {
      icon: <FileText className="h-12 w-12 text-green-600" />,
      title: "Historial médico unificado",
      description: "Accede a tu historial médico completo y compártelo de forma segura con tus médicos.",
      features: ["Historial completo", "Acceso desde cualquier lugar", "Compartir con médicos"]
    },
    {
      icon: <Shield className="h-12 w-12 text-purple-600" />,
      title: "Teleconsultas seguras",
      description: "Consultas médicas virtuales con la más alta seguridad y calidad de video.",
      features: ["Video HD seguro", "Grabación de consultas", "Recetas digitales"]
    },
    {
      icon: <Users className="h-12 w-12 text-orange-600" />,
      title: "Red de especialistas",
      description: "Acceso a médicos especialistas verificados en toda Venezuela.",
      features: ["Médicos verificados", "40+ especialidades", "Cobertura nacional"]
    },
    {
      icon: <Smartphone className="h-12 w-12 text-red-600" />,
      title: "Gestión de medicamentos",
      description: "Lleva el control de tus medicamentos, dosis y recordatorios.",
      features: ["Recordatorios de dosis", "Interacciones medicamentosas", "Historial de medicamentos"]
    },
    {
      icon: <Heart className="h-12 w-12 text-pink-600" />,
      title: "Pagos seguros",
      description: "Múltiples métodos de pago seguros y transparentes.",
      features: ["Pagos en línea", "Facturación electrónica", "Múltiples métodos"]
    }
  ];

  const beneficios = [
    "Ahorra tiempo y dinero en traslados",
    "Acceso 24/7 a tu información médica",
    "Médicos especialistas verificados",
    "Tecnología de última generación",
    "Seguridad y privacidad garantizada",
    "Soporte técnico especializado"
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Servicios de Salud Digital
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Todo lo que necesitas en salud digital. Una plataforma completa diseñada para revolucionar la atención médica en Venezuela.
            </p>
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Servicios Principales */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas en salud digital
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Una plataforma completa diseñada para revolucionar la atención médica en Venezuela, conectando pacientes con más de 40 especialidades médicas disponibles para transformar tu experiencia de salud.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicios.map((servicio, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
              >
                <div className="flex items-center justify-center w-20 h-20 bg-gray-50 rounded-lg mb-6 mx-auto">
                  {servicio.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  {servicio.title}
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  {servicio.description}
                </p>
                <ul className="space-y-2">
                  {servicio.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Especialidades Disponibles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Especialidades médicas disponibles
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conectamos pacientes con más de 40 especialidades médicas para transformar tu experiencia de salud
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              'Cardiología', 'Pediatría', 'Ginecología', 'Ortopedia',
              'Neurología', 'Dermatología', 'Oftalmología', 'Psiquiatría',
              'Oncología', 'Endocrinología', 'Gastroenterología', 'Neumología',
              'Urología', 'Radiología', 'Anestesiología', 'Medicina Interna'
            ].map((especialidad, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <Heart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">{especialidad}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link
              href="/medicos"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todas las especialidades →
            </Link>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                ¿Por qué elegir MedConnect?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Somos una empresa nueva con ganas de transformar la medicina en Venezuela con tecnología de vanguardia, siendo completamente transparentes en nuestro proceso.
              </p>
              <ul className="space-y-4">
                {beneficios.map((beneficio, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{beneficio}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                  <div className="text-gray-600">Seguro y Privado</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                  <div className="text-gray-600">Acceso a tu historial</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">40+</div>
                  <div className="text-gray-600">Especialidades Médicas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">∞</div>
                  <div className="text-gray-600">Posibilidades</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Únete a la revolución de la salud digital en Venezuela
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Sé parte del futuro de la medicina venezolana. Regístrate gratis y comienza a disfrutar de una experiencia médica moderna, segura y eficiente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Comenzar gratis ahora
            </Link>
            <Link
              href="/nosotros"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Ver más información
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
