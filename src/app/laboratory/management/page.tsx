'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth';
import { 
  TestTube, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload,
  Search,
  BarChart3,
  FlaskConical,
  Microscope,
  FileText,
  Send
} from 'lucide-react';

interface LabStats {
  totalTests: number;
  pendingResults: number;
  completedToday: number;
  urgentTests: number;
  averageProcessingTime: number;
  monthlyRevenue: number;
}

interface LabTest {
  id: string;
  patient_name: string;
  doctor_name: string;
  test_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'received' | 'processing' | 'completed' | 'sent';
  created_at: string;
  expected_completion: string;
  notes?: string;
}

interface TestType {
  id: string;
  name: string;
  category: string;
  processing_time: number;
  price: number;
  tests_count: number;
}

export default function LaboratoryManagementPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<LabStats>({
    totalTests: 0,
    pendingResults: 0,
    completedToday: 0,
    urgentTests: 0,
    averageProcessingTime: 0,
    monthlyRevenue: 0
  });
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'results' | 'analytics'>('overview');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  

  useEffect(() => {
    if (user) {
      fetchLaboratoryData();
    }
  }, [user]);

  const fetchLaboratoryData = async () => {
    try {
      setLoading(true);

      // Simular datos de laboratorio
      const mockTests: LabTest[] = [
        {
          id: '1',
          patient_name: 'María García',
          doctor_name: 'Dr. López',
          test_type: 'Hemograma completo',
          priority: 'medium',
          status: 'processing',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          expected_completion: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
          notes: 'Paciente en ayunas'
        },
        {
          id: '2',
          patient_name: 'Juan Pérez',
          doctor_name: 'Dr. Martínez',
          test_type: 'Perfil lipídico',
          priority: 'high',
          status: 'completed',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          expected_completion: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString()
        },
        {
          id: '3',
          patient_name: 'Ana Rodríguez',
          doctor_name: 'Dr. Silva',
          test_type: 'Glucosa en sangre',
          priority: 'urgent',
          status: 'received',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          expected_completion: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
          notes: 'Urgente - paciente diabético'
        },
        {
          id: '4',
          patient_name: 'Carlos Mendoza',
          doctor_name: 'Dr. García',
          test_type: 'Función renal',
          priority: 'medium',
          status: 'sent',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          expected_completion: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          id: '5',
          patient_name: 'Laura González',
          doctor_name: 'Dr. Torres',
          test_type: 'Cultivo de orina',
          priority: 'low',
          status: 'processing',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          expected_completion: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString()
        }
      ];

      const mockTestTypes: TestType[] = [
        { id: '1', name: 'Hemograma completo', category: 'Hematología', processing_time: 24, price: 85, tests_count: 156 },
        { id: '2', name: 'Perfil lipídico', category: 'Bioquímica', processing_time: 4, price: 65, tests_count: 89 },
        { id: '3', name: 'Glucosa en sangre', category: 'Bioquímica', processing_time: 2, price: 25, tests_count: 234 },
        { id: '4', name: 'Función renal', category: 'Bioquímica', processing_time: 6, price: 95, tests_count: 67 },
        { id: '5', name: 'Cultivo de orina', category: 'Microbiología', processing_time: 48, price: 120, tests_count: 45 },
        { id: '6', name: 'TSH', category: 'Endocrinología', processing_time: 8, price: 75, tests_count: 123 }
      ];

      setLabTests(mockTests);
      setTestTypes(mockTestTypes);

      // Calcular estadísticas
      const totalTests = mockTests.length;
      const pendingResults = mockTests.filter(t => t.status === 'processing' || t.status === 'received').length;
      const completedToday = mockTests.filter(t => 
        t.status === 'completed' && 
        new Date(t.created_at).toDateString() === new Date().toDateString()
      ).length;
      const urgentTests = mockTests.filter(t => t.priority === 'urgent').length;

      setStats({
        totalTests: totalTests * 50, // Simular más tests
        pendingResults,
        completedToday,
        urgentTests,
        averageProcessingTime: 18, // horas
        monthlyRevenue: 285000 // Simulado
      });

    } catch (error) {
      console.error('Error fetching laboratory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-purple-100 text-purple-800';
      case 'received': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <TestTube className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'received': return <Upload className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'processing': return 'Procesando';
      case 'sent': return 'Enviado';
      case 'received': return 'Recibido';
      default: return status;
    }
  };

  const filteredTests = labTests.filter(test => {
    if (statusFilter !== 'all' && test.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && test.priority !== priorityFilter) return false;
    if (searchTerm && !test.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !test.test_type.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white shadow rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <TestTube className="h-8 w-8 mr-3 text-blue-600" />
              Panel de Gestión de Laboratorio
            </h1>
            <p className="mt-1 text-gray-600">
              Gestiona análisis clínicos, resultados y reportes del laboratorio
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.averageProcessingTime}h</div>
              <div className="text-gray-500">Tiempo promedio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'tests', label: 'Análisis', icon: TestTube },
              { id: 'results', label: 'Resultados', icon: FileText },
              { id: 'analytics', label: 'Estadísticas', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TestTube className="h-8 w-8" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-blue-100">
                          Total Análisis
                        </dt>
                        <dd className="text-2xl font-bold">
                          {stats.totalTests.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-8 w-8" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-yellow-100">
                          Pendientes
                        </dt>
                        <dd className="text-2xl font-bold">
                          {stats.pendingResults}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-green-100">
                          Completados Hoy
                        </dt>
                        <dd className="text-2xl font-bold">
                          {stats.completedToday}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-red-100">
                          Urgentes
                        </dt>
                        <dd className="text-2xl font-bold">
                          {stats.urgentTests}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tipos de Test Más Solicitados */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FlaskConical className="h-5 w-5 mr-2" />
                    Análisis Más Solicitados
                  </h3>
                  <div className="space-y-3">
                    {testTypes.slice(0, 5).map((testType) => (
                      <div key={testType.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{testType.name}</p>
                          <p className="text-xs text-gray-500">{testType.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-blue-600">{testType.tests_count}</p>
                          <p className="text-xs text-gray-500">${testType.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Microscope className="h-5 w-5 mr-2" />
                    Actividad Reciente
                  </h3>
                  <div className="space-y-3">
                    {labTests.slice(0, 5).map((test) => (
                      <div key={test.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`flex-shrink-0 ${getStatusColor(test.status).split(' ')[0]} p-1 rounded`}>
                            {getStatusIcon(test.status)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{test.test_type}</p>
                            <p className="text-xs text-gray-500">{test.patient_name}</p>
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(test.priority)}`}>
                          {getPriorityText(test.priority)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Tests */}
          {activeTab === 'tests' && (
            <div className="space-y-6">
              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar paciente o análisis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="received">Recibidos</option>
                  <option value="processing">Procesando</option>
                  <option value="completed">Completados</option>
                  <option value="sent">Enviados</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas las prioridades</option>
                  <option value="urgent">Urgente</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>

                <div className="text-sm text-gray-600">
                  {filteredTests.length} de {labTests.length} análisis
                </div>
              </div>

              {/* Lista de Tests */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paciente / Análisis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Médico
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prioridad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tiempo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTests.map((test) => (
                        <tr key={test.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{test.patient_name}</div>
                              <div className="text-sm text-gray-600">{test.test_type}</div>
                              {test.notes && <div className="text-xs text-gray-500 mt-1">{test.notes}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {test.doctor_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(test.priority)}`}>
                              {getPriorityText(test.priority)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(test.status)}`}>
                              {getStatusIcon(test.status)}
                              <span className="ml-1">{getStatusText(test.status)}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div>Recibido: {new Date(test.created_at).toLocaleDateString()}</div>
                            <div className="text-xs">Esperado: {new Date(test.expected_completion).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">Ver</button>
                            <button className="text-green-600 hover:text-green-900">Procesar</button>
                            {test.status === 'completed' && (
                              <button className="text-purple-600 hover:text-purple-900">Enviar</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Results - Placeholder */}
          {activeTab === 'results' && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Gestión de Resultados</h3>
              <p className="mt-1 text-sm text-gray-500">
                Próximamente: Carga y envío de resultados
              </p>
            </div>
          )}

          {/* Tab: Analytics - Placeholder */}
          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Estadísticas y Reportes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Próximamente: Análisis de productividad y reportes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
