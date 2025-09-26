import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schemas
const DocumentUploadSchema = z.object({
  laboratory_id: z.string().uuid(),
  document_type: z.enum([
    'rif_document',
    'sanitary_license',
    'municipal_license',
    'insurance_certificate',
    'fire_safety',
    'environmental_license',
    'biohazard_permit',
    'equipment_certification',
    'personnel_certification',
    'other'
  ]),
  document_name: z.string().min(1, 'Nombre del documento requerido'),
  file_type: z.string().optional(),
  file_size: z.number().optional(),
  notes: z.string().optional(),
});

const DocumentVerificationSchema = z.object({
  verified: z.boolean(),
  verified_by: z.string().uuid().optional(),
  notes: z.string().optional(),
});

/**
 * POST /api/laboratories/{id}/documents
 * Sube un documento para un laboratorio
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('document_type') as string;
    const documentName = formData.get('document_name') as string;
    const notes = formData.get('notes') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Archivo requerido' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 10MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}/${documentType}_${Date.now()}.${fileExt}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('laboratory-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json(
        { error: 'Error al subir el archivo', details: uploadError.message },
        { status: 400 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('laboratory-documents')
      .getPublicUrl(fileName);

    // Save document record to database
    const { data, error } = await supabase
      .from('laboratory_documents')
      .insert({
        laboratory_id: id,
        document_type: documentType,
        document_name: documentName,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('laboratory-documents')
        .remove([fileName]);
      
      return NextResponse.json(
        { error: 'Error al guardar el documento', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      document: data,
      message: 'Documento subido exitosamente',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/laboratories/{id}/documents
 * Obtiene todos los documentos de un laboratorio
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('laboratory_documents')
      .select('*')
      .eq('laboratory_id', id)
      .order('uploaded_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Error al obtener documentos', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      documents: data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
