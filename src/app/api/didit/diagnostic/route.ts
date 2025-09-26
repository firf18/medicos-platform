/**
 * 🔍 DIDIT CONFIGURATION DIAGNOSTIC ENDPOINT
 * 
 * Endpoint para diagnosticar problemas de configuración de Didit
 * Útil para debugging y verificación de variables de entorno
 * 
 * @version 1.0.0
 * @author Platform Médicos Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateDiditConfig, DIDIT_DOCTOR_CONFIG } from '@/lib/didit/config';

/**
 * GET - Diagnostica la configuración de Didit
 */
export async function GET(request: NextRequest) {
  try {
    const configValidation = validateDiditConfig();
    
    // Información de configuración (sin exponer datos sensibles)
    const configInfo = {
      // Configuración básica
      baseUrl: DIDIT_DOCTOR_CONFIG.baseUrl,
      timeout: DIDIT_DOCTOR_CONFIG.timeout,
      language: DIDIT_DOCTOR_CONFIG.language,
      country: DIDIT_DOCTOR_CONFIG.country,
      nationality: DIDIT_DOCTOR_CONFIG.nationality,
      
      // Estado de variables de entorno
      hasApiKey: !!DIDIT_DOCTOR_CONFIG.apiKey,
      hasWebhookSecret: !!DIDIT_DOCTOR_CONFIG.webhookSecret,
      hasWorkflowId: !!DIDIT_DOCTOR_CONFIG.doctorWorkflowId,
      workflowIdValue: DIDIT_DOCTOR_CONFIG.doctorWorkflowId,
      isDefaultWorkflow: DIDIT_DOCTOR_CONFIG.doctorWorkflowId === 'default-doctor-workflow',
      
      // Callback URL
      callbackUrl: DIDIT_DOCTOR_CONFIG.callbackUrl,
      
      // Features
      features: DIDIT_DOCTOR_CONFIG.features,
      
      // Configuración de reintentos
      retryConfig: DIDIT_DOCTOR_CONFIG.retryConfig,
      
      // Validación
      isValid: configValidation.isValid,
      errors: configValidation.errors,
      
      // Información adicional para debugging
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    // Determinar el estado general
    let status = 'ok';
    let message = 'Configuración de Didit válida';
    
    if (!configValidation.isValid) {
      status = 'error';
      message = 'Configuración de Didit inválida';
      
      if (DIDIT_DOCTOR_CONFIG.doctorWorkflowId === 'default-doctor-workflow') {
        message = '⚠️ CRÍTICO: Usando workflow_id por defecto que no existe en Didit.me';
      }
    }

    return NextResponse.json({
      status,
      message,
      config: configInfo,
      timestamp: new Date().toISOString(),
      recommendations: getRecommendations(configValidation)
    });

  } catch (error) {
    console.error('Error en diagnóstico de Didit:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Error interno en diagnóstico',
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Genera recomendaciones basadas en la validación
 */
function getRecommendations(validation: { isValid: boolean; errors: string[] }): string[] {
  const recommendations: string[] = [];
  
  if (!validation.isValid) {
    recommendations.push('🔧 Configurar variables de entorno requeridas');
    recommendations.push('📋 Obtener WORKFLOW_ID correcto desde dashboard de Didit.me');
    recommendations.push('🔑 Verificar que API_KEY sea válida y tenga permisos');
    recommendations.push('📄 Revisar archivo didit-env-example.txt para referencia');
    
    if (DIDIT_DOCTOR_CONFIG.doctorWorkflowId === 'default-doctor-workflow') {
      recommendations.push('⚠️ URGENTE: Reemplazar workflow_id por defecto con ID real de Didit.me');
    }
  } else {
    recommendations.push('✅ Configuración válida - Sistema listo para usar');
  }
  
  return recommendations;
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
