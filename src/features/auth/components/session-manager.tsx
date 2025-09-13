'use client';

import { useState, useEffect } from 'react';
import { useAdvancedSession } from '@/features/auth/hooks/use-advanced-session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  RefreshCw, 
  LogOut, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

export function SessionManager() {
  const {
    session,
    isLoading,
    isRefreshing,
    error,
    lastRefresh,
    getSession,
    refreshSession,
    signOutAllTabs
  } = useAdvancedSession();
  
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<string>('');
  const [sessionStatus, setSessionStatus] = useState<'active' | 'expiring' | 'expired' | 'invalid'>('active');

  // Calcular tiempo hasta expiración y estado de la sesión
  useEffect(() => {
    if (!session?.expires_at) return;
    
    const updateExpiryInfo = () => {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      const timeUntilExpirySeconds = expiresAt - now;
      
      // Formatear tiempo hasta expiración
      if (timeUntilExpirySeconds > 0) {
        setTimeUntilExpiry(
          formatDistanceToNow(new Date(expiresAt * 1000), {
            addSuffix: true,
            locale: es
          })
        );
      } else {
        setTimeUntilExpiry('Expirada');
      }
      
      // Determinar estado de la sesión
      if (timeUntilExpirySeconds <= 0) {
        setSessionStatus('expired');
      } else if (timeUntilExpirySeconds < 300) { // Menos de 5 minutos
        setSessionStatus('expiring');
      } else {
        setSessionStatus('active');
      }
    };
    
    updateExpiryInfo();
    const interval = setInterval(updateExpiryInfo, 1000);
    
    return () => clearInterval(interval);
  }, [session?.expires_at]);

  // Formatear fecha de última actualización
  const formatLastRefresh = (timestamp: number | null) => {
    if (!timestamp) return 'Nunca';
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: es
    });
  };

  // Obtener ícono y color según estado de la sesión
  const getSessionStatusInfo = () => {
    switch (sessionStatus) {
      case 'active':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: 'Activa',
          variant: 'default'
        };
      case 'expiring':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
          text: 'Expirando',
          variant: 'destructive'
        };
      case 'expired':
        return {
          icon: <XCircle className="h-4 w-4 text-red-500" />,
          text: 'Expirada',
          variant: 'destructive'
        };
      default:
        return {
          icon: <Shield className="h-4 w-4 text-gray-500" />,
          text: 'Desconocida',
          variant: 'secondary'
        };
    }
  };

  const statusInfo = getSessionStatusInfo();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gestor de Sesión
          </CardTitle>
          <CardDescription>
            Cargando información de sesión...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Gestor de Sesión
        </CardTitle>
        <CardDescription>
          Información y herramientas para gestionar tu sesión
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              Error: {error.message}
            </p>
          </div>
        )}
        
        {session ? (
          <>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Estado de la Sesión</h3>
                <Badge 
                  variant={statusInfo.variant as any}
                  className="flex items-center gap-1"
                >
                  {statusInfo.icon}
                  {statusInfo.text}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Expira</span>
                  </div>
                  <p className="font-medium">
                    {timeUntilExpiry || 'No disponible'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4" />
                    <span>Última actualización</span>
                  </div>
                  <p className="font-medium">
                    {formatLastRefresh(lastRefresh)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">ID de Sesión</p>
                <p className="font-mono text-sm p-2 bg-muted rounded-md break-all">
                  {session.access_token.substring(0, 20)}...
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Usuario</p>
                <p className="font-medium">
                  {session.user.email}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => refreshSession()}
                disabled={isRefreshing}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isRefreshing ? (
                  <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isRefreshing ? 'Actualizando...' : 'Actualizar Sesión'}
              </Button>
              
              <Button
                onClick={() => getSession()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Verificar Sesión
              </Button>
              
              <Button
                onClick={() => signOutAllTabs()}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión en Todas las Pestañas
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay sesión activa</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se ha encontrado una sesión de usuario activa.
            </p>
            <div className="mt-6">
              <Button onClick={() => getSession()}>
                Verificar Sesión
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}