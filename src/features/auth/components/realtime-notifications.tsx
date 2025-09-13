'use client';

import { useState, useEffect } from 'react';
import { useNotificationSubscription } from '@/features/auth/hooks/use-realtime-subscription';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  created_at: string;
}

export function RealtimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Callback para manejar notificaciones en tiempo real
  const handleNotificationChange = (payload: any) => {
    console.log('🔔 Cambio en notificaciones:', payload);
    
    if (payload.eventType === 'INSERT') {
      // Nueva notificación
      const newNotification = payload.newRecord as Notification;
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    } else if (payload.eventType === 'UPDATE') {
      // Notificación actualizada (marcada como leída)
      const updatedNotification = payload.newRecord as Notification;
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === updatedNotification.id 
            ? updatedNotification 
            : notification
        )
      );
      
      // Si la notificación se marcó como leída, decrementar el contador
      if (updatedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } else if (payload.eventType === 'DELETE') {
      // Notificación eliminada
      const deletedId = payload.oldRecord?.id;
      if (deletedId) {
        setNotifications(prev => 
          prev.filter(notification => notification.id !== deletedId)
        );
      }
    }
  };

  // Suscribirse a notificaciones en tiempo real
  const { error } = useNotificationSubscription(
    user?.id || '',
    handleNotificationChange
  );

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (!user?.id) return;
    
    const loadInitialNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.error('Error cargando notificaciones iniciales:', err);
      }
    };
    
    loadInitialNotifications();
  }, [user?.id]);

  // Marcar notificación como leída
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        // La actualización en tiempo real se manejará automáticamente
        console.log(`✅ Notificación ${notificationId} marcada como leída`);
      }
    } catch (err) {
      console.error('Error marcando notificación como leída:', err);
    }
  };

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });
      
      if (response.ok) {
        console.log('✅ Todas las notificaciones marcadas como leídas');
      }
    } catch (err) {
      console.error('Error marcando todas las notificaciones como leídas:', err);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Error en la suscripción a notificaciones: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <button className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none">
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 justify-center items-center"
            variant="destructive"
          >
            {unreadCount}
          </Badge>
        )}
      </button>
      
      {/* Lista de notificaciones */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Notificaciones</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      {notification.type === 'success' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {notification.type === 'warning' && (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      {notification.type === 'error' && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      {notification.type === 'info' && (
                        <Info className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {notifications.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No hay notificaciones
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}