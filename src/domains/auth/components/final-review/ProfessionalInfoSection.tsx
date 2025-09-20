/**
 * Professional Info Section Component
 * @fileoverview Section for reviewing professional information in final review
 * @compliance HIPAA-compliant professional credentials review
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Stethoscope, Award, Calendar, FileText, Edit3, Save, X } from 'lucide-react';
import { useState } from 'react';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import { FIELD_VALIDATION } from '../../types/final-review.types';

interface ProfessionalInfoSectionProps {
  data: DoctorRegistrationData;
  specialty: any;
  onEdit?: (field: string, value: string | number) => void;
}

export const ProfessionalInfoSection: React.FC<ProfessionalInfoSectionProps> = ({
  data,
  specialty,
  onEdit
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState<string>('');

  const startEditing = (field: string, value: string | number) => {
    setEditingField(field);
    setFieldValue(String(value));
  };

  const saveEdit = () => {
    if (editingField && onEdit) {
      // Validate before saving
      if (editingField === 'yearsOfExperience') {
        const years = parseInt(fieldValue);
        if (isNaN(years) || years < FIELD_VALIDATION.yearsOfExperience.min || years > FIELD_VALIDATION.yearsOfExperience.max) {
          return;
        }
        onEdit(editingField, years);
      } else if (editingField === 'bio' && fieldValue.length > FIELD_VALIDATION.bio.maxLength) {
        return;
      } else {
        onEdit(editingField, fieldValue);
      }
    }
    setEditingField(null);
    setFieldValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setFieldValue('');
  };

  const renderEditableField = (
    fieldId: string,
    label: string,
    value: string | number,
    type: 'text' | 'number' | 'textarea' = 'text'
  ) => {
    const isEditing = editingField === fieldId;

    if (isEditing) {
      if (type === 'textarea') {
        return (
          <div className="space-y-2">
            <Textarea
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              className="min-h-[100px]"
              maxLength={FIELD_VALIDATION.bio.maxLength}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {fieldValue.length}/{FIELD_VALIDATION.bio.maxLength} caracteres
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={saveEdit}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <Input
            type={type}
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            className="flex-1"
            autoFocus
            min={type === 'number' ? FIELD_VALIDATION.yearsOfExperience.min : undefined}
            max={type === 'number' ? FIELD_VALIDATION.yearsOfExperience.max : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
          />
          <Button size="sm" variant="ghost" onClick={saveEdit} className="h-8 w-8 p-0">
            <Save className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="group">
        <div className="flex items-center justify-between">
          <div className={type === 'textarea' ? 'flex-1' : ''}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={type === 'textarea' ? 'mt-1' : 'font-medium'}>
              {value || 'No especificado'}
            </p>
          </div>
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startEditing(fieldId, value)}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-green-600" />
            <CardTitle>Información Profesional</CardTitle>
          </div>
          <Badge variant="secondary">Parcialmente Editable</Badge>
        </div>
        <CardDescription>
          Tu especialidad y experiencia médica
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Specialty (non-editable) */}
        <div>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Especialidad
          </p>
          <p className="font-medium">{specialty?.name || 'No especificada'}</p>
          {data.subSpecialties?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {data.subSpecialties.map(sub => (
                <Badge key={sub} variant="outline" className="text-xs">
                  {sub}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* License (non-editable) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Número de Matrícula
            </p>
            <p className="font-medium">{data.licenseNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Vencimiento de Licencia
            </p>
            <p className="font-medium">
              {data.licenseExpiry ? new Date(data.licenseExpiry).toLocaleDateString('es-VE') : 'No especificado'}
            </p>
          </div>
        </div>

        {/* Academic Info (non-editable) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Universidad</p>
            <p className="font-medium">{data.university || 'No especificada'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Año de Graduación</p>
            <p className="font-medium">{data.graduationYear || 'No especificado'}</p>
          </div>
        </div>

        {/* Editable fields */}
        <div className="pt-2 border-t">
          {renderEditableField(
            'yearsOfExperience',
            'Años de Experiencia',
            data.yearsOfExperience,
            'number'
          )}
          {editingField === 'yearsOfExperience' && (
            <p className="text-xs text-gray-500 mt-1">
              {FIELD_VALIDATION.yearsOfExperience.message}
            </p>
          )}
        </div>

        <div>
          {renderEditableField('bio', 'Biografía Profesional', data.bio, 'textarea')}
        </div>
      </CardContent>
    </Card>
  );
};
