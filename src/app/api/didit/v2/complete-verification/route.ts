/**
 * 🏥 DIDIT API V2 - COMPLETE VERIFICATION ENDPOINT
 * 
 * Endpoint principal que combina todos los servicios de verificación de Didit v2
 * para la fase 4 del registro de doctores en Platform Médicos
 * 
 * @version 2.0.0
 * @author Platform Médicos Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logSecurityEvent } from '@/lib/validations/security.validations';

// Configuración de Didit API v2
const DIDIT_V2_CONFIG = {
  apiKey: process.env.DIDIT_API_KEY,
  baseUrl: 'https://verification.didit.me/v2',
  timeout: 30000, // 30 segundos
};

// Tipos para verificación completa
interface CompleteVerificationRequest {
  // Datos del médico
  doctor_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  document_number: string;
  document_type: 'passport' | 'drivers_license' | 'national_id';
  document_country: string;
  
  // Imágenes para verificación
  document_front_image?: string; // Base64
  document_back_image?: string; // Base64
  selfie_image?: string; // Base64
  
  // Configuración de verificación
  verification_level: 'standard' | 'enhanced' | 'maximum';
  callback_url?: string;
  
  // Listas AML a verificar
  aml_lists?: Array<'sanctions' | 'pep' | 'adverse_media' | 'watchlist'>;
}

interface CompleteVerificationResponse {
  verification_session_id: string;
  status: 'initiated' | 'processing' | 'completed' | 'failed';
  verification_steps: {
    id_verification?: {
      verification_id: string;
      status: string;
      upload_url?: string;
    };
    face_match?: {
      face_match_id: string;
      status: string;
      upload_url?: string;
    };
    aml_check?: {
      aml_check_id: string;
      status: string;
    };
    passive_liveness?: {
      liveness_check_id: string;
      status: string;
      upload_url?: string;
    };
  };
  overall_progress: number; // 0-100
  expires_at: string;
  created_at: string;
}

interface VerificationStepResult {
  step: string;
  verification_id: string;
  status: 'approved' | 'declined' | 'needs_review' | 'pending';
  score?: number;
  confidence_level?: 'low' | 'medium' | 'high';
  details?: any;
}

/**
 * Inicia una verificación completa usando todos los servicios de Didit v2
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
      document_type,
      document_country,
      document_front_image,
      document_back_image,
      selfie_image,
      verification_level,
      callback_url,
      aml_lists
    } = body as CompleteVerificationRequest;

    // Validar datos requeridos
    const requiredFields = [
      'doctor_id', 'first_name', 'last_name', 'date_of_birth',
      'nationality', 'document_number', 'document_type', 'document_country'
    ];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Campos requeridos faltantes: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Generar ID de sesión único
    const verificationSessionId = `vs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Inicializar respuesta
    const response: CompleteVerificationResponse = {
      verification_session_id: verificationSessionId,
      status: 'initiated',
      verification_steps: {},
      overall_progress: 0,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      created_at: new Date().toISOString()
    };

    // 1. Iniciar verificación de identidad
    if (document_front_image || document_back_image) {
      try {
        const idVerificationPayload = {
          document_type,
          document_country,
          document_number,
          vendor_data: doctor_id,
          callback_url: callback_url ? `${callback_url}?step=id_verification` : undefined,
          expected_details: {
            first_name,
            last_name,
            date_of_birth,
            document_number
          }
        };

        if (!DIDIT_V2_CONFIG.apiKey) {
          return NextResponse.json(
            { error: 'Configuración de Didit incompleta: falta DIDIT_API_KEY' },
            { status: 500 }
          );
        }

        const idResponse = await fetch(`${DIDIT_V2_CONFIG.baseUrl}/id-verification/`, {
          method: 'POST',
          headers: {
            'x-api-key': DIDIT_V2_CONFIG.apiKey as string,
            'Content-Type': 'application/json',
            'User-Agent': 'Platform-Medicos/2.0.0'
          },
          body: JSON.stringify(idVerificationPayload),
          signal: AbortSignal.timeout(DIDIT_V2_CONFIG.timeout)
        });

        if (idResponse.ok) {
          const idData = await idResponse.json();
          response.verification_steps.id_verification = {
            verification_id: idData.verification_id,
            status: idData.status,
            upload_url: idData.upload_url
          };
        }
      } catch (error) {
        console.warn('Error iniciando verificación de identidad:', error);
      }
    }

    // 2. Iniciar verificación facial
    if (selfie_image) {
      try {
        const faceMatchPayload = {
          selfie_image,
          vendor_data: doctor_id,
          callback_url: callback_url ? `${callback_url}?step=face_match` : undefined,
          expected_details: {
            first_name,
            last_name
          }
        };

        if (!DIDIT_V2_CONFIG.apiKey) {
          return NextResponse.json(
            { error: 'Configuración de Didit incompleta: falta DIDIT_API_KEY' },
            { status: 500 }
          );
        }

        const faceResponse = await fetch(`${DIDIT_V2_CONFIG.baseUrl}/face-match/`, {
          method: 'POST',
          headers: {
            'x-api-key': DIDIT_V2_CONFIG.apiKey as string,
            'Content-Type': 'application/json',
            'User-Agent': 'Platform-Medicos/2.0.0'
          },
          body: JSON.stringify(faceMatchPayload),
          signal: AbortSignal.timeout(DIDIT_V2_CONFIG.timeout)
        });

        if (faceResponse.ok) {
          const faceData = await faceResponse.json();
          response.verification_steps.face_match = {
            face_match_id: faceData.face_match_id,
            status: faceData.status,
            upload_url: faceData.upload_url
          };
        }
      } catch (error) {
        console.warn('Error iniciando verificación facial:', error);
      }
    }

    // 3. Iniciar verificación AML
    try {
      const amlPayload = {
        first_name,
        last_name,
        date_of_birth,
        nationality,
        document_number,
        vendor_data: doctor_id,
        callback_url: callback_url ? `${callback_url}?step=aml_check` : undefined,
        lists_to_check: aml_lists || ['sanctions', 'pep', 'adverse_media']
      };

      if (!DIDIT_V2_CONFIG.apiKey) {
        return NextResponse.json(
          { error: 'Configuración de Didit incompleta: falta DIDIT_API_KEY' },
          { status: 500 }
        );
      }

      const amlResponse = await fetch(`${DIDIT_V2_CONFIG.baseUrl}/aml/`, {
        method: 'POST',
        headers: {
          'x-api-key': DIDIT_V2_CONFIG.apiKey as string,
          'Content-Type': 'application/json',
          'User-Agent': 'Platform-Medicos/2.0.0'
        },
        body: JSON.stringify(amlPayload),
        signal: AbortSignal.timeout(DIDIT_V2_CONFIG.timeout)
      });

      if (amlResponse.ok) {
        const amlData = await amlResponse.json();
        response.verification_steps.aml_check = {
          aml_check_id: amlData.aml_check_id,
          status: amlData.status
        };
      }
    } catch (error) {
      console.warn('Error iniciando verificación AML:', error);
    }

    // 4. Iniciar verificación de liveness pasivo
    if (selfie_image && verification_level !== 'standard') {
      try {
        const livenessPayload = {
          selfie_image,
          vendor_data: doctor_id,
          callback_url: callback_url ? `${callback_url}?step=passive_liveness` : undefined,
          detection_mode: verification_level,
          expected_details: {
            first_name,
            last_name
          }
        };

        if (!DIDIT_V2_CONFIG.apiKey) {
          return NextResponse.json(
            { error: 'Configuración de Didit incompleta: falta DIDIT_API_KEY' },
            { status: 500 }
          );
        }

        const livenessResponse = await fetch(`${DIDIT_V2_CONFIG.baseUrl}/passive-liveness/`, {
          method: 'POST',
          headers: {
            'x-api-key': DIDIT_V2_CONFIG.apiKey as string,
            'Content-Type': 'application/json',
            'User-Agent': 'Platform-Medicos/2.0.0'
          },
          body: JSON.stringify(livenessPayload),
          signal: AbortSignal.timeout(DIDIT_V2_CONFIG.timeout)
        });

        if (livenessResponse.ok) {
          const livenessData = await livenessResponse.json();
          response.verification_steps.passive_liveness = {
            liveness_check_id: livenessData.liveness_check_id,
            status: livenessData.status,
            upload_url: livenessData.upload_url
          };
        }
      } catch (error) {
        console.warn('Error iniciando verificación de liveness:', error);
      }
    }

    // Calcular progreso inicial
    const totalSteps = Object.keys(response.verification_steps).length;
    response.overall_progress = totalSteps > 0 ? Math.round((1 / totalSteps) * 100) : 0;

    // Guardar sesión de verificación en base de datos
    const admin = createAdminClient();
    await admin
      .from('didit_verification_sessions')
      .insert({
        session_id: verificationSessionId,
        doctor_id,
        verification_level,
        status: response.status,
        verification_steps: response.verification_steps,
        overall_progress: response.overall_progress,
        expires_at: response.expires_at,
        created_at: response.created_at
      })
      .catch(error => {
        console.warn('Error guardando sesión de verificación:', error);
      });

    // Log de auditoría
    logSecurityEvent('complete_verification_initiated', {
      verificationSessionId,
      doctorId: doctor_id,
      verificationLevel: verification_level,
      stepsInitiated: Object.keys(response.verification_steps),
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      ...response,
      message: 'Verificación completa iniciada exitosamente'
    });

  } catch (error) {
    console.error('Error en endpoint de verificación completa:', error);
    
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
 * Obtiene el estado de una verificación completa
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

    // Obtener sesión de verificación de la base de datos
    const admin = createAdminClient();
    let query = admin.from('didit_verification_sessions').select('*');
    
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else if (doctorId) {
      query = query.eq('doctor_id', doctorId).order('created_at', { ascending: false }).limit(1);
    }

    const { data: session, error } = await query.single();

    if (error || !session) {
      return NextResponse.json(
        { error: 'Sesión de verificación no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si la sesión ha expirado
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Sesión de verificación expirada' },
        { status: 410 }
      );
    }

    // Obtener resultados actualizados de cada paso
    const verificationSteps = session.verification_steps || {};
    const updatedSteps: any = {};

    // Verificar estado de cada paso
    for (const [stepName, stepData] of Object.entries(verificationSteps)) {
      if (stepData && typeof stepData === 'object' && 'verification_id' in stepData) {
        try {
          const stepResponse = await fetch(`${DIDIT_V2_CONFIG.baseUrl}/${stepName.replace('_', '-')}/${(stepData as any).verification_id}`, {
            method: 'GET',
            headers: {
              'x-api-key': DIDIT_V2_CONFIG.apiKey as string,
              'accept': 'application/json',
              'User-Agent': 'Platform-Medicos/2.0.0'
            },
            signal: AbortSignal.timeout(DIDIT_V2_CONFIG.timeout)
          });

          if (stepResponse.ok) {
            const stepResult = await stepResponse.json();
            updatedSteps[stepName] = {
              ...stepData,
              status: stepResult.status,
              score: stepResult.score || stepResult.match_score || stepResult.liveness_score || stepResult.overall_risk_score,
              confidence_level: stepResult.confidence_level || stepResult.risk_level,
              details: stepResult
            };
          } else {
            updatedSteps[stepName] = stepData;
          }
        } catch (error) {
          console.warn(`Error obteniendo estado de ${stepName}:`, error);
          updatedSteps[stepName] = stepData;
        }
      }
    }

    // Calcular progreso actualizado
    const totalSteps = Object.keys(updatedSteps).length;
    const completedSteps = Object.values(updatedSteps).filter((step: any) => 
      step.status === 'approved' || step.status === 'declined'
    ).length;
    const overallProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    // Determinar estado general
    let overallStatus = 'processing';
    if (overallProgress === 100) {
      const allApproved = Object.values(updatedSteps).every((step: any) => step.status === 'approved');
      overallStatus = allApproved ? 'completed' : 'needs_review';
    } else if (overallProgress === 0) {
      overallStatus = 'initiated';
    }

    // Actualizar sesión en base de datos
    await admin
      .from('didit_verification_sessions')
      .update({
        verification_steps: updatedSteps,
        overall_progress: overallProgress,
        status: overallStatus,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', session.session_id);

    return NextResponse.json({
      success: true,
      verification_session_id: session.session_id,
      doctor_id: session.doctor_id,
      verification_level: session.verification_level,
      status: overallStatus,
      verification_steps: updatedSteps,
      overall_progress: overallProgress,
      expires_at: session.expires_at,
      created_at: session.created_at,
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error obteniendo estado de verificación completa:', error);
    
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
 * Webhook handler para actualizaciones de verificación completa
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, step, verification_id, status, details } = body;

    if (!session_id || !step || !verification_id || !status) {
      return NextResponse.json(
        { error: 'session_id, step, verification_id y status son requeridos' },
        { status: 400 }
      );
    }

    // Actualizar sesión en base de datos
    const admin = createAdminClient();
    const { data: session, error } = await admin
      .from('didit_verification_sessions')
      .select('*')
      .eq('session_id', session_id)
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: 'Sesión de verificación no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar el paso específico
    const verificationSteps = session.verification_steps || {};
    verificationSteps[step] = {
      ...verificationSteps[step],
      verification_id,
      status,
      details,
      updated_at: new Date().toISOString()
    };

    // Recalcular progreso
    const totalSteps = Object.keys(verificationSteps).length;
    const completedSteps = Object.values(verificationSteps).filter((step: any) => 
      step.status === 'approved' || step.status === 'declined'
    ).length;
    const overallProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    // Determinar estado general
    let overallStatus = 'processing';
    if (overallProgress === 100) {
      const allApproved = Object.values(verificationSteps).every((step: any) => step.status === 'approved');
      overallStatus = allApproved ? 'completed' : 'needs_review';
    }

    // Actualizar sesión
    await admin
      .from('didit_verification_sessions')
      .update({
        verification_steps: verificationSteps,
        overall_progress: overallProgress,
        status: overallStatus,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', session_id);

    // Log de auditoría
    logSecurityEvent('verification_step_updated', {
      sessionId: session_id,
      step,
      verificationId: verification_id,
      status,
      overallProgress,
      overallStatus,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      verification_session_id: session_id,
      step,
      status,
      overall_progress: overallProgress,
      overall_status: overallStatus,
      message: 'Paso de verificación actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando paso de verificación:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
