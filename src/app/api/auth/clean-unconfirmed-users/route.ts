/**
 * Clean Unconfirmed Users API
 * @fileoverview API para limpiar usuarios no confirmados que puedan estar causando rate limits
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Buscar usuarios no confirmados con este email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });

    if (listError) {
      console.error('Error listando usuarios:', listError);
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }

    // Filtrar usuarios no confirmados con el email específico
    const unconfirmedUsers = users.users.filter((user: any) => 
      user.email === email && !user.email_confirmed_at
    );

    console.log(`🔍 Encontrados ${unconfirmedUsers.length} usuarios no confirmados para ${email}`);

    // Eliminar usuarios no confirmados
    let deletedCount = 0;
    for (const user of unconfirmedUsers) {
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (!deleteError) {
          deletedCount++;
          console.log(`🗑️ Usuario eliminado: ${user.id}`);
        } else {
          console.error('Error eliminando usuario:', deleteError);
        }
      } catch (deleteErr) {
        console.error('Error en eliminación:', deleteErr);
      }
    }

    console.log(`✅ ${deletedCount} usuarios no confirmados eliminados`);

    return NextResponse.json({
      success: true,
      message: `${deletedCount} usuarios no confirmados eliminados`,
      deletedCount
    });

  } catch (error) {
    console.error('Error en clean-unconfirmed-users:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
