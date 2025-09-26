'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import BaseSpecialtyDashboard from '../BaseSpecialtyDashboard'
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  FileText,
  BarChart3,
  Calendar,
  Users,
  Zap
} from 'lucide-react'

interface ECGReading {
  id: string
  patientId: string
  patientName: string
  date: string
  rhythm: 'normal' | 'atrial_fibrillation' | 'bradycardia' | 'tachycardia'
  heartRate: number
  prInterval: number
  qrsDuration: number
  qtInterval: number
  interpretation: string
  isAbnormal: boolean
}

interface CardiacProcedure {
  id: string
  patientId: string
  patientName: string
  procedureType: 'echocardiogram' | 'stress_test' | 'catheterization' | 'pacemaker'
  scheduledDate: string
  status: 'scheduled' | 'completed' | 'cancelled'
  results?: string
}

interface CardiacMedication {
  id: string
  patientId: string
  patientName: string
  medication: string
  dosage: string
  frequency: string
  startDate: string
  effectiveness: 'excellent' | 'good' | 'fair' | 'poor'
}

export default function CardiologyDashboard() {
  const [ecgReadings, setEcgReadings] = useState<ECGReading[]>([])
  const [cardiacProcedures, setCardiacProcedures] = useState<CardiacProcedure[]>([])
  const [cardiacMedications, setCardiacMedications] = useState<CardiacMedication[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    loadCardiologyData()
  }, [])

  const loadCardiologyData = async () => {
    try {
      setLoading(true)
      
      // Simular datos específicos de cardiología
      // En producción, estos vendrían de tablas específicas de cardiología
      const mockECGReadings: ECGReading[] = [
        {
          id: '1',
          patientId: 'p1',
          patientName: 'María González',
          date: '2024-01-15',
          rhythm: 'normal',
          heartRate: 72,
          prInterval: 160,
          qrsDuration: 90,
          qtInterval: 400,
          interpretation: 'Ritmo sinusal normal',
          isAbnormal: false
        },
        {
          id: '2',
          patientId: 'p2',
          patientName: 'Carlos Rodríguez',
          date: '2024-01-14',
          rhythm: 'atrial_fibrillation',
          heartRate: 95,
          prInterval: 0,
          qrsDuration: 85,
          qtInterval: 380,
          interpretation: 'Fibrilación auricular',
          isAbnormal: true
        }
      ]

      const mockProcedures: CardiacProcedure[] = [
        {
          id: '1',
          patientId: 'p1',
          patientName: 'María González',
          procedureType: 'echocardiogram',
          scheduledDate: '2024-01-20',
          status: 'scheduled'
        },
        {
          id: '2',
          patientId: 'p2',
          patientName: 'Carlos Rodríguez',
          procedureType: 'catheterization',
          scheduledDate: '2024-01-18',
          status: 'completed',
          results: 'Estenosis coronaria moderada en arteria descendente anterior'
        }
      ]

      const mockMedications: CardiacMedication[] = [
        {
          id: '1',
          patientId: 'p1',
          patientName: 'María González',
          medication: 'Metoprolol',
          dosage: '50mg',
          frequency: '2x día',
          startDate: '2024-01-01',
          effectiveness: 'excellent'
        },
        {
          id: '2',
          patientId: 'p2',
          patientName: 'Carlos Rodríguez',
          medication: 'Warfarina',
          dosage: '5mg',
          frequency: '1x día',
          startDate: '2024-01-10',
          effectiveness: 'good'
        }
      ]

      setEcgReadings(mockECGReadings)
      setCardiacProcedures(mockProcedures)
      setCardiacMedications(mockMedications)

    } catch (error) {
      console.error('Error loading cardiology data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRhythmColor = (rhythm: string) => {
    switch (rhythm) {
      case 'normal': return 'text-green-600 bg-green-100'
      case 'atrial_fibrillation': return 'text-red-600 bg-red-100'
      case 'bradycardia': return 'text-yellow-600 bg-yellow-100'
      case 'tachycardia': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <BaseSpecialtyDashboard
      specialtyId="cardiology"
      specialtyName="Cardiología"
      specialtyIcon="Heart"
      specialtyColor="red"
    >
      <div className="space-y-8">
        {/* ECG Monitoring Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Monitoreo ECG</h3>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Monitoreo Activo</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ECG Readings */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Lecturas ECG Recientes</h4>
                <div className="space-y-3">
                  {ecgReadings.map((reading) => (
                    <div key={reading.id} className={`p-4 rounded-lg border-l-4 ${
                      reading.isAbnormal ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{reading.patientName}</p>
                          <p className="text-sm text-gray-600">{reading.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{reading.heartRate} bpm</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRhythmColor(reading.rhythm)}`}>
                            {reading.rhythm.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>{reading.interpretation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ECG Parameters */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Parámetros ECG</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">PR Interval</p>
                    <p className="text-lg font-bold text-gray-900">160ms</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">QRS Duration</p>
                    <p className="text-lg font-bold text-gray-900">90ms</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">QT Interval</p>
                    <p className="text-lg font-bold text-gray-900">400ms</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Heart Rate</p>
                    <p className="text-lg font-bold text-gray-900">72 bpm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cardiac Procedures */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Procedimientos Cardíacos</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Procedimiento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resultados
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cardiacProcedures.map((procedure) => (
                    <tr key={procedure.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {procedure.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {procedure.procedureType.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(procedure.scheduledDate).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          procedure.status === 'completed' ? 'bg-green-100 text-green-800' :
                          procedure.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {procedure.status === 'completed' ? 'Completado' :
                           procedure.status === 'cancelled' ? 'Cancelado' : 'Programado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {procedure.results || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Cardiac Medications */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Medicamentos Cardíacos</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cardiacMedications.map((medication) => (
                <div key={medication.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{medication.patientName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffectivenessColor(medication.effectiveness)}`}>
                      {medication.effectiveness === 'excellent' ? 'Excelente' :
                       medication.effectiveness === 'good' ? 'Bueno' :
                       medication.effectiveness === 'fair' ? 'Regular' : 'Pobre'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Medicamento:</span>
                      <span className="text-sm font-medium text-gray-900">{medication.medication}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Dosis:</span>
                      <span className="text-sm font-medium text-gray-900">{medication.dosage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Frecuencia:</span>
                      <span className="text-sm font-medium text-gray-900">{medication.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Inicio:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(medication.startDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cardiac Risk Assessment */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Evaluación de Riesgo Cardíaco</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-12 w-12 text-red-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Riesgo Alto</h4>
                <p className="text-sm text-gray-600">2 pacientes</p>
              </div>
              <div className="text-center">
                <div className="h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="h-12 w-12 text-yellow-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Riesgo Moderado</h4>
                <p className="text-sm text-gray-600">5 pacientes</p>
              </div>
              <div className="text-center">
                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-12 w-12 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Riesgo Bajo</h4>
                <p className="text-sm text-gray-600">12 pacientes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseSpecialtyDashboard>
  )
}
