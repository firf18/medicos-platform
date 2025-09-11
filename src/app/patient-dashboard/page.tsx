import { redirect } from 'next/navigation'

export default function PatientDashboardPage() {
  // Redirect to main patient dashboard
  redirect('/patient/dashboard')
}