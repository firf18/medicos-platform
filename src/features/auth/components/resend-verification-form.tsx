'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

const resendVerificationSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
});

type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>;

export function ResendVerificationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<ResendVerificationFormData>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ResendVerificationFormData) => {
    try {
      setIsLoading(true);
      
      // Enviar correo de verificación
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: values.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      if (error) throw error;

      setIsSent(true);
      
      toast({
        title: 'Correo de verificación enviado',
        description: 'Hemos enviado un nuevo enlace de verificación a tu correo electrónico.',
      });
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      toast({
        title: 'Error al enviar el correo',
        description: error.message || 'Ocurrió un error al enviar el correo de verificación',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
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
          <h2 className="text-2xl font-bold">¡Correo enviado!</h2>
          <p className="text-muted-foreground">
            Hemos enviado un nuevo enlace de verificación a tu correo electrónico.
          </p>
          <p className="text-sm text-muted-foreground">
            Si no lo ves en tu bandeja de entrada, revisa la carpeta de spam o correo no deseado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Ingresa tu correo electrónico y te enviaremos un nuevo enlace de verificación.
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
            {isLoading ? 'Enviando...' : 'Enviar correo de verificación'}
          </Button>
        </form>
      </Form>
    </div>
  );
}