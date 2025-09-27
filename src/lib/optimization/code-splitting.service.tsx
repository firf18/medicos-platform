/**
 * Code Splitting Optimization Service
 * @fileoverview Service for implementing optimized code splitting by steps and routes
 * @compliance HIPAA-compliant code splitting with performance optimization
 */

import { ComponentType, lazy, Suspense } from 'react';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Code splitting configuration
 */
interface CodeSplittingConfig {
  priority: 'critical' | 'high' | 'medium' | 'low';
  preload?: boolean;
  fallback?: ComponentType;
  chunkName?: string;
  dependencies?: string[];
}

/**
 * Bundle analysis
 */
interface BundleAnalysis {
  chunkName: string;
  size: number;
  loadTime: number;
  dependencies: string[];
  priority: string;
}

/**
 * Code Splitting Optimization Service
 */
export class CodeSplittingService {
  private static bundleStats = new Map<string, BundleAnalysis>();
  private static preloadQueue = new Set<string>();
  private static loadedChunks = new Set<string>();

  /**
   * Create optimized code split for doctor registration steps
   */
  static createDoctorRegistrationSplits() {
    return {
      // Critical path - loaded immediately
      PersonalInfoStep: this.createOptimizedSplit(
        () => import('@/components/auth/doctor-registration/PersonalInfoStep'),
        {
          priority: 'critical',
          chunkName: 'doctor-registration-personal',
          preload: true
        }
      ),

      // High priority - preloaded after personal info (modular)
      ProfessionalInfoStep: this.createOptimizedSplit(
        () => import('@/domains/auth/components/professional-info'),
        {
          priority: 'high',
          chunkName: 'doctor-registration-professional',
          dependencies: ['doctor-registration-personal'],
          preload: true
        }
      ),

      // Medium priority - loaded when needed
      SpecialtySelectionStep: this.createOptimizedSplit(
        () => import('@/components/auth/doctor-registration/SpecialtySelectionStep'),
        {
          priority: 'medium',
          chunkName: 'doctor-registration-specialty',
          dependencies: ['doctor-registration-professional']
        }
      ),

      // Low priority - loaded last (modular)
      FinalReviewStep: this.createOptimizedSplit(
        () => import('@/domains/auth/components/final-review'),
        {
          priority: 'low',
          chunkName: 'doctor-registration-review',
          dependencies: ['doctor-registration-specialty']
        }
      )
    };
  }

  /**
   * Create optimized code split for dashboard components
   */
  static createDashboardSplits() {
    return {
      // Critical - main dashboard
      DoctorDashboard: this.createOptimizedSplit(
        () => import('@/components/dashboard/DoctorDashboard'),
        {
          priority: 'critical',
          chunkName: 'dashboard-doctor',
          preload: true
        }
      ),

      PatientDashboard: this.createOptimizedSplit(
        () => import('@/components/dashboard/PatientDashboard'),
        {
          priority: 'critical',
          chunkName: 'dashboard-patient',
          preload: true
        }
      ),

      // High priority - frequently used
      AppointmentScheduler: this.createOptimizedSplit(
        () => import('@/components/medical/AppointmentScheduler'),
        {
          priority: 'high',
          chunkName: 'medical-scheduler',
          dependencies: ['dashboard-doctor', 'dashboard-patient']
        }
      ),

      MedicalRecords: this.createOptimizedSplit(
        () => import('@/components/medical/MedicalRecords'),
        {
          priority: 'high',
          chunkName: 'medical-records',
          dependencies: ['dashboard-doctor', 'dashboard-patient']
        }
      ),

      // Medium priority - used occasionally
      ChatInterface: this.createOptimizedSplit(
        () => import('@/components/chat/ChatInterface'),
        {
          priority: 'medium',
          chunkName: 'chat-interface',
          dependencies: ['medical-records']
        }
      ),

      // Low priority - rarely used
      AnalyticsDashboard: this.createOptimizedSplit(
        () => import('@/components/analytics/AnalyticsDashboard'),
        {
          priority: 'low',
          chunkName: 'analytics-dashboard',
          dependencies: ['dashboard-doctor']
        }
      )
    };
  }

  /**
   * Create optimized code split for validation components
   */
  static createValidationSplits() {
    return {
      // High priority - used in registration
      LicenseValidation: this.createOptimizedSplit(
        () => import('@/components/validation/LicenseValidation'),
        {
          priority: 'high',
          chunkName: 'validation-license',
          preload: true
        }
      ),

      DocumentValidation: this.createOptimizedSplit(
        () => import('@/components/validation/DocumentValidation'),
        {
          priority: 'high',
          chunkName: 'validation-document',
          preload: true
        }
      ),

      // Medium priority - used occasionally
      SpecialtyValidation: this.createOptimizedSplit(
        () => import('@/components/validation/SpecialtyValidation'),
        {
          priority: 'medium',
          chunkName: 'validation-specialty',
          dependencies: ['validation-license']
        }
      ),

      // Low priority - rarely used
      EmailValidation: this.createOptimizedSplit(
        () => import('@/components/validation/EmailValidation'),
        {
          priority: 'low',
          chunkName: 'validation-email'
        }
      )
    };
  }

