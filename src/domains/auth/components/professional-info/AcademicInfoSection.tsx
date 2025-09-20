/**
 * Academic Info Section Component
 * @fileoverview Academic background section for professional info form
 * @compliance HIPAA-compliant academic information input
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { GraduationCap, AlertCircle, Search, Building } from 'lucide-react';
import {
  ProfessionalInfoFormData,
  ProfessionalInfoFormErrors
} from '../../types/professional-info.types';
import { 
  VENEZUELAN_UNIVERSITIES, 
  MEDICAL_COLLEGES,
  getUniversitySuggestions 
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
  const [showUniversityList, setShowUniversityList] = useState(false);
  const [showMedicalBoardList, setShowMedicalBoardList] = useState(false);
  const [universitySuggestions, setUniversitySuggestions] = useState<string[]>([]);

  const handleUniversitySearch = (query: string) => {
    onFieldChange('university', query);
    const suggestions = getUniversitySuggestions(query);
    setUniversitySuggestions(suggestions);
    setShowUniversityList(suggestions.length > 0);
  };

  const selectUniversity = (university: string) => {
    onFieldChange('university', university);
    setShowUniversityList(false);
    setUniversitySuggestions([]);
  };

  const selectMedicalBoard = (board: string) => {
    onFieldChange('medicalBoard', board);
    setShowMedicalBoardList(false);
  };

  // Generate graduation year options (last 50 years)
  const currentYear = new Date().getFullYear();
  const graduationYearOptions = Array.from(
    { length: 50 }, 
    (_, i) => currentYear - i
  );

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
        {/* University */}
        <div className="space-y-2">
          <Label htmlFor="university">
            Universidad de Medicina <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <div className="flex gap-2">
              <Input
                id="university"
                type="text"
                value={formData.university}
                onChange={(e) => handleUniversitySearch(e.target.value)}
                placeholder="Escriba el nombre de su universidad"
                className={errors.university ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUniversityList(!showUniversityList)}
                className="flex-shrink-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {/* University suggestions dropdown */}
            {(showUniversityList || universitySuggestions.length > 0) && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {universitySuggestions.length > 0 ? (
                  universitySuggestions.map((university, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      onClick={() => selectUniversity(university)}
                    >
                      {university}
                    </button>
                  ))
                ) : (
                  VENEZUELAN_UNIVERSITIES.map((university, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      onClick={() => selectUniversity(university)}
                    >
                      {university}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {errors.university && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.university}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">
            Seleccione o escriba el nombre de la universidad donde estudió medicina
          </p>
        </div>

        {/* Graduation Year */}
        <div className="space-y-2">
          <Label htmlFor="graduationYear">
            Año de Graduación <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.graduationYear?.toString() || ''}
            onValueChange={(value) => onFieldChange('graduationYear', parseInt(value))}
          >
            <SelectTrigger className={errors.graduationYear ? 'border-red-500' : ''}>
              <SelectValue placeholder="Seleccione el año de graduación" />
            </SelectTrigger>
            <SelectContent>
              {graduationYearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.graduationYear && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.graduationYear}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Medical Board */}
        <div className="space-y-2">
          <Label htmlFor="medicalBoard">
            Colegio de Médicos <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <div className="flex gap-2">
              <Input
                id="medicalBoard"
                type="text"
                value={formData.medicalBoard}
                onChange={(e) => onFieldChange('medicalBoard', e.target.value)}
                placeholder="Escriba el nombre del colegio de médicos"
                className={errors.medicalBoard ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMedicalBoardList(!showMedicalBoardList)}
                className="flex-shrink-0"
              >
                <Building className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Medical board dropdown */}
            {showMedicalBoardList && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {MEDICAL_COLLEGES.map((board, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    onClick={() => selectMedicalBoard(board)}
                  >
                    {board}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.medicalBoard && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.medicalBoard}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">
            Seleccione el colegio de médicos donde está registrado
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
