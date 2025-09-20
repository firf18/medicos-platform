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
import { IdCard, AlertCircle, CheckCircle } from 'lucide-react';
import {
  DocumentType,
  ProfessionalInfoFormData,
  ProfessionalInfoFormErrors,
  FieldValidationStatus
} from '../../types/professional-info.types';
import { getDocumentPlaceholder } from '../../utils/professional-info-validation';

interface DocumentInfoSectionProps {
  formData: Pick<ProfessionalInfoFormData, 'documentType' | 'documentNumber' | 'licenseNumber'>;
  errors: Pick<ProfessionalInfoFormErrors, 'documentType' | 'documentNumber' | 'licenseNumber'>;
  onFieldChange: (field: keyof ProfessionalInfoFormData, value: string | number) => void;
  isVerifying?: boolean;
  verificationStatus?: FieldValidationStatus;
}

export const DocumentInfoSection: React.FC<DocumentInfoSectionProps> = ({
  formData,
  errors,
  onFieldChange,
  isVerifying = false,
  verificationStatus
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
          Proporcione su información de identificación personal y matrícula médica
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="documentType">
            Tipo de Documento <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.documentType}
            onValueChange={(value: DocumentType) => onFieldChange('documentType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione el tipo de documento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cedula_identidad">
                Cédula de Identidad Venezolana
              </SelectItem>
              <SelectItem value="cedula_extranjera">
                Cédula de Extranjero
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.documentType && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.documentType}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Document Number */}
        <div className="space-y-2">
          <Label htmlFor="documentNumber">
            Número de Documento <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="documentNumber"
              type="text"
              value={formData.documentNumber}
              onChange={(e) => onFieldChange('documentNumber', e.target.value)}
              placeholder={documentPlaceholder}
              className={`${errors.documentNumber ? 'border-red-500' : ''} ${
                verificationStatus?.isValid ? 'border-green-500' : ''
              }`}
            />
            {verificationStatus?.isValid && (
              <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )}
          </div>
          {errors.documentNumber && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.documentNumber}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">
            Formato: {documentPlaceholder}
          </p>
        </div>

        {/* License Number */}
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">
            Número de Matrícula Médica <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="licenseNumber"
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => onFieldChange('licenseNumber', e.target.value)}
              placeholder="Ej: 12345 o MP12345"
              className={`${errors.licenseNumber ? 'border-red-500' : ''} ${
                verificationStatus?.isValid ? 'border-green-500' : ''
              }`}
              disabled={isVerifying}
            />
            {isVerifying && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
            {verificationStatus?.isValid && !isVerifying && (
              <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )}
          </div>
          {errors.licenseNumber && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.licenseNumber}</AlertDescription>
            </Alert>
          )}
          {isVerifying && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Verificando matrícula médica en el registro oficial...
              </AlertDescription>
            </Alert>
          )}
          {verificationStatus?.message && !isVerifying && (
            <Alert variant={verificationStatus.severity === 'error' ? 'destructive' : 'default'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{verificationStatus.message}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">
            Su número de matrícula será verificado automáticamente con el colegio de médicos
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
