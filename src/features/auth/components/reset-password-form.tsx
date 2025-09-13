'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validations';
import { AUTH_ROUTES } from '@/lib/routes';
import { AuthLoadingState } from '@/features/auth/components/auth-loading-state';
import { PostgrestError } from '@supabase/supabase-js';

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidLink, setIsValidLink] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>('');
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Check if the reset token is valid
    const checkResetToken = async () => {
      try {
        const token = searchParams.get('token_hash');
        if (!token) throw new Error('Token no proporcionado');
        
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery',
        });

        if (error) throw error;
        
        setEmail(data.user?.email || '');
        setIsValidLink(true);
      } catch (error: unknown) {
        console.error('Error verificando el token:', error);
        setIsValidLink(false);
        
        toast({
          title: 'Enlace inválido o expirado',
          description: 'El enlace de restablecimiento no es válido o ha expirado. Por favor, solicita uno nuevo.',
          variant: 'destructive',
        });
      }
    };

    if (searchParams.get('type') === 'recovery') {
      checkResetToken();
    } else {
      setIsValidLink(false);
      toast({
        title: 'Enlace inválido',
        description: 'El enlace de restablecimiento no es válido.',
        variant: 'destructive',
      });
    }
  }, [searchParams, supabase.auth, toast]);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ResetPasswordFormData) => {
    if (!isValidLink) return;
    
    try {
      setIsLoading(true);
      
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) throw error;
      
      toast({
        title: '¡Contraseña actualizada!',
        description: 'Tu contraseña ha sido actualizada correctamente. Redirigiendo...',
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error: unknown) {
      console.error('Error resetting password:', error);
      const errorMessage = (error as PostgrestError).message || 'Ocurrió un error al actualizar tu contraseña';
      toast({
        title: 'Error al actualizar la contraseña',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <AuthLoadingState message="Actualizando contraseña..." variant="default" />;
  }

  if (isValidLink === null) {
    return <AuthLoadingState message="Verificando enlace de recuperación..." variant="verification" />;
  }

  if (!isValidLink) {
    return (
      <div className="space-y-6 text-center p-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Enlace no válido o expirado</h2>
          <p className="text-muted-foreground">
            El enlace de restablecimiento de contraseña no es válido o ha expirado.
          </p>
        </div>
        <Button 
          onClick={() => router.push('/forgot-password')}
          className="mt-4 w-full"
        >
          Solicitar nuevo enlace
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {email && (
        <div className="p-4 bg-muted/50 rounded-md text-sm">
          <p className="font-medium">Cuenta: {email}</p>
          <p className="text-muted-foreground">Ingresa tu nueva contraseña a continuación.</p>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="••••••••"
                      type="password"
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar nueva contraseña</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="••••••••"
                      type="password"
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => router.push(AUTH_ROUTES.LOGIN)}
              disabled={isLoading}
            >
              Volver al inicio de sesión
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}