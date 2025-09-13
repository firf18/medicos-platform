import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Heart, Users, Shield, Zap, Target, Eye, CheckCircle } from 'lucide-react';

export default function NosotrosPage() {
  const valores = [
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Transparencia Total",
      description: "Operamos con total transparencia en nuestros procesos, precios y desarrollo. Creemos que la honestidad construye confianza."
    },
    {
      icon: <Heart className="h-8 w-8 text-red-600" />,
      title: "Pasión por la Salud",
      description: "Cada línea de código que escribimos está motivada por mejorar la vida de los venezolanos y revolucionar la medicina."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Innovación Constante",
      description: "Utilizamos la tecnología más avanzada y las mejores prácticas para crear soluciones que realmente funcionen."
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Accesibilidad Universal",
      description: "Creemos que todos los venezolanos, sin importar su ubicación o situación, merecen acceso a atención médica de calidad."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-500 text-white mb-4">
                🚀 Empresa Nueva • Visión Grande
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transformando la Medicina en Venezuela
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto">
              Somos una empresa nueva con ganas de revolucionar la salud digital en Venezuela. 
              Con tecnología de vanguardia y transparencia total, estamos construyendo el futuro de la medicina.
            </p>
          </div>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Una Nueva Era para la Salud Digital
              </h2>
              <div className="space-y-6 text-lg text-gray-600">
                <p>
                  <strong className="text-gray-900">Somos nuevos, y eso es nuestra fortaleza.</strong> Como empresa emergente, 
                  no tenemos sistemas obsoletos que nos limiten. Podemos construir desde cero con la tecnología más moderna 
                  y las mejores prácticas de la industria.
                </p>
                <p>
                  Nuestro equipo está formado por profesionales apasionados que creen firmemente que Venezuela merece 
                  una plataforma médica de clase mundial. No estamos aquí solo para hacer negocio, estamos aquí para 
                  <strong className="text-blue-600"> transformar vidas</strong>.
                </p>
                <p>
                  Creemos en la <strong className="text-gray-900">transparencia total</strong>. Compartimos nuestro progreso, 
                  nuestros desafíos y nuestros planes. Queremos que nuestros usuarios sean parte del viaje, no solo el destino.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <Target className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">Misión Clara</div>
                  <div className="text-gray-600 text-sm">Democratizar la salud digital</div>
                </div>
                <div className="text-center">
                  <Eye className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">Visión Grande</div>
                  <div className="text-gray-600 text-sm">Liderar la medicina del futuro</div>
                </div>
                <div className="text-center">
                  <Zap className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">Tecnología</div>
                  <div className="text-gray-600 text-sm">Lo más nuevo y potente</div>
                </div>
                <div className="text-center">
                  <Shield className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">Transparencia</div>
                  <div className="text-gray-600 text-sm">Honestidad en todo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestros Valores */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestros Valores Fundamentales
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Estos principios guían cada decisión que tomamos y cada línea de código que escribimos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {valores.map((valor, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 mr-4">
                    {valor.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {valor.title}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {valor.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nuestro Compromiso */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestro Compromiso con Venezuela
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No solo construimos software, construimos el futuro de la salud en nuestro país
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Tecnología de Vanguardia",
                description: "Utilizamos las últimas tecnologías: Next.js 14, Supabase, TypeScript, y las mejores prácticas de desarrollo.",
                items: ["Arquitectura moderna", "Seguridad avanzada", "Escalabilidad garantizada"]
              },
              {
                title: "Desarrollo Transparente",
                description: "Compartimos nuestro progreso, desafíos y planes. Creemos que la transparencia construye confianza.",
                items: ["Actualizaciones regulares", "Feedback abierto", "Roadmap público"]
              },
              {
                title: "Impacto Real",
                description: "Cada funcionalidad que desarrollamos tiene un propósito: mejorar la vida de médicos y pacientes venezolanos.",
                items: ["Enfoque en el usuario", "Soluciones prácticas", "Resultados medibles"]
              }
            ].map((compromiso, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {compromiso.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {compromiso.description}
                </p>
                <ul className="space-y-2">
                  {compromiso.items.map((item, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Únete a Nuestra Misión
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Sé parte de la transformación de la salud digital en Venezuela. Juntos podemos construir un futuro mejor para la medicina venezolana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Comenzar ahora
            </Link>
            <Link
              href="/contacto"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}