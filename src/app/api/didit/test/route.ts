/**
 * 🧪 DIDIT TEST ENDPOINT
 * 
 * Endpoint para probar la conectividad con Didit.me
 * Útil para debugging y verificación de configuración
 * 
 * @version 1.0.0
 * @author Platform Médicos Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateDiditConfig, DIDIT_DOCTOR_CONFIG } from '@/lib/didit/config';
import { diditApiClient, DiditApiError } from '@/lib/didit/client';

/**
 * GET - Prueba la conectividad con Didit
 */
export async function GET(request: NextRequest) {
  try {
    const configValidation = validateDiditConfig();
    
    if (!configValidation.isValid) {
      return NextResponse.json({
        status: 'error',
        message: 'Configuración de Didit inválida',
        errors: configValidation.errors,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Intentar crear una sesión de prueba (sin datos reales)
    try {
      const testSession = await diditApiClient.createDoctorSession({
        doctorId: 'test-doctor-123',
        firstName: 'Test',
        lastName: 'Doctor',
        dateOfBirth: '1990-01-01',
        email: 'test@example.com',
        phone: '+584121234567'
      });

      return NextResponse.json({
        status: 'success',
        message: 'Conexión con Didit exitosa',
        testSession: {
          sessionId: testSession.session_id,
          status: testSession.status,
          workflowId: testSession.workflow_id,
          hasUrl: !!testSession.url
        },
        config: {
          baseUrl: DIDIT_DOCTOR_CONFIG.baseUrl,
          workflowId: DIDIT_DOCTOR_CONFIG.doctorWorkflowId,
          language: DIDIT_DOCTOR_CONFIG.language,
          country: DIDIT_DOCTOR_CONFIG.country
        },
        timestamp: new Date().toISOString()
      });

    } catch (apiError) {
      console.error('Error probando API de Didit:', apiError);
      
      if (apiError instanceof DiditApiError) {
        return NextResponse.json({
          status: 'api_error',
          message: 'Error en API de Didit',
          error: apiError.message,
          statusCode: apiError.statusCode,
          details: apiError.details,
          config: {
            baseUrl: DIDIT_DOCTOR_CONFIG.baseUrl,
            workflowId: DIDIT_DOCTOR_CONFIG.doctorWorkflowId,
            hasApiKey: !!DIDIT_DOCTOR_CONFIG.apiKey
          },
          timestamp: new Date().toISOString()
        }, { status: apiError.statusCode || 500 });
      }

      return NextResponse.json({
        status: 'error',
        message: 'Error desconocido probando Didit',
        error: apiError instanceof Error ? apiError.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error en test de Didit:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Error interno en test de Didit',
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
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
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
