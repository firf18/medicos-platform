'use client';

import * as React from 'react';
import {
  Toast,
  ToastProvider,
  ToastViewport,
} from './toast';
import { useToast } from './use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <div className="font-medium">{title}</div>}
            {description && (
              <div className="text-sm opacity-90">{description}</div>
            )}
          </div>
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
