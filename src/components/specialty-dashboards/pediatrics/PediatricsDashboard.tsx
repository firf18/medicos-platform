'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import BaseSpecialtyDashboard from '../BaseSpecialtyDashboard'
import { 
  Baby, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  FileText,
  BarChart3,
  Calendar,
  Users,
  Zap,
  Heart,
  Scale,
  Ruler,
  Thermometer,
  Shield,
  Syringe
} from 'lucide-react'

interface GrowthMeasurement {
  id: string
  patientId: string
  patientName: string
  ageMonths: number
  weight: number
  height: number
  headCircumference: number
  date: string
  percentileWeight: number
  percentileHeight: number
  isNormal: boolean
}

interface Vaccination {
  id: string
  patientId: string
  patientName: string
  vaccineName: string
  ageAtVaccination: number
  dateGiven: string
  nextDue?: string
  reactionReported: boolean
  reactionDescription?: string
}

interface DevelopmentalMilestone {
  id: string
  patientId: string
  patientName: string
  milestone: string
  expectedAgeMonths: number
  achievedAgeMonths?: number
  category: 'motor' | 'cognitive' | 'language' | 'social'
  achieved: boolean
  delay: boolean
}

interface PediatricCondition {
  id: string
  patientId: string
  patientName: string
  condition: string
  diagnosisDate: string
  severity: 'mild' | 'moderate' | 'severe'
  treatment: string
  status: 'active' | 'resolved' | 'chronic'
}

