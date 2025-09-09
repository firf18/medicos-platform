import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Verificar si el usuario es médico
  const { data: doctor, error: doctorError } = await supabase
    .from('doctors')
    .select('id')
    .eq('id', session.user.id)
    .single()

  if (doctorError || !doctor) {
    redirect('/auth/unauthorized')
  }

  return <DashboardLayout />
}