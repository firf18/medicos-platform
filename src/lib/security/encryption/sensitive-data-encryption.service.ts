/**
 * Sensitive Data Encryption Service
 * @fileoverview Service responsible for encrypting sensitive medical and personal data
 * @compliance HIPAA-compliant sensitive data encryption with audit trail
 */

import { EncryptionService, EncryptionResult, DecryptionResult } from './encryption.service';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Sensitive data types
 */
export type SensitiveDataType = 
  | 'personal_info'
  | 'medical_record'
  | 'prescription'
  | 'lab_result'
  | 'insurance_info'
  | 'payment_info'
  | 'contact_info'
  | 'document_number'
  | 'license_number'
  | 'phone_number'
  | 'email_address'
  | 'address'
  | 'emergency_contact'
  | 'medical_history'
  | 'allergy_info'
  | 'medication_info'
  | 'appointment_notes'
  | 'diagnosis'
  | 'treatment_plan'
  | 'lab_values'
  | 'vital_signs'
  | 'family_history'
  | 'social_history'
  | 'mental_health'
  | 'substance_use'
  | 'sexual_health'
  | 'genetic_info'
  | 'biometric_data'
  | 'device_data'
  | 'location_data'
  | 'communication_log'
  | 'audit_trail'
  | 'consent_form'
  | 'legal_document'
  | 'financial_info'
  | 'insurance_claim'
  | 'billing_info'
  | 'payment_method'
  | 'bank_account'
  | 'credit_card'
  | 'tax_info'
  | 'employment_info'
  | 'education_info'
  | 'professional_license'
  | 'certification'
  | 'credential'
  | 'password'
  | 'security_question'
  | 'two_factor_secret'
  | 'session_token'
  | 'api_key'
  | 'access_token'
  | 'refresh_token'
  | 'other';

/**
 * Encryption context
 */
export interface EncryptionContext {
  dataType: SensitiveDataType;
  userId?: string;
  patientId?: string;
  doctorId?: string;
  clinicId?: string;
  purpose?: string;
  retentionPeriod?: number; // in days
  complianceLevel?: 'basic' | 'enhanced' | 'critical';
}

/**
 * Encrypted data record
 */
export interface EncryptedDataRecord {
  id: string;
  encryptedData: EncryptionResult;
  context: EncryptionContext;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  version: string;
  integrityHash: string;
}

/**
 * Sensitive data encryption service
 */
export class SensitiveDataEncryptionService {
  private static readonly VERSION = '1.0.0';
  private static readonly DEFAULT_RETENTION_DAYS = 2555; // 7 years for medical records
  private static readonly CRITICAL_RETENTION_DAYS = 3650; // 10 years for critical data

  /**
   * Encrypt sensitive data with context
   */
  static async encryptSensitiveData(
    data: string | Record<string, unknown>,
    context: EncryptionContext
  ): Promise<EncryptedDataRecord> {
    try {
      // Validate context
      this.validateContext(context);

      // Convert data to string if needed
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);

      // Determine retention period
      const retentionDays = this.getRetentionPeriod(context);

      // Encrypt with integrity check
      const encryptedData = EncryptionService.encryptWithIntegrity(
        dataString,
        this.getContextString(context)
      );

      // Generate integrity hash for the entire record
      const recordData = {
        encryptedData,
        context,
        timestamp: new Date().toISOString()
      };
      const integrityHash = EncryptionService.generateHash(JSON.stringify(recordData));

      // Create encrypted data record
      const record: EncryptedDataRecord = {
        id: this.generateRecordId(),
        encryptedData,
        context,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: retentionDays > 0 ? new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000).toISOString() : undefined,
        version: this.VERSION,
        integrityHash
      };

      // Log encryption
      logSecurityEvent('sensitive_data_encrypted', {
        recordId: record.id,
        dataType: context.dataType,
        userId: context.userId,
        patientId: context.patientId,
        doctorId: context.doctorId,
        clinicId: context.clinicId,
        purpose: context.purpose,
        complianceLevel: context.complianceLevel,
        retentionDays,
        dataLength: dataString.length,
        timestamp: record.createdAt
      });

