/**
 * Router mejorado para dashboards de especialidades médicas
 * Maneja el enrutamiento basado en la especialidad del médico
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDoctorAuth, useSpecialtyAccess } from '@/hooks/useDoctorAuth';
import { createClient } from '@/lib/supabase/client';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Importar todos los dashboards de especialidades
import CardiologyDashboard from '@/components/specialty-dashboards/CardiologyDashboard';
import NeurologyDashboard from '@/components/specialty-dashboards/NeurologyDashboard';
import PediatricsDashboard from '@/components/specialty-dashboards/PediatricsDashboard';
import GeneralSurgeryDashboard from '@/components/specialty-dashboards/GeneralSurgeryDashboard';
import DermatologyDashboard from '@/components/specialty-dashboards/DermatologyDashboard';
import PsychiatryDashboard from '@/components/specialty-dashboards/PsychiatryDashboard';
import InternalMedicineDashboard from '@/components/specialty-dashboards/InternalMedicineDashboard';
import OrthopedicsDashboard from '@/components/specialty-dashboards/OrthopedicsDashboard';
import OphthalmologyDashboard from '@/components/specialty-dashboards/OphthalmologyDashboard';
import GynecologyDashboard from '@/components/specialty-dashboards/GynecologyDashboard';
import EndocrinologyDashboard from '@/components/specialty-dashboards/EndocrinologyDashboard';
import OncologyDashboard from '@/components/specialty-dashboards/OncologyDashboard';
import EmergencyMedicineDashboard from '@/components/specialty-dashboards/EmergencyMedicineDashboard';
import RadiologyDashboard from '@/components/specialty-dashboards/RadiologyDashboard';
import AnesthesiologyDashboard from '@/components/specialty-dashboards/AnesthesiologyDashboard';

// Importar el dashboard de medicina general
import GeneralMedicineDashboard from '@/app/dashboard/medicina-general/page';

interface SpecialtyDashboardRouterProps {
  specialtyId: string;
}

interface DashboardComponent {
  component: React.ComponentType<any>;
  name: string;
  description: string;
  isAvailable: boolean;
  comingSoon?: boolean;
}

const SPECIALTY_DASHBOARDS: Record<string, DashboardComponent> = {
  'medicina_general': {
    component: GeneralMedicineDashboard,
    name: 'Medicina General',
    description: 'Dashboard completo para atención médica integral',
    isAvailable: true,
  },
  'cardiologia': {
    component: CardiologyDashboard,
    name: 'Cardiología',
    description: 'Especialista en enfermedades del corazón',
    isAvailable: true,
  },
  'neurologia': {
    component: NeurologyDashboard,
    name: 'Neurología',
    description: 'Especialista en sistema nervioso',
    isAvailable: true,
  },
  'pediatria': {
    component: PediatricsDashboard,
    name: 'Pediatría',
    description: 'Especialista en medicina infantil',
    isAvailable: true,
  },
  'cirugia_general': {
    component: GeneralSurgeryDashboard,
    name: 'Cirugía General',
    description: 'Especialista en procedimientos quirúrgicos',
    isAvailable: true,
  },
  'dermatologia': {
    component: DermatologyDashboard,
    name: 'Dermatología',
    description: 'Especialista en enfermedades de la piel',
    isAvailable: true,
  },
  'psiquiatria': {
    component: PsychiatryDashboard,
    name: 'Psiquiatría',
    description: 'Especialista en salud mental',
    isAvailable: true,
  },
  'medicina_interna': {
    component: InternalMedicineDashboard,
    name: 'Medicina Interna',
    description: 'Especialista en medicina interna',
    isAvailable: true,
  },
  'ortopedia': {
    component: OrthopedicsDashboard,
    name: 'Ortopedia',
    description: 'Especialista en sistema musculoesquelético',
    isAvailable: true,
  },
  'oftalmologia': {
    component: OphthalmologyDashboard,
    name: 'Oftalmología',
    description: 'Especialista en salud ocular',
    isAvailable: true,
  },
  'ginecologia': {
    component: GynecologyDashboard,
    name: 'Ginecología',
    description: 'Especialista en salud femenina',
    isAvailable: true,
  },
  'endocrinologia': {
    component: EndocrinologyDashboard,
    name: 'Endocrinología',
    description: 'Especialista en sistema endocrino',
    isAvailable: true,
  },
  'oncologia': {
    component: OncologyDashboard,
    name: 'Oncología',
    description: 'Especialista en tratamiento del cáncer',
    isAvailable: true,
  },
  'medicina_emergencia': {
    component: EmergencyMedicineDashboard,
    name: 'Medicina de Emergencia',
    description: 'Especialista en atención de emergencias',
    isAvailable: true,
  },
  'radiologia': {
    component: RadiologyDashboard,
    name: 'Radiología',
    description: 'Especialista en diagnóstico por imágenes',
    isAvailable: true,
  },
  'anestesiologia': {
    component: AnesthesiologyDashboard,
    name: 'Anestesiología',
    description: 'Especialista en anestesia y cuidados críticos',
    isAvailable: true,
  },
};

export default function SpecialtyDashboardRouter({ specialtyId }: SpecialtyDashboardRouterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, doctorProfile, specialty, isLoading, isDoctor, error } = useDoctorAuth();
  const { hasAccess, isLoading: accessLoading } = useSpecialtyAccess(specialtyId);
  
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const supabase = createClient();

  // Verificar acceso y cargar dashboard
  useEffect(() => {
    if (!isLoading && !accessLoading) {
      if (!isDoctor) {
        router.push('/auth/login/medicos');
        return;
      }

      if (!hasAccess) {
        setDashboardError('No tienes acceso a este dashboard de especialidad');
        return;
      }

      // Verificar si el dashboard existe
      const dashboardConfig = SPECIALTY_DASHBOARDS[specialtyId];
      if (!dashboardConfig) {
        setDashboardError(`Dashboard para la especialidad "${specialtyId}" no encontrado`);
        return;
      }

      if (!dashboardConfig.isAvailable) {
        setDashboardError(`Dashboard para ${dashboardConfig.name} está en desarrollo`);
        return;
      }

      setDashboardError(null);
    }
  }, [isLoading, accessLoading, isDoctor, hasAccess, specialtyId, router]);

  // Mostrar loading
  if (isLoading || accessLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard especializado...</p>
        </div>
      </div>
    );
  }

  // Mostrar error de autenticación
  if (error || !isDoctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Error de Acceso
            </CardTitle>
            <CardDescription>
              {error || 'No tienes permisos para acceder a este dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/auth/login/medicos')}
              className="w-full"
            >
              Ir al Login de Médicos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar error de dashboard
  if (dashboardError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Dashboard No Disponible
            </CardTitle>
            <CardDescription>
              {dashboardError}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Mientras tanto, puedes usar el dashboard de medicina general
              </p>
              <Button 
                onClick={() => router.push('/dashboard/medicina-general')}
                className="w-full"
              >
                Ir a Medicina General
              </Button>
            </div>
            
            {/* Información del médico */}
            {doctorProfile && specialty && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Tu Perfil Médico</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Especialidad:</strong> {specialty.name}</p>
                  <p><strong>Cédula:</strong> {doctorProfile.license_number}</p>
                  {doctorProfile.experience_years && (
                    <p><strong>Experiencia:</strong> {doctorProfile.experience_years} años</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderizar dashboard específico
  const dashboardConfig = SPECIALTY_DASHBOARDS[specialtyId];
  if (!dashboardConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              Dashboard no encontrado para la especialidad: {specialtyId}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const DashboardComponent = dashboardConfig.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con información de especialidad */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard - {dashboardConfig.name}
              </h1>
              <p className="text-gray-600">
                {dashboardConfig.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Acceso Autorizado</span>
            </Badge>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                Dr. {user?.user_metadata?.first_name || 'Médico'}
              </p>
              <p className="text-xs text-gray-500">{dashboardConfig.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Renderizar el dashboard específico */}
      <DashboardComponent />
    </div>
  );
}
