/**
 * Data Migration Service
 * @fileoverview Service responsible for migrating existing data to the new encryption system
 * @compliance HIPAA-compliant data migration with audit trail
 */

import { createClient } from '@/lib/supabase/client';
import { EncryptionService } from './encryption.service';
import { SensitiveDataEncryptionService, EncryptedDataRecord } from './sensitive-data-encryption.service';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Migration status
 */
export interface MigrationStatus {
  tableName: string;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  successRate: number;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused';
  errors: string[];
  lastProcessedId?: string;
}

/**
 * Migration configuration
 */
export interface MigrationConfig {
  batchSize: number;
  maxRetries: number;
  retryDelay: number; // in milliseconds
  dryRun: boolean;
  skipExisting: boolean;
  validateAfterMigration: boolean;
}

/**
 * Data migration service
 */
export class DataMigrationService {
  private static readonly DEFAULT_CONFIG: MigrationConfig = {
    batchSize: 100,
    maxRetries: 3,
    retryDelay: 1000,
    dryRun: false,
    skipExisting: true,
    validateAfterMigration: true
  };

  private static config = this.DEFAULT_CONFIG;
  private static migrationStatus: Map<string, MigrationStatus> = new Map();

  /**
   * Configure migration service
   */
  static configure(config: Partial<MigrationConfig>): void {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
  }

