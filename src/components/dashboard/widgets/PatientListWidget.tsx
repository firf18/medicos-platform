'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin,
  Clock,
  AlertTriangle,
  Plus,
  Filter
} from 'lucide-react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  phone: string;
  email: string;
  address: string;
  lastVisit: string;
  nextAppointment?: string;
  chronicConditions: string[];
  allergies: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insuranceProvider?: string;
  status: 'active' | 'inactive' | 'new';
  riskLevel: 'low' | 'medium' | 'high';
}

export default function PatientListWidget() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'upcoming' | 'high_risk'>('all');

  useEffect(() => {
    loadPatients();
  }, [selectedFilter]);

  const loadPatients = async () => {
    setIsLoading(true);
    
    // Simular datos de pacientes
    // En producción, esto vendría de Supabase
    const mockPatients: Patient[] = [
      {
        id: '1',
        firstName: 'María',
        lastName: 'González',
        age: 45,
        gender: 'F',
        phone: '+52 55 1234 5678',
        email: 'maria.gonzalez@email.com',
        address: 'Av. Reforma 123, CDMX',
        lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        nextAppointment: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        chronicConditions: ['Hipertensión', 'Diabetes tipo 2'],
        allergies: ['Penicilina'],
        emergencyContact: {
          name: 'Juan González',
          phone: '+52 55 8765 4321',
          relationship: 'Esposo'
        },
        insuranceProvider: 'IMSS',
        status: 'active',
        riskLevel: 'high'
      },
      {
        id: '2',
        firstName: 'Carlos',
        lastName: 'Mendoza',
        age: 35,
        gender: 'M',
        phone: '+52 55 2345 6789',
        email: 'carlos.mendoza@email.com',
        address: 'Calle Juárez 456, CDMX',
        lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        nextAppointment: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        chronicConditions: [],
        allergies: [],
        emergencyContact: {
          name: 'Ana Mendoza',
          phone: '+52 55 9876 5432',
          relationship: 'Esposa'
        },
        insuranceProvider: 'Seguro Popular',
        status: 'active',
        riskLevel: 'low'
      },
      {
        id: '3',
        firstName: 'Ana',
        lastName: 'Rodríguez',
        age: 28,
        gender: 'F',
        phone: '+52 55 3456 7890',
        email: 'ana.rodriguez@email.com',
        address: 'Av. Insurgentes 789, CDMX',
        lastVisit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        chronicConditions: ['Asma'],
        allergies: ['Polen', 'Ácaros'],
        emergencyContact: {
          name: 'Luis Rodríguez',
          phone: '+52 55 5432 1098',
          relationship: 'Padre'
        },
        status: 'active',
        riskLevel: 'medium'
      },
      {
        id: '4',
        firstName: 'Roberto',
        lastName: 'Silva',
        age: 65,
        gender: 'M',
        phone: '+52 55 4567 8901',
        email: 'roberto.silva@email.com',
        address: 'Calle Madero 321, CDMX',
        lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextAppointment: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        chronicConditions: ['Hipertensión', 'Colesterol alto', 'Artritis'],
        allergies: ['Aspirina'],
        emergencyContact: {
          name: 'Carmen Silva',
          phone: '+52 55 6543 2109',
          relationship: 'Esposa'
        },
        insuranceProvider: 'ISSSTE',
        status: 'active',
        riskLevel: 'high'
      },
      {
        id: '5',
        firstName: 'Lucía',
        lastName: 'Hernández',
        age: 22,
        gender: 'F',
        phone: '+52 55 5678 9012',
        email: 'lucia.hernandez@email.com',
        address: 'Av. Universidad 654, CDMX',
        lastVisit: new Date().toISOString(),
        chronicConditions: [],
        allergies: [],
        emergencyContact: {
          name: 'Pedro Hernández',
          phone: '+52 55 7654 3210',
          relationship: 'Padre'
        },
        status: 'new',
        riskLevel: 'low'
      }
    ];

    // Filtrar pacientes según el filtro seleccionado
    let filteredPatients = mockPatients;
    
    switch (selectedFilter) {
      case 'recent':
        filteredPatients = mockPatients.filter(patient => {
          const lastVisit = new Date(patient.lastVisit);
          const daysDiff = (Date.now() - lastVisit.getTime()) / (1000 * 3600 * 24);
          return daysDiff <= 7;
        });
        break;
      case 'upcoming':
        filteredPatients = mockPatients.filter(patient => patient.nextAppointment);
        break;
      case 'high_risk':
        filteredPatients = mockPatients.filter(patient => patient.riskLevel === 'high');
        break;
      default:
        filteredPatients = mockPatients;
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filteredPatients = filteredPatients.filter(patient =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      );
    }

    setPatients(filteredPatients);
    setIsLoading(false);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'new': return 'text-blue-600 bg-blue-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDaysFromLastVisit = (lastVisit: string) => {
    const days = Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 3600 * 24));
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    return `Hace ${days} días`;
  };

  const getDaysToNextAppointment = (nextAppointment?: string) => {
    if (!nextAppointment) return null;
    
    const days = Math.floor((new Date(nextAppointment).getTime() - Date.now()) / (1000 * 3600 * 24));
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    if (days > 1) return `En ${days} días`;
    return `Hace ${Math.abs(days)} días`;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar pacientes por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'recent', label: 'Recientes' },
            { key: 'upcoming', label: 'Próximas citas' },
            { key: 'high_risk', label: 'Alto riesgo' }
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={selectedFilter === filter.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.key as any)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de pacientes */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {patients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {patient.age} años • {patient.gender === 'M' ? 'Masculino' : 'Femenino'}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Badge className={`text-xs ${getStatusColor(patient.status)}`}>
                        {patient.status === 'active' ? 'Activo' : 
                         patient.status === 'new' ? 'Nuevo' : 'Inactivo'}
                      </Badge>
                      <Badge className={`text-xs ${getRiskColor(patient.riskLevel)}`}>
                        {patient.riskLevel === 'high' ? 'Alto riesgo' :
                         patient.riskLevel === 'medium' ? 'Riesgo medio' : 'Bajo riesgo'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3" />
                      <span>{patient.phone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>Última visita: {getDaysFromLastVisit(patient.lastVisit)}</span>
                    </div>
                    
                    {patient.nextAppointment && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span>Próxima cita: {getDaysToNextAppointment(patient.nextAppointment)}</span>
                      </div>
                    )}
                  </div>

                  {/* Condiciones crónicas y alergias */}
                  {(patient.chronicConditions.length > 0 || patient.allergies.length > 0) && (
                    <div className="mt-3 space-y-2">
                      {patient.chronicConditions.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-gray-700">Condiciones crónicas:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {patient.chronicConditions.map((condition, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {patient.allergies.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-red-700 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Alergias:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {patient.allergies.map((allergy, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="flex space-x-2 mt-4">
                <Button size="sm" variant="outline">
                  Ver expediente
                </Button>
                <Button size="sm" variant="outline">
                  Agendar cita
                </Button>
                <Button size="sm" variant="outline">
                  Contactar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {patients.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda.' 
              : 'Comienza agregando pacientes a tu consulta.'}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Paciente
          </Button>
        </div>
      )}
    </div>
  );
}
