'use client';

import React, { forwardRef } from 'react';
import PhoneInput from 'react-phone-number-input';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import 'react-phone-number-input/style.css';

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const CustomPhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, placeholder, className, disabled, error, ...props }, ref) => {
    return (
      <div className={cn('phone-input', error && 'error', className)}>
        <PhoneInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          defaultCountry="MX"
          international
          countryCallingCodeEditable={false}
          inputComponent={Input}
          inputProps={{
            ref,
            ...props,
            className: cn(
              'w-full',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )
          }}
        />
      </div>
    );
  }
);

CustomPhoneInput.displayName = 'CustomPhoneInput';

export { CustomPhoneInput };
export default CustomPhoneInput;