export default function PediatricsDashboard() {
  const [growthMeasurements, setGrowthMeasurements] = useState<GrowthMeasurement[]>([])
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [developmentalMilestones, setDevelopmentalMilestones] = useState<DevelopmentalMilestone[]>([])
  const [pediatricConditions, setPediatricConditions] = useState<PediatricCondition[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    loadPediatricsData()
  }, [])

  const loadPediatricsData = async () => {
    try {
      setLoading(true)
      
      // Simular datos específicos de pediatría
      const mockGrowthMeasurements: GrowthMeasurement[] = [
        {
          id: '1',
          patientId: 'p1',
          patientName: 'Sofía González',
          ageMonths: 24,
          weight: 12.5,
          height: 86,
          headCircumference: 48,
          date: '2024-01-15',
          percentileWeight: 75,
          percentileHeight: 80,
          isNormal: true
        },
        {
          id: '2',
          patientId: 'p2',
          patientName: 'Diego Rodríguez',
          ageMonths: 6,
          weight: 6.8,
          height: 65,
          headCircumference: 42,
          date: '2024-01-14',
          percentileWeight: 25,
          percentileHeight: 30,
          isNormal: false
        }
      ]

      const mockVaccinations: Vaccination[] = [
        {
          id: '1',
          patientId: 'p1',
          patientName: 'Sofía González',
          vaccineName: 'MMR (Sarampión, Paperas, Rubéola)',
          ageAtVaccination: 12,
          dateGiven: '2023-01-15',
          nextDue: '2027-01-15',
          reactionReported: false
        },
        {
          id: '2',
          patientId: 'p2',
          patientName: 'Diego Rodríguez',
          vaccineName: 'DTPa (Difteria, Tétanos, Tos ferina)',
          ageAtVaccination: 6,
          dateGiven: '2024-01-10',
          nextDue: '2024-03-10',
          reactionReported: true,
          reactionDescription: 'Fiebre leve por 24 horas'
        }
      ]

      const mockMilestones: DevelopmentalMilestone[] = [
        {
          id: '1',
          patientId: 'p1',
          patientName: 'Sofía González',
          milestone: 'Caminar independientemente',
          expectedAgeMonths: 12,
          achievedAgeMonths: 14,
          category: 'motor',
          achieved: true,
          delay: true
        },
        {
          id: '2',
          patientId: 'p2',
          patientName: 'Diego Rodríguez',
          milestone: 'Sentarse sin apoyo',
          expectedAgeMonths: 6,
          achievedAgeMonths: 6,
          category: 'motor',
          achieved: true,
          delay: false
        }
      ]

      const mockConditions: PediatricCondition[] = [
        {
          id: '1',
          patientId: 'p1',
          patientName: 'Sofía González',
          condition: 'Asma Bronquial',
          diagnosisDate: '2023-06-15',
          severity: 'mild',
          treatment: 'Inhalador de rescate PRN',
          status: 'active'
        },
        {
          id: '2',
          patientId: 'p2',
          patientName: 'Diego Rodríguez',
          condition: 'Reflujo Gastroesofágico',
          diagnosisDate: '2024-01-01',
          severity: 'moderate',
          treatment: 'Fórmula espesada, posición elevada',
          status: 'active'
        }
      ]

      setGrowthMeasurements(mockGrowthMeasurements)
      setVaccinations(mockVaccinations)
      setDevelopmentalMilestones(mockMilestones)
      setPediatricConditions(mockConditions)

    } catch (error) {
      console.error('Error loading pediatrics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPercentileColor = (percentile: number) => {
    if (percentile < 10 || percentile > 90) return 'text-red-600 bg-red-100'
    if (percentile < 25 || percentile > 75) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'text-yellow-600 bg-yellow-100'
      case 'moderate': return 'text-orange-600 bg-orange-100'
      case 'severe': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getMilestoneStatusColor = (achieved: boolean, delay: boolean) => {
    if (!achieved) return 'text-red-600 bg-red-100'
    if (delay) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  return (
    <BaseSpecialtyDashboard
      specialtyId="pediatrics"
      specialtyName="Pediatría"
      specialtyIcon="Baby"
      specialtyColor="pink"
    >
      <div className="space-y-8">
        {/* Growth Tracking */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Seguimiento de Crecimiento</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {growthMeasurements.map((measurement) => (
                <div key={measurement.id} className={`p-4 rounded-lg border-l-4 ${
                  measurement.isNormal ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{measurement.patientName}</p>
                      <p className="text-sm text-gray-600">{measurement.ageMonths} meses - {measurement.date}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Peso</p>
                      <p className="font-medium text-gray-900">{measurement.weight} kg</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPercentileColor(measurement.percentileWeight)}`}>
                        P{measurement.percentileWeight}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600">Talla</p>
                      <p className="font-medium text-gray-900">{measurement.height} cm</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPercentileColor(measurement.percentileHeight)}`}>
                        P{measurement.percentileHeight}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600">Perímetro cefálico</p>
                      <p className="font-medium text-gray-900">{measurement.headCircumference} cm</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vaccination Schedule */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Esquema de Vacunación</h3>
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
                      Vacuna
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Aplicada
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Próxima Dosis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reacciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vaccinations.map((vaccination) => (
                    <tr key={vaccination.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {vaccination.patientName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {vaccination.vaccineName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vaccination.ageAtVaccination} meses
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(vaccination.dateGiven).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vaccination.nextDue ? new Date(vaccination.nextDue).toLocaleDateString('es-ES') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {vaccination.reactionReported ? (
                          <div>
                            <span className="text-yellow-600">Sí</span>
                            {vaccination.reactionDescription && (
                              <p className="text-xs text-gray-400 mt-1">{vaccination.reactionDescription}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-green-600">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Developmental Milestones */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Hitos del Desarrollo</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {developmentalMilestones.map((milestone) => (
                <div key={milestone.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{milestone.patientName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMilestoneStatusColor(milestone.achieved, milestone.delay)}`}>
                      {!milestone.achieved ? 'Pendiente' : milestone.delay ? 'Tardío' : 'Normal'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Hito:</span>
                      <span className="text-sm font-medium text-gray-900">{milestone.milestone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Categoría:</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">{milestone.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Edad esperada:</span>
                      <span className="text-sm font-medium text-gray-900">{milestone.expectedAgeMonths} meses</span>
                    </div>
                    {milestone.achievedAgeMonths && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Edad lograda:</span>
                        <span className="text-sm font-medium text-gray-900">{milestone.achievedAgeMonths} meses</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pediatric Conditions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Condiciones Pediátricas</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pediatricConditions.map((condition) => (
                <div key={condition.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{condition.patientName}</h4>
                      <p className="text-sm text-gray-600">{condition.condition}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(condition.severity)}`}>
                        {condition.severity === 'mild' ? 'Leve' :
                         condition.severity === 'moderate' ? 'Moderado' : 'Severo'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {condition.status === 'active' ? 'Activo' :
                         condition.status === 'resolved' ? 'Resuelto' : 'Crónico'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Diagnóstico:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(condition.diagnosisDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Tratamiento:</span>
                      <p className="text-sm text-gray-900 mt-1">{condition.treatment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pediatric Care Overview */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Resumen de Atención Pediátrica</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Scale className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Crecimiento Normal</h4>
                <p className="text-sm text-gray-600">85% de pacientes</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Syringe className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Vacunación al Día</h4>
                <p className="text-sm text-gray-600">92% de pacientes</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-8 w-8 text-yellow-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Desarrollo Normal</h4>
                <p className="text-sm text-gray-600">78% de hitos logrados</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Prevención</h4>
                <p className="text-sm text-gray-600">95% seguimiento</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseSpecialtyDashboard>
  )
}
