import { FlipCard } from '../ui/FlipCard';
import { InfiniteScroll } from '../ui/InfiniteScroll';

const patientFeatures = [
  {
    title: "Citas médicas digitales",
    description: "Agenda citas con especialistas verificados en Venezuela. Sistema de recordatorios automáticos vía WhatsApp y email.",
    icon: (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
      />
    )
  },
  {
    title: "Historial médico unificado",
    description: "Tu historial médico completo en un solo lugar, accesible desde cualquier dispositivo con máxima seguridad y privacidad.",
    icon: (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
      />
    )
  },
  {
    title: "Teleconsultas seguras",
    description: "Consultas médicas virtuales con profesionales certificados. Ideal para seguimientos y consultas de rutina.",
    icon: (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
      />
    )
  }
];

const clinicFeatures = [
  {
    title: "Gestión de ingresos",
    description: "Sistema integral para gestión de altas, ingresos y seguimiento post-operatorio de pacientes.",
    icon: (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
      />
    )
  },
  {
    title: "Conectividad hospitalaria",
    description: "Integración completa con otros centros médicos, clínicas y especialistas para referencias y colaboración.",
    icon: (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
      />
    )
  },
  {
    title: "Reportes y estadísticas",
    description: "Análisis detallados de ocupación, ingresos, tratamientos y desempeño clínico en tiempo real.",
    icon: (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
      />
    )
  }
];

const doctorFeatures = [
  {
    title: "Panel de control médico",
    description: "Agenda, historiales, prescripciones y seguimiento de pacientes en un solo lugar intuitivo.",
    icon: (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
      />
    )
  },
  {
    title: "Gestión de medicamentos",
    description: "Control de recetas, dosis, interacciones y recordatorios para pacientes asignados.",
    icon: (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
      />
    )
  },
  {
    title: "Colaboración profesional",
    description: "Comunicación segura con colegas, referencias médicas y consultas multidisciplinarias.",
    icon: (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
      />
    )
  }
];

const labFeatures = [
  {
    title: "Gestión de muestras",
    description: "Sistema especializado para seguimiento de muestras, resultados digitales y solicitudes médicas.",
    icon: (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
      />
    )
  },
  {
    title: "Resultados digitales",
    description: "Publicación inmediata de resultados de laboratorio con acceso seguro para médicos y pacientes.",
    icon: (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
      />
    )
  },
  {
    title: "Integración con médicos",
    description: "Conectividad directa con profesionales para solicitudes, resultados y seguimiento de casos.",
    icon: (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" 
      />
    )
  }
];

