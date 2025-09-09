import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function PatientPortalPage() {
  const supabase = await createServerSupabaseClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Verificar si el usuario es paciente
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('id, first_name, last_name')
    .eq('id', session.user.id)
    .single()

  if (patientError || !patient) {
    redirect('/auth/unauthorized')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Bienvenido, {(patient as any)?.first_name} {(patient as any)?.last_name}
              </h1>
              <p className="text-gray-600">
                Portal de Pacientes - En desarrollo
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Aquí podrás ver tus citas, historial médico y comunicarte con tus médicos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}