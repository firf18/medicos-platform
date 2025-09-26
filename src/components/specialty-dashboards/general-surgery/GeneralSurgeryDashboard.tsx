'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import BaseSpecialtyDashboard from '../BaseSpecialtyDashboard'
import { 
  Scissors, 
  Activity, 
  Clock, 
  AlertTriangle,
  FileText,
  Calendar,
  Users,
  Heart,
  Thermometer,
  Bandage,
  Shield,
  Target,
  TrendingUp
} from 'lucide-react'

interface Surgery {
  id: string
  patientId: string
  patientName: string
  surgeryType: string
  scheduledDate: string
  duration: number
  complexity: 'low' | 'medium' | 'high'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  surgeon: string
  anesthesiaType: string
  complications?: string[]
}

interface PostOpMonitoring {
  id: string
  patientId: string
  patientName: string
  surgeryDate: string
  dayPostOp: number
  painLevel: number
  vitalSigns: {
    temperature: number
    bloodPressure: string
    heartRate: number
    oxygenSaturation: number
  }
  woundHealing: 'excellent' | 'good' | 'concerning' | 'poor'
  complications: string[]
  dischargePlanned: boolean
}

interface SurgicalEquipment {
  id: string
  equipmentName: string
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_order'
  lastMaintenance: string
  nextMaintenance: string
  operatingRoom: string
}

interface OperatingRoom {
  id: string
  roomNumber: string
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance'
  currentSurgery?: string
  nextSurgery?: string
  equipment: string[]
  lastCleaned: string
}

