import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProviderWrapper } from '@/components/providers/AuthProviderWrapper';
import { AuthCleanupButtonWithSuspense } from '@/components/auth/AuthCleanupButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Plataforma Médica',
  description: 'Plataforma integral para la gestión médica en Venezuela',
};

// Componente de fallback para el layout
const LayoutLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <AuthProviderWrapper>
          {children}
          <AuthCleanupButtonWithSuspense />
        </AuthProviderWrapper>
      </body>
    </html>
  );
}