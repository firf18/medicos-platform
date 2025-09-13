'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Syringe, 
  Calendar, 
  Heart, 
  Eye,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';

interface PreventionAlert {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  alertType: 'vaccination' | 'screening' | 'checkup' | 'follow_up';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  dueDate: string;
  lastDone?: string;
  frequency: string;
  category: 'pediatric' | 'adult' | 'senior' | 'chronic';
  status: 'pending' | 'scheduled' | 'completed' | 'overdue';
}

export default function PreventionAlertsWidget() {
  const [alerts, setAlerts] = useState<PreventionAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'due_soon' | 'overdue'>('all');

  useEffect(() => {
    loadPreventionAlerts();
  }, [filter]);

  const loadPreventionAlerts = async () => {
    setIsLoading(true);
    
    // Simular datos de alertas preventivas
    // En producción, esto vendría de Supabase con lógica de cálculo de fechas
    const mockAlerts: PreventionAlert[] = [
      {
        id: '1',
        patientId: 'p1',
        patientName: 'María González',
        patientAge: 45,
        alertType: 'screening',
        priority: 'high',
        title: 'Mamografía Anual',
        description: 'Detección temprana de cáncer de mama',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        lastDone: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        frequency: 'Anual',
        category: 'adult',
        status: 'pending'
      },
      {
        id: '2',
        patientId: 'p2',
        patientName: 'Carlos Mendoza',
        patientAge: 55,
        alertType: 'screening',
        priority: 'urgent',
        title: 'Colonoscopía',
        description: 'Detección de cáncer colorrectal',
        dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastDone: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        frequency: 'Cada 5 años',
        category: 'adult',
        status: 'overdue'
      },
      {
        id: '3',
        patientId: 'p3',
        patientName: 'Ana Rodríguez',
        patientAge: 35,
        alertType: 'screening',
        priority: 'medium',
        title: 'Papanicolaou',
        description: 'Detección de cáncer cervicouterino',
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        lastDone: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        frequency: 'Cada 3 años',
        category: 'adult',
        status: 'pending'
      },
      {
        id: '4',
        patientId: 'p4',
        patientName: 'Roberto Silva',
        patientAge: 65,
        alertType: 'vaccination',
        priority: 'high',
        title: 'Vacuna Influenza',
        description: 'Vacuna anual contra la influenza',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        frequency: 'Anual',
        category: 'senior',
        status: 'pending'
      },
      {
        id: '5',
        patientId: 'p5',
        patientName: 'Lucía Hernández',
        patientAge: 40,
        alertType: 'checkup',
        priority: 'medium',
        title: 'Examen Oftalmológico',
        description: 'Revisión anual de la vista',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastDone: new Date(Date.now() - 18 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        frequency: 'Cada 2 años',
        category: 'adult',
        status: 'pending'
      },
      {
        id: '6',
        patientId: 'p6',
        patientName: 'Diego Morales',
        patientAge: 50,
        alertType: 'follow_up',
        priority: 'high',
        title: 'Control Hipertensión',
        description: 'Seguimiento de presión arterial',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastDone: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        frequency: 'Cada 3 meses',
        category: 'chronic',
        status: 'scheduled'
      }
    ];

    // Filtrar según el filtro seleccionado
    let filteredAlerts = mockAlerts;
    
    switch (filter) {
      case 'urgent':
        filteredAlerts = mockAlerts.filter(alert => alert.priority === 'urgent');
        break;
      case 'due_soon':
        filteredAlerts = mockAlerts.filter(alert => {
          const dueDate = new Date(alert.dueDate);
          const now = new Date();
          const daysDiff = (dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
          return daysDiff <= 30 && daysDiff >= 0;
        });
        break;
      case 'overdue':
        filteredAlerts = mockAlerts.filter(alert => alert.status === 'overdue');
        break;
      default:
        filteredAlerts = mockAlerts;
    }

    setAlerts(filteredAlerts);
    setIsLoading(false);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'vaccination': return <Syringe className="h-4 w-4" />;
      case 'screening': return <Shield className="h-4 w-4" />;
      case 'checkup': return <Stethoscope className="h-4 w-4" />;
      case 'follow_up': return <Heart className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'scheduled': return <Calendar className="h-3 w-3 text-blue-600" />;
      case 'overdue': return <AlertTriangle className="h-3 w-3 text-red-600" />;
      default: return <Clock className="h-3 w-3 text-yellow-600" />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} días atrasado`;
    if (diffDays === 0) return 'Vence hoy';
    if (diffDays === 1) return 'Vence mañana';
    return `${diffDays} días restantes`;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'urgent', label: 'Urgentes' },
          { key: 'due_soon', label: 'Próximas' },
          { key: 'overdue', label: 'Atrasadas' }
        ].map((filterOption) => (
          <Button
            key={filterOption.key}
            variant={filter === filterOption.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(filterOption.key as any)}
          >
            {filterOption.label}
          </Button>
        ))}
      </div>

      {/* Lista de alertas */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <Card 
            key={alert.id} 
            className={`border-l-4 ${
              alert.status === 'overdue' ? 'border-l-red-500' :
              alert.priority === 'urgent' ? 'border-l-red-400' :
              alert.priority === 'high' ? 'border-l-orange-400' :
              'border-l-blue-400'
            } hover:shadow-md transition-shadow`}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`p-2 rounded-lg ${getPriorityColor(alert.priority)}`}>
                    {getAlertIcon(alert.alertType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {alert.title}
                      </h4>
                      {getStatusIcon(alert.status)}
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-1">
                      {alert.description}
                    </p>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      <span>{alert.patientName} ({alert.patientAge} años)</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{getDaysUntilDue(alert.dueDate)}</span>
                      <span>•</span>
                      <span>{alert.frequency}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getPriorityColor(alert.priority)}`}
                  >
                    {alert.priority === 'urgent' ? 'Urgente' :
                     alert.priority === 'high' ? 'Alta' :
                     alert.priority === 'medium' ? 'Media' : 'Baja'}
                  </Badge>
                  
                  {alert.status === 'overdue' && (
                    <Badge variant="destructive" className="text-xs">
                      Atrasado
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Acciones rápidas */}
              <div className="flex space-x-2 mt-3">
                <Button size="sm" variant="outline" className="text-xs">
                  Programar
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  Completar
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  Posponer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-6">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay alertas preventivas
          </h3>
          <p className="text-gray-600 text-sm">
            {filter === 'all' 
              ? 'Todas las medidas preventivas están al día.'
              : 'No hay alertas en esta categoría.'}
          </p>
        </div>
      )}

      {/* Resumen de prevención */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
        <div className="flex items-center text-blue-800">
          <Shield className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">
            Medicina Preventiva Red-Salud
          </span>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          Mantén a tus pacientes saludables con recordatorios automáticos de vacunas, 
          tamizajes y chequeos preventivos basados en edad y factores de riesgo.
        </p>
      </div>
    </div>
  );
}
