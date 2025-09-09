'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { loginSchema, LoginFormData } from '@/lib/validations';
import { AUTH_ROUTES } from '@/lib/routes';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormData) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;
      
      // Redirect based on user role
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role || 'patient';
      
      router.push(role === 'doctor' ? '/dashboard' : '/appointments');
      
      toast({
        title: '¡Bienvenido de vuelta!',
        description: 'Has iniciado sesión correctamente.',
      });
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        title: 'Error al iniciar sesión',
        description: error.message || 'Ocurrió un error al iniciar sesión',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="tucorreo@ejemplo.com"
                    type="email"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Contraseña</FormLabel>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-sm"
                    onClick={() => router.push('/forgot-password')}
                  >
                    ¿Olvidaste tu contraseña?
                  </Button>
                </div>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="••••••••"
                    type="password"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
        <div className="text-center text-sm">
          ¿No tienes una cuenta?{' '}
          <a href={AUTH_ROUTES.REGISTER} className="text-blue-600 hover:underline">
            Regístrate
          </a>
        </div>
      </form>
    </Form>
  );
}
