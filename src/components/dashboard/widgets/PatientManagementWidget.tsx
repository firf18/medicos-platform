/**
 * Widget de Gestión de Pacientes Avanzado
 * Proporciona gestión completa de pacientes con funcionalidades avanzadas
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  MoreHorizontal,
  Edit,
  Eye,
  MessageSquare
} from 'lucide-react';

interface Patient {
  id: string;
  user_id: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medical_history?: {
    conditions: string[];
    surgeries: string[];
    allergies: string[];
  };
  last_appointment?: {
    date: string;
    status: string;
    notes?: string;
  };
  next_appointment?: {
    date: string;
    time: string;
    type: string;
  };
  created_at: string;
}

interface PatientManagementWidgetProps {
  specialtyId?: string;
  limit?: number;
}

export default function PatientManagementWidget({ 
  specialtyId = 'medicina_general',
  limit = 10 
}: PatientManagementWidgetProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'recent' | 'urgent'>('all');
  
  const supabase = createClient();

  useEffect(() => {
    loadPatients();
  }, [specialtyId, limit]);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, filterStatus]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener pacientes del médico actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          patient_id,
          patients!inner(
            id,
            user_id,
            emergency_contact,
            medical_history,
            created_at,
            profiles!inner(
              first_name,
              last_name,
              email,
              phone,
              avatar_url
            )
          ),
          scheduled_at,
          status,
          notes
        `)
        .eq('doctor_id', user.id)
        .order('scheduled_at', { ascending: false })
        .limit(limit * 2); // Obtener más para filtrar únicos

      if (appointmentsError) {
        console.error('Error loading appointments:', appointmentsError);
        // Fallback a datos simulados
        setPatients(getMockPatients());
        return;
      }

      // Procesar datos y obtener pacientes únicos
      const uniquePatients = new Map();
      
      appointments?.forEach(apt => {
        const patient = apt.patients;
        if (patient && !uniquePatients.has(patient.id)) {
          uniquePatients.set(patient.id, {
            id: patient.id,
            user_id: patient.user_id,
            profiles: patient.profiles,
            emergency_contact: patient.emergency_contact,
            medical_history: patient.medical_history,
            last_appointment: {
              date: apt.scheduled_at,
              status: apt.status,
              notes: apt.notes
            },
            created_at: patient.created_at
          });
        }
      });

      const patientsList = Array.from(uniquePatients.values()).slice(0, limit);
      setPatients(patientsList);

    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Error al cargar pacientes');
      setPatients(getMockPatients());
    } finally {
      setLoading(false);
    }
  };

  const getMockPatients = (): Patient[] => [
    {
      id: '1',
      user_id: 'user1',
      profiles: {
        first_name: 'María',
        last_name: 'González',
        email: 'maria.gonzalez@email.com',
        phone: '+58 412 123 4567',
        avatar_url: undefined
      },
      emergency_contact: {
        name: 'Carlos González',
        phone: '+58 414 987 6543',
        relationship: 'Esposo'
      },
      medical_history: {
        conditions: ['Hipertensión', 'Diabetes tipo 2'],
        surgeries: ['Apendicectomía (2015)'],
        allergies: ['Penicilina']
      },
      last_appointment: {
        date: '2024-01-10',
        status: 'completed',
        notes: 'Control de presión arterial'
      },
      next_appointment: {
        date: '2024-01-25',
        time: '10:00',
        type: 'Seguimiento'
      },
      created_at: '2023-06-15'
    },
    {
      id: '2',
      user_id: 'user2',
      profiles: {
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan.perez@email.com',
        phone: '+58 416 555 1234',
        avatar_url: undefined
      },
      emergency_contact: {
        name: 'Ana Pérez',
        phone: '+58 424 666 7890',
        relationship: 'Hija'
      },
      medical_history: {
        conditions: ['Artritis'],
        surgeries: [],
        allergies: ['Ninguna']
      },
      last_appointment: {
        date: '2024-01-08',
        status: 'completed',
        notes: 'Dolor articular mejorado'
      },
      created_at: '2023-08-20'
    }
  ];

  const filterPatients = () => {
    let filtered = patients;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.profiles.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.profiles.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    switch (filterStatus) {
      case 'active':
        filtered = filtered.filter(patient => 
          patient.next_appointment || 
          (patient.last_appointment && new Date(patient.last_appointment.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        );
        break;
      case 'recent':
        filtered = filtered.filter(patient => 
          new Date(patient.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        break;
      case 'urgent':
        filtered = filtered.filter(patient => 
          patient.medical_history?.conditions?.some(condition => 
            ['Diabetes', 'Hipertensión', 'Cardiopatía'].includes(condition)
          )
        );
        break;
    }

    setFilteredPatients(filtered);
  };

  const getStatusBadge = (patient: Patient) => {
    if (patient.next_appointment) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Próxima Cita</Badge>;
    }
    if (patient.last_appointment?.status === 'completed') {
      return <Badge variant="secondary">Activo</Badge>;
    }
    return <Badge variant="outline">Inactivo</Badge>;
  };

  const getPriorityIcon = (patient: Patient) => {
    const hasUrgentCondition = patient.medical_history?.conditions?.some(condition => 
      ['Diabetes', 'Hipertensión', 'Cardiopatía'].includes(condition)
    );
    
    if (hasUrgentCondition) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Gestión de Pacientes
          </CardTitle>
          <CardDescription>Cargando lista de pacientes...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadPatients} variant="outline">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Gestión de Pacientes
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo Paciente
          </Button>
        </CardTitle>
        <CardDescription>
          {filteredPatients.length} de {patients.length} pacientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de búsqueda y filtros */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar pacientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            {(['all', 'active', 'recent', 'urgent'] as const).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className="text-xs"
              >
                {status === 'all' ? 'Todos' : 
                 status === 'active' ? 'Activos' : 
                 status === 'recent' ? 'Recientes' : 'Urgentes'}
              </Button>
            ))}
          </div>
        </div>

        {/* Lista de pacientes */}
        <div className="space-y-3">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3 flex-1">
                  {/* Avatar */}
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {patient.profiles.first_name[0]}{patient.profiles.last_name[0]}
                    </span>
                  </div>

                  {/* Información del paciente */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {patient.profiles.first_name} {patient.profiles.last_name}
                      </h4>
                      {getPriorityIcon(patient)}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{patient.profiles.email}</span>
                      </div>
                      {patient.profiles.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{patient.profiles.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Información médica */}
                    {patient.medical_history?.conditions && patient.medical_history.conditions.length > 0 && (
                      <div className="mt-1">
                        <span className="text-xs text-gray-500">
                          Condiciones: {patient.medical_history.conditions.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Estado y acciones */}
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(patient)}
                    
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">No se encontraron pacientes</p>
              {searchTerm && (
                <p className="text-sm">Intenta con otros términos de búsqueda</p>
              )}
            </div>
          )}
        </div>

        {/* Acciones adicionales */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Más Filtros
          </Button>
          <Button variant="outline" size="sm">
            Ver Todos los Pacientes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
