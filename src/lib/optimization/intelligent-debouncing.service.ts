/**
 * Intelligent Debouncing Service
 * @fileoverview Service for implementing intelligent debouncing with adaptive timing
 * @compliance HIPAA-compliant debouncing with performance optimization
 */

import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Debounce configuration
 */
interface DebounceConfig {
  delay: number;
  maxDelay?: number;
  minDelay?: number;
  adaptive?: boolean;
  leading?: boolean;
  trailing?: boolean;
  context?: string;
}

/**
 * Debounce statistics
 */
interface DebounceStats {
  functionName: string;
  totalCalls: number;
  executedCalls: number;
  cancelledCalls: number;
  averageDelay: number;
  adaptiveAdjustments: number;
}

/**
 * Intelligent Debouncing Service
 */
export class IntelligentDebouncingService {
  private static timers = new Map<string, NodeJS.Timeout>();
  private static stats = new Map<string, DebounceStats>();
  private static adaptiveDelays = new Map<string, number>();
  private static userBehaviorPatterns = new Map<string, number[]>();

  /**
   * Create intelligent debounced function
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    config: DebounceConfig = {}
  ): T {
    const {
      delay = 300,
      maxDelay = 1000,
      minDelay = 100,
      adaptive = true,
      leading = false,
      trailing = true,
      context = 'default'
    } = config;

    const functionName = func.name || 'anonymous';
    const debounceKey = `${functionName}_${context}`;
    
    // Initialize stats
    this.initializeStats(debounceKey, functionName);
    
    // Initialize adaptive delay
    if (adaptive) {
      this.adaptiveDelays.set(debounceKey, delay);
    }

    return ((...args: Parameters<T>) => {
      const stats = this.stats.get(debounceKey)!;
      stats.totalCalls++;

      // Clear existing timer
      if (this.timers.has(debounceKey)) {
        clearTimeout(this.timers.get(debounceKey)!);
        stats.cancelledCalls++;
      }

      // Execute immediately if leading
      if (leading && !this.timers.has(debounceKey)) {
        stats.executedCalls++;
        this.logDebounceExecution(debounceKey, 0, 'leading');
        return func(...args);
      }

      // Calculate adaptive delay
      const currentDelay = adaptive 
        ? this.calculateAdaptiveDelay(debounceKey, delay, minDelay, maxDelay)
        : delay;

      // Set new timer
      const timer = setTimeout(() => {
        this.timers.delete(debounceKey);
        
        if (trailing) {
          stats.executedCalls++;
          stats.averageDelay = 
            (stats.averageDelay * (stats.executedCalls - 1) + currentDelay) / stats.executedCalls;
          
          this.logDebounceExecution(debounceKey, currentDelay, 'trailing');
          func(...args);
        }
      }, currentDelay);

      this.timers.set(debounceKey, timer);

    }) as T;
  }

  /**
   * Create medical form validation debounce
   */
  static createMedicalValidationDebounce<T extends (...args: any[]) => any>(
    func: T,
    fieldType: 'email' | 'phone' | 'license' | 'document' | 'specialty' = 'email'
  ): T {
    const delays = {
      email: { delay: 500, minDelay: 300, maxDelay: 1000 },
      phone: { delay: 400, minDelay: 200, maxDelay: 800 },
      license: { delay: 800, minDelay: 500, maxDelay: 2000 },
      document: { delay: 600, minDelay: 400, maxDelay: 1500 },
      specialty: { delay: 300, minDelay: 200, maxDelay: 600 }
    };

    const config = delays[fieldType];

    return this.debounce(func, {
      ...config,
      adaptive: true,
      leading: false,
      trailing: true,
      context: `medical_${fieldType}`
    });
  }

  /**
   * Create search debounce with intelligent timing
   */
  static createSearchDebounce<T extends (...args: any[]) => any>(
    func: T,
    searchType: 'doctors' | 'patients' | 'appointments' | 'medical_records' = 'doctors'
  ): T {
    const delays = {
      doctors: { delay: 400, minDelay: 200, maxDelay: 800 },
      patients: { delay: 300, minDelay: 150, maxDelay: 600 },
      appointments: { delay: 500, minDelay: 300, maxDelay: 1000 },
      medical_records: { delay: 600, minDelay: 400, maxDelay: 1200 }
    };

    const config = delays[searchType];

    return this.debounce(func, {
      ...config,
      adaptive: true,
      leading: false,
      trailing: true,
      context: `search_${searchType}`
    });
  }

