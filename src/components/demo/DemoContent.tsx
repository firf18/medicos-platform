'use client';

import Link from 'next/link';
import { Play, Calendar, FileText, Video, Users, Shield, Clock } from 'lucide-react';

export function DemoContent() {
  const demoFeatures = [
    {
      title: "Dashboard de Paciente",
      description: "Explora cómo los pacientes gestionan sus citas, historial médico y comunicación con médicos.",
      icon: <Users className="h-8 w-8 text-blue-600" />,
      duration: "3 min",
      image: "/api/placeholder/400/250"
    },
    {
      title: "Dashboard de Médico",
      description: "Descubre las herramientas que los médicos usan para gestionar pacientes, agenda y consultas.",
      icon: <Calendar className="h-8 w-8 text-green-600" />,
      duration: "4 min",
      image: "/api/placeholder/400/250"
    },
    {
      title: "Sistema de Teleconsultas",
      description: "Ve en acción nuestro sistema de videollamadas seguras para consultas médicas virtuales.",
      icon: <Video className="h-8 w-8 text-purple-600" />,
      duration: "2 min",
      image: "/api/placeholder/400/250"
    },
    {
      title: "Historial Médico Digital",
      description: "Conoce cómo almacenamos y organizamos la información médica de forma segura y accesible.",
      icon: <FileText className="h-8 w-8 text-orange-600" />,
      duration: "3 min",
      image: "/api/placeholder/400/250"
    }
  ];

  const benefits = [
    {
      icon: <Shield className="h-6 w-6 text-green-500" />,
      title: "100% Seguro",
      description: "Datos encriptados y cumplimiento con estándares internacionales"
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-500" />,
      title: "Ahorra Tiempo",
      description: "Reduce el tiempo de gestión administrativa hasta en un 70%"
    },
    {
      icon: <Users className="h-6 w-6 text-purple-500" />,
      title: "Fácil de Usar",
      description: "Interfaz intuitiva diseñada para médicos y pacientes venezolanos"
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-500 text-white mb-4">
                🎥 Demo Interactivo • Ver en Acción
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Ve MediConnect en Acción
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto">
              Descubre cómo nuestra plataforma está transformando la medicina en Venezuela. 
              Explora todas las funcionalidades sin necesidad de registrarte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center">
                <Play className="h-5 w-5 mr-2" />
                Ver Demo Completo
              </button>
              <Link
                href="/register"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Probar Gratis Ahora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explora Cada Funcionalidad
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Demos interactivos de cada parte de la plataforma. Ve exactamente cómo funciona antes de decidir.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {demoFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
              >
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      {feature.icon}
                      <p className="text-gray-500 mt-2">Vista previa del demo</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold flex items-center">
                      <Play className="h-5 w-5 mr-2" />
                      Ver Demo
                    </button>
                  </div>
                  <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                    {feature.duration}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Demo Interactivo en Vivo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Prueba la plataforma real con datos de ejemplo. Sin registros, sin compromisos.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Acceso Inmediato al Demo
                </h3>
                <p className="text-gray-600 mb-6">
                  Explora la plataforma completa con datos de ejemplo. Ve cómo sería tu experiencia 
                  real usando MediConnect, tanto como paciente como médico.
                </p>
                <ul className="space-y-3 mb-6">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {benefit.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                        <p className="text-gray-600 text-sm">{benefit.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Acceder al Demo
                  </button>
                  <Link
                    href="/contacto"
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                  >
                    Solicitar Demo Personalizado
                  </Link>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="h-10 w-10 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Demo en Tiempo Real
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Plataforma completamente funcional con datos de ejemplo
                  </p>
                  <div className="bg-white rounded-lg p-4 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Usuario Demo:</span>
                      <span className="text-sm text-gray-500">paciente@demo.com</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Contraseña:</span>
                      <span className="text-sm text-gray-500">demo123</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      * Datos de ejemplo, no reales
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo Que Dicen Nuestros Usuarios Beta
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Testimonios reales de médicos y pacientes que ya están probando la plataforma
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Carlos Mendoza",
                role: "Cardiólogo, Caracas",
                comment: "La plataforma es intuitiva y me ha ayudado a organizar mejor mi consulta. Los pacientes están encantados con la facilidad de agendar citas."
              },
              {
                name: "María González",
                role: "Paciente",
                comment: "Por fin puedo tener mi historial médico organizado en un solo lugar. Es muy fácil de usar y me siento segura con la privacidad."
              },
              {
                name: "Dra. Ana Rodríguez",
                role: "Pediatra, Valencia",
                comment: "Como empresa nueva, han sido muy receptivos a nuestras sugerencias. Se nota que realmente quieren hacer algo bueno para Venezuela."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-700 mb-4 italic">&ldquo;{testimonial.comment}&rdquo;</p>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Convencido? Comienza Tu Prueba Gratuita
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Después de ver el demo, da el siguiente paso. Regístrate gratis y comienza a transformar tu experiencia médica hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Registrarse Gratis
            </Link>
            <Link
              href="/contacto"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Hablar con el Equipo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}