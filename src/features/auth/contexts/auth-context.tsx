'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { UserRole } from '@/features/auth/utils/role-utils';
import { SupabaseClient } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    role: UserRole | null;
    firstName: string;
    lastName: string;
  } | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: unknown }>;
  signUp: (email: string, password: string, userData: Record<string, unknown>) => Promise<{ success: boolean; error?: unknown }>;
  signOut: () => Promise<{ success: boolean; error?: unknown }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: unknown }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: unknown }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: unknown }>;
  isEmailVerified: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth as AuthContextType}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}