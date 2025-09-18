import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/auth/register/doctor/finalize
// Completa el registro de médico tras verificación aprobada
export async function POST(_request: NextRequest) {
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

    const admin = createAdminClient()

    // 1) Obtener registro del médico por user_id
    const { data: reg, error: regErr } = await (admin as any)
      .from('doctor_registrations')
      .select('id, user_id, email, first_name, last_name, phone, license_number, specialty_id, verification_status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (regErr) {
      return NextResponse.json({ error: `No se pudo obtener el registro: ${regErr.message}` }, { status: 400 })
    }
    if (!reg) {
      return NextResponse.json({ error: 'Registro de médico no encontrado' }, { status: 404 })
    }

    // 2) Validar verificación aprobada
    const approvedStatuses = ['approved', 'verified']
    if (!reg.verification_status || !approvedStatuses.includes(String(reg.verification_status))) {
      return NextResponse.json(
        { error: 'La verificación de identidad no está aprobada aún' },
        { status: 409 }
      )
    }

    // 3) Actualizar perfil: role = 'doctor' y datos básicos
    const profileUpdate = {
      first_name: reg.first_name ?? undefined,
      last_name: reg.last_name ?? undefined,
      email: reg.email ?? undefined,
      phone: reg.phone ?? undefined,
      role: 'doctor',
      updated_at: new Date().toISOString(),
    }

    const { error: profErr } = await admin.from('profiles').update(profileUpdate).eq('id', user.id)
    if (profErr) {
      return NextResponse.json({ error: `No se pudo actualizar perfil: ${profErr.message}` }, { status: 400 })
    }

    // 4) Crear/actualizar entrada en doctors
    const specialtyIdNumber = reg.specialty_id !== null && reg.specialty_id !== undefined
      ? Number(reg.specialty_id)
      : NaN

    if (Number.isNaN(specialtyIdNumber)) {
      return NextResponse.json(
        { error: 'El registro no tiene specialty_id válido para crear el perfil de doctor' },
        { status: 400 }
      )
    }

    const doctorUpsert = {
      id: user.id,
      license_number: reg.license_number,
      specialty_id: specialtyIdNumber,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_available: true,
    }

    const { error: docErr } = await admin.from('doctors').upsert(doctorUpsert)
    if (docErr) {
      return NextResponse.json({ error: `No se pudo crear perfil de doctor: ${docErr.message}` }, { status: 400 })
    }

    // 5) (Opcional) marcar el registro como completado/activo si existe tal columna
    try {
      await (admin as any)
        .from('doctor_registrations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', reg.id)
    } catch (_) {
      // Silencioso si el schema difiere
    }

    // 6) Notificación de éxito (vía función segura si existe)
    try {
      await (admin as any).rpc('create_doctor_notification', {
        p_user_id: user.id,
        p_title: 'Cuenta de médico activada',
        p_message: 'Tu perfil de médico ha sido activado correctamente. Ya puedes acceder al dashboard.',
        p_type: 'success',
        p_related_entity_type: 'doctor_registration',
        p_related_entity_id: reg.id,
      })
    } catch (_) {
      // Ignorar si la función no existe en este esquema
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
