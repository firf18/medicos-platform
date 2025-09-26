'use client'

import { useState, useEffect } from 'react'
import { useSpecialtyData } from '@/hooks/useSpecialtyData'
import { 
  Calendar, 
  Users, 
  FileText, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Heart,
  Brain,
  Baby,
  Stethoscope,
  Scissors,
  Eye,
  Shield,
  Zap,
  Bone,
  Sparkles
} from 'lucide-react'

interface BaseSpecialtyDashboardProps {
  specialtyId: string
  specialtyName: string
  specialtyIcon: string
  specialtyColor: string
  children?: React.ReactNode
}

// Interfaces movidas al hook useSpecialtyData

const iconMap: Record<string, any> = {
  Heart,
  Brain,
  Baby,
  Stethoscope,
  Scissors,
  Eye,
  Shield,
  Zap,
  Activity,
  Bone,
  Sparkles
}

export default function BaseSpecialtyDashboard({ 
  specialtyId, 
  specialtyName, 
  specialtyIcon, 
  specialtyColor,
  children 
}: BaseSpecialtyDashboardProps) {
  const {
    user,
    stats,
    recentPatients,
    todayAppointments,
    loading,
    error,
    refreshData
  } = useSpecialtyData({ specialtyId, useMockData: true })
  
  const IconComponent = iconMap[specialtyIcon] || Stethoscope

  // Función para refrescar datos manualmente
  const handleRefresh = () => {
    refreshData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de {specialtyName}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button 
            onClick={handleRefresh}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg bg-${specialtyColor}-100`}>
                <IconComponent className={`h-8 w-8 text-${specialtyColor}-600`} />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{specialtyName}</h1>
                <p className="text-gray-600">Dashboard Especializado</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Actualizar datos"
              >
                <Activity className="h-5 w-5" />
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Bienvenido, Dr. {user?.user_metadata?.first_name}</p>
                <p className="text-xs text-gray-400">{new Date().toLocaleDateString('es-ES')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resultados Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingResults}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alertas Críticas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.criticalAlerts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Patients */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Pacientes Recientes</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                          <p className="text-sm text-gray-500">{patient.age} años</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Última visita</p>
                        <p className="text-sm font-medium text-gray-900">
                          {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('es-ES') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Citas de Hoy</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{appointment.patientName}</p>
                        <p className="text-sm text-gray-500">{appointment.time}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.status === 'completed' ? 'Completada' :
                         appointment.status === 'cancelled' ? 'Cancelada' : 'Programada'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specialty-specific content */}
        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
