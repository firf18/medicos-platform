'use client';

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Bell,
  Calendar,
  FileText,
  Heart,
  MessageSquare,
  Settings,
  Check,
  X,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

interface NotificationsSectionProps {
  userId: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "appointment":
      return Calendar;
    case "medication":
      return Heart;
    case "lab_result":
    case "result":
      return FileText;
    case "message":
      return MessageSquare;
    case "reminder":
      return Clock;
    case "emergency":
      return Bell;
    default:
      return Bell;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
    case "high":
      return "destructive";
    case "normal":
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "default";
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "Urgente";
    case "high":
      return "Alta";
    case "normal":
    case "medium":
      return "Normal";
    case "low":
      return "Baja";
    default:
      return "Normal";
  }
};

const getNotificationTypeLabel = (type: string) => {
  const labels = {
    'appointment': 'Cita Médica',
    'medication': 'Medicamento',
    'result': 'Resultado',
    'lab_result': 'Resultado de Laboratorio',
    'emergency': 'Emergencia',
    'general': 'General',
    'reminder': 'Recordatorio',
    'message': 'Mensaje'
  };
  return labels[type as keyof typeof labels] || type;
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) {
    return "Hace unos minutos";
  } else if (diffInHours < 24) {
    return `Hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} día${diffInDays > 1 ? "s" : ""}`;
  }
};

export default function NotificationsSection({ userId }: NotificationsSectionProps) {
  const [filter, setFilter] = useState<"all" | "unread" | "urgent">("all");
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useRealtimeNotifications({
    userId,
    onNewNotification: (notification) => {
      console.log('New notification received:', notification);
    }
  });

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setSelectedNotification(notification);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
    if (selectedNotification?.id === notificationId) {
      setSelectedNotification(null);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case "unread":
        return !notification.is_read;
      case "urgent":
        return notification.priority === "urgent";
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600 mt-1">
            Mantente informado sobre tu salud y citas médicas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center space-x-1 text-green-600">
              <Wifi className="w-4 h-4" />
              <span className="text-sm">Conectado</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-red-600">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm">Desconectado</span>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4 mr-1" />
                Marcar todas como leídas
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              Todas ({notifications.length})
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
            >
              No leídas ({unreadCount})
            </Button>
            <Button
              variant={filter === "urgent" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("urgent")}
            >
              Urgentes ({notifications.filter((n) => n.priority === "urgent").length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay notificaciones para mostrar</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.notification_type);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      !notification.is_read
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                        : "bg-background"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`p-2 rounded-full ${
                            !notification.is_read
                              ? "bg-blue-100 dark:bg-blue-900"
                              : "bg-muted"
                          }`}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={`font-medium ${
                                !notification.is_read
                                  ? "text-blue-900 dark:text-blue-100"
                                  : ""
                              }`}
                            >
                              {notification.title}
                            </h4>
                            <Badge
                              variant={getPriorityColor(notification.priority)}
                              className="text-xs"
                            >
                              {getPriorityLabel(notification.priority)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getNotificationTypeLabel(notification.notification_type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedNotification.title}
              </h3>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Tipo</label>
                  <p className="text-gray-900">
                    {getNotificationTypeLabel(selectedNotification.notification_type)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Prioridad</label>
                  <p className="text-gray-900">
                    {getPriorityLabel(selectedNotification.priority)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha</label>
                  <p className="text-gray-900">
                    {new Date(selectedNotification.created_at).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <p className="text-gray-900">
                    {selectedNotification.is_read ? 'Leída' : 'No leída'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Mensaje</label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>
              
              {selectedNotification.action_url && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900">Acción Requerida</h4>
                  <p className="text-blue-800 mt-1">
                    Esta notificación requiere una acción de tu parte.
                  </p>
                  <Button 
                    className="mt-3"
                    onClick={() => window.open(selectedNotification.action_url, '_blank')}
                  >
                    Realizar Acción
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={() => handleDeleteNotification(selectedNotification.id)}
                variant="outline"
              >
                Eliminar
              </Button>
              <Button
                onClick={() => setSelectedNotification(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}