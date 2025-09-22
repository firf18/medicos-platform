/**
 * Document Info Section Component
 * @fileoverview Document identification section for professional info form
 * @compliance HIPAA-compliant document input with validation
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { IdCard, AlertCircle, CheckCircle, Loader2, Shield } from 'lucide-react';
import {
  DocumentType,
  ProfessionalInfoFormData,
  ProfessionalInfoFormErrors,
  FieldValidationStatus
} from '../../types/professional-info.types';
import { getDocumentPlaceholder } from '../../utils/professional-info-validation';

interface DocumentInfoSectionProps {
  formData: Pick<ProfessionalInfoFormData, 'documentType' | 'documentNumber'>;
  errors: Pick<ProfessionalInfoFormErrors, 'documentType' | 'documentNumber'>;
  onFieldChange: (field: keyof ProfessionalInfoFormData, value: string | number) => void;
  isVerifying?: boolean;
  verificationStatus?: FieldValidationStatus;
  verificationResult?: {
    doctorName?: string;
    specialty?: string;
    licenseStatus?: string;
    profession?: string;
    isValid?: boolean;
    nameMatch?: {
      matches: boolean;
      confidence: number;
      message: string;
    };
    analysis?: {
      dashboardAccess?: {
        primaryDashboard: string;
        allowedDashboards: string[];
        reason: string;
        requiresApproval: boolean;
      };
    };
  } | null;
}

export const DocumentInfoSection: React.FC<DocumentInfoSectionProps> = ({
  formData,
  errors,
  onFieldChange,
  isVerifying = false,
  verificationStatus,
  verificationResult
}) => {
  const documentPlaceholder = getDocumentPlaceholder(formData.documentType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IdCard className="h-5 w-5" />
          Información de Identificación
        </CardTitle>
        <CardDescription>
          Proporcione su cédula para verificar automáticamente su licencia médica
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compact Document Input Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Document Type - More compact */}
          <div className="space-y-2">
            <Label htmlFor="documentType">
              Tipo <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.documentType}
              onValueChange={(value: DocumentType) => onFieldChange('documentType', value)}
              disabled={isVerifying}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cedula_identidad">
                  Venezolana (V)
                </SelectItem>
                <SelectItem value="cedula_extranjera">
                  Extranjera (E)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Document Number - Side by side */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="documentNumber">
              Número de Cédula <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="documentNumber"
                type="text"
                value={formData.documentNumber}
                onChange={(e) => onFieldChange('documentNumber', e.target.value)}
                placeholder={documentPlaceholder}
                disabled={isVerifying}
                className={`pr-10 ${errors.documentNumber ? 'border-red-500' : ''} ${
                  verificationStatus?.isValid ? 'border-green-500' : ''
                } ${isVerifying ? 'opacity-50' : ''}`}
              />
              {verificationStatus?.isValid && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Formato: {documentPlaceholder}
            </p>
          </div>
        </div>

        {/* Error Messages */}
        {(errors.documentType || errors.documentNumber) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errors.documentType || errors.documentNumber}
            </AlertDescription>
          </Alert>
        )}

        {/* Verification Status */}
        {isVerifying && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Verificando datos médicos con SACS... Esto puede tomar unos segundos.
            </AlertDescription>
          </Alert>
        )}

        {/* Verification Results */}
        {verificationResult?.isValid && (
          <Alert className="border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-2">
                <div className="font-medium">✓ Médico Verificado</div>
                {verificationResult.doctorName && (
                  <div><strong>Nombre:</strong> {verificationResult.doctorName}</div>
                )}
                {verificationResult.licenseStatus && (
                  <div><strong>Profesión:</strong> {verificationResult.licenseStatus}</div>
                )}
                {verificationResult.specialty ? (
                  <div className="flex items-center gap-2">
                    <strong>Especialidad:</strong> 
                    <Badge variant="secondary">{verificationResult.specialty}</Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <strong>Especialidad:</strong> 
                    <Badge variant="outline" className="text-gray-600">Sin especialidad (Medicina General)</Badge>
                  </div>
                )}
                <div><strong>Estado:</strong> active</div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Name mismatch warning */}
        {verificationResult?.isValid && verificationResult.nameMatch && !verificationResult.nameMatch.matches && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">⚠️ Los nombres no coinciden</div>
                <div>{verificationResult.nameMatch.message}</div>
                <div className="text-sm">
                  Por favor, regrese al paso anterior y corrija los nombres para que coincidan exactamente 
                  con el registro oficial.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {verificationResult && !verificationResult.isValid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No se pudo verificar la cédula médica en los registros oficiales de SACS.
              Verifique que el número sea correcto.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
