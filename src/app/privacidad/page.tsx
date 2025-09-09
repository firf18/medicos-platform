import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Última actualización: {new Date().toLocaleDateString('es-VE')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Información que Recopilamos</h2>
              <p className="text-gray-700 mb-4">
                En MediConnect, recopilamos información que usted nos proporciona directamente, como:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Información de registro (nombre, email, teléfono)</li>
                <li>Información médica (historial, alergias, medicamentos)</li>
                <li>Información de citas y consultas</li>
                <li>Información de pago y facturación</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Cómo Usamos su Información</h2>
              <p className="text-gray-700 mb-4">
                Utilizamos su información para:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Proporcionar servicios médicos y de salud</li>
                <li>Facilitar comunicación entre pacientes y médicos</li>
                <li>Procesar pagos y generar facturas</li>
                <li>Mejorar nuestros servicios</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Protección de Datos</h2>
              <p className="text-gray-700 mb-4">
                Implementamos medidas de seguridad técnicas y organizativas para proteger su información:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Encriptación de datos en tránsito y en reposo</li>
                <li>Acceso restringido basado en roles</li>
                <li>Auditorías de seguridad regulares</li>
                <li>Cumplimiento con estándares internacionales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Sus Derechos</h2>
              <p className="text-gray-700 mb-4">
                Usted tiene derecho a:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Acceder a su información personal</li>
                <li>Corregir datos inexactos</li>
                <li>Solicitar la eliminación de sus datos</li>
                <li>Portabilidad de datos</li>
                <li>Retirar su consentimiento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contacto</h2>
              <p className="text-gray-700">
                Para ejercer sus derechos o hacer consultas sobre esta política, contáctenos en:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacidad@mediconnect.com.ve<br/>
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