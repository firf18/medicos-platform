'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, TestTube, Clock, Settings } from 'lucide-react';

interface LaboratoryStatsProps {
  testResultsCount: number;
  pendingRequestsCount: number;
  todayTestsCount: number;
}

export function LaboratoryStats({ testResultsCount, pendingRequestsCount, todayTestsCount }: LaboratoryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resultados de Pruebas</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{testResultsCount}</div>
          <p className="text-xs text-muted-foreground">Resultados publicados</p>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingRequestsCount}</div>
          <p className="text-xs text-muted-foreground">Solicitudes sin procesar</p>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pruebas de Hoy</CardTitle>
          <TestTube className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayTestsCount}</div>
          <p className="text-xs text-muted-foreground">Pruebas programadas</p>
        </CardContent>
      </Card>
    </div>
  );
}