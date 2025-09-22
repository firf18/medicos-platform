/**
 * Dashboard Config Section Component
 * @fileoverview Section for reviewing dashboard configuration in final review
 * @compliance HIPAA-compliant dashboard settings review
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Clock, CheckCircle } from 'lucide-react';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import { getDashboardFeatures } from '@/lib/medical-specialties/specialty-utils';

interface DashboardConfigSectionProps {
  data: DoctorRegistrationData;
}

export const DashboardConfigSection: React.FC<DashboardConfigSectionProps> = ({
  data
}) => {
  const selectedFeatures = getDashboardFeatures(data.specialtyId).filter(f => 
    data.selectedFeatures.includes(f.id)
  );

  const workingDays = Object.entries(data.workingHours)
    .filter(([, schedule]) => schedule.isWorkingDay)
    .map(([day, schedule]) => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      hours: `${schedule.startTime} - ${schedule.endTime}`
    }));

  const dayTranslations: Record<string, string> = {
    'Monday': 'Lunes',
    'Tuesday': 'Martes',
    'Wednesday': 'Miércoles',
    'Thursday': 'Jueves',
    'Friday': 'Viernes',
    'Saturday': 'Sábado',
    'Sunday': 'Domingo'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-purple-600" />
          <CardTitle>Configuración del Dashboard</CardTitle>
        </div>
        <CardDescription>
          Características y horarios de atención configurados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected Features */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Características Seleccionadas ({selectedFeatures.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedFeatures.map(feature => (
              <div
                key={feature.id}
                className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <feature.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{feature.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          {selectedFeatures.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              No se han seleccionado características adicionales
            </p>
          )}
        </div>

        {/* Working Hours */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horario de Atención ({workingDays.length} días)
          </h4>
          <div className="space-y-2">
            {workingDays.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {workingDays.map(({ day, hours }) => (
                  <div
                    key={day}
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                  >
                    <span className="font-medium text-sm">
                      {dayTranslations[day] || day}
                    </span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {hours}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No se ha configurado horario de atención
              </p>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {selectedFeatures.length}
              </p>
              <p className="text-xs text-gray-600">Características</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {workingDays.length}
              </p>
              <p className="text-xs text-gray-600">Días Laborales</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {data.subSpecialties?.length || 0}
              </p>
              <p className="text-xs text-gray-600">Subespecialidades</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                100%
              </p>
              <p className="text-xs text-gray-600">Configurado</p>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Podrás modificar estas configuraciones en cualquier 
            momento desde tu panel de control después de completar el registro.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