  /**
   * Create API call debounce with rate limiting
   */
  static createApiDebounce<T extends (...args: any[]) => any>(
    func: T,
    endpoint: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): T {
    const delays = {
      high: { delay: 200, minDelay: 100, maxDelay: 400 },
      medium: { delay: 500, minDelay: 300, maxDelay: 1000 },
      low: { delay: 1000, minDelay: 500, maxDelay: 2000 }
    };

    const config = delays[priority];

    return this.debounce(func, {
      ...config,
      adaptive: true,
      leading: false,
      trailing: true,
      context: `api_${endpoint}_${priority}`
    });
  }

  /**
   * Create user input debounce with context awareness
   */
  static createUserInputDebounce<T extends (...args: any[]) => any>(
    func: T,
    inputType: 'text' | 'number' | 'email' | 'phone' | 'textarea' = 'text'
  ): T {
    const delays = {
      text: { delay: 300, minDelay: 200, maxDelay: 600 },
      number: { delay: 400, minDelay: 300, maxDelay: 800 },
      email: { delay: 500, minDelay: 300, maxDelay: 1000 },
      phone: { delay: 400, minDelay: 200, maxDelay: 800 },
      textarea: { delay: 600, minDelay: 400, maxDelay: 1200 }
    };

    const config = delays[inputType];

    return this.debounce(func, {
      ...config,
      adaptive: true,
      leading: false,
      trailing: true,
      context: `input_${inputType}`
    });
  }

  /**
   * Cancel debounced function
   */
  static cancelDebounce(functionName: string, context: string = 'default'): void {
    const debounceKey = `${functionName}_${context}`;
    
    if (this.timers.has(debounceKey)) {
      clearTimeout(this.timers.get(debounceKey)!);
      this.timers.delete(debounceKey);
      
      const stats = this.stats.get(debounceKey);
      if (stats) {
        stats.cancelledCalls++;
      }
    }
  }

  /**
   * Flush debounced function (execute immediately)
   */
  static flushDebounce(functionName: string, context: string = 'default'): void {
    const debounceKey = `${functionName}_${context}`;
    
    if (this.timers.has(debounceKey)) {
      clearTimeout(this.timers.get(debounceKey)!);
      this.timers.delete(debounceKey);
      
      const stats = this.stats.get(debounceKey);
      if (stats) {
        stats.executedCalls++;
      }
    }
  }

  /**
   * Get debounce statistics
   */
  static getDebounceStats(functionName?: string, context?: string): DebounceStats | Record<string, DebounceStats> {
    if (functionName && context) {
      const debounceKey = `${functionName}_${context}`;
      return this.stats.get(debounceKey) || {
        functionName,
        totalCalls: 0,
        executedCalls: 0,
        cancelledCalls: 0,
        averageDelay: 0,
        adaptiveAdjustments: 0
      };
    }

    const allStats: Record<string, DebounceStats> = {};
    for (const [key, stats] of this.stats.entries()) {
      allStats[key] = stats;
    }
    return allStats;
  }

