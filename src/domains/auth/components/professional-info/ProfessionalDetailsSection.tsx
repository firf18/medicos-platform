/**
 * Professional Details Section Component
 * @fileoverview Professional experience and bio section for doctor registration
 * @compliance HIPAA-compliant professional information input
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Award, AlertCircle, Info } from 'lucide-react';
import {
  ProfessionalInfoFormData,
  ProfessionalInfoFormErrors,
  BIO_VALIDATION,
  EXPERIENCE_VALIDATION
} from '../../types/professional-info.types';

interface ProfessionalDetailsSectionProps {
  formData: Pick<ProfessionalInfoFormData, 'yearsOfExperience' | 'bio'>;
  errors: Pick<ProfessionalInfoFormErrors, 'yearsOfExperience' | 'bio'>;
  onFieldChange: (field: keyof ProfessionalInfoFormData, value: string | number) => void;
}

export const ProfessionalDetailsSection: React.FC<ProfessionalDetailsSectionProps> = ({
  formData,
  errors,
  onFieldChange
}) => {
  const bioLength = formData.bio.length;
  const isBioTooShort = bioLength < BIO_VALIDATION.MIN_LENGTH;
  const isBioTooLong = bioLength > BIO_VALIDATION.MAX_LENGTH;
  const isBioOptimal = bioLength >= BIO_VALIDATION.RECOMMENDED_MIN && bioLength <= BIO_VALIDATION.RECOMMENDED_MAX;

  const getBioLengthColor = () => {
    if (isBioTooShort || isBioTooLong) return 'text-red-500';
    if (isBioOptimal) return 'text-green-500';
    return 'text-yellow-500';
  };

  const getExperienceHint = (years: number) => {
    if (years === 0) return 'Recién graduado';
    if (years <= 2) return 'Médico junior';
    if (years <= 5) return 'Experiencia intermedia';
    if (years <= 10) return 'Médico experimentado';
    if (years <= 20) return 'Médico senior';
    if (years <= 30) return 'Médico experto';
    return 'Médico con amplia trayectoria';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Experiencia Profesional
        </CardTitle>
        <CardDescription>
          Describa su experiencia médica y trayectoria profesional
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Years of Experience */}
        <div className="space-y-2">
          <Label htmlFor="yearsOfExperience">
            Años de Experiencia Médica <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-2">
            <Input
              id="yearsOfExperience"
              type="number"
              min={EXPERIENCE_VALIDATION.MIN_YEARS}
              max={EXPERIENCE_VALIDATION.MAX_YEARS}
              value={formData.yearsOfExperience}
              onChange={(e) => onFieldChange('yearsOfExperience', parseInt(e.target.value) || 0)}
              placeholder="0"
              className={errors.yearsOfExperience ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                {getExperienceHint(formData.yearsOfExperience)}
              </span>
              <span className="text-muted-foreground">
                Rango: {EXPERIENCE_VALIDATION.MIN_YEARS}-{EXPERIENCE_VALIDATION.MAX_YEARS} años
              </span>
            </div>
          </div>
          {errors.yearsOfExperience && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.yearsOfExperience}</AlertDescription>
            </Alert>
          )}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Incluya toda su experiencia médica desde la graduación, incluyendo residencia, 
              especialización y práctica profesional.
            </AlertDescription>
          </Alert>
        </div>

        {/* Professional Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">
            Biografía Profesional <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-2">
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => onFieldChange('bio', e.target.value)}
              placeholder="Describa su experiencia médica, especialidades, áreas de interés, logros profesionales, y cualquier información relevante para los pacientes..."
              className={`min-h-32 resize-vertical ${errors.bio ? 'border-red-500' : ''}`}
              rows={6}
            />
            <div className="flex justify-between items-center text-sm">
              <span className={getBioLengthColor()}>
                {bioLength}/{BIO_VALIDATION.MAX_LENGTH} caracteres
              </span>
              <span className="text-muted-foreground">
                Mínimo: {BIO_VALIDATION.MIN_LENGTH} caracteres
              </span>
            </div>
          </div>
          {errors.bio && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.bio}</AlertDescription>
            </Alert>
          )}
          {!errors.bio && isBioTooShort && bioLength > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Necesita {BIO_VALIDATION.MIN_LENGTH - bioLength} caracteres más para cumplir el mínimo requerido.
              </AlertDescription>
            </Alert>
          )}
          {!errors.bio && isBioOptimal && (
            <Alert className="border-green-200 bg-green-50">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Excelente longitud para su biografía profesional.
              </AlertDescription>
            </Alert>
          )}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Incluya información sobre:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Especialidad médica y subespecialidades</li>
                <li>Experiencia en hospitales o clínicas relevantes</li>
                <li>Áreas de interés o expertise particular</li>
                <li>Logros académicos o profesionales destacados</li>
                <li>Enfoque de atención al paciente</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};