      return record;

    } catch (error) {
      logSecurityEvent('sensitive_data_encryption_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context: this.getContextString(context),
        timestamp: new Date().toISOString()
      });
      
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static async decryptSensitiveData(
    record: EncryptedDataRecord,
    context?: EncryptionContext
  ): Promise<DecryptionResult> {
    try {
      // Validate record integrity
      const isValid = this.validateRecordIntegrity(record);
      if (!isValid) {
        return {
          decrypted: '',
          success: false,
          error: 'Record integrity validation failed'
        };
      }

      // Check if record has expired
      if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
        logSecurityEvent('encrypted_data_expired', {
          recordId: record.id,
          expiresAt: record.expiresAt,
          timestamp: new Date().toISOString()
        });
        
        return {
          decrypted: '',
          success: false,
          error: 'Encrypted data has expired'
        };
      }

      // Decrypt with integrity check
      const decryptionResult = EncryptionService.decryptWithIntegrity(
        record.encryptedData,
        this.getContextString(record.context)
      );

      // Log decryption
      logSecurityEvent('sensitive_data_decrypted', {
        recordId: record.id,
        dataType: record.context.dataType,
        userId: record.context.userId,
        patientId: record.context.patientId,
        doctorId: record.context.doctorId,
        clinicId: record.context.clinicId,
        purpose: record.context.purpose,
        complianceLevel: record.context.complianceLevel,
        success: decryptionResult.success,
        timestamp: new Date().toISOString()
      });

      return decryptionResult;

    } catch (error) {
      logSecurityEvent('sensitive_data_decryption_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        recordId: record.id,
        context: this.getContextString(record.context),
        timestamp: new Date().toISOString()
      });
      
      return {
        decrypted: '',
        success: false,
        error: 'Failed to decrypt sensitive data'
      };
    }
  }

  /**
   * Encrypt personal information
   */
  static async encryptPersonalInfo(
    personalInfo: {
      firstName?: string;
      lastName?: string;
      middleName?: string;
      dateOfBirth?: string;
      gender?: string;
      nationality?: string;
      maritalStatus?: string;
      occupation?: string;
      education?: string;
    },
    userId: string,
    purpose: string = 'medical_record'
  ): Promise<EncryptedDataRecord> {
    const context: EncryptionContext = {
      dataType: 'personal_info',
      userId,
      purpose,
      complianceLevel: 'enhanced'
    };

    return this.encryptSensitiveData(personalInfo, context);
  }

  /**
   * Encrypt medical record
   */
  static async encryptMedicalRecord(
    medicalRecord: Record<string, unknown>,
    patientId: string,
    doctorId: string,
    clinicId?: string
  ): Promise<EncryptedDataRecord> {
    const context: EncryptionContext = {
      dataType: 'medical_record',
      patientId,
      doctorId,
      clinicId,
      purpose: 'medical_treatment',
      complianceLevel: 'critical'
    };

    return this.encryptSensitiveData(medicalRecord, context);
  }

  /**
   * Encrypt prescription data
   */
  static async encryptPrescription(
    prescription: Record<string, unknown>,
    patientId: string,
    doctorId: string,
    clinicId?: string
  ): Promise<EncryptedDataRecord> {
    const context: EncryptionContext = {
      dataType: 'prescription',
      patientId,
      doctorId,
      clinicId,
      purpose: 'medication_management',
      complianceLevel: 'critical'
    };

    return this.encryptSensitiveData(prescription, context);
  }

  /**
   * Encrypt lab results
   */
  static async encryptLabResults(
    labResults: Record<string, unknown>,
    patientId: string,
    doctorId: string,
    clinicId?: string
  ): Promise<EncryptedDataRecord> {
    const context: EncryptionContext = {
      dataType: 'lab_result',
      patientId,
      doctorId,
      clinicId,
      purpose: 'diagnostic_testing',
      complianceLevel: 'critical'
    };

    return this.encryptSensitiveData(labResults, context);
  }

  /**
   * Encrypt insurance information
   */
  static async encryptInsuranceInfo(
    insuranceInfo: Record<string, unknown>,
    patientId: string,
    purpose: string = 'insurance_verification'
  ): Promise<EncryptedDataRecord> {
    const context: EncryptionContext = {
      dataType: 'insurance_info',
      patientId,
      purpose,
      complianceLevel: 'enhanced'
    };

    return this.encryptSensitiveData(insuranceInfo, context);
  }

  /**
   * Encrypt payment information
   */
  static async encryptPaymentInfo(
    paymentInfo: Record<string, unknown>,
    userId: string,
    purpose: string = 'payment_processing'
  ): Promise<EncryptedDataRecord> {
    const context: EncryptionContext = {
      dataType: 'payment_info',
      userId,
      purpose,
      complianceLevel: 'critical'
    };

    return this.encryptSensitiveData(paymentInfo, context);
  }

  /**
   * Encrypt contact information
   */
  static async encryptContactInfo(
    contactInfo: {
      email?: string;
      phone?: string;
      address?: string;
      emergencyContact?: Record<string, unknown>;
    },
    userId: string,
    purpose: string = 'contact_management'
  ): Promise<EncryptedDataRecord> {
    const context: EncryptionContext = {
      dataType: 'contact_info',
      userId,
      purpose,
      complianceLevel: 'enhanced'
    };

    return this.encryptSensitiveData(contactInfo, context);
  }

  /**
   * Validate encryption context
   */
  private static validateContext(context: EncryptionContext): void {
    if (!context.dataType) {
      throw new Error('Data type is required');
    }

    if (!context.userId && !context.patientId && !context.doctorId) {
      throw new Error('At least one ID (userId, patientId, or doctorId) is required');
    }

    if (!context.purpose) {
      throw new Error('Purpose is required');
    }
  }

  /**
   * Get retention period based on context
   */
  private static getRetentionPeriod(context: EncryptionContext): number {
    if (context.retentionPeriod) {
      return context.retentionPeriod;
    }

    switch (context.complianceLevel) {
      case 'critical':
        return this.CRITICAL_RETENTION_DAYS;
      case 'enhanced':
        return this.DEFAULT_RETENTION_DAYS;
      case 'basic':
        return 365; // 1 year
      default:
        return this.DEFAULT_RETENTION_DAYS;
    }
  }

  /**
   * Generate unique record ID
   */
  private static generateRecordId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `enc_${timestamp}_${random}`;
  }

  /**
   * Get context string for logging
   */
  private static getContextString(context: EncryptionContext): string {
    return `${context.dataType}_${context.userId || context.patientId || context.doctorId}_${context.purpose}`;
  }

  /**
   * Validate record integrity
   */
  private static validateRecordIntegrity(record: EncryptedDataRecord): boolean {
    try {
      const recordData = {
        encryptedData: record.encryptedData,
        context: record.context,
        timestamp: record.createdAt
      };
      
      const computedHash = EncryptionService.generateHash(JSON.stringify(recordData));
      return computedHash === record.integrityHash;

    } catch (error) {
      logSecurityEvent('record_integrity_validation_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        recordId: record.id,
        timestamp: new Date().toISOString()
      });
      
      return false;
    }
  }

  /**
   * Get encryption status
   */
  static getStatus(): { initialized: boolean; version: string; supportedTypes: SensitiveDataType[] } {
    return {
      initialized: EncryptionService.getStatus().initialized,
      version: this.VERSION,
      supportedTypes: [
        'personal_info', 'medical_record', 'prescription', 'lab_result',
        'insurance_info', 'payment_info', 'contact_info', 'document_number',
        'license_number', 'phone_number', 'email_address', 'address',
        'emergency_contact', 'medical_history', 'allergy_info', 'medication_info',
        'appointment_notes', 'diagnosis', 'treatment_plan', 'lab_values',
        'vital_signs', 'family_history', 'social_history', 'mental_health',
        'substance_use', 'sexual_health', 'genetic_info', 'biometric_data',
        'device_data', 'location_data', 'communication_log', 'audit_trail',
        'consent_form', 'legal_document', 'financial_info', 'insurance_claim',
        'billing_info', 'payment_method', 'bank_account', 'credit_card',
        'tax_info', 'employment_info', 'education_info', 'professional_license',
        'certification', 'credential', 'password', 'security_question',
        'two_factor_secret', 'session_token', 'api_key', 'access_token',
        'refresh_token', 'other'
      ]
    };
  }
}
