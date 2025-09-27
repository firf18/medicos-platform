/**
 * Sistema de Notificaciones Inteligentes
 * Notificaciones contextuales, recordatorios automáticos y alertas médicas
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar,
  Pill,
  Heart,
  Users,
  Settings,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  MessageSquare,
  Filter,
  MoreHorizontal,
  X,
  Plus
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'appointment' | 'medication' | 'lab_result' | 'urgent' | 'reminder' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  isActionable: boolean;
  actionUrl?: string;
  actionText?: string;
  timestamp: string;
  expiresAt?: string;
  patientId?: string;
  appointmentId?: string;
  metadata?: any;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  sound: boolean;
  appointmentReminders: boolean;
  medicationReminders: boolean;
  labResults: boolean;
  urgentAlerts: boolean;
  systemUpdates: boolean;
  reminderTime: number; // minutes before
}

export default function IntelligentNotificationsWidget() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    sms: true,
    push: true,
    sound: true,
    appointmentReminders: true,
    medicationReminders: true,
    labResults: true,
    urgentAlerts: true,
    systemUpdates: false,
    reminderTime: 30
  });
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent' | 'appointments' | 'medications'>('all');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    // Simular notificaciones inteligentes
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'urgent',
        title: 'Alerta Crítica - Paciente María González',
        message: 'Presión arterial elevada detectada: 180/110 mmHg. Requiere atención inmediata.',
        priority: 'urgent',
        isRead: false,
        isActionable: true,
        actionUrl: '/patients/maria-gonzalez',
        actionText: 'Ver Paciente',
        timestamp: new Date().toISOString(),
        patientId: 'patient-1',
        metadata: { vitalSigns: { systolic: 180, diastolic: 110 } }
      },
      {
        id: '2',
        type: 'appointment',
        title: 'Recordatorio de Cita',
        message: 'Cita con Juan Pérez en 30 minutos. Consultorio 3.',
        priority: 'high',
        isRead: false,
        isActionable: true,
        actionUrl: '/appointments/123',
        actionText: 'Ver Cita',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        appointmentId: 'appointment-123'
      },
      {
        id: '3',
        type: 'lab_result',
        title: 'Resultados de Laboratorio Disponibles',
        message: 'Análisis de sangre de Ana Rodríguez - Valores fuera de rango detectados.',
        priority: 'normal',
        isRead: true,
        isActionable: true,
        actionUrl: '/lab-results/456',
        actionText: 'Ver Resultados',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        patientId: 'patient-3'
      },
      {
        id: '4',
        type: 'medication',
        title: 'Recordatorio de Medicación',
        message: 'Paciente Carlos López no ha tomado su medicación para diabetes hoy.',
        priority: 'normal',
        isRead: false,
        isActionable: true,
        actionUrl: '/patients/carlos-lopez/medications',
        actionText: 'Ver Medicamentos',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        patientId: 'patient-4'
      },
      {
        id: '5',
        type: 'system',
        title: 'Actualización del Sistema',
        message: 'Nueva funcionalidad disponible: Análisis predictivo de salud.',
        priority: 'low',
        isRead: true,
        isActionable: false,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '6',
        type: 'reminder',
        title: 'Revisión de Expediente Pendiente',
        message: 'Expediente de Laura Martínez requiere actualización de medicamentos.',
        priority: 'normal',
        isRead: false,
        isActionable: true,
        actionUrl: '/patients/laura-martinez/records',
        actionText: 'Actualizar Expediente',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        patientId: 'patient-5'
      }
    ];

    setNotifications(mockNotifications);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const updateSettings = (key: keyof NotificationSettings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `h-5 w-5 ${
      priority === 'urgent' ? 'text-red-600' :
      priority === 'high' ? 'text-orange-600' :
      priority === 'normal' ? 'text-blue-600' : 'text-gray-600'
    }`;

    switch (type) {
      case 'urgent':
        return <AlertTriangle className={iconClass} />;
      case 'appointment':
        return <Calendar className={iconClass} />;
      case 'medication':
        return <Pill className={iconClass} />;
      case 'lab_result':
        return <Heart className={iconClass} />;
      case 'reminder':
        return <Clock className={iconClass} />;
      case 'system':
        return <Settings className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      urgent: 'destructive',
      high: 'default',
      normal: 'secondary',
      low: 'outline'
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'secondary'}>
        {priority === 'urgent' ? 'Urgente' :
         priority === 'high' ? 'Alta' :
         priority === 'normal' ? 'Normal' : 'Baja'}
      </Badge>
    );
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread':
        return !notif.isRead;
      case 'urgent':
        return notif.priority === 'urgent';
      case 'appointments':
        return notif.type === 'appointment';
      case 'medications':
        return notif.type === 'medication';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.isRead).length;

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notificaciones Inteligentes</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount}</Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="unread">No leídas</SelectItem>
                  <SelectItem value="urgent">Urgentes</SelectItem>
                  <SelectItem value="appointments">Citas</SelectItem>
                  <SelectItem value="medications">Medicamentos</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
                <Settings className="h-4 w-4" />
              </Button>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuración de Notificaciones */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Configuración de Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Canales de Notificación</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Email</span>
                    </div>
                    <Switch 
                      checked={settings.email} 
                      onCheckedChange={(checked) => updateSettings('email', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm">SMS</span>
                    </div>
                    <Switch 
                      checked={settings.sms} 
                      onCheckedChange={(checked) => updateSettings('sms', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm">Push</span>
                    </div>
                    <Switch 
                      checked={settings.push} 
                      onCheckedChange={(checked) => updateSettings('push', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {settings.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      <span className="text-sm">Sonido</span>
                    </div>
                    <Switch 
                      checked={settings.sound} 
                      onCheckedChange={(checked) => updateSettings('sound', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Tipos de Notificación</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Recordatorios de citas</span>
                    </div>
                    <Switch 
                      checked={settings.appointmentReminders} 
                      onCheckedChange={(checked) => updateSettings('appointmentReminders', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Pill className="h-4 w-4" />
                      <span className="text-sm">Recordatorios de medicación</span>
                    </div>
                    <Switch 
                      checked={settings.medicationReminders} 
                      onCheckedChange={(checked) => updateSettings('medicationReminders', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">Resultados de laboratorio</span>
                    </div>
                    <Switch 
                      checked={settings.labResults} 
                      onCheckedChange={(checked) => updateSettings('labResults', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Alertas urgentes</span>
                    </div>
                    <Switch 
                      checked={settings.urgentAlerts} 
                      onCheckedChange={(checked) => updateSettings('urgentAlerts', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Notificaciones */}
      <Card>
        <CardContent className="p-0">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium ${
                          !notification.isRead ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {getPriorityBadge(notification.priority)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className={`text-sm ${
                        !notification.isRead ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          {notification.isActionable && (
                            <Button variant="outline" size="sm">
                              {notification.actionText || 'Ver Detalles'}
                            </Button>
                          )}
                          {!notification.isRead && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Marcar como leída
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">No hay notificaciones</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas Urgentes */}
      {urgentCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertas Urgentes Requieren Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              Tienes {urgentCount} alerta{urgentCount > 1 ? 's' : ''} urgente{urgentCount > 1 ? 's' : ''} que requieren atención inmediata.
            </p>
            <Button variant="destructive" className="mt-2">
              Ver Alertas Urgentes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
