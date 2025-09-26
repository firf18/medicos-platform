'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  VideoCameraIcon, 
  PhoneIcon, 
  CalendarIcon, 
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CameraIcon,
  MicrophoneIcon,
  MicrophoneIcon as MicrophoneOffIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline';

interface TelemedicinePanelProps {
  userId: string;
  darkMode: boolean;
  realTimeData?: any;
}

interface VideoCall {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  type: 'video' | 'audio' | 'consultation';
  notes?: string;
}

interface CallSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenShareEnabled: boolean;
  recordingEnabled: boolean;
}

export function TelemedicinePanel({ userId, darkMode, realTimeData }: TelemedicinePanelProps) {
  const [upcomingCalls, setUpcomingCalls] = useState<VideoCall[]>([]);
  const [activeCall, setActiveCall] = useState<VideoCall | null>(null);
  const [callSettings, setCallSettings] = useState<CallSettings>({
    videoEnabled: true,
    audioEnabled: true,
    screenShareEnabled: false,
    recordingEnabled: false
  });
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadUpcomingCalls();
    
    // Suscribirse a cambios en llamadas
    const subscription = supabase
      .channel('telemedicine-calls')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'video_calls',
        filter: `patient_id=eq.${userId}`
      }, (payload) => {
        console.log('Call update:', payload);
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          loadUpcomingCalls();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  const loadUpcomingCalls = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('video_calls')
        .select(`
          *,
          doctor:doctor_id (
            id,
            full_name,
            specialty
          )
        `)
        .eq('patient_id', userId)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const processedCalls: VideoCall[] = data.map(call => ({
          id: call.id,
          doctorId: call.doctor_id,
          doctorName: call.doctor?.full_name || 'Doctor',
          doctorSpecialty: call.doctor?.specialty || 'General',
          scheduledAt: call.scheduled_at,
          duration: call.duration || 0,
          status: call.status,
          type: call.call_type,
          notes: call.notes
        }));

        setUpcomingCalls(processedCalls);
      }

    } catch (error) {
      console.error('Error loading upcoming calls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startCall = async (callId: string) => {
    try {
      const call = upcomingCalls.find(c => c.id === callId);
      if (!call) return;

      // Actualizar estado de la llamada
      const { error } = await supabase
        .from('video_calls')
        .update({ 
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('id', callId);

      if (error) throw error;

      setActiveCall(call);
      setIsInCall(true);
      setCallDuration(0);

      // Simular inicio de llamada de video
      console.log('Starting video call with:', call.doctorName);

    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const endCall = async () => {
    if (!activeCall) return;

    try {
      const { error } = await supabase
        .from('video_calls')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString(),
          duration: callDuration,
          notes: callNotes
        })
        .eq('id', activeCall.id);

      if (error) throw error;

      setActiveCall(null);
      setIsInCall(false);
      setCallDuration(0);
      setCallNotes('');
      setIsRecording(false);

    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const toggleVideo = () => {
    setCallSettings(prev => ({ ...prev, videoEnabled: !prev.videoEnabled }));
  };

  const toggleAudio = () => {
    setCallSettings(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
  };

  const toggleScreenShare = () => {
    setCallSettings(prev => ({ ...prev, screenShareEnabled: !prev.screenShareEnabled }));
  };

  const toggleRecording = () => {
    setCallSettings(prev => ({ ...prev, recordingEnabled: !prev.recordingEnabled }));
    setIsRecording(!isRecording);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-50';
      case 'active': return 'text-green-600 bg-green-50';
      case 'ended': return 'text-gray-600 bg-gray-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'active': return 'En curso';
      case 'ended': return 'Finalizada';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Telemedicina
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Consultas médicas virtuales
          </p>
        </div>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
        >
          <CameraIcon className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Llamada activa */}
      {isInCall && activeCall && (
        <div className={`p-6 rounded-lg border-2 border-green-500 ${darkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
          <div className="text-center mb-4">
            <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Llamada en curso
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Con {activeCall.doctorName} - {activeCall.doctorSpecialty}
            </p>
            <p className={`text-2xl font-mono font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatDuration(callDuration)}
            </p>
          </div>

          {/* Video placeholder */}
          <div className={`h-48 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
            <div className="text-center">
              <VideoCameraIcon className={`w-12 h-12 mx-auto mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {callSettings.videoEnabled ? 'Video activo' : 'Video desactivado'}
              </p>
            </div>
          </div>

          {/* Controles de llamada */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full ${callSettings.videoEnabled ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'} transition-colors`}
            >
              <CameraIcon className="w-6 h-6" />
            </button>
            
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full ${callSettings.audioEnabled ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'} transition-colors`}
            >
              {callSettings.audioEnabled ? (
                <MicrophoneIcon className="w-6 h-6" />
              ) : (
                <MicrophoneOffIcon className="w-6 h-6" />
              )}
            </button>
            
            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-full ${callSettings.screenShareEnabled ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-600'} transition-colors`}
            >
              <ShareIcon className="w-6 h-6" />
            </button>
            
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-full ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'} transition-colors`}
            >
              <StopIcon className="w-6 h-6" />
            </button>
            
            <button
              onClick={endCall}
              className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <PhoneIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Notas de la llamada */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Notas de la consulta
            </label>
            <textarea
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              placeholder="Escribe notas sobre la consulta..."
              className={`w-full p-3 border rounded-lg resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Próximas llamadas */}
      <div>
        <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Próximas Consultas
        </h4>
        
        {upcomingCalls.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <VideoCameraIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay consultas programadas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingCalls.map((call) => (
              <div
                key={call.id}
                className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <UserGroupIcon className="w-8 h-8 text-blue-500" />
                    <div>
                      <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {call.doctorName}
                      </h5>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {call.doctorSpecialty}
                      </p>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                    {getStatusText(call.status)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatTime(call.scheduledAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4 text-gray-500" />
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {call.duration} min
                      </span>
                    </div>
                  </div>
                  
                  {call.status === 'scheduled' && (
                    <button
                      onClick={() => startCall(call.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Iniciar Llamada
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configuraciones */}
      {showSettings && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Configuraciones de Video
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Video por defecto
              </span>
              <input
                type="checkbox"
                checked={callSettings.videoEnabled}
                onChange={toggleVideo}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Audio por defecto
              </span>
              <input
                type="checkbox"
                checked={callSettings.audioEnabled}
                onChange={toggleAudio}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Permitir grabación
              </span>
              <input
                type="checkbox"
                checked={callSettings.recordingEnabled}
                onChange={toggleRecording}
                className="rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
