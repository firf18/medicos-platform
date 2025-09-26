'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ExclamationTriangleIcon, 
  PhoneIcon, 
  MapPinIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  ShieldCheckIcon,
  BellIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon as ExclamationTriangleSolidIcon } from '@heroicons/react/24/solid';

interface EmergencyQuickAccessProps {
  userId: string;
  darkMode: boolean;
  realTimeData?: any;
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
  isAvailable: boolean;
}

interface EmergencyInfo {
  bloodType: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  insuranceInfo: string;
  emergencyInstructions: string;
}

export function EmergencyQuickAccess({ userId, darkMode, realTimeData }: EmergencyQuickAccessProps) {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showEditInfo, setShowEditInfo] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    isPrimary: false
  });
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadEmergencyData();
  }, [userId]);

  const loadEmergencyData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar contactos de emergencia
      const { data: contacts, error: contactsError } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('patient_id', userId)
        .order('is_primary', { ascending: false });

      if (contactsError) throw contactsError;

      if (contacts) {
        setEmergencyContacts(contacts.map(contact => ({
          id: contact.id,
          name: contact.name,
          relationship: contact.relationship,
          phone: contact.phone,
          isPrimary: contact.is_primary,
          isAvailable: contact.is_available
        })));
      }

      // Cargar información de emergencia
      const { data: info, error: infoError } = await supabase
        .from('patient_emergency_info')
        .select('*')
        .eq('patient_id', userId)
        .single();

      if (infoError && infoError.code !== 'PGRST116') throw infoError;

      if (info) {
        setEmergencyInfo({
          bloodType: info.blood_type || '',
          allergies: info.allergies || [],
          medications: info.current_medications || [],
          conditions: info.medical_conditions || [],
          insuranceInfo: info.insurance_info || '',
          emergencyInstructions: info.emergency_instructions || ''
        });
      }

    } catch (error) {
      console.error('Error loading emergency data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addEmergencyContact = async () => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .insert([{
          patient_id: userId,
          name: newContact.name,
          relationship: newContact.relationship,
          phone: newContact.phone,
          is_primary: newContact.isPrimary,
          is_available: true
        }]);

      if (error) throw error;

      setNewContact({ name: '', relationship: '', phone: '', isPrimary: false });
      setShowAddContact(false);
      loadEmergencyData();

    } catch (error) {
      console.error('Error adding emergency contact:', error);
    }
  };

  const deleteEmergencyContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      loadEmergencyData();

    } catch (error) {
      console.error('Error deleting emergency contact:', error);
    }
  };

  const callEmergencyContact = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const callEmergencyServices = () => {
    // Número de emergencia local (911 en muchos países)
    window.open('tel:911', '_self');
  };

  const shareEmergencyInfo = async () => {
    if (!emergencyInfo) return;

    const infoText = `
INFORMACIÓN MÉDICA DE EMERGENCIA
================================

Tipo de Sangre: ${emergencyInfo.bloodType}
Alergias: ${emergencyInfo.allergies.join(', ')}
Medicamentos: ${emergencyInfo.medications.join(', ')}
Condiciones: ${emergencyInfo.conditions.join(', ')}
Seguro: ${emergencyInfo.insuranceInfo}

Instrucciones: ${emergencyInfo.emergencyInstructions}

Contactos de Emergencia:
${emergencyContacts.map(c => `- ${c.name} (${c.relationship}): ${c.phone}`).join('\n')}
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Información Médica de Emergencia',
          text: infoText
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(infoText);
      alert('Información copiada al portapapeles');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Emergencias
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Acceso rápido en caso de emergencia
          </p>
        </div>
        
        <button
          onClick={() => setShowAddContact(true)}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Botón de emergencia principal */}
      <div className="text-center">
        <button
          onClick={callEmergencyServices}
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-lg transition-colors flex items-center justify-center space-x-3"
        >
          <ExclamationTriangleSolidIcon className="w-8 h-8" />
          <span>LLAMAR SERVICIOS DE EMERGENCIA</span>
        </button>
        <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Presiona en caso de emergencia médica
        </p>
      </div>

      {/* Contactos de emergencia */}
      <div>
        <h4 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Contactos de Emergencia
        </h4>
        
        {emergencyContacts.length === 0 ? (
          <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <UserIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay contactos de emergencia</p>
          </div>
        ) : (
          <div className="space-y-2">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {contact.isPrimary ? (
                        <StarIcon className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h5 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {contact.name}
                      </h5>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {contact.relationship}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => callEmergencyContact(contact.phone)}
                      className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      <PhoneIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEmergencyContact(contact.id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 flex items-center space-x-1">
                  <PhoneIcon className="w-3 h-3 text-gray-500" />
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {contact.phone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información médica de emergencia */}
      {emergencyInfo && (
        <div className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-blue-900'}`}>
              Información Médica
            </h4>
            <button
              onClick={shareEmergencyInfo}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Compartir
            </button>
          </div>
          
          <div className="space-y-1 text-xs">
            {emergencyInfo.bloodType && (
              <div className="flex items-center space-x-2">
                <HeartIcon className="w-3 h-3 text-red-500" />
                <span className={darkMode ? 'text-gray-300' : 'text-blue-800'}>
                  Tipo de sangre: {emergencyInfo.bloodType}
                </span>
              </div>
            )}
            
            {emergencyInfo.allergies.length > 0 && (
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-3 h-3 text-orange-500" />
                <span className={darkMode ? 'text-gray-300' : 'text-blue-800'}>
                  Alergias: {emergencyInfo.allergies.join(', ')}
                </span>
              </div>
            )}
            
            {emergencyInfo.medications.length > 0 && (
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-3 h-3 text-green-500" />
                <span className={darkMode ? 'text-gray-300' : 'text-blue-800'}>
                  Medicamentos: {emergencyInfo.medications.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para agregar contacto */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96 max-w-full mx-4`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Agregar Contacto de Emergencia
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Nombre completo"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Relación
                </label>
                <input
                  type="text"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Ej: Esposo/a, Hijo/a, Amigo/a"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={newContact.isPrimary}
                  onChange={(e) => setNewContact(prev => ({ ...prev, isPrimary: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isPrimary" className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contacto principal
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddContact(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} text-gray-900 transition-colors`}
              >
                Cancelar
              </button>
              <button
                onClick={addEmergencyContact}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
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
