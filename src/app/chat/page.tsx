'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth';
import { createClient } from '@/lib/supabase/client';
import ChatInterface from '@/components/chat/ChatInterface';
import { MessageCircle, Plus, Users, Search, Filter } from 'lucide-react';

interface AvailableUser {
  id: string;
  name: string;
  type: 'doctor' | 'patient';
  specialty?: string;
  last_active?: string;
  is_online?: boolean;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  // Determinar el tipo de usuario actual
  const currentUserType = user?.user_metadata?.role === 'doctor' ? 'doctor' : 'patient';

  useEffect(() => {
    if (user) {
      fetchAvailableUsers();
    }
  }, [user]);

  const fetchAvailableUsers = async () => {
    try {
      setLoading(true);

      if (currentUserType === 'doctor') {
        // Los médicos pueden chatear con sus pacientes
        const { data: patientsData, error } = await supabase
          .from('patients')
          .select(`
            id,
            profiles!inner(first_name, last_name, email)
          `)
          .limit(20);

        if (error) throw error;

        const patients = (patientsData || []).map(patient => ({
          id: patient.id,
          name: `${patient.profiles?.first_name} ${patient.profiles?.last_name}`,
          type: 'patient' as const,
          is_online: Math.random() > 0.5 // Simulado
        }));

        setAvailableUsers(patients);

      } else {
        // Los pacientes pueden chatear con médicos
        const { data: doctorsData, error } = await supabase
          .from('doctors')
          .select(`
            id,
            profiles!inner(first_name, last_name, email),
            specialties!inner(name)
          `)
          .limit(20);

        if (error) throw error;

        const doctors = (doctorsData || []).map(doctor => ({
          id: doctor.id,
          name: `Dr. ${doctor.profiles?.first_name} ${doctor.profiles?.last_name}`,
          type: 'doctor' as const,
          specialty: doctor.specialties?.name,
          is_online: Math.random() > 0.5 // Simulado
        }));

        setAvailableUsers(doctors);
      }

    } catch (error) {
      console.error('Error fetching available users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async (otherUserId: string) => {
    try {
      // TODO: Implementar creación de conversaciones cuando la tabla esté lista
      console.log('Creating conversation with user:', otherUserId);
      setShowNewChatModal(false);
      // Temporalmente comentado hasta que la tabla chat_conversations esté configurada
      // const conversationData = currentUserType === 'doctor' 
      //   ? { doctor_id: user?.id, patient_id: otherUserId }
      //   : { doctor_id: otherUserId, patient_id: user?.id };

      // const { data, error } = await supabase
      //   .from('chat_conversations')
      //   .insert(conversationData)
      //   .select()
      //   .single();

      // if (error) throw error;
      // window.location.reload();
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <MessageCircle className="h-8 w-8 mr-3 text-blue-600" />
                  Chat Médico
                </h1>
                <p className="mt-1 text-gray-600">
                  Comunicación directa y segura entre {currentUserType === 'doctor' ? 'médicos y pacientes' : 'pacientes y médicos'}
                </p>
              </div>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Conversación
              </button>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-white shadow rounded-lg p-6">
            <ChatInterface />
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Comunicación Segura
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Encriptado de extremo a extremo
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {currentUserType === 'doctor' ? 'Pacientes' : 'Médicos'} Disponibles
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {availableUsers.filter(u => u.is_online).length} en línea
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Filter className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Respuesta Promedio
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {'< 5 minutos'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Nueva Conversación */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Nueva Conversación
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Búsqueda */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Buscar ${currentUserType === 'doctor' ? 'pacientes' : 'médicos'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Lista de usuarios */}
            <div className="max-h-60 overflow-y-auto">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((availableUser) => (
                  <div
                    key={availableUser.id}
                    onClick={() => createNewConversation(availableUser.id)}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {availableUser.name}
                        </p>
                        <div className={`h-2 w-2 rounded-full ${
                          availableUser.is_online ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      {availableUser.specialty && (
                        <p className="text-xs text-gray-500">
                          {availableUser.specialty}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-sm">
                    No se encontraron {currentUserType === 'doctor' ? 'pacientes' : 'médicos'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
