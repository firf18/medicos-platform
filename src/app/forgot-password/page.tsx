'use client';

import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          MediConectaVE
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "La mejor plataforma para la gestión médica en Venezuela. Simplificando la atención médica para profesionales y pacientes."
            </p>
            <footer className="text-sm">Dr. Juan Pérez</footer>
          </blockquote>
        </div>
      </div>
      
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Recuperar contraseña
            </h1>
            <p className="text-sm text-muted-foreground">
              Te enviaremos un enlace para restablecer tu contraseña a tu correo electrónico.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>¿Olvidaste tu contraseña?</CardTitle>
              <CardDescription>
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ForgotPasswordForm />
              
              <div className="mt-4 text-center text-sm">
                ¿Recordaste tu contraseña?{' '}
                <Link href="/login" className="underline">
                  Iniciar sesión
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
