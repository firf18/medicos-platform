'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface TestResult {
  id: string;
  patientName: string;
  testName: string;
  date: string;
  status: 'pending' | 'completed' | 'critical';
  isCritical: boolean;
}

interface TestResultsListProps {
  results: TestResult[];
}

export function TestResultsList({ results }: TestResultsListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'critical':
        return 'Crítico';
      default:
        return 'Pendiente';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Últimos Resultados de Pruebas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((result) => (
            <div 
              key={result.id} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div>
                <h3 className="font-medium">{result.testName}</h3>
                <p className="text-sm text-muted-foreground">Paciente: {result.patientName}</p>
                <p className="text-sm text-muted-foreground">Fecha: {result.date}</p>
              </div>
              <div className="flex items-center">
                <span className={`flex items-center px-2 py-1 rounded-full text-xs ${getStatusClass(result.status)}`}>
                  {getStatusIcon(result.status)}
                  <span className="ml-1">{getStatusText(result.status)}</span>
                </span>
                <Button variant="outline" size="sm" className="ml-4">
                  Ver detalles
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
