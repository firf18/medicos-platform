import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Aviso Legal</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Última actualización: {new Date().toLocaleDateString('es-VE')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Información de la Empresa</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Razón Social:</strong> MediConnect Venezuela C.A.
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>RIF:</strong> J-12345678-9
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Dirección:</strong> Av. Francisco de Miranda, Centro Empresarial, Caracas 1060, Venezuela
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Teléfono:</strong> +58 (414) 555-0123
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> legal@mediconnect.com.ve
                </p>
                <p className="text-gray-700">
                  <strong>Sitio web:</strong> www.mediconnect.com.ve
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Objeto Social</h2>
              <p className="text-gray-700 mb-4">
                MediConnect Venezuela C.A. es una empresa tecnológica dedicada al desarrollo y operación 
                de plataformas digitales para el sector salud, facilitando la conexión entre pacientes 
                y profesionales médicos a través de servicios de telemedicina, gestión de citas médicas 
                y administración de historiales clínicos digitales.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Naturaleza de los Servicios</h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>Importante:</strong> MediConnect es una plataforma tecnológica intermediaria. 
                  No prestamos servicios médicos directos ni emitimos diagnósticos médicos.
                </p>
              </div>
              <p className="text-gray-700 mb-4">
                Nuestros servicios incluyen:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Plataforma digital para conexión entre pacientes y médicos</li>
                <li>Sistema de gestión de citas médicas</li>
                <li>Almacenamiento seguro de historiales médicos digitales</li>
                <li>Facilitación de teleconsultas médicas</li>
                <li>Procesamiento de pagos médicos</li>
                <li>Herramientas administrativas para profesionales de la salud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Responsabilidad Médica</h2>
              <p className="text-gray-700 mb-4">
                Los servicios médicos son proporcionados exclusivamente por profesionales de la salud 
                independientes registrados en nuestra plataforma. Cada médico es responsable de:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Su licencia médica y habilitación profesional</li>
                <li>Los diagnósticos y tratamientos que proporcione</li>
                <li>El cumplimiento de las normas éticas y legales de su profesión</li>
                <li>La calidad de la atención médica brindada</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Propiedad Intelectual</h2>
              <p className="text-gray-700 mb-4">
                Todos los derechos de propiedad intelectual sobre la plataforma MediConnect, 
                incluyendo pero no limitado a:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Código fuente y software</li>
                <li>Diseño de interfaz y experiencia de usuario</li>
                <li>Marca comercial y logotipos</li>
                <li>Contenido y documentación</li>
                <li>Metodologías y procesos</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Son propiedad exclusiva de MediConnect Venezuela C.A. y están protegidos por las 
                leyes de propiedad intelectual de Venezuela y tratados internacionales.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cumplimiento Regulatorio</h2>
              <p className="text-gray-700 mb-4">
                MediConnect cumple con la normativa venezolana aplicable, incluyendo:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Ley de Ejercicio de la Medicina</li>
                <li>Ley de Protección de Datos Personales</li>
                <li>Normativas del Colegio de Médicos de Venezuela</li>
                <li>Regulaciones de SUDEBAN para procesamiento de pagos</li>
                <li>Ley de Comercio Electrónico</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitaciones de Uso</h2>
              <p className="text-gray-700 mb-4">
                La plataforma no debe utilizarse para:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Emergencias médicas (contactar servicios de emergencia locales)</li>
                <li>Prescripción de sustancias controladas sin supervisión presencial</li>
                <li>Diagnósticos que requieran examen físico directo</li>
                <li>Tratamientos de salud mental en crisis</li>
                <li>Cualquier uso ilegal o no autorizado</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Jurisdicción y Ley Aplicable</h2>
              <p className="text-gray-700 mb-4">
                Este aviso legal se rige por las leyes de la República Bolivariana de Venezuela. 
                Cualquier controversia será sometida a la jurisdicción de los tribunales competentes 
                de Caracas, Venezuela.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Modificaciones</h2>
              <p className="text-gray-700 mb-4">
                MediConnect se reserva el derecho de modificar este aviso legal en cualquier momento. 
                Las modificaciones serán notificadas a los usuarios y publicadas en nuestro sitio web 
                con al menos 30 días de anticipación.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contacto Legal</h2>
              <p className="text-gray-700">
                Para consultas legales o regulatorias:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  <strong>Departamento Legal</strong><br/>
                  <strong>Email:</strong> legal@mediconnect.com.ve<br/>
                  <strong>Teléfono:</strong> +58 (414) 555-0123<br/>
                  <strong>Dirección:</strong> Av. Francisco de Miranda, Caracas 1060, Venezuela<br/>
                  <strong>Horario:</strong> Lunes a Viernes, 8:00 AM - 5:00 PM (VET)
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}