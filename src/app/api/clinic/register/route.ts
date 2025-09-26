import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema de validación
const clinicRegistrationSchema = z.object({
  clinic_name: z.string().min(2, 'El nombre de la clínica debe tener al menos 2 caracteres'),
  legal_name: z.string().min(2, 'La razón social debe tener al menos 2 caracteres'),
  rif: z.string().regex(/^[JGVEP]-[0-9]{8}-[0-9]$/, 'Formato de RIF inválido'),
  email: z.string().email('Formato de email inválido'),
  phone: z.string().regex(/^(\+58|0)?[2-9][0-9]{9}$/, 'Formato de teléfono inválido'),
  address: z.string().min(10, 'La dirección debe ser más específica'),
  city: z.string().min(2, 'La ciudad es requerida'),
  state: z.string().min(2, 'El estado es requerido'),
  clinic_type: z.enum(['general', 'specialty', 'diagnostic', 'ambulatory', 'emergency', 'rehabilitation']),
  description: z.string().optional(),
  emergency_contact_name: z.string().min(2, 'El nombre del contacto de emergencia es requerido'),
  emergency_contact_phone: z.string().regex(/^(\+58|0)?[2-9][0-9]{9}$/, 'Formato de teléfono de emergencia inválido')
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const body = await request.json()

    // Validar datos de entrada
    const validationResult = clinicRegistrationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // Verificar si ya existe una clínica con el mismo email o RIF
    const { data: existingClinic, error: checkError } = await supabase
      .from('clinic_registrations')
      .select('email, rif')
      .or(`email.eq.${validatedData.email},rif.eq.${validatedData.rif}`)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing clinic:', checkError)
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      )
    }

    if (existingClinic) {
      if ((existingClinic as any).email === validatedData.email) {
        return NextResponse.json(
          { error: 'Ya existe una clínica registrada con este email' },
          { status: 409 }
        )
      }
      if ((existingClinic as any).rif === validatedData.rif) {
        return NextResponse.json(
          { error: 'Ya existe una clínica registrada con este RIF' },
          { status: 409 }
        )
      }
    }

    // Crear el registro de la clínica
    const { data: registration, error: insertError } = await (supabase as any)
      .from('clinic_registrations')
      .insert([{
        ...validatedData,
        registration_step: 'completed',
        status: 'pending',
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting clinic registration:', insertError)
      return NextResponse.json(
        { error: 'Error al registrar la clínica' },
        { status: 500 }
      )
    }

    // TODO: Enviar email de confirmación aquí
    // await sendConfirmationEmail(validatedData.email, registration.id)

    return NextResponse.json({
      success: true,
      message: 'Clínica registrada exitosamente',
      registration_id: registration.id
    })

  } catch (error) {
    console.error('Unexpected error in clinic registration:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de registro requerido' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data: registration, error } = await supabase
      .from('clinic_registrations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching clinic registration:', error)
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      registration
    })

  } catch (error) {
    console.error('Unexpected error fetching clinic registration:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
