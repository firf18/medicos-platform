/**
 * 🛡️ DIDIT API V2 - AML (ANTI-MONEY LAUNDERING) ENDPOINT
 * 
 * Endpoint independiente para verificación contra listas de conformidad
 * Usa la API v2 de Didit para verificación AML/KYC
 * 
 * @version 2.0.0
 * @author Platform Médicos Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logSecurityEvent } from '@/lib/validations/security.validations';

// Configuración de Didit API v2
const DIDIT_V2_CONFIG = {
  apiKey: process.env.DIDIT_API_KEY || 'VWA7XzNqtd-MQf8ObvBqG8XFvQugCJ9iPbzx1CRW99o',
  baseUrl: 'https://api.didit.me/v2',
  timeout: 30000, // 30 segundos
};

// Tipos para AML API v2
interface AmlRequest {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality?: string;
  document_number?: string;
  vendor_data?: string;
  callback_url?: string;
  lists_to_check?: Array<'sanctions' | 'pep' | 'adverse_media' | 'watchlist'>;
}

interface AmlResponse {
  aml_check_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  expires_at?: string;
  created_at: string;
}

interface AmlResult {
  aml_check_id: string;
  status: 'approved' | 'declined' | 'needs_review';
  overall_risk_score: number; // 0-100
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  checks_performed: Array<{
    list_name: string;
    status: 'passed' | 'failed' | 'warning';
    risk_score: number;
    matches_found: number;
    details?: string;
  }>;
  sanctions_check?: {
    status: 'passed' | 'failed' | 'warning';
    matches: Array<{
      name: string;
      source: string;
      match_score: number;
      details: string;
    }>;
  };
  pep_check?: {
    status: 'passed' | 'failed' | 'warning';
    matches: Array<{
      name: string;
      position: string;
      country: string;
      match_score: number;
    }>;
  };
  adverse_media_check?: {
    status: 'passed' | 'failed' | 'warning';
    matches: Array<{
      title: string;
      source: string;
      date: string;
      match_score: number;
    }>;
  };
  warnings?: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

/**
 * Crea una nueva verificación AML usando Didit API v2
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      first_name,
      last_name,
      date_of_birth,
      nationality,
      document_number,
      vendor_data,
      callback_url,
      lists_to_check
    } = body as AmlRequest;

    // Validar datos requeridos
    if (!first_name || !last_name || !date_of_birth) {
      return NextResponse.json(
        { error: 'first_name, last_name y date_of_birth son requeridos' },
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

    // Preparar payload para Didit API v2
    const diditPayload = {
      first_name,
      last_name,
      date_of_birth,
      ...(nationality && { nationality }),
      ...(document_number && { document_number }),
      ...(vendor_data && { vendor_data }),
      ...(callback_url && { callback_url }),
      ...(lists_to_check && { lists_to_check })
    };

    // Llamar a Didit API v2
    const response = await fetch(`${DIDIT_V2_CONFIG.baseUrl}/aml/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIDIT_V2_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Platform-Medicos/2.0.0'
      },
      body: JSON.stringify(diditPayload),
      signal: AbortSignal.timeout(DIDIT_V2_CONFIG.timeout)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error en Didit AML API v2:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      return NextResponse.json(
        { 
          error: 'Error en verificación AML',
          details: errorData.detail || response.statusText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const amlData = await response.json() as AmlResponse;

    // Log de auditoría
    logSecurityEvent('aml_check_initiated', {
      amlCheckId: amlData.aml_check_id,
      firstName: first_name,
      lastName: last_name,
      dateOfBirth: date_of_birth,
      nationality,
      vendorData: vendor_data,
      listsToCheck: lists_to_check,
      timestamp: new Date().toISOString()
    });

    // Guardar en base de datos si hay vendor_data (ID de usuario)
    if (vendor_data) {
      const admin = createAdminClient();
      await admin
        .from('didit_verifications')
        .insert({
          verification_id: amlData.aml_check_id,
          user_id: vendor_data,
          verification_type: 'aml_check',
          status: amlData.status,
          callback_url,
          created_at: new Date().toISOString()
        })
        .catch(error => {
          console.warn('Error guardando AML check en BD:', error);
        });
    }

    return NextResponse.json({
      success: true,
      aml_check_id: amlData.aml_check_id,
      status: amlData.status,
      expires_at: amlData.expires_at,
      created_at: amlData.created_at,
      message: 'Verificación AML iniciada exitosamente'
    });

  } catch (error) {
    console.error('Error en endpoint de verificación AML:', error);
    
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
 * Obtiene el estado de una verificación AML
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const amlCheckId = searchParams.get('aml_check_id');

    if (!amlCheckId) {
      return NextResponse.json(
        { error: 'aml_check_id es requerido' },
        { status: 400 }
      );
    }

    // Llamar a Didit API v2 para obtener estado
    const response = await fetch(`${DIDIT_V2_CONFIG.baseUrl}/aml/${amlCheckId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DIDIT_V2_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Platform-Medicos/2.0.0'
      },
      signal: AbortSignal.timeout(DIDIT_V2_CONFIG.timeout)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: 'Error obteniendo estado de verificación AML',
          details: errorData.detail || response.statusText
        },
        { status: response.status }
      );
    }

    const amlResult = await response.json() as AmlResult;

    // Log de auditoría
    logSecurityEvent('aml_check_status_checked', {
      amlCheckId,
      status: amlResult.status,
      overallRiskScore: amlResult.overall_risk_score,
      riskLevel: amlResult.risk_level,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      aml_check_id: amlResult.aml_check_id,
      status: amlResult.status,
      overall_risk_score: amlResult.overall_risk_score,
      risk_level: amlResult.risk_level,
      checks_performed: amlResult.checks_performed,
      sanctions_check: amlResult.sanctions_check,
      pep_check: amlResult.pep_check,
      adverse_media_check: amlResult.adverse_media_check,
      warnings: amlResult.warnings
    });

  } catch (error) {
    console.error('Error obteniendo estado de verificación AML:', error);
    
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
 * Webhook handler para resultados de verificación AML
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      aml_check_id, 
      status, 
      overall_risk_score, 
      risk_level,
      checks_performed,
      sanctions_check,
      pep_check,
      adverse_media_check,
      warnings
    } = body;

    if (!aml_check_id || !status) {
      return NextResponse.json(
        { error: 'aml_check_id y status son requeridos' },
        { status: 400 }
      );
    }

    // Actualizar estado en base de datos
    const admin = createAdminClient();
    const { data: verification, error } = await admin
      .from('didit_verifications')
      .select('user_id, verification_type')
      .eq('verification_id', aml_check_id)
      .single();

    if (error || !verification) {
      console.warn('AML check no encontrado en BD:', aml_check_id);
      return NextResponse.json(
        { error: 'Verificación AML no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar estado
    await admin
      .from('didit_verifications')
      .update({
        status,
        overall_risk_score,
        risk_level,
        checks_performed,
        sanctions_check,
        pep_check,
        adverse_media_check,
        warnings,
        updated_at: new Date().toISOString()
      })
      .eq('verification_id', aml_check_id);

    // Log de auditoría
    logSecurityEvent('aml_check_completed', {
      amlCheckId: aml_check_id,
      userId: verification.user_id,
      status,
      overallRiskScore: overall_risk_score,
      riskLevel: risk_level,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      aml_check_id,
      status,
      overall_risk_score,
      risk_level,
      message: 'Estado de verificación AML actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando estado de verificación AML:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
