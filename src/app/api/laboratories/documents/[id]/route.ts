import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schemas
const DocumentVerificationSchema = z.object({
  verified: z.boolean(),
  verified_by: z.string().uuid().optional(),
  notes: z.string().optional(),
});

/**
 * PUT /api/laboratories/documents/{id}/verify
 * Verifica un documento
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = DocumentVerificationSchema.parse(body);

    const { data, error } = await supabase
      .from('laboratory_documents')
      .update({
        verified: validatedData.verified,
        verified_by: validatedData.verified_by || null,
        verified_at: validatedData.verified ? new Date().toISOString() : null,
        notes: validatedData.notes || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Error al verificar el documento', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      document: data,
      message: validatedData.verified ? 'Documento verificado' : 'Verificación rechazada',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/laboratories/documents/{id}
 * Elimina un documento
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Get document info first
    const { data: document, error: fetchError } = await supabase
      .from('laboratory_documents')
      .select('file_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    // Extract filename from URL
    const url = new URL(document.file_url);
    const fileName = url.pathname.split('/').pop();

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('laboratory-documents')
      .remove([fileName]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('laboratory_documents')
      .delete()
      .eq('id', id);

    if (dbError) {
      return NextResponse.json(
        { error: 'Error al eliminar el documento', details: dbError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Documento eliminado exitosamente',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
