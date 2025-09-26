/**
 * Pharmacy Registration API Endpoint
 * 
 * Handles pharmacy registration with comprehensive validation
 * and compliance with Mexican regulations (COFEPRIS)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { pharmacyRegistrationSchema } from '@/lib/validations/pharmacy';
import { PharmacyRegistrationData } from '@/types/database/pharmacies.types';
import { uploadDocument } from '@/lib/storage/documents';
import { sendVerificationEmail } from '@/lib/services/email';
import { logActivity } from '@/lib/monitoring/activity-logger';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener los datos del request
    const formData = await request.formData();
    const registrationData: Partial<PharmacyRegistrationData> = {};
    const documents: File[] = [];

    // Procesar campos del formulario
    formData.forEach((value, key) => {
      if (key === 'documents') {
        if (value instanceof File) {
          documents.push(value);
        }
      } else if (key === 'services' || key === 'specialties') {
        const existingArray = registrationData[key as keyof PharmacyRegistrationData] as string[] || [];
        existingArray.push(value as string);
        (registrationData as any)[key] = existingArray;
      } else if (key === 'businessHours') {
        try {
          (registrationData as any)[key] = JSON.parse(value as string);
        } catch (error) {
          console.error('Error parsing business hours:', error);
        }
      } else {
        (registrationData as any)[key] = value;
      }
    });

    // Validar datos de registro
    const validationResult = pharmacyRegistrationSchema.safeParse({
      ...registrationData,
      documents: documents.map(file => ({
        name: file.name,
        type: 'license' as const, // Default type, should be specified in form
        file
      }))
    });

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

    // Verificar si el usuario ya tiene una farmacia registrada
    const { data: existingPharmacy } = await supabase
      .from('pharmacies')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingPharmacy) {
      return NextResponse.json(
        { error: 'Este usuario ya tiene una farmacia registrada' },
        { status: 409 }
      );
    }

    // Verificar unicidad del número de licencia
    const { data: licenseCheck } = await supabase
      .from('pharmacies')
      .select('id')
      .eq('license_number', validData.licenseNumber)
      .single();

    if (licenseCheck) {
      return NextResponse.json(
        { error: 'El número de licencia ya está registrado' },
        { status: 409 }
      );
    }

    // Subir documentos
    const uploadedDocuments: Array<{
      name: string;
      type: string;
      url: string;
      file_size: number;
      mime_type: string;
    }> = [];

    for (const doc of documents) {
      try {
        const uploadResult = await uploadDocument(doc, user.id, 'pharmacy');
        uploadedDocuments.push({
          name: doc.name,
          type: 'license', // Should be determined from form
          url: uploadResult.url,
          file_size: doc.size,
          mime_type: doc.type
        });
      } catch (uploadError) {
        console.error('Error uploading document:', uploadError);
        return NextResponse.json(
          { error: 'Error subiendo documentos' },
          { status: 500 }
        );
      }
    }

    // Preparar datos para inserción
    const pharmacyData = {
      user_id: user.id,
      pharmacy_name: validData.pharmacyName,
      commercial_name: validData.commercialName || null,
      email: validData.email,
      phone: validData.phone,
      secondary_phone: validData.secondaryPhone || null,
      website: validData.website || null,
      address: validData.address,
      city: validData.city,
      state: validData.state,
      postal_code: validData.postalCode,
      country: 'México',
      rfc: validData.rfc || null,
      curp: validData.curp || null,
      license_number: validData.licenseNumber,
      license_type: validData.licenseType,
      license_issuer: validData.licenseIssuer,
      license_expiry_date: validData.licenseExpiryDate,
      business_type: validData.businessType,
      tax_regime: validData.taxRegime,
      business_hours: validData.businessHours,
      services: validData.services,
      specialties: validData.specialties || [],
      cofepris_registration: validData.cofeprisRegistration || null,
      sanitary_permit: validData.sanitaryPermit || null,
      verification_status: 'pending' as const,
      is_active: true,
      is_verified: false,
      subscription_plan: 'basic' as const
    };

    // Insertar farmacia en la base de datos
    const { data: pharmacy, error: pharmacyError } = await supabase
      .from('pharmacies')
      .insert([pharmacyData])
      .select()
      .single();

    if (pharmacyError) {
      console.error('Error creating pharmacy:', pharmacyError);
      return NextResponse.json(
        { error: 'Error creando la farmacia' },
        { status: 500 }
      );
    }

    // Insertar documentos
    if (uploadedDocuments.length > 0) {
      const documentData = uploadedDocuments.map(doc => ({
        pharmacy_id: pharmacy.id,
        document_name: doc.name,
        document_type: doc.type,
        document_url: doc.url,
        file_size: doc.file_size,
        mime_type: doc.mime_type,
        is_verified: false
      }));

      const { error: documentsError } = await supabase
        .from('pharmacy_documents')
        .insert(documentData);

      if (documentsError) {
        console.error('Error saving documents:', documentsError);
        // No fallar la operación por errores de documentos
      }
    }

    // Actualizar perfil del usuario
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email || validData.email,
        first_name: validData.pharmacyName.split(' ')[0] || '',
        last_name: validData.pharmacyName.split(' ').slice(1).join(' ') || '',
        role: 'pharmacy',
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // No fallar la operación por errores de perfil
    }

    // Enviar email de verificación
    try {
      await sendVerificationEmail(user.email!, 'pharmacy', pharmacy.id);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // No fallar la operación por errores de email
    }

    // Registrar actividad
    try {
      await logActivity({
        user_id: user.id,
        action: 'pharmacy_registration',
        resource_type: 'pharmacy',
        resource_id: pharmacy.id,
        details: {
          pharmacy_name: validData.pharmacyName,
          license_number: validData.licenseNumber,
          city: validData.city,
          state: validData.state
        }
      });
    } catch (logError) {
      console.error('Error logging activity:', logError);
      // No fallar la operación por errores de logging
    }

    return NextResponse.json({
      success: true,
      message: 'Farmacia registrada exitosamente',
      data: {
        pharmacy_id: pharmacy.id,
        verification_status: 'pending',
        next_steps: [
          'Verificación de documentos por parte del equipo de Red-Salud',
          'Revisión de licencias y permisos',
          'Activación de la cuenta una vez verificada'
        ]
      }
    });

  } catch (error) {
    console.error('Pharmacy registration error:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para verificar disponibilidad de licencia
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const licenseNumber = searchParams.get('license_number');
    const email = searchParams.get('email');

    if (!licenseNumber && !email) {
      return NextResponse.json(
        { error: 'Se requiere número de licencia o email' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    const checks: { available: boolean; field: string; message: string }[] = [];

    // Verificar licencia
    if (licenseNumber) {
      const { data: licenseExists } = await supabase
        .from('pharmacies')
        .select('id')
        .eq('license_number', licenseNumber)
        .single();

      checks.push({
        available: !licenseExists,
        field: 'license_number',
        message: licenseExists 
          ? 'El número de licencia ya está registrado' 
          : 'Número de licencia disponible'
      });
    }

    // Verificar email
    if (email) {
      const { data: emailExists } = await supabase
        .from('pharmacies')
        .select('id')
        .eq('email', email)
        .single();

      checks.push({
        available: !emailExists,
        field: 'email',
        message: emailExists 
          ? 'El email ya está registrado' 
          : 'Email disponible'
      });
    }

    return NextResponse.json({
      checks,
      all_available: checks.every(check => check.available)
    });

  } catch (error) {
    console.error('License check error:', error);
    
    return NextResponse.json(
      { error: 'Error verificando disponibilidad' },
      { status: 500 }
    );
  }
}
