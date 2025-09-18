"use client";

import { Input } from "@/components/ui/input";

interface SimplePhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SimplePhoneInput({
  value,
  onChange,
  onBlur,
  placeholder = "412 xxx xx xx",
  className = "",
  disabled = false,
}: SimplePhoneInputProps) {
  // Formatear el número mientras se escribe
  const formatPhoneNumber = (input: string): string => {
    // Remover todo excepto números
    const numbers = input.replace(/\D/g, "");

    // Limitar a 10 dígitos (3+3+2+2)
    const limitedNumbers = numbers.slice(0, 10);

    // Aplicar formato: 412 516 03 82
    if (limitedNumbers.length <= 3) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 6) {
      return `${limitedNumbers.slice(0, 3)} ${limitedNumbers.slice(3)}`;
    } else if (limitedNumbers.length <= 8) {
      return `${limitedNumbers.slice(0, 3)} ${limitedNumbers.slice(
        3,
        6
      )} ${limitedNumbers.slice(6)}`;
    } else {
      return `${limitedNumbers.slice(0, 3)} ${limitedNumbers.slice(
        3,
        6
      )} ${limitedNumbers.slice(6, 8)} ${limitedNumbers.slice(8)}`;
    }
  };

  // Obtener solo los números del valor actual
  const getNumbersOnly = (val: string): string => {
    if (val.startsWith("+58")) {
      return val.substring(3).replace(/\D/g, "");
    }
    return val.replace(/\D/g, "");
  };

  // Manejar cambios en el input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numbersOnly = inputValue.replace(/\D/g, "");

    // Limitar a 10 dígitos
    if (numbersOnly.length <= 10) {
      const fullNumber = `+58${numbersOnly}`;
      onChange(fullNumber);
    }
  };

  // Obtener el valor formateado para mostrar
  const displayValue = formatPhoneNumber(getNumbersOnly(value));

  return (
    <div className="flex">
      {/* Prefijo +58 fijo */}
      <div className="flex items-center px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-sm font-medium text-gray-700">
        +58
      </div>

      {/* Input del número */}
      <Input
        type="tel"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`rounded-l-none ${className}`}
      />
    </div>
  );
}

export default SimplePhoneInput;
