'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, MessageCircle, Phone, Mail } from 'lucide-react';

export function FAQContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      category: "General",
      questions: [
        {
          question: "¿Qué es MediConnect?",
          answer: "MediConnect es la primera plataforma médica digital integral de Venezuela. Conectamos pacientes con médicos especialistas, facilitamos teleconsultas, gestionamos historiales médicos y simplificamos el proceso de atención médica usando tecnología de vanguardia."
        },
        {
          question: "¿Es segura la plataforma?",
          answer: "Absolutamente. Utilizamos encriptación de extremo a extremo, cumplimos con estándares internacionales de seguridad médica, y todos los datos están protegidos con las mejores prácticas de ciberseguridad. Tu información médica está más segura que en papel."
        },
        {
          question: "¿Cómo empiezo a usar MediConnect?",
          answer: "Es muy simple: 1) Regístrate gratis en nuestra plataforma, 2) Completa tu perfil médico, 3) Busca médicos por especialidad, 4) Agenda tu primera cita. Todo el proceso toma menos de 5 minutos."
        }
      ]
    },
    {
      category: "Para Pacientes",
      questions: [
        {
          question: "¿Cuánto cuesta usar MediConnect como paciente?",
          answer: "¡Es completamente gratis para pacientes! Creemos que el acceso a la salud digital debe ser universal. Solo pagas la consulta médica directamente al doctor, sin comisiones adicionales de nuestra parte."
        },
        {
          question: "¿Puedo ver mi historial médico completo?",
          answer: "Sí, tienes acceso completo a tu historial médico 24/7 desde cualquier dispositivo. Incluye consultas anteriores, recetas, estudios, alergias y toda tu información médica organizada de forma segura."
        },
        {
          question: "¿Cómo funciona el sistema de citas?",
          answer: "Busca médicos por especialidad, ve su disponibilidad en tiempo real, selecciona el horario que prefieras y confirma tu cita. Recibirás recordatorios automáticos por WhatsApp y email."
        },
        {
          question: "¿Qué pasa si necesito cancelar una cita?",
          answer: "Puedes cancelar o reprogramar citas hasta 24 horas antes sin penalización. Si cancelas con menos tiempo, dependerá de la política individual de cada médico."
        }
      ]
    },
    {
      category: "Para Médicos",
      questions: [
        {
          question: "¿Cuánto cuesta la suscripción para médicos?",
          answer: "Ofrecemos planes desde $15/mes para médicos que inician, hasta $35/mes para médicos establecidos. También tenemos planes empresariales personalizados. Todos incluyen 30 días de prueba gratuita."
        },
        {
          question: "¿Cómo recibo los pagos de mis consultas?",
          answer: "Los pagos se procesan automáticamente y se transfieren a tu cuenta bancaria semanalmente. Aceptamos todos los métodos de pago populares en Venezuela: transferencias, Zelle, PayPal y pago móvil."
        },
        {
          question: "¿Puedo integrar MediConnect con mi sistema actual?",
          answer: "Sí, ofrecemos APIs y integraciones con los principales sistemas médicos. Nuestro equipo técnico te ayuda con la migración de datos y configuración sin costo adicional."
        },
        {
          question: "¿Qué pasa si tengo problemas técnicos?",
          answer: "Ofrecemos soporte técnico prioritario para médicos suscriptores. Puedes contactarnos por WhatsApp, email o teléfono. Los planes Pro incluyen soporte 24/7."
        }
      ]
    },
    {
      category: "Técnico",
      questions: [
        {
          question: "¿Funciona en todos los dispositivos?",
          answer: "Sí, MediConnect funciona en computadoras, tablets y teléfonos móviles. Es una aplicación web responsive que se adapta a cualquier pantalla. También estamos desarrollando apps nativas para iOS y Android."
        },
        {
          question: "¿Necesito instalar algo especial?",
          answer: "No, solo necesitas un navegador web moderno (Chrome, Firefox, Safari, Edge). Para videollamadas, necesitarás permitir acceso a cámara y micrófono. Todo funciona desde el navegador."
        },
        {
          question: "¿Qué pasa si se va la luz o internet?",
          answer: "La plataforma guarda automáticamente tu progreso. Si se interrumpe una teleconsulta, puedes reconectarte fácilmente. Los datos se sincronizan cuando recuperas la conexión."
        },
        {
          question: "¿Puedo usar MediConnect desde el exterior?",
          answer: "Sí, puedes acceder desde cualquier país. Esto es especialmente útil para venezolanos en el exterior que quieren consultar con médicos en Venezuela o viceversa."
        }
      ]
    },
    {
      category: "Privacidad y Seguridad",
      questions: [
        {
          question: "¿Quién puede ver mi información médica?",
          answer: "Solo tú y los médicos que autorices específicamente pueden ver tu información. Usamos controles de acceso estrictos y cada acceso queda registrado en un log de auditoría."
        },
        {
          question: "¿Venden mi información a terceros?",
          answer: "¡Jamás! Tu información médica es tuya y solo tuya. No vendemos, alquilamos ni compartimos datos personales con terceros. Esta es una promesa fundamental de nuestra empresa."
        },
        {
          question: "¿Cómo protegen mis datos?",
          answer: "Usamos encriptación AES-256, servidores seguros, autenticación de dos factores, y cumplimos con estándares internacionales como HIPAA. Realizamos auditorías de seguridad regulares."
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Preguntas Frecuentes
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto">
              Respuestas honestas y directas a todas tus dudas sobre MediConnect. 
              Si no encuentras lo que buscas, contáctanos directamente.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en preguntas frecuentes..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No encontramos resultados para "{searchTerm}"
              </h3>
              <p className="text-gray-600 mb-6">
                Intenta con otros términos o contáctanos directamente
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver todas las preguntas
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFAQs.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">
                    {category.category}
                  </h2>
                  <div className="space-y-4">
                    {category.questions.map((faq, questionIndex) => {
                      const globalIndex = categoryIndex * 100 + questionIndex;
                      const isOpen = openItems.includes(globalIndex);
                      
                      return (
                        <div
                          key={questionIndex}
                          className="bg-white border border-gray-200 rounded-lg shadow-sm"
                        >
                          <button
                            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                            onClick={() => toggleItem(globalIndex)}
                          >
                            <h3 className="text-lg font-semibold text-gray-900 pr-4">
                              {faq.question}
                            </h3>
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-4">
                              <p className="text-gray-700 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿No encontraste tu respuesta?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestro equipo está aquí para ayudarte. Contáctanos por el medio que prefieras.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat en Vivo</h3>
              <p className="text-gray-600 mb-4">
                Respuesta inmediata durante horario de oficina
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Iniciar Chat
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">WhatsApp</h3>
              <p className="text-gray-600 mb-4">
                +58 (414) 555-0123
              </p>
              <a
                href="https://wa.me/584145550123"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
              >
                Escribir por WhatsApp
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 mb-4">
                soporte@mediconnect.com.ve
              </p>
              <a
                href="mailto:soporte@mediconnect.com.ve"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-block"
              >
                Enviar Email
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}