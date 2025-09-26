/**
 * React Memo Optimization Service
 * @fileoverview Service for optimizing React re-renders with memo and useMemo
 * @compliance HIPAA-compliant React optimization with performance monitoring
 */

import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Memo configuration
 */
interface MemoConfig {
  displayName?: string;
  areEqual?: (prevProps: any, nextProps: any) => boolean;
  trackRenders?: boolean;
  logPerformance?: boolean;
}

/**
 * Render statistics
 */
interface RenderStats {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  propsChanges: number;
  unnecessaryRenders: number;
}

/**
 * React Memo Optimization Service
 */
export class ReactMemoService {
  private static renderStats = new Map<string, RenderStats>();
  private static performanceObserver: PerformanceObserver | null = null;

  /**
   * Create optimized memo component with performance tracking
   */
  static createOptimizedMemo<T extends React.ComponentType<any>>(
    Component: T,
    config: MemoConfig = {}
  ): T {
    const {
      displayName = Component.displayName || Component.name || 'MemoComponent',
      areEqual,
      trackRenders = true,
      logPerformance = false
    } = config;

    const MemoizedComponent = memo(Component, areEqual);
    MemoizedComponent.displayName = `OptimizedMemo(${displayName})`;

    if (trackRenders) {
      return this.trackRenders(MemoizedComponent, displayName, logPerformance) as T;
    }

    return MemoizedComponent;
  }

  /**
   * Create optimized memo for medical form components
   */
  static createMedicalFormMemo<T extends React.ComponentType<any>>(
    Component: T,
    config: MemoConfig = {}
  ): T {
    return this.createOptimizedMemo(Component, {
      ...config,
      areEqual: (prevProps, nextProps) => {
        // Custom equality check for medical forms
        const importantProps = ['value', 'error', 'isValid', 'isLoading', 'disabled'];
        
        for (const prop of importantProps) {
          if (prevProps[prop] !== nextProps[prop]) {
            return false;
          }
        }

        // Check if validation state changed
        if (prevProps.validationState !== nextProps.validationState) {
          return false;
        }

        // Check if form step changed
        if (prevProps.currentStep !== nextProps.currentStep) {
          return false;
        }

        return true;
      },
      trackRenders: true,
      logPerformance: true
    });
  }

  /**
   * Create optimized memo for list components
   */
  static createListMemo<T extends React.ComponentType<any>>(
    Component: T,
    config: MemoConfig = {}
  ): T {
    return this.createOptimizedMemo(Component, {
      ...config,
      areEqual: (prevProps, nextProps) => {
        // Check if data array changed
        if (prevProps.data !== nextProps.data) {
          return false;
        }

        // Check if loading state changed
        if (prevProps.isLoading !== nextProps.isLoading) {
          return false;
        }

        // Check if error state changed
        if (prevProps.error !== nextProps.error) {
          return false;
        }

        // Check if pagination changed
        if (prevProps.page !== nextProps.page || prevProps.pageSize !== nextProps.pageSize) {
          return false;
        }

        return true;
      },
      trackRenders: true,
      logPerformance: true
    });
  }

  /**
   * Track component renders for performance monitoring
   */
  private static trackRenders<T extends React.ComponentType<any>>(
    Component: T,
    componentName: string,
    logPerformance: boolean
  ): T {
    const WrappedComponent = React.forwardRef<any, any>((props, ref) => {
      const renderStartTime = useRef<number>(0);
      const renderCount = useRef<number>(0);

      useEffect(() => {
        renderStartTime.current = performance.now();
        renderCount.current += 1;

        const renderTime = performance.now() - renderStartTime.current;

        // Update render statistics
        const stats = this.renderStats.get(componentName) || {
          componentName,
          renderCount: 0,
          lastRenderTime: 0,
          averageRenderTime: 0,
          propsChanges: 0,
          unnecessaryRenders: 0
        };

        stats.renderCount = renderCount.current;
        stats.lastRenderTime = renderTime;
        stats.averageRenderTime = (stats.averageRenderTime + renderTime) / 2;

        this.renderStats.set(componentName, stats);

        // Log performance if enabled
        if (logPerformance && renderTime > 16) { // Log slow renders (>16ms)
          logSecurityEvent('PERFORMANCE_WARNING', {
            component: componentName,
            renderTime,
            renderCount: renderCount.current,
            props: Object.keys(props)
          });
        }
      });

      return React.createElement(Component, { ...props, ref });
    });

    WrappedComponent.displayName = `TrackedMemo(${componentName})`;
    return WrappedComponent as T;
  }

  /**
   * Get render statistics for a component
   */
  static getRenderStats(componentName: string): RenderStats | undefined {
    return this.renderStats.get(componentName);
  }

