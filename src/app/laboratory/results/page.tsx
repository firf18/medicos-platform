'use client';

import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Upload, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface LabResult {
  id: string;
  patientName: string;
  testName: string;
  date: string;
  status: 'pending' | 'completed' | 'critical';
  isCritical: boolean;
  doctorName: string;
}

export default function LaboratoryResultsPage() {
  const { user, isAuthenticated, isLaboratory } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<LabResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Redirigir si el usuario no está autenticado o no es un laboratorio
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (!isLaboratory) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, isLaboratory, router]);

  // Simular carga de datos
  useEffect(() => {
    if (isAuthenticated && isLaboratory) {
      // Simular datos de resultados
      const mockResults: LabResult[] = [
        {
          id: '1',
          patientName: 'Ana Silva',
          testName: 'Hemograma completo',
          date: '2025-09-10',
          status: 'completed',
          isCritical: false,
          doctorName: 'Dr. Juan Pérez'
        },
        {
          id: '2',
          patientName: 'Luis Martínez',
          testName: 'Perfil lipídico',
          date: '2025-09-10',
          status: 'pending',
          isCritical: false,
          doctorName: 'Dra. María González'
        },
        {
          id: '3',
          patientName: 'Carlos Rodríguez',
          testName: 'Prueba de función hepática',
          date: '2025-09-09',
          status: 'critical',
          isCritical: true,
          doctorName: 'Dr. Roberto Jiménez'
        },
        {
          id: '4',
          patientName: 'María González',
          testName: 'Examen de orina',
          date: '2025-09-09',
          status: 'completed',
          isCritical: false,
          doctorName: 'Dra. Ana Silva'
        },
        {
          id: '5',
          patientName: 'Pedro López',
          testName: 'Glucosa en sangre',
          date: '2025-09-08',
          status: 'pending',
          isCritical: false,
          doctorName: 'Dr. Carlos Rodríguez'
        }
      ];
      setResults(mockResults);
    }
  }, [isAuthenticated, isLaboratory]);

  const filteredResults = results.filter(result => {
    const matchesSearch = 
      result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      result.status === statusFilter ||
      (statusFilter === 'critical' && result.isCritical);
    
    return matchesSearch && matchesStatus;
  });

  const handleUploadResult = () => {
    // Lógica para subir un resultado
    console.log('Subir resultado');
  };

  const handleDownloadResult = (id: string) => {
    // Lógica para descargar un resultado
    console.log('Descargar resultado con ID:', id);
  };

  const handleViewResult = (id: string) => {
    // Lógica para ver un resultado
    console.log('Ver resultado con ID:', id);
  };

  const getStatusIcon = (status: string, isCritical: boolean) => {
    if (isCritical) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string, isCritical: boolean) => {
    if (isCritical) {
      return 'Crítico';
    }
    
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  const getStatusClass = (status: string, isCritical: boolean) => {
    if (isCritical) {
      return 'bg-red-100 text-red-800';
    }
    
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated || !isLaboratory) {
    return null; // O un componente de carga
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Resultados de Laboratorio</h1>
            <Button onClick={handleUploadResult} className="flex items-center">
              <Upload className="mr-2 h-4 w-4" />
              Subir Resultado
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Gestión de Resultados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar resultados por paciente, prueba o médico..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Prueba</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.patientName}</TableCell>
                      <TableCell>{result.testName}</TableCell>
                      <TableCell>{result.doctorName}</TableCell>
                      <TableCell>{result.date}</TableCell>
                      <TableCell>
                        <span className={`flex items-center px-2 py-1 rounded-full text-xs ${getStatusClass(result.status, result.isCritical)}`}>
                          {getStatusIcon(result.status, result.isCritical)}
                          <span className="ml-1">{getStatusText(result.status, result.isCritical)}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleViewResult(result.id)}
                        >
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadResult(result.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total de Resultados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{results.length}</div>
                <p className="text-sm text-muted-foreground">Resultados registrados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {results.filter(r => r.status === 'pending').length}
                </div>
                <p className="text-sm text-muted-foreground">Resultados sin procesar</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Completados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {results.filter(r => r.status === 'completed').length}
                </div>
                <p className="text-sm text-muted-foreground">Resultados publicados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Críticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {results.filter(r => r.isCritical).length}
                </div>
                <p className="text-sm text-muted-foreground">Resultados que requieren atención inmediata</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}