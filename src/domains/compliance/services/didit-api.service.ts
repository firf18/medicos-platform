/**
 * Didit API Service
 * @fileoverview Core API integration service for Didit identity verification
 * @compliance HIPAA-compliant API communication with security
 */

import {
  DiditSession,
  DiditDecision,
  VenezuelanDoctorData,
  DiditSessionSchema,
  DiditDecisionSchema,
  DiditConfig,
  DiditError,
  DECISION_STATUS
} from '../types/didit-api.types';

/**
 * Get Didit configuration from environment
 */
export const getDiditConfig = (): DiditConfig => {
  const config: DiditConfig = {
    environment: (process.env.NEXT_PUBLIC_DIDIT_ENV as 'sandbox' | 'production') || 'sandbox',
    workflowId: process.env.NEXT_PUBLIC_DIDIT_WORKFLOW_ID || '',
    apiKey: process.env.DIDIT_API_KEY || '',
    apiSecret: process.env.DIDIT_API_SECRET || '',
    callbackUrl: process.env.NEXT_PUBLIC_DIDIT_CALLBACK_URL,
    webhookUrl: process.env.DIDIT_WEBHOOK_URL,
    features: ['id-verification', 'face-match', 'liveness']
  };

  // Validate required config
  if (!config.workflowId) {
    throw new Error('DIDIT_WORKFLOW_ID no está configurado');
  }
  
  if (!config.apiKey || !config.apiSecret) {
    throw new Error('Credenciales de Didit API no configuradas');
  }

  return config;
};

/**
 * Get API base URL based on environment
 */
export const getApiBaseUrl = (environment: 'sandbox' | 'production'): string => {
  return environment === 'production'
    ? 'https://api.didit.me'
    : 'https://sandbox-api.didit.me';
};

/**
 * Generate vendor data for doctor verification
 */
export const generateVendorData = (doctorData: VenezuelanDoctorData): string => {
  const vendorData = {
    type: 'medical_professional',
    country: 'VE',
    license_number: doctorData.licenseNumber,
    medical_board: doctorData.medicalBoard || 'N/A',
    university: doctorData.university || 'N/A',
    graduation_year: doctorData.graduationYear || 'N/A',
    document_type: doctorData.documentType,
    document_number: doctorData.documentNumber,
    timestamp: new Date().toISOString()
  };

  return JSON.stringify(vendorData);
};

/**
 * Create Didit session
 */
