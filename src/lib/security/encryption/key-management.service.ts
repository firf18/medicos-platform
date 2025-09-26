/**
 * Encryption Key Management Service
 * @fileoverview Service responsible for managing encryption keys securely
 * @compliance HIPAA-compliant key management with audit trail
 */

import { logSecurityEvent } from '@/lib/security/logging/security-logger';
import crypto from 'crypto';

/**
 * Key types
 */
export type KeyType = 
  | 'master_key'
  | 'data_encryption_key'
  | 'field_encryption_key'
  | 'session_key'
  | 'api_key'
  | 'jwt_secret'
  | 'csrf_secret'
  | 'password_hash_salt'
  | 'backup_key'
  | 'recovery_key'
  | 'audit_key'
  | 'compliance_key'
  | 'other';

/**
 * Key metadata
 */
export interface KeyMetadata {
  keyId: string;
  keyType: KeyType;
  algorithm: string;
  keySize: number;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  usageCount: number;
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  purpose: string;
  complianceLevel: 'basic' | 'enhanced' | 'critical';
  rotationPolicy: 'manual' | 'automatic' | 'scheduled';
  nextRotationAt?: string;
  createdBy: string;
  environment: 'development' | 'staging' | 'production';
  tags: string[];
}

/**
 * Key rotation policy
 */
export interface KeyRotationPolicy {
  keyType: KeyType;
  rotationInterval: number; // in days
  maxUsageCount: number;
  maxAge: number; // in days
  autoRotation: boolean;
  notificationDays: number[]; // days before rotation to notify
}

/**
 * Key management service
 */
export class KeyManagementService {
  private static readonly DEFAULT_KEY_SIZE = 256;
  private static readonly DEFAULT_ALGORITHM = 'AES-256-GCM';
  private static readonly KEY_STORE_PREFIX = 'key_store_';
  private static readonly KEY_VERSION_PREFIX = 'v1_';

  // Key rotation policies
  private static readonly ROTATION_POLICIES: Record<KeyType, KeyRotationPolicy> = {
    master_key: {
      keyType: 'master_key',
      rotationInterval: 365, // 1 year
      maxUsageCount: 1000000,
      maxAge: 365,
      autoRotation: false, // Manual rotation for master key
      notificationDays: [30, 7, 1]
    },
    data_encryption_key: {
      keyType: 'data_encryption_key',
      rotationInterval: 90, // 3 months
      maxUsageCount: 100000,
      maxAge: 90,
      autoRotation: true,
      notificationDays: [7, 3, 1]
    },
    field_encryption_key: {
      keyType: 'field_encryption_key',
      rotationInterval: 180, // 6 months
      maxUsageCount: 500000,
      maxAge: 180,
      autoRotation: true,
      notificationDays: [14, 7, 3]
    },
    session_key: {
      keyType: 'session_key',
      rotationInterval: 1, // Daily
      maxUsageCount: 10000,
      maxAge: 1,
      autoRotation: true,
      notificationDays: []
    },
    api_key: {
      keyType: 'api_key',
      rotationInterval: 90, // 3 months
      maxUsageCount: 1000000,
      maxAge: 90,
      autoRotation: true,
      notificationDays: [14, 7, 1]
    },
    jwt_secret: {
      keyType: 'jwt_secret',
      rotationInterval: 180, // 6 months
      maxUsageCount: 1000000,
      maxAge: 180,
      autoRotation: true,
      notificationDays: [30, 14, 7]
    },
    csrf_secret: {
      keyType: 'csrf_secret',
      rotationInterval: 30, // 1 month
      maxUsageCount: 100000,
      maxAge: 30,
      autoRotation: true,
      notificationDays: [7, 3, 1]
    },
    password_hash_salt: {
      keyType: 'password_hash_salt',
      rotationInterval: 365, // 1 year
      maxUsageCount: 1000000,
      maxAge: 365,
      autoRotation: false, // Manual rotation
      notificationDays: [30, 7, 1]
    },
    backup_key: {
      keyType: 'backup_key',
      rotationInterval: 180, // 6 months
      maxUsageCount: 1000,
      maxAge: 180,
      autoRotation: true,
      notificationDays: [30, 14, 7]
    },
    recovery_key: {
      keyType: 'recovery_key',
      rotationInterval: 365, // 1 year
      maxUsageCount: 100,
      maxAge: 365,
      autoRotation: false, // Manual rotation
      notificationDays: [30, 7, 1]
    },
    audit_key: {
      keyType: 'audit_key',
      rotationInterval: 90, // 3 months
      maxUsageCount: 100000,
      maxAge: 90,
      autoRotation: true,
      notificationDays: [14, 7, 3]
    },
    compliance_key: {
      keyType: 'compliance_key',
      rotationInterval: 180, // 6 months
      maxUsageCount: 100000,
      maxAge: 180,
      autoRotation: true,
      notificationDays: [30, 14, 7]
    },
    other: {
      keyType: 'other',
      rotationInterval: 90, // 3 months
      maxUsageCount: 100000,
      maxAge: 90,
      autoRotation: true,
      notificationDays: [14, 7, 3]
    }
  };

