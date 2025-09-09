import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Términos y Condiciones</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Última actualización: {new Date().toLocaleDateString('es-VE')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceptación de Términos</h2>
              <p className="text-gray-700 mb-4">
                Al acceder y utilizar MediConnect, usted acepta estar sujeto a estos términos y condiciones. 
                Si no está de acuerdo con alguna parte de estos términos, no debe usar nuestros servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descripción del Servicio</h2>
              <p className="text-gray-700 mb-4">
                MediConnect es una plataforma digital que facilita:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Conexión entre pacientes y profesionales médicos</li>
                <li>Gestión de citas médicas</li>
                <li>Almacenamiento seguro de historiales médicos</li>
                <li>Teleconsultas médicas</li>
                <li>Procesamiento de pagos médicos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Registro y Cuentas</h2>
              <p className="text-gray-700 mb-4">
                Para usar nuestros servicios, debe:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Proporcionar información precisa y completa</li>
                <li>Mantener la confidencialidad de su cuenta</li>
                <li>Notificar inmediatamente cualquier uso no autorizado</li>
                <li>Ser mayor de 18 años o tener autorización parental</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Responsabilidades del Usuario</h2>
              <p className="text-gray-700 mb-4">
                Los usuarios se comprometen a:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Usar la plataforma de manera responsable y legal</li>
                <li>No compartir información médica de terceros sin autorización</li>
                <li>Respetar los derechos de propiedad intelectual</li>
                <li>No interferir con el funcionamiento de la plataforma</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Servicios Médicos</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800">
                  <strong>Importante:</strong> MediConnect es una plataforma tecnológica. Los servicios médicos 
                  son proporcionados por profesionales independientes registrados en nuestra plataforma.
                </p>
              </div>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>No somos responsables por diagnósticos o tratamientos médicos</li>
                <li>Los médicos son profesionales independientes</li>
                <li>En emergencias, contacte servicios de emergencia locales</li>
                <li>Mantenga siempre comunicación con su médico de cabecera</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Pagos y Facturación</h2>
              <p className="text-gray-700 mb-4">
                Términos de pago:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Los pagos se procesan de forma segura</li>
                <li>Las tarifas son establecidas por cada médico</li>
                <li>Las cancelaciones deben hacerse con 24 horas de anticipación</li>
                <li>Los reembolsos se procesan según nuestra política</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitación de Responsabilidad</h2>
              <p className="text-gray-700 mb-4">
                MediConnect no será responsable por:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Decisiones médicas tomadas por profesionales</li>
                <li>Interrupciones del servicio por mantenimiento</li>
                <li>Pérdida de datos por causas externas</li>
                <li>Daños indirectos o consecuenciales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contacto</h2>
              <p className="text-gray-700">
                Para consultas sobre estos términos:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@mediconnect.com.ve<br/>
                  <strong>Teléfono:</strong> +58 (414) 555-0123<br/>
                  <strong>Dirección:</strong> Av. Francisco de Miranda, Caracas 1060, Venezuela
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