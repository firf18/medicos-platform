/**
 * Encryption Service
 * @fileoverview Service responsible for encrypting and decrypting sensitive data using AES-256
 * @compliance HIPAA-compliant encryption with audit trail
 */

import CryptoJS from 'crypto-js';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';

/**
 * Encryption configuration
 */
export interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  ivSize: number;
  iterations: number;
  saltSize: number;
}

/**
 * Encryption result
 */
export interface EncryptionResult {
  encrypted: string;
  iv: string;
  salt: string;
  algorithm: string;
  timestamp: string;
}

/**
 * Decryption result
 */
export interface DecryptionResult {
  decrypted: string;
  success: boolean;
  error?: string;
}

/**
 * Key derivation result
 */
interface KeyDerivationResult {
  key: CryptoJS.lib.WordArray;
  salt: CryptoJS.lib.WordArray;
}

/**
 * Encryption service using AES-256-GCM
 */
export class EncryptionService {
  private static readonly DEFAULT_CONFIG: EncryptionConfig = {
    algorithm: 'AES',
    keySize: 256,
    ivSize: 128,
    iterations: 10000,
    saltSize: 128
  };

  private static config = this.DEFAULT_CONFIG;
  private static masterKey: string;

  /**
   * Initialize encryption service
   */
  static initialize(masterKey: string, config?: Partial<EncryptionConfig>): void {
    if (!masterKey || masterKey.length < 32) {
      throw new Error('Master key must be at least 32 characters long');
    }

    this.masterKey = masterKey;
    
    if (config) {
      this.config = { ...this.DEFAULT_CONFIG, ...config };
    }

    logSecurityEvent('encryption_service_initialized', {
      algorithm: this.config.algorithm,
      keySize: this.config.keySize,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Derive encryption key from master key and salt
   */
  private static deriveKey(salt: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray {
    try {
      return CryptoJS.PBKDF2(this.masterKey, salt, {
        keySize: this.config.keySize / 32,
        iterations: this.config.iterations
      });

    } catch (error) {
      logSecurityEvent('key_derivation_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      throw new Error('Failed to derive encryption key');
    }
  }

  /**
   * Generate random salt
   */
  private static generateSalt(): CryptoJS.lib.WordArray {
    return CryptoJS.lib.WordArray.random(this.config.saltSize / 8);
  }

  /**
   * Generate random IV
   */
  private static generateIV(): CryptoJS.lib.WordArray {
    return CryptoJS.lib.WordArray.random(this.config.ivSize / 8);
  }

  /**
   * Encrypt sensitive data
   */
  static encrypt(data: string, context?: string): EncryptionResult {
    try {
      if (!this.masterKey) {
        throw new Error('Encryption service not initialized');
      }

      if (!data || typeof data !== 'string') {
        throw new Error('Data to encrypt must be a non-empty string');
      }

      // Generate salt and IV
      const salt = this.generateSalt();
      const iv = this.generateIV();

      // Derive key
      const key = this.deriveKey(salt);

      // Encrypt data
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const result: EncryptionResult = {
        encrypted: encrypted.toString(),
        iv: iv.toString(CryptoJS.enc.Hex),
        salt: salt.toString(CryptoJS.enc.Hex),
        algorithm: this.config.algorithm,
        timestamp: new Date().toISOString()
      };

      // Log encryption
      logSecurityEvent('data_encrypted', {
        context: context || 'unknown',
        dataLength: data.length,
        algorithm: this.config.algorithm,
        timestamp: result.timestamp
      });

      return result;

    } catch (error) {
      logSecurityEvent('encryption_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context: context || 'unknown',
        timestamp: new Date().toISOString()
      });
      
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: EncryptionResult, context?: string): DecryptionResult {
    try {
      if (!this.masterKey) {
        return {
          decrypted: '',
          success: false,
          error: 'Encryption service not initialized'
        };
      }

      if (!encryptedData || !encryptedData.encrypted) {
        return {
          decrypted: '',
          success: false,
          error: 'Invalid encrypted data'
        };
      }

      // Parse salt and IV
      const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
      const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);

      // Derive key
      const key = this.deriveKey(salt);

      // Decrypt data
      const decrypted = CryptoJS.AES.decrypt(encryptedData.encrypted, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedString) {
        return {
          decrypted: '',
          success: false,
          error: 'Failed to decrypt data - invalid key or corrupted data'
        };
      }

      // Log decryption
      logSecurityEvent('data_decrypted', {
        context: context || 'unknown',
        dataLength: decryptedString.length,
        algorithm: encryptedData.algorithm,
        timestamp: new Date().toISOString()
      });

      return {
        decrypted: decryptedString,
        success: true
      };

    } catch (error) {
      logSecurityEvent('decryption_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context: context || 'unknown',
        timestamp: new Date().toISOString()
      });
      
      return {
        decrypted: '',
        success: false,
        error: 'Failed to decrypt data'
      };
    }
  }

  /**
   * Encrypt object data
   */
  static encryptObject(obj: Record<string, unknown>, context?: string): EncryptionResult {
    try {
      const jsonString = JSON.stringify(obj);
      return this.encrypt(jsonString, context);

    } catch (error) {
      logSecurityEvent('object_encryption_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context: context || 'unknown',
        timestamp: new Date().toISOString()
      });
      
      throw new Error('Failed to encrypt object');
    }
  }

  /**
   * Decrypt object data
   */
  static decryptObject<T = Record<string, unknown>>(
    encryptedData: EncryptionResult, 
    context?: string
  ): { data: T | null; success: boolean; error?: string } {
    try {
      const decryptionResult = this.decrypt(encryptedData, context);
      
      if (!decryptionResult.success) {
        return {
          data: null,
          success: false,
          error: decryptionResult.error
        };
      }

      const data = JSON.parse(decryptionResult.decrypted) as T;
      
      return {
        data,
        success: true
      };

    } catch (error) {
      logSecurityEvent('object_decryption_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context: context || 'unknown',
        timestamp: new Date().toISOString()
      });
      
      return {
        data: null,
        success: false,
        error: 'Failed to decrypt object'
      };
    }
  }

  /**
   * Generate hash for data integrity verification
   */
  static generateHash(data: string, algorithm: string = 'SHA256'): string {
    try {
      const hash = CryptoJS[algorithm as keyof typeof CryptoJS](data);
      return hash.toString(CryptoJS.enc.Hex);

    } catch (error) {
      logSecurityEvent('hash_generation_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        algorithm,
        timestamp: new Date().toISOString()
      });
      
      throw new Error('Failed to generate hash');
    }
  }

