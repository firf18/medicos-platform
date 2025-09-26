'use client'

import { useState } from 'react'
import { SpecialtySelector } from '@/components/specialty-dashboards/SpecialtyDashboardRouter'
import SpecialtyDashboardRouter from '@/components/specialty-dashboards/SpecialtyDashboardRouter'

export default function SpecialtyDashboardsPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)

  if (selectedSpecialty) {
    return <SpecialtyDashboardRouter specialtyId={selectedSpecialty} />
  }

  return <SpecialtySelector onSelect={setSelectedSpecialty} />
}
