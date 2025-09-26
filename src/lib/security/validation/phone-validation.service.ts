/**
 * Phone Validation Service
 * @fileoverview Service responsible for phone validation and availability checking
 * @compliance HIPAA-compliant phone validation with audit trail
 */

import { createClient } from '@/lib/supabase/client';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';
import { sanitizePhone } from '@/lib/security/sanitization/input-sanitizer';

export interface PhoneValidationResult {
  isValid: boolean;
  isAvailable: boolean;
  formatted: string;
  error?: string;
  suggestions?: string[];
}

export interface PhoneAvailabilityCheck {
  phone: string;
  formatted: string;
  isAvailable: boolean;
  checkedAt: string;
  source: 'database' | 'cache';
}

/**
 * Venezuelan phone number patterns
 */
const VENEZUELAN_PHONE_PATTERNS = {
  mobile: {
    pattern: /^(\+58)(412|414|416|424|426)(\d{7})$/,
    carriers: {
      '412': 'Movistar',
      '414': 'Movistar',
      '416': 'Movistar',
      '424': 'Movilnet',
      '426': 'Movilnet'
    }
  },
  landline: {
    pattern: /^(\+58)2(\d{9})$/,
    description: 'Teléfono fijo de Caracas'
  }
};

/**
 * Phone validation service with real Supabase integration
 */
export class PhoneValidationService {
  private static readonly MAX_PHONE_LENGTH = 15;
  private static readonly MIN_PHONE_LENGTH = 10;

