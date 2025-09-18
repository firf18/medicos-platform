'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  FileText, 
  Stethoscope, 
  Shield, 
  LayoutDashboard 
} from 'lucide-react';
import { DoctorRegistrationData, RegistrationStep } from '@/types/medical/specialties';
import { getSpecialtyById } from '@/lib/medical-specialties';

interface StepSummaryProps {
  step: RegistrationStep;
  data: DoctorRegistrationData;
  onEdit: (step: RegistrationStep) => void;
}

export default function StepSummary({ step, data, onEdit }: StepSummaryProps) {
  const renderSummary = () => {
    switch (step) {
      case 'personal_info':
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Nombre:</span>
              <span className="font-medium">{data.firstName} {data.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Email:</span>
              <span className="font-medium">{data.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Teléfono:</span>
              <span className="font-medium">{data.phone}</span>
            </div>
          </div>
        );
      
      case 'professional_info':
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cédula Profesional:</span>
              <span className="font-medium">{data.licenseNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Estado:</span>
              <span className="font-medium">{data.licenseState}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Años de Experiencia:</span>
              <span className="font-medium">{data.yearsOfExperience}</span>
            </div>
          </div>
        );
      
      case 'specialty_selection':
        const specialty = getSpecialtyById(data.specialtyId);
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg bg-${specialty?.color}-100`}>
                <Stethoscope className={`h-4 w-4 text-${specialty?.color}-600`} />
              </div>
              <div>
                <p className="font-medium">{specialty?.name}</p>
                <p className="text-xs text-gray-600">{specialty?.description}</p>
              </div>
            </div>
            {data.subSpecialties && data.subSpecialties.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Subespecialidades:</p>
                <div className="flex flex-wrap gap-1">
                  {data.subSpecialties.map((sub, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {sub}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'identity_verification':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-700">Verificación Completada</span>
            </div>
            <div className="text-xs text-gray-600">
              ID: {data.identityVerification?.verificationId?.substring(0, 8)}...
            </div>
          </div>
        );
      
      case 'dashboard_configuration':
        const workingDays = Object.entries(data.workingHours).filter(([_, schedule]) => 
          schedule.isWorkingDay
        ).length;
        
        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Características:</span>
              <span className="font-medium">{data.selectedFeatures.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Días Laborales:</span>
              <span className="font-medium">{workingDays}</span>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getStepIcon = () => {
    const icons = {
      personal_info: User,
      professional_info: FileText,
      specialty_selection: Stethoscope,
      identity_verification: Shield,
      dashboard_configuration: LayoutDashboard,
      final_review: null
    };
    
    const Icon = icons[step];
    return Icon ? <Icon className="h-4 w-4" /> : null;
  };

  const getStepTitle = () => {
    const titles = {
      personal_info: 'Información Personal',
      professional_info: 'Información Profesional',
      specialty_selection: 'Especialidad Médica',
      identity_verification: 'Verificación de Identidad',
      dashboard_configuration: 'Configuración del Dashboard',
      final_review: 'Revisión Final'
    };
    
    return titles[step];
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {getStepIcon()}
            <span>{getStepTitle()}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Completado
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderSummary()}
        <button 
          onClick={() => onEdit(step)}
          className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Editar información
        </button>
      </CardContent>
    </Card>
  );
}