export default function GeneralSurgeryDashboard() {
  const [surgeries, setSurgeries] = useState<Surgery[]>([])
  const [postOpMonitoring, setPostOpMonitoring] = useState<PostOpMonitoring[]>([])
  const [surgicalEquipment, setSurgicalEquipment] = useState<SurgicalEquipment[]>([])
  const [operatingRooms, setOperatingRooms] = useState<OperatingRoom[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    loadSurgeryData()
  }, [])

  const loadSurgeryData = async () => {
    try {
      setLoading(true)
      
      // Simular datos específicos de cirugía general
      const mockSurgeries: Surgery[] = [
        {
          id: '1',
          patientId: 'p1',
          patientName: 'Carlos Mendoza',
          surgeryType: 'Apendicectomía Laparoscópica',
          scheduledDate: '2024-01-16T08:00:00',
          duration: 90,
          complexity: 'medium',
          status: 'scheduled',
          surgeon: 'Dr. García',
          anesthesiaType: 'General'
        },
        {
          id: '2',
          patientId: 'p2',
          patientName: 'María Fernández',
          surgeryType: 'Colecistectomía',
          scheduledDate: '2024-01-15T14:00:00',
          duration: 120,
          complexity: 'medium',
          status: 'completed',
          surgeon: 'Dr. López',
          anesthesiaType: 'General',
          complications: []
        }
      ]

      const mockPostOpMonitoring: PostOpMonitoring[] = [
        {
          id: '1',
          patientId: 'p2',
          patientName: 'María Fernández',
          surgeryDate: '2024-01-15',
          dayPostOp: 1,
          painLevel: 3,
          vitalSigns: {
            temperature: 37.1,
            bloodPressure: '120/80',
            heartRate: 72,
            oxygenSaturation: 98
          },
          woundHealing: 'good',
          complications: [],
          dischargePlanned: true
        },
        {
          id: '2',
          patientId: 'p3',
          patientName: 'José Martínez',
          surgeryDate: '2024-01-13',
          dayPostOp: 3,
          painLevel: 2,
          vitalSigns: {
            temperature: 36.8,
            bloodPressure: '110/70',
            heartRate: 68,
            oxygenSaturation: 99
          },
          woundHealing: 'excellent',
          complications: [],
          dischargePlanned: true
        }
      ]

      const mockEquipment: SurgicalEquipment[] = [
        {
          id: '1',
          equipmentName: 'Laparoscopio HD',
          status: 'available',
          lastMaintenance: '2024-01-01',
          nextMaintenance: '2024-04-01',
          operatingRoom: 'Quirófano 1'
        },
        {
          id: '2',
          equipmentName: 'Electrocauterio',
          status: 'in_use',
          lastMaintenance: '2023-12-15',
          nextMaintenance: '2024-03-15',
          operatingRoom: 'Quirófano 2'
        }
      ]

      const mockOperatingRooms: OperatingRoom[] = [
        {
          id: '1',
          roomNumber: 'Quirófano 1',
          status: 'available',
          equipment: ['Laparoscopio HD', 'Monitor', 'Mesa de cirugía'],
          lastCleaned: '2024-01-15T06:00:00'
        },
        {
          id: '2',
          roomNumber: 'Quirófano 2',
          status: 'occupied',
          currentSurgery: 'Apendicectomía',
          nextSurgery: 'Hernioplastia - 15:00',
          equipment: ['Electrocauterio', 'Monitor', 'Mesa de cirugía'],
          lastCleaned: '2024-01-15T07:00:00'
        }
      ]

      setSurgeries(mockSurgeries)
      setPostOpMonitoring(mockPostOpMonitoring)
      setSurgicalEquipment(mockEquipment)
      setOperatingRooms(mockOperatingRooms)

    } catch (error) {
      console.error('Error loading surgery data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100'
      case 'in_progress': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      case 'available': return 'text-green-600 bg-green-100'
      case 'in_use': return 'text-blue-600 bg-blue-100'
      case 'occupied': return 'text-yellow-600 bg-yellow-100'
      case 'maintenance': return 'text-orange-600 bg-orange-100'
      case 'out_of_order': return 'text-red-600 bg-red-100'
      case 'cleaning': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getWoundHealingColor = (healing: string) => {
    switch (healing) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'concerning': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPainLevelColor = (level: number) => {
    if (level <= 3) return 'text-green-600 bg-green-100'
    if (level <= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <BaseSpecialtyDashboard
      specialtyId="general_surgery"
      specialtyName="Cirugía General"
      specialtyIcon="Scissors"
      specialtyColor="orange"
    >
      <div className="space-y-8">
        {/* Operating Room Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Estado de Quirófanos</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {operatingRooms.map((room) => (
                <div key={room.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{room.roomNumber}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                      {room.status === 'available' ? 'Disponible' :
                       room.status === 'occupied' ? 'Ocupado' :
                       room.status === 'cleaning' ? 'Limpieza' : 'Mantenimiento'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {room.currentSurgery && (
                      <div>
                        <span className="text-sm text-gray-600">Cirugía actual:</span>
                        <p className="text-sm font-medium text-gray-900">{room.currentSurgery}</p>
                      </div>
                    )}
                    {room.nextSurgery && (
                      <div>
                        <span className="text-sm text-gray-600">Próxima cirugía:</span>
                        <p className="text-sm font-medium text-gray-900">{room.nextSurgery}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-600">Última limpieza:</span>
                      <p className="text-sm text-gray-900">
                        {new Date(room.lastCleaned).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Equipos:</span>
                      <p className="text-sm text-gray-900">{room.equipment.join(', ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Surgery Schedule */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Programa Quirúrgico</h3>
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
                      Cirugía
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duración
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Complejidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cirujano
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {surgeries.map((surgery) => (
                    <tr key={surgery.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {surgery.patientName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {surgery.surgeryType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(surgery.scheduledDate).toLocaleString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {surgery.duration} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(surgery.complexity)}`}>
                          {surgery.complexity === 'low' ? 'Baja' :
                           surgery.complexity === 'medium' ? 'Media' : 'Alta'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(surgery.status)}`}>
                          {surgery.status === 'scheduled' ? 'Programada' :
                           surgery.status === 'in_progress' ? 'En Curso' :
                           surgery.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {surgery.surgeon}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Post-Operative Monitoring */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Monitoreo Post-Operatorio</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {postOpMonitoring.map((patient) => (
                <div key={patient.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{patient.patientName}</h4>
                      <p className="text-sm text-gray-600">
                        Día {patient.dayPostOp} post-cirugía - {patient.surgeryDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWoundHealingColor(patient.woundHealing)}`}>
                        {patient.woundHealing === 'excellent' ? 'Excelente' :
                         patient.woundHealing === 'good' ? 'Buena' :
                         patient.woundHealing === 'concerning' ? 'Preocupante' : 'Pobre'}
                      </span>
                      {patient.dischargePlanned && (
                        <p className="text-xs text-green-600 mt-1">Alta planificada</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <p className="text-xs text-gray-600">Dolor</p>
                      <p className={`text-sm font-medium px-2 py-1 rounded ${getPainLevelColor(patient.painLevel)}`}>
                        {patient.painLevel}/10
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Thermometer className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-xs text-gray-600">Temperatura</p>
                      <p className="text-sm font-medium text-gray-900">{patient.vitalSigns.temperature}°C</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Heart className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-600">FC</p>
                      <p className="text-sm font-medium text-gray-900">{patient.vitalSigns.heartRate} bpm</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Activity className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="text-xs text-gray-600">PA</p>
                      <p className="text-sm font-medium text-gray-900">{patient.vitalSigns.bloodPressure}</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="h-12 w-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Shield className="h-6 w-6 text-cyan-600" />
                      </div>
                      <p className="text-xs text-gray-600">SatO2</p>
                      <p className="text-sm font-medium text-gray-900">{patient.vitalSigns.oxygenSaturation}%</p>
                    </div>
                  </div>
                  
                  {patient.complications.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <h5 className="text-sm font-medium text-red-800 mb-2">Complicaciones:</h5>
                      <ul className="text-sm text-red-700">
                        {patient.complications.map((complication, index) => (
                          <li key={index}>• {complication}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Surgical Equipment Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Estado del Equipo Quirúrgico</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {surgicalEquipment.map((equipment) => (
                <div key={equipment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{equipment.equipmentName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(equipment.status)}`}>
                      {equipment.status === 'available' ? 'Disponible' :
                       equipment.status === 'in_use' ? 'En Uso' :
                       equipment.status === 'maintenance' ? 'Mantenimiento' : 'Fuera de Servicio'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ubicación:</span>
                      <span className="text-sm font-medium text-gray-900">{equipment.operatingRoom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Último mantenimiento:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(equipment.lastMaintenance).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Próximo mantenimiento:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(equipment.nextMaintenance).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BaseSpecialtyDashboard>
  )
}
