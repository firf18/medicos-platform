'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  Clock, 
  LayoutDashboard,
  CheckCircle,
  Info
} from 'lucide-react';

import { DoctorRegistrationData, WorkingHours, DaySchedule } from '@/types/medical/specialties';
import { getSpecialtyById, getDashboardFeatures } from '@/lib/medical-specialties';

interface DashboardConfigurationStepProps {
  data: DoctorRegistrationData;
  updateData: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'dashboard_configuration') => void;
  onStepError: (step: 'dashboard_configuration', error: string) => void;
  isLoading: boolean;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
] as const;

export default function DashboardConfigurationStep({
  data,
  updateData,
  onStepComplete,
  onStepError
}: DashboardConfigurationStepProps) {
  const specialty = getSpecialtyById(data.specialtyId);
  const dashboardFeatures = getDashboardFeatures(data.specialtyId);

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    data.selectedFeatures || dashboardFeatures.filter(f => f.priority === 'essential').map(f => f.id)
  );

  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    data.workingHours || {
      monday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      thursday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      friday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      saturday: { isWorkingDay: false },
      sunday: { isWorkingDay: false }
    }
  );

  // Función para alternar característica
  const toggleFeature = (featureId: string) => {
    const feature = dashboardFeatures.find(f => f.id === featureId);
    
    // No permitir desactivar características esenciales
    if (feature?.priority === 'essential' && selectedFeatures.includes(featureId)) {
      return;
    }

    setSelectedFeatures(prev => {
      const newFeatures = prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId];
      
      updateData({ selectedFeatures: newFeatures });
      return newFeatures;
    });
  };

  // Función para actualizar horarios de trabajo
  const updateWorkingDay = (day: keyof WorkingHours, schedule: Partial<DaySchedule>) => {
    const newWorkingHours = {
      ...workingHours,
      [day]: { ...workingHours[day], ...schedule }
    };
    setWorkingHours(newWorkingHours);
    updateData({ workingHours: newWorkingHours });
  };

  // Función para configurar horario rápido
  const setQuickSchedule = (type: 'standard' | 'extended' | 'minimal') => {
    let schedule: WorkingHours;
    
    switch (type) {
      case 'standard':
        schedule = {
          monday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
          tuesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
          wednesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
          thursday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
          friday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
          saturday: { isWorkingDay: false },
          sunday: { isWorkingDay: false }
        };
        break;
      case 'extended':
        schedule = {
          monday: { isWorkingDay: true, startTime: '08:00', endTime: '19:00' },
          tuesday: { isWorkingDay: true, startTime: '08:00', endTime: '19:00' },
          wednesday: { isWorkingDay: true, startTime: '08:00', endTime: '19:00' },
          thursday: { isWorkingDay: true, startTime: '08:00', endTime: '19:00' },
          friday: { isWorkingDay: true, startTime: '08:00', endTime: '19:00' },
          saturday: { isWorkingDay: true, startTime: '09:00', endTime: '14:00' },
          sunday: { isWorkingDay: false }
        };
        break;
      case 'minimal':
        schedule = {
          monday: { isWorkingDay: true, startTime: '10:00', endTime: '15:00' },
          tuesday: { isWorkingDay: true, startTime: '10:00', endTime: '15:00' },
          wednesday: { isWorkingDay: true, startTime: '10:00', endTime: '15:00' },
          thursday: { isWorkingDay: false },
          friday: { isWorkingDay: true, startTime: '10:00', endTime: '15:00' },
          saturday: { isWorkingDay: false },
          sunday: { isWorkingDay: false }
        };
        break;
    }
    
    setWorkingHours(schedule);
    updateData({ workingHours: schedule });
  };

  // Validar configuración
  useEffect(() => {
    const hasEssentialFeatures = dashboardFeatures
      .filter(f => f.priority === 'essential')
      .every(f => selectedFeatures.includes(f.id));
    
    const hasWorkingDays = Object.values(workingHours).some(day => day.isWorkingDay);
    
    if (hasEssentialFeatures && hasWorkingDays) {
      onStepComplete('dashboard_configuration');
    } else {
      onStepError('dashboard_configuration', 'Configura al menos las características esenciales y un día de trabajo');
    }
  }, [selectedFeatures, workingHours, dashboardFeatures, onStepComplete, onStepError]);

  // Organizar características por categoría
  const featuresByCategory = dashboardFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, typeof dashboardFeatures>);

  const categoryLabels = {
    patient_management: 'Gestión de Pacientes',
    diagnostics: 'Diagnósticos',
    treatments: 'Tratamientos',
    analytics: 'Análisis',
    communication: 'Comunicación'
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configuración del Dashboard
        </h2>
        <p className="text-gray-600">
          Personaliza tu espacio de trabajo seleccionando las características que necesitas 
          para tu especialidad en {specialty?.name}.
        </p>
      </div>

      {/* Características del Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LayoutDashboard className="h-5 w-5 mr-2" />
            Características del Dashboard
          </CardTitle>
          <CardDescription>
            Selecciona las herramientas que quieres tener disponibles en tu dashboard. 
            Las características esenciales están preseleccionadas y no se pueden desactivar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(featuresByCategory).map(([category, features]) => (
            <div key={category}>
              <h3 className="font-medium text-gray-900 mb-3">
                {categoryLabels[category as keyof typeof categoryLabels] || category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature) => {
                  const isSelected = selectedFeatures.includes(feature.id);
                  const isEssential = feature.priority === 'essential';
                  
                  return (
                    <div
                      key={feature.id}
                      className={`
                        p-4 border rounded-lg cursor-pointer transition-all
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                        ${isEssential ? 'opacity-100' : 'opacity-90'}
                      `}
                      onClick={() => !isEssential && toggleFeature(feature.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{feature.name}</span>
                            {isEssential && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Esencial
                              </Badge>
                            )}
                            {feature.priority === 'important' && (
                              <Badge variant="outline" className="text-xs">
                                Importante
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{feature.description}</p>
                        </div>
                        <div className="ml-3">
                          <Switch
                            checked={isSelected}
                            onCheckedChange={() => !isEssential && toggleFeature(feature.id)}
                            disabled={isEssential}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Horarios de Trabajo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Horarios de Trabajo
          </CardTitle>
          <CardDescription>
            Define tus horarios de trabajo para que el sistema pueda programar citas automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuraciones rápidas */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Configuraciones Rápidas</Label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setQuickSchedule('standard')}
              >
                Estándar (9-17h, L-V)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setQuickSchedule('extended')}
              >
                Extendido (8-19h, L-S)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setQuickSchedule('minimal')}
              >
                Mínimo (10-15h, L-M-V)
              </Button>
            </div>
          </div>

          <Separator />

          {/* Configuración detallada por día */}
          <div className="space-y-3">
            {DAYS_OF_WEEK.map(({ key, label }) => {
              const daySchedule = workingHours[key];
              
              return (
                <div key={key} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="w-20">
                    <Label className="text-sm font-medium">{label}</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={daySchedule.isWorkingDay}
                      onCheckedChange={(checked) => 
                        updateWorkingDay(key, { 
                          isWorkingDay: checked,
                          ...(checked && !daySchedule.startTime && {
                            startTime: '09:00',
                            endTime: '17:00'
                          })
                        })
                      }
                    />
                    <Label className="text-sm">Trabajar</Label>
                  </div>

                  {daySchedule.isWorkingDay && (
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">de</Label>
                      <input
                        type="time"
                        value={daySchedule.startTime || '09:00'}
                        onChange={(e) => updateWorkingDay(key, { startTime: e.target.value })}
                        className="border rounded px-2 py-1 text-sm"
                      />
                      <Label className="text-sm">a</Label>
                      <input
                        type="time"
                        value={daySchedule.endTime || '17:00'}
                        onChange={(e) => updateWorkingDay(key, { endTime: e.target.value })}
                        className="border rounded px-2 py-1 text-sm"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de configuración */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Resumen de Configuración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-800 mb-2">
                Características Seleccionadas: {selectedFeatures.length}
              </h4>
              <div className="space-y-1">
                {['essential', 'important', 'optional'].map(priority => {
                  const count = dashboardFeatures.filter(f => 
                    f.priority === priority && selectedFeatures.includes(f.id)
                  ).length;
                  
                  if (count === 0) return null;
                  
                  return (
                    <div key={priority} className="text-sm text-green-700">
                      • {count} {priority === 'essential' ? 'esenciales' : 
                                  priority === 'important' ? 'importantes' : 'opcionales'}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-green-800 mb-2">Horarios de Trabajo</h4>
              <div className="text-sm text-green-700">
                {Object.entries(workingHours).filter(([, schedule]) => schedule.isWorkingDay).length} días laborales configurados
              </div>
              <div className="text-xs text-green-600 mt-1">
                {Object.entries(workingHours)
                  .filter(([, schedule]) => schedule.isWorkingDay)
                  .map(([day, schedule]) => {
                    const dayLabel = DAYS_OF_WEEK.find(d => d.key === day)?.label;
                    return `${dayLabel}: ${schedule.startTime}-${schedule.endTime}`;
                  })
                  .join(', ')
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Configuración Flexible</h4>
            <p className="text-sm text-blue-700 mt-1">
              Podrás modificar estas configuraciones en cualquier momento desde tu dashboard. 
              Las características y horarios se pueden ajustar según evolucionen tus necesidades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
