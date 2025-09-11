import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-6">
            🇻🇪 Hecho en Venezuela para Venezuela
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Salud Digital <span className="text-blue-600">al Alcance</span> de Todos
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          La primera plataforma médica integral de Venezuela. Conectamos pacientes con más de 
          <span className="font-semibold text-blue-600"> 40 especialidades médicas</span> disponibles 
          para transformar tu experiencia de salud.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link 
            href="/auth/register" 
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Comenzar Gratis
          </Link>
          <Link 
            href="/demo" 
            className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
          >
            Ver Demo
          </Link>
        </div>

        {/* Stats Section with Animation */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center group">
            <div className="text-3xl font-bold text-blue-600 mb-2 transform group-hover:scale-110 transition-transform duration-300">
              40+
            </div>
            <div className="text-gray-600 text-sm">Especialidades Médicas</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold text-green-600 mb-2 transform group-hover:scale-110 transition-transform duration-300">
              100%
            </div>
            <div className="text-gray-600 text-sm">Seguro y Privado</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold text-purple-600 mb-2 transform group-hover:scale-110 transition-transform duration-300">
              24/7
            </div>
            <div className="text-gray-600 text-sm">Acceso a tu Historial</div>
          </div>
        </div>
      </div>
    </section>
  );
}
