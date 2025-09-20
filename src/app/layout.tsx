import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';

// Importaciones dinámicas para evitar errores de carga de chunks
import dynamic from 'next/dynamic';

// Componentes cargados dinámicamente con fallback
const AuthProviderWrapper = dynamic(
  () => import('@/components/providers/AuthProviderWrapper').then(mod => mod.AuthProviderWrapper),
  { 
    loading: () => <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  }
);

const AuthCleanupButtonWithSuspense = dynamic(
  () => import('@/components/auth/AuthCleanupButton').then(mod => mod.AuthCleanupButtonWithSuspense),
  { 
    loading: () => null 
  }
);

// Componente de manejo de errores para chunks
import { ChunkLoadErrorBoundary } from '@/components/error-boundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Plataforma Médica',
  description: 'Plataforma integral para la gestión médica en Venezuela',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <ChunkLoadErrorBoundary>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          }>
            <AuthProviderWrapper>
              {children}
              <AuthCleanupButtonWithSuspense />
            </AuthProviderWrapper>
          </Suspense>
        </ChunkLoadErrorBoundary>
      </body>
    </html>
  );
}