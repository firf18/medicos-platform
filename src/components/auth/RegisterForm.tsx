'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/contexts/AuthContext';

type UserRole = 'patient' | 'doctor';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'patient' as UserRole,
    // Additional fields for doctors
    specialtyId: '',
    licenseNumber: '',
    bio: '',
    experienceYears: '',
    consultationFee: '',
    // Additional fields for patients
    dateOfBirth: '',
    bloodType: '',
    allergies: [] as string[],
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAllergyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const allergies = [...prev.allergies];
      if (checked) {
        allergies.push(value);
      } else {
        const index = allergies.indexOf(value);
        if (index > -1) {
          allergies.splice(index, 1);
        }
      }
      return { ...prev, allergies };
    });
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('El apellido es requerido');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateStep1()) return;
    
    setIsLoading(true);
    
    try {
      const { error: signUpError } = await signUp(
        formData.email, 
        formData.password, 
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: formData.role,
          ...(formData.role === 'doctor' && {
            specialtyId: parseInt(formData.specialtyId),
            licenseNumber: formData.licenseNumber,
            bio: formData.bio,
            experienceYears: parseInt(formData.experienceYears) || 0,
            consultationFee: parseFloat(formData.consultationFee) || 0,
          }),
          ...(formData.role === 'patient' && {
            dateOfBirth: formData.dateOfBirth,
            bloodType: formData.bloodType,
            allergies: formData.allergies,
          }),
        }
      );
      
      if (signUpError) {
        setError(signUpError.message || 'Error al crear la cuenta');
        return;
      }
      
      // The AuthContext will handle the redirection after successful registration
    } catch (err) {
      setError('Ocurrió un error inesperado');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      setError('');
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
    setError('');
  };

  // Mock specialties - in a real app, you would fetch these from your API
  const specialties = [
    { id: 1, name: 'Cardiología' },
    { id: 2, name: 'Dermatología' },
    { id: 3, name: 'Pediatría' },
    { id: 4, name: 'Ortopedia' },
    { id: 5, name: 'Ginecología' },
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const commonAllergies = ['Polvo', 'Polen', 'Ácaros', 'Mariscos', 'Maní', 'Lácteos', 'Huevos', 'Soja', 'Trigo'];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Crear una cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            O{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              inicia sesión si ya tienes una cuenta
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-5">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Información básica</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Apellido
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Correo electrónico
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Teléfono
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Contraseña
                    </label>
                    <div className="mt-1">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirmar contraseña
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Tipo de cuenta</label>
                    <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div 
                        className={`relative rounded-lg border p-4 cursor-pointer ${
                          formData.role === 'patient' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 bg-white'
                        }`}
                        onClick={() => setFormData({...formData, role: 'patient'})}
                      >
                        <div className="flex items-center">
                          <div className="flex items-center h-5">
                            <input
                              id="patient-role"
                              name="role"
                              type="radio"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              checked={formData.role === 'patient'}
                              onChange={() => {}}
                            />
                          </div>
                          <label htmlFor="patient-role" className="ml-3">
                            <span className="block text-sm font-medium text-gray-700">Paciente</span>
                            <span className="block text-sm text-gray-500">Buscar y agendar citas con médicos</span>
                          </label>
                        </div>
                      </div>
                      <div 
                        className={`relative rounded-lg border p-4 cursor-pointer ${
                          formData.role === 'doctor' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 bg-white'
                        }`}
                        onClick={() => setFormData({...formData, role: 'doctor'})}
                      >
                        <div className="flex items-center">
                          <div className="flex items-center h-5">
                            <input
                              id="doctor-role"
                              name="role"
                              type="radio"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              checked={formData.role === 'doctor'}
                              onChange={() => {}}
                            />
                          </div>
                          <label htmlFor="doctor-role" className="ml-3">
                            <span className="block text-sm font-medium text-gray-700">Médico</span>
                            <span className="block text-sm text-gray-500">Atender pacientes y gestionar citas</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && formData.role === 'doctor' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-5">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Información profesional</h3>
                  <p className="mt-1 text-sm text-gray-500">Esta información será visible en tu perfil público.</p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="specialtyId" className="block text-sm font-medium text-gray-700">
                      Especialidad
                    </label>
                    <div className="mt-1">
                      <select
                        id="specialtyId"
                        name="specialtyId"
                        value={formData.specialtyId}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      >
                        <option value="">Selecciona una especialidad</option>
                        {specialties.map((specialty) => (
                          <option key={specialty.id} value={specialty.id}>
                            {specialty.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                      Número de licencia médica
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700">
                      Años de experiencia
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        id="experienceYears"
                        name="experienceYears"
                        min="0"
                        value={formData.experienceYears}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700">
                      Honorarios por consulta ($)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        id="consultationFee"
                        name="consultationFee"
                        min="0"
                        step="0.01"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Biografía
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Cuéntanos sobre tu experiencia, especialidades y enfoque médico..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Anterior
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && formData.role === 'patient' && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-5">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Información de salud</h3>
                  <p className="mt-1 text-sm text-gray-500">Esta información nos ayudará a brindarte una mejor atención.</p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                      Fecha de nacimiento
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">
                      Tipo de sangre
                    </label>
                    <div className="mt-1">
                      <select
                        id="bloodType"
                        name="bloodType"
                        value={formData.bloodType}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Selecciona tu tipo de sangre</option>
                        {bloodTypes.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Alergias conocidas</label>
                    <p className="text-sm text-gray-500 mb-2">Selecciona todas las que correspondan</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {commonAllergies.map((allergy) => (
                        <div key={allergy} className="relative flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={`allergy-${allergy}`}
                              name="allergies"
                              type="checkbox"
                              value={allergy}
                              checked={formData.allergies.includes(allergy)}
                              onChange={handleAllergyChange}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor={`allergy-${allergy}`} className="font-medium text-gray-700">
                              {allergy}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <div className="flex">
                        <input
                          type="text"
                          id="otherAllergy"
                          name="otherAllergy"
                          placeholder="Otra alergia (presiona Enter para agregar)"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value) {
                              e.preventDefault();
                              setFormData(prev => ({
                                ...prev,
                                allergies: [...prev.allergies, e.currentTarget.value]
                              }));
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                      {formData.allergies.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.allergies.map((allergy, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {allergy}
                              <button
                                type="button"
                                className="ml-1.5 inline-flex items-center justify-center flex-shrink-0 w-4 h-4 text-blue-400 hover:bg-blue-200 hover:text-blue-500 rounded-full focus:outline-none"
                                onClick={() => {
                                  const newAllergies = [...formData.allergies];
                                  newAllergies.splice(index, 1);
                                  setFormData(prev => ({
                                    ...prev,
                                    allergies: newAllergies
                                  }));
                                }}
                              >
                                <span className="sr-only">Eliminar {allergy}</span>
                                <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                  <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Anterior
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
