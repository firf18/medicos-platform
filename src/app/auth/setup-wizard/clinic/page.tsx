'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, ArrowRight, Building, User, FileText } from 'lucide-react';

export default function ClinicSetupWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clinic_name: '',
    clinic_description: '',
    clinic_address: '',
    clinic_city: '',
    clinic_state: '',
    clinic_country: '',
    clinic_phone: '',
    clinic_email: '',
    clinic_website: '',
  });
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      router.push('/auth/login');
      return;
    }

    // Verificar si es clínica
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id')
      .eq('id', session.session.user.id)
      .single();

    if (clinicError || !clinic) {
      router.push('/unauthorized');
    }
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  const handleFinish = async () => {
    setLoading(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('No hay sesión activa');

      // Actualizar información de la clínica
      const { error } = await supabase
        .from('clinics')
        .update({
          name: formData.clinic_name,
          description: formData.clinic_description || null,
          address: formData.clinic_address || null,
          city: formData.clinic_city || null,
          state: formData.clinic_state || null,
          country: formData.clinic_country || null,
          phone: formData.clinic_phone || null,
          email: formData.clinic_email || null,
          website: formData.clinic_website || null,
        })
        .eq('id', session.session.user.id);

      if (error) throw error;

      router.push('/clinic/dashboard');
    } catch (error) {
      console.error('Error updating clinic info:', error);
      alert('Error al guardar la información. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    { id: 1, name: 'Información Básica', icon: Building },
    { id: 2, name: 'Detalles de Contacto', icon: User },
    { id: 3, name: 'Perfil Completo', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Configuración Inicial - Clínica
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Completa la información de tu clínica
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, stepIdx) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        currentStep >= step.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-indigo-600' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </p>
                    </div>
                  </div>
                  {stepIdx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información Básica de la Clínica
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Proporciona la información fundamental de tu clínica.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre de la Clínica *
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.clinic_name}
                      onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                      placeholder="Ej: Clínica Médica Central"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.clinic_description}
                      onChange={(e) => setFormData({ ...formData, clinic_description: e.target.value })}
                      placeholder="Describe los servicios que ofrece tu clínica..."
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Detalles de Contacto
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Información de contacto de la clínica.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Dirección
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.clinic_address}
                      onChange={(e) => setFormData({ ...formData, clinic_address: e.target.value })}
                      placeholder="Dirección completa"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.clinic_city}
                        onChange={(e) => setFormData({ ...formData, clinic_city: e.target.value })}
                        placeholder="Ej: Caracas"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Estado/Provincia
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.clinic_state}
                        onChange={(e) => setFormData({ ...formData, clinic_state: e.target.value })}
                        placeholder="Ej: Distrito Capital"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      País
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.clinic_country}
                      onChange={(e) => setFormData({ ...formData, clinic_country: e.target.value })}
                      placeholder="Ej: Venezuela"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información de Contacto Adicional
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Información adicional para que los pacientes puedan contactarte.
                </p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.clinic_phone}
                        onChange={(e) => setFormData({ ...formData, clinic_phone: e.target.value })}
                        placeholder="Ej: +58 212-555-1234"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.clinic_email}
                        onChange={(e) => setFormData({ ...formData, clinic_email: e.target.value })}
                        placeholder="Ej: info@clinicamedica.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sitio Web
                    </label>
                    <input
                      type="url"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.clinic_website}
                      onChange={(e) => setFormData({ ...formData, clinic_website: e.target.value })}
                      placeholder="Ej: https://www.clinicamedica.com"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 && !formData.clinic_name}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading || !formData.clinic_name}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Finalizar Configuración'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}