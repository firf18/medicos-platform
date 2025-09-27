/**
 * Sistema de IA para Diagnóstico Asistido
 * Análisis de síntomas, sugerencias de diagnóstico y alertas médicas
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Activity,
  Heart,
  Thermometer,
  Stethoscope,
  Pill,
  FileText,
  Lightbulb,
  Target,
  BarChart3,
  Zap,
  Shield,
  Eye,
  Loader2
} from 'lucide-react';

interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  frequency: 'constant' | 'intermittent' | 'occasional';
}

interface DiagnosisSuggestion {
  id: string;
  condition: string;
  probability: number;
  confidence: 'low' | 'medium' | 'high';
  symptoms: string[];
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  differentialDiagnosis: string[];
}

interface PatientAnalysis {
  patientId: string;
  symptoms: Symptom[];
  vitalSigns: {
    temperature?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    heartRate?: number;
    oxygenSaturation?: number;
  };
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  analysisResults: DiagnosisSuggestion[];
  riskScore: number;
  recommendations: string[];
}

export default function AIAssistantWidget() {
  const [currentAnalysis, setCurrentAnalysis] = useState<PatientAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [symptomInput, setSymptomInput] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  const commonSymptoms = [
    'Fiebre', 'Dolor de cabeza', 'Tos', 'Dificultad respiratoria', 'Dolor en el pecho',
    'Náuseas', 'Vómitos', 'Diarrea', 'Fatiga', 'Dolor abdominal', 'Mareos',
    'Dolor muscular', 'Dolor articular', 'Erupciones cutáneas', 'Pérdida de apetito'
  ];

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;

    setIsAnalyzing(true);
    
    // Simular análisis de IA
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockAnalysis: PatientAnalysis = {
      patientId: 'current-patient',
      symptoms: selectedSymptoms,
      vitalSigns: {
        temperature: 37.2,
        bloodPressure: { systolic: 140, diastolic: 90 },
        heartRate: 85,
        oxygenSaturation: 96
      },
      medicalHistory: ['Hipertensión', 'Diabetes tipo 2'],
      currentMedications: ['Metformina', 'Losartán'],
      allergies: ['Penicilina'],
      analysisResults: [
        {
          id: '1',
          condition: 'Hipertensión Arterial',
          probability: 85,
          confidence: 'high',
          symptoms: ['Dolor de cabeza', 'Mareos'],
          recommendations: [
            'Monitorear presión arterial regularmente',
            'Revisar medicación antihipertensiva',
            'Implementar cambios en estilo de vida'
          ],
          urgency: 'medium',
          differentialDiagnosis: ['Crisis hipertensiva', 'Hipertensión secundaria']
        },
        {
          id: '2',
          condition: 'Infección Respiratoria Superior',
          probability: 65,
          confidence: 'medium',
          symptoms: ['Tos', 'Fiebre'],
          recommendations: [
            'Reposo y hidratación adecuada',
            'Monitorear temperatura',
            'Considerar cultivo si persiste'
          ],
          urgency: 'low',
          differentialDiagnosis: ['Gripe', 'Resfriado común', 'Sinusitis']
        }
      ],
      riskScore: 7.2,
      recommendations: [
        'Monitorear signos vitales cada 4 horas',
        'Considerar ajuste de medicación antihipertensiva',
        'Educar sobre síntomas de alarma',
        'Programar seguimiento en 48 horas'
      ]
    };

    setCurrentAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  const addSymptom = (symptomName: string) => {
    if (selectedSymptoms.find(s => s.name === symptomName)) return;

    const newSymptom: Symptom = {
      id: Date.now().toString(),
      name: symptomName,
      severity: 'moderate',
      duration: '1-3 días',
      frequency: 'intermittent'
    };

    setSelectedSymptoms(prev => [...prev, newSymptom]);
  };

  const removeSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s.id !== symptomId));
  };

  const updateSymptom = (symptomId: string, field: keyof Symptom, value: any) => {
    setSelectedSymptoms(prev => 
      prev.map(s => s.id === symptomId ? { ...s, [field]: value } : s)
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Asistente de IA para Diagnóstico
          </CardTitle>
          <CardDescription>
            Análisis inteligente de síntomas y sugerencias de diagnóstico
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Input de Síntomas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Análisis de Síntomas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Síntomas Seleccionados */}
          {selectedSymptoms.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Síntomas Seleccionados:</h4>
              {selectedSymptoms.map((symptom) => (
                <div key={symptom.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{symptom.name}</span>
                    <Badge variant="outline">{symptom.severity}</Badge>
                    <Badge variant="secondary">{symptom.duration}</Badge>
                    <Badge variant="outline">{symptom.frequency}</Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeSymptom(symptom.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Síntomas Comunes */}
          <div>
            <h4 className="font-medium mb-2">Síntomas Comunes:</h4>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((symptom) => (
                <Button
                  key={symptom}
                  variant="outline"
                  size="sm"
                  onClick={() => addSymptom(symptom)}
                  disabled={selectedSymptoms.some(s => s.name === symptom)}
                >
                  {symptom}
                </Button>
              ))}
            </div>
          </div>

          {/* Botón de Análisis */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedSymptoms.length} síntoma{selectedSymptoms.length !== 1 ? 's' : ''} seleccionado{selectedSymptoms.length !== 1 ? 's' : ''}
            </div>
            <Button 
              onClick={analyzeSymptoms}
              disabled={selectedSymptoms.length === 0 || isAnalyzing}
              className="min-w-32"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analizar con IA
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados del Análisis */}
      {currentAnalysis && (
        <div className="space-y-4">
          {/* Resumen de Riesgo */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Target className="h-5 w-5 mr-2" />
                Resumen de Análisis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {currentAnalysis.riskScore}/10
                  </div>
                  <p className="text-sm text-blue-700">Puntuación de Riesgo</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {currentAnalysis.analysisResults.length}
                  </div>
                  <p className="text-sm text-green-700">Diagnósticos Sugeridos</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {currentAnalysis.recommendations.length}
                  </div>
                  <p className="text-sm text-purple-700">Recomendaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnósticos Sugeridos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Diagnósticos Sugeridos
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                >
                  {showDetailedAnalysis ? 'Vista Simple' : 'Vista Detallada'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentAnalysis.analysisResults.map((diagnosis) => (
                  <div key={diagnosis.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{diagnosis.condition}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getConfidenceColor(diagnosis.confidence)}>
                          {diagnosis.confidence === 'high' ? 'Alta Confianza' :
                           diagnosis.confidence === 'medium' ? 'Media Confianza' : 'Baja Confianza'}
                        </Badge>
                        <Badge className={getUrgencyColor(diagnosis.urgency)}>
                          {diagnosis.urgency === 'critical' ? 'Crítico' :
                           diagnosis.urgency === 'high' ? 'Alta' :
                           diagnosis.urgency === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="font-medium mb-2">Probabilidad: {diagnosis.probability}%</h5>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${diagnosis.probability}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Síntomas Relacionados:</h5>
                        <div className="flex flex-wrap gap-1">
                          {diagnosis.symptoms.map((symptom) => (
                            <Badge key={symptom} variant="outline">{symptom}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {showDetailedAnalysis && (
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium mb-2">Recomendaciones:</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {diagnosis.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-2">Diagnóstico Diferencial:</h5>
                          <div className="flex flex-wrap gap-1">
                            {diagnosis.differentialDiagnosis.map((diff) => (
                              <Badge key={diff} variant="secondary">{diff}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recomendaciones Generales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Recomendaciones Generales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentAnalysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Signos Vitales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Signos Vitales Actuales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <Thermometer className="h-6 w-6 text-red-600 mx-auto mb-1" />
                  <div className="text-lg font-bold">{currentAnalysis.vitalSigns.temperature}°C</div>
                  <div className="text-xs text-gray-500">Temperatura</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <Heart className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-lg font-bold">{currentAnalysis.vitalSigns.bloodPressure?.systolic}/{currentAnalysis.vitalSigns.bloodPressure?.diastolic}</div>
                  <div className="text-xs text-gray-500">Presión Arterial</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <Activity className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <div className="text-lg font-bold">{currentAnalysis.vitalSigns.heartRate} bpm</div>
                  <div className="text-xs text-gray-500">Frecuencia Cardíaca</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <Eye className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                  <div className="text-lg font-bold">{currentAnalysis.vitalSigns.oxygenSaturation}%</div>
                  <div className="text-xs text-gray-500">Saturación O2</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas de IA */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-800">
            <Zap className="h-5 w-5 mr-2" />
            Alertas Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 bg-white rounded">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Presión arterial elevada detectada - Considerar ajuste de medicación</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-white rounded">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Tendencia de síntomas respiratorios - Monitorear evolución</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-white rounded">
              <Pill className="h-4 w-4 text-green-600" />
              <span className="text-sm">Interacción medicamentosa detectada - Revisar compatibilidad</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
