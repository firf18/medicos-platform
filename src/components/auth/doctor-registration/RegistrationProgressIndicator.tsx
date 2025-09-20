'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  FileText, 
  Stethoscope, 
  Shield, 
  LayoutDashboard, 
  CheckCircle,
  IdCard
} from 'lucide-react';
import { useRegistrationPersistence } from '@/hooks/useRegistrationPersistence';
import { DoctorRegistrationData, RegistrationProgress } from '@/types/medical/specialties';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 'personal_info', title: 'Información Personal', icon: User },
  { id: 'professional_info', title: 'Información Profesional', icon: FileText },
  { id: 'license_verification', title: 'Verificación SACs', icon: IdCard },
  { id: 'specialty_selection', title: 'Especialidad Médica', icon: Stethoscope },
  { id: 'dashboard_configuration', title: 'Configuración del Dashboard', icon: LayoutDashboard },
  { id: 'identity_verification', title: 'Verificación Didit', icon: Shield }
];

interface RegistrationProgressIndicatorProps {
  onContinue?: (data: DoctorRegistrationData, progress: RegistrationProgress) => void;
}

export default function RegistrationProgressIndicator({ 
  onContinue 
}: RegistrationProgressIndicatorProps) {
  const router = useRouter();
  const { hasSavedProgress, loadProgress, clearProgress } = useRegistrationPersistence();
  const [savedData, setSavedData] = useState<{
    data: DoctorRegistrationData | null;
    progress: RegistrationProgress | null;
  }>({ data: null, progress: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (hasSavedProgress) {
      const { data, progress } = loadProgress();
      setSavedData({ data, progress });
    }
    setIsLoading(false);
  }, [hasSavedProgress, loadProgress]);

  const handleContinue = () => {
    if (savedData.data && savedData.progress && onContinue) {
      onContinue(savedData.data, savedData.progress);
    } else {
      // Redirigir a la página de registro de médicos
      router.push('/register/doctor');
    }
  };

  const handleClearProgress = () => {
    clearProgress();
    setSavedData({ data: null, progress: null });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasSavedProgress || !savedData.data || !savedData.progress) {
    return null;
  }

  const progressPercentage = ((savedData.progress.completedSteps.length + 1) / STEPS.length) * 100;
  const currentStep = savedData.progress.currentStep;
  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep);

  return (
    <Card className="mb-6 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center text-yellow-800">
          <CheckCircle className="h-5 w-5 mr-2" />
          Progreso Guardado Encontrado
        </CardTitle>
        <CardDescription>
          Hemos encontrado un registro incompleto. ¿Te gustaría continuar donde lo dejaste?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progreso del registro</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Último paso: {STEPS[currentStepIndex]?.title}
              </p>
              <p className="text-xs text-gray-500">
                Guardado: Recientemente
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleContinue} size="sm">
                Continuar
              </Button>
              <Button onClick={handleClearProgress} variant="outline" size="sm">
                Empezar de nuevo
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}