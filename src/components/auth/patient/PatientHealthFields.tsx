/**
 * Patient Health Fields Component - Red-Salud Platform
 * 
 * Campos de información de salud específicos para pacientes.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

'use client';

export interface PatientHealthData {
  dateOfBirth: string;
  bloodType: string;
  allergies: string[];
}

interface PatientHealthFieldsProps {
  data: PatientHealthData;
  onChange: (field: keyof PatientHealthData, value: string | string[]) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const COMMON_ALLERGIES = [
  'Polvo',
  'Polen', 
  'Ácaros',
  'Mariscos',
  'Maní',
  'Lácteos',
  'Huevos',
  'Soja',
  'Trigo',
  'Medicamentos (penicilina)',
  'Medicamentos (aspirina)',
  'Picaduras de insectos'
];

export function PatientHealthFields({ 
  data, 
  onChange, 
  errors = {}, 
  disabled = false 
}: PatientHealthFieldsProps) {

  const handleAllergyToggle = (allergy: string) => {
    if (disabled) return;
    
    const currentAllergies = [...data.allergies];
    const index = currentAllergies.indexOf(allergy);
    
    if (index > -1) {
      currentAllergies.splice(index, 1);
    } else {
      currentAllergies.push(allergy);
    }
    
    onChange('allergies', currentAllergies);
  };

  const handleAddCustomAllergy = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newAllergy = e.currentTarget.value.trim();
      if (!data.allergies.includes(newAllergy)) {
        onChange('allergies', [...data.allergies, newAllergy]);
      }
      e.currentTarget.value = '';
    }
  };

  const removeAllergy = (allergyToRemove: string) => {
    if (disabled) return;
    onChange('allergies', data.allergies.filter(allergy => allergy !== allergyToRemove));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Información de salud
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Esta información nos ayudará a brindarte una mejor atención médica personalizada.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        {/* Fecha de nacimiento */}
        <div className="sm:col-span-3">
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
            Fecha de nacimiento
          </label>
          <div className="mt-1">
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={data.dateOfBirth}
              onChange={(e) => onChange('dateOfBirth', e.target.value)}
              disabled={disabled}
              className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.dateOfBirth 
                  ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300'
              } ${disabled ? 'bg-gray-50 text-gray-500' : ''}`}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
            )}
          </div>
        </div>

        {/* Tipo de sangre */}
        <div className="sm:col-span-3">
          <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">
            Tipo de sangre
          </label>
          <div className="mt-1">
            <select
              id="bloodType"
              name="bloodType"
              value={data.bloodType}
              onChange={(e) => onChange('bloodType', e.target.value)}
              disabled={disabled}
              className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.bloodType 
                  ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300'
              } ${disabled ? 'bg-gray-50 text-gray-500' : ''}`}
            >
              <option value="">Selecciona tu tipo de sangre</option>
              {BLOOD_TYPES.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.bloodType && (
              <p className="mt-1 text-sm text-red-600">{errors.bloodType}</p>
            )}
          </div>
        </div>

        {/* Alergias */}
        <div className="sm:col-span-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Alergias conocidas
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Selecciona todas las alergias que conozcas. Esta información es importante para tu seguridad.
          </p>
          
          {/* Lista de alergias comunes */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 mb-4">
            {COMMON_ALLERGIES.map((allergy) => (
              <div key={allergy} className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id={`allergy-${allergy}`}
                    name="allergies"
                    type="checkbox"
                    checked={data.allergies.includes(allergy)}
                    onChange={() => handleAllergyToggle(allergy)}
                    disabled={disabled}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label 
                    htmlFor={`allergy-${allergy}`} 
                    className={`font-medium ${disabled ? 'text-gray-400' : 'text-gray-700 cursor-pointer'}`}
                  >
                    {allergy}
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Campo para alergias personalizadas */}
          <div className="mt-4">
            <label htmlFor="customAllergy" className="block text-sm font-medium text-gray-700 mb-2">
              Otra alergia no listada
            </label>
            <input
              type="text"
              id="customAllergy"
              placeholder="Escribe el nombre de la alergia y presiona Enter"
              onKeyDown={handleAddCustomAllergy}
              disabled={disabled}
              className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                disabled ? 'bg-gray-50 text-gray-500 border-gray-200' : 'border-gray-300'
              }`}
            />
          </div>

          {/* Lista de alergias seleccionadas */}
          {data.allergies.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Alergias seleccionadas:
              </p>
              <div className="flex flex-wrap gap-2">
                {data.allergies.map((allergy, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {allergy}
                    {!disabled && (
                      <button
                        type="button"
                        className="ml-2 inline-flex items-center justify-center flex-shrink-0 w-4 h-4 text-blue-400 hover:bg-blue-200 hover:text-blue-500 rounded-full focus:outline-none"
                        onClick={() => removeAllergy(allergy)}
                      >
                        <span className="sr-only">Eliminar {allergy}</span>
                        <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                          <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                        </svg>
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {errors.allergies && (
            <p className="mt-2 text-sm text-red-600">{errors.allergies}</p>
          )}
        </div>
      </div>
    </div>
  );
}
