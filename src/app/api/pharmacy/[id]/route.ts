/**
 * Pharmacy Management API Endpoint
 * 
 * Handles CRUD operations for individual pharmacies
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { pharmacyUpdateSchema } from '@/lib/validations/pharmacy';
import { logActivity } from '@/lib/monitoring/activity-logger';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET - Obtener información de farmacia
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const pharmacyId = id;

    // Obtener información de la farmacia con relaciones
    const { data: pharmacy, error: pharmacyError } = await supabase
      .from('pharmacies')
      .select(`
        *,
        pharmacy_staff!inner (
          id,
          first_name,
          last_name,
          email,
          role,
          employment_status,
          created_at
        ),
        pharmacy_services!inner (
          id,
          service_name,
          service_type,
          price,
          is_available
        ),
        pharmacy_documents!inner (
          id,
          document_name,
          document_type,
          is_verified,
          created_at
        ),
        pharmacy_reviews!inner (
          id,
          rating,
          review_text,
          is_public,
          created_at
        )
      `)
      .eq('id', pharmacyId)
      .single();

    if (pharmacyError) {
      return NextResponse.json(
        { error: 'Farmacia no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos: solo el propietario puede ver información completa
    const isOwner = pharmacy.user_id === user.id;
    
    if (!isOwner && !pharmacy.is_verified) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Si no es el propietario, devolver solo información pública
    if (!isOwner) {
      const publicData = {
        id: pharmacy.id,
        pharmacy_name: pharmacy.pharmacy_name,
        commercial_name: pharmacy.commercial_name,
        email: pharmacy.email,
        phone: pharmacy.phone,
        address: pharmacy.address,
        city: pharmacy.city,
        state: pharmacy.state,
        business_hours: pharmacy.business_hours,
        services: pharmacy.services,
        specialties: pharmacy.specialties,
        is_verified: pharmacy.is_verified,
        pharmacy_services: pharmacy.pharmacy_services?.filter((service: any) => service.is_available),
        pharmacy_reviews: pharmacy.pharmacy_reviews?.filter((review: any) => review.is_public)
      };

      return NextResponse.json(publicData);
    }

    // Calcular estadísticas
    const stats = {
      totalStaff: pharmacy.pharmacy_staff?.length || 0,
      activeStaff: pharmacy.pharmacy_staff?.filter((staff: any) => staff.employment_status === 'active').length || 0,
      totalServices: pharmacy.pharmacy_services?.length || 0,
      activeServices: pharmacy.pharmacy_services?.filter((service: any) => service.is_available).length || 0,
      totalDocuments: pharmacy.pharmacy_documents?.length || 0,
      verifiedDocuments: pharmacy.pharmacy_documents?.filter((doc: any) => doc.is_verified).length || 0,
      totalReviews: pharmacy.pharmacy_reviews?.length || 0,
      averageRating: pharmacy.pharmacy_reviews?.length > 0
        ? pharmacy.pharmacy_reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / pharmacy.pharmacy_reviews.length
        : 0
    };

    return NextResponse.json({
      ...pharmacy,
      stats
    });

  } catch (error) {
    console.error('Get pharmacy error:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar información de farmacia
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const pharmacyId = id;
    const updateData = await request.json();

    // Validar datos de actualización
    const validationResult = pharmacyUpdateSchema.safeParse(updateData);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      return NextResponse.json(
        { error: 'Datos de validación inválidos', details: errors },
        { status: 400 }
      );
    }

    const validData = validationResult.data;

    // Verificar que el usuario es propietario de la farmacia
    const { data: pharmacy, error: pharmacyError } = await supabase
      .from('pharmacies')
      .select('user_id, pharmacy_name, verification_status')
      .eq('id', pharmacyId)
      .single();

    if (pharmacyError || !pharmacy) {
      return NextResponse.json(
        { error: 'Farmacia no encontrada' },
        { status: 404 }
      );
    }

    if (pharmacy.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Verificar si hay cambios que requieren re-verificación
    const requiresReVerification = [
      'licenseNumber',
      'licenseType',
      'licenseIssuer',
      'licenseExpiryDate',
      'pharmacyName',
      'businessType'
    ].some(field => field in validData);

    const updatePayload: any = {
      ...validData,
      updated_at: new Date().toISOString()
    };

    // Si requiere re-verificación, cambiar el status
    if (requiresReVerification && pharmacy.verification_status === 'verified') {
      updatePayload.verification_status = 'under_review';
      updatePayload.verified_at = null;
      updatePayload.verified_by = null;
    }

    // Actualizar farmacia
    const { data: updatedPharmacy, error: updateError } = await supabase
      .from('pharmacies')
      .update(updatePayload)
      .eq('id', pharmacyId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating pharmacy:', updateError);
      return NextResponse.json(
        { error: 'Error actualizando la farmacia' },
        { status: 500 }
      );
    }

    // Registrar actividad
    try {
      await logActivity({
        user_id: user.id,
        action: 'pharmacy_update',
        resource_type: 'pharmacy',
        resource_id: pharmacyId,
        details: {
          updated_fields: Object.keys(validData),
          requires_reverification: requiresReVerification,
          previous_name: pharmacy.pharmacy_name
        }
      });
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }

    return NextResponse.json({
      success: true,
      message: requiresReVerification 
        ? 'Farmacia actualizada. Los cambios requieren re-verificación.'
        : 'Farmacia actualizada exitosamente',
      data: updatedPharmacy,
      requires_reverification: requiresReVerification
    });

  } catch (error) {
    console.error('Update pharmacy error:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Desactivar farmacia (soft delete)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const pharmacyId = id;

    // Verificar que el usuario es propietario de la farmacia
    const { data: pharmacy, error: pharmacyError } = await supabase
      .from('pharmacies')
      .select('user_id, pharmacy_name, is_active')
      .eq('id', pharmacyId)
      .single();

    if (pharmacyError || !pharmacy) {
      return NextResponse.json(
        { error: 'Farmacia no encontrada' },
        { status: 404 }
      );
    }

    if (pharmacy.user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    if (!pharmacy.is_active) {
      return NextResponse.json(
        { error: 'La farmacia ya está desactivada' },
        { status: 400 }
      );
    }

    // Desactivar farmacia (soft delete)
    const { error: deactivateError } = await supabase
      .from('pharmacies')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', pharmacyId);

    if (deactivateError) {
      console.error('Error deactivating pharmacy:', deactivateError);
      return NextResponse.json(
        { error: 'Error desactivando la farmacia' },
        { status: 500 }
      );
    }

    // Desactivar personal asociado
    const { error: staffError } = await supabase
      .from('pharmacy_staff')
      .update({
        employment_status: 'terminated',
        updated_at: new Date().toISOString()
      })
      .eq('pharmacy_id', pharmacyId)
      .eq('employment_status', 'active');

    if (staffError) {
      console.error('Error deactivating staff:', staffError);
      // No fallar la operación por errores del personal
    }

    // Registrar actividad
    try {
      await logActivity({
        user_id: user.id,
        action: 'pharmacy_deactivation',
        resource_type: 'pharmacy',
        resource_id: pharmacyId,
        details: {
          pharmacy_name: pharmacy.pharmacy_name,
          reason: 'User requested deactivation'
        }
      });
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Farmacia desactivada exitosamente',
      data: {
        pharmacy_id: pharmacyId,
        status: 'deactivated',
        deactivated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Delete pharmacy error:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