  /**
   * Validate Venezuelan phone number format
   */
  static validatePhoneFormat(phone: string): PhoneValidationResult {
    try {
      // Sanitize input
      const sanitizedPhone = sanitizePhone(phone);
      
      if (!sanitizedPhone) {
        return {
          isValid: false,
          isAvailable: false,
          formatted: '',
          error: 'Número de teléfono es requerido'
        };
      }

      // Remove all non-digit characters for validation
      const digitsOnly = sanitizedPhone.replace(/\D/g, '');

      // Check length
      if (digitsOnly.length < this.MIN_PHONE_LENGTH || digitsOnly.length > this.MAX_PHONE_LENGTH) {
        return {
          isValid: false,
          isAvailable: false,
          formatted: '',
          error: `Número de teléfono debe tener entre ${this.MIN_PHONE_LENGTH} y ${this.MAX_PHONE_LENGTH} dígitos`
        };
      }

      // Check Venezuelan mobile pattern (with +58 prefix)
      const mobileMatch = sanitizedPhone.match(VENEZUELAN_PHONE_PATTERNS.mobile.pattern);
      if (mobileMatch) {
        const carrier = mobileMatch[2];
        const carrierName = VENEZUELAN_PHONE_PATTERNS.mobile.carriers[carrier as keyof typeof VENEZUELAN_PHONE_PATTERNS.mobile.carriers];
        
        return {
          isValid: true,
          isAvailable: false, // Will be checked separately
          formatted: `+58${carrier}${mobileMatch[3]}`,
          error: undefined
        };
      }

      // Check Venezuelan landline pattern (with +58 prefix)
      const landlineMatch = sanitizedPhone.match(VENEZUELAN_PHONE_PATTERNS.landline.pattern);
      if (landlineMatch) {
        return {
          isValid: true,
          isAvailable: false, // Will be checked separately
          formatted: `+58${landlineMatch[2]}`,
          error: undefined
        };
      }

      // Check Venezuelan mobile pattern (without +58 prefix, just digits)
      const mobileDigitsMatch = digitsOnly.match(/^(412|414|416|424|426)(\d{7})$/);
      if (mobileDigitsMatch) {
        const carrier = mobileDigitsMatch[1];
        
        return {
          isValid: true,
          isAvailable: false, // Will be checked separately
          formatted: `+58${carrier}${mobileDigitsMatch[2]}`,
          error: undefined
        };
      }

      // Check Venezuelan landline pattern (without +58 prefix, just digits)
      const landlineDigitsMatch = digitsOnly.match(/^2(\d{9})$/);
      if (landlineDigitsMatch) {
        return {
          isValid: true,
          isAvailable: false, // Will be checked separately
          formatted: `+58${landlineDigitsMatch[0]}`,
          error: undefined
        };
      }

      return {
        isValid: false,
        isAvailable: false,
        formatted: '',
        error: 'Número de teléfono venezolano inválido. Use formato: +58XXXXXXXXX'
      };

    } catch (error) {
      logSecurityEvent('phone_validation_error', {
        phone: phone.substring(0, 5) + '***',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return {
        isValid: false,
        isAvailable: false,
        formatted: '',
        error: 'Error interno de validación'
      };
    }
  }

  /**
   * Format phone number to standard Venezuelan format
   */
  static formatPhoneNumber(phone: string): string {
    try {
      const sanitizedPhone = sanitizePhone(phone);
      if (!sanitizedPhone) return '';

      const digitsOnly = sanitizedPhone.replace(/\D/g, '');

      // Handle different input formats
      if (digitsOnly.length === 10) {
        // Format: 4121234567 -> +584121234567
        return `+58${digitsOnly}`;
      } else if (digitsOnly.length === 12 && digitsOnly.startsWith('58')) {
        // Format: 584121234567 -> +584121234567
        return `+${digitsOnly}`;
      } else if (digitsOnly.length === 11 && digitsOnly.startsWith('58')) {
        // Format: 58412123456 -> +58412123456
        return `+${digitsOnly}`;
      }

      return sanitizedPhone;

    } catch (error) {
      return phone;
    }
  }

  /**
   * Check phone availability in Supabase database
   */
  static async checkPhoneAvailability(phone: string): Promise<PhoneAvailabilityCheck> {
    try {
      const supabase = createClient();
      
      // Validate format first
      const formatValidation = this.validatePhoneFormat(phone);
      if (!formatValidation.isValid) {
        throw new Error(formatValidation.error || 'Teléfono inválido');
      }

      const formattedPhone = formatValidation.formatted;

      // Log the check attempt
      logSecurityEvent('phone_availability_check_started', {
        phone: formattedPhone.substring(0, 8) + '***',
        timestamp: new Date().toISOString()
      });

      // Check in profiles table - try multiple formats
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('phone')
        .or(`phone.eq.${formattedPhone},phone.eq.${formattedPhone.replace('+', '')},phone.eq.${formattedPhone.replace('+58', '')}`)
        .maybeSingle();

      if (profileError) {
        logSecurityEvent('phone_availability_check_error', {
          phone: formattedPhone.substring(0, 8) + '***',
          error: profileError.message,
          timestamp: new Date().toISOString()
        });
        throw new Error('Error verificando disponibilidad del teléfono');
      }

      // Check in doctor_registrations table (for pending registrations) - try multiple formats
      const { data: registrationData, error: registrationError } = await supabase
        .from('doctor_registrations')
        .select('phone')
        .or(`phone.eq.${formattedPhone},phone.eq.${formattedPhone.replace('+', '')},phone.eq.${formattedPhone.replace('+58', '')}`)
        .maybeSingle();

      if (registrationError) {
        logSecurityEvent('phone_availability_check_error', {
          phone: formattedPhone.substring(0, 8) + '***',
          error: registrationError.message,
          timestamp: new Date().toISOString()
        });
        throw new Error('Error verificando registros pendientes');
      }

      const isAvailable = !profileData && !registrationData;

      // Log the result with debug info
      logSecurityEvent('phone_availability_check_completed', {
        phone: formattedPhone.substring(0, 8) + '***',
        isAvailable,
        profileFound: !!profileData,
        registrationFound: !!registrationData,
        timestamp: new Date().toISOString()
      });

      return {
        phone: formattedPhone,
        formatted: formattedPhone,
        isAvailable,
        checkedAt: new Date().toISOString(),
        source: 'database'
      };

    } catch (error) {
      logSecurityEvent('phone_availability_check_failed', {
        phone: phone.substring(0, 8) + '***',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * Comprehensive phone validation (format + availability)
   */
  static async validatePhone(phone: string): Promise<PhoneValidationResult> {
    try {
      // First validate format
      const formatValidation = this.validatePhoneFormat(phone);
      if (!formatValidation.isValid) {
        return formatValidation;
      }

      // Then check availability
      const availabilityCheck = await this.checkPhoneAvailability(phone);
      
      return {
        isValid: true,
        isAvailable: availabilityCheck.isAvailable,
        formatted: availabilityCheck.formatted,
        error: availabilityCheck.isAvailable ? undefined : 'Este número de teléfono ya está registrado'
      };

    } catch (error) {
      return {
        isValid: false,
        isAvailable: false,
        formatted: '',
        error: error instanceof Error ? error.message : 'Error verificando teléfono'
      };
    }
  }

  /**
   * Get carrier information for Venezuelan mobile numbers
   */
  static getCarrierInfo(phone: string): { carrier: string; name: string } | null {
    try {
      const digitsOnly = phone.replace(/\D/g, '');
      const mobileMatch = digitsOnly.match(VENEZUELAN_PHONE_PATTERNS.mobile.pattern);
      
      if (mobileMatch) {
        const carrier = mobileMatch[2];
        const carrierName = VENEZUELAN_PHONE_PATTERNS.mobile.carriers[carrier as keyof typeof VENEZUELAN_PHONE_PATTERNS.mobile.carriers];
        
        return {
          carrier,
          name: carrierName
        };
      }

      return null;

    } catch (error) {
      return null;
    }
  }

  /**
   * Suggest alternative phone numbers
   */
  static suggestAlternativePhones(basePhone: string): string[] {
    try {
      const digitsOnly = basePhone.replace(/\D/g, '');
      const suggestions: string[] = [];

      // If it's a mobile number, suggest variations
      const mobileMatch = digitsOnly.match(VENEZUELAN_PHONE_PATTERNS.mobile.pattern);
      if (mobileMatch) {
        const carrier = mobileMatch[2];
        const number = mobileMatch[3];
        
        // Generate suggestions with different last digits
        for (let i = 1; i <= 3; i++) {
          const newNumber = number.slice(0, -1) + ((parseInt(number.slice(-1)) + i) % 10);
          suggestions.push(`+58${carrier}${newNumber}`);
        }
      }

      return suggestions.slice(0, 3); // Limit to 3 suggestions

    } catch (error) {
      return [];
    }
  }
}
