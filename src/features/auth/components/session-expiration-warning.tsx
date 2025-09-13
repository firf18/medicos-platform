'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function SessionExpirationWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeUntilExpiration, setTimeUntilExpiration] = useState<number | null>(null);
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const checkSessionExpiration = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error obteniendo sesión:', error);
          return;
        }
        
        if (session) {
          const expiresAt = session.expires_at;
          if (expiresAt) {
            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiration = expiresAt - now;
            
            // Si la sesión expira en menos de 5 minutos, mostrar advertencia
            if (timeUntilExpiration < 300 && timeUntilExpiration > 0) {
              setShowWarning(true);
              setTimeUntilExpiration(timeUntilExpiration);
              
              // Actualizar el tiempo restante cada segundo
              const interval = setInterval(() => {
                setTimeUntilExpiration(prev => {
                  if (prev !== null && prev > 0) {
                    return prev - 1;
                  }
                  return prev;
                });
              }, 1000);
              
              return () => clearInterval(interval);
            } else {
              setShowWarning(false);
            }
          }
        }
      } catch (error) {
        console.error('Error verificando expiración de sesión:', error);
      }
    };
    
    // Verificar inmediatamente y luego cada minuto
    checkSessionExpiration();
    const interval = setInterval(checkSessionExpiration, 60000);
    
    return () => clearInterval(interval);
  }, [supabase]);

  const handleRefreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      if (data.session) {
        setShowWarning(false);
        toast({
          title: 'Sesión actualizada',
          description: 'Tu sesión ha sido actualizada exitosamente.',
        });
      }
    } catch (error) {
      console.error('Error refrescando sesión:', error);
      toast({
        title: 'Error al actualizar sesión',
        description: 'No se pudo actualizar tu sesión. Por favor, inicia sesión nuevamente.',
        variant: 'destructive',
      });
      router.push('/login');
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {showWarning && timeUntilExpiration !== null && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 w-full max-w-sm"
        >
          <Alert variant="destructive">
            <AlertTitle>Sesión a punto de expirar</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                Tu sesión expirará en <span className="font-bold">{formatTime(timeUntilExpiration)}</span>.
              </p>
              <p>
                Guarda tu trabajo y considera actualizar tu sesión.
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={handleRefreshSession}>
                  Actualizar sesión
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push('/login')}>
                  Iniciar sesión nuevamente
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}