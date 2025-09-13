'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/providers/auth';
import { createClient } from '@/lib/supabase/client';
import { 
  Send, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video,
  User,
  Circle,
  Check,
  CheckCheck,
  Clock
} from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  sender_type: 'doctor' | 'patient';
  message_text: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  is_read: boolean;
  created_at: string;
  file_url?: string;
  file_type?: string;
}

interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_type: 'doctor' | 'patient';
  last_message: string;
  last_message_at: string;
  unread_count: number;
  conversation_status: string;
}

interface ChatInterfaceProps {
  conversationId?: string;
  otherUserId?: string;
  otherUserName?: string;
  otherUserType?: 'doctor' | 'patient';
  onConversationSelect?: (conversation: Conversation) => void;
}

export default function ChatInterface({
  conversationId,
  otherUserId,
  otherUserName,
  otherUserType,
  onConversationSelect
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Determinar el tipo de usuario actual
  const currentUserType = user?.user_metadata?.role === 'doctor' ? 'doctor' : 'patient';

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      markMessagesAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      // @ts-ignore - Temporal fix for database RPC types
      const { data, error } = await supabase.rpc('get_user_conversations', {
        user_id: user?.id,
        user_type: currentUserType
      });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      // @ts-ignore - Temporal fix for database RPC types
      await supabase.rpc('mark_messages_as_read', {
        conversation_id: conversationId,
        user_id: user?.id
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);

      const { error } = await supabase
        .from('chat_messages')
        // @ts-ignore - Temporal fix for database types
        .insert({
          conversation_id: selectedConversation,
          sender_id: user?.id,
          sender_type: currentUserType,
          message_text: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages(selectedConversation);
      fetchConversations(); // Actualizar última actividad
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const createNewConversation = async (doctorId: string, patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        // @ts-ignore - Temporal fix for database types
        .insert({
          doctor_id: doctorId,
          patient_id: patientId
        })
        .select()
        .single();

      if (error || !data) throw error;

      setSelectedConversation((data as any).id);
      fetchConversations();
      return (data as any).id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation.id);
    onConversationSelect?.(conversation);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    }
  };

  const getMessageStatus = (message: Message) => {
    if (message.sender_id !== user?.id) return null;
    
    if (message.is_read) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    } else {
      return <Check className="h-3 w-3 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-96 bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Lista de Conversaciones */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Conversaciones</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.other_user_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatMessageTime(conversation.last_message_at)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.last_message || 'Sin mensajes'}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              <User className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm">No hay conversaciones</p>
            </div>
          )}
        </div>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header del Chat */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {conversations.find(c => c.id === selectedConversation)?.other_user_name}
                  </h4>
                  <div className="flex items-center space-x-1">
                    <Circle className="h-2 w-2 text-green-500 fill-current" />
                    <span className="text-xs text-gray-500">En línea</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Phone className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Video className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === user?.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.message_text}</p>
                    <div className={`flex items-center justify-between mt-1 ${
                      message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">
                        {formatMessageTime(message.created_at)}
                      </span>
                      {getMessageStatus(message)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensaje */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Paperclip className="h-4 w-4" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={sending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-500 hover:text-blue-600 disabled:text-gray-300"
                  >
                    {sending ? (
                      <Clock className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                Selecciona una conversación para comenzar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
