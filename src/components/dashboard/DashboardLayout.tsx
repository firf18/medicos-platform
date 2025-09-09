'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Search,
  Bell
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PatientsSection from './sections/PatientsSection'

const navigation = [
  { name: 'Pacientes', href: 'patients', icon: Users, current: true },
  { name: 'Citas', href: 'appointments', icon: Calendar, current: false },
  { name: 'Expedientes', href: 'records', icon: FileText, current: false },
  { name: 'Configuración', href: 'settings', icon: Settings, current: false },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('patients')
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'patients':
        return <PatientsSection />
      case 'appointments':
        return <div className="p-6">Sección de Citas - En desarrollo</div>
      case 'records':
        return <div className="p-6">Sección de Expedientes - En desarrollo</div>
      case 'settings':
        return <div className="p-6">Configuración - En desarrollo</div>
      default:
        return <PatientsSection />
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar móvil */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent 
            navigation={navigation} 
            activeSection={activeSection} 
            setActiveSection={setActiveSection}
            handleSignOut={handleSignOut}
          />
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent 
            navigation={navigation} 
            activeSection={activeSection} 
            setActiveSection={setActiveSection}
            handleSignOut={handleSignOut}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent"
                    placeholder="Buscar pacientes..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button
                type="button"
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Bell className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ 
  navigation, 
  activeSection, 
  setActiveSection, 
  handleSignOut 
}: {
  navigation: any[]
  activeSection: string
  setActiveSection: (section: string) => void
  handleSignOut: () => void
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900">MediConsult</h1>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveSection(item.href)}
              className={`${
                activeSection === item.href
                  ? 'bg-indigo-100 text-indigo-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`}
            >
              <item.icon
                className={`${
                  activeSection === item.href ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                } mr-3 flex-shrink-0 h-6 w-6`}
              />
              {item.name}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <button
          onClick={handleSignOut}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 w-full"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}