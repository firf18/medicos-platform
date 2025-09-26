'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Lightbulb,
  CheckCircle,
  User,
  FileText,
  Stethoscope,
  Shield,
  LayoutDashboard
} from 'lucide-react';
import { RegistrationStep } from '@/types/medical/specialties';

interface TutorialStep {
  id: RegistrationStep | 'welcome' | 'complete';
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
}

interface InteractiveTutorialProps {
  currentStep: RegistrationStep;
  isVisible: boolean;
  onComplete: () => void;
  onDismiss: () => void;
}

export default function InteractiveTutorial({
  currentStep,
  isVisible,
  onComplete,
  onDismiss
}: InteractiveTutorialProps) {
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Bienvenido al Registro de Médicos',
      description: 'Te guiaremos paso a paso para completar tu registro en Red-Salud.',
      icon: <Lightbulb className="h-6 w-6" />,
      tips: [
        'Completa todos los pasos para verificar tu identidad profesional',
        'Tus datos están protegidos con los más altos estándares de seguridad',
        'Puedes guardar tu progreso y continuar más tarde'
      ]
    },
    {
      id: 'personal_info',
      title: 'Información Personal',
      description: 'Comienza ingresando tus datos personales básicos.',
      icon: <User className="h-6 w-6" />,
      tips: [
        'Asegúrate de ingresar tu nombre completo correctamente',
        'Usa un email profesional que revises regularmente',
        'El teléfono debe ser un número venezolano válido (+58)'
      ]
    },
    {
      id: 'professional_info',
      title: 'Información Profesional',
      description: 'Ingresa los detalles de tu licencia médica y experiencia.',
      icon: <FileText className="h-6 w-6" />,
      tips: [
        'Verifica que tu número de cédula profesional sea correcto',
        'La fecha de expiración debe ser futura',
        'Tu biografía debe describir tu experiencia y especialidades'
      ]
    },
    {
      id: 'specialty_selection',
      title: 'Selección de Especialidad',
      description: 'Elige tu especialidad médica y características del dashboard.',
      icon: <Stethoscope className="h-6 w-6" />,
      tips: [
        'Selecciona solo tus especialidades principales',
        'Elige las características que más usarás en tu práctica',
        'Puedes modificar estas selecciones después del registro'
      ]
    },
    {
      id: 'identity_verification',
      title: 'Verificación de Identidad',
      description: 'Verifica tu identidad usando Didit.me para mayor seguridad.',
      icon: <Shield className="h-6 w-6" />,
      tips: [
        'Sigue las instrucciones en la ventana que se abrirá',
        'Ten a mano tu cédula de identidad y licencia profesional',
        'El proceso toma menos de 5 minutos'
      ]
    },
    {
      id: 'dashboard_configuration',
      title: 'Configuración del Dashboard',
      description: 'Personaliza tu dashboard y horarios de trabajo.',
      icon: <LayoutDashboard className="h-6 w-6" />,
      tips: [
        'Configura tus horarios de trabajo realistas',
        'Selecciona las widgets que más te interesen',
        'Puedes cambiar esta configuración después'
      ]
    },
    {
      id: 'final_review',
      title: 'Revisión Final',
      description: 'Revisa toda tu información y acepta los términos.',
      icon: <CheckCircle className="h-6 w-6" />,
      tips: [
        'Verifica cuidadosamente todos tus datos',
        'Lee los términos y condiciones antes de aceptar',
        'Asegúrate de que toda la información sea correcta'
      ]
    },
    {
      id: 'complete',
      title: '¡Registro Completado!',
      description: 'Tu registro se ha completado exitosamente.',
      icon: <CheckCircle className="h-6 w-6" />,
      tips: [
        'Recibirás un email de verificación',
        'Nuestro equipo revisará tu información',
        'Podrás acceder a tu dashboard una vez aprobado'
      ]
    }
  ];

  // Encontrar el índice del paso actual en el tutorial
  useEffect(() => {
    const stepIndex = tutorialSteps.findIndex(step => step.id === currentStep);
    if (stepIndex !== -1) {
      setCurrentTutorialStep(stepIndex);
    }
  }, [currentStep, tutorialSteps]);

  // Marcar paso como completado
  const markStepAsCompleted = (stepId: string) => {
    setCompletedSteps(prev => ({ ...prev, [stepId]: true }));
  };

  // Navegar al siguiente paso
  const goToNextStep = () => {
    markStepAsCompleted(tutorialSteps[currentTutorialStep].id);
    
    if (currentTutorialStep < tutorialSteps.length - 1) {
      setCurrentTutorialStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  // Navegar al paso anterior
  const goToPreviousStep = () => {
    if (currentTutorialStep > 0) {
      setCurrentTutorialStep(prev => prev - 1);
    }
  };

  // Saltar tutorial
  const skipTutorial = () => {
    onDismiss();
  };

  if (!isVisible) return null;

  const currentStepData = tutorialSteps[currentTutorialStep];
  const isLastStep = currentTutorialStep === tutorialSteps.length - 1;
  const isFirstStep = currentTutorialStep === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                {currentStepData.icon}
              </div>
              <div>
                <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDismiss}
              aria-label="Cerrar tutorial"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentTutorialStep + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Paso {currentTutorialStep + 1} de {tutorialSteps.length}</span>
              <span>
                {Object.keys(completedSteps).filter(key => completedSteps[key]).length} completados
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium flex items-center">
              <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
              Consejos para este paso:
            </h3>
            <ul className="space-y-2">
              {currentStepData.tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <Badge variant="secondary" className="mr-2 mt-0.5">
                    {index + 1}
                  </Badge>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={isFirstStep}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                onClick={skipTutorial}
              >
                Saltar
              </Button>
              
              <Button
                onClick={goToNextStep}
              >
                {isLastStep ? 'Finalizar' : 'Siguiente'}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
