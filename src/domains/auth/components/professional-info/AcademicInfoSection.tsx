/**
 * Academic Info Section Component
 * @fileoverview Academic background section for professional info form
 * @compliance HIPAA-compliant academic information input
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, AlertCircle, Calendar } from 'lucide-react';
import {
  ProfessionalInfoFormData,
  ProfessionalInfoFormErrors
} from '../../types/professional-info.types';
import { 
  VENEZUELAN_UNIVERSITIES, 
  MEDICAL_COLLEGES
} from '../../constants/medical-institutions';

interface AcademicInfoSectionProps {
  formData: Pick<ProfessionalInfoFormData, 'university' | 'graduationYear' | 'medicalBoard'>;
  errors: Pick<ProfessionalInfoFormErrors, 'university' | 'graduationYear' | 'medicalBoard'>;
  onFieldChange: (field: keyof ProfessionalInfoFormData, value: string | number) => void;
}

export const AcademicInfoSection: React.FC<AcademicInfoSectionProps> = ({
  formData,
  errors,
  onFieldChange
}) => {
  
  // Manejar el formato de fecha dd/mm/yyyy
  const handleDateChange = (value: string) => {
    // Solo permitir números y /
    const formatted = value
      .replace(/[^\d/]/g, '') // Solo números y /
      .replace(/^(\d{2})(\d)/, '$1/$2') // Agregar / después del día
      .replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2') // Agregar / después del mes
      .substring(0, 10); // Máximo 10 caracteres
    
    onFieldChange('graduationYear', formatted);
  };

  const validateDateFormat = (dateStr: string): boolean => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateStr)) return false;
    
    const [, day, month, year] = dateStr.match(regex)!;
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    return dayNum >= 1 && dayNum <= 31 && 
           monthNum >= 1 && monthNum <= 12 && 
           yearNum >= 1950 && yearNum <= new Date().getFullYear();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Información Académica
        </CardTitle>
        <CardDescription>
          Proporcione información sobre su formación médica y colegiación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Layout compacto: Universidad y Fecha lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Universidad - 2/3 del espacio */}
          <div className="md:col-span-2 space-y-2">
          <Label htmlFor="university">
              Universidad de Medicina <span className="text-red-500">*</span>
          </Label>
          <Select
              value={formData.university}
              onValueChange={(value) => onFieldChange('university', value)}
          >
              <SelectTrigger className={errors.university ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccione su universidad" />
            </SelectTrigger>
              <SelectContent className="max-h-60">
                {VENEZUELAN_UNIVERSITIES.map((university) => (
                  <SelectItem key={university} value={university}>
                    {university}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            {errors.university && (
              <p className="text-sm text-red-500">{errors.university}</p>
          )}
        </div>

          {/* Fecha de Graduación - 1/3 del espacio */}
          <div className="space-y-2">
            <Label htmlFor="graduationYear">
              <Calendar className="h-4 w-4 inline mr-1" />
              Fecha de Graduación <span className="text-red-500">*</span>
            </Label>
            <Input
              id="graduationYear"
              type="text"
              value={formData.graduationYear}
              onChange={(e) => handleDateChange(e.target.value)}
              placeholder="dd/mm/yyyy"
              maxLength={10}
              className={`${errors.graduationYear ? 'border-red-500' : ''} ${
                formData.graduationYear && validateDateFormat(formData.graduationYear) 
                  ? 'border-green-500' 
                  : ''
              }`}
            />
            {errors.graduationYear && (
              <p className="text-sm text-red-500">{errors.graduationYear}</p>
            )}
            {formData.graduationYear && !validateDateFormat(formData.graduationYear) && (
              <p className="text-xs text-orange-600">
                Formato: día/mes/año (ej: 15/03/2020)
              </p>
            )}
          </div>
        </div>

        {/* Colegio de Médicos - Ancho completo */}
        <div className="space-y-2">
          <Label htmlFor="medicalBoard">
            Colegio de Médicos <span className="text-red-500">*</span>
          </Label>
          <Select
                value={formData.medicalBoard}
            onValueChange={(value) => onFieldChange('medicalBoard', value)}
          >
            <SelectTrigger className={errors.medicalBoard ? 'border-red-500' : ''}>
              <SelectValue placeholder="Seleccione su colegio de médicos" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {MEDICAL_COLLEGES.map((college) => (
                <SelectItem key={college} value={college}>
                  {college}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.medicalBoard && (
            <p className="text-sm text-red-500">{errors.medicalBoard}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Seleccione el colegio de médicos de su estado de registro
          </p>
            </div>
            
        {/* Información adicional */}
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-700">
            ℹ️ <strong>Información importante:</strong> La universidad y colegio médico deben coincidir 
            con los datos registrados en SACS. Esta información será verificada automáticamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
