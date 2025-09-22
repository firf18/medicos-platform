/**
 * Endpoint API para verificación de licencias durante el registro médico
 * 
 * Este endpoint permite verificar licencias médicas durante el proceso de registro
 * sin requerir autenticación completa, ya que el usuario aún se está registrando.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateVenezuelanMedicalLicense } from '@/lib/validators/professional-license-validator';
import { logger } from '@/lib/logging/logger';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface LicenseVerificationRequest {
  documentType: 'cedula_identidad' | 'cedula_extranjera';
  documentNumber: string;
  firstName?: string;
  lastName?: string;
}

interface LicenseVerificationResponse {
  success: boolean;
  result?: {
    isValid: boolean;
    isVerified: boolean;
    verificationSource: string;
    doctorName?: string;
    licenseStatus?: string;
    specialty?: string;
    verificationDate?: string;
    verificationId?: string;
  };
  error?: string;
}

// ============================================================================
// VALIDACIÓN
// ============================================================================

/**
 * Valida los parámetros de la solicitud
 */
function validateRequestParams(body: unknown): { isValid: boolean; error?: string } {
  if (!body) {
    return { isValid: false, error: 'Cuerpo de solicitud requerido' };
  }

  // Verificar que el body sea un objeto
  if (typeof body !== 'object' || body === null) {
    return { isValid: false, error: 'Formato de solicitud inválido' };
  }

  // Verificar que tenga las propiedades requeridas
  const requestBody = body as Record<string, unknown>;
  
  if (!requestBody.documentType) {
    return { isValid: false, error: 'Tipo de documento requerido' };
  }

  if (typeof requestBody.documentType !== 'string' || !['cedula_identidad', 'cedula_extranjera'].includes(requestBody.documentType)) {
    return { isValid: false, error: 'Tipo de documento no válido' };
  }

  if (!requestBody.documentNumber) {
    return { isValid: false, error: 'Número de documento requerido' };
  }

  if (typeof requestBody.documentNumber !== 'string') {
    return { isValid: false, error: 'Número de documento debe ser una cadena de texto' };
  }

  // Validar formato según tipo de documento
  switch (requestBody.documentType) {
    case 'cedula_identidad':
      if (!/^V-\d{7,8}$/.test(requestBody.documentNumber)) {
        return { 
          isValid: false, 
          error: 'Formato de cédula de identidad venezolana inválido. Debe ser V-XXXXXXXX' 
        };
      }
      break;

    case 'cedula_extranjera':
      if (!/^E-\d{7,8}$/.test(requestBody.documentNumber)) {
        return { 
          isValid: false, 
          error: 'Formato de cédula de identidad extranjera inválido. Debe ser E-XXXXXXXX' 
        };
      }
      break;
  }

  return { isValid: true };
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * POST - Verifica una licencia profesional médica durante el registro
 */
export async function POST(request: NextRequest) {
  let startTime = Date.now();
  
  try {
    // Parsear cuerpo de la solicitud
    const body = await request.json();
    
    // Validar parámetros
    const validation = validateRequestParams(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const licenseData: LicenseVerificationRequest = body;

    logger.info('verification-registration', 'Starting license verification for registration', {
      documentType: licenseData.documentType,
      documentNumber: licenseData.documentNumber.replace(/\d/g, 'X'), // Mask for security
      timestamp: new Date().toISOString()
    });

    // Realizar verificación
    const result = await validateVenezuelanMedicalLicense({
      documentType: licenseData.documentType,
      documentNumber: licenseData.documentNumber,
      firstName: licenseData.firstName,
      lastName: licenseData.lastName
    });
    
    const processingTime = Date.now() - startTime;
    
    logger.info('verification-registration', 'License verification completed for registration', {
      documentType: licenseData.documentType,
      documentNumber: licenseData.documentNumber.replace(/\d/g, 'X'),
      isValid: result.isValid,
      isVerified: result.isVerified,
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString()
    });

    // Preparar respuesta
    const response: LicenseVerificationResponse = {
      success: true,
      result: {
        isValid: result.isValid,
        isVerified: result.isVerified,
        verificationSource: result.verificationSource,
        doctorName: result.doctorName,
        licenseStatus: result.licenseStatus,
        specialty: result.specialty,
        verificationDate: result.verificationDate,
        verificationId: result.verificationId
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error('verification-registration', 'License verification failed for registration', {
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor al verificar la licencia profesional' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Health check del endpoint
 */
export async function GET() {
  return NextResponse.json({
    service: 'License Verification API (Registration)',
    status: 'active',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    description: 'Verificación de licencias médicas durante el proceso de registro'
  });
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}