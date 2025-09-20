/**
 * Agreement Section Component
 * @fileoverview Section for handling terms and agreements in final review
 * @compliance HIPAA-compliant legal agreements management
 */

'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Shield, Lock, ExternalLink } from 'lucide-react';
import { AgreementSectionProps, AgreementState, ModalState } from '../../types/final-review.types';

export const AgreementSection: React.FC<AgreementSectionProps> = ({
  agreements,
  onAgreementChange,
  onShowModal
}) => {
  const agreementItems = [
    {
      id: 'termsAccepted' as keyof AgreementState,
      modalKey: 'showTerms' as keyof ModalState,
      label: 'Acepto los Términos y Condiciones',
      description: 'Términos generales de uso de la plataforma médica',
      icon: FileText,
      iconColor: 'text-blue-600'
    },
    {
      id: 'privacyAccepted' as keyof AgreementState,
      modalKey: 'showPrivacy' as keyof ModalState,
      label: 'Acepto la Política de Privacidad',
      description: 'Manejo y protección de datos personales y médicos',
      icon: Lock,
      iconColor: 'text-green-600'
    },
    {
      id: 'complianceAccepted' as keyof AgreementState,
      modalKey: 'showCompliance' as keyof ModalState,
      label: 'Acepto el Cumplimiento Médico y Legal',
      description: 'Normativas médicas y responsabilidades profesionales',
      icon: Shield,
      iconColor: 'text-purple-600'
    }
  ];

  const allAgreed = Object.values(agreements).every(value => value === true);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Términos y Condiciones
      </h3>

      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Importante:</strong> Debes aceptar todos los términos y condiciones 
          para completar tu registro como profesional médico.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        {agreementItems.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id={item.id}
                checked={agreements[item.id]}
                onCheckedChange={(checked) => 
                  onAgreementChange(item.id, checked as boolean)
                }
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <label
                  htmlFor={item.id}
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                  {item.label}
                </label>
                <p className="text-xs text-gray-600">
                  {item.description}
                </p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => onShowModal(item.modalKey)}
                >
                  Leer documento completo
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!allAgreed && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertDescription className="text-yellow-800 text-sm">
            Debes aceptar todos los términos para continuar con el registro.
          </AlertDescription>
        </Alert>
      )}

      {allAgreed && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800 text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Todos los términos han sido aceptados
          </AlertDescription>
        </Alert>
      )}

      <div className="pt-4 border-t">
        <p className="text-xs text-gray-500">
          Al aceptar estos términos, confirmas que has leído y comprendido todas las 
          condiciones, y que cumplirás con las normativas médicas y legales aplicables 
          en tu práctica profesional.
        </p>
      </div>
    </div>
  );
};
