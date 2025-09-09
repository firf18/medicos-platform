'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations';
import { AUTH_ROUTES } from '@/lib/routes';

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsEmailSent(true);
      
      toast({
        title: 'Correo enviado',
        description: 'Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico.',
      });
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      toast({
        title: 'Error al enviar el correo',
        description: error.message || 'Ocurrió un error al enviar el correo de restablecimiento',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">¡Revisa tu correo!</h2>
          <p className="text-muted-foreground">
            Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico.
          </p>
          <p className="text-sm text-muted-foreground">
            Si no lo ves en tu bandeja de entrada, revisa la carpeta de spam o correo no deseado.
          </p>
        </div>
        <div className="pt-2">
          <Button 
            onClick={() => {
              setIsEmailSent(false);
              form.reset();
            }}
            className="w-full"
            variant="outline"
          >
            Enviar otro enlace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    placeholder="nombre@ejemplo.com"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <Link 
              href={AUTH_ROUTES.LOGIN} 
              className="text-sm font-medium text-gray-600 hover:text-gray-500"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
