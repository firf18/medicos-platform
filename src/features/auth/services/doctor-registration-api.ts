/**
 * Servicio de API para Registro de Médicos
 * 
 * Centraliza todas las comunicaciones con el backend para el registro médico,
 * siguiendo el principio de responsabilidad única.
 */

import { DoctorRegistrationData } from '@/types/medical/specialties';
import { logger } from '@/lib/logging/logger';
import { logSecurityEvent } from '@/lib/validations/doctor-registration';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class DoctorRegistrationApiService {
  private static readonly BASE_URL = '/api/auth/register/doctor';

  /**
   * Verifica disponibilidad de email
   */
  static async checkEmailAvailability(email: string): Promise<ApiResponse<{ available: boolean }>> {
    try {
      logger.debug('api', 'Checking email availability', { email });

      const response = await fetch(`${this.BASE_URL}/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error checking email availability');
      }

      logger.info('api', 'Email availability checked', { 
        email, 
        available: result.available 
      });

      return {
        success: true,
        data: { available: result.available }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logSecurityEvent('email_availability_check_failed', {
        email,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });

      logger.error('api', 'Email availability check failed', {
        email,
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Verifica licencia médica
   */
  static async verifyMedicalLicense(licenseData: {
    licenseNumber: string;
    licenseState: string;
    licenseExpiry: string;
  }): Promise<ApiResponse<{ verified: boolean; details?: any }>> {
    try {
      logger.debug('api', 'Verifying medical license', { 
        licenseNumber: licenseData.licenseNumber,
        licenseState: licenseData.licenseState 
      });

      const response = await fetch(`${this.BASE_URL}/verify-license`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(licenseData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error verifying medical license');
      }

      logSecurityEvent('medical_license_verified', {
        licenseNumber: licenseData.licenseNumber,
        licenseState: licenseData.licenseState,
        verified: result.verified,
        timestamp: new Date().toISOString()
      });

      logger.info('api', 'Medical license verified', { 
        licenseNumber: licenseData.licenseNumber,
        verified: result.verified 
      });

      return {
        success: true,
        data: { 
          verified: result.verified,
          details: result.details 
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logSecurityEvent('medical_license_verification_failed', {
        licenseNumber: licenseData.licenseNumber,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });

      logger.error('api', 'Medical license verification failed', {
        licenseNumber: licenseData.licenseNumber,
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Inicia verificación de identidad con Didit
   */
  static async initiateIdentityVerification(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }): Promise<ApiResponse<{ verificationId: string; verificationUrl: string }>> {
    try {
      logger.debug('api', 'Initiating identity verification', { 
        email: userData.email 
      });

      const response = await fetch(`${this.BASE_URL}/identity-verification/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error initiating identity verification');
      }

      logSecurityEvent('identity_verification_initiated', {
        email: userData.email,
        verificationId: result.verificationId,
        timestamp: new Date().toISOString()
      });

      logger.info('api', 'Identity verification initiated', { 
        email: userData.email,
        verificationId: result.verificationId 
      });

      return {
        success: true,
        data: {
          verificationId: result.verificationId,
          verificationUrl: result.verificationUrl
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logSecurityEvent('identity_verification_initiation_failed', {
        email: userData.email,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });

      logger.error('api', 'Identity verification initiation failed', {
        email: userData.email,
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Verifica el estado de la verificación de identidad
   */
  static async checkIdentityVerificationStatus(verificationId: string): Promise<ApiResponse<{
    status: 'pending' | 'completed' | 'failed';
    details?: any;
  }>> {
    try {
      logger.debug('api', 'Checking identity verification status', { 
        verificationId 
      });

      const response = await fetch(`${this.BASE_URL}/identity-verification/status/${verificationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error checking identity verification status');
      }

      logger.info('api', 'Identity verification status checked', { 
        verificationId,
        status: result.status 
      });

      return {
        success: true,
        data: {
          status: result.status,
          details: result.details
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('api', 'Identity verification status check failed', {
        verificationId,
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Sube documento de licencia
   */
  static async uploadLicenseDocument(file: File, licenseNumber: string): Promise<ApiResponse<{
    documentUrl: string;
    documentId: string;
  }>> {
    try {
      logger.debug('api', 'Uploading license document', { 
        licenseNumber,
        fileName: file.name,
        fileSize: file.size 
      });

      const formData = new FormData();
      formData.append('document', file);
      formData.append('licenseNumber', licenseNumber);

      const response = await fetch(`${this.BASE_URL}/upload-license-document`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error uploading license document');
      }

      logSecurityEvent('license_document_uploaded', {
        licenseNumber,
        documentId: result.documentId,
        fileName: file.name,
        timestamp: new Date().toISOString()
      });

      logger.info('api', 'License document uploaded', { 
        licenseNumber,
        documentId: result.documentId 
      });

      return {
        success: true,
        data: {
          documentUrl: result.documentUrl,
          documentId: result.documentId
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logSecurityEvent('license_document_upload_failed', {
        licenseNumber,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });

      logger.error('api', 'License document upload failed', {
        licenseNumber,
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Finaliza el registro del médico
   */
  static async finalizeRegistration(registrationData: DoctorRegistrationData): Promise<ApiResponse<{
    userId: string;
    profileId: string;
    needsEmailVerification: boolean;
  }>> {
    try {
      logger.debug('api', 'Finalizing doctor registration', { 
        email: registrationData.email,
        licenseNumber: registrationData.licenseNumber 
      });

      const response = await fetch(`${this.BASE_URL}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error finalizing registration');
      }

      logSecurityEvent('doctor_registration_finalized', {
        email: registrationData.email,
        licenseNumber: registrationData.licenseNumber,
        userId: result.userId,
        timestamp: new Date().toISOString()
      });

      logger.info('api', 'Doctor registration finalized', { 
        email: registrationData.email,
        userId: result.userId 
      });

      return {
        success: true,
        data: {
          userId: result.userId,
          profileId: result.profileId,
          needsEmailVerification: result.needsEmailVerification
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logSecurityEvent('doctor_registration_finalization_failed', {
        email: registrationData.email,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });

      logger.error('api', 'Doctor registration finalization failed', {
        email: registrationData.email,
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Obtiene especialidades médicas disponibles
   */
  static async getMedicalSpecialties(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    subSpecialties: Array<{ id: string; name: string }>;
  }>>> {
    try {
      logger.debug('api', 'Fetching medical specialties');

      const response = await fetch('/api/medical-specialties', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error fetching medical specialties');
      }

      logger.info('api', 'Medical specialties fetched', { 
        count: result.specialties?.length || 0 
      });

      return {
        success: true,
        data: result.specialties || []
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('api', 'Medical specialties fetch failed', {
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Guarda progreso del registro
   */
  static async saveRegistrationProgress(
    sessionId: string, 
    data: Partial<DoctorRegistrationData>
  ): Promise<ApiResponse<{ saved: boolean }>> {
    try {
      logger.debug('api', 'Saving registration progress', { 
        sessionId,
        dataKeys: Object.keys(data) 
      });

      const response = await fetch(`${this.BASE_URL}/save-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          data,
          timestamp: new Date().toISOString()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error saving registration progress');
      }

      logger.debug('api', 'Registration progress saved', { 
        sessionId,
        saved: result.saved 
      });

      return {
        success: true,
        data: { saved: result.saved }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('api', 'Registration progress save failed', {
        sessionId,
        error: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }
}