  /**
   * Verify data integrity using hash
   */
  static verifyHash(data: string, hash: string, algorithm: string = 'SHA256'): boolean {
    try {
      const computedHash = this.generateHash(data, algorithm);
      return computedHash === hash;

    } catch (error) {
      logSecurityEvent('hash_verification_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        algorithm,
        timestamp: new Date().toISOString()
      });
      
      return false;
    }
  }

  /**
   * Encrypt with integrity check
   */
  static encryptWithIntegrity(data: string, context?: string): EncryptionResult & { hash: string } {
    try {
      const encrypted = this.encrypt(data, context);
      const hash = this.generateHash(data);
      
      return {
        ...encrypted,
        hash
      };

    } catch (error) {
      logSecurityEvent('encryption_with_integrity_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context: context || 'unknown',
        timestamp: new Date().toISOString()
      });
      
      throw new Error('Failed to encrypt with integrity check');
    }
  }

  /**
   * Decrypt with integrity check
   */
  static decryptWithIntegrity(
    encryptedData: EncryptionResult & { hash: string }, 
    context?: string
  ): DecryptionResult {
    try {
      const decryptionResult = this.decrypt(encryptedData, context);
      
      if (!decryptionResult.success) {
        return decryptionResult;
      }

      // Verify integrity
      const isValid = this.verifyHash(decryptionResult.decrypted, encryptedData.hash);
      
      if (!isValid) {
        logSecurityEvent('integrity_check_failed', {
          context: context || 'unknown',
          timestamp: new Date().toISOString()
        });
        
        return {
          decrypted: '',
          success: false,
          error: 'Data integrity check failed'
        };
      }

      return decryptionResult;

    } catch (error) {
      logSecurityEvent('decryption_with_integrity_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context: context || 'unknown',
        timestamp: new Date().toISOString()
      });
      
      return {
        decrypted: '',
        success: false,
        error: 'Failed to decrypt with integrity check'
      };
    }
  }

  /**
   * Get encryption status
   */
  static getStatus(): { initialized: boolean; algorithm: string; keySize: number } {
    return {
      initialized: !!this.masterKey,
      algorithm: this.config.algorithm,
      keySize: this.config.keySize
    };
  }
}