  /**
   * Create optimized code split for medical components
   */
  static createMedicalSplits() {
    return {
      // High priority - core medical functionality
      AppointmentManagement: this.createOptimizedSplit(
        () => import('@/components/medical/AppointmentManagement'),
        {
          priority: 'high',
          chunkName: 'medical-appointments',
          preload: true
        }
      ),

      PatientManagement: this.createOptimizedSplit(
        () => import('@/components/medical/PatientManagement'),
        {
          priority: 'high',
          chunkName: 'medical-patients',
          preload: true
        }
      ),

      // Medium priority - supporting features
      PrescriptionManagement: this.createOptimizedSplit(
        () => import('@/components/medical/PrescriptionManagement'),
        {
          priority: 'medium',
          chunkName: 'medical-prescriptions',
          dependencies: ['medical-patients']
        }
      ),

      LabResults: this.createOptimizedSplit(
        () => import('@/components/medical/LabResults'),
        {
          priority: 'medium',
          chunkName: 'medical-lab-results',
          dependencies: ['medical-patients']
        }
      ),

      // Low priority - advanced features
      Telemedicine: this.createOptimizedSplit(
        () => import('@/components/medical/Telemedicine'),
        {
          priority: 'low',
          chunkName: 'medical-telemedicine',
          dependencies: ['medical-appointments']
        }
      )
    };
  }

  /**
   * Create optimized split with performance tracking
   */
  private static createOptimizedSplit<T extends ComponentType<any>>(
    importFunction: () => Promise<{ default: T }>,
    config: CodeSplittingConfig
  ): ComponentType<any> {
    const {
      priority,
      preload = false,
      fallback: FallbackComponent,
      chunkName,
      dependencies = []
    } = config;

    const LazyComponent = lazy(async () => {
      const startTime = performance.now();
      
      try {
        // Check if dependencies are loaded
        for (const dep of dependencies) {
          if (!this.loadedChunks.has(dep)) {
            await this.preloadChunk(dep);
          }
        }

        const importedModule = await importFunction();
        const loadTime = performance.now() - startTime;

        // Track bundle statistics
        this.trackBundleLoad(chunkName || 'unknown', loadTime, dependencies, priority);

        // Mark as loaded
        if (chunkName) {
          this.loadedChunks.add(chunkName);
        }

        // Preload next chunks if configured
        if (preload) {
          this.schedulePreload(chunkName || 'unknown', priority);
        }

        return module;

      } catch (error) {
        const loadTime = performance.now() - startTime;
        
        this.logBundleError(chunkName || 'unknown', loadTime, error);
        throw error;
      }
    });

    // Wrap with Suspense
    return this.wrapWithSuspense(LazyComponent, FallbackComponent, chunkName);
  }

  /**
   * Preload chunks based on user behavior
   */
  static async preloadChunks(chunkNames: string[]): Promise<void> {
    const preloadPromises = chunkNames.map(async (chunkName) => {
      if (!this.preloadQueue.has(chunkName)) {
        this.preloadQueue.add(chunkName);
        
        try {
          await this.preloadChunk(chunkName);
        } catch (error) {
          console.warn(`Failed to preload chunk ${chunkName}:`, error);
        } finally {
          this.preloadQueue.delete(chunkName);
        }
      }
    });

    await Promise.all(preloadPromises);
  }

  /**
   * Setup intelligent preloading based on user behavior
   */
  static setupIntelligentPreloading(): void {
    if (typeof window === 'undefined') return;

    // Preload on route hover
    this.setupRoutePreloading();

    // Preload on user interaction patterns
    this.setupInteractionPreloading();

    // Preload based on time spent on page
    this.setupTimeBasedPreloading();
  }

  /**
   * Get bundle analysis statistics
   */
  static getBundleAnalysis(): {
    totalChunks: number;
    totalSize: number;
    averageLoadTime: number;
    chunks: BundleAnalysis[];
    performanceScore: number;
  } {
    const chunks = Array.from(this.bundleStats.values());
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const averageLoadTime = chunks.length > 0 
      ? chunks.reduce((sum, chunk) => sum + chunk.loadTime, 0) / chunks.length 
      : 0;

    // Calculate performance score (0-100)
    const performanceScore = this.calculatePerformanceScore(chunks);

    return {
      totalChunks: chunks.length,
      totalSize,
      averageLoadTime,
      chunks,
      performanceScore
    };
  }

  /**
   * Clear bundle statistics
   */
  static clearBundleStats(): void {
    this.bundleStats.clear();
    this.loadedChunks.clear();
    this.preloadQueue.clear();
  }

  // Private helper methods

