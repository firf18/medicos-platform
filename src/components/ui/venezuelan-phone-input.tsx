'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Info } from 'lucide-react';

interface VenezuelanPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
}

// Códigos de área venezolanos más comunes
const VENEZUELAN_AREA_CODES = [
  // Móviles
  { code: '414', type: 'mobile', operator: 'Movilnet' },
  { code: '424', type: 'mobile', operator: 'Movilnet' },
  { code: '416', type: 'mobile', operator: 'Movistar' },
  { code: '426', type: 'mobile', operator: 'Movistar' },
  { code: '412', type: 'mobile', operator: 'Digitel' },
  { code: '417', type: 'mobile', operator: 'Digitel' },
  
  // Fijos principales
  { code: '212', type: 'landline', operator: 'Caracas' },
  { code: '261', type: 'landline', operator: 'Maracaibo' },
  { code: '241', type: 'landline', operator: 'Valencia' },
  { code: '251', type: 'landline', operator: 'Barquisimeto' },
  { code: '281', type: 'landline', operator: 'Barcelona' },
  { code: '271', type: 'landline', operator: 'Maracay' }
];

export function VenezuelanPhoneInput({
  value,
  onChange,
  onBlur,
  placeholder = "1234567",
  className = "",
  disabled = false,
  error
}: VenezuelanPhoneInputProps) {
  
  // Parsear el valor actual
  const parseValue = (val: string) => {
    if (val && val.startsWith('+58') && val.length >= 6) {
      const withoutCountryCode = val.substring(3);
      if (withoutCountryCode.length >= 3) {
        return {
          areaCode: withoutCountryCode.substring(0, 3),
          phoneNumber: withoutCountryCode.substring(3)
        };
      }
    }
    return { areaCode: '', phoneNumber: '' };
  };

  const { areaCode, phoneNumber } = parseValue(value);

  // Manejar cambio de código de área
  const handleAreaCodeChange = (code: string) => {
    const newValue = `+58${code}${phoneNumber}`;
    onChange(newValue);
  };

  // Manejar cambio de número
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ''); // Solo números
    
    if (inputValue.length <= 7 && areaCode) {
      const newValue = `+58${areaCode}${inputValue}`;
      onChange(newValue);
    }
  };

  // Formatear número para mostrar
  const formatPhoneNumber = (number: string): string => {
    if (number.length <= 3) return number;
    if (number.length <= 6) return `${number.slice(0, 3)}-${number.slice(3)}`;
    return `${number.slice(0, 3)}-${number.slice(3, 6)}-${number.slice(6)}`;
  };

  // Obtener información del código seleccionado
  const selectedAreaCodeInfo = VENEZUELAN_AREA_CODES.find(ac => ac.code === areaCode);

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        {/* Código de país fijo */}
        <div className="flex items-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700">
          +58
        </div>

        {/* Selector de código de área */}
        <Select value={areaCode} onValueChange={handleAreaCodeChange} disabled={disabled}>
          <SelectTrigger className={`w-32 ${error ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Área" />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b">
              Móviles
            </div>
            {VENEZUELAN_AREA_CODES
              .filter(ac => ac.type === 'mobile')
              .map(ac => (
                <SelectItem key={ac.code} value={ac.code}>
                  {ac.code} - {ac.operator}
                </SelectItem>
              ))}
            
            <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b border-t">
              Teléfonos Fijos
            </div>
            {VENEZUELAN_AREA_CODES
              .filter(ac => ac.type === 'landline')
              .map(ac => (
                <SelectItem key={ac.code} value={ac.code}>
                  {ac.code} - {ac.operator}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Campo de número */}
        <Input
          type="tel"
          placeholder={placeholder}
          value={formatPhoneNumber(phoneNumber)}
          onChange={handlePhoneNumberChange}
          onBlur={onBlur}
          disabled={disabled || !areaCode}
          className={`flex-1 ${error ? 'border-red-500' : ''} ${className}`}
        />
      </div>

      {/* Información del código seleccionado */}
      {selectedAreaCodeInfo && (
        <div className="flex items-center text-xs text-gray-600">
          <Info className="h-3 w-3 mr-1" />
          {selectedAreaCodeInfo.type === 'mobile' 
            ? `${selectedAreaCodeInfo.operator} (Móvil)`
            : `${selectedAreaCodeInfo.operator} (Fijo)`
          }
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <Phone className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

export default VenezuelanPhoneInput;
