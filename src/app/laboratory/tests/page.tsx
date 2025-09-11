'use client';

import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FlaskConical, Plus, Search, Edit, Trash2, FileText } from 'lucide-react';

interface Test {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
}

export default function LaboratoryTestsPage() {
  const { user, isAuthenticated, isLaboratory } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
      // Simular datos de pruebas
      const mockTests: Test[] = [
        {
          id: '1',
          name: 'Hemograma completo',
          description: 'Análisis completo de componentes sanguíneos',
          price: 150.00,
          isActive: true
        },
        {
          id: '2',
          name: 'Perfil lipídico',
          description: 'Medición de colesterol y triglicéridos',
          price: 120.00,
          isActive: true
        },
        {
          id: '3',
          name: 'Prueba de función hepática',
          description: 'Evaluación del funcionamiento del hígado',
          price: 180.00,
          isActive: false
        },
        {
          id: '4',
          name: 'Examen de orina',
          description: 'Análisis completo de orina',
          price: 80.00,
          isActive: true
        },
        {
          id: '5',
          name: 'Glucosa en sangre',
          description: 'Medición de niveles de glucosa',
          price: 50.00,
          isActive: true
        }
      ];
      setTests(mockTests);
    }
  }, [isAuthenticated, isLaboratory]);

  const filteredTests = tests.filter(test => 
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTest = () => {
    // Lógica para agregar una nueva prueba
    console.log('Agregar nueva prueba');
  };

  const handleEditTest = (id: string) => {
    // Lógica para editar una prueba
    console.log('Editar prueba con ID:', id);
  };

  const handleDeleteTest = (id: string) => {
    // Lógica para eliminar una prueba
    console.log('Eliminar prueba con ID:', id);
  };

  const toggleTestStatus = (id: string) => {
    // Lógica para activar/desactivar una prueba
    console.log('Cambiar estado de prueba con ID:', id);
  };

  if (!isAuthenticated || !isLaboratory) {
    return null; // O un componente de carga
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Pruebas de Laboratorio</h1>
            <Button onClick={handleAddTest} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Prueba
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FlaskConical className="mr-2 h-5 w-5" />
                Gestión de Pruebas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pruebas por nombre o descripción..."
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
                    <TableHead>Descripción</TableHead>
                    <TableHead>Precio (MXN)</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.name}</TableCell>
                      <TableCell>{test.description}</TableCell>
                      <TableCell>${test.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          test.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {test.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleEditTest(test.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => toggleTestStatus(test.id)}
                        >
                          {test.isActive ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTest(test.id)}
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
                <CardTitle>Total de Pruebas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{tests.length}</div>
                <p className="text-sm text-muted-foreground">Pruebas registradas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pruebas Activas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {tests.filter(t => t.isActive).length}
                </div>
                <p className="text-sm text-muted-foreground">Pruebas disponibles</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Ingresos Estimados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${tests
                    .filter(t => t.isActive)
                    .reduce((sum, test) => sum + test.price, 0)
                    .toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">Valor total de pruebas activas</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}