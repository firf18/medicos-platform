'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  UserGroupIcon, 
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  MapPinIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface CareTeamPanelProps {
  userId: string;
  darkMode: boolean;
  realTimeData?: any;
}

interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  hospital: string;
  phone: string;
  email: string;
  address: string;
  isPrimary: boolean;
  isActive: boolean;
  rating: number;
  nextAppointment?: string;
  lastContact?: string;
  notes?: string;
  profileImage?: string;
  availableForVideo: boolean;
  availableForChat: boolean;
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  upcomingAppointments: number;
  averageRating: number;
}

export function CareTeamPanel({ userId, darkMode, realTimeData }: CareTeamPanelProps) {
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalMembers: 0,
    activeMembers: 0,
    upcomingAppointments: 0,
    averageRating: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    specialty: '',
    hospital: '',
    phone: '',
    email: '',
    address: '',
    isPrimary: false,
    notes: ''
  });
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadCareTeam();
  }, [userId]);

  const loadCareTeam = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('patient_care_team')
        .select('*')
        .eq('patient_id', userId)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (error) throw error;

      if (data) {
        const processedTeam: CareTeamMember[] = data.map(member => ({
          id: member.id,
          name: member.doctor_name,
          role: member.role,
          specialty: member.specialty,
          hospital: member.hospital_name || '',
          phone: member.phone || '',
          email: member.email || '',
          address: member.address || '',
          isPrimary: member.is_primary,
          isActive: member.is_active,
          rating: member.rating || 0,
          nextAppointment: member.next_appointment,
          lastContact: member.last_contact,
          notes: member.notes,
          profileImage: member.profile_image,
          availableForVideo: member.available_for_video || false,
          availableForChat: member.available_for_chat || false
        }));

        setCareTeam(processedTeam);
        
        // Calcular estadísticas
        const stats: TeamStats = {
          totalMembers: processedTeam.length,
          activeMembers: processedTeam.filter(m => m.isActive).length,
          upcomingAppointments: processedTeam.filter(m => m.nextAppointment).length,
          averageRating: processedTeam.reduce((sum, m) => sum + m.rating, 0) / processedTeam.length || 0
        };
        
        setTeamStats(stats);
      }

    } catch (error) {
      console.error('Error loading care team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTeamMember = async () => {
    try {
      const memberData = {
        patient_id: userId,
        doctor_name: newMember.name,
        role: newMember.role,
        specialty: newMember.specialty,
        hospital_name: newMember.hospital,
        phone: newMember.phone,
        email: newMember.email,
        address: newMember.address,
        is_primary: newMember.isPrimary,
        is_active: true,
        notes: newMember.notes,
        rating: 0,
        available_for_video: false,
        available_for_chat: false
      };

      const { error } = await supabase
        .from('patient_care_team')
        .insert([memberData]);

      if (error) throw error;

      setNewMember({
        name: '',
        role: '',
        specialty: '',
        hospital: '',
        phone: '',
        email: '',
        address: '',
        isPrimary: false,
        notes: ''
      });
      setShowAddMember(false);
      loadCareTeam();

    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('patient_care_team')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;

      loadCareTeam();

    } catch (error) {
      console.error('Error removing team member:', error);
    }
  };

  const contactMember = (member: CareTeamMember, method: 'phone' | 'email' | 'video' | 'chat') => {
    switch (method) {
      case 'phone':
        window.open(`tel:${member.phone}`, '_self');
        break;
      case 'email':
        window.open(`mailto:${member.email}`, '_self');
        break;
      case 'video':
        console.log('Starting video call with:', member.name);
        break;
      case 'chat':
        console.log('Starting chat with:', member.name);
        break;
    }
  };

  const scheduleAppointment = (memberId: string) => {
    // Redirigir a la página de programación de citas con el doctor seleccionado
    window.location.href = `/appointments/schedule?doctor=${memberId}`;
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'médico de cabecera':
      case 'médico general': 
        return 'text-blue-600 bg-blue-50';
      case 'especialista': 
        return 'text-purple-600 bg-purple-50';
      case 'enfermero': 
      case 'enfermera':
        return 'text-green-600 bg-green-50';
      case 'psicólogo': 
      case 'psiquiatra':
        return 'text-indigo-600 bg-indigo-50';
      case 'fisioterapeuta': 
        return 'text-orange-600 bg-orange-50';
      default: 
        return 'text-gray-600 bg-gray-50';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No programada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Equipo de Cuidado
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {teamStats.activeMembers} miembros activos
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={loadCareTeam}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            <ArrowPathIcon className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            onClick={() => setShowAddMember(true)}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Estadísticas del equipo */}
      <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
        <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Estadísticas del Equipo
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {teamStats.totalMembers}
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Miembros
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {teamStats.activeMembers}
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Activos
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {teamStats.upcomingAppointments}
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Próximas Citas
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {teamStats.averageRating.toFixed(1)}
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Calificación Promedio
            </p>
          </div>
        </div>
      </div>

      {/* Lista del equipo de cuidado */}
      <div className="space-y-3">
        {careTeam.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <UserGroupIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay miembros en tu equipo de cuidado</p>
          </div>
        ) : (
          careTeam.map((member) => (
            <div
              key={member.id}
              className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full ${member.profileImage ? '' : 'bg-blue-500'} flex items-center justify-center`}>
                    {member.profileImage ? (
                      <img
                        src={member.profileImage}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-lg">
                        {member.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {member.name}
                      </h5>
                      {member.isPrimary && (
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                      {member.specialty && (
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {member.specialty}
                        </span>
                      )}
                    </div>
                    {member.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        {renderStars(member.rating)}
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          ({member.rating.toFixed(1)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => removeMember(member.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {member.hospital && (
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-4 h-4 text-gray-500" />
                    <span>{member.hospital}</span>
                  </div>
                )}
                
                {member.nextAppointment && (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-blue-500" />
                    <span>Próxima cita: {formatDate(member.nextAppointment)}</span>
                  </div>
                )}
                
                {member.lastContact && (
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-gray-500" />
                    <span>Último contacto: {formatDate(member.lastContact)}</span>
                  </div>
                )}
              </div>

              {/* Métodos de contacto */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {member.phone && (
                    <button
                      onClick={() => contactMember(member, 'phone')}
                      className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      title="Llamar"
                    >
                      <PhoneIcon className="w-4 h-4" />
                    </button>
                  )}
                  
                  {member.email && (
                    <button
                      onClick={() => contactMember(member, 'email')}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      title="Enviar email"
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                    </button>
                  )}
                  
                  {member.availableForVideo && (
                    <button
                      onClick={() => contactMember(member, 'video')}
                      className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                      title="Video llamada"
                    >
                      <VideoCameraIcon className="w-4 h-4" />
                    </button>
                  )}
                  
                  {member.availableForChat && (
                    <button
                      onClick={() => contactMember(member, 'chat')}
                      className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                      title="Chat"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => scheduleAppointment(member.id)}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
                >
                  Agendar Cita
                </button>
              </div>

              {/* Información adicional expandible */}
              {selectedMember === member.id && (
                <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-50'} border ${darkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className="space-y-2 text-sm">
                    {member.address && (
                      <p>
                        <strong>Dirección:</strong> {member.address}
                      </p>
                    )}
                    {member.phone && (
                      <p>
                        <strong>Teléfono:</strong> {member.phone}
                      </p>
                    )}
                    {member.email && (
                      <p>
                        <strong>Email:</strong> {member.email}
                      </p>
                    )}
                    {member.notes && (
                      <p>
                        <strong>Notas:</strong> {member.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                className={`mt-2 w-full text-xs ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
              >
                {selectedMember === member.id ? 'Ocultar detalles' : 'Ver más detalles'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal para agregar miembro */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96 max-w-full mx-4 max-h-[80vh] overflow-y-auto`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Agregar Miembro del Equipo
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Dr. Juan Pérez"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Rol
                </label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="">Seleccionar rol</option>
                  <option value="Médico de cabecera">Médico de cabecera</option>
                  <option value="Especialista">Especialista</option>
                  <option value="Enfermero">Enfermero/a</option>
                  <option value="Psicólogo">Psicólogo/a</option>
                  <option value="Fisioterapeuta">Fisioterapeuta</option>
                  <option value="Nutricionista">Nutricionista</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Especialidad
                </label>
                <input
                  type="text"
                  value={newMember.specialty}
                  onChange={(e) => setNewMember(prev => ({ ...prev, specialty: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Cardiología, Neurología, etc."
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Hospital/Clínica
                </label>
                <input
                  type="text"
                  value={newMember.hospital}
                  onChange={(e) => setNewMember(prev => ({ ...prev, hospital: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Hospital General"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="doctor@hospital.com"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={newMember.isPrimary}
                  onChange={(e) => setNewMember(prev => ({ ...prev, isPrimary: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isPrimary" className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Médico principal
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddMember(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} text-gray-900 transition-colors`}
              >
                Cancelar
              </button>
              <button
                onClick={addTeamMember}
                disabled={!newMember.name || !newMember.role}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
