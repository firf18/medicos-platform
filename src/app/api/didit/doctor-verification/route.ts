/**
 * 🎯 DIDIT DOCTOR VERIFICATION ENDPOINT
 * 
 * Endpoint especializado para crear sesiones de verificación de doctores
 * con configuración específica para médicos venezolanos
 * 
 * @version 2.0.0
 * @author Platform Médicos Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';
import { diditApiClient, DiditApiError } from '@/lib/didit/client';

// Tipos para la integración de doctores
interface DoctorVerificationRequest {
  doctor_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality?: string;
  document_number?: string;
  email?: string;
  phone?: string;
  callback_url?: string; // 🔧 CORRECCIÓN: Agregar callback_url
}

interface DoctorVerificationResponse {
  session_id: string;
  session_url: string;
  session_token: string;
  status: string;
  workflow_id: string;
  features: string[];
  expires_at?: string;
  created_at: string;
}

/**
 * Crea una sesión de verificación completa para un doctor
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      doctor_id, 
      first_name, 
      last_name, 
      date_of_birth, 
      nationality = 'VEN', 
      document_number, 
      email, 
      phone,
      callback_url // 🔧 CORRECCIÓN: Extraer callback_url
    } = body as DoctorVerificationRequest;

    // Validar datos requeridos
    if (!doctor_id || !first_name || !last_name || !date_of_birth) {
      return NextResponse.json(
        { error: 'doctor_id, first_name, last_name y date_of_birth son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date_of_birth)) {
      return NextResponse.json(
        { error: 'date_of_birth debe estar en formato YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Log de auditoría
    logSecurityEvent(
      'data_access',
      `Solicitud de verificación para doctor ${doctor_id}`,
      {
        doctorId: doctor_id,
        firstName: first_name,
        lastName: last_name,
        hasDocument: !!document_number,
        hasEmail: !!email,
        hasPhone: !!phone,
        timestamp: new Date().toISOString()
      },
      'info'
    );

    // Crear sesión usando el cliente robusto con callback URL corregida
    const sessionData = await diditApiClient.createDoctorSession({
      doctorId: doctor_id,
      firstName: first_name,
      lastName: last_name,
      dateOfBirth: date_of_birth,
      email,
      phone,
      documentNumber: document_number,
        callbackUrl: callback_url || 
          (process.env.NODE_ENV === 'development' 
            ? 'http://localhost:3000/api/auth/didit/callback'
            : `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/didit/callback`) // 🔧 CORRECCIÓN: Forzar localhost en desarrollo
    });

    // Construir respuesta compatible con el frontend existente
    const response: DoctorVerificationResponse = {
      session_id: sessionData.session_id,
      session_url: sessionData.url,
      session_token: sessionData.session_token,
      status: sessionData.status,
      workflow_id: sessionData.workflow_id,
      features: ['ID_VERIFICATION', 'LIVENESS', 'FACE_MATCH', 'AML', 'IP_ANALYSIS'],
      created_at: new Date().toISOString()
    };

    // Log de auditoría exitoso
    logSecurityEvent(
      'data_access',
      `Sesión de verificación Didit creada para doctor ${doctor_id}`,
      {
        sessionId: sessionData.session_id,
        doctorId: doctor_id,
        workflowId: sessionData.workflow_id,
        sessionUrl: sessionData.url,
        timestamp: new Date().toISOString()
      },
      'info'
    );

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error en verificación de doctor:', error);

    // Manejo específico de errores de Didit
    if (error instanceof DiditApiError) {
      const statusCode = error.statusCode || 500;
      
      logSecurityEvent(
        'system_error',
        `Error de Didit en verificación de doctor: ${error.message}`,
        {
          error: error.message,
          statusCode,
          details: error.details,
          timestamp: new Date().toISOString()
        },
        'error'
      );

      return NextResponse.json(
        { 
          error: error.message,
          details: error.details,
          status: statusCode
        },
        { status: statusCode }
      );
    }

    // Error genérico
    logSecurityEvent(
      'system_error',
      `Error interno en verificación de doctor: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      {
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      },
      'error'
    );

    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: 'Error procesando solicitud de verificación'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint para obtener información del workflow de doctores
 */
export async function GET() {
  try {
    return NextResponse.json({
      workflow_type: 'doctor_verification',
      features: ['ID_VERIFICATION', 'LIVENESS', 'FACE_MATCH', 'AML', 'IP_ANALYSIS'],
      country: 'VEN',
      language: 'es',
      description: 'Workflow especializado para verificación de doctores venezolanos'
    });
  } catch (error) {
    console.error('Error obteniendo información del workflow:', error);
    return NextResponse.json(
      { error: 'Error obteniendo información del workflow' },
      { status: 500 }
    );
  }
}