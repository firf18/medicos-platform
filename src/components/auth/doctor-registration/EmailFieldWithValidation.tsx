'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRealTimeFieldValidation } from '@/hooks/useRealTimeFieldValidation';
import { z } from 'zod';
import ValidationSuggestions from '@/components/auth/doctor-registration/ValidationSuggestions';

const emailSchema = z.string().email('Formato de email inválido');

interface EmailFieldWithValidationProps {
  initialValue?: string;
  onValueChange: (value: string) => void;
  label?: string;
}

export default function EmailFieldWithValidation({
  initialValue = '',
  onValueChange,
  label = 'Email'
}: EmailFieldWithValidationProps) {
  const {
    value,
    setValue,
    error,
    isValid,
    isDirty,
    isTouched,
    setIsTouched,
    suggestions
  } = useRealTimeFieldValidation({
    schema: emailSchema,
    initialValue,
    fieldName: 'email',
    debounceMs: 500
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onValueChange(newValue);
  };

  const handleBlur = () => {
    setIsTouched(true);
  };

  return (
    <div className="space-y-2">
      <Label 
        htmlFor="email" 
        className={error && isTouched ? 'text-red-600' : 'text-gray-700'}
      >
        {label}
        {error && isTouched && (
          <span className="text-red-600 text-sm ml-1">- {error}</span>
        )}
      </Label>
      
      <Input
        id="email"
        type="email"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`
          ${error && isTouched ? 'border-red-500 focus-visible:ring-red-500' : ''}
          ${isValid && isDirty ? 'border-green-500 focus-visible:ring-green-500' : ''}
        `}
        placeholder="ejemplo@correo.com"
      />
      
      <ValidationSuggestions 
        suggestions={suggestions} 
        isVisible={isTouched && !isValid} 
      />
      
      {isValid && isDirty && (
        <p className="text-sm text-green-600 flex items-center">
          <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
          Email válido
        </p>
      )}
    </div>
  );
}
