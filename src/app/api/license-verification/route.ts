/**
 * Endpoint API para verificación de licencias profesionales médicas venezolanas
 * 
 * Permite verificar la autenticidad de cédulas profesionales de médicos venezolanos
 * mediante scraping de sitios web oficiales del gobierno.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateVenezuelanMedicalLicense } from '@/lib/validators/professional-license-validator';
import { createServerSupabaseClient } from '@/lib/supabase/server';
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
// MIDDLEWARE Y VALIDACIÓN
// ============================================================================

/**
 * Valida que el usuario esté autenticado
 */
async function requireAuth(): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    return !!user;
  } catch (error) {
    logger.error('verification', 'Authentication check failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
}

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
 * POST - Verifica una licencia profesional médica venezolana
 */
export async function POST(request: NextRequest) {
  let startTime = Date.now();
  
  try {
    // Verificar autenticación
    const isAuthenticated = await requireAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

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

    logger.info('verification', 'Starting license verification', {
      documentType: licenseData.documentType,
      documentNumber: licenseData.documentNumber,
      timestamp: new Date().toISOString()
    });

    // Realizar verificación
    const result = await validateVenezuelanMedicalLicense(licenseData);
    
    const processingTime = Date.now() - startTime;
    
    logger.info('verification', 'License verification completed', {
      documentType: licenseData.documentType,
      documentNumber: licenseData.documentNumber,
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
    
    logger.error('verification', 'License verification failed', {
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
  } finally {
    // Cerrar el validador para liberar recursos
    try {
      // El validador se cierra automáticamente en la función validateVenezuelanMedicalLicense
    } catch (error) {
      logger.warn('verification', 'Failed to close license validator', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

/**
 * GET - Health check del endpoint
 */
export async function GET() {
  return NextResponse.json({
    service: 'License Verification API',
    status: 'active',
    version: '1.0.0',
    timestamp: new Date().toISOString()
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