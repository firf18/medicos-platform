/**
 * Sistema de Telemedicina Integrado
 * Videoconsultas, consultas telefónicas y seguimiento remoto
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Video, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Users,
  Camera,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Settings,
  Share,
  Download,
  Upload,
  FileText,
  Heart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface TelemedicineSession {
  id: string;
  patientId: string;
  patientName: string;
  type: 'video' | 'phone' | 'chat';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  scheduledAt: string;
  duration?: number;
  notes?: string;
  recordings?: string[];
  prescriptions?: any[];
  followUpRequired?: boolean;
}

interface VitalSigns {
  heartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
}

export default function TelemedicineWidget() {
  const [sessions, setSessions] = useState<TelemedicineSession[]>([]);
  const [activeSession, setActiveSession] = useState<TelemedicineSession | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({});
  const [sessionNotes, setSessionNotes] = useState('');
  const [showVitalSigns, setShowVitalSigns] = useState(false);

  useEffect(() => {
    loadTelemedicineSessions();
  }, []);

  const loadTelemedicineSessions = async () => {
    // Simular sesiones de telemedicina
    const mockSessions: TelemedicineSession[] = [
      {
        id: '1',
        patientId: 'patient-1',
        patientName: 'María González',
        type: 'video',
        status: 'active',
        scheduledAt: new Date().toISOString(),
        duration: 25,
        notes: 'Consulta de seguimiento para diabetes',
        recordings: ['recording-1.mp4'],
        prescriptions: [
          { medication: 'Metformina', dosage: '500mg', frequency: '2x día' }
        ],
        followUpRequired: true
      },
      {
        id: '2',
        patientId: 'patient-2',
        patientName: 'Juan Pérez',
        type: 'phone',
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        notes: 'Consulta telefónica para síntomas de gripe'
      },
      {
        id: '3',
        patientId: 'patient-3',
        patientName: 'Ana Rodríguez',
        type: 'video',
        status: 'completed',
        scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        duration: 35,
        notes: 'Consulta dermatológica completada',
        recordings: ['recording-3.mp4'],
        prescriptions: [
          { medication: 'Crema hidratante', dosage: 'Aplicar 2x día', frequency: 'Diario' }
        ]
      }
    ];

    setSessions(mockSessions);
  };

  const startSession = (session: TelemedicineSession) => {
    setActiveSession(session);
    setIsVideoOn(true);
    setIsMicOn(true);
    setIsRecording(false);
  };

  const endSession = () => {
    if (activeSession) {
      setSessions(prev => 
        prev.map(s => 
          s.id === activeSession.id 
            ? { ...s, status: 'completed', duration: 30 }
            : s
        )
      );
    }
    setActiveSession(null);
    setIsRecording(false);
  };

  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleMic = () => setIsMicOn(!isMicOn);
  const toggleRecording = () => setIsRecording(!isRecording);

  const saveVitalSigns = () => {
    console.log('Guardando signos vitales:', vitalSigns);
    // Implementar guardado real
  };

  const generatePrescription = () => {
    console.log('Generando receta médica');
    // Implementar generación de receta
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: 'secondary',
      active: 'default',
      completed: 'outline',
      cancelled: 'destructive'
    } as const;

    const colors = {
      scheduled: 'text-blue-600',
      active: 'text-green-600',
      completed: 'text-gray-600',
      cancelled: 'text-red-600'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status === 'scheduled' ? 'Programada' :
         status === 'active' ? 'En Curso' :
         status === 'completed' ? 'Completada' : 'Cancelada'}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sesión Activa */}
      {activeSession && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Video className="h-5 w-5 mr-2" />
              Sesión Activa - {activeSession.patientName}
            </CardTitle>
            <CardDescription>
              {activeSession.type === 'video' ? 'Videoconsulta' : 
               activeSession.type === 'phone' ? 'Consulta telefónica' : 'Chat médico'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Controles de Video */}
            <div className="flex items-center justify-center space-x-4 p-4 bg-white rounded-lg">
              <Button
                variant={isVideoOn ? 'default' : 'destructive'}
                onClick={toggleVideo}
                size="sm"
              >
                {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                {isVideoOn ? 'Video ON' : 'Video OFF'}
              </Button>
              
              <Button
                variant={isMicOn ? 'default' : 'destructive'}
                onClick={toggleMic}
                size="sm"
              >
                {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                {isMicOn ? 'Mic ON' : 'Mic OFF'}
              </Button>
              
              <Button
                variant={isRecording ? 'destructive' : 'outline'}
                onClick={toggleRecording}
                size="sm"
              >
                {isRecording ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isRecording ? 'Grabando...' : 'Grabar'}
              </Button>
              
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4" />
                Compartir Pantalla
              </Button>
            </div>

            {/* Signos Vitales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="h-5 w-5 mr-2" />
                      Signos Vitales
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowVitalSigns(!showVitalSigns)}
                    >
                      {showVitalSigns ? 'Ocultar' : 'Mostrar'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                {showVitalSigns && (
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium">Frecuencia Cardíaca</label>
                        <Input
                          type="number"
                          placeholder="80"
                          value={vitalSigns.heartRate || ''}
                          onChange={(e) => setVitalSigns(prev => ({ ...prev, heartRate: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Presión Arterial</label>
                        <div className="flex space-x-1">
                          <Input
                            type="number"
                            placeholder="120"
                            value={vitalSigns.bloodPressure?.systolic || ''}
                            onChange={(e) => setVitalSigns(prev => ({ 
                              ...prev, 
                              bloodPressure: { 
                                ...prev.bloodPressure, 
                                systolic: parseInt(e.target.value) 
                              } 
                            }))}
                          />
                          <span className="flex items-center">/</span>
                          <Input
                            type="number"
                            placeholder="80"
                            value={vitalSigns.bloodPressure?.diastolic || ''}
                            onChange={(e) => setVitalSigns(prev => ({ 
                              ...prev, 
                              bloodPressure: { 
                                ...prev.bloodPressure, 
                                diastolic: parseInt(e.target.value) 
                              } 
                            }))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Temperatura</label>
                        <Input
                          type="number"
                          placeholder="36.5"
                          value={vitalSigns.temperature || ''}
                          onChange={(e) => setVitalSigns(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Saturación O2</label>
                        <Input
                          type="number"
                          placeholder="98"
                          value={vitalSigns.oxygenSaturation || ''}
                          onChange={(e) => setVitalSigns(prev => ({ ...prev, oxygenSaturation: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <Button onClick={saveVitalSigns} className="w-full">
                      Guardar Signos Vitales
                    </Button>
                  </CardContent>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Notas de la Sesión
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Escribir notas de la consulta..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Acciones de la Sesión */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={generatePrescription}>
                  <FileText className="h-4 w-4 mr-1" />
                  Generar Receta
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Descargar Grabación
                </Button>
              </div>
              <Button variant="destructive" onClick={endSession}>
                <PhoneOff className="h-4 w-4 mr-1" />
                Finalizar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Sesiones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Video className="h-5 w-5 mr-2" />
              Sesiones de Telemedicina
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Nueva Sesión
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(session.type)}
                    <span className="font-medium">{session.patientName}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(session.status)}
                    <span className="text-sm text-gray-500">
                      {new Date(session.scheduledAt).toLocaleString()}
                    </span>
                  </div>
                  
                  {session.duration && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{session.duration} min</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {session.status === 'scheduled' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => startSession(session)}
                    >
                      Iniciar Sesión
                    </Button>
                  )}
                  {session.status === 'active' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveSession(session)}
                    >
                      Continuar Sesión
                    </Button>
                  )}
                  {session.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      Ver Grabación
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de Telemedicina */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sesiones Hoy</p>
                <p className="text-2xl font-bold text-blue-600">8</p>
                <p className="text-xs text-gray-500">+2 vs ayer</p>
              </div>
              <Video className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-green-600">28min</p>
                <p className="text-xs text-gray-500">por sesión</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfacción</p>
                <p className="text-2xl font-bold text-purple-600">4.7</p>
                <p className="text-xs text-gray-500">/5.0</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