  /**
   * Get all render statistics
   */
  static getAllRenderStats(): Map<string, RenderStats> {
    return new Map(this.renderStats);
  }

  /**
   * Clear render statistics
   */
  static clearRenderStats(): void {
    this.renderStats.clear();
  }

  /**
   * Get performance summary
   */
  static getPerformanceSummary(): {
    totalComponents: number;
    totalRenders: number;
    averageRenderTime: number;
    slowComponents: Array<{ name: string; averageTime: number }>;
  } {
    const components = Array.from(this.renderStats.values());
    const totalRenders = components.reduce((sum, comp) => sum + comp.renderCount, 0);
    const averageRenderTime = components.reduce((sum, comp) => sum + comp.averageRenderTime, 0) / components.length;
    
    const slowComponents = components
      .filter(comp => comp.averageRenderTime > 16)
      .map(comp => ({ name: comp.componentName, averageTime: comp.averageRenderTime }))
      .sort((a, b) => b.averageTime - a.averageTime);

    return {
      totalComponents: components.length,
      totalRenders,
      averageRenderTime: averageRenderTime || 0,
      slowComponents
    };
  }

  /**
   * Initialize performance monitoring
   */
  static initializePerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name.includes('react-render')) {
            const componentName = entry.name.replace('react-render-', '');
            const stats = this.renderStats.get(componentName);
            
            if (stats) {
              stats.lastRenderTime = entry.duration;
              stats.averageRenderTime = (stats.averageRenderTime + entry.duration) / 2;
              this.renderStats.set(componentName, stats);
            }
          }
        });
      });

      this.performanceObserver.observe({ entryTypes: ['measure'] });
    }
  }

  /**
   * Cleanup performance monitoring
   */
  static cleanupPerformanceMonitoring(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
  }
}

/**
 * Custom hooks for optimized memoization
 */

/**
 * Hook for optimized memoization with performance tracking
 */
export function useOptimizedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: {
    name?: string;
    trackPerformance?: boolean;
  } = {}
): T {
  const { name = 'useMemo', trackPerformance = false } = options;
  const startTime = useRef<number>(0);

  if (trackPerformance) {
    startTime.current = performance.now();
  }

  const memoizedValue = useMemo(() => {
    const result = factory();
    
    if (trackPerformance) {
      const executionTime = performance.now() - startTime.current;
      logSecurityEvent('PERFORMANCE_MEMO', {
        hook: name,
        executionTime,
        deps: deps.length
      });
    }

    return result;
  }, deps);

  return memoizedValue;
}

/**
 * Hook for optimized callback memoization with performance tracking
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  options: {
    name?: string;
    trackPerformance?: boolean;
  } = {}
): T {
  const { name = 'useCallback', trackPerformance = false } = options;

  const memoizedCallback = useCallback((...args: Parameters<T>) => {
    if (trackPerformance) {
      const startTime = performance.now();
      const result = callback(...args);
      const executionTime = performance.now() - startTime;
      
      logSecurityEvent('PERFORMANCE_CALLBACK', {
        hook: name,
        executionTime,
        argsCount: args.length
      });
      
      return result;
    }

    return callback(...args);
  }, deps);

  return memoizedCallback;
}

/**
 * Hook for component performance monitoring
 */
export function useComponentPerformance(componentName: string) {
  const renderCount = useRef<number>(0);
  const startTime = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;
    startTime.current = performance.now();

    return () => {
      const renderTime = performance.now() - startTime.current;
      
      if (renderTime > 16) { // Log slow renders
        logSecurityEvent('PERFORMANCE_WARNING', {
          component: componentName,
          renderTime,
          renderCount: renderCount.current
        });
      }
    };
  });

  return {
    renderCount: renderCount.current,
    startTime: startTime.current
  };
}

/**
 * Higher-order component for automatic memoization
 */
export function withOptimizedMemo<P extends object>(
  Component: React.ComponentType<P>,
  config: MemoConfig = {}
): React.ComponentType<P> {
  return ReactMemoService.createOptimizedMemo(Component, config);
}

/**
 * Higher-order component for medical form memoization
 */
export function withMedicalFormMemo<P extends object>(
  Component: React.ComponentType<P>,
  config: MemoConfig = {}
): React.ComponentType<P> {
  return ReactMemoService.createMedicalFormMemo(Component, config);
}

/**
 * Higher-order component for list memoization
 */
export function withListMemo<P extends object>(
  Component: React.ComponentType<P>,
  config: MemoConfig = {}
): React.ComponentType<P> {
  return ReactMemoService.createListMemo(Component, config);
}

// Initialize performance monitoring on module load
if (typeof window !== 'undefined') {
  ReactMemoService.initializePerformanceMonitoring();
}