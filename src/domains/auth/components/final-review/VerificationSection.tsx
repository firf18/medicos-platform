/**
 * Verification Section Component
 * @fileoverview Section for reviewing verification status in final review
 * @compliance HIPAA-compliant verification status display
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { DoctorRegistrationData } from '@/types/medical/specialties';

interface VerificationSectionProps {
  data: DoctorRegistrationData;
  hasIdentityVerification?: boolean;
  hasLicenseVerification?: boolean;
}

export const VerificationSection: React.FC<VerificationSectionProps> = ({
  data,
  hasIdentityVerification = false,
  hasLicenseVerification = false
}) => {
  const getVerificationStatus = (isVerified: boolean) => {
    if (isVerified) {
      return {
        label: 'Verificado',
        variant: 'success' as const,
        icon: CheckCircle,
        className: 'text-green-600'
      };
    }
    return {
      label: 'Pendiente',
      variant: 'warning' as const,
      icon: Clock,
      className: 'text-yellow-600'
    };
  };

  const identityStatus = getVerificationStatus(hasIdentityVerification);
  const licenseStatus = getVerificationStatus(hasLicenseVerification);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <CardTitle>Estado de Verificación</CardTitle>
        </div>
        <CardDescription>
          Verificación de identidad y credenciales profesionales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Identity Verification */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <identityStatus.icon className={`h-5 w-5 ${identityStatus.className}`} />
              <h4 className="font-medium">Verificación de Identidad</h4>
            </div>
            <Badge variant={identityStatus.variant}>
              {identityStatus.label}
            </Badge>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Documento: {data.documentType || 'Cédula de Identidad'}</p>
            <p>Número: {data.documentNumber ? `${data.documentNumber.slice(0, 3)}****${data.documentNumber.slice(-2)}` : 'No especificado'}</p>
          </div>
        </div>

        {/* License Verification */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <licenseStatus.icon className={`h-5 w-5 ${licenseStatus.className}`} />
              <h4 className="font-medium">Verificación de Licencia Médica</h4>
            </div>
            <Badge variant={licenseStatus.variant}>
              {licenseStatus.label}
            </Badge>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Matrícula: {data.licenseNumber}</p>
            <p>Estado: {data.licenseState || 'Nacional'}</p>
            <p>Colegio Médico: {data.medicalBoard || 'No especificado'}</p>
          </div>
        </div>

        {/* Warning if not all verifications are complete */}
        {(!hasIdentityVerification || !hasLicenseVerification) && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Verificación Pendiente:</strong> Algunas verificaciones están pendientes. 
              Podrás completar tu registro, pero algunas funciones estarán limitadas hasta 
              completar todas las verificaciones.
            </AlertDescription>
          </Alert>
        )}

        {/* Success message if all verifications are complete */}
        {hasIdentityVerification && hasLicenseVerification && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Verificación Completa:</strong> Tu identidad y credenciales médicas 
              han sido verificadas exitosamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Additional Information */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Información Adicional de Verificación
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Las verificaciones pueden tomar hasta 48 horas hábiles</p>
            <p>• Recibirás notificaciones sobre el estado de tu verificación</p>
            <p>• Podrás acceder a tu dashboard con funciones limitadas mientras se procesan</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
