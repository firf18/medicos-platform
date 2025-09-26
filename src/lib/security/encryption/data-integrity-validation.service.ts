/**
 * Data Integrity Validation Service
 * @fileoverview Service responsible for validating integrity of encrypted data
 * @compliance HIPAA-compliant data integrity validation with audit trail
 */

import { createClient } from '@/lib/supabase/client';
import { EncryptionService } from './encryption.service';
import { SensitiveDataEncryptionService, EncryptedDataRecord } from './sensitive-data-encryption.service';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Integrity validation result
 */
export interface IntegrityValidationResult {
  valid: boolean;
  errors: string[];
  validatedRecords: number;
  corruptedRecords: number;
  totalRecords: number;
  validationTime: number; // in milliseconds
  timestamp: string;
}

/**
 * Record integrity status
 */
export interface RecordIntegrityStatus {
  recordId: string;
  encryptedDataId: string;
  valid: boolean;
  errors: string[];
  lastValidated: string;
  validationCount: number;
}

/**
 * Data integrity validation service
 */
export class DataIntegrityValidationService {
  private static readonly BATCH_SIZE = 50;
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // in milliseconds

  /**
   * Validate integrity of all encrypted data
   */
  static async validateAllEncryptedData(): Promise<IntegrityValidationResult> {
    try {
      const startTime = Date.now();
      
      logSecurityEvent('integrity_validation_started', {
        timestamp: new Date().toISOString()
      });

      const supabase = createClient();
      let totalRecords = 0;
      let validatedRecords = 0;
      let corruptedRecords = 0;
      const errors: string[] = [];

      // Get all encrypted data records
      const { data: allRecords, error: fetchError } = await supabase
        .from('encrypted_data')
        .select('*')
        .order('created_at');

      if (fetchError) {
        throw new Error(`Failed to fetch encrypted data: ${fetchError.message}`);
      }

      if (!allRecords) {
        return {
          valid: true,
          errors: [],
          validatedRecords: 0,
          corruptedRecords: 0,
          totalRecords: 0,
          validationTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }

      totalRecords = allRecords.length;

      // Process records in batches
      for (let i = 0; i < allRecords.length; i += this.BATCH_SIZE) {
        const batch = allRecords.slice(i, i + this.BATCH_SIZE);
        
        for (const record of batch) {
          try {
            const isValid = await this.validateRecordIntegrity(record);
            
            if (isValid) {
              validatedRecords++;
            } else {
              corruptedRecords++;
              errors.push(`Record ${record.id}: Integrity validation failed`);
            }

            // Update validation status
            await this.updateValidationStatus(record.id, isValid);

          } catch (error) {
            corruptedRecords++;
            errors.push(`Record ${record.id}: Validation error - ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      const validationTime = Date.now() - startTime;
      const result: IntegrityValidationResult = {
        valid: errors.length === 0,
        errors,
        validatedRecords,
        corruptedRecords,
        totalRecords,
        validationTime,
        timestamp: new Date().toISOString()
      };

      // Log validation results
      logSecurityEvent('integrity_validation_completed', {
        totalRecords,
        validatedRecords,
        corruptedRecords,
        validationTime,
        timestamp: result.timestamp
      });

      return result;

    } catch (error) {
      logSecurityEvent('integrity_validation_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      throw new Error('Failed to validate encrypted data integrity');
    }
  }

  /**
   * Validate integrity of specific encrypted data record
   */
  static async validateRecordIntegrity(record: EncryptedDataRecord): Promise<boolean> {
    try {
      // Validate record structure
      if (!record.id || !record.encryptedData || !record.context) {
        return false;
      }

      // Validate encrypted data structure
      if (!record.encryptedData.encrypted || !record.encryptedData.iv || !record.encryptedData.salt) {
        return false;
      }

      // Validate context structure
      if (!record.context.dataType || !record.context.purpose) {
        return false;
      }

      // Validate integrity hash
      const recordData = {
        encryptedData: record.encryptedData,
        context: record.context,
        timestamp: record.createdAt
      };
      
      const computedHash = EncryptionService.generateHash(JSON.stringify(recordData));
      if (computedHash !== record.integrityHash) {
        return false;
      }

      // Test decryption
      const decryptionResult = await SensitiveDataEncryptionService.decryptSensitiveData(record);
      if (!decryptionResult.success) {
        return false;
      }

      // Validate decrypted data
      if (!decryptionResult.decrypted || decryptionResult.decrypted.length === 0) {
        return false;
      }

      return true;

    } catch (error) {
      logSecurityEvent('record_integrity_validation_error', {
        recordId: record.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return false;
    }
  }

  /**
   * Validate integrity of encrypted data by table
   */
  static async validateTableIntegrity(tableName: string): Promise<IntegrityValidationResult> {
    try {
      const startTime = Date.now();
      
      logSecurityEvent('table_integrity_validation_started', {
        tableName,
        timestamp: new Date().toISOString()
      });

      const supabase = createClient();
      let totalRecords = 0;
      let validatedRecords = 0;
      let corruptedRecords = 0;
      const errors: string[] = [];

      // Get encrypted data records for specific table
      const { data: records, error: fetchError } = await supabase
        .from('encrypted_data')
        .select('*')
        .eq('table_name', tableName)
        .order('created_at');

      if (fetchError) {
        throw new Error(`Failed to fetch encrypted data for table ${tableName}: ${fetchError.message}`);
      }

      if (!records) {
        return {
          valid: true,
          errors: [],
          validatedRecords: 0,
          corruptedRecords: 0,
          totalRecords: 0,
          validationTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }

      totalRecords = records.length;

      // Validate each record
      for (const record of records) {
        try {
          const isValid = await this.validateRecordIntegrity(record);
          
          if (isValid) {
            validatedRecords++;
          } else {
            corruptedRecords++;
            errors.push(`Record ${record.id}: Integrity validation failed`);
          }

          // Update validation status
          await this.updateValidationStatus(record.id, isValid);

        } catch (error) {
          corruptedRecords++;
          errors.push(`Record ${record.id}: Validation error - ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      const validationTime = Date.now() - startTime;
      const result: IntegrityValidationResult = {
        valid: errors.length === 0,
        errors,
        validatedRecords,
        corruptedRecords,
        totalRecords,
        validationTime,
        timestamp: new Date().toISOString()
      };

      // Log validation results
      logSecurityEvent('table_integrity_validation_completed', {
        tableName,
        totalRecords,
        validatedRecords,
        corruptedRecords,
        validationTime,
        timestamp: result.timestamp
      });

      return result;

    } catch (error) {
      logSecurityEvent('table_integrity_validation_error', {
        tableName,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }

  /**
   * Validate integrity of encrypted data by user
   */
  static async validateUserDataIntegrity(userId: string): Promise<IntegrityValidationResult> {
    try {
      const startTime = Date.now();
      
      logSecurityEvent('user_data_integrity_validation_started', {
        userId,
        timestamp: new Date().toISOString()
      });

      const supabase = createClient();
      let totalRecords = 0;
      let validatedRecords = 0;
      let corruptedRecords = 0;
      const errors: string[] = [];

      // Get encrypted data records for specific user
      const { data: records, error: fetchError } = await supabase
        .from('encrypted_data')
        .select('*')
        .or(`user_id.eq.${userId},patient_id.eq.${userId},doctor_id.eq.${userId}`)
        .order('created_at');

      if (fetchError) {
        throw new Error(`Failed to fetch encrypted data for user ${userId}: ${fetchError.message}`);
      }

      if (!records) {
        return {
          valid: true,
          errors: [],
          validatedRecords: 0,
          corruptedRecords: 0,
          totalRecords: 0,
          validationTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }

      totalRecords = records.length;

      // Validate each record
      for (const record of records) {
        try {
          const isValid = await this.validateRecordIntegrity(record);
          
          if (isValid) {
            validatedRecords++;
          } else {
            corruptedRecords++;
            errors.push(`Record ${record.id}: Integrity validation failed`);
          }

          // Update validation status
          await this.updateValidationStatus(record.id, isValid);

        } catch (error) {
          corruptedRecords++;
          errors.push(`Record ${record.id}: Validation error - ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      const validationTime = Date.now() - startTime;
      const result: IntegrityValidationResult = {
        valid: errors.length === 0,
        errors,
        validatedRecords,
        corruptedRecords,
        totalRecords,
        validationTime,
        timestamp: new Date().toISOString()
      };

      // Log validation results
      logSecurityEvent('user_data_integrity_validation_completed', {
        userId,
        totalRecords,
        validatedRecords,
        corruptedRecords,
        validationTime,
        timestamp: result.timestamp
      });

      return result;

    } catch (error) {
      logSecurityEvent('user_data_integrity_validation_error', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }

  /**
   * Update validation status for a record
   */
  private static async updateValidationStatus(recordId: string, isValid: boolean): Promise<void> {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('encrypted_data_validation_status')
        .upsert({
          record_id: recordId,
          valid: isValid,
          last_validated: new Date().toISOString(),
          validation_count: supabase.rpc('increment_validation_count', { record_id: recordId })
        });

      if (error) {
        logSecurityEvent('validation_status_update_error', {
          recordId,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      logSecurityEvent('validation_status_update_error', {
        recordId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get integrity validation status for a record
   */
  static async getRecordValidationStatus(recordId: string): Promise<RecordIntegrityStatus | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('encrypted_data_validation_status')
        .select('*')
        .eq('record_id', recordId)
        .single();

      if (error) {
        return null;
      }

      return {
        recordId: data.record_id,
        encryptedDataId: data.encrypted_data_id,
        valid: data.valid,
        errors: data.errors || [],
        lastValidated: data.last_validated,
        validationCount: data.validation_count
      };

    } catch (error) {
      logSecurityEvent('validation_status_fetch_error', {
        recordId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return null;
    }
  }

  /**
   * Get integrity validation summary
   */
  static async getIntegrityValidationSummary(): Promise<{
    totalRecords: number;
    validRecords: number;
    corruptedRecords: number;
    lastValidation: string;
    validationRate: number;
  }> {
    try {
      const supabase = createClient();
      
      // Get total encrypted data records
      const { count: totalRecords, error: totalError } = await supabase
        .from('encrypted_data')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        throw new Error(`Failed to count total records: ${totalError.message}`);
      }

      // Get validation status summary
      const { data: validationData, error: validationError } = await supabase
        .from('encrypted_data_validation_status')
        .select('valid, last_validated')
        .order('last_validated', { ascending: false })
        .limit(1);

      if (validationError) {
        throw new Error(`Failed to fetch validation data: ${validationError.message}`);
      }

      const validRecords = validationData?.filter(d => d.valid).length || 0;
      const corruptedRecords = validationData?.filter(d => !d.valid).length || 0;
      const lastValidation = validationData?.[0]?.last_validated || new Date().toISOString();
      const validationRate = totalRecords ? (validRecords / totalRecords) * 100 : 0;

      return {
        totalRecords: totalRecords || 0,
        validRecords,
        corruptedRecords,
        lastValidation,
        validationRate
      };

    } catch (error) {
      logSecurityEvent('integrity_validation_summary_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }

  /**
   * Schedule automatic integrity validation
   */
  static scheduleAutomaticValidation(intervalHours: number = 24): void {
    try {
      // In a real implementation, this would set up a cron job or scheduled task
      logSecurityEvent('automatic_integrity_validation_scheduled', {
        intervalHours,
        timestamp: new Date().toISOString()
      });

      // For now, we'll just log the scheduling
      // In production, you would use a job scheduler like node-cron or similar

    } catch (error) {
      logSecurityEvent('automatic_integrity_validation_scheduling_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        intervalHours,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get data integrity validation service status
   */
  static getStatus(): {
    initialized: boolean;
    batchSize: number;
    maxRetries: number;
    retryDelay: number;
  } {
    return {
      initialized: true,
      batchSize: this.BATCH_SIZE,
      maxRetries: this.MAX_RETRIES,
      retryDelay: this.RETRY_DELAY
    };
  }
}
