"use client";

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
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "appointment" | "medication" | "lab_result" | "message" | "reminder";
  priority: "low" | "medium" | "high";
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Cita Médica Próxima",
    message: "Tienes una cita con Dr. García mañana a las 10:00 AM",
    type: "appointment",
    priority: "high",
    timestamp: "2024-01-08T14:30:00Z",
    read: false,
    actionRequired: true,
  },
  {
    id: "2",
    title: "Resultados de Laboratorio",
    message: "Tus resultados de análisis de sangre están disponibles",
    type: "lab_result",
    priority: "medium",
    timestamp: "2024-01-08T10:15:00Z",
    read: false,
  },
  {
    id: "3",
    title: "Recordatorio de Medicación",
    message: "Es hora de tomar tu medicación para la presión arterial",
    type: "medication",
    priority: "high",
    timestamp: "2024-01-08T08:00:00Z",
    read: true,
    actionRequired: true,
  },
  {
    id: "4",
    title: "Mensaje del Dr. López",
    message: "He revisado tus síntomas. Todo parece estar bien.",
    type: "message",
    priority: "low",
    timestamp: "2024-01-07T16:45:00Z",
    read: true,
  },
  {
    id: "5",
    title: "Recordatorio de Chequeo",
    message: "Tu chequeo anual está programado para la próxima semana",
    type: "reminder",
    priority: "medium",
    timestamp: "2024-01-07T12:00:00Z",
    read: false,
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "appointment":
      return Calendar;
    case "medication":
      return Heart;
    case "lab_result":
      return FileText;
    case "message":
      return MessageSquare;
    case "reminder":
      return Clock;
    default:
      return Bell;
  }
};

const getPriorityColor = (priority: Notification["priority"]) => {
  switch (priority) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "default";
  }
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

interface NotificationsSectionProps {
  userId: string;
}

export default function NotificationsSection({ userId }: NotificationsSectionProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "priority">("all");

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case "unread":
        return !notification.read;
      case "priority":
        return notification.priority === "high";
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
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
              onClick={markAllAsRead}
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
            variant={filter === "priority" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("priority")}
          >
            Prioritarias (
            {notifications.filter((n) => n.priority === "high").length})
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
              const IconComponent = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    !notification.read
                      ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                      : "bg-background"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`p-2 rounded-full ${
                          !notification.read
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
                              !notification.read
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
                            {notification.priority === "high"
                              ? "Alta"
                              : notification.priority === "medium"
                              ? "Media"
                              : "Baja"}
                          </Badge>
                          {notification.actionRequired && (
                            <Badge variant="outline" className="text-xs">
                              Acción requerida
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
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
  );
}