  private static wrapWithSuspense(
    LazyComponent: ComponentType<any>,
    FallbackComponent?: ComponentType,
    chunkName?: string
  ): ComponentType<any> {
    return (props: any) => (
      <Suspense fallback={FallbackComponent ? <FallbackComponent /> : <DefaultFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  }

  private static async preloadChunk(chunkName: string): Promise<void> {
    // This would implement actual chunk preloading
    // For now, we'll simulate it
    console.log(`Preloading chunk: ${chunkName}`);
    
    // Simulate preload time
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private static trackBundleLoad(
    chunkName: string,
    loadTime: number,
    dependencies: string[],
    priority: string
  ): void {
    this.bundleStats.set(chunkName, {
      chunkName,
      size: 0, // Would be calculated from actual bundle size
      loadTime,
      dependencies,
      priority
    });

    this.logBundleLoad(chunkName, loadTime, priority);
  }

  private static schedulePreload(chunkName: string, priority: string): void {
    // Schedule preloading of related chunks based on priority
    const relatedChunks: Record<string, string[]> = {
      'doctor-registration-personal': ['doctor-registration-professional'],
      'doctor-registration-professional': ['doctor-registration-specialty'],
      'doctor-registration-specialty': ['doctor-registration-review'],
      'dashboard-doctor': ['medical-scheduler', 'medical-records'],
      'dashboard-patient': ['medical-records', 'chat-interface']
    };

    const related = relatedChunks[chunkName];
    if (related) {
      const delay = priority === 'critical' ? 100 : 1000;
      setTimeout(() => {
        this.preloadChunks(related);
      }, delay);
    }
  }

  private static setupRoutePreloading(): void {
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const href = link.getAttribute('href');
        if (href) {
          this.preloadRouteChunks(href);
        }
      });
    });
  }

  private static setupInteractionPreloading(): void {
    // Preload based on user interactions
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.closest('[data-preload]')) {
        const preloadChunks = target.getAttribute('data-preload')?.split(',') || [];
        this.preloadChunks(preloadChunks);
      }
    });
  }

  private static setupTimeBasedPreloading(): void {
    // Preload additional chunks after user spends time on page
    let timeOnPage = 0;
    const interval = setInterval(() => {
      timeOnPage += 5000; // 5 seconds

      if (timeOnPage === 10000) { // 10 seconds
        this.preloadChunks(['validation-license', 'validation-document']);
      } else if (timeOnPage === 30000) { // 30 seconds
        this.preloadChunks(['medical-prescriptions', 'medical-lab-results']);
      } else if (timeOnPage === 60000) { // 1 minute
        this.preloadChunks(['analytics-dashboard', 'medical-telemedicine']);
        clearInterval(interval);
      }
    }, 5000);
  }

  private static async preloadRouteChunks(route: string): Promise<void> {
    const routeChunkMap: Record<string, string[]> = {
      '/auth/register/doctor': ['doctor-registration-professional', 'validation-license'],
      '/dashboard/doctor': ['medical-scheduler', 'medical-records'],
      '/dashboard/patient': ['medical-records', 'chat-interface'],
      '/appointments': ['medical-appointments'],
      '/patients': ['medical-patients'],
      '/chat': ['chat-interface'],
      '/analytics': ['analytics-dashboard']
    };

    const chunksToPreload = routeChunkMap[route];
    if (chunksToPreload) {
      await this.preloadChunks(chunksToPreload);
    }
  }

  private static calculatePerformanceScore(chunks: BundleAnalysis[]): number {
    // Calculate performance score based on load times and priorities
    const criticalChunks = chunks.filter(c => c.priority === 'critical');
    const highPriorityChunks = chunks.filter(c => c.priority === 'high');
    
    const criticalAvgTime = criticalChunks.length > 0 
      ? criticalChunks.reduce((sum, c) => sum + c.loadTime, 0) / criticalChunks.length 
      : 0;
    
    const highAvgTime = highPriorityChunks.length > 0 
      ? highPriorityChunks.reduce((sum, c) => sum + c.loadTime, 0) / highPriorityChunks.length 
      : 0;

    // Score based on load times (lower is better)
    let score = 100;
    if (criticalAvgTime > 1000) score -= 30; // Critical chunks should load in <1s
    if (highAvgTime > 2000) score -= 20; // High priority chunks should load in <2s
    
    return Math.max(0, score);
  }

  private static logBundleLoad(chunkName: string, loadTime: number, priority: string): void {
    logSecurityEvent(
      'data_access',
      'bundle_loaded',
      {
        chunkName,
        loadTime,
        priority,
        performanceLevel: loadTime > 1000 ? 'slow' : 'fast'
      },
      loadTime > 1000 ? 'warning' : 'info'
    );
  }

  private static logBundleError(chunkName: string, loadTime: number, error: any): void {
    logSecurityEvent(
      'data_access',
      'bundle_load_error',
      {
        chunkName,
        loadTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      'error'
    );
  }
}

/**
 * Default fallback component for code splitting
 */
const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Cargando módulo...</span>
  </div>
);

/**
 * Pre-configured code splits for the medical platform
 */
export const MedicalCodeSplits = {
  // Doctor registration flow
  ...CodeSplittingService.createDoctorRegistrationSplits(),
  
  // Dashboard components
  ...CodeSplittingService.createDashboardSplits(),
  
  // Validation components
  ...CodeSplittingService.createValidationSplits(),
  
  // Medical components
  ...CodeSplittingService.createMedicalSplits()
};
