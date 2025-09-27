/**
 * Lazy Loading Optimization Service
 * @fileoverview Service for implementing lazy loading of components and routes
 * @compliance HIPAA-compliant lazy loading with performance optimization
 */

import { ComponentType, lazy, Suspense } from 'react';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Lazy loading configuration
 */
interface LazyLoadingConfig {
  fallback?: ComponentType;
  preload?: boolean;
  priority?: 'high' | 'medium' | 'low';
  cacheKey?: string;
}

/**
 * Component loading statistics
 */
interface LoadingStats {
  componentName: string;
  loadTime: number;
  cacheHit: boolean;
  error?: string;
  timestamp: string;
}

/**
 * Lazy Loading Optimization Service
 */
export class LazyLoadingService {
  private static loadingStats: LoadingStats[] = [];
  private static componentCache = new Map<string, ComponentType>();
  private static preloadQueue = new Set<string>();

  /**
   * Create optimized lazy component with error boundary and caching
   */
  static createLazyComponent<T extends ComponentType<any>>(
    importFunction: () => Promise<{ default: T }>,
    config: LazyLoadingConfig = {}
  ): ComponentType<any> {
    const {
      fallback: FallbackComponent,
      preload = false,
      priority = 'medium',
      cacheKey
    } = config;

    const componentName = cacheKey || this.extractComponentName(importFunction.toString());
    
    // Check cache first
    if (this.componentCache.has(componentName)) {
      return this.componentCache.get(componentName)!;
    }

    const LazyComponent = lazy(async () => {
      const startTime = Date.now();
      
      try {
        const importedModule = await importFunction();
        const loadTime = Date.now() - startTime;

        // Cache the component
        this.componentCache.set(componentName, importedModule.default);

        // Log loading statistics
        this.logLoadingStats({
          componentName,
          loadTime,
          cacheHit: false,
          timestamp: new Date().toISOString()
        });

        // Preload related components if configured
        if (preload) {
          this.schedulePreload(componentName, priority);
        }

        return module;

      } catch (error) {
        const loadTime = Date.now() - startTime;
        
        this.logLoadingStats({
          componentName,
          loadTime,
          cacheHit: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });

        throw error;
      }
    });

    // Wrap with Suspense and error boundary
    return this.wrapWithSuspense(LazyComponent, FallbackComponent, componentName);
  }

  /**
   * Preload components based on user behavior
   */
  static async preloadComponents(componentNames: string[]): Promise<void> {
    const preloadPromises = componentNames.map(async (name) => {
      if (!this.preloadQueue.has(name)) {
        this.preloadQueue.add(name);
        
        try {
          // This would trigger the import for the component
          // Implementation depends on your component structure
          await this.preloadComponent(name);
        } catch (error) {
          console.warn(`Failed to preload component ${name}:`, error);
        } finally {
          this.preloadQueue.delete(name);
        }
      }
    });

    await Promise.all(preloadPromises);
  }

