'use client';

import React, { Component, ErrorInfo } from 'react';

interface ChunkLoadErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ChunkLoadErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ChunkLoadErrorBoundary extends Component<
  ChunkLoadErrorBoundaryProps,
  ChunkLoadErrorBoundaryState
> {
  constructor(props: ChunkLoadErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ChunkLoadErrorBoundaryState {
    // Detectar específicamente errores de carga de chunks
    const isChunkLoadError = error?.message?.includes('ChunkLoadError') || 
                            error?.message?.includes('Loading chunk') ||
                            error?.name?.includes('ChunkLoadError');
    
    return { 
      hasError: isChunkLoadError,
      error: isChunkLoadError ? error : null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Registrar el error en consola
    console.error('ChunkLoadErrorBoundary caught an error:', error, errorInfo);
    
    // Detectar errores de carga de chunks
    if (error?.message?.includes('ChunkLoadError') || 
        error?.message?.includes('Loading chunk') ||
        error?.name?.includes('ChunkLoadError')) {
      
      // Intentar recargar el chunk fallido
      if (typeof window !== 'undefined') {
        // Limpiar caché y recargar
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
        }
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // Mostrar componente de fallback personalizado o por defecto
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Componente de fallback por defecto
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error de carga</h2>
            <p className="text-gray-700 mb-4">
              No se pudieron cargar algunos componentes de la aplicación. 
              Esto puede deberse a problemas de red o a una versión desactualizada.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined' && window.location) {
                    window.location.reload();
                  }
                }} 
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                Recargar página
              </button>
              <button 
                onClick={() => {
                  // Limpiar caché y recargar
                  if (typeof window !== 'undefined' && 'caches' in window && window.location) {
                    caches.keys().then(names => {
                      names.forEach(name => {
                        caches.delete(name);
                      });
                      window.location.reload();
                    });
                  } else if (typeof window !== 'undefined' && window.location) {
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Limpiar caché y recargar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
