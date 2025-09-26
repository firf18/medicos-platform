'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  FileText,
  Users,
  Activity,
  Loader2,
  AlertCircle,
  Download,
  Upload
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  status: string;
  verification_status: string;
  is_active: boolean;
  created_at: string;
  verified_at?: string;
  activated_at?: string;
}

interface Registration {
  id: string;
  email: string;
  laboratory_name: string;
  legal_name: string;
  rif: string;
  status: string;
  registration_step: string;
  created_at: string;
  completed_at?: string;
}

interface Statistics {
  total_laboratories: number;
  pending_laboratories: number;
  approved_laboratories: number;
  rejected_laboratories: number;
  active_laboratories: number;
  total_registrations: number;
  pending_registrations: number;
}

export default function AdminDashboard() {
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLaboratory, setSelectedLaboratory] = useState<Laboratory | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch statistics
      const statsResponse = await fetch('/api/laboratories/statistics');
      const statsResult = await statsResponse.json();
      if (statsResult.success) {
        setStatistics(statsResult.statistics);
      }

      // Fetch laboratories
      const labsResponse = await fetch('/api/laboratories');
      const labsResult = await labsResponse.json();
      if (labsResult.success) {
        setLaboratories(labsResult.laboratories);
      }

      // Fetch registrations
      const regsResponse = await fetch('/api/laboratories/registrations');
      const regsResult = await regsResponse.json();
      if (regsResult.success) {
        setRegistrations(regsResult.registrations);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLaboratory = async (laboratoryId: string) => {
    try {
      const response = await fetch(`/api/laboratories/${laboratoryId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();
      if (result.success) {
        fetchData(); // Refresh data
      } else {
        alert('Error al aprobar el laboratorio: ' + result.error);
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const handleRejectLaboratory = async (laboratoryId: string) => {
    if (!rejectionReason.trim()) {
      alert('Por favor, proporcione un motivo para el rechazo');
      return;
    }

    try {
      const response = await fetch(`/api/laboratories/${laboratoryId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: rejectionReason,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowRejectionModal(false);
        setRejectionReason('');
        setSelectedLaboratory(null);
        fetchData(); // Refresh data
      } else {
        alert('Error al rechazar el laboratorio: ' + result.error);
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprobado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800">En Revisión</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rechazado</Badge>;
      case 'suspended':
        return <Badge className="bg-orange-100 text-orange-800">Suspendido</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

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

  const filteredLaboratories = laboratories.filter(lab => {
    const matchesSearch = lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lab.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lab.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || lab.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard de Administración
            </h1>
            <p className="text-gray-600">
              Gestión de laboratorios médicos registrados
            </p>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Laboratorios</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistics.total_laboratories}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pendientes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistics.pending_laboratories}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Aprobados</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistics.approved_laboratories}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Rechazados</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistics.rejected_laboratories}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <Tabs defaultValue="laboratories" className="space-y-6">
            <TabsList>
              <TabsTrigger value="laboratories">Laboratorios</TabsTrigger>
              <TabsTrigger value="registrations">Registros</TabsTrigger>
            </TabsList>

            {/* Laboratories Tab */}
            <TabsContent value="laboratories" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Buscar por nombre, email o ciudad..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos los estados</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="under_review">En Revisión</SelectItem>
                          <SelectItem value="approved">Aprobado</SelectItem>
                          <SelectItem value="rejected">Rechazado</SelectItem>
                          <SelectItem value="suspended">Suspendido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Laboratories List */}
              <div className="space-y-4">
                {filteredLaboratories.map((laboratory) => (
                  <Card key={laboratory.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {laboratory.name}
                            </h3>
                            {getStatusBadge(laboratory.status, laboratory.is_active)}
                          </div>
                          <p className="text-gray-600 mb-2">{laboratory.legal_name}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <strong>Email:</strong> {laboratory.email}
                            </div>
                            <div>
                              <strong>Ubicación:</strong> {laboratory.city}, {laboratory.state}
                            </div>
                            <div>
                              <strong>Tipo:</strong> {getLaboratoryTypeLabel(laboratory.laboratory_type)}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/laboratories/${laboratory.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          {laboratory.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproveLaboratory(laboratory.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aprobar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedLaboratory(laboratory);
                                  setShowRejectionModal(true);
                                }}
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
                ))}
              </div>
            </TabsContent>

            {/* Registrations Tab */}
            <TabsContent value="registrations" className="space-y-6">
              <div className="space-y-4">
                {registrations.map((registration) => (
                  <Card key={registration.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {registration.laboratory_name}
                            </h3>
                            {getStatusBadge(registration.status, false)}
                          </div>
                          <p className="text-gray-600 mb-2">{registration.legal_name}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <strong>Email:</strong> {registration.email}
                            </div>
                            <div>
                              <strong>RIF:</strong> {registration.rif}
                            </div>
                            <div>
                              <strong>Paso:</strong> {registration.registration_step}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && selectedLaboratory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Rechazar Laboratorio</CardTitle>
              <CardDescription>
                Proporcione el motivo para rechazar el laboratorio "{selectedLaboratory.name}"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Motivo del Rechazo *</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Describa el motivo del rechazo..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason('');
                    setSelectedLaboratory(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRejectLaboratory(selectedLaboratory.id)}
                >
                  Rechazar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
