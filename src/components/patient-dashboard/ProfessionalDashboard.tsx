'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { 
  ChartBarIcon, 
  HeartIcon, 
  CalendarIcon, 
  BellIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  BeakerIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CloudIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon,
  ChartBarIcon as ChartBarSolidIcon,
  BellIcon as BellSolidIcon,
  ChatBubbleLeftRightIcon as ChatSolidIcon
} from '@heroicons/react/24/solid';

// Importar componentes especializados
import { HealthMetricsDashboard } from './components/HealthMetricsDashboard';
import { RealTimeNotifications } from './components/RealTimeNotifications';
import { MedicalChatWidget } from './components/MedicalChatWidget';
import { TelemedicinePanel } from './components/TelemedicinePanel';
import { SmartReminders } from './components/SmartReminders';
import { AdvancedAnalytics } from './components/AdvancedAnalytics';
import { EmergencyQuickAccess } from './components/EmergencyQuickAccess';
import { HealthInsights } from './components/HealthInsights';
import { AppointmentScheduler } from './components/AppointmentScheduler';
import { MedicationTracker } from './components/MedicationTracker';
import { DocumentManager } from './components/DocumentManager';
import { CareTeamPanel } from './components/CareTeamPanel';

interface ProfessionalDashboardProps {
  user: User;
}

interface DashboardWidget {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number };
  isVisible: boolean;
  isMinimized: boolean;
}

interface HealthAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  actionRequired: boolean;
}

interface QuickStats {
  vitalSigns: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenSaturation: number;
  };
  medications: {
    active: number;
    due: number;
    missed: number;
  };
  appointments: {
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  healthScore: number;
}

