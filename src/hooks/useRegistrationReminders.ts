/**
 * Hook personalizado para recordatorios automáticos en el registro de médicos - Red-Salud
 * 
 * Este hook maneja los recordatorios automáticos para continuar con el registro
 * incompleto, enviando notificaciones push y emails cuando sea necesario.
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { DoctorRegistrationData, RegistrationProgress } from '@/types/medical/specialties';

interface UseRegistrationRemindersProps {
  registrationData: DoctorRegistrationData;
  progress: RegistrationProgress;
  isActive: boolean;
}

interface UseRegistrationRemindersReturn {
  sendReminder: () => void;
  timeUntilNextReminder: number | null;
  isReminderDue: boolean;
}

const REMINDER_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
const STORAGE_KEY = 'doctor_registration_reminder';

export function useRegistrationReminders({
  registrationData,
  progress,
  isActive
}: UseRegistrationRemindersProps): UseRegistrationRemindersReturn {
  const [timeUntilNextReminder, setTimeUntilNextReminder] = useState<number | null>(null);
  const [isReminderDue, setIsReminderDue] = useState(false);

  // Calcular progreso del registro
  const calculateProgress = useCallback(() => {
    const totalFields = Object.keys(registrationData).length;
    const completedFields = Object.keys(registrationData).filter(key => 
      registrationData[key as keyof DoctorRegistrationData] !== '' && 
      registrationData[key as keyof DoctorRegistrationData] !== undefined &&
      registrationData[key as keyof DoctorRegistrationData] !== null
    ).length;
    
    return Math.min(100, Math.floor((completedFields / totalFields) * 100));
  }, [registrationData]);

  // Verificar si es momento de enviar recordatorio
  const checkReminderDue = useCallback(() => {
    if (!isActive) return false;
    
    const progressPercentage = calculateProgress();
    
    // No enviar recordatorios si el registro está completo
    if (progressPercentage >= 100) return false;
    
    // No enviar recordatorios si ya se completó el registro
    if (progress.currentStep === 'completed') return false;
    
    // Verificar si ya se envió un recordatorio reciente
    const lastReminder = localStorage.getItem(STORAGE_KEY);
    if (lastReminder) {
      const lastReminderTime = parseInt(lastReminder, 10);
      const timeSinceLastReminder = Date.now() - lastReminderTime;
      
      // Si han pasado menos de 24 horas, no enviar recordatorio
      if (timeSinceLastReminder < REMINDER_INTERVAL) {
        setTimeUntilNextReminder(REMINDER_INTERVAL - timeSinceLastReminder);
        return false;
      }
    }
    
    // Si el progreso es menor al 50% y han pasado 24 horas, enviar recordatorio
    return progressPercentage < 50;
  }, [isActive, calculateProgress, progress.currentStep]);

  // Enviar recordatorio
  const sendReminder = useCallback(() => {
    const progressPercentage = calculateProgress();
    
    // Mostrar notificación push
    toast({
      title: 'Continúa tu registro',
      description: `Has completado el ${progressPercentage}% de tu registro. Continúa donde lo dejaste para terminar.`,
      variant: 'default'
    });
    
    // Guardar timestamp del recordatorio
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    
    // En una implementación real, aquí se enviaría un email de recordatorio
    console.log('[REMINDER] Enviando recordatorio de registro', {
      progressPercentage,
      currentStep: progress.currentStep,
      email: registrationData.email
    });
    
    // Marcar que el recordatorio ya se envió
    setIsReminderDue(false);
    setTimeUntilNextReminder(REMINDER_INTERVAL);
  }, [calculateProgress, progress.currentStep, registrationData.email]);

  // Efecto para verificar si es momento de enviar recordatorio
  useEffect(() => {
    if (!isActive) return;
    
    const reminderDue = checkReminderDue();
    setIsReminderDue(reminderDue);
    
    // Si es momento de enviar recordatorio, hacerlo automáticamente
    if (reminderDue) {
      sendReminder();
    }
    
    // Configurar intervalo para verificar recordatorios
    const interval = setInterval(() => {
      const reminderDue = checkReminderDue();
      setIsReminderDue(reminderDue);
    }, 60000); // Verificar cada minuto
    
    return () => clearInterval(interval);
  }, [isActive, checkReminderDue, sendReminder]);

  return {
    sendReminder,
    timeUntilNextReminder,
    isReminderDue
  };
}