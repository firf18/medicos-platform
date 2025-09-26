'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import BaseSpecialtyDashboard from '../BaseSpecialtyDashboard'
import { 
  Brain, 
  Activity, 
  AlertTriangle,
  Clock,
  FileText,
  BarChart3,
  Calendar,
  Users,
  Zap,
  Eye,
  Ear,
  Hand
} from 'lucide-react'

interface NeurologicalExam {
  id: string
  patientId: string
  patientName: string
  date: string
  examType: 'cognitive' | 'motor' | 'sensory' | 'reflexes'
  score: number
  maxScore: number
  interpretation: string
  isAbnormal: boolean
}

interface BrainImaging {
  id: string
  patientId: string
  patientName: string
  imagingType: 'MRI' | 'CT' | 'PET' | 'EEG'
  date: string
  findings: string
  severity: 'normal' | 'mild' | 'moderate' | 'severe'
}

interface NeurologicalMedication {
  id: string
  patientId: string
  patientName: string
  medication: string
  dosage: string
  frequency: string
  indication: string
  effectiveness: 'excellent' | 'good' | 'fair' | 'poor'
  sideEffects?: string[]
}

interface SeizureEvent {
  id: string
  patientId: string
  patientName: string
  date: string
  duration: number
  type: 'focal' | 'generalized' | 'absence' | 'tonic_clonic'
  triggers?: string[]
  postIctalState: string
}

