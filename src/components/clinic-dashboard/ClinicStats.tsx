'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Stethoscope, Settings } from 'lucide-react';

interface ClinicStatsProps {
  doctorsCount: number;
  appointmentsCount: number;
  clinicsCount: number;
}

export function ClinicStats({ doctorsCount, appointmentsCount, clinicsCount }: ClinicStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Médicos Asociados</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{doctorsCount}</div>
          <p className="text-xs text-muted-foreground">Médicos en tu clínica</p>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Citas Programadas</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{appointmentsCount}</div>
          <p className="text-xs text-muted-foreground">Citas esta semana</p>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Configuración</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clinicsCount}</div>
          <p className="text-xs text-muted-foreground">Clínicas asociadas</p>
        </CardContent>
      </Card>
    </div>
  );
}
