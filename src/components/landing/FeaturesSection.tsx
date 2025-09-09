import { FlipCard } from '../ui/FlipCard';
import { InfiniteScroll } from '../ui/InfiniteScroll';

const features = [
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
  },
  {
    title: "Red de especialistas",
    description: "Acceso a médicos especializados en Cardiología, Dermatología, Pediatría, Ginecología y más especialidades.",
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
    title: "Gestión de medicamentos",
    description: "Lleva el control de tus medicamentos, dosis y recordatorios. Historial completo de prescripciones médicas.",
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
    title: "Pagos seguros",
    description: "Múltiples métodos de pago: transferencias bancarias, Zelle, PayPal y pago móvil. Facturas digitales automáticas.",
    icon: (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
      />
    )
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Todo lo que necesitas en salud digital</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Una plataforma completa diseñada para revolucionar la atención médica en Venezuela, 
            conectando pacientes con profesionales de la salud de manera eficiente y segura.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FlipCard
              key={index}
              frontContent={
                <div className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {feature.icon}
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm opacity-90">Hover para más detalles</p>
                </div>
              }
              backContent={
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-sm leading-relaxed">{feature.description}</p>
                </div>
              }
              className="h-80"
            />
          ))}
        </div>

        {/* Specialties Section with Infinite Scroll */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Especialidades médicas disponibles</h3>
          
          {/* First row - moving right */}
          <InfiniteScroll direction="right" speed="normal" className="mb-6">
            <div className="flex space-x-6">
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
              ].map((specialty, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border flex-shrink-0 min-w-[160px] text-center hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-2">{specialty.emoji}</div>
                  <div className="text-sm font-medium text-gray-800">{specialty.name}</div>
                </div>
              ))}
            </div>
          </InfiniteScroll>

          {/* Second row - moving left */}
          <InfiniteScroll direction="left" speed="normal">
            <div className="flex space-x-6">
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
              ].map((specialty, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border flex-shrink-0 min-w-[160px] text-center hover:shadow-md transition-shadow">
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

