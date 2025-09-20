'use client';

import { useEffect } from 'react';

/**
 * Hook personalizado para manejar errores de carga de chunks en la aplicación
 * 
 * Este hook escucha eventos de error en la ventana y detecta específicamente
 * errores de tipo ChunkLoadError para manejarlos adecuadamente.
 */
export const useChunkLoadErrorHandler = () => {
  useEffect(() => {
    // Función para manejar errores de chunk
    const handleChunkLoadError = (event: ErrorEvent) => {
      // Verificar si el error es un ChunkLoadError
      if (
        event.error?.name === 'ChunkLoadError' || 
        event.error?.message?.includes('ChunkLoadError') ||
        event.error?.message?.includes('Loading chunk') ||
        event.error?.message?.includes('load')
      ) {
        console.warn('ChunkLoadError detectado:', event.error);
        
        // Mostrar mensaje al usuario
        const errorMessage = document.createElement('div');
        errorMessage.innerHTML = `
          <div style="position: fixed; top: 20px; right: 20px; z-index: 9999; 
                      background: #fefefe; border: 1px solid #ddd; 
                      padding: 15px; border-radius: 5px; 
                      box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                      max-width: 300px;">
            <strong style="color: #e53e3e;">Error de carga</strong>
            <p style="margin: 5px 0; font-size: 14px;">
              No se pudieron cargar algunos componentes. 
              <button onclick="location.reload()" style="
                background: #3182ce; color: white; border: none; 
                padding: 5px 10px; border-radius: 3px; 
                cursor: pointer; margin-top: 5px; font-size: 12px;">
                Recargar
              </button>
            </p>
          </div>
        `;
        
        // Añadir mensaje al cuerpo del documento
        document.body.appendChild(errorMessage);
        
        // Eliminar mensaje después de 5 segundos
        setTimeout(() => {
          if (errorMessage.parentNode) {
            errorMessage.parentNode.removeChild(errorMessage);
          }
        }, 5000);
      }
    };

    // Añadir listener de errores
    window.addEventListener('error', handleChunkLoadError);
    
    // Limpiar listener al desmontar
    return () => {
      window.removeEventListener('error', handleChunkLoadError);
    };
  }, []);
};