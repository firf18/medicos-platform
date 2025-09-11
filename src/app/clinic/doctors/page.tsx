'use client';

import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Stethoscope, Plus, Search, Edit, Trash2 } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  isAvailable: boolean;
}

export default function ClinicDoctorsPage() {
  const { user, isAuthenticated, isClinic } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Redirigir si el usuario no está autenticado o no es una clínica
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (!isClinic) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, isClinic, router]);

  // Simular carga de datos
  useEffect(() => {
    if (isAuthenticated && isClinic) {
      // Simular datos de médicos
      const mockDoctors: Doctor[] = [
        {
          id: '1',
          name: 'Dr. Juan Pérez',
          specialty: 'Cardiología',
          phone: '+58 212-555-1234',
          email: 'juan.perez@clinic.com',
          isAvailable: true
        },
        {
          id: '2',
          name: 'Dra. María González',
          specialty: 'Pediatría',
          phone: '+58 212-555-5678',
          email: 'maria.gonzalez@clinic.com',
          isAvailable: false
        },
        {
          id: '3',
          name: 'Dr. Carlos Rodríguez',
          specialty: 'Dermatología',
          phone: '+58 212-555-9012',
          email: 'carlos.rodriguez@clinic.com',
          isAvailable: true
        },
        {
          id: '4',
          name: 'Dra. Ana Silva',
          specialty: 'Ginecología',
          phone: '+58 212-555-3456',
          email: 'ana.silva@clinic.com',
          isAvailable: true
        }
      ];
      setDoctors(mockDoctors);
    }
  }, [isAuthenticated, isClinic]);

  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDoctor = () => {
    // Lógica para agregar un nuevo médico
    console.log('Agregar nuevo médico');
  };

  const handleEditDoctor = (id: string) => {
    // Lógica para editar un médico
    console.log('Editar médico con ID:', id);
  };

  const handleDeleteDoctor = (id: string) => {
    // Lógica para eliminar un médico
    console.log('Eliminar médico con ID:', id);
  };

  if (!isAuthenticated || !isClinic) {
    return null; // O un componente de carga
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Médicos Asociados</h1>
            <Button onClick={handleAddDoctor} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Médico
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="mr-2 h-5 w-5" />
                Gestión de Médicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar médicos por nombre o especialidad..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>{doctor.specialty}</TableCell>
                      <TableCell>{doctor.phone}</TableCell>
                      <TableCell>{doctor.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          doctor.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {doctor.isAvailable ? 'Disponible' : 'No disponible'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleEditDoctor(doctor.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDoctor(doctor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total de Médicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{doctors.length}</div>
                <p className="text-sm text-muted-foreground">Médicos registrados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Médicos Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {doctors.filter(d => d.isAvailable).length}
                </div>
                <p className="text-sm text-muted-foreground">Médicos disponibles</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Especialidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {new Set(doctors.map(d => d.specialty)).size}
                </div>
                <p className="text-sm text-muted-foreground">Especialidades únicas</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}