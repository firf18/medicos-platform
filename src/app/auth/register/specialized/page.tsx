/**
 * Specialized Registration Page - Refactored
 * @fileoverview Page component using the new modular specialized registration form
 * @compliance HIPAA-compliant user registration page
 */

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AUTH_ROUTES } from '@/lib/routes';
import { SpecializedRegistrationForm } from '@/domains/auth/components/specialized-registration';
import { UserType } from '@/domains/auth/types/specialized-registration.types';

export default function SpecializedRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUserType = searchParams.get('type') as UserType | null;

  // Redirect to main register page if no type is specified
  useEffect(() => {
    if (!initialUserType) {
      router.push(AUTH_ROUTES.REGISTER);
    }
  }, [initialUserType, router]);

  // Don't render anything until we have a valid user type
  if (!initialUserType) {
    return null;
  }

  return (
    <SpecializedRegistrationForm
      initialUserType={initialUserType}
      onSuccess={(userType, userId) => {
        console.log(`Registration successful for ${userType} user:`, userId);
      }}
      onError={(error) => {
        console.error('Registration error:', error);
      }}
    />
  );
}
