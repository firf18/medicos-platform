'use client'

import { 
  Heart, 
  Brain, 
  Baby, 
  Scissors, 
  Layers, 
  AlertTriangle, 
  Zap,
  Code,
  Database,
  Settings,
  Users,
  BookOpen
} from 'lucide-react'

export default function SpecialtyDashboardsDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dashboards por Especialidad Médica
          </h1>
          <p className="text-xl text-gray-600">
            Sistema completo de dashboards especializados para cada área médica
          </p>
        </div>

        {/* Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-center mb-6">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Descripción General</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            Este sistema proporciona dashboards especializados y únicos para cada especialidad médica, 
            diseñados específicamente para las necesidades de cada área de práctica. Cada dashboard 
            incluye métricas, herramientas y visualizaciones relevantes para la especialidad correspondiente.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Los dashboards están integrados con Supabase para datos en tiempo real y pueden funcionar 
            tanto con datos simulados (para demostración) como con datos reales de producción.
          </p>
        </div>

        {/* Available Specialties */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-center mb-6">
            <Users className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Especialidades Disponibles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 'cardiology', name: 'Cardiología', icon: Heart, color: 'red' },
              { id: 'neurology', name: 'Neurología', icon: Brain, color: 'purple' },
              { id: 'pediatrics', name: 'Pediatría', icon: Baby, color: 'pink' },
              { id: 'general_surgery', name: 'Cirugía General', icon: Scissors, color: 'orange' },
              { id: 'dermatology', name: 'Dermatología', icon: Layers, color: 'yellow' },
              { id: 'emergency_medicine', name: 'Medicina de Emergencia', icon: AlertTriangle, color: 'red' },
              { id: 'endocrinology', name: 'Endocrinología', icon: Zap, color: 'yellow' }
            ].map((specialty) => (
              <div key={specialty.id} className={`p-4 border rounded-lg border-l-4 border-${specialty.color}-500`}>
                <div className="flex items-center">
                  <specialty.icon className={`h-6 w-6 text-${specialty.color}-600 mr-3`} />
                  <span className="font-medium text-gray-900">{specialty.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features by Specialty */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-center mb-6">
            <Settings className="h-8 w-8 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Características por Especialidad</h2>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cardiología</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Monitoreo ECG en tiempo real</li>
                <li>• Seguimiento de procedimientos cardíacos</li>
                <li>• Gestión de medicamentos cardíacos</li>
                <li>• Evaluación de riesgo cardiovascular</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Neurología</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Evaluaciones neurológicas detalladas</li>
                <li>• Estudios de imagen cerebral</li>
                <li>• Monitoreo de convulsiones</li>
                <li>• Seguimiento de medicamentos neurológicos</li>
              </ul>
            </div>

            <div className="border-l-4 border-pink-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pediatría</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Seguimiento de crecimiento y desarrollo</li>
                <li>• Esquema de vacunación</li>
                <li>• Hitos del desarrollo</li>
                <li>• Condiciones pediátricas específicas</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cirugía General</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Estado de quirófanos en tiempo real</li>
                <li>• Programa quirúrgico</li>
                <li>• Monitoreo post-operatorio</li>
                <li>• Gestión de equipo quirúrgico</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dermatología</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Monitoreo de lesiones cutáneas</li>
                <li>• Procedimientos dermatológicos</li>
                <li>• Condiciones dermatológicas crónicas</li>
                <li>• Tratamientos estéticos</li>
              </ul>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Medicina de Emergencia</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Alertas críticas en tiempo real</li>
                <li>• Métricas del servicio de emergencia</li>
                <li>• Casos activos con triage</li>
                <li>• Monitoreo de casos de trauma</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Endocrinología</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Monitoreo de niveles hormonales</li>
                <li>• Manejo de diabetes</li>
                <li>• Condiciones tiroideas</li>
                <li>• Síndrome metabólico</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Implementation */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-center mb-6">
            <Code className="h-8 w-8 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Implementación Técnica</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Arquitectura</h3>
              <ul className="text-gray-700 space-y-1 ml-4">
                <li>• <strong>Framework:</strong> Next.js 14 con TypeScript</li>
                <li>• <strong>UI:</strong> Tailwind CSS + Lucide Icons</li>
                <li>• <strong>Base de datos:</strong> Supabase PostgreSQL</li>
                <li>• <strong>Autenticación:</strong> Supabase Auth</li>
                <li>• <strong>Estado:</strong> React Hooks personalizados</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Estructura de Archivos</h3>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                <div>src/components/specialty-dashboards/</div>
                <div>├── BaseSpecialtyDashboard.tsx</div>
                <div>├── SpecialtyDashboardRouter.tsx</div>
                <div>├── cardiology/CardiologyDashboard.tsx</div>
                <div>├── neurology/NeurologyDashboard.tsx</div>
                <div>├── pediatrics/PediatricsDashboard.tsx</div>
                <div>├── general-surgery/GeneralSurgeryDashboard.tsx</div>
                <div>└── ...</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hook de Datos</h3>
              <p className="text-gray-700 mb-2">
                El hook <code className="bg-gray-100 px-2 py-1 rounded">useSpecialtyData</code> gestiona:
              </p>
              <ul className="text-gray-700 space-y-1 ml-4">
                <li>• Carga de datos reales desde Supabase</li>
                <li>• Fallback a datos simulados para demostración</li>
                <li>• Estados de carga y error</li>
                <li>• Refrescado manual de datos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-center mb-6">
            <Database className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Instrucciones de Uso</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Acceso a Dashboards</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">URL Base:</p>
                <code className="bg-white p-2 rounded border block">/specialty-dashboards</code>
                <p className="text-gray-700 mt-2 mb-2">URL Específica por Especialidad:</p>
                <code className="bg-white p-2 rounded border block">/specialty-dashboards/[specialtyId]</code>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Autenticación</h3>
              <p className="text-gray-700">
                Los dashboards requieren autenticación. El sistema detecta automáticamente la 
                especialidad del doctor logueado y muestra el dashboard correspondiente.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Modo de Datos</h3>
              <p className="text-gray-700 mb-2">
                El sistema puede funcionar en dos modos:
              </p>
              <ul className="text-gray-700 space-y-1 ml-4">
                <li>• <strong>Datos Simulados:</strong> Para demostración y desarrollo</li>
                <li>• <strong>Datos Reales:</strong> Conectado a la base de datos de producción</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Actualización de Datos</h3>
              <p className="text-gray-700">
                Cada dashboard incluye un botón de actualización en el header para refrescar 
                los datos manualmente. Los datos se actualizan automáticamente al cargar el dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Próximos Pasos</h2>
          <ul className="text-blue-800 space-y-2">
            <li>• Configurar datos reales en producción</li>
            <li>• Agregar más especialidades según necesidades</li>
            <li>• Implementar notificaciones en tiempo real</li>
            <li>• Añadir funcionalidades de exportación de reportes</li>
            <li>• Integrar con sistemas de análisis avanzado</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
