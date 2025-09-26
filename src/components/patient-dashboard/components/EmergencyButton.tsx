'use client';

import { useState } from 'react';
import { ExclamationTriangleIcon, PhoneIcon } from '@heroicons/react/24/solid';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface EmergencyButtonProps {
  userId: string;
}

export function EmergencyButton({ userId }: EmergencyButtonProps) {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleEmergencyClick = async () => {
    if (isEmergencyMode) {
      // Call emergency services
      window.open('tel:911', '_self');
      
      // Log emergency incident
      try {
        setLoading(true);
        await supabase.from('emergency_incidents').insert({
          patient_id: userId,
          incident_type: 'panic_button',
          description: 'Emergency button activated from patient dashboard',
          location_data: await getCurrentLocation(),
          emergency_services_called: true
        });
      } catch (error) {
        console.error('Error logging emergency incident:', error);
      } finally {
        setLoading(false);
        setIsEmergencyMode(false);
      }
    } else {
      setIsEmergencyMode(true);
      // Auto-reset after 5 seconds if not confirmed
      setTimeout(() => setIsEmergencyMode(false), 5000);
    }
  };

  const getCurrentLocation = (): Promise<any> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          () => resolve(null)
        );
      } else {
        resolve(null);
      }
    });
  };

  return (
    <button
      onClick={handleEmergencyClick}
      disabled={loading}
      className={`
        w-full flex items-center justify-center px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200
        ${isEmergencyMode 
          ? 'bg-red-600 hover:bg-red-700 animate-pulse shadow-lg' 
          : 'bg-red-500 hover:bg-red-600'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isEmergencyMode ? (
        <>
          <PhoneIcon className="w-5 h-5 mr-2" />
          ¡LLAMAR 911!
        </>
      ) : (
        <>
          <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
          Emergencia
        </>
      )}
    </button>
  );
}
