'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Clock, 
  AlertCircle, 
  Shield, 
  User, 
  FileText,
  Stethoscope,
  LayoutDashboard,
  MessageCircle
} from 'lucide-react';
import { RegistrationStep } from '@/types/medical/specialties';
import { DoctorRegistrationData } from '@/types/medical/specialties';

interface RegistrationNotificationsProps {
  currentStep: RegistrationStep;
  registrationData: DoctorRegistrationData;
  verificationStatus?: 'pending' | 'verified' | 'failed';
}

export default function RegistrationNotifications({
  currentStep,
  registrationData,
  verificationStatus
}: RegistrationNotificationsProps) {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    icon: React.ReactNode;
    timestamp: Date;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>>([]);

  // Efecto para mostrar notificaciones basadas en el progreso del registro
  useEffect(() => {
    const newNotifications = [];
    
    // Notificaciones basadas en el paso actual
    switch (currentStep) {
      case 'personal_info':
        if (registrationData.firstName && registrationData.lastName) {
          newNotifications.push({
            id: 'name-complete',
            type: 'success',
            title: 'Nombre completo',
            message: 'Has completado tu nombre correctamente',
            icon: <User className="h-4 w-4" />,
            timestamp: new Date()
          });
        }
        break;
        
      case 'professional_info':
        if (registrationData.licenseNumber) {
          newNotifications.push({
            id: 'license-complete',
            type: 'success',
            title: 'Cédula profesional',
            message: 'Número de cédula profesional ingresado',
            icon: <FileText className="h-4 w-4" />,
            timestamp: new Date()
          });
        }
        break;
        
      case 'specialty_selection':
        if (registrationData.specialtyId) {
          newNotifications.push({
            id: 'specialty-complete',
            type: 'success',
            title: 'Especialidad seleccionada',
            message: 'Has seleccionado tu especialidad médica',
            icon: <Stethoscope className="h-4 w-4" />,
            timestamp: new Date()
          });
        }
        break;
        
      case 'identity_verification':
        if (verificationStatus === 'verified') {
          newNotifications.push({
            id: 'verification-complete',
            type: 'success',
            title: 'Verificación completada',
            message: 'Tu identidad ha sido verificada exitosamente',
            icon: <Shield className="h-4 w-4" />,
            timestamp: new Date(),
            action: {
              label: 'Ver resultados',
              onClick: () => {
                // Desplazar a la sección de resultados de verificación
                document.getElementById('verification-results')?.scrollIntoView({ behavior: 'smooth' });
              }
            }
          });
        } else if (verificationStatus === 'failed') {
          newNotifications.push({
            id: 'verification-failed',
            type: 'error',
            title: 'Verificación fallida',
            message: 'La verificación de identidad no pudo completarse',
            icon: <AlertCircle className="h-4 w-4" />,
            timestamp: new Date(),
            action: {
              label: 'Reintentar',
              onClick: () => {
                // Reintentar verificación
                const retryButton = document.querySelector('[data-retry-button]');
                if (retryButton) {
                  (retryButton as HTMLButtonElement).click();
                }
              }
            }
          });
        }
        break;
        
      case 'dashboard_configuration':
        if (registrationData.selectedFeatures.length > 0) {
          newNotifications.push({
            id: 'features-selected',
            type: 'success',
            title: 'Características seleccionadas',
            message: `Has seleccionado ${registrationData.selectedFeatures.length} características para tu dashboard`,
            icon: <LayoutDashboard className="h-4 w-4" />,
            timestamp: new Date()
          });
        }
        break;
    }
    
    // Notificación de progreso general
    const progressPercentage = Math.min(100, Math.floor(
      (Object.keys(registrationData).filter(key => 
        registrationData[key as keyof DoctorRegistrationData] !== '' && 
        registrationData[key as keyof DoctorRegistrationData] !== undefined &&
        registrationData[key as keyof DoctorRegistrationData] !== null
      ).length / Object.keys(registrationData).length) * 100
    ));
    
    if (progressPercentage > 0) {
      newNotifications.push({
        id: 'progress-update',
        type: 'info',
        title: 'Progreso del registro',
        message: `Has completado aproximadamente el ${progressPercentage}% de tu registro`,
        icon: <Clock className="h-4 w-4" />,
        timestamp: new Date()
      });
    }
    
    setNotifications(newNotifications);
  }, [currentStep, registrationData, verificationStatus]);

  // Efecto para mostrar toasts cuando hay notificaciones
  useEffect(() => {
    notifications.forEach(notification => {
      // Solo mostrar toasts para notificaciones importantes
      if (notification.type === 'success' || notification.type === 'error') {
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === 'error' ? 'destructive' : 'default'
        });
      }
    });
  }, [notifications]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {notifications.map(notification => (
        <Alert 
          key={notification.id} 
          className={`
            ${notification.type === 'success' ? 'bg-green-50 border-green-200' : ''}
            ${notification.type === 'error' ? 'bg-red-50 border-red-200' : ''}
            ${notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : ''}
            ${notification.type === 'info' ? 'bg-blue-50 border-blue-200' : ''}
          `}
        >
          <div className="flex items-start">
            <div className={`
              mt-0.5 mr-3
              ${notification.type === 'success' ? 'text-green-600' : ''}
              ${notification.type === 'error' ? 'text-red-600' : ''}
              ${notification.type === 'warning' ? 'text-yellow-600' : ''}
              ${notification.type === 'info' ? 'text-blue-600' : ''}
            `}>
              {notification.icon}
            </div>
            <div className="flex-1">
              <AlertTitle className={`
                ${notification.type === 'success' ? 'text-green-800' : ''}
                ${notification.type === 'error' ? 'text-red-800' : ''}
                ${notification.type === 'warning' ? 'text-yellow-800' : ''}
                ${notification.type === 'info' ? 'text-blue-800' : ''}
              `}>
                {notification.title}
              </AlertTitle>
              <AlertDescription className={`
                ${notification.type === 'success' ? 'text-green-700' : ''}
                ${notification.type === 'error' ? 'text-red-700' : ''}
                ${notification.type === 'warning' ? 'text-yellow-700' : ''}
                ${notification.type === 'info' ? 'text-blue-700' : ''}
              `}>
                {notification.message}
              </AlertDescription>
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className={`mt-2 text-sm font-medium ${
                    notification.type === 'success' ? 'text-green-700 hover:text-green-800' : ''
                    } ${
                    notification.type === 'error' ? 'text-red-700 hover:text-red-800' : ''
                    } ${
                    notification.type === 'warning' ? 'text-yellow-700 hover:text-yellow-800' : ''
                    } ${
                    notification.type === 'info' ? 'text-blue-700 hover:text-blue-800' : ''
                  }`}
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            <div className="text-xs text-gray-500 ml-2">
              {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </Alert>
      ))}
      
      {/* Botón de soporte en vivo */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => {
            toast({
              title: 'Soporte en vivo',
              description: 'Conectando con un agente de soporte...'
            });
            // Aquí se implementaría la conexión con el sistema de soporte en vivo
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Soporte</span>
        </button>
      </div>
    </div>
  );
}