  /**
   * Migrate all sensitive data to new encryption system
   */
  static async migrateAllData(): Promise<Map<string, MigrationStatus>> {
    try {
      logSecurityEvent('data_migration_started', {
        config: this.config,
        timestamp: new Date().toISOString()
      });

      const migrationResults = new Map<string, MigrationStatus>();

      // Define tables to migrate
      const tablesToMigrate = [
        'profiles',
        'doctor_profiles',
        'patient_profiles',
        'medical_records',
        'prescriptions',
        'lab_results',
        'appointments',
        'insurance_info',
        'payment_info',
        'emergency_contacts',
        'medical_history',
        'allergies',
        'medications',
        'vital_signs',
        'lab_values',
        'diagnoses',
        'treatment_plans',
        'consent_forms',
        'audit_logs'
      ];

      // Migrate each table
      for (const tableName of tablesToMigrate) {
        try {
          const status = await this.migrateTable(tableName);
          migrationResults.set(tableName, status);
        } catch (error) {
          logSecurityEvent('table_migration_failed', {
            tableName,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          });

          migrationResults.set(tableName, {
            tableName,
            totalRecords: 0,
            processedRecords: 0,
            failedRecords: 0,
            successRate: 0,
            startTime: new Date().toISOString(),
            status: 'failed',
            errors: [error instanceof Error ? error.message : 'Unknown error']
          });
        }
      }

      logSecurityEvent('data_migration_completed', {
        totalTables: tablesToMigrate.length,
        successfulTables: Array.from(migrationResults.values()).filter(s => s.status === 'completed').length,
        failedTables: Array.from(migrationResults.values()).filter(s => s.status === 'failed').length,
        timestamp: new Date().toISOString()
      });

      return migrationResults;

    } catch (error) {
      logSecurityEvent('data_migration_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      throw new Error('Failed to migrate data');
    }
  }

  /**
   * Migrate specific table
   */
  static async migrateTable(tableName: string): Promise<MigrationStatus> {
    try {
      const supabase = createClient();
      
      // Initialize migration status
      const status: MigrationStatus = {
        tableName,
        totalRecords: 0,
        processedRecords: 0,
        failedRecords: 0,
        successRate: 0,
        startTime: new Date().toISOString(),
        status: 'in_progress',
        errors: []
      };

      this.migrationStatus.set(tableName, status);

      // Get total record count
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error(`Failed to count records: ${countError.message}`);
      }

      status.totalRecords = count || 0;

      if (status.totalRecords === 0) {
        status.status = 'completed';
        status.endTime = new Date().toISOString();
        return status;
      }

      // Process records in batches
      let offset = 0;
      let lastProcessedId: string | undefined;

      while (offset < status.totalRecords) {
        try {
          // Get batch of records
          const { data: records, error: fetchError } = await supabase
            .from(tableName)
            .select('*')
            .range(offset, offset + this.config.batchSize - 1)
            .order('id');

          if (fetchError) {
            throw new Error(`Failed to fetch records: ${fetchError.message}`);
          }

          if (!records || records.length === 0) {
            break;
          }

          // Process each record
          for (const record of records) {
            try {
              await this.migrateRecord(tableName, record);
              status.processedRecords++;
              lastProcessedId = record.id;
            } catch (error) {
              status.failedRecords++;
              status.errors.push(`Record ${record.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }

          offset += this.config.batchSize;

          // Update status
          status.successRate = (status.processedRecords / (status.processedRecords + status.failedRecords)) * 100;
          status.lastProcessedId = lastProcessedId;

        } catch (error) {
          status.failedRecords += this.config.batchSize;
          status.errors.push(`Batch error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Finalize status
      status.status = status.failedRecords === 0 ? 'completed' : 'failed';
      status.endTime = new Date().toISOString();
      status.successRate = (status.processedRecords / status.totalRecords) * 100;

      return status;

    } catch (error) {
      logSecurityEvent('table_migration_error', {
        tableName,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }

  /**
   * Migrate individual record
   */
  private static async migrateRecord(tableName: string, record: Record<string, unknown>): Promise<void> {
    try {
      if (this.config.dryRun) {
        // In dry run mode, just log what would be migrated
        logSecurityEvent('migration_dry_run', {
          tableName,
          recordId: record.id,
          fields: Object.keys(record),
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Identify sensitive fields
      const sensitiveFields = this.identifySensitiveFields(tableName, record);
      
      if (sensitiveFields.length === 0) {
        // No sensitive fields to migrate
        return;
      }

      // Create encrypted data record
      const encryptedData = await SensitiveDataEncryptionService.encryptSensitiveData(
        sensitiveFields,
        {
          dataType: this.getDataTypeForTable(tableName),
          userId: record.user_id as string,
          patientId: record.patient_id as string,
          doctorId: record.doctor_id as string,
          clinicId: record.clinic_id as string,
          purpose: 'data_migration',
          complianceLevel: 'critical'
        }
      );

      // Store encrypted data
      const supabase = createClient();
      const { error: insertError } = await supabase
        .from('encrypted_data')
        .insert({
          id: encryptedData.id,
          table_name: tableName,
          record_id: record.id,
          encrypted_data: encryptedData.encryptedData,
          context: encryptedData.context,
          created_at: encryptedData.createdAt,
          updated_at: encryptedData.updatedAt,
          expires_at: encryptedData.expiresAt,
          version: encryptedData.version,
          integrity_hash: encryptedData.integrityHash
        });

      if (insertError) {
        throw new Error(`Failed to store encrypted data: ${insertError.message}`);
      }

      // Remove sensitive fields from original record
      const cleanedRecord = { ...record };
      sensitiveFields.forEach(field => {
        delete cleanedRecord[field];
      });

      // Add reference to encrypted data
      cleanedRecord.encrypted_data_id = encryptedData.id;

      // Update original record
      const { error: updateError } = await supabase
        .from(tableName)
        .update(cleanedRecord)
        .eq('id', record.id);

      if (updateError) {
        throw new Error(`Failed to update record: ${updateError.message}`);
      }

      // Log successful migration
      logSecurityEvent('record_migrated', {
        tableName,
        recordId: record.id,
        encryptedDataId: encryptedData.id,
        sensitiveFieldsCount: sensitiveFields.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logSecurityEvent('record_migration_error', {
        tableName,
        recordId: record.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }

  /**
   * Identify sensitive fields in a record
   */
  private static identifySensitiveFields(tableName: string, record: Record<string, unknown>): Record<string, unknown> {
    const sensitiveFields: Record<string, unknown> = {};

    // Define sensitive field patterns by table
    const sensitiveFieldPatterns = {
      profiles: ['first_name', 'last_name', 'middle_name', 'date_of_birth', 'phone', 'email', 'address', 'document_number'],
      doctor_profiles: ['first_name', 'last_name', 'middle_name', 'date_of_birth', 'phone', 'email', 'address', 'license_number', 'specialty'],
      patient_profiles: ['first_name', 'last_name', 'middle_name', 'date_of_birth', 'phone', 'email', 'address', 'document_number', 'insurance_number'],
      medical_records: ['notes', 'diagnosis', 'treatment', 'medications', 'allergies', 'vital_signs', 'lab_values'],
      prescriptions: ['medication_name', 'dosage', 'instructions', 'notes', 'patient_notes'],
      lab_results: ['test_name', 'results', 'values', 'notes', 'interpretation'],
      appointments: ['notes', 'reason', 'symptoms', 'diagnosis', 'treatment_plan'],
      insurance_info: ['policy_number', 'group_number', 'subscriber_id', 'beneficiary_info'],
      payment_info: ['card_number', 'bank_account', 'routing_number', 'billing_address'],
      emergency_contacts: ['name', 'phone', 'email', 'relationship', 'address'],
      medical_history: ['condition', 'diagnosis', 'treatment', 'notes', 'dates'],
      allergies: ['allergen', 'reaction', 'severity', 'notes'],
      medications: ['medication_name', 'dosage', 'frequency', 'instructions', 'notes'],
      vital_signs: ['blood_pressure', 'heart_rate', 'temperature', 'weight', 'height', 'notes'],
      lab_values: ['test_name', 'value', 'unit', 'reference_range', 'notes'],
      diagnoses: ['diagnosis_code', 'description', 'notes', 'treatment_plan'],
      treatment_plans: ['plan_name', 'description', 'medications', 'procedures', 'notes'],
      consent_forms: ['form_data', 'signature', 'witness', 'notes'],
      audit_logs: ['action', 'details', 'ip_address', 'user_agent', 'metadata']
    };

    const patterns = sensitiveFieldPatterns[tableName as keyof typeof sensitiveFieldPatterns] || [];
    
    patterns.forEach(field => {
      if (record[field] !== undefined && record[field] !== null) {
        sensitiveFields[field] = record[field];
      }
    });

    return sensitiveFields;
  }

  /**
   * Get data type for table
   */
  private static getDataTypeForTable(tableName: string): string {
    const tableDataTypeMap: Record<string, string> = {
      profiles: 'personal_info',
      doctor_profiles: 'professional_license',
      patient_profiles: 'personal_info',
      medical_records: 'medical_record',
      prescriptions: 'prescription',
      lab_results: 'lab_result',
      appointments: 'medical_record',
      insurance_info: 'insurance_info',
      payment_info: 'payment_info',
      emergency_contacts: 'contact_info',
      medical_history: 'medical_history',
      allergies: 'allergy_info',
      medications: 'medication_info',
      vital_signs: 'vital_signs',
      lab_values: 'lab_values',
      diagnoses: 'diagnosis',
      treatment_plans: 'treatment_plan',
      consent_forms: 'consent_form',
      audit_logs: 'audit_trail'
    };

    return tableDataTypeMap[tableName] || 'other';
  }

  /**
   * Validate migrated data
   */
  static async validateMigratedData(tableName: string): Promise<{
    valid: boolean;
    errors: string[];
    validatedRecords: number;
  }> {
    try {
      const supabase = createClient();
      const errors: string[] = [];
      let validatedRecords = 0;

      // Get migrated records
      const { data: records, error: fetchError } = await supabase
        .from(tableName)
        .select('id, encrypted_data_id')
        .not('encrypted_data_id', 'is', null);

      if (fetchError) {
        throw new Error(`Failed to fetch migrated records: ${fetchError.message}`);
      }

      if (!records) {
        return { valid: true, errors: [], validatedRecords: 0 };
      }

      // Validate each record
      for (const record of records) {
        try {
          // Get encrypted data
          const { data: encryptedData, error: encryptedError } = await supabase
            .from('encrypted_data')
            .select('*')
            .eq('id', record.encrypted_data_id)
            .single();

          if (encryptedError) {
            errors.push(`Record ${record.id}: Failed to fetch encrypted data`);
            continue;
          }

          // Decrypt and validate
          const decryptionResult = await SensitiveDataEncryptionService.decryptSensitiveData(encryptedData);
          
          if (!decryptionResult.success) {
            errors.push(`Record ${record.id}: Failed to decrypt data - ${decryptionResult.error}`);
            continue;
          }

          validatedRecords++;

        } catch (error) {
          errors.push(`Record ${record.id}: Validation error - ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        validatedRecords
      };

    } catch (error) {
      logSecurityEvent('migration_validation_error', {
        tableName,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }

  /**
   * Get migration status
   */
  static getMigrationStatus(tableName?: string): MigrationStatus | Map<string, MigrationStatus> {
    if (tableName) {
      return this.migrationStatus.get(tableName) || {
        tableName,
        totalRecords: 0,
        processedRecords: 0,
        failedRecords: 0,
        successRate: 0,
        startTime: new Date().toISOString(),
        status: 'pending',
        errors: []
      };
    }

    return new Map(this.migrationStatus);
  }

  /**
   * Pause migration
   */
  static pauseMigration(tableName: string): void {
    const status = this.migrationStatus.get(tableName);
    if (status && status.status === 'in_progress') {
      status.status = 'paused';
      logSecurityEvent('migration_paused', {
        tableName,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Resume migration
   */
  static resumeMigration(tableName: string): void {
    const status = this.migrationStatus.get(tableName);
    if (status && status.status === 'paused') {
      status.status = 'in_progress';
      logSecurityEvent('migration_resumed', {
        tableName,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get migration service status
   */
  static getStatus(): {
    initialized: boolean;
    config: MigrationConfig;
    activeMigrations: number;
    completedMigrations: number;
    failedMigrations: number;
  } {
    const statuses = Array.from(this.migrationStatus.values());
    
    return {
      initialized: true,
      config: this.config,
      activeMigrations: statuses.filter(s => s.status === 'in_progress').length,
      completedMigrations: statuses.filter(s => s.status === 'completed').length,
      failedMigrations: statuses.filter(s => s.status === 'failed').length
    };
  }
}
