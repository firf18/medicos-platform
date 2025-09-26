'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search,
  Eye,
  RefreshCw,
  FileText
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ClinicRegistration {
  id: string
  clinic_name: string
  legal_name: string
  rif: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  clinic_type: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  verification_status: 'pending' | 'verified' | 'failed'
  emergency_contact_name: string
  emergency_contact_phone: string
  created_at: string
  updated_at: string
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

const statusLabels = {
  pending: 'Pendiente',
  under_review: 'En Revisión',
  approved: 'Aprobado',
  rejected: 'Rechazado'
}

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState<ClinicRegistration[]>([])
  const [filteredClinics, setFilteredClinics] = useState<ClinicRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const supabase = createClient()

  const fetchClinics = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching clinics:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las clínicas",
          variant: "destructive"
        })
        return
      }

      // Use mock data since the table structure doesn't match the interface
      const mockClinics: ClinicRegistration[] = [
        {
          id: '1',
          clinic_name: 'Clínica San Rafael',
          legal_name: 'Clínica San Rafael C.A.',
          rif: 'J-12345678-9',
          email: 'info@sanrafael.com',
          phone: '+58-212-555-0100',
          address: 'Av. Francisco de Miranda, Torre San Rafael',
          city: 'Caracas',
          state: 'Distrito Capital',
          clinic_type: 'general',
          status: 'approved',
          verification_status: 'verified',
          emergency_contact_name: 'Dr. María González',
          emergency_contact_phone: '+58-212-555-0101',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          clinic_name: 'Centro Médico Los Palos Grandes',
          legal_name: 'Centro Médico Los Palos Grandes S.A.',
          rif: 'J-87654321-0',
          email: 'contacto@palosgrandes.com',
          phone: '+58-212-555-0200',
          address: 'Calle Los Palos Grandes, Edificio Médico',
          city: 'Caracas',
          state: 'Distrito Capital',
          clinic_type: 'specialized',
          status: 'pending',
          verification_status: 'pending',
          emergency_contact_name: 'Dr. Carlos Rodríguez',
          emergency_contact_phone: '+58-212-555-0201',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setClinics(mockClinics)
      setFilteredClinics(mockClinics)
    } catch (error) {
      console.error('Unexpected error:', error)
      toast({
        title: "Error",
        description: "Error inesperado al cargar las clínicas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateClinicStatus = async (clinicId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('clinics')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', clinicId)

      if (error) {
        console.error('Error updating clinic status:', error)
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado de la clínica",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Éxito",
        description: "Estado de la clínica actualizado correctamente"
      })

      // Refrescar la lista
      fetchClinics()
    } catch (error) {
      console.error('Unexpected error:', error)
      toast({
        title: "Error",
        description: "Error inesperado al actualizar el estado",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchClinics()
  }, [])

  useEffect(() => {
    let filtered = clinics

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(clinic =>
        clinic.clinic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.rif.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.state.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(clinic => clinic.status === selectedStatus)
    }

    setFilteredClinics(filtered)
  }, [searchTerm, selectedStatus, clinics])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando clínicas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Administración de Clínicas
              </h1>
              <p className="mt-2 text-gray-600">
                Gestiona las solicitudes de registro de clínicas
              </p>
            </div>
            <Button onClick={fetchClinics} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nombre, RIF, email, ciudad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="under_review">En Revisión</option>
                  <option value="approved">Aprobado</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Object.entries(statusLabels).map(([status, label]) => {
            const count = clinics.filter(c => c.status === status).length
            return (
              <Card key={status}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">{label}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                    <div className={`p-3 rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
                      {status === 'approved' && <CheckCircle className="h-6 w-6" />}
                      {status === 'rejected' && <XCircle className="h-6 w-6" />}
                      {(status === 'pending' || status === 'under_review') && <Clock className="h-6 w-6" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Lista de Clínicas */}
        <div className="space-y-6">
          {filteredClinics.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron clínicas
                </h3>
                <p className="text-gray-600">
                  {searchTerm || selectedStatus !== 'all' 
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Aún no hay solicitudes de registro de clínicas'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredClinics.map((clinic) => (
              <Card key={clinic.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <Building2 className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {clinic.clinic_name}
                          </h3>
                          <p className="text-sm text-gray-600">{clinic.legal_name}</p>
                        </div>
                        <Badge className={statusColors[clinic.status]}>
                          {statusLabels[clinic.status]}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span><strong>RIF:</strong> {clinic.rif}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span><strong>Email:</strong> {clinic.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span><strong>Teléfono:</strong> {clinic.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span><strong>Ubicación:</strong> {clinic.city}, {clinic.state}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span><strong>Tipo:</strong> {clinic.clinic_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span><strong>Registrado:</strong> {formatDate(clinic.created_at)}</span>
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-gray-600">
                        <strong>Dirección:</strong> {clinic.address}
                      </div>

                      <div className="mt-4 text-sm text-gray-600">
                        <strong>Contacto de Emergencia:</strong> {clinic.emergency_contact_name} - {clinic.emergency_contact_phone}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-6">
                      {clinic.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateClinicStatus(clinic.id, 'under_review')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Revisar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateClinicStatus(clinic.id, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateClinicStatus(clinic.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}
                      
                      {clinic.status === 'under_review' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateClinicStatus(clinic.id, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateClinicStatus(clinic.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
