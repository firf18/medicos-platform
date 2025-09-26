'use client'

import { use } from 'react'
import SpecialtyDashboardRouter from '@/components/specialty-dashboards/SpecialtyDashboardRouter'

interface PageProps {
  params: Promise<{ specialtyId: string }>
}

export default function SpecialtyDashboardPage({ params }: PageProps) {
  const { specialtyId } = use(params)
  
  return <SpecialtyDashboardRouter specialtyId={specialtyId} />
}