export function ProfessionalDashboard({ user }: ProfessionalDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'appointments' | 'medications' | 'team' | 'analytics'>('overview');
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const supabase = createClientComponentClient();

  // Configuración inicial de widgets
  useEffect(() => {
    const initialWidgets: DashboardWidget[] = [
      {
        id: 'health-metrics',
        title: 'Métricas de Salud',
        component: HealthMetricsDashboard,
        size: 'large',
        position: { x: 0, y: 0 },
        isVisible: true,
        isMinimized: false
      },
      {
        id: 'notifications',
        title: 'Notificaciones',
        component: RealTimeNotifications,
        size: 'medium',
        position: { x: 1, y: 0 },
        isVisible: true,
        isMinimized: false
      },
      {
        id: 'medical-chat',
        title: 'Chat Médico',
        component: MedicalChatWidget,
        size: 'medium',
        position: { x: 0, y: 1 },
        isVisible: true,
        isMinimized: false
      },
      {
        id: 'telemedicine',
        title: 'Telemedicina',
        component: TelemedicinePanel,
        size: 'large',
        position: { x: 1, y: 1 },
        isVisible: true,
        isMinimized: false
      },
      {
        id: 'analytics',
        title: 'Analytics Avanzados',
        component: AdvancedAnalytics,
        size: 'full',
        position: { x: 0, y: 2 },
        isVisible: true,
        isMinimized: false
      },
      {
        id: 'emergency',
        title: 'Acceso de Emergencia',
        component: EmergencyQuickAccess,
        size: 'small',
        position: { x: 2, y: 0 },
        isVisible: true,
        isMinimized: false
      },
      {
        id: 'insights',
        title: 'Insights de Salud',
        component: HealthInsights,
        size: 'medium',
        position: { x: 2, y: 1 },
        isVisible: true,
        isMinimized: false
      },
      {
        id: 'appointments',
        title: 'Gestión de Citas',
        component: AppointmentScheduler,
        size: 'large',
        position: { x: 0, y: 3 },
        isVisible: true,
        isMinimized: false
      },
      {
        id: 'medications',
        title: 'Seguimiento de Medicamentos',
        component: MedicationTracker,
        size: 'large',
        position: { x: 1, y: 3 },
        isVisible: true,
        isMinimized: false
      },
      {
        id: 'documents',
        title: 'Gestor de Documentos',
        component: DocumentManager,
        size: 'medium',
        position: { x: 2, y: 3 },
        isVisible: true,
        isMinimized: false
      },
      {
        id: 'care-team',
        title: 'Equipo de Cuidado',
        component: CareTeamPanel,
        size: 'medium',
        position: { x: 3, y: 3 },
        isVisible: true,
        isMinimized: false
      },
      {
        id: 'reminders',
        title: 'Recordatorios Inteligentes',
        component: SmartReminders,
        size: 'small',
        position: { x: 3, y: 0 },
        isVisible: true,
        isMinimized: false
      }
    ];
    
    setWidgets(initialWidgets);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Cargar estadísticas rápidas
        const [vitalsResult, medicationsResult, appointmentsResult] = await Promise.all([
          supabase
            .from('health_metrics')
            .select('*')
            .eq('patient_id', user.id)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .single(),
          
          supabase
            .from('patient_medications')
            .select('*')
            .eq('patient_id', user.id)
            .eq('is_active', true),
          
          supabase
            .from('appointments')
            .select('*')
            .eq('patient_id', user.id)
            .gte('scheduled_at', new Date().toISOString())
        ]);

        // Procesar estadísticas
        const vitals = vitalsResult.data;
        const medications = medicationsResult.data || [];
        const appointments = appointmentsResult.data || [];

        setQuickStats({
          vitalSigns: {
            heartRate: vitals?.heart_rate || 0,
            bloodPressure: vitals?.blood_pressure || '0/0',
            temperature: vitals?.temperature || 0,
            oxygenSaturation: vitals?.oxygen_saturation || 0
          },
          medications: {
            active: medications.length,
            due: medications.filter(m => new Date(m.next_dose) <= new Date()).length,
            missed: medications.filter(m => m.missed_doses > 0).length
          },
          appointments: {
            upcoming: appointments.length,
            completed: 0, // Calcular desde historial
            cancelled: 0 // Calcular desde historial
          },
          healthScore: calculateHealthScore(vitals, medications, appointments)
        });

        // Cargar alertas de salud
        const { data: alerts } = await supabase
          .from('health_alerts')
          .select('*')
          .eq('patient_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (alerts) {
          setHealthAlerts(alerts.map(alert => ({
            id: alert.id,
            type: alert.severity as 'critical' | 'warning' | 'info',
            title: alert.title,
            message: alert.message,
            timestamp: alert.created_at,
            actionRequired: alert.action_required
          })));
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user.id, supabase]);

  // Suscripción a datos en tiempo real
  useEffect(() => {
    const subscribeToRealtimeData = () => {
      // Suscribirse a cambios en métricas de salud
      const healthMetricsSubscription = supabase
        .channel('health-metrics-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'health_metrics',
          filter: `patient_id=eq.${user.id}`
        }, (payload) => {
          console.log('Health metrics updated:', payload);
          setRealTimeData(prev => ({
            ...prev,
            healthMetrics: payload.new
          }));
        })
        .subscribe();

      // Suscribirse a notificaciones
      const notificationsSubscription = supabase
        .channel('notifications-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'patient_notifications',
          filter: `patient_id=eq.${user.id}`
        }, (payload) => {
          console.log('New notification:', payload);
          setRealTimeData(prev => ({
            ...prev,
            notifications: payload.new
          }));
        })
        .subscribe();

      return () => {
        healthMetricsSubscription.unsubscribe();
        notificationsSubscription.unsubscribe();
      };
    };

    const unsubscribe = subscribeToRealtimeData();
    return unsubscribe;
  }, [user.id, supabase]);

  const calculateHealthScore = (vitals: any, medications: any[], appointments: any[]) => {
    let score = 100;
    
    // Penalizar por medicamentos perdidos
    score -= medications.filter(m => m.missed_doses > 0).length * 5;
    
    // Penalizar por citas canceladas
    score -= appointments.filter(a => a.status === 'cancelled').length * 3;
    
    // Verificar signos vitales anormales
    if (vitals) {
      if (vitals.heart_rate < 60 || vitals.heart_rate > 100) score -= 10;
      if (vitals.temperature > 37.5) score -= 15;
      if (vitals.oxygen_saturation < 95) score -= 20;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const toggleWidget = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, isMinimized: !widget.isMinimized }
        : widget
    ));
  };

  const hideWidget = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, isVisible: false }
        : widget
    ));
  };

  const getWidgetSizeClasses = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1 row-span-1';
      case 'medium': return 'col-span-2 row-span-1';
      case 'large': return 'col-span-3 row-span-2';
      case 'full': return 'col-span-4 row-span-2';
      default: return 'col-span-2 row-span-1';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: ChartBarIcon },
    { id: 'health', label: 'Salud', icon: HeartIcon },
    { id: 'appointments', label: 'Citas', icon: CalendarIcon },
    { id: 'medications', label: 'Medicamentos', icon: BeakerIcon },
    { id: 'team', label: 'Equipo', icon: UserGroupIcon },
    { id: 'analytics', label: 'Analytics', icon: ArrowTrendingUpIcon }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Cargando Dashboard Profesional...</h2>
          <p className="text-gray-500 mt-2">Preparando tu experiencia de salud personalizada</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'}`}>
      {/* Header Superior */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-md border-gray-200'} border-b sticky top-0 z-50`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo y título */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <HeartSolidIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Portal de Salud Profesional
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Bienvenido, {user.user_metadata?.full_name || 'Paciente'}
                  </p>
                </div>
              </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en tu historial médico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>

            {/* Controles del header */}
            <div className="flex items-center space-x-4">
              {/* Indicador de salud */}
              {quickStats && (
                <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${quickStats.healthScore >= 80 ? 'bg-green-500' : quickStats.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Salud: {quickStats.healthScore}%
                    </span>
                  </div>
                </div>
              )}

              {/* Botón de filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'} transition-colors`}
              >
                <FunnelIcon className="w-5 h-5 text-gray-600" />
              </button>

              {/* Botón de modo oscuro */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'} transition-colors`}
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
              </button>

              {/* Botón de colapsar sidebar */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'} transition-colors`}
              >
                <ArrowPathIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Pestañas de navegación */}
        <div className={`px-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 transition-colors ${
                    isActive
                      ? `${darkMode ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600'}`
                      : `${darkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700'}`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Alertas críticas */}
      {healthAlerts.filter(alert => alert.type === 'critical').length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
          <div className="flex">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Alerta Crítica:</strong> Tienes {healthAlerts.filter(alert => alert.type === 'critical').length} alertas que requieren atención inmediata.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <main className="p-6">
        {/* Grid de widgets */}
        <div className="grid grid-cols-4 gap-6 auto-rows-min">
          {widgets
            .filter(widget => widget.isVisible)
            .map((widget) => {
              const WidgetComponent = widget.component;
              return (
                <div
                  key={widget.id}
                  className={`${getWidgetSizeClasses(widget.size)} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm hover:shadow-md transition-all duration-200`}
                >
                  {/* Header del widget */}
                  <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {widget.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleWidget(widget.id)}
                        className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                      >
                        <ArrowPathIcon className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </button>
                      <button
                        onClick={() => hideWidget(widget.id)}
                        className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                      >
                        <EyeIcon className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Contenido del widget */}
                  <div className="p-4">
                    {!widget.isMinimized && (
                      <WidgetComponent 
                        userId={user.id} 
                        darkMode={darkMode}
                        realTimeData={realTimeData}
                      />
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className={`fixed top-20 right-6 w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-lg p-6 z-40`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Filtros Avanzados
            </h3>
            {/* Implementar filtros avanzados aquí */}
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tipo de Widget
                </label>
                <select className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                  <option>Todos</option>
                  <option>Salud</option>
                  <option>Medicamentos</option>
                  <option>Citas</option>
                  <option>Analytics</option>
                </select>
              </div>
              {/* Más filtros... */}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
