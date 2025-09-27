/**
 * Página de Registro de Médicos Mejorada
 * Sistema completo de registro con validaciones y especialidades
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  GraduationCap,
  Building,
  FileText
} from 'lucide-react';

interface Specialty {
  id: string;
  name: string;
  description: string;
  is_available: boolean;
  required_validations: any[];
}

interface RegistrationForm {
  // Información personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  
  // Información profesional
  licenseNumber: string;
  licenseState: string;
  licenseExpiry: string;
  specialtyId: string;
  yearsOfExperience: number;
  currentHospital: string;
  bio: string;
  
  // Términos y condiciones
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  subscribeNewsletter: boolean;
}

interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
}

export default function DoctorRegistrationPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  
  const [form, setForm] = useState<RegistrationForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    licenseState: '',
    licenseExpiry: '',
    specialtyId: '',
    yearsOfExperience: 0,
    currentHospital: '',
    bio: '',
    acceptTerms: false,
    acceptPrivacy: false,
    subscribeNewsletter: false
  });

  const steps: RegistrationStep[] = [
    {
      id: 'personal',
      title: 'Información Personal',
      description: 'Datos básicos de contacto',
      icon: User,
      completed: false
    },
    {
      id: 'professional',
      title: 'Información Profesional',
      description: 'Credenciales y especialidad médica',
      icon: GraduationCap,
      completed: false
    },
    {
      id: 'verification',
      title: 'Verificación',
      description: 'Confirmación y términos',
      icon: Shield,
      completed: false
    }
  ];

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_specialties')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading specialties:', error);
        // Fallback a especialidades simuladas
        setSpecialties([
          {
            id: 'medicina_general',
            name: 'Medicina General',
            description: 'Atención médica primaria y preventiva',
            is_available: true,
            required_validations: []
          },
          {
            id: 'cardiologia',
            name: 'Cardiología',
            description: 'Especialista en enfermedades del corazón',
            is_available: true,
            required_validations: []
          },
          {
            id: 'pediatria',
            name: 'Pediatría',
            description: 'Especialista en medicina infantil',
            is_available: true,
            required_validations: []
          }
        ]);
      } else {
        setSpecialties(data || []);
      }
    } catch (error) {
      console.error('Error loading specialties:', error);
    }
  };

  const updateForm = (field: keyof RegistrationForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Personal info
        return !!(form.firstName && form.lastName && form.email && form.phone && form.password && form.confirmPassword);
      case 1: // Professional info
        return !!(form.licenseNumber && form.licenseState && form.licenseExpiry && form.specialtyId);
      case 2: // Verification
        return form.acceptTerms && form.acceptPrivacy;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      setError('Por favor completa todos los campos requeridos');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) {
      setError('Por favor acepta los términos y condiciones');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone,
            role: 'doctor'
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      // Crear perfil de doctor
      const { error: doctorError } = await supabase
        .from('doctor_profiles')
        .insert({
          user_id: authData.user.id,
          license_number: form.licenseNumber,
          license_state: form.licenseState,
          license_expiry: form.licenseExpiry,
          specialty_id: form.specialtyId,
          years_of_experience: form.yearsOfExperience,
          current_hospital: form.currentHospital,
          bio: form.bio,
          verification_status: 'pending'
        });

      if (doctorError) {
        throw doctorError;
      }

      // Crear configuración del dashboard
      const { error: configError } = await supabase
        .from('doctor_dashboard_configs')
        .insert({
          doctor_id: authData.user.id,
          selected_features: ['patient_management', 'appointment_scheduling', 'medical_records'],
          working_hours: {
            monday: { start: '08:00', end: '17:00', available: true },
            tuesday: { start: '08:00', end: '17:00', available: true },
            wednesday: { start: '08:00', end: '17:00', available: true },
            thursday: { start: '08:00', end: '17:00', available: true },
            friday: { start: '08:00', end: '17:00', available: true },
            saturday: { start: '08:00', end: '12:00', available: false },
            sunday: { start: '08:00', end: '12:00', available: false }
          },
          notification_preferences: {
            email: true,
            sms: true,
            push: true
          }
        });

      if (configError) {
        console.error('Error creating dashboard config:', configError);
        // No es crítico, continuar
      }

      setSuccess(true);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push('/auth/login/medicos');
      }, 3000);

    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">¡Registro Exitoso!</CardTitle>
            <CardDescription>
              Tu cuenta de médico ha sido creada correctamente. 
              Te redirigiremos al login en unos segundos.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Revisa tu email para verificar tu cuenta</p>
              <p>• Tu perfil está pendiente de verificación</p>
              <p>• Podrás acceder al dashboard una vez verificado</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <Stethoscope className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Registro de Médicos</h1>
          <p className="mt-2 text-gray-600">
            Únete a Red-Salud y comienza a gestionar tu práctica médica
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted ? 'bg-green-500 border-green-500 text-white' :
                    isActive ? 'bg-blue-500 border-blue-500 text-white' :
                    'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 0: Personal Information */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(e) => updateForm('firstName', e.target.value)}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={(e) => updateForm('lastName', e.target.value)}
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    placeholder="tu.email@ejemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    placeholder="+58 412 123 4567"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Contraseña *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => updateForm('password', e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={(e) => updateForm('confirmPassword', e.target.value)}
                        placeholder="Repite tu contraseña"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Professional Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licenseNumber">Número de Cédula Profesional *</Label>
                    <Input
                      id="licenseNumber"
                      value={form.licenseNumber}
                      onChange={(e) => updateForm('licenseNumber', e.target.value)}
                      placeholder="Ej: 12345678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="licenseState">Estado/País de Emisión *</Label>
                    <Input
                      id="licenseState"
                      value={form.licenseState}
                      onChange={(e) => updateForm('licenseState', e.target.value)}
                      placeholder="Venezuela"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="licenseExpiry">Fecha de Vencimiento de Cédula *</Label>
                  <Input
                    id="licenseExpiry"
                    type="date"
                    value={form.licenseExpiry}
                    onChange={(e) => updateForm('licenseExpiry', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="specialtyId">Especialidad Médica *</Label>
                  <Select value={form.specialtyId} onValueChange={(value) => updateForm('specialtyId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty.id} value={specialty.id}>
                          <div className="flex items-center space-x-2">
                            <span>{specialty.name}</span>
                            {specialty.is_available && (
                              <Badge variant="secondary" className="text-xs">Disponible</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="yearsOfExperience">Años de Experiencia</Label>
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      min="0"
                      value={form.yearsOfExperience}
                      onChange={(e) => updateForm('yearsOfExperience', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentHospital">Hospital/Clínica Actual</Label>
                    <Input
                      id="currentHospital"
                      value={form.currentHospital}
                      onChange={(e) => updateForm('currentHospital', e.target.value)}
                      placeholder="Nombre del centro médico"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Biografía Profesional</Label>
                  <Textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) => updateForm('bio', e.target.value)}
                    placeholder="Cuéntanos sobre tu experiencia y especialización..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Verification */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Resumen de tu Registro</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p><strong>Nombre:</strong> {form.firstName} {form.lastName}</p>
                    <p><strong>Email:</strong> {form.email}</p>
                    <p><strong>Especialidad:</strong> {specialties.find(s => s.id === form.specialtyId)?.name}</p>
                    <p><strong>Cédula:</strong> {form.licenseNumber}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptTerms"
                      checked={form.acceptTerms}
                      onCheckedChange={(checked) => updateForm('acceptTerms', checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="acceptTerms" className="text-sm font-medium">
                        Acepto los Términos y Condiciones *
                      </Label>
                      <p className="text-xs text-gray-500">
                        He leído y acepto los términos de servicio de Red-Salud
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptPrivacy"
                      checked={form.acceptPrivacy}
                      onCheckedChange={(checked) => updateForm('acceptPrivacy', checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="acceptPrivacy" className="text-sm font-medium">
                        Acepto la Política de Privacidad *
                      </Label>
                      <p className="text-xs text-gray-500">
                        Acepto el tratamiento de mis datos personales según la política de privacidad
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="subscribeNewsletter"
                      checked={form.subscribeNewsletter}
                      onCheckedChange={(checked) => updateForm('subscribeNewsletter', checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="subscribeNewsletter" className="text-sm font-medium">
                        Suscribirme al boletín informativo
                      </Label>
                      <p className="text-xs text-gray-500">
                        Recibir actualizaciones sobre nuevas funcionalidades y noticias médicas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Anterior
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button onClick={nextStep}>
                  Siguiente
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando Cuenta...
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Button variant="link" onClick={() => router.push('/auth/login/medicos')}>
              Inicia sesión aquí
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