export default function NeurologyDashboard() {
  const [neurologicalExams, setNeurologicalExams] = useState<NeurologicalExam[]>([])
  const [brainImaging, setBrainImaging] = useState<BrainImaging[]>([])
  const [neurologicalMedications, setNeurologicalMedications] = useState<NeurologicalMedication[]>([])
  const [seizureEvents, setSeizureEvents] = useState<SeizureEvent[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    loadNeurologyData()
  }, [])

  const loadNeurologyData = async () => {
    try {
      setLoading(true)
      
      // Simular datos específicos de neurología
      const mockExams: NeurologicalExam[] = [
        {
          id: '1',
          patientId: 'p1',
          patientName: 'Ana Martínez',
          date: '2024-01-15',
          examType: 'cognitive',
          score: 28,
          maxScore: 30,
          interpretation: 'Función cognitiva normal',
          isAbnormal: false
        },
        {
          id: '2',
          patientId: 'p2',
          patientName: 'Roberto Silva',
          date: '2024-01-14',
          examType: 'motor',
          score: 15,
          maxScore: 20,
          interpretation: 'Debilidad motora leve en extremidad izquierda',
          isAbnormal: true
        }
      ]

      const mockImaging: BrainImaging[] = [
        {
          id: '1',
          patientId: 'p1',
          patientName: 'Ana Martínez',
          imagingType: 'MRI',
          date: '2024-01-10',
          findings: 'Sin hallazgos patológicos',
          severity: 'normal'
        },
        {
          id: '2',
          patientId: 'p2',
          patientName: 'Roberto Silva',
          imagingType: 'CT',
          date: '2024-01-12',
          findings: 'Lesión isquémica en región parietal izquierda',
          severity: 'moderate'
        }
      ]

      const mockMedications: NeurologicalMedication[] = [
        {
          id: '1',
          patientId: 'p1',
          patientName: 'Ana Martínez',
          medication: 'Donepezilo',
          dosage: '10mg',
          frequency: '1x día',
          indication: 'Demencia leve',
          effectiveness: 'good'
        },
        {
          id: '2',
          patientId: 'p2',
          patientName: 'Roberto Silva',
          medication: 'Levetiracetam',
          dosage: '500mg',
          frequency: '2x día',
          indication: 'Epilepsia',
          effectiveness: 'excellent'
        }
      ]

      const mockSeizures: SeizureEvent[] = [
        {
          id: '1',
          patientId: 'p2',
          patientName: 'Roberto Silva',
          date: '2024-01-13',
          duration: 120,
          type: 'focal',
          triggers: ['estrés', 'falta de sueño'],
          postIctalState: 'Confusión leve por 10 minutos'
        }
      ]

      setNeurologicalExams(mockExams)
      setBrainImaging(mockImaging)
      setNeurologicalMedications(mockMedications)
      setSeizureEvents(mockSeizures)

    } catch (error) {
      console.error('Error loading neurology data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'normal': return 'text-green-600 bg-green-100'
      case 'mild': return 'text-yellow-600 bg-yellow-100'
      case 'moderate': return 'text-orange-600 bg-orange-100'
      case 'severe': return 'text-red-600 bg-red-100'
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

  const getSeizureTypeColor = (type: string) => {
    switch (type) {
      case 'focal': return 'text-blue-600 bg-blue-100'
      case 'generalized': return 'text-red-600 bg-red-100'
      case 'absence': return 'text-yellow-600 bg-yellow-100'
      case 'tonic_clonic': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <BaseSpecialtyDashboard
      specialtyId="neurology"
      specialtyName="Neurología"
      specialtyIcon="Brain"
      specialtyColor="purple"
    >
      <div className="space-y-8">
        {/* Neurological Exams */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Evaluaciones Neurológicas</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {neurologicalExams.map((exam) => (
                <div key={exam.id} className={`p-4 rounded-lg border-l-4 ${
                  exam.isAbnormal ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{exam.patientName}</p>
                      <p className="text-sm text-gray-600">{exam.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {exam.score}/{exam.maxScore}
                      </p>
                      <span className="text-xs text-gray-500 capitalize">
                        {exam.examType}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{exam.interpretation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Brain Imaging */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Estudios de Imagen Cerebral</h3>
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
                      Tipo de Estudio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hallazgos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {brainImaging.map((imaging) => (
                    <tr key={imaging.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {imaging.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {imaging.imagingType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(imaging.date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(imaging.severity)}`}>
                          {imaging.severity === 'normal' ? 'Normal' :
                           imaging.severity === 'mild' ? 'Leve' :
                           imaging.severity === 'moderate' ? 'Moderado' : 'Severo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {imaging.findings}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Neurological Medications */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Medicamentos Neurológicos</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {neurologicalMedications.map((medication) => (
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
                      <span className="text-sm text-gray-600">Indicación:</span>
                      <span className="text-sm font-medium text-gray-900">{medication.indication}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Dosis:</span>
                      <span className="text-sm font-medium text-gray-900">{medication.dosage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Frecuencia:</span>
                      <span className="text-sm font-medium text-gray-900">{medication.frequency}</span>
                    </div>
                    {medication.sideEffects && medication.sideEffects.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">Efectos Secundarios:</span>
                        <p className="text-sm text-gray-900">{medication.sideEffects.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Seizure Monitoring */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Monitoreo de Convulsiones</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {seizureEvents.map((seizure) => (
                <div key={seizure.id} className="border rounded-lg p-4 bg-red-50 border-red-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{seizure.patientName}</p>
                      <p className="text-sm text-gray-600">{seizure.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{seizure.duration}s</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeizureTypeColor(seizure.type)}`}>
                        {seizure.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {seizure.triggers && seizure.triggers.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">Desencadenantes:</span>
                        <p className="text-sm text-gray-900">{seizure.triggers.join(', ')}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-600">Estado Post-Ictal:</span>
                      <p className="text-sm text-gray-900">{seizure.postIctalState}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Neurological Function Assessment */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Evaluación de Funciones Neurológicas</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Función Cognitiva</h4>
                <p className="text-sm text-gray-600">85% normal</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Hand className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Función Motora</h4>
                <p className="text-sm text-gray-600">92% normal</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="h-8 w-8 text-yellow-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Función Sensorial</h4>
                <p className="text-sm text-gray-600">78% normal</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Reflejos</h4>
                <p className="text-sm text-gray-600">88% normal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseSpecialtyDashboard>
  )
}
