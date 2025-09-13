import * as React from "react";

export interface Toast {
  id?: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function toast(props: Toast): void {
  // Implementation would go here
}

export function useToast(): {
  toast: typeof toast;
  toasts: Toast[];
  dismiss: (id: string) => void;
} {
  return null as any;
}