// Combinar todas las características
const allFeatures = [
  ...patientFeatures,
  ...clinicFeatures,
  ...doctorFeatures,
  ...labFeatures
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Soluciones Integrales para Todo el Ecosistema Médico</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Una plataforma completa que conecta pacientes, médicos, laboratorios y clínicas en un solo ecosistema digital
          </p>
        </div>
        
        {/* Sección para Pacientes */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Para Pacientes</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {patientFeatures.map((feature, index) => (
              <div key={`patient-${index}`} className="transform transition-all duration-300 hover:scale-105">
                <FlipCard
                  frontContent={
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {feature.icon}
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-500">Hover para más detalles</p>
                    </div>
                  }
                  backContent={
                    <div className="text-center p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">{feature.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  }
                  frontBackgroundColor="linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
                  backBackgroundColor="linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                  className="h-80 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sección para Clínicas */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Para Clínicas y Hospitales</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clinicFeatures.map((feature, index) => (
              <div key={`clinic-${index}`} className="transform transition-all duration-300 hover:scale-105">
                <FlipCard
                  frontContent={
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {feature.icon}
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-500">Hover para más detalles</p>
                    </div>
                  }
                  backContent={
                    <div className="text-center p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">{feature.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  }
                  frontBackgroundColor="linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
                  backBackgroundColor="linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
                  className="h-80 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sección para Médicos */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Para Médicos</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctorFeatures.map((feature, index) => (
              <div key={`doctor-${index}`} className="transform transition-all duration-300 hover:scale-105">
                <FlipCard
                  frontContent={
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {feature.icon}
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-500">Hover para más detalles</p>
                    </div>
                  }
                  backContent={
                    <div className="text-center p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">{feature.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  }
                  frontBackgroundColor="linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)"
                  backBackgroundColor="linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)"
                  className="h-80 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sección para Laboratorios */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Para Laboratorios</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {labFeatures.map((feature, index) => (
              <div key={`lab-${index}`} className="transform transition-all duration-300 hover:scale-105">
                <FlipCard
                  frontContent={
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {feature.icon}
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-500">Hover para más detalles</p>
                    </div>
                  }
                  backContent={
                    <div className="text-center p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">{feature.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  }
                  frontBackgroundColor="linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
                  backBackgroundColor="linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
                  className="h-80 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Specialties Section with Infinite Scroll */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Especialidades médicas disponibles</h3>
          
          {/* First row - moving right */}
          <InfiniteScroll direction="right" speed="normal" className="mb-6 py-4 px-8" pauseOnHover gap="mr-12">
            <div className="flex space-x-8">
              {[
                { emoji: "❤️", name: "Cardiología" },
                { emoji: "👶", name: "Pediatría" },
                { emoji: "👩‍⚕️", name: "Ginecología" },
                { emoji: "🦴", name: "Ortopedia" },
                { emoji: "👁️", name: "Oftalmología" },
                { emoji: "🧠", name: "Psiquiatría" },
                { emoji: "🩺", name: "Medicina General" },
                { emoji: "🧴", name: "Dermatología" },
                { emoji: "🫀", name: "Medicina Interna" },
                { emoji: "💊", name: "Endocrinología" },
                { emoji: "🦷", name: "Odontología" },
                { emoji: "👂", name: "Otorrinolaringología" },
                { emoji: "🏥", name: "Medicina Familiar" },
                { emoji: "💉", name: "Vacunación" },
              ].map((specialty, index) => (
                <div 
                  key={index} 
                  className="bg-white p-6 rounded-lg shadow-sm border flex-shrink-0 min-w-[160px] text-center hover:shadow-md transition-all duration-300 hover:scale-105 hover:z-10"
                >
                  <div className="text-3xl mb-2">{specialty.emoji}</div>
                  <div className="text-sm font-medium text-gray-800">{specialty.name}</div>
                </div>
              ))}
            </div>
          </InfiniteScroll>

          {/* Second row - moving left */}
          <InfiniteScroll direction="left" speed="normal" className="py-4 px-8" pauseOnHover gap="mr-12">
            <div className="flex space-x-8">
              {[
                { emoji: "🫁", name: "Neumología" },
                { emoji: "🧬", name: "Genética Médica" },
                { emoji: "🩻", name: "Radiología" },
                { emoji: "🔬", name: "Patología" },
                { emoji: "💉", name: "Anestesiología" },
                { emoji: "🏃‍♂️", name: "Medicina Deportiva" },
                { emoji: "🧓", name: "Geriatría" },
                { emoji: "🩸", name: "Hematología" },
                { emoji: "🦠", name: "Infectología" },
                { emoji: "🍎", name: "Nutriología" },
                { emoji: "🧠", name: "Neurología" },
                { emoji: "🩺", name: "Urología" },
                { emoji: "👶", name: "Neonatología" },
                { emoji: "🌡️", name: "Medicina Intensiva" },
              ].map((specialty, index) => (
                <div 
                  key={index} 
                  className="bg-white p-6 rounded-lg shadow-sm border flex-shrink-0 min-w-[160px] text-center hover:shadow-md transition-all duration-300 hover:scale-105 hover:z-10"
                >
                  <div className="text-3xl mb-2">{specialty.emoji}</div>
                  <div className="text-sm font-medium text-gray-800">{specialty.name}</div>
                </div>
              ))}
            </div>
          </InfiniteScroll>
        </div>
      </div>
    </section>
  );
}