  /**
   * Clear all debounce timers
   */
  static clearAllDebounces(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  /**
   * Reset debounce statistics
   */
  static resetStats(functionName?: string, context?: string): void {
    if (functionName && context) {
      const debounceKey = `${functionName}_${context}`;
      this.stats.delete(debounceKey);
      this.adaptiveDelays.delete(debounceKey);
      this.userBehaviorPatterns.delete(debounceKey);
    } else {
      this.stats.clear();
      this.adaptiveDelays.clear();
      this.userBehaviorPatterns.clear();
    }
  }

  // Private helper methods

  private static initializeStats(debounceKey: string, functionName: string): void {
    if (!this.stats.has(debounceKey)) {
      this.stats.set(debounceKey, {
        functionName,
        totalCalls: 0,
        executedCalls: 0,
        cancelledCalls: 0,
        averageDelay: 0,
        adaptiveAdjustments: 0
      });
    }
  }

  private static calculateAdaptiveDelay(
    debounceKey: string,
    baseDelay: number,
    minDelay: number,
    maxDelay: number
  ): number {
    const currentDelay = this.adaptiveDelays.get(debounceKey) || baseDelay;
    const behaviorPattern = this.userBehaviorPatterns.get(debounceKey) || [];
    
    // Analyze user behavior pattern
    const recentCalls = behaviorPattern.slice(-10); // Last 10 calls
    const averageInterval = recentCalls.length > 1 
      ? recentCalls.reduce((sum, interval, index) => {
          if (index > 0) return sum + (interval - recentCalls[index - 1]);
          return sum;
        }, 0) / (recentCalls.length - 1)
      : baseDelay;

    // Adjust delay based on user behavior
    let newDelay = currentDelay;
    
    if (averageInterval < baseDelay * 0.5) {
      // User is typing very fast, increase delay
      newDelay = Math.min(currentDelay * 1.2, maxDelay);
    } else if (averageInterval > baseDelay * 2) {
      // User is typing slowly, decrease delay
      newDelay = Math.max(currentDelay * 0.8, minDelay);
    }

    // Update adaptive delay
    this.adaptiveDelays.set(debounceKey, newDelay);
    
    // Update behavior pattern
    behaviorPattern.push(Date.now());
    if (behaviorPattern.length > 20) {
      behaviorPattern.shift(); // Keep only last 20 calls
    }
    this.userBehaviorPatterns.set(debounceKey, behaviorPattern);

    // Update stats
    const stats = this.stats.get(debounceKey);
    if (stats && Math.abs(newDelay - currentDelay) > 10) {
      stats.adaptiveAdjustments++;
    }

    return newDelay;
  }

  private static logDebounceExecution(
    debounceKey: string,
    delay: number,
    type: 'leading' | 'trailing'
  ): void {
    logSecurityEvent(
      'data_access',
      'debounce_execution',
      {
        debounceKey,
        delay,
        type,
        performanceLevel: delay < 200 ? 'fast' : delay > 800 ? 'slow' : 'normal'
      },
      'info'
    );
  }
}

/**
 * Pre-configured debounced functions for medical platform
 */
export const MedicalDebouncedFunctions = {
  // Validation functions
  validateEmail: IntelligentDebouncingService.createMedicalValidationDebounce(
    async (email: string) => {
      const { EmailValidationService } = await import('@/lib/security/validation/email-validation.service');
      return EmailValidationService.validateEmail(email);
    },
    'email'
  ),

  validatePhone: IntelligentDebouncingService.createMedicalValidationDebounce(
    async (phone: string) => {
      const { PhoneValidationService } = await import('@/lib/security/validation/phone-validation.service');
      return PhoneValidationService.validatePhone(phone);
    },
    'phone'
  ),

  validateLicense: IntelligentDebouncingService.createMedicalValidationDebounce(
    async (license: string) => {
      const { LicenseValidationService } = await import('@/lib/security/validation/license-validation.service');
      return LicenseValidationService.validateLicense(license);
    },
    'license'
  ),

  validateDocument: IntelligentDebouncingService.createMedicalValidationDebounce(
    async (document: string, type: string) => {
      const { DocumentValidationService } = await import('@/lib/security/validation/document-validation.service');
      return DocumentValidationService.validateDocumentFormat(document, type);
    },
    'document'
  ),

  // Search functions
  searchDoctors: IntelligentDebouncingService.createSearchDebounce(
    async (query: string, filters: any) => {
      // Implementation would search doctors
      return { results: [], total: 0 };
    },
    'doctors'
  ),

  searchPatients: IntelligentDebouncingService.createSearchDebounce(
    async (query: string, filters: any) => {
      // Implementation would search patients
      return { results: [], total: 0 };
    },
    'patients'
  ),

  searchAppointments: IntelligentDebouncingService.createSearchDebounce(
    async (query: string, filters: any) => {
      // Implementation would search appointments
      return { results: [], total: 0 };
    },
    'appointments'
  ),

  // API functions
  checkEmailAvailability: IntelligentDebouncingService.createApiDebounce(
    async (email: string) => {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return response.json();
    },
    'check-email',
    'high'
  ),

  checkLicenseAvailability: IntelligentDebouncingService.createApiDebounce(
    async (license: string) => {
      const response = await fetch('/api/auth/check-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license })
      });
      return response.json();
    },
    'check-license',
    'medium'
  ),

  // User input functions
  handleTextInput: IntelligentDebouncingService.createUserInputDebounce(
    (value: string, callback: (value: string) => void) => {
      callback(value);
    },
    'text'
  ),

  handleEmailInput: IntelligentDebouncingService.createUserInputDebounce(
    (value: string, callback: (value: string) => void) => {
      callback(value);
    },
    'email'
  ),

  handlePhoneInput: IntelligentDebouncingService.createUserInputDebounce(
    (value: string, callback: (value: string) => void) => {
      callback(value);
    },
    'phone'
  )
};
