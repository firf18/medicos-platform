'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Users,
  Activity,
  Loader2
} from 'lucide-react';
import { LaboratorySearch } from '@/components/laboratory/LaboratorySearch';

interface Laboratory {
  id: string;
  name: string;
  legal_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  laboratory_type: string;
  specialties: string[];
  services: string[];
  status: string;
  is_active: boolean;
  created_at: string;
  working_hours?: any;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

interface LaboratoryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LaboratoryDetailPage({ params }: LaboratoryDetailPageProps) {
  const { id } = await params;
  const [laboratory, setLaboratory] = useState<Laboratory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaboratory = async () => {
      try {
        const response = await fetch(`/api/laboratories/${id}`);
        const result = await response.json();

        if (result.success) {
          setLaboratory(result.laboratory);
        } else {
          setError(result.error || 'Laboratorio no encontrado');
        }
      } catch (error) {
        setError('Error al cargar el laboratorio');
      } finally {
        setLoading(false);
      }
    };

    fetchLaboratory();
  }, [id]);

  const getLaboratoryTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      clinical: 'Clínico',
      pathology: 'Patología',
      research: 'Investigación',
      reference: 'Referencia',
      specialized: 'Especializado',
      mobile: 'Móvil',
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (status === 'approved' && isActive) {
      return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
    } else if (status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
    } else if (status === 'rejected') {
      return <Badge className="bg-red-100 text-red-800">Rechazado</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando información del laboratorio...</p>
        </div>
      </div>
    );
  }

  if (error || !laboratory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Laboratorio no encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'El laboratorio solicitado no existe o ha sido eliminado.'}
            </p>
            <Button onClick={() => window.history.back()}>
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {laboratory.name}
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  {laboratory.legal_name}
                </p>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(laboratory.status, laboratory.is_active)}
                  <Badge variant="outline">
                    {getLaboratoryTypeLabel(laboratory.laboratory_type)}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => window.location.href = '/laboratories/search'}
                variant="outline"
              >
                Buscar Otros Laboratorios
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5" />
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {laboratory.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Teléfono</p>
                          <p className="font-medium">{laboratory.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {laboratory.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{laboratory.email}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-500 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="font-medium">
                        {laboratory.address}
                      </p>
                      <p className="text-gray-600">
                        {laboratory.city}, {laboratory.state}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specialties and Services */}
              {(laboratory.specialties?.length > 0 || laboratory.services?.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="mr-2 h-5 w-5" />
                      Servicios y Especialidades
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {laboratory.specialties?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Especialidades</h4>
                        <div className="flex flex-wrap gap-2">
                          {laboratory.specialties.map((specialty, index) => (
                            <Badge key={index} variant="secondary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {laboratory.services?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Servicios</h4>
                        <div className="flex flex-wrap gap-2">
                          {laboratory.services.map((service, index) => (
                            <Badge key={index} variant="outline">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Working Hours */}
              {laboratory.working_hours && Object.keys(laboratory.working_hours).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5" />
                      Horarios de Atención
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(laboratory.working_hours).map(([day, hours]: [string, any]) => (
                        <div key={day} className="flex justify-between">
                          <span className="font-medium capitalize">{day}</span>
                          <span className="text-gray-600">
                            {hours.open_time} - {hours.close_time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Emergency Contact */}
              {(laboratory.emergency_contact_name || laboratory.emergency_contact_phone) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="mr-2 h-5 w-5" />
                      Contacto de Emergencia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {laboratory.emergency_contact_name && (
                        <p><strong>Nombre:</strong> {laboratory.emergency_contact_name}</p>
                      )}
                      {laboratory.emergency_contact_phone && (
                        <p><strong>Teléfono:</strong> {laboratory.emergency_contact_phone}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Phone className="mr-2 h-4 w-4" />
                    Llamar
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Email
                  </Button>
                  <Button className="w-full" variant="outline">
                    <MapPin className="mr-2 h-4 w-4" />
                    Ver en Mapa
                  </Button>
                </CardContent>
              </Card>

              {/* Verification Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Estado de Verificación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Registro</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Documentos</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Licencias</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Laboratories */}
              <Card>
                <CardHeader>
                  <CardTitle>Laboratorios Similares</CardTitle>
                  <CardDescription>
                    Otros laboratorios en {laboratory.city}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LaboratorySearch 
                    showFilters={false}
                    limit={3}
                    onLaboratorySelect={(lab) => {
                      window.location.href = `/laboratories/${lab.id}`;
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
