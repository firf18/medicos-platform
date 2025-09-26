'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  BellIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  EyeIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  DocumentTextIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';

interface RealTimeNotificationsProps {
  userId: string;
  darkMode: boolean;
  realTimeData?: any;
}

interface Notification {
  id: string;
  type: 'appointment' | 'medication' | 'lab_result' | 'emergency' | 'reminder' | 'general';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  actionRequired: boolean;
  actionUrl?: string;
  metadata?: any;
}

interface NotificationStats {
  total: number;
  unread: number;
  urgent: number;
  today: number;
}

export function RealTimeNotifications({ userId, darkMode, realTimeData }: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    urgent: 0,
    today: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent' | 'today'>('all');
  const [showAll, setShowAll] = useState(false);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadNotifications();
    
    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'patient_notifications',
        filter: `patient_id=eq.${userId}`
      }, (payload) => {
        console.log('Notification change:', payload);
        if (payload.eventType === 'INSERT') {
          // Agregar nueva notificación
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          updateStats([newNotification, ...notifications]);
          
          // Mostrar notificación del sistema si es urgente
          if (newNotification.priority === 'urgent') {
            showSystemNotification(newNotification);
          }
        } else if (payload.eventType === 'UPDATE') {
          // Actualizar notificación existente
          const updatedNotification = payload.new as Notification;
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === updatedNotification.id ? updatedNotification : notif
            )
          );
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('patient_notifications')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        const processedNotifications: Notification[] = data.map(notif => ({
          id: notif.id,
          type: notif.notification_type,
          title: notif.title,
          message: notif.message,
          priority: notif.priority,
          isRead: notif.is_read,
          createdAt: notif.created_at,
          actionRequired: notif.action_required,
          actionUrl: notif.action_url,
          metadata: notif.metadata
        }));

        setNotifications(processedNotifications);
        updateStats(processedNotifications);
      }

    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (notifications: Notification[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    setStats({
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      urgent: notifications.filter(n => n.priority === 'urgent').length,
      today: notifications.filter(n => new Date(n.createdAt) >= today).length
    });
  };

  const showSystemNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent'
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('patient_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );

    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('patient_notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('patient_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <CalendarIcon className="w-5 h-5 text-blue-500" />;
      case 'medication': return <DocumentTextIcon className="w-5 h-5 text-green-500" />;
      case 'lab_result': return <DocumentTextIcon className="w-5 h-5 text-purple-500" />;
      case 'emergency': return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'reminder': return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default: return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'normal': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'normal': return 'Normal';
      default: return 'Baja';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.isRead;
      case 'urgent': return notification.priority === 'urgent';
      case 'today': 
        const today = new Date();
        const notificationDate = new Date(notification.createdAt);
        return notificationDate.toDateString() === today.toDateString();
      default: return true;
    }
  });

  const displayNotifications = showAll ? filteredNotifications : filteredNotifications.slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Notificaciones
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {stats.unread} sin leer de {stats.total} total
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={loadNotifications}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            <ArrowPathIcon className="w-4 h-4 text-gray-600" />
          </button>
          
          {stats.unread > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
            >
              Marcar todo como leído
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: 'Todas', count: stats.total },
          { key: 'unread', label: 'Sin leer', count: stats.unread },
          { key: 'urgent', label: 'Urgentes', count: stats.urgent },
          { key: 'today', label: 'Hoy', count: stats.today }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key as any)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === filterOption.key
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption.label} ({filterOption.count})
          </button>
        ))}
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-3">
        {displayNotifications.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <BellIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay notificaciones</p>
          </div>
        ) : (
          displayNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-l-4 ${getPriorityColor(notification.priority)} ${
                darkMode ? 'bg-gray-700' : 'bg-white'
              } hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                        {getPriorityText(notification.priority)}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {notification.actionRequired && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Acción requerida
                        </span>
                      )}
                      
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Marcar como leído
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botón para mostrar más */}
      {filteredNotifications.length > 5 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className={`w-full py-2 text-sm font-medium ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
        >
          Ver {filteredNotifications.length - 5} notificaciones más
        </button>
      )}

      {/* Solicitar permisos de notificación */}
      {('Notification' in window && Notification.permission === 'default') && (
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-blue-200'}`}>
          <div className="flex items-center space-x-2">
            <BellSolidIcon className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-blue-900'}`}>
                Habilitar notificaciones del navegador
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                Recibe alertas importantes incluso cuando no estés en la aplicación
              </p>
            </div>
            <button
              onClick={() => {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    console.log('Notification permission granted');
                  }
                });
              }}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
            >
              Habilitar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
