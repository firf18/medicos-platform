'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock, 
  User,
  Calendar,
  FileText,
  Heart,
  Phone,
  X,
  Archive
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'alert' | 'reminder' | 'info' | 'success' | 'warning' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  category: 'patient' | 'appointment' | 'system' | 'clinical' | 'administrative';
  relatedEntityId?: string;
  relatedEntityType?: 'patient' | 'appointment' | 'prescription' | 'lab_result';
  createdAt: string;
  readAt?: string;
  actionRequired: boolean;
  actionUrl?: string;
  expiresAt?: string;
}

export default function NotificationsWidget() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important' | 'today'>('unread');

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    setIsLoading(true);
    
    // Simular datos de notificaciones
    // En producción, esto vendría de Supabase
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'emergency',
        priority: 'critical',
        title: 'Valores críticos en laboratorio',
        message: 'Paciente María González presenta valores críticos de glucosa (450 mg/dL). Requiere atención inmediata.',
        category: 'clinical',
        relatedEntityId: 'p1',
        relatedEntityType: 'patient',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        actionRequired: true,
        actionUrl: '/patients/p1'
      },
      {
        id: '2',
        type: 'warning',
        priority: 'high',
        title: 'Paciente no confirmó cita',
        message: 'Carlos Mendoza no ha confirmado su cita de mañana a las 10:30 AM.',
        category: 'appointment',
        relatedEntityId: 'app2',
        relatedEntityType: 'appointment',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actionRequired: true,
        actionUrl: '/appointments/app2'
      },
      {
        id: '3',
        type: 'reminder',
        priority: 'medium',
        title: 'Recordatorio de vacunación',
        message: 'Roberto Silva (65 años) debe recibir la vacuna contra la influenza.',
        category: 'patient',
        relatedEntityId: 'p4',
        relatedEntityType: 'patient',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        actionRequired: false
      },
      {
        id: '4',
        type: 'info',
        priority: 'low',
        title: 'Actualización del sistema',
        message: 'Nueva versión de Red-Salud disponible con mejoras en el módulo de medicina preventiva.',
        category: 'system',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        readAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        actionRequired: false
      },
      {
        id: '5',
        type: 'success',
        priority: 'low',
        title: 'Expediente sincronizado',
        message: 'El expediente de Ana Rodríguez se ha sincronizado exitosamente con el sistema central.',
        category: 'patient',
        relatedEntityId: 'p3',
        relatedEntityType: 'patient',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        readAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        actionRequired: false
      },
      {
        id: '6',
        type: 'alert',
        priority: 'high',
        title: 'Medicamento próximo a vencer',
        message: 'El stock de Metformina 500mg vencerá en 15 días. Considere realizar un nuevo pedido.',
        category: 'administrative',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        actionRequired: true
      }
    ];

    // Filtrar notificaciones según el filtro seleccionado
    let filteredNotifications = mockNotifications;
    
    switch (filter) {
      case 'unread':
        filteredNotifications = mockNotifications.filter(n => !n.readAt);
        break;
      case 'important':
        filteredNotifications = mockNotifications.filter(n => 
          n.priority === 'critical' || n.priority === 'high'
        );
        break;
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filteredNotifications = mockNotifications.filter(n => 
          new Date(n.createdAt) >= today
        );
        break;
      default:
        filteredNotifications = mockNotifications;
    }

    setNotifications(filteredNotifications);
    setIsLoading(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'alert': return <Bell className="h-4 w-4" />;
      case 'reminder': return <Clock className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'critical') return 'text-red-600 bg-red-100 border-red-200';
    
    switch (type) {
      case 'emergency': return 'text-red-600 bg-red-100 border-red-200';
      case 'warning': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'alert': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'success': return 'text-green-600 bg-green-100 border-green-200';
      case 'info': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'patient': return <User className="h-3 w-3" />;
      case 'appointment': return <Calendar className="h-3 w-3" />;
      case 'clinical': return <Heart className="h-3 w-3" />;
      case 'administrative': return <FileText className="h-3 w-3" />;
      case 'system': return <Info className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-MX');
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, readAt: new Date().toISOString() }
          : notification
      )
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ 
        ...notification, 
        readAt: notification.readAt || new Date().toISOString() 
      }))
    );
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros y acciones */}
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-900">Notificaciones</h3>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={markAllAsRead}
            disabled={notifications.filter(n => !n.readAt).length === 0}
          >
            Marcar todas leídas
          </Button>
        </div>
        
        <div className="flex space-x-2">
          {[
            { key: 'unread', label: 'No leídas' },
            { key: 'important', label: 'Importantes' },
            { key: 'today', label: 'Hoy' },
            { key: 'all', label: 'Todas' }
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
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`border transition-all hover:shadow-md ${
              !notification.readAt ? 'border-l-4 border-l-blue-500' : ''
            }`}
          >
            <CardContent className="p-3">
              <div className="flex items-start space-x-3">
                <div className={`p-1.5 rounded-full ${getNotificationColor(notification.type, notification.priority)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${!notification.readAt ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      <p className={`text-xs mt-1 ${!notification.readAt ? 'text-gray-700' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center space-x-3 mt-2">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          {getCategoryIcon(notification.category)}
                          <span className="capitalize">{notification.category}</span>
                        </div>
                        
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.createdAt)}
                        </span>
                        
                        {notification.priority === 'critical' && (
                          <Badge variant="destructive" className="text-xs">
                            Crítico
                          </Badge>
                        )}
                        
                        {notification.actionRequired && (
                          <Badge variant="outline" className="text-xs">
                            Acción requerida
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {!notification.readAt && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissNotification(notification.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {notification.actionRequired && notification.actionUrl && (
                    <div className="mt-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        Ver detalles
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-6">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay notificaciones
          </h3>
          <p className="text-gray-600 text-sm">
            {filter === 'unread' 
              ? 'Todas las notificaciones están leídas.'
              : filter === 'important'
              ? 'No hay notificaciones importantes.'
              : filter === 'today'
              ? 'No hay notificaciones de hoy.'
              : 'No tienes notificaciones.'}
          </p>
        </div>
      )}

      {/* Resumen de notificaciones */}
      {notifications.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-900">
              {notifications.length} notificación{notifications.length !== 1 ? 'es' : ''}
            </span>
            <div className="flex space-x-3 text-gray-600">
              <span>
                No leídas: {notifications.filter(n => !n.readAt).length}
              </span>
              <span>
                Críticas: {notifications.filter(n => n.priority === 'critical').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
