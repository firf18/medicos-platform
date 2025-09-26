import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }
    
    // Get user's pharmacy
    const { data: pharmacy, error: pharmacyError } = await supabase
      .from('pharmacies')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (pharmacyError) {
      return NextResponse.json(
        { error: 'No se encontró farmacia' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: pharmacy
    })
    
  } catch (error) {
    console.error('Get pharmacy profile error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    
    // Update pharmacy
    const { data: pharmacy, error: pharmacyError } = await supabase
      .from('pharmacies')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (pharmacyError) {
      console.error('Error updating pharmacy:', pharmacyError)
      return NextResponse.json(
        { error: 'Error al actualizar la farmacia' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: pharmacy
    })
    
  } catch (error) {
    console.error('Update pharmacy profile error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
