/**
 * Personal Info Section Component
 * @fileoverview Section for reviewing personal information in final review
 * @compliance HIPAA-compliant personal data review
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Edit3, Save, X } from 'lucide-react';
import { PersonalInfoSectionProps, FIELD_VALIDATION } from '../../types/final-review.types';

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  data,
  editingField,
  fieldValue,
  onStartEdit,
  onSaveEdit,
  onCancelEdit
}) => {
  const renderEditableField = (
    fieldId: string,
    label: string,
    value: string,
    type: 'text' | 'email' | 'tel' = 'text'
  ) => {
    const isEditing = editingField === fieldId;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            type={type}
            value={fieldValue}
            onChange={(e) => onStartEdit(fieldId, e.target.value)}
            className="flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit();
              if (e.key === 'Escape') onCancelEdit();
            }}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={onSaveEdit}
            className="h-8 w-8 p-0"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancelEdit}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between group">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="font-medium">{value || 'No especificado'}</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onStartEdit(fieldId, value)}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <CardTitle>Información Personal</CardTitle>
          </div>
          <Badge variant="secondary">Editable</Badge>
        </div>
        <CardDescription>
          Revisa y confirma tus datos personales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderEditableField('firstName', 'Nombre', data.firstName)}
          {renderEditableField('lastName', 'Apellido', data.lastName)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderEditableField('email', 'Correo Electrónico', data.email, 'email')}
          {renderEditableField('phone', 'Teléfono', data.phone, 'tel')}
        </div>

        {editingField === 'phone' && fieldValue && !FIELD_VALIDATION.phone.pattern.test(fieldValue) && (
          <p className="text-sm text-red-500">{FIELD_VALIDATION.phone.message}</p>
        )}

        {/* Password info (non-editable) */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-400" />
            <p className="text-sm text-gray-500">Contraseña configurada</p>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Por seguridad, la contraseña no se muestra aquí
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
