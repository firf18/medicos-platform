'use client';

import { ReactNode } from 'react';
import { AppProvider } from '@/providers/app/AppProvider';

type ProvidersWrapperProps = {
  children: ReactNode;
};

export function ProvidersWrapper({ children }: ProvidersWrapperProps) {
  return <AppProvider>{children}</AppProvider>;
}

export default ProvidersWrapper;
