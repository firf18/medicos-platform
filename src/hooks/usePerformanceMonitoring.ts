/**
 * Hook de Monitoreo de Rendimiento - Red-Salud
 * 
 * Este hook proporciona funcionalidades para monitorear el rendimiento
 * de la aplicación y registrar métricas importantes.
 */

import { useEffect, useRef } from 'react';
import { logger } from '@/lib/logging/logger';

interface PerformanceMetrics {
  navigationStart: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  pageLoad: number;
  memoryUsage?: MemoryInfo;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export function usePerformanceMonitoring(pageName: string) {
  const metricsRef = useRef<PerformanceMetrics>({
    navigationStart: performance.timing.navigationStart,
    domContentLoaded: 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
    pageLoad: 0
  });

  useEffect(() => {
    // Registrar inicio de carga de página
    logger.info('performance', `Page load started: ${pageName}`, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });

    // Medir tiempos de carga
    const measurePerformance = () => {
      // DOM Content Loaded
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        metricsRef.current.domContentLoaded = Date.now() - metricsRef.current.navigationStart;
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          metricsRef.current.domContentLoaded = Date.now() - metricsRef.current.navigationStart;
        });
      }

      // First Paint
      if ('performance' in window && performance.getEntriesByName) {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaintEntry = paintEntries.find(entry => entry.name === 'first-paint');
        if (firstPaintEntry) {
          metricsRef.current.firstPaint = firstPaintEntry.startTime;
        }

        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          metricsRef.current.firstContentfulPaint = fcpEntry.startTime;
        }
      }

      // Page Load
      window.addEventListener('load', () => {
        metricsRef.current.pageLoad = Date.now() - metricsRef.current.navigationStart;
        
        // Registrar métricas completas
        logger.info('performance', `Page load completed: ${pageName}`, {
          metrics: {
            ...metricsRef.current,
            url: window.location.href,
            referrer: document.referrer
          }
        });

        // Verificar uso de memoria
        if ('memory' in performance) {
          const memory = (performance as any).memory as MemoryInfo;
          logger.info('performance', `Memory usage for ${pageName}`, {
            memory: {
              used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
              total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
              limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
            }
          });
        }
      });
    };

    measurePerformance();

    // Limpiar listeners
    return () => {
      // No es necesario limpiar los listeners de eventos estándar
    };
  }, [pageName]);

  // Función para medir tiempos de operaciones específicas
  const measureOperation = <T>(operationName: string, operation: () => T): T => {
    const start = performance.now();
    const result = operation();
    const end = performance.now();
    
    const duration = end - start;
    
    logger.info('performance', `Operation ${operationName} completed`, {
      duration: `${duration.toFixed(2)}ms`,
      page: pageName
    });
    
    return result;
  };

  // Función para medir tiempos de operaciones asíncronas
  const measureAsyncOperation = async <T>(
    operationName: string, 
    operation: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();
    
    const duration = end - start;
    
    logger.info('performance', `Async operation ${operationName} completed`, {
      duration: `${duration.toFixed(2)}ms`,
      page: pageName
    });
    
    return result;
  };

  return {
    metrics: metricsRef.current,
    measureOperation,
    measureAsyncOperation
  };
}

// Hook específico para monitoreo de formularios
export function useFormPerformanceMonitoring(formName: string) {
  const { measureOperation, measureAsyncOperation } = usePerformanceMonitoring(`form-${formName}`);

  // Medir tiempo de validación de formularios
  const measureValidation = <T>(validation: () => T): T => {
    return measureOperation(`${formName}-validation`, validation);
  };

  // Medir tiempo de envío de formularios
  const measureSubmission = async <T>(submission: () => Promise<T>): Promise<T> => {
    return measureAsyncOperation(`${formName}-submission`, submission);
  };

  return {
    measureValidation,
    measureSubmission
  };
}