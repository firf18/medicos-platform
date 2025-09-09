'use client';

import { ReactNode, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { DashboardSection } from './PatientDashboardContent';
import { 
  HomeIcon, 
  CalendarIcon, 
  DocumentTextIcon, 
  BeakerIcon,
  UserGroupIcon,
  ChartBarIcon,
  FolderIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { EmergencyButton } from './components/EmergencyButton';
import { NotificationBadge } from './components/NotificationBadge';

interface PatientDashboardLayoutProps {
  user: User;
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  children: ReactNode;
}

const navigationItems = [
  { id: 'overview', label: 'Resumen', icon: HomeIcon },
  { id: 'appointments', label: 'Citas', icon: CalendarIcon },
  { id: 'history', label: 'Historial Médico', icon: DocumentTextIcon },
  { id: 'medications', label: 'Medicamentos', icon: BeakerIcon },
  { id: 'lab-results', label: 'Resultados', icon: ChartBarIcon },
  { id: 'medical-team', label: 'Mi Equipo Médico', icon: UserGroupIcon },
  { id: 'health-metrics', label: 'Métricas de Salud', icon: HeartIcon },
  { id: 'documents', label: 'Documentos', icon: FolderIcon },
  { id: 'caregivers', label: 'Confidentes', icon: UserGroupIcon },
  { id: 'emergency', label: 'Emergencias', icon: ExclamationTriangleIcon },
  { id: 'health-plans', label: 'Planes de Salud', icon: ClipboardDocumentListIcon },
  { id: 'second-opinion', label: 'Segunda Opinión', icon: ChatBubbleLeftRightIcon },
  { id: 'notifications', label: 'Notificaciones', icon: BellIcon },
  { id: 'settings', label: 'Configuración', icon: Cog6ToothIcon },
] as const;

export function PatientDashboardLayout({ 
  user, 
  activeSection, 
  onSectionChange, 
  children 
}: PatientDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.user_metadata?.full_name || 'Paciente'}
                </p>
                <p className="text-xs text-gray-500">Portal del Paciente</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Emergency Button */}
          <div className="p-4 border-b border-gray-200">
            <EmergencyButton userId={user.id} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id as DashboardSection);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === 'notifications' && (
                    <NotificationBadge userId={user.id} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                // Handle logout
                window.location.href = '/auth/login/pacientes';
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Portal del Paciente
            </h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}