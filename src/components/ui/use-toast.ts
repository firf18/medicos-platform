import { useState } from 'react'

export interface Toast {
  id?: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function toast({ title, description, variant = 'default' }: Toast) {
  // Simple implementation - in a real app you'd use a toast library
  if (typeof window !== 'undefined') {
    console.log(`Toast [${variant}]: ${title} - ${description}`)
    // You could also use window.alert for now
    if (variant === 'destructive') {
      alert(`Error: ${title}\n${description}`)
    }
  }
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  return {
    toast,
    toasts,
    dismiss: (id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }
  }
}