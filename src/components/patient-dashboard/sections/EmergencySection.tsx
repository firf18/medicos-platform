'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ExclamationTriangleIcon,
  PhoneIcon,
  UserIcon,
  HeartIcon,
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface EmergencySectionProps {
  userId: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number;
  is_active: boolean;
}

interface EmergencyMedicalInfo {
  blood_type: string | null;
  allergies: string[];
  chronic_conditions: string[];
  current_medications: any[];
  emergency_notes: string | null;
  organ_donor: boolean;
  emergency_physician_name: string | null;
  emergency_physician_phone: string | null;
  insurance_info: any;
}

export function EmergencySection({ userId }: EmergencySectionProps) {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [medicalInfo, setMedicalInfo] = useState<EmergencyMedicalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contacts' | 'medical' | 'incidents'>('contacts');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchEmergencyData();
  }, [userId]);

  const fetchEmergencyData = async () => {
    try {
      // Fetch emergency contacts
      const { data: contacts } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('patient_id', userId)
        .eq('is_active', true)
        .order('priority', { ascending: true });

      // Fetch emergency medical info
      const { data: medical } = await supabase
        .from('emergency_medical_info')
        .select('*')
        .eq('patient_id', userId)
        .single();

      setEmergencyContacts(contacts || []);
      setMedicalInfo(medical);
    } catch (error) {
      console.error('Error fetching emergency data:', error);
    } finally {
      setLoading(false);
    }
  };

  const callEmergencyServices = () => {
    if (confirm('¿Estás seguro de que quieres llamar a servicios de emergencia?')) {
      window.open('tel:911', '_self');
      
      // Log the emergency incident
      supabase.from('emergency_incidents').insert({
        patient_id: userId,
        incident_type: 'emergency_call',
        description: 'Emergency services called from dashboard',
        emergency_services_called: true
      });
    }
  };

  const callContact = (phone: string, name: string) => {
    window.open(`tel:${phone}`, '_self');
    
    // Log the contact call
    supabase.from('emergency_incidents').insert({
      patient_id: userId,
      incident_type: 'contact_call',
      description: `Called emergency contact: ${name}`,
      contacts_notified: [name]
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-64"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Información de Emergencia</h1>
          <p className="text-gray-600 mt-1">
            Información crítica para situaciones de emergencia
          </p>
        </div>
        
        {/* Emergency Call Button */}
        <button
          onClick={callEmergencyServices}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 flex items-center space-x-2 font-semibold"
        >
          <PhoneIcon className="w-5 h-5" />
          <span>Llamar 911</span>
        </button>
      </div>

      {/* Critical Alert */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-900">En caso de emergencia</h3>
            <p className="text-sm text-red-700 mt-1">
              Esta información está disponible para paramédicos y personal médico de emergencia. 
              Mantén actualizada tu información médica crítica.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'contacts', label: 'Contactos de Emergencia', icon: PhoneIcon },
            { id: 'medical', label: 'Información Médica', icon: HeartIcon },
            { id: 'incidents', label: 'Historial de Incidentes', icon: DocumentTextIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Contactos de Emergencia</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <PlusIcon className="w-5 h-5" />
              <span>Agregar Contacto</span>
            </button>
          </div>

          {emergencyContacts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <PhoneIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes contactos de emergencia</h3>
              <p className="text-gray-600 mb-6">
                Agrega contactos que puedan ser notificados en caso de emergencia
              </p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                Agregar Primer Contacto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.relationship}</p>
                      </div>
                    </div>
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                      Prioridad {contact.priority}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-medium">{contact.phone}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => callContact(contact.phone, contact.name)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                      >
                        <PhoneIcon className="w-4 h-4" />
                        <span>Llamar</span>
                      </button>
                      <button className="text-gray-400 hover:text-blue-600 p-1">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600 p-1">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'medical' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Información Médica de Emergencia</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <PencilIcon className="w-5 h-5" />
              <span>Editar Información</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Medical Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Tipo de Sangre</label>
                  <p className="text-gray-900">{medicalInfo?.blood_type || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Donante de Órganos</label>
                  <p className="text-gray-900">{medicalInfo?.organ_donor ? 'Sí' : 'No'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Médico de Emergencia</label>
                  <p className="text-gray-900">{medicalInfo?.emergency_physician_name || 'No especificado'}</p>
                  {medicalInfo?.emergency_physician_phone && (
                    <p className="text-sm text-gray-600">{medicalInfo.emergency_physician_phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Allergies and Conditions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alergias y Condiciones</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Alergias</label>
                  {medicalInfo?.allergies && medicalInfo.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {medicalInfo.allergies.map((allergy, index) => (
                        <span key={index} className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No hay alergias registradas</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Condiciones Crónicas</label>
                  {medicalInfo?.chronic_conditions && medicalInfo.chronic_conditions.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {medicalInfo.chronic_conditions.map((condition, index) => (
                        <span key={index} className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                          {condition}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No hay condiciones crónicas registradas</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Notes */}
          {medicalInfo?.emergency_notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas de Emergencia</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{medicalInfo.emergency_notes}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Historial de Incidentes</h3>
          <p className="text-gray-600">
            Esta funcionalidad se implementará en la siguiente fase del desarrollo.
          </p>
        </div>
      )}
    </div>
  );
}
