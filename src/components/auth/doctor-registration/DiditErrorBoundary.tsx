/**
 * Error Boundary para Didit Verification - Platform Médicos Elite
 * 
 * Captura errores específicos de verificación de identidad y proporciona
 * recuperación automática cuando sea posible
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Shield, Home } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  onGoBack?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class DiditErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log del error para auditoría médica
    console.error('Didit Verification Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount
    });

    // Reportar a servicio de monitoreo en producción
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }

    // Mostrar toast de error
    toast({
      title: 'Error en verificación de identidad',
      description: 'Se ha producido un error inesperado. El equipo técnico ha sido notificado.',
      variant: 'destructive'
    });
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // En una implementación real, esto enviaría el error a un servicio de monitoreo
      // como Sentry, LogRocket, o un servicio interno de auditoría médica
      const errorReport = {
        type: 'didit_verification_error',
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.state.retryCount
      };

      // Simular envío a servicio de monitoreo
      console.log('Error report sent:', errorReport);
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));

      // Llamar función de retry si está disponible
      if (this.props.onRetry) {
        this.props.onRetry();
      }

      toast({
        title: 'Reintentando verificación',
        description: `Intento ${this.state.retryCount + 1} de ${this.maxRetries}`,
        variant: 'default'
      });
    } else {
      toast({
        title: 'Límite de reintentos alcanzado',
        description: 'Por favor, contacte al soporte técnico',
        variant: 'destructive'
      });
    }
  };

  private handleGoBack = () => {
    if (this.props.onGoBack) {
      this.props.onGoBack();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const canRetry = this.state.retryCount < this.maxRetries;
      const isLastRetry = this.state.retryCount === this.maxRetries - 1;

      return (
        <div className="space-y-6">
          {/* Error Header */}
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error en Verificación de Identidad
            </h2>
            <p className="text-gray-600">
              Se ha producido un error inesperado durante el proceso de verificación
            </p>
          </div>

          {/* Error Details Card */}
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <Shield className="h-5 w-5" />
                Detalles del Error
              </CardTitle>
              <CardDescription className="text-red-700">
                Información técnica del error para el equipo de soporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {this.state.error?.message || 'Error desconocido'}
                </AlertDescription>
              </Alert>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-red-700">
                    Detalles técnicos (solo en desarrollo)
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto max-h-40">
                    {this.state.error?.stack}
                    {'\n\n'}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="text-sm text-red-700">
                <p><strong>Intento:</strong> {this.state.retryCount + 1} de {this.maxRetries}</p>
                <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            {canRetry && (
              <Button
                onClick={this.handleRetry}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                {isLastRetry ? 'Último Intento' : 'Reintentar Verificación'}
              </Button>
            )}

            <Button
              onClick={this.handleGoBack}
              size="lg"
              variant="outline"
              className="border-gray-500 text-gray-600 hover:bg-gray-50"
            >
              <Home className="h-5 w-5 mr-2" />
              Volver al Registro
            </Button>

            <Button
              onClick={this.handleReload}
              size="lg"
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Recargar Página
            </Button>
          </div>

          {/* Support Information */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>¿Necesita ayuda?</strong> Si el problema persiste, contacte al soporte técnico 
              en{' '}
              <a 
                href="mailto:soporte@red-salud.org" 
                className="text-blue-600 hover:underline"
              >
                soporte@red-salud.org
              </a>
              {' '}o llame al +58 212-555-0123.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DiditErrorBoundary;