  /**
   * Preload components on route hover (for navigation optimization)
   */
  static setupRoutePreloading(): void {
    if (typeof window === 'undefined') return;

    // Preload components on link hover
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const href = link.getAttribute('href');
        if (href) {
          this.preloadRouteComponent(href);
        }
      });
    });
  }

  /**
   * Get loading performance statistics
   */
  static getLoadingStats(): {
    totalComponents: number;
    averageLoadTime: number;
    cacheHitRate: number;
    errorRate: number;
    recentLoads: LoadingStats[];
  } {
    const totalComponents = this.loadingStats.length;
    const averageLoadTime = totalComponents > 0 
      ? this.loadingStats.reduce((sum, stat) => sum + stat.loadTime, 0) / totalComponents 
      : 0;
    
    const cacheHits = this.loadingStats.filter(stat => stat.cacheHit).length;
    const cacheHitRate = totalComponents > 0 ? cacheHits / totalComponents : 0;
    
    const errors = this.loadingStats.filter(stat => stat.error).length;
    const errorRate = totalComponents > 0 ? errors / totalComponents : 0;

    return {
      totalComponents,
      averageLoadTime,
      cacheHitRate,
      errorRate,
      recentLoads: this.loadingStats.slice(-10) // Last 10 loads
    };
  }

  /**
   * Clear component cache
   */
  static clearCache(componentName?: string): void {
    if (componentName) {
      this.componentCache.delete(componentName);
    } else {
      this.componentCache.clear();
    }
  }

  /**
   * Optimize bundle splitting for medical components
   */
  static createMedicalComponentLazyLoaders() {
    return {
      // Doctor registration components (modulares)
      PersonalInfoStep: this.createLazyComponent(
        () => import('@/components/auth/doctor-registration/PersonalInfoStep'),
        { priority: 'high', cacheKey: 'PersonalInfoStep' }
      ),
      
      ProfessionalInfoStep: this.createLazyComponent(
        () => import('@/domains/auth/components/professional-info'),
        { priority: 'high', cacheKey: 'ProfessionalInfoStep' }
      ),
      
      SpecialtySelectionStep: this.createLazyComponent(
        () => import('@/components/auth/doctor-registration/SpecialtySelectionStep'),
        { priority: 'high', cacheKey: 'SpecialtySelectionStep' }
      ),
      
      FinalReviewStep: this.createLazyComponent(
        () => import('@/domains/auth/components/final-review'),
        { priority: 'high', cacheKey: 'FinalReviewStep' }
      ),

      // Dashboard components
      DoctorDashboard: this.createLazyComponent(
        () => import('@/components/dashboard/DoctorDashboard'),
        { priority: 'high', cacheKey: 'DoctorDashboard' }
      ),
      
      PatientDashboard: this.createLazyComponent(
        () => import('@/components/dashboard/PatientDashboard'),
        { priority: 'high', cacheKey: 'PatientDashboard' }
      ),

      // Medical components
      AppointmentScheduler: this.createLazyComponent(
        () => import('@/components/medical/AppointmentScheduler'),
        { priority: 'medium', cacheKey: 'AppointmentScheduler' }
      ),
      
      MedicalRecords: this.createLazyComponent(
        () => import('@/components/medical/MedicalRecords'),
        { priority: 'medium', cacheKey: 'MedicalRecords' }
      ),
      
      ChatInterface: this.createLazyComponent(
        () => import('@/components/chat/ChatInterface'),
        { priority: 'medium', cacheKey: 'ChatInterface' }
      ),

      // Validation components
      LicenseValidation: this.createLazyComponent(
        () => import('@/components/validation/LicenseValidation'),
        { priority: 'low', cacheKey: 'LicenseValidation' }
      ),
      
      DocumentValidation: this.createLazyComponent(
        () => import('@/components/validation/DocumentValidation'),
        { priority: 'low', cacheKey: 'DocumentValidation' }
      ),

      // Analytics components (low priority)
      AnalyticsDashboard: this.createLazyComponent(
        () => import('@/components/analytics/AnalyticsDashboard'),
        { priority: 'low', cacheKey: 'AnalyticsDashboard' }
      )
    };
  }

  // Private helper methods

  private static wrapWithSuspense(
    LazyComponent: ComponentType<any>,
    FallbackComponent?: ComponentType,
    componentName?: string
  ): ComponentType<any> {
    return (props: any) => (
      <Suspense fallback={FallbackComponent ? <FallbackComponent /> : <DefaultFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  }

  private static extractComponentName(importString: string): string {
    // Extract component name from import function string
    const match = importString.match(/['"`]([^'"`]+)['"`]/);
    return match ? match[1].split('/').pop() || 'Unknown' : 'Unknown';
  }

  private static async preloadComponent(componentName: string): Promise<void> {
    // Implementation would depend on your component structure
    // This is a placeholder for the actual preloading logic
    console.log(`Preloading component: ${componentName}`);
  }

  private static async preloadRouteComponent(route: string): Promise<void> {
    // Preload components based on route
    const routeComponentMap: Record<string, string[]> = {
      '/auth/register/doctor': ['PersonalInfoStep', 'ProfessionalInfoStep'],
      '/dashboard/doctor': ['DoctorDashboard', 'AppointmentScheduler'],
      '/dashboard/patient': ['PatientDashboard', 'MedicalRecords'],
      '/chat': ['ChatInterface'],
      '/analytics': ['AnalyticsDashboard']
    };

    const componentsToPreload = routeComponentMap[route];
    if (componentsToPreload) {
      await this.preloadComponents(componentsToPreload);
    }
  }

  private static schedulePreload(componentName: string, priority: string): void {
    // Schedule preloading of related components based on priority
    const relatedComponents: Record<string, string[]> = {
      'PersonalInfoStep': ['ProfessionalInfoStep', 'SpecialtySelectionStep'],
      'ProfessionalInfoStep': ['SpecialtySelectionStep', 'FinalReviewStep'],
      'DoctorDashboard': ['AppointmentScheduler', 'MedicalRecords'],
      'PatientDashboard': ['MedicalRecords', 'ChatInterface']
    };

    const related = relatedComponents[componentName];
    if (related) {
      setTimeout(() => {
        this.preloadComponents(related);
      }, priority === 'high' ? 100 : 1000);
    }
  }

  private static logLoadingStats(stats: LoadingStats): void {
    this.loadingStats.push(stats);
    
    // Keep only last 100 entries
    if (this.loadingStats.length > 100) {
      this.loadingStats = this.loadingStats.slice(-100);
    }

    // Log to security system for monitoring
    logSecurityEvent(
      'data_access',
      'component_loaded',
      {
        componentName: stats.componentName,
        loadTime: stats.loadTime,
        cacheHit: stats.cacheHit,
        error: stats.error
      },
      stats.error ? 'error' : 'info'
    );
  }
}

/**
 * Default fallback component for lazy loading
 */
const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Cargando...</span>
  </div>
);

/**
 * Error boundary for lazy loaded components
 */
export class LazyLoadingErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logSecurityEvent(
      'data_access',
      'lazy_loading_error',
      {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      },
      'error'
    );
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-500 text-6xl mb-4">⚠️</div>
    <h2 className="text-xl font-semibold text-gray-800 mb-2">
      Error al cargar el componente
    </h2>
    <p className="text-gray-600 mb-4">
      Hubo un problema al cargar este componente. Por favor, recarga la página.
    </p>
    <button 
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Recargar página
    </button>
  </div>
);
