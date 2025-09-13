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