  /**
   * Generate new encryption key
   */
  static generateKey(
    keyType: KeyType,
    keySize: number = this.DEFAULT_KEY_SIZE,
    purpose: string = 'general_encryption',
    createdBy: string = 'system',
    environment: 'development' | 'staging' | 'production' = 'production'
  ): { key: string; metadata: KeyMetadata } {
    try {
      // Generate random key
      const key = crypto.randomBytes(keySize / 8).toString('hex');
      
      // Generate key ID
      const keyId = this.generateKeyId(keyType);
      
      // Get rotation policy
      const rotationPolicy = this.ROTATION_POLICIES[keyType];
      
      // Calculate expiration date
      const expiresAt = new Date(Date.now() + rotationPolicy.maxAge * 24 * 60 * 60 * 1000);
      
      // Calculate next rotation date
      const nextRotationAt = new Date(Date.now() + rotationPolicy.rotationInterval * 24 * 60 * 60 * 1000);
      
      // Create metadata
      const metadata: KeyMetadata = {
        keyId,
        keyType,
        algorithm: this.DEFAULT_ALGORITHM,
        keySize,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        usageCount: 0,
        status: 'active',
        purpose,
        complianceLevel: this.getComplianceLevel(keyType),
        rotationPolicy: rotationPolicy.autoRotation ? 'automatic' : 'manual',
        nextRotationAt: nextRotationAt.toISOString(),
        createdBy,
        environment,
        tags: this.generateTags(keyType, purpose)
      };

      // Log key generation
      logSecurityEvent('encryption_key_generated', {
        keyId,
        keyType,
        keySize,
        purpose,
        createdBy,
        environment,
        algorithm: this.DEFAULT_ALGORITHM,
        expiresAt: expiresAt.toISOString(),
        timestamp: metadata.createdAt
      });

      return { key, metadata };

    } catch (error) {
      logSecurityEvent('encryption_key_generation_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        keyType,
        keySize,
        purpose,
        createdBy,
        timestamp: new Date().toISOString()
      });
      
      throw new Error('Failed to generate encryption key');
    }
  }

  /**
   * Generate key ID
   */
  private static generateKeyId(keyType: KeyType): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `${this.KEY_VERSION_PREFIX}${keyType}_${timestamp}_${random}`;
  }

  /**
   * Get compliance level for key type
   */
  private static getComplianceLevel(keyType: KeyType): 'basic' | 'enhanced' | 'critical' {
    const criticalTypes: KeyType[] = [
      'master_key', 'data_encryption_key', 'password_hash_salt', 'recovery_key'
    ];
    
    const enhancedTypes: KeyType[] = [
      'field_encryption_key', 'api_key', 'jwt_secret', 'audit_key', 'compliance_key'
    ];

    if (criticalTypes.includes(keyType)) {
      return 'critical';
    } else if (enhancedTypes.includes(keyType)) {
      return 'enhanced';
    } else {
      return 'basic';
    }
  }

  /**
   * Generate tags for key
   */
  private static generateTags(keyType: KeyType, purpose: string): string[] {
    const tags = [keyType, purpose];
    
    // Add environment-specific tags
    if (process.env.NODE_ENV === 'production') {
      tags.push('production');
    } else if (process.env.NODE_ENV === 'staging') {
      tags.push('staging');
    } else {
      tags.push('development');
    }

    // Add compliance tags
    const complianceLevel = this.getComplianceLevel(keyType);
    tags.push(complianceLevel);

    return tags;
  }

  /**
   * Rotate encryption key
   */
  static rotateKey(
    oldKeyId: string,
    keyType: KeyType,
    purpose: string = 'general_encryption',
    createdBy: string = 'system',
    environment: 'development' | 'staging' | 'production' = 'production'
  ): { newKey: string; newMetadata: KeyMetadata; oldKeyId: string } {
    try {
      // Generate new key
      const { key: newKey, metadata: newMetadata } = this.generateKey(
        keyType,
        this.DEFAULT_KEY_SIZE,
        purpose,
        createdBy,
        environment
      );

      // Log key rotation
      logSecurityEvent('encryption_key_rotated', {
        oldKeyId,
        newKeyId: newMetadata.keyId,
        keyType,
        purpose,
        createdBy,
        environment,
        timestamp: new Date().toISOString()
      });

      return {
        newKey,
        newMetadata,
        oldKeyId
      };

    } catch (error) {
      logSecurityEvent('encryption_key_rotation_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        oldKeyId,
        keyType,
        purpose,
        createdBy,
        timestamp: new Date().toISOString()
      });
      
      throw new Error('Failed to rotate encryption key');
    }
  }

  /**
   * Revoke encryption key
   */
  static revokeKey(
    keyId: string,
    reason: string = 'manual_revocation',
    revokedBy: string = 'system'
  ): void {
    try {
      // Log key revocation
      logSecurityEvent('encryption_key_revoked', {
        keyId,
        reason,
        revokedBy,
        timestamp: new Date().toISOString()
      });

      // In a real implementation, you would:
      // 1. Mark the key as revoked in the key store
      // 2. Update the key status to 'revoked'
      // 3. Notify relevant systems
      // 4. Schedule key destruction if required by compliance

    } catch (error) {
      logSecurityEvent('encryption_key_revocation_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        keyId,
        reason,
        revokedBy,
        timestamp: new Date().toISOString()
      });
      
      throw new Error('Failed to revoke encryption key');
    }
  }

  /**
   * Check if key needs rotation
   */
  static checkKeyRotationNeeded(metadata: KeyMetadata): {
    needsRotation: boolean;
    reason?: string;
    daysUntilRotation?: number;
  } {
    try {
      const now = new Date();
      const createdAt = new Date(metadata.createdAt);
      const expiresAt = metadata.expiresAt ? new Date(metadata.expiresAt) : null;
      const nextRotationAt = metadata.nextRotationAt ? new Date(metadata.nextRotationAt) : null;

      // Check if key is expired
      if (expiresAt && expiresAt < now) {
        return {
          needsRotation: true,
          reason: 'Key has expired',
          daysUntilRotation: 0
        };
      }

      // Check if key has exceeded usage count
      const rotationPolicy = this.ROTATION_POLICIES[metadata.keyType];
      if (metadata.usageCount >= rotationPolicy.maxUsageCount) {
        return {
          needsRotation: true,
          reason: 'Key has exceeded maximum usage count',
          daysUntilRotation: 0
        };
      }

      // Check if key is due for rotation
      if (nextRotationAt && nextRotationAt < now) {
        return {
          needsRotation: true,
          reason: 'Key is due for rotation',
          daysUntilRotation: 0
        };
      }

      // Check if key is approaching rotation
      if (nextRotationAt) {
        const daysUntilRotation = Math.ceil((nextRotationAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilRotation <= 7) {
          return {
            needsRotation: false,
            reason: 'Key rotation approaching',
            daysUntilRotation
          };
        }
      }

      return {
        needsRotation: false
      };

    } catch (error) {
      logSecurityEvent('key_rotation_check_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        keyId: metadata.keyId,
        timestamp: new Date().toISOString()
      });
      
      return {
        needsRotation: false,
        reason: 'Error checking rotation status'
      };
    }
  }

  /**
   * Get key rotation policy
   */
  static getKeyRotationPolicy(keyType: KeyType): KeyRotationPolicy {
    return this.ROTATION_POLICIES[keyType];
  }

  /**
   * Get all key rotation policies
   */
  static getAllKeyRotationPolicies(): Record<KeyType, KeyRotationPolicy> {
    return this.ROTATION_POLICIES;
  }

  /**
   * Validate key metadata
   */
  static validateKeyMetadata(metadata: KeyMetadata): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Check required fields
      if (!metadata.keyId) errors.push('Key ID is required');
      if (!metadata.keyType) errors.push('Key type is required');
      if (!metadata.algorithm) errors.push('Algorithm is required');
      if (!metadata.keySize) errors.push('Key size is required');
      if (!metadata.createdAt) errors.push('Created at is required');
      if (!metadata.status) errors.push('Status is required');
      if (!metadata.purpose) errors.push('Purpose is required');
      if (!metadata.complianceLevel) errors.push('Compliance level is required');
      if (!metadata.createdBy) errors.push('Created by is required');
      if (!metadata.environment) errors.push('Environment is required');

      // Validate key size
      if (metadata.keySize && (metadata.keySize < 128 || metadata.keySize > 512)) {
        errors.push('Key size must be between 128 and 512 bits');
      }

      // Validate dates
      if (metadata.createdAt) {
        const createdAt = new Date(metadata.createdAt);
        if (isNaN(createdAt.getTime())) {
          errors.push('Invalid created at date');
        }
      }

      if (metadata.expiresAt) {
        const expiresAt = new Date(metadata.expiresAt);
        if (isNaN(expiresAt.getTime())) {
          errors.push('Invalid expires at date');
        }
      }

      // Validate status
      const validStatuses = ['active', 'inactive', 'expired', 'revoked'];
      if (metadata.status && !validStatuses.includes(metadata.status)) {
        errors.push('Invalid status');
      }

      // Validate compliance level
      const validComplianceLevels = ['basic', 'enhanced', 'critical'];
      if (metadata.complianceLevel && !validComplianceLevels.includes(metadata.complianceLevel)) {
        errors.push('Invalid compliance level');
      }

      return {
        valid: errors.length === 0,
        errors
      };

    } catch (error) {
      errors.push('Error validating key metadata');
      return {
        valid: false,
        errors
      };
    }
  }

  /**
   * Get key management status
   */
  static getStatus(): {
    initialized: boolean;
    supportedKeyTypes: KeyType[];
    rotationPolicies: number;
    defaultKeySize: number;
    defaultAlgorithm: string;
  } {
    return {
      initialized: true,
      supportedKeyTypes: Object.keys(this.ROTATION_POLICIES) as KeyType[],
      rotationPolicies: Object.keys(this.ROTATION_POLICIES).length,
      defaultKeySize: this.DEFAULT_KEY_SIZE,
      defaultAlgorithm: this.DEFAULT_ALGORITHM
    };
  }
}
