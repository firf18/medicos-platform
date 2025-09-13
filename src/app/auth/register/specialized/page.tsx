'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth';
import { AUTH_ROUTES } from '@/lib/routes';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SpecializedRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUserType = searchParams.get('type') as 'patient' | 'doctor' | 'clinic' | 'laboratory' | null;
  
  const [userType, setUserType] = useState<'patient' | 'doctor' | 'clinic' | 'laboratory'>(initialUserType || 'patient');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { signUp } = useAuth();

  // Redirect to main register page if no type is specified
  useEffect(() => {
    if (!initialUserType) {
      router.push(AUTH_ROUTES.REGISTER);
    }
  }, [initialUserType, router]);

  const handleUserTypeChange = (value: string) => {
    setUserType(value as 'patient' | 'doctor' | 'clinic' | 'laboratory');
    // Clear errors when user type changes
    setErrors({});
  };

  const validateForm = (formData: FormData): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Basic validation for all user types
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    
    if (!firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    
    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)) {
      newErrors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    // Specific validation based on user type
    if (userType === 'clinic') {
      const clinicName = formData.get('clinicName') as string;
      if (!clinicName.trim()) {
        newErrors.clinicName = 'El nombre de la clínica es requerido';
      }
    } else if (userType === 'laboratory') {
      const labName = formData.get('labName') as string;
      if (!labName.trim()) {
        newErrors.labName = 'El nombre del laboratorio es requerido';
      }
    } else if (userType === 'doctor') {
      const licenseNumber = formData.get('licenseNumber') as string;
      const specialtyId = formData.get('specialtyId') as string;
      if (!licenseNumber.trim()) {
        newErrors.licenseNumber = 'El número de cédula profesional es requerido';
      }
      if (!specialtyId) {
        newErrors.specialtyId = 'La especialización es requerida';
      }
    } else if (userType === 'patient') {
      const dateOfBirth = formData.get('dateOfBirth') as string;
      if (!dateOfBirth) {
        newErrors.dateOfBirth = 'La fecha de nacimiento es requerida';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    const formData = new FormData(e.currentTarget);
    
    // Validate form
    if (!validateForm(formData)) {
      setIsLoading(false);
      return;
    }
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    
    try {
      // Preparar datos específicos según el tipo de usuario
      const userData: any = {
        firstName,
        lastName,
        role: userType,
      };

      // Agregar campos adicionales según el tipo de usuario
      if (userType === 'clinic') {
        userData.clinicName = formData.get('clinicName') as string;
        userData.clinicDescription = formData.get('clinicDescription') as string;
        userData.clinicAddress = formData.get('clinicAddress') as string;
        userData.clinicCity = formData.get('clinicCity') as string;
        userData.clinicState = formData.get('clinicState') as string;
        userData.clinicCountry = formData.get('clinicCountry') as string;
        userData.clinicPhone = formData.get('clinicPhone') as string;
        userData.clinicEmail = formData.get('clinicEmail') as string;
        userData.clinicWebsite = formData.get('clinicWebsite') as string;
      } else if (userType === 'laboratory') {
        userData.labName = formData.get('labName') as string;
        userData.labDescription = formData.get('labDescription') as string;
        userData.labAddress = formData.get('labAddress') as string;
        userData.labCity = formData.get('labCity') as string;
        userData.labState = formData.get('labState') as string;
        userData.labCountry = formData.get('labCountry') as string;
        userData.labPhone = formData.get('labPhone') as string;
        userData.labEmail = formData.get('labEmail') as string;
        userData.labWebsite = formData.get('labWebsite') as string;
      } else if (userType === 'doctor') {
        userData.specialtyId = formData.get('specialtyId') as string;
        userData.licenseNumber = formData.get('licenseNumber') as string;
        userData.bio = formData.get('bio') as string;
      } else if (userType === 'patient') {
        userData.dateOfBirth = formData.get('dateOfBirth') as string;
        userData.bloodType = formData.get('bloodType') as string;
        userData.allergies = formData.get('allergies') as string;
      }
      
      // Registrar al usuario con Supabase
      const { error } = await signUp(email, password, userData);

      if (error) throw error;
      
      // Si no hay error, asumimos que el registro fue exitoso
      // y redirigimos a la página de verificación de correo
      toast({
        title: '¡Registro exitoso!',
        description: 'Por favor verifica tu correo electrónico para continuar.',
      });
      router.push(AUTH_ROUTES.VERIFY_EMAIL);
      
    } catch (error: any) {
      console.error('Error al registrar:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al crear tu cuenta. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If no user type is specified, don't render the form
  if (!initialUserType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center mb-4">
            <Link 
              href={AUTH_ROUTES.REGISTER} 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
            <CardTitle className="text-3xl font-bold text-gray-900">Registro Especializado</CardTitle>
            <div></div> {/* Spacer for alignment */}
          </div>
          <CardDescription className="text-gray-600">
            Crea una cuenta según tu rol en el sistema de salud
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Usuario
            </Label>
            <Select value={userType} onValueChange={handleUserTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un tipo de usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Paciente</SelectItem>
                <SelectItem value="doctor">Médico</SelectItem>
                <SelectItem value="clinic">Clínica</SelectItem>
                <SelectItem value="laboratory">Laboratorio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  {userType === 'clinic' ? 'Nombre del Representante' : 
                   userType === 'laboratory' ? 'Nombre del Responsable' : 'Nombres'}
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  disabled={isLoading}
                  className="w-full"
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              </div>
              <div>
                <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  {userType === 'clinic' ? 'Apellido del Representante' : 
                   userType === 'laboratory' ? 'Apellido del Responsable' : 'Apellidos'}
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  disabled={isLoading}
                  className="w-full"
                  aria-invalid={!!errors.lastName}
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={isLoading}
                className="w-full"
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={isLoading}
                  className="w-full"
                  aria-invalid={!!errors.password}
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números
                </p>
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  disabled={isLoading}
                  className="w-full"
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Campos específicos para clínicas */}
            {userType === 'clinic' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Información de la Clínica</h3>
                <div>
                  <Label htmlFor="clinicName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Clínica *
                  </Label>
                  <Input
                    id="clinicName"
                    name="clinicName"
                    type="text"
                    required
                    disabled={isLoading}
                    className="w-full"
                    aria-invalid={!!errors.clinicName}
                  />
                  {errors.clinicName && <p className="mt-1 text-sm text-red-600">{errors.clinicName}</p>}
                </div>
                <div>
                  <Label htmlFor="clinicDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </Label>
                  <Textarea
                    id="clinicDescription"
                    name="clinicDescription"
                    disabled={isLoading}
                    className="w-full"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="clinicPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </Label>
                    <Input
                      id="clinicPhone"
                      name="clinicPhone"
                      type="tel"
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinicEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email de Contacto
                    </Label>
                    <Input
                      id="clinicEmail"
                      name="clinicEmail"
                      type="email"
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinicWebsite" className="block text-sm font-medium text-gray-700 mb-1">
                      Sitio Web
                    </Label>
                    <Input
                      id="clinicWebsite"
                      name="clinicWebsite"
                      type="url"
                      disabled={isLoading}
                      className="w-full"
                      placeholder="https://"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="clinicAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </Label>
                  <Input
                    id="clinicAddress"
                    name="clinicAddress"
                    type="text"
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="clinicCity" className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad
                    </Label>
                    <Input
                      id="clinicCity"
                      name="clinicCity"
                      type="text"
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinicState" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado/Provincia
                    </Label>
                    <Input
                      id="clinicState"
                      name="clinicState"
                      type="text"
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinicCountry" className="block text-sm font-medium text-gray-700 mb-1">
                      País
                    </Label>
                    <Input
                      id="clinicCountry"
                      name="clinicCountry"
                      type="text"
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Campos específicos para laboratorios */}
            {userType === 'laboratory' && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Información del Laboratorio</h3>
                <div>
                  <Label htmlFor="labName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Laboratorio *
                  </Label>
                  <Input
                    id="labName"
                    name="labName"
                    type="text"
                    required
                    disabled={isLoading}
                    className="w-full"
                    aria-invalid={!!errors.labName}
                  />
                  {errors.labName && <p className="mt-1 text-sm text-red-600">{errors.labName}</p>}
                </div>
                <div>
                  <Label htmlFor="labDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </Label>
                  <Textarea
                    id="labDescription"
                    name="labDescription"
                    disabled={isLoading}
                    className="w-full"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="labPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </Label>
                    <Input
                      id="labPhone"
                      name="labPhone"
                      type="tel"
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="labEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email de Contacto
                    </Label>
                    <Input
                      id="labEmail"
                      name="labEmail"
                      type="email"
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="labWebsite" className="block text-sm font-medium text-gray-700 mb-1">
                      Sitio Web
                    </Label>
                    <Input
                      id="labWebsite"
                      name="labWebsite"
                      type="url"
                      disabled={isLoading}
                      className="w-full"
                      placeholder="https://"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="labAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </Label>
                  <Input
                    id="labAddress"
                    name="labAddress"
                    type="text"
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="labCity" className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad
                    </Label>
                    <Input
                      id="labCity"
                      name="labCity"
                      type="text"
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="labState" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado/Provincia
                    </Label>
                    <Input
                      id="labState"
                      name="labState"
                      type="text"
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="labCountry" className="block text-sm font-medium text-gray-700 mb-1">
                      País
                    </Label>
                    <Input
                      id="labCountry"
                      name="labCountry"
                      type="text"
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Campos específicos para médicos */}
            {userType === 'doctor' && (
              <div className="space-y-4 p-4 bg-indigo-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Información Profesional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Cédula Profesional *
                    </Label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      required
                      disabled={isLoading}
                      className="w-full"
                      aria-invalid={!!errors.licenseNumber}
                    />
                    {errors.licenseNumber && <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>}
                  </div>
                  <div>
                    <Label htmlFor="specialtyId" className="block text-sm font-medium text-gray-700 mb-1">
                      Especialización *
                    </Label>
                    <Select name="specialtyId">
                      <SelectTrigger className="w-full" aria-invalid={!!errors.specialtyId}>
                        <SelectValue placeholder="Selecciona una especialización" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Medicina General</SelectItem>
                        <SelectItem value="2">Cardiología</SelectItem>
                        <SelectItem value="3">Dermatología</SelectItem>
                        <SelectItem value="4">Neurología</SelectItem>
                        <SelectItem value="5">Pediatría</SelectItem>
                        <SelectItem value="6">Ginecología</SelectItem>
                        <SelectItem value="7">Traumatología</SelectItem>
                        <SelectItem value="8">Psiquiatría</SelectItem>
                        <SelectItem value="9">Oftalmología</SelectItem>
                        <SelectItem value="10">Otorrinolaringología</SelectItem>
                        <SelectItem value="11">Otra</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.specialtyId && <p className="mt-1 text-sm text-red-600">{errors.specialtyId}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Biografía Profesional
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    disabled={isLoading}
                    className="w-full"
                    rows={3}
                    placeholder="Describe tu experiencia y formación..."
                  />
                </div>
              </div>
            )}

            {/* Campos específicos para pacientes */}
            {userType === 'patient' && (
              <div className="space-y-4 p-4 bg-emerald-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Información Médica Básica</h3>
                <div>
                  <Label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento *
                  </Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    disabled={isLoading}
                    className="w-full"
                    aria-invalid={!!errors.dateOfBirth}
                  />
                  {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Sangre
                    </Label>
                    <Select name="bloodType">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona tipo de sangre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No especificar</SelectItem>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                    Alergias (opcional)
                  </Label>
                  <Textarea
                    id="allergies"
                    name="allergies"
                    disabled={isLoading}
                    className="w-full"
                    rows={2}
                    placeholder="Lista tus alergias conocidas..."
                  />
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando cuenta...
                  </>
                ) : 'Crear cuenta'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link href={AUTH_ROUTES.LOGIN} className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}