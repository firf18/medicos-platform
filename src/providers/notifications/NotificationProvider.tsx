'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type NotificationType = 'success' | 'error' | 'warning' | 'info'
type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  position?: NotificationPosition
  closable?: boolean
  icon?: ReactNode
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = { 
      id,
      duration: 5000,
      position: 'top-right',
      closable: true,
      ...notification
    }
    
    setNotifications((prev) => [...prev, newNotification])
    
    // Auto remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAllNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}