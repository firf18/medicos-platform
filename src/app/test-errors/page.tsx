/**
 * Componente de Prueba de Errores - Red-Salud
 * 
 * Este componente permite probar el sistema de manejo de errores
 * para verificar que funciona correctamente.
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDoctorRegistrationErrors } from '@/hooks/useFormErrors';
import MedicalErrorDisplay from '@/components/ui/medical-error-display';
import { ZodError } from 'zod';
import { personalInfoSchema } from '@/lib/validations/personal-info.validations';

// Componente simple para mostrar errores inline
function InlineFieldError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="flex items-center space-x-1 mt-1">
      <svg className="h-3 w-3 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span className="text-sm text-red-600">{error}</span>
    </div>
  );
}

// Componente simple para mostrar resumen de errores
function FormErrorDisplay({ errors, warnings = [] }: { errors: any[]; warnings?: any[] }) {
  if (errors.length === 0 && warnings.length === 0) return null;
  
  return (
    <div className="space-y-4">
      <MedicalErrorDisplay
        errors={errors}
        warnings={warnings}
        onDismiss={() => {}}
      />
    </div>
  );
}

export default function ErrorTestingComponent() {
  const formErrors = useDoctorRegistrationErrors();
  const [testData, setTestData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleTestValidation = () => {
    try {
      personalInfoSchema.parse(testData);
      formErrors.clearAllErrors();
      alert('✅ Validación exitosa');
    } catch (error) {
      if (error instanceof ZodError) {
        formErrors.setZodError(error);
        console.log('Errores de Zod:', error.issues);
      }
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setTestData(prev => ({ ...prev, [field]: value }));
    
    // Validar campo específico
    switch (field) {
      case 'firstName':
        formErrors.validateName(value, 'nombre');
        break;
      case 'lastName':
        formErrors.validateName(value, 'apellido');
        break;
      case 'email':
        formErrors.validateEmail(value);
        break;
      case 'phone':
        formErrors.validatePhone(value);
        break;
      case 'password':
        formErrors.validatePassword(value);
        if (testData.confirmPassword) {
          formErrors.validatePasswordMatch(value, testData.confirmPassword);
        }
        break;
      case 'confirmPassword':
        formErrors.validatePasswordMatch(testData.password, value);
        break;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Prueba del Sistema de Errores</CardTitle>
          <CardDescription>
            Prueba el sistema de manejo de errores mejorado para el registro de médicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campos de prueba */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={testData.firstName}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                className={formErrors.getFieldClassName('nombre')}
                placeholder="Ingresa tu nombre"
              />
              <InlineFieldError error={formErrors.getFieldError('nombre')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={testData.lastName}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                className={formErrors.getFieldClassName('apellido')}
                placeholder="Ingresa tu apellido"
              />
              <InlineFieldError error={formErrors.getFieldError('apellido')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={testData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={formErrors.getFieldClassName('correo electrónico')}
                placeholder="tu@email.com"
              />
              <InlineFieldError error={formErrors.getFieldError('correo electrónico')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={testData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className={formErrors.getFieldClassName('teléfono')}
                placeholder="+1 234 567 8900"
              />
              <InlineFieldError error={formErrors.getFieldError('teléfono')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={testData.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                className={formErrors.getFieldClassName('contraseña')}
                placeholder="••••••••"
              />
              <InlineFieldError error={formErrors.getFieldError('contraseña')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={testData.confirmPassword}
                onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                className={formErrors.getFieldClassName('confirmación de contraseña')}
                placeholder="••••••••"
              />
              <InlineFieldError error={formErrors.getFieldError('confirmación de contraseña')} />
            </div>
          </div>

          {/* Botones de prueba */}
          <div className="flex gap-4">
            <Button onClick={handleTestValidation} variant="default">
              🔍 Probar Validación Completa
            </Button>
            <Button onClick={() => formErrors.clearAllErrors()} variant="outline">
              🧹 Limpiar Errores
            </Button>
          </div>

          {/* Mostrar errores */}
          <FormErrorDisplay
            errors={formErrors.errors}
            warnings={formErrors.warnings}
            onDismiss={() => formErrors.clearAllErrors()}
          />

          {/* Información de estado */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Estado del Formulario</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Errores: {formErrors.errors.length}</p>
              <p>• Advertencias: {formErrors.warnings.length}</p>
              <p>• Errores críticos: {formErrors.hasCriticalErrors ? 'Sí' : 'No'}</p>
              <p>• Resumen: {formErrors.errorSummary || 'Sin errores'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
