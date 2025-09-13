'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Thermometer, 
  Weight, 
  Ruler, 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus
} from 'lucide-react';

interface VitalSign {
  id: string;
  patientId: string;
  patientName: string;
  bloodPressure: {
    systolic: number;
    diastolic: number;
    status: 'normal' | 'elevated' | 'high' | 'critical';
  };
  heartRate: {
    value: number;
    status: 'normal' | 'low' | 'high' | 'critical';
  };
  temperature: {
    value: number;
    status: 'normal' | 'fever' | 'hypothermia';
    unit: 'C' | 'F';
  };
  weight: {
    value: number;
    unit: 'kg' | 'lbs';
    trend: 'up' | 'down' | 'stable';
  };
  height: {
    value: number;
    unit: 'cm' | 'ft';
  };
  bmi: {
    value: number;
    category: 'underweight' | 'normal' | 'overweight' | 'obese';
  };
  recordedAt: string;
  recordedBy: string;
}

export default function VitalSignsWidget() {
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    loadVitalSigns();
  }, [selectedTimeframe]);

  const loadVitalSigns = async () => {
    setIsLoading(true);
    
    // Simular datos de signos vitales
    // En producción, esto vendría de Supabase
    const mockData: VitalSign[] = [
      {
        id: '1',
        patientId: 'p1',
        patientName: 'María González',
        bloodPressure: {
          systolic: 140,
          diastolic: 90,
          status: 'elevated'
        },
        heartRate: {
          value: 78,
          status: 'normal'
        },
        temperature: {
          value: 36.5,
          status: 'normal',
          unit: 'C'
        },
        weight: {
          value: 65,
          unit: 'kg',
          trend: 'stable'
        },
        height: {
          value: 165,
          unit: 'cm'
        },
        bmi: {
          value: 23.9,
          category: 'normal'
        },
        recordedAt: new Date().toISOString(),
        recordedBy: 'Dr. Smith'
      },
      {
        id: '2',
        patientId: 'p2',
        patientName: 'Carlos Mendoza',
        bloodPressure: {
          systolic: 180,
          diastolic: 110,
          status: 'critical'
        },
        heartRate: {
          value: 95,
          status: 'high'
        },
        temperature: {
          value: 37.8,
          status: 'fever',
          unit: 'C'
        },
        weight: {
          value: 85,
          unit: 'kg',
          trend: 'up'
        },
        height: {
          value: 175,
          unit: 'cm'
        },
        bmi: {
          value: 27.8,
          category: 'overweight'
        },
        recordedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        recordedBy: 'Dr. Smith'
      },
      {
        id: '3',
        patientId: 'p3',
        patientName: 'Ana Rodríguez',
        bloodPressure: {
          systolic: 110,
          diastolic: 70,
          status: 'normal'
        },
        heartRate: {
          value: 72,
          status: 'normal'
        },
        temperature: {
          value: 36.2,
          status: 'normal',
          unit: 'C'
        },
        weight: {
          value: 58,
          unit: 'kg',
          trend: 'down'
        },
        height: {
          value: 160,
          unit: 'cm'
        },
        bmi: {
          value: 22.7,
          category: 'normal'
        },
        recordedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        recordedBy: 'Dr. Smith'
      }
    ];

    setVitalSigns(mockData);
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'elevated': case 'high': return 'text-yellow-600 bg-yellow-100';
      case 'critical': case 'fever': return 'text-red-600 bg-red-100';
      case 'low': case 'hypothermia': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': case 'fever': return <AlertTriangle className="h-3 w-3" />;
      case 'high': case 'elevated': return <TrendingUp className="h-3 w-3" />;
      case 'low': case 'hypothermia': return <TrendingDown className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-blue-500" />;
      default: return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros de tiempo */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {['today', 'week', 'month'].map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe as any)}
            >
              {timeframe === 'today' ? 'Hoy' : timeframe === 'week' ? 'Semana' : 'Mes'}
            </Button>
          ))}
        </div>
        <Button size="sm" className="flex items-center">
          <Plus className="h-4 w-4 mr-1" />
          Registrar
        </Button>
      </div>

      {/* Lista de signos vitales */}
      <div className="space-y-3">
        {vitalSigns.map((record) => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{record.patientName}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(record.recordedAt).toLocaleString('es-MX')}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {record.recordedBy}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Presión Arterial */}
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {record.bloodPressure.systolic}/{record.bloodPressure.diastolic}
                    </p>
                    <Badge 
                      className={`text-xs ${getStatusColor(record.bloodPressure.status)}`}
                    >
                      {getStatusIcon(record.bloodPressure.status)}
                      PA
                    </Badge>
                  </div>
                </div>

                {/* Frecuencia Cardíaca */}
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{record.heartRate.value} bpm</p>
                    <Badge 
                      className={`text-xs ${getStatusColor(record.heartRate.status)}`}
                    >
                      {getStatusIcon(record.heartRate.status)}
                      FC
                    </Badge>
                  </div>
                </div>

                {/* Temperatura */}
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {record.temperature.value}°{record.temperature.unit}
                    </p>
                    <Badge 
                      className={`text-xs ${getStatusColor(record.temperature.status)}`}
                    >
                      {getStatusIcon(record.temperature.status)}
                      Temp
                    </Badge>
                  </div>
                </div>

                {/* Peso e IMC */}
                <div className="flex items-center space-x-2">
                  <Weight className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium flex items-center">
                      {record.weight.value} {record.weight.unit}
                      {getTrendIcon(record.weight.trend)}
                    </p>
                    <Badge 
                      className={`text-xs ${getStatusColor(record.bmi.category)}`}
                    >
                      IMC: {record.bmi.value}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Alertas críticas */}
              {(record.bloodPressure.status === 'critical' || 
                record.heartRate.status === 'critical' || 
                record.temperature.status === 'fever') && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center text-red-800">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">
                      Signos vitales críticos - Requiere atención inmediata
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {vitalSigns.length === 0 && (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay signos vitales registrados
          </h3>
          <p className="text-gray-600 mb-4">
            Comienza registrando los signos vitales de tus pacientes.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Registrar Signos Vitales
          </Button>
        </div>
      )}
    </div>
  );
}
