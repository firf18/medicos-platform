"use client";

import Link from "next/link";
import { Check, X, Star, Shield, Users, Clock } from "lucide-react";

export function PreciosContent() {
  const planes = [
    {
      name: "Paciente",
      subtitle: "Para personas que buscan atención médica",
      price: "Gratis",
      priceDetail: "Siempre",
      color: "blue",
      popular: false,
      features: [
        "Registro y perfil médico",
        "Búsqueda de médicos por especialidad",
        "Agendar citas médicas",
        "Historial médico digital",
        "Recordatorios de citas",
        "Chat básico con médicos",
        "Acceso a recetas digitales",
        "Soporte por email",
      ],
      limitations: [
        "Máximo 3 citas por mes",
        "Sin teleconsultas premium",
        "Sin prioridad en soporte",
      ],
    },
    {
      name: "Médico Básico",
      subtitle: "Para médicos que inician en digital",
      price: "$15",
      priceDetail: "/mes",
      color: "green",
      popular: true,
      features: [
        "Perfil profesional verificado",
        "Gestión de agenda ilimitada",
        "Citas presenciales y virtuales",
        "Historial de pacientes",
        "Sistema de pagos integrado",
        "Recordatorios automáticos",
        "Estadísticas básicas",
        "Soporte prioritario",
        "Sin comisiones por cita",
      ],
      limitations: [
        "Máximo 50 pacientes activos",
        "Funciones básicas de telemedicina",
      ],
    },
    {
      name: "Médico Pro",
      subtitle: "Para médicos establecidos",
      price: "$35",
      priceDetail: "/mes",
      color: "purple",
      popular: false,
      features: [
        "Todo lo del plan Básico",
        "Pacientes ilimitados",
        "Telemedicina avanzada",
        "Grabación de consultas",
        "Análisis y reportes detallados",
        "Integración con laboratorios",
        "API para sistemas externos",
        "Soporte 24/7",
        "Marca personalizada",
        "Múltiples ubicaciones",
      ],
      limitations: [],
    },
    {
      name: "Clínica/Hospital",
      subtitle: "Para instituciones médicas",
      price: "Personalizado",
      priceDetail: "Contactar",
      color: "orange",
      popular: false,
      features: [
        "Múltiples médicos y especialistas",
        "Dashboard administrativo",
        "Gestión de inventario",
        "Facturación empresarial",
        "Integración con sistemas existentes",
        "Capacitación del personal",
        "Soporte dedicado",
        "SLA garantizado",
        "Backup y seguridad avanzada",
        "Cumplimiento regulatorio",
      ],
      limitations: [],
    },
  ];

  const faqs = [
    {
      question: "¿Por qué es gratis para pacientes?",
      answer:
        "Creemos que el acceso a la salud digital debe ser universal. Los pacientes no pagan porque nuestro modelo se basa en suscripciones de médicos, no en cobrar a quien necesita atención médica.",
    },
    {
      question: "¿Hay costos ocultos?",
      answer:
        "¡Absolutamente no! Somos 100% transparentes. Los precios mostrados son finales. No hay comisiones ocultas, tarifas de activación o costos adicionales sorpresa.",
    },
    {
      question: "¿Puedo cambiar de plan en cualquier momento?",
      answer:
        "Sí, puedes cambiar tu plan cuando quieras. Los cambios se aplican inmediatamente y solo pagas la diferencia prorrateada.",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer:
        "Aceptamos transferencias bancarias, Zelle, PayPal, pago móvil y tarjetas de crédito internacionales. Adaptados a la realidad venezolana.",
    },
  ];

  const getColorClasses = (color: string, popular: boolean) => {
    const colors = {
      blue: popular ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white",
      green: popular
        ? "border-green-500 bg-green-50"
        : "border-gray-200 bg-white",
      purple: popular
        ? "border-purple-500 bg-purple-50"
        : "border-gray-200 bg-white",
      orange: popular
        ? "border-orange-500 bg-orange-50"
        : "border-gray-200 bg-white",
    };
    return colors[color as keyof typeof colors];
  };

  const getButtonClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-600 hover:bg-blue-700 text-white",
      green: "bg-green-600 hover:bg-green-700 text-white",
      purple: "bg-purple-600 hover:bg-purple-700 text-white",
      orange: "bg-orange-600 hover:bg-orange-700 text-white",
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-500 text-white mb-4">
                💰 Transparencia Total • Sin Sorpresas
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Precios Justos y Transparentes
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto">
              Somos una empresa nueva que cree en la honestidad. Aquí están
              nuestros precios reales, sin letra pequeña ni costos ocultos. Lo
              que ves es lo que pagas.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Elige el Plan Perfecto para Ti
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Planes diseñados para cada necesidad. Desde pacientes hasta
              grandes instituciones médicas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {planes.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-lg border-2 p-8 shadow-lg hover:shadow-xl transition-shadow ${getColorClasses(
                  plan.color,
                  plan.popular
                )}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Más Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.subtitle}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-1">
                      {plan.priceDetail}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, idx) => (
                    <li key={idx} className="flex items-start">
                      <X className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-500 text-sm">
                        {limitation}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={
                    plan.price === "Personalizado" ? "/contacto" : "/register"
                  }
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors text-center block ${getButtonClasses(
                    plan.color
                  )}`}
                >
                  {plan.price === "Personalizado"
                    ? "Contactar Ventas"
                    : plan.price === "Gratis"
                    ? "Registrarse Gratis"
                    : "Comenzar Prueba"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestra Promesa de Transparencia
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Como empresa nueva, construimos confianza siendo completamente
              honestos sobre nuestros precios y servicios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sin Costos Ocultos
              </h3>
              <p className="text-gray-600">
                Lo que ves es lo que pagas. No hay tarifas sorpresa, comisiones
                ocultas o letra pequeña.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Gratis para Pacientes
              </h3>
              <p className="text-gray-600">
                Creemos que el acceso a la salud digital debe ser universal. Los
                pacientes nunca pagan.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Prueba Sin Compromiso
              </h3>
              <p className="text-gray-600">
                30 días de prueba gratuita para médicos. Cancela cuando quieras,
                sin penalizaciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comparación Detallada
            </h2>
            <p className="text-xl text-gray-600">
              Todas las funcionalidades al detalle para que tomes la mejor
              decisión
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Funcionalidad
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Paciente
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Médico Básico
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Médico Pro
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Clínica
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    {
                      feature: "Perfil y registro",
                      values: ["✓", "✓", "✓", "✓"],
                    },
                    {
                      feature: "Búsqueda de médicos",
                      values: ["✓", "N/A", "N/A", "N/A"],
                    },
                    {
                      feature: "Agendar citas",
                      values: ["3/mes", "Ilimitado", "Ilimitado", "Ilimitado"],
                    },
                    {
                      feature: "Historial médico",
                      values: ["✓", "✓", "✓", "✓"],
                    },
                    {
                      feature: "Teleconsultas",
                      values: ["Básico", "✓", "Avanzado", "Avanzado"],
                    },
                    {
                      feature: "Pacientes activos",
                      values: ["N/A", "50", "Ilimitado", "Ilimitado"],
                    },
                    {
                      feature: "Análisis y reportes",
                      values: ["✗", "Básico", "Avanzado", "Empresarial"],
                    },
                    {
                      feature: "Soporte",
                      values: ["Email", "Prioritario", "24/7", "Dedicado"],
                    },
                    {
                      feature: "API integración",
                      values: ["✗", "✗", "✓", "✓"],
                    },
                    {
                      feature: "Marca personalizada",
                      values: ["✗", "✗", "✓", "✓"],
                    },
                  ].map((row, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {row.feature}
                      </td>
                      {row.values.map((value, idx) => (
                        <td
                          key={idx}
                          className="px-6 py-4 text-center text-sm text-gray-700"
                        >
                          {value === "✓" ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : value === "✗" ? (
                            <X className="h-5 w-5 text-red-400 mx-auto" />
                          ) : (
                            value
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-xl text-gray-600">
              Respuestas honestas a las preguntas más comunes
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para Transformar tu Práctica Médica?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Únete a la revolución de la salud digital en Venezuela. Comienza tu
            prueba gratuita hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Comenzar Prueba Gratuita
            </Link>
            <Link
              href="/contacto"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Hablar con Ventas
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
