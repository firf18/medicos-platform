/**
 * 🎯 DIDIT PRODUCTION READY INTEGRATION
 * 
 * Integración completa y lista para producción con Didit
 * Usa el workflow_id real y maneja todo el flujo de verificación
 * 
 * @version 2.0.0
 * @author Platform Médicos Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { logSecurityEvent } from '@/lib/validations/security.validations';

// Configuración de Didit para producción
const DIDIT_CONFIG = {
  apiKey: process.env.DIDIT_API_KEY,
  baseUrl: 'https://verification.didit.me/v2',
  workflowId: '3176221b-c77c-4fea-b2b3-da185ef18122', // Workflow real
  timeout: 30000, // 30 segundos
};

// Tipos para la integración de producción
interface DoctorVerificationRequest {
  doctor_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  document_number: string;
  email?: string;
  phone?: string;
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

interface VerificationStatus {
  session_id: string;
  status: 'Not Started' | 'In Progress' | 'In Review' | 'Approved' | 'Declined' | 'Abandoned';
  features: string[];
  id_verification?: {
    status: string;
    document_type?: string;
    document_number?: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    nationality?: string;
  };
  face_match?: {
    status: string;
    match_score?: number;
    confidence_level?: string;
  };
  liveness?: {
    status: string;
    liveness_score?: number;
    is_live?: boolean;
  };
  aml?: {
    status: string;
    overall_risk_score?: number;
    risk_level?: string;
  };
  reviews?: Array<{
    user: string;
    new_status: string;
    comment: string;
    created_at: string;
  }>;
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
      nationality,
      document_number,
      email,
      phone
    } = body as DoctorVerificationRequest;

    // Validar datos requeridos
    const requiredFields = ['doctor_id', 'first_name', 'last_name', 'date_of_birth', 'nationality', 'document_number'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Campos requeridos faltantes: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validar configuración obligatoria
    if (!DIDIT_CONFIG.apiKey) {
      return NextResponse.json(
        { error: 'Configuración de Didit incompleta: falta DIDIT_API_KEY' },
        { status: 500 }
      );
    }

    // Preparar callback URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/api/didit/webhook`;

    // Preparar payload para Didit
    const diditPayload = {
      workflow_id: DIDIT_CONFIG.workflowId,
      vendor_data: doctor_id,
      callback: callbackUrl,
      expected_details: {
        first_name,
        last_name,
        date_of_birth,
        document_number
      },
      ...(email && { contact_details: { email } }),
      ...(phone && { contact_details: { phone } })
    };

    // Llamar a Didit API
    const response = await fetch(`${DIDIT_CONFIG.baseUrl}/session/`, {
      method: 'POST',
      headers: {
        'x-api-key': DIDIT_CONFIG.apiKey as string,
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'User-Agent': 'Platform-Medicos-Production/2.0.0'
      },
      body: JSON.stringify(diditPayload),
      signal: AbortSignal.timeout(DIDIT_CONFIG.timeout)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error creando sesión en Didit:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        doctorId: doctor_id
      });

      return NextResponse.json(
        { 
          error: 'Error creando sesión de verificación',
          details: errorData.detail || response.statusText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const sessionData = await response.json() as DoctorVerificationResponse;

    // Log de auditoría
    logSecurityEvent('doctor_verification_session_created', {
      sessionId: sessionData.session_id,
      doctorId: doctor_id,
      workflowId: DIDIT_CONFIG.workflowId,
      features: sessionData.features,
      sessionUrl: sessionData.session_url,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      session_id: sessionData.session_id,
      session_url: sessionData.session_url,
      session_token: sessionData.session_token,
      status: sessionData.status,
      workflow_id: sessionData.workflow_id,
      features: sessionData.features,
      doctor_id: doctor_id,
      message: 'Sesión de verificación creada exitosamente',
      next_steps: {
        redirect_url: sessionData.session_url,
        status_check_url: `${baseUrl}/api/didit/verification-status?session_id=${sessionData.session_id}`,
        webhook_url: callbackUrl
      }
    });

  } catch (error) {
    console.error('Error en endpoint de verificación de doctor:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * Obtiene el estado completo de verificación de un doctor
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const doctorId = searchParams.get('doctor_id');

    if (!sessionId && !doctorId) {
      return NextResponse.json(
        { error: 'session_id o doctor_id es requerido' },
        { status: 400 }
      );
    }

    // Si solo tenemos doctor_id, necesitaríamos buscar en nuestra BD
    // Por ahora requerimos session_id
    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id es requerido para obtener estado' },
        { status: 400 }
      );
    }

    // Llamar a Didit API para obtener estado completo
    // Validar configuración obligatoria
    if (!DIDIT_CONFIG.apiKey) {
      return NextResponse.json(
        { error: 'Configuración de Didit incompleta: falta DIDIT_API_KEY' },
        { status: 500 }
      );
    }

    const response = await fetch(`${DIDIT_CONFIG.baseUrl}/session/${sessionId}/decision/`, {
      method: 'GET',
      headers: {
        'x-api-key': DIDIT_CONFIG.apiKey as string,
        'accept': 'application/json',
        'User-Agent': 'Platform-Medicos-Production/2.0.0'
      },
      signal: AbortSignal.timeout(DIDIT_CONFIG.timeout)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: 'Error obteniendo estado de verificación',
          details: errorData.detail || response.statusText
        },
        { status: response.status }
      );
    }

    const verificationStatus = await response.json() as VerificationStatus;

    // Calcular progreso general
    const features = verificationStatus.features || [];
    const completedFeatures = [];
    const failedFeatures = [];
    const pendingFeatures = [];

    // Analizar cada característica
    if (verificationStatus.id_verification) {
      if (verificationStatus.id_verification.status === 'Approved') {
        completedFeatures.push('ID_VERIFICATION');
      } else if (verificationStatus.id_verification.status === 'Declined') {
        failedFeatures.push('ID_VERIFICATION');
      } else {
        pendingFeatures.push('ID_VERIFICATION');
      }
    }

    if (verificationStatus.face_match) {
      if (verificationStatus.face_match.status === 'match') {
        completedFeatures.push('FACE_MATCH');
      } else if (verificationStatus.face_match.status === 'Declined' || verificationStatus.face_match.status === 'no_match') {
        failedFeatures.push('FACE_MATCH');
      } else {
        pendingFeatures.push('FACE_MATCH');
      }
    }

    if (verificationStatus.liveness) {
      if (verificationStatus.liveness.status === 'live' || verificationStatus.liveness.is_live === true) {
        completedFeatures.push('LIVENESS');
      } else if (verificationStatus.liveness.status === 'Declined' || verificationStatus.liveness.status === 'not_live' || verificationStatus.liveness.is_live === false) {
        failedFeatures.push('LIVENESS');
      } else {
        pendingFeatures.push('LIVENESS');
      }
    }

    if (verificationStatus.aml) {
      if (verificationStatus.aml.status === 'clear' || verificationStatus.aml.risk_level === 'low') {
        completedFeatures.push('AML');
      } else if (verificationStatus.aml.status === 'Declined' || verificationStatus.aml.risk_level === 'high') {
        failedFeatures.push('AML');
      } else {
        pendingFeatures.push('AML');
      }
    }

    const totalFeatures = features.length;
    const completedCount = completedFeatures.length;
    const progressPercentage = totalFeatures > 0 ? Math.round((completedCount / totalFeatures) * 100) : 0;

    // Determinar estado general
    let overallStatus = 'processing';
    if (verificationStatus.status === 'Approved') {
      overallStatus = 'approved';
    } else if (verificationStatus.status === 'Declined') {
      overallStatus = 'declined';
    } else if (verificationStatus.status === 'In Review') {
      overallStatus = 'review';
    } else if (verificationStatus.status === 'Not Started') {
      overallStatus = 'pending';
    }

    // Log de auditoría
    logSecurityEvent('doctor_verification_status_checked', {
      sessionId,
      status: verificationStatus.status,
      overallStatus,
      progressPercentage,
      completedFeatures,
      failedFeatures,
      pendingFeatures,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      session_id: verificationStatus.session_id,
      status: verificationStatus.status,
      overall_status: overallStatus,
      progress: {
        percentage: progressPercentage,
        completed: completedCount,
        total: totalFeatures,
        completed_features: completedFeatures,
        failed_features: failedFeatures,
        pending_features: pendingFeatures
      },
      verification_details: {
        id_verification: verificationStatus.id_verification,
        face_match: verificationStatus.face_match,
        liveness: verificationStatus.liveness,
        aml: verificationStatus.aml
      },
      reviews: verificationStatus.reviews,
      message: 'Estado de verificación obtenido exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo estado de verificación:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
