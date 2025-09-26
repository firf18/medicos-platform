'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Upload, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema
const LaboratoryRegistrationSchema = z.object({
  email: z.string().email('Email inválido'),
  laboratory_name: z.string().min(2, 'Nombre del laboratorio requerido'),
  legal_name: z.string().min(2, 'Nombre legal requerido'),
  rif: z.string().regex(/^[JGVEP]-[0-9]{8}-[0-9]$/, 'Formato RIF inválido'),
  phone: z.string().optional(),
  address: z.string().min(10, 'Dirección requerida'),
  city: z.string().min(2, 'Ciudad requerida'),
  state: z.string().min(2, 'Estado requerido'),
  laboratory_type: z.enum(['clinical', 'pathology', 'research', 'reference', 'specialized', 'mobile']),
});

type LaboratoryRegistrationForm = z.infer<typeof LaboratoryRegistrationSchema>;

interface LaboratoryRegistrationProps {
  onSuccess?: (registrationId: string) => void;
  onError?: (error: string) => void;
}

export function LaboratoryRegistration({ onSuccess, onError }: LaboratoryRegistrationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LaboratoryRegistrationForm>({
    resolver: zodResolver(LaboratoryRegistrationSchema),
    defaultValues: {
      laboratory_type: 'clinical',
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: LaboratoryRegistrationForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/laboratories/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setRegistrationId(result.registration_id);
        setCurrentStep(2);
        onSuccess?.(result.registration_id);
      } else {
        onError?.(result.error || 'Error al registrar el laboratorio');
      }
    } catch (error) {
      onError?.('Error de conexión. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Registro de Laboratorio
        </CardTitle>
        <CardDescription>
          Complete la información básica de su laboratorio médico
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="laboratorio@ejemplo.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+58-212-555-0123"
                {...register('phone')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="laboratory_name">Nombre del Laboratorio *</Label>
            <Input
              id="laboratory_name"
              placeholder="Laboratorio Clínico Central"
              {...register('laboratory_name')}
              className={errors.laboratory_name ? 'border-red-500' : ''}
            />
            {errors.laboratory_name && (
              <p className="text-sm text-red-500">{errors.laboratory_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="legal_name">Nombre Legal *</Label>
            <Input
              id="legal_name"
              placeholder="Laboratorio Clínico Central C.A."
              {...register('legal_name')}
              className={errors.legal_name ? 'border-red-500' : ''}
            />
            {errors.legal_name && (
              <p className="text-sm text-red-500">{errors.legal_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="rif">RIF *</Label>
              <Input
                id="rif"
                placeholder="J-12345678-9"
                {...register('rif')}
                className={errors.rif ? 'border-red-500' : ''}
              />
              {errors.rif && (
                <p className="text-sm text-red-500">{errors.rif.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Formato: [JGVEP]-[8 dígitos]-[1 dígito]
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="laboratory_type">Tipo de Laboratorio *</Label>
              <Select
                value={watchedValues.laboratory_type}
                onValueChange={(value) => setValue('laboratory_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinical">Clínico</SelectItem>
                  <SelectItem value="pathology">Patología</SelectItem>
                  <SelectItem value="research">Investigación</SelectItem>
                  <SelectItem value="reference">Referencia</SelectItem>
                  <SelectItem value="specialized">Especializado</SelectItem>
                  <SelectItem value="mobile">Móvil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección *</Label>
            <Textarea
              id="address"
              placeholder="Av. Francisco de Miranda, Torre Parque Cristal, Piso 15"
              {...register('address')}
              className={errors.address ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
                placeholder="Caracas"
                {...register('city')}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                placeholder="Distrito Capital"
                {...register('state')}
                className={errors.state ? 'border-red-500' : ''}
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              'Continuar'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          ¡Registro Exitoso!
        </CardTitle>
        <CardDescription>
          Su solicitud de registro ha sido enviada correctamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Su laboratorio <strong>{watchedValues.laboratory_name}</strong> ha sido registrado 
            con el RIF <strong>{watchedValues.rif}</strong>. 
            Recibirá un email de confirmación próximamente.
          </AlertDescription>
        </Alert>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Próximos pasos:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              Revisión de documentos por nuestro equipo
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
              Verificación de cumplimiento regulatorio
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
              Aprobación y activación del laboratorio
            </li>
          </ul>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            ID de Registro: <code className="bg-gray-100 px-2 py-1 rounded">{registrationId}</code>
          </p>
          <Button
            onClick={() => window.location.href = '/laboratories/search'}
            variant="outline"
            className="mr-2"
          >
            Buscar Laboratorios
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Ir al Inicio
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
      </div>
    </div>
  );
}
