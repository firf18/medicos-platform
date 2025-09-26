/**
 * Email Validation Service
 * @fileoverview Service responsible for email validation and availability checking
 * @compliance HIPAA-compliant email validation with audit trail
 */

import { createClient } from '@/lib/supabase/client';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';
import { sanitizeEmail } from '@/lib/security/sanitization/input-sanitizer';

export interface EmailValidationResult {
  isValid: boolean;
  isAvailable: boolean;
  error?: string;
  suggestions?: string[];
}

export interface EmailAvailabilityCheck {
  email: string;
  isAvailable: boolean;
  checkedAt: string;
  source: 'database' | 'cache';
}

/**
 * Email validation service with real Supabase integration
 */
export class EmailValidationService {
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  private static readonly MAX_EMAIL_LENGTH = 254;
  private static readonly DISALLOWED_DOMAINS = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
  
  /**
   * Validate email format and structure
   */
  static validateEmailFormat(email: string): EmailValidationResult {
    try {
      // Sanitize input
      const sanitizedEmail = sanitizeEmail(email);
      
      if (!sanitizedEmail) {
        return {
          isValid: false,
          isAvailable: false,
          error: 'Email es requerido'
        };
      }

      // Check length
      if (sanitizedEmail.length > this.MAX_EMAIL_LENGTH) {
        return {
          isValid: false,
          isAvailable: false,
          error: `Email no puede exceder ${this.MAX_EMAIL_LENGTH} caracteres`
        };
      }

      // Check format
      if (!this.EMAIL_REGEX.test(sanitizedEmail)) {
        return {
          isValid: false,
          isAvailable: false,
          error: 'Formato de email inválido'
        };
      }

      // Check for disallowed domains
      const domain = sanitizedEmail.split('@')[1]?.toLowerCase();
      if (domain && this.DISALLOWED_DOMAINS.includes(domain)) {
        return {
          isValid: false,
          isAvailable: false,
          error: 'Dominio de email no permitido',
          suggestions: ['Use un email profesional válido']
        };
      }

      // Check for consecutive dots
      if (sanitizedEmail.includes('..')) {
        return {
          isValid: false,
          isAvailable: false,
          error: 'Email no puede contener puntos consecutivos'
        };
      }

      return {
        isValid: true,
        isAvailable: false, // Will be checked separately
        error: undefined
      };

    } catch (error) {
      logSecurityEvent('email_validation_error', {
        email: email.substring(0, 10) + '***',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return {
        isValid: false,
        isAvailable: false,
        error: 'Error interno de validación'
      };
    }
  }

  /**
   * Check email availability in Supabase database
   */
  static async checkEmailAvailability(email: string): Promise<EmailAvailabilityCheck> {
    try {
      const supabase = createClient();
      
      // Validate format first
      const formatValidation = this.validateEmailFormat(email);
      if (!formatValidation.isValid) {
        throw new Error(formatValidation.error || 'Email inválido');
      }

      const sanitizedEmail = sanitizeEmail(email)!.toLowerCase();

      // Log the check attempt
      logSecurityEvent('email_availability_check_started', {
        email: sanitizedEmail.substring(0, 5) + '***',
        timestamp: new Date().toISOString()
      });

      // Check in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', sanitizedEmail)
        .maybeSingle();

      if (profileError) {
        logSecurityEvent('email_availability_check_error', {
          email: sanitizedEmail.substring(0, 5) + '***',
          error: profileError.message,
          timestamp: new Date().toISOString()
        });
        throw new Error('Error verificando disponibilidad del email');
      }

      // Check in doctor_registrations table (for pending registrations)
      const { data: registrationData, error: registrationError } = await supabase
        .from('doctor_registrations')
        .select('email')
        .eq('email', sanitizedEmail)
        .maybeSingle();

      if (registrationError) {
        logSecurityEvent('email_availability_check_error', {
          email: sanitizedEmail.substring(0, 5) + '***',
          error: registrationError.message,
          timestamp: new Date().toISOString()
        });
        throw new Error('Error verificando registros pendientes');
      }

      const isAvailable = !profileData && !registrationData;

      // Log the result
      logSecurityEvent('email_availability_check_completed', {
        email: sanitizedEmail.substring(0, 5) + '***',
        isAvailable,
        timestamp: new Date().toISOString()
      });

      return {
        email: sanitizedEmail,
        isAvailable,
        checkedAt: new Date().toISOString(),
        source: 'database'
      };

    } catch (error) {
      logSecurityEvent('email_availability_check_failed', {
        email: email.substring(0, 5) + '***',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * Comprehensive email validation (format + availability)
   */
  static async validateEmail(email: string): Promise<EmailValidationResult> {
    try {
      // First validate format
      const formatValidation = this.validateEmailFormat(email);
      if (!formatValidation.isValid) {
        return formatValidation;
      }

      // Then check availability
      const availabilityCheck = await this.checkEmailAvailability(email);
      
      return {
        isValid: true,
        isAvailable: availabilityCheck.isAvailable,
        error: availabilityCheck.isAvailable ? undefined : 'Este email ya está registrado'
      };

    } catch (error) {
      return {
        isValid: false,
        isAvailable: false,
        error: error instanceof Error ? error.message : 'Error verificando email'
      };
    }
  }

  /**
   * Suggest similar available emails
   */
  static async suggestAvailableEmails(baseEmail: string): Promise<string[]> {
    try {
      const [localPart, domain] = baseEmail.split('@');
      const suggestions: string[] = [];

      // Generate suggestions
      const variations = [
        `${localPart}1@${domain}`,
        `${localPart}2@${domain}`,
        `${localPart}.medico@${domain}`,
        `${localPart}.dr@${domain}`,
        `dr.${localPart}@${domain}`
      ];

      // Check availability of suggestions
      for (const suggestion of variations) {
        try {
          const check = await this.checkEmailAvailability(suggestion);
          if (check.isAvailable) {
            suggestions.push(suggestion);
            if (suggestions.length >= 3) break; // Limit to 3 suggestions
          }
        } catch {
          // Skip this suggestion if there's an error
          continue;
        }
      }

      return suggestions;

    } catch (error) {
      logSecurityEvent('email_suggestion_error', {
        baseEmail: baseEmail.substring(0, 5) + '***',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return [];
    }
  }
}
