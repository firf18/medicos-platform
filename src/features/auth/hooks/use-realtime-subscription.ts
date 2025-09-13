'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

export type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface SubscriptionCallbackPayload<T> {
  eventType: SubscriptionEvent;
  newRecord?: T;
  oldRecord?: T;
  recordId?: string;
}

export function useRealtimeSubscription<T>(
  tableName: string,
  callback: (payload: SubscriptionCallbackPayload<T>) => void,
  filter?: string
) {
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient() as SupabaseClient;

  const subscribe = useCallback(() => {
    try {
      // Crear un canal para la suscripción
      const channel = supabase.channel(`realtime:${tableName}`);
      
      // Configurar la suscripción
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
            filter: filter || undefined,
          },
          (payload) => {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            
            callback({
              eventType: eventType as SubscriptionEvent,
              newRecord: newRecord as T,
              oldRecord: oldRecord as T,
              recordId: newRecord?.id || oldRecord?.id,
            });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`✅ Suscrito a cambios en tiempo real para la tabla ${tableName}`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`❌ Error en la suscripción a ${tableName}`);
            setError(new Error(`Error en la suscripción a ${tableName}`));
          } else if (status === 'TIMED_OUT') {
            console.error(`⏰ Timeout en la suscripción a ${tableName}`);
            setError(new Error(`Timeout en la suscripción a ${tableName}`));
          }
        });
      
      setSubscription(channel);
      setError(null);
    } catch (err) {
      console.error('Error al crear la suscripción:', err);
      setError(err as Error);
    }
  }, [supabase, tableName, filter, callback]);

  const unsubscribe = useCallback(() => {
    if (subscription) {
      supabase.removeChannel(subscription);
      setSubscription(null);
    }
  }, [subscription, supabase]);

  useEffect(() => {
    // Suscribirse cuando el componente se monta
    subscribe();
    
    // Limpiar la suscripción cuando el componente se desmonta
    return () => {
      unsubscribe();
    };
  }, [subscribe, unsubscribe]);

  return {
    subscription,
    error,
    isLoading: !subscription && !error,
    subscribe,
    unsubscribe,
  };
}

// Hook específico para suscripciones a notificaciones
export function useNotificationSubscription(
  userId: string,
  callback: (payload: SubscriptionCallbackPayload<any>) => void
) {
  return useRealtimeSubscription('notifications', callback, `user_id=eq.${userId}`);
}

// Hook específico para suscripciones a citas
export function useAppointmentSubscription(
  userId: string,
  callback: (payload: SubscriptionCallbackPayload<any>) => void
) {
  return useRealtimeSubscription(
    'appointments', 
    callback, 
    `or(patient_id.eq.${userId},doctor_id.eq.${userId})`
  );
}

// Hook específico para suscripciones a resultados de laboratorio
export function useLabResultSubscription(
  userId: string,
  callback: (payload: SubscriptionCallbackPayload<any>) => void
) {
  return useRealtimeSubscription('lab_results', callback, `patient_id=eq.${userId}`);
}