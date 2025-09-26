'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon,
  PhoneIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  MicrophoneIcon as MicrophoneOffIcon,
  CameraIcon,
  DocumentIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  UserCircleIcon,
  ClockIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon as ChatSolidIcon } from '@heroicons/react/24/solid';

interface MedicalChatWidgetProps {
  userId: string;
  darkMode: boolean;
  realTimeData?: any;
}

interface ChatMessage {
  id: string;
  sender: 'patient' | 'doctor' | 'system';
  senderName: string;
  senderId: string;
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'voice' | 'video_call';
  isRead: boolean;
  metadata?: any;
}

interface ChatSession {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  status: 'active' | 'waiting' | 'ended';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export function MedicalChatWidget({ userId, darkMode, realTimeData }: MedicalChatWidgetProps) {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadChatSessions();
    
    // Suscribirse a mensajes en tiempo real
    const subscription = supabase
      .channel('medical-chat')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `patient_id=eq.${userId}`
      }, (payload) => {
        console.log('New chat message:', payload);
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
          
          // Actualizar última sesión
          setSessions(prev => 
            prev.map(session => 
              session.id === newMessage.senderId 
                ? { 
                    ...session, 
                    lastMessage: newMessage.message,
                    lastMessageTime: newMessage.timestamp,
                    unreadCount: newMessage.sender === 'doctor' ? session.unreadCount + 1 : session.unreadCount
                  }
                : session
            )
          );
        }
      })
      .subscribe();

    setIsConnected(true);
    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [userId]);

  useEffect(() => {
    if (activeSession) {
      loadMessages(activeSession);
    }
  }, [activeSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatSessions = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          doctor:doctor_id (
            id,
            full_name,
            specialty
          )
        `)
        .eq('patient_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const processedSessions: ChatSession[] = data.map(session => ({
          id: session.id,
          doctorId: session.doctor_id,
          doctorName: session.doctor?.full_name || 'Doctor',
          doctorSpecialty: session.doctor?.specialty || 'General',
          status: session.status,
          lastMessage: session.last_message,
          lastMessageTime: session.last_message_time,
          unreadCount: session.unread_count || 0
        }));

        setSessions(processedSessions);
        
        // Seleccionar la primera sesión activa o la más reciente
        const activeSessionData = processedSessions.find(s => s.status === 'active') || processedSessions[0];
        if (activeSessionData) {
          setActiveSession(activeSessionData.id);
        }
      }

    } catch (error) {
      console.error('Error loading chat sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const processedMessages: ChatMessage[] = data.map(msg => ({
          id: msg.id,
          sender: msg.sender_type,
          senderName: msg.sender_name,
          senderId: msg.sender_id,
          message: msg.message,
          timestamp: msg.created_at,
          type: msg.message_type,
          isRead: msg.is_read,
          metadata: msg.metadata
        }));

        setMessages(processedMessages);
      }

    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeSession) return;

    try {
      const messageData = {
        session_id: activeSession,
        sender_type: 'patient',
        sender_name: 'Tú',
        sender_id: userId,
        message: newMessage.trim(),
        message_type: 'text',
        is_read: false
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert([messageData]);

      if (error) throw error;

      setNewMessage('');
      
      // Simular indicador de escritura
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        // Aquí enviarías el audio al servidor
        console.log('Audio recorded:', audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting voice recording:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startVideoCall = () => {
    // Implementar llamada de video
    console.log('Starting video call...');
  };

  const sendFile = (file: File) => {
    // Implementar envío de archivos
    console.log('Sending file:', file);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'waiting': return 'text-yellow-500';
      case 'ended': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'En línea';
      case 'waiting': return 'Esperando respuesta';
      case 'ended': return 'Sesión finalizada';
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

  const currentSession = sessions.find(s => s.id === activeSession);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Chat Médico
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSessions(!showSessions)}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            <EllipsisVerticalIcon className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            onClick={startVideoCall}
            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <VideoCameraIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lista de sesiones */}
      {showSessions && (
        <div className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Conversaciones
          </h4>
          <div className="space-y-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  setActiveSession(session.id);
                  setShowSessions(false);
                }}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  activeSession === session.id
                    ? 'bg-blue-100 text-blue-900'
                    : darkMode
                    ? 'hover:bg-gray-600 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{session.doctorName}</p>
                    <p className="text-xs text-gray-500">{session.doctorSpecialty}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs ${getStatusColor(session.status)}`}>
                      {getStatusText(session.status)}
                    </span>
                    {session.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center mt-1">
                        {session.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat actual */}
      {currentSession ? (
        <>
          {/* Información del doctor */}
          <div className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
              <div>
                <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentSession.doctorName}
                </h4>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentSession.doctorSpecialty}
                </p>
              </div>
              <div className="ml-auto">
                <span className={`text-xs ${getStatusColor(currentSession.status)}`}>
                  {getStatusText(currentSession.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Área de mensajes */}
          <div className={`h-64 overflow-y-auto border rounded-lg p-3 space-y-3 ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
            {messages.length === 0 ? (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <ChatSolidIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Inicia una conversación</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.sender === 'patient'
                        ? 'bg-blue-500 text-white'
                        : darkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'patient' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Área de entrada */}
          <div className={`p-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Escribe tu mensaje..."
                  className={`w-full p-2 border rounded-lg resize-none ${darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-1">
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) sendFile(file);
                  }}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className={`p-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'} cursor-pointer transition-colors`}
                >
                  <DocumentIcon className="w-4 h-4 text-gray-600" />
                </label>
                
                <button
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={`p-2 rounded-lg ${isRecording ? 'bg-red-500 hover:bg-red-600' : darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                >
                  {isRecording ? (
                    <MicrophoneOffIcon className="w-4 h-4 text-white" />
                  ) : (
                    <MicrophoneIcon className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <ChatSolidIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Selecciona una conversación para comenzar</p>
        </div>
      )}
    </div>
  );
}