export const createDiditSession = async (
  doctorData: VenezuelanDoctorData,
  config?: Partial<DiditConfig>
): Promise<DiditSession> => {
  const diditConfig = { ...getDiditConfig(), ...config };
  const baseUrl = getApiBaseUrl(diditConfig.environment);

  try {
    const response = await fetch(`${baseUrl}/v2/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${diditConfig.apiKey}`,
        'X-API-Secret': diditConfig.apiSecret
      },
      body: JSON.stringify({
        workflow_id: diditConfig.workflowId,
        vendor_data: generateVendorData(doctorData),
        metadata: {
          user_type: 'doctor',
          platform: 'red-salud',
          registration_date: new Date().toISOString()
        },
        expected_details: {
          first_name: doctorData.firstName,
          last_name: doctorData.lastName
        },
        contact_details: {
          email: doctorData.email,
          email_lang: 'es'
        },
        callback: diditConfig.callbackUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/didit/callback`,
        features: diditConfig.features
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw createDiditError(
        'SESSION_CREATION_FAILED',
        `Error creating session: ${response.status}`,
        errorData,
        response.status
      );
    }

    const sessionData = await response.json();
    
    // Validate response schema
    const validatedSession = DiditSessionSchema.parse(sessionData);
    
    return validatedSession;

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw createDiditError(
      'UNKNOWN_ERROR',
      'Error desconocido al crear sesión',
      { error }
    );
  }
};

/**
 * Get session status
 */
export const getSessionStatus = async (
  sessionId: string,
  config?: Partial<DiditConfig>
): Promise<DiditDecision> => {
  const diditConfig = { ...getDiditConfig(), ...config };
  const baseUrl = getApiBaseUrl(diditConfig.environment);

  try {
    const response = await fetch(`${baseUrl}/v2/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${diditConfig.apiKey}`,
        'X-API-Secret': diditConfig.apiSecret
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw createDiditError(
        'SESSION_FETCH_FAILED',
        `Error fetching session: ${response.status}`,
        errorData,
        response.status
      );
    }

    const sessionData = await response.json();
    
    // Validate response schema
    const validatedDecision = DiditDecisionSchema.parse(sessionData);
    
    return validatedDecision;

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw createDiditError(
      'UNKNOWN_ERROR',
      'Error desconocido al obtener estado de sesión',
      { error }
    );
  }
};

/**
 * Verify webhook signature
 */
export const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  try {
    // Implementation depends on Didit's signature algorithm
    // This is a placeholder implementation
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};

/**
 * Process verification decision
 */
export const processVerificationDecision = (
  decision: DiditDecision
): {
  isApproved: boolean;
  requiresReview: boolean;
  declineReasons: string[];
  verificationDetails: Record<string, any>;
} => {
  const isApproved = decision.decision === DECISION_STATUS.APPROVED;
  const requiresReview = decision.decision === DECISION_STATUS.REVIEW;
  const declineReasons: string[] = [];
  const verificationDetails: Record<string, any> = {};

  // Process ID verification
  if (decision.id_verification) {
    verificationDetails.idVerification = {
      status: decision.id_verification.status,
      documentType: decision.id_verification.document_type,
      documentNumber: decision.id_verification.document_number,
      fullName: decision.id_verification.full_name,
      warnings: decision.id_verification.warnings || []
    };

    if (decision.id_verification.status === 'Declined') {
      declineReasons.push('Verificación de identidad fallida');
    }
  }

  // Process face match
  if (decision.face_match) {
    verificationDetails.faceMatch = {
      status: decision.face_match.status,
      confidence: decision.face_match.confidence,
      similarity: decision.face_match.similarity
    };

    if (decision.face_match.status === 'no_match') {
      declineReasons.push('La foto no coincide con el documento');
    }
  }

  // Process liveness
  if (decision.liveness) {
    verificationDetails.liveness = {
      status: decision.liveness.status,
      confidence: decision.liveness.confidence
    };

    if (decision.liveness.status === 'not_live') {
      declineReasons.push('Prueba de vida fallida');
    }
  }

  // Process AML
  if (decision.aml) {
    verificationDetails.aml = {
      status: decision.aml.status,
      riskLevel: decision.aml.risk_level
    };

    if (decision.aml.status === 'hit') {
      declineReasons.push('Alerta en verificación AML');
    }
  }

  // Add decline reason from decision if available
  if (decision.decline_reason) {
    declineReasons.push(decision.decline_reason);
  }

  return {
    isApproved,
    requiresReview,
    declineReasons,
    verificationDetails
  };
};

/**
 * Create Didit error
 */
export const createDiditError = (
  code: string,
  message: string,
  details?: Record<string, any>,
  statusCode?: number
): DiditError => {
  return {
    code,
    message,
    details,
    statusCode
  };
};

/**
 * Extract doctor data from verification
 */
export const extractDoctorDataFromVerification = (
  decision: DiditDecision
): Partial<VenezuelanDoctorData> => {
  const extractedData: Partial<VenezuelanDoctorData> = {};

  if (decision.id_verification) {
    if (decision.id_verification.first_name) {
      extractedData.firstName = decision.id_verification.first_name;
    }
    if (decision.id_verification.last_name) {
      extractedData.lastName = decision.id_verification.last_name;
    }
    if (decision.id_verification.document_number) {
      extractedData.documentNumber = decision.id_verification.document_number;
    }
  }

  // Extract from vendor data if available
  if (decision.vendor_data) {
    try {
      const vendorData = JSON.parse(decision.vendor_data);
      if (vendorData.license_number) {
        extractedData.licenseNumber = vendorData.license_number;
      }
      if (vendorData.medical_board) {
        extractedData.medicalBoard = vendorData.medical_board;
      }
      if (vendorData.university) {
        extractedData.university = vendorData.university;
      }
      if (vendorData.graduation_year) {
        extractedData.graduationYear = vendorData.graduation_year;
      }
    } catch (error) {
      console.error('Error parsing vendor data:', error);
    }
  }

  return extractedData;
};
