'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  UserPlusIcon, 
  UserGroupIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface CaregiversSectionProps {
  userId: string;
}

interface Caregiver {
  id: string;
  caregiver_email: string;
  caregiver_name: string;
  relationship: string;
  access_level: string;
  is_emergency_contact: boolean;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export function CaregiversSection({ userId }: CaregiversSectionProps) {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [, setEditingCaregiver] = useState<Caregiver | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCaregivers();
  }, [userId]);

  const fetchCaregivers = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_caregivers')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCaregivers(data || []);
    } catch (error) {
      console.error('Error fetching caregivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccessLevelLabel = (level: string) => {
    const levels = {
      'full': 'Acceso Completo',
      'basic': 'Acceso Básico',
      'appointments_only': 'Solo Citas',
      'emergency_only': 'Solo Emergencias'
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getAccessLevelColor = (level: string) => {
    const colors = {
      'full': 'bg-green-100 text-green-800',
      'basic': 'bg-blue-100 text-blue-800',
      'appointments_only': 'bg-yellow-100 text-yellow-800',
      'emergency_only': 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const toggleCaregiverStatus = async (caregiverId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('patient_caregivers')
        .update({ is_active: !currentStatus })
        .eq('id', caregiverId);

      if (error) throw error;
      fetchCaregivers();
    } catch (error) {
      console.error('Error updating caregiver status:', error);
    }
  };

  const deleteCaregiver = async (caregiverId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este confidente?')) return;

    try {
      const { error } = await supabase
        .from('patient_caregivers')
        .delete()
        .eq('id', caregiverId);

      if (error) throw error;
      fetchCaregivers();
    } catch (error) {
      console.error('Error deleting caregiver:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-64"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Confidentes y Cuidadores</h1>
          <p className="text-gray-600 mt-1">
            Gestiona quién puede acceder a tu información médica
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <UserPlusIcon className="w-5 h-5" />
          <span>Agregar Confidente</span>
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Información Importante</h3>
            <p className="text-sm text-blue-700 mt-1">
              Los confidentes pueden acceder a tu información médica según el nivel de acceso que les asignes. 
              Puedes revocar el acceso en cualquier momento.
            </p>
          </div>
        </div>
      </div>

      {/* Caregivers List */}
      {caregivers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes confidentes</h3>
          <p className="text-gray-600 mb-6">
            Agrega familiares o cuidadores para que puedan ayudarte con tu información médica
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Agregar Primer Confidente
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {caregivers.map((caregiver) => (
            <div key={caregiver.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {caregiver.caregiver_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {caregiver.caregiver_name}
                    </h3>
                    <p className="text-gray-600">{caregiver.caregiver_email}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-sm text-gray-500">
                        {caregiver.relationship}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(caregiver.access_level)}`}>
                        {getAccessLevelLabel(caregiver.access_level)}
                      </span>
                      {caregiver.is_emergency_contact && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Contacto de Emergencia
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status Indicators */}
                  <div className="flex flex-col items-end space-y-1">
                    {isExpired(caregiver.expires_at) ? (
                      <span className="flex items-center text-red-600 text-sm">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Expirado
                      </span>
                    ) : caregiver.is_active ? (
                      <span className="flex items-center text-green-600 text-sm">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Activo
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-500 text-sm">
                        Inactivo
                      </span>
                    )}
                    
                    {caregiver.expires_at && !isExpired(caregiver.expires_at) && (
                      <span className="text-xs text-gray-500">
                        Expira: {new Date(caregiver.expires_at).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingCaregiver(caregiver)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleCaregiverStatus(caregiver.id, caregiver.is_active)}
                      className={`p-2 rounded-lg ${
                        caregiver.is_active 
                          ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {caregiver.is_active ? (
                        <ExclamationTriangleIcon className="w-5 h-5" />
                      ) : (
                        <CheckCircleIcon className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteCaregiver(caregiver.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Agregado:</span> {' '}
                    {new Date(caregiver.created_at).toLocaleDateString('es-ES')}
                  </div>
                  <div>
                    <span className="font-medium">Nivel de Acceso:</span> {' '}
                    {getAccessLevelLabel(caregiver.access_level)}
                  </div>
                  <div>
                    <span className="font-medium">Estado:</span> {' '}
                    {caregiver.is_active ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal would go here */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Agregar Confidente</h3>
            <p className="text-gray-600 mb-4">
              Esta funcionalidad se implementará en la siguiente fase del desarrollo.
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
