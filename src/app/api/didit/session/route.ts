import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getDiditInstance, type VenezuelanDoctorData } from '@/lib/didit-integration'

// POST /api/didit/session
// Crea una sesión de verificación Didit en el servidor y persiste el session_id
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 })
    }
    if (!user) {
      return NextResponse.json({ error: 'No authenticated user' }, { status: 401 })
    }

    const body = (await request.json()) as Partial<VenezuelanDoctorData> & {
      callbackUrl?: string
    }

    // Validaciones mínimas
    const required: Array<keyof VenezuelanDoctorData> = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'licenseNumber',
      'specialty',
      'documentType',
      'documentNumber',
    ]
    const missing = required.filter((k) => !body[k])
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Faltan campos requeridos: ${missing.join(', ')}` },
        { status: 400 },
      )
    }

    const didit = getDiditInstance()
    const session = await didit.createVerificationSession(
      {
        firstName: body.firstName!,
        lastName: body.lastName!,
        email: body.email!,
        phone: body.phone!,
        licenseNumber: body.licenseNumber!,
        specialty: body.specialty!,
        documentType: body.documentType!,
        documentNumber: body.documentNumber!,
        medicalBoard: body.medicalBoard,
        university: body.university,
      },
      body.callbackUrl,
    )

    // Upsert en doctor_registrations para vincular la sesión
    // 1) intentar encontrar por user_id
    const { data: existingByUser } = await supabase
      .from('doctor_registrations')
      .select('id, user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const registrationPayload: Record<string, any> = {
      user_id: user.id,
      email: body.email,
      first_name: body.firstName,
      last_name: body.lastName,
      phone: body.phone,
      license_number: body.licenseNumber,
      specialty_id: body.specialty,
      verification_status: 'pending',
      verification_session_id: session.session_id,
      updated_at: new Date().toISOString(),
    }

    if (existingByUser?.id) {
      const { error: updateErr } = await supabase
        .from('doctor_registrations')
        .update(registrationPayload)
        .eq('id', existingByUser.id)
      if (updateErr) {
        // Si falla por conflicto (e.g. licencia ya usada por otro), devolver 409
        return NextResponse.json(
          { error: `No se pudo actualizar registro: ${updateErr.message}` },
          { status: updateErr.code === '23505' ? 409 : 400 },
        )
      }
    } else {
      const { error: insertErr } = await supabase
        .from('doctor_registrations')
        .insert({
          ...registrationPayload,
          created_at: new Date().toISOString(),
        })
      if (insertErr) {
        return NextResponse.json(
          { error: `No se pudo crear registro: ${insertErr.message}` },
          { status: insertErr.code === '23505' ? 409 : 400 },
        )
      }
    }

    return NextResponse.json(
      {
        success: true,
        session_id: session.session_id,
        session_number: session.session_number,
        verification_url: session.url,
        status: session.status,
      },
      { status: 201 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
