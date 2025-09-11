'use client';

import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  created_at: string;
}

export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simular carga de notificaciones
  useEffect(() => {
    // Simular datos de notificaciones
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Nueva cita programada',
        message: 'Tienes una nueva cita con Ana Silva el 15/09/2025 a las 10:00 AM',
        type: 'info',
        is_read: false,
        created_at: '2025-09-10T08:30:00Z'
      },
      {
        id: '2',
        title: 'Resultado de laboratorio disponible',
        message: 'El resultado de tu hemograma completo está disponible',
        type: 'success',
        is_read: true,
        created_at: '2025-09-09T14:15:00Z'
      },
      {
        id: '3',
        title: 'Recordatorio de cita',
        message: 'Recuerda tu cita con Dr. Juan Pérez mañana a las 9:00 AM',
        type: 'warning',
        is_read: false,
        created_at: '2025-09-09T10:00:00Z'
      },
      {
        id: '4',
        title: 'Actualización de perfil',
        message: 'Por favor actualiza tu información de contacto',
        type: 'error',
        is_read: true,
        created_at: '2025-09-08T16:45:00Z'
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
  }, []);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, is_read: true } : notification
    ));
    setUnreadCount(unreadCount - 1);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => 
      ({ ...notification, is_read: true })
    ));
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: string, isRead: boolean) => {
    if (isRead) {
      return 'bg-gray-50';
    }
    
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePanel}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Notificaciones</h3>
              <Button variant="ghost" size="icon" onClick={togglePanel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={markAllAsRead}
                className="p-0 h-auto mt-1"
              >
                Marcar todas como leídas
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-96">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No tienes notificaciones
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 ${getBackgroundColor(notification.type, notification.is_read)} transition-colors duration-200`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">{notification.title}</h4>
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-5 w-5 p-0"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          {format(new Date(notification.created_at), "d 'de' MMMM 'a las' h:mm a", { locale: es })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}