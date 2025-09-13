'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/providers/i18n/hooks/use-translation'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const { signIn } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const { t } = useTranslation()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await signIn(data.email, data.password)

      if (result.success) {
        toast({
          title: t('common.success'),
          description: t('auth.login.errors.accountNotVerified'), // Este mensaje debería ser de éxito
        })
        
        // Redirigir al dashboard o a la página solicitada
        router.push(redirect || '/dashboard')
      } else {
        toast({
          title: t('auth.login.errors.invalidCredentials'),
          description: result.error?.message || t('auth.login.errors.invalidCredentials'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('common.error'),
        variant: 'destructive',
      })
    }
  }

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password')
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-4"
        aria-label={t('auth.login.title')}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="email">{t('auth.login.email')}</FormLabel>
              <FormControl>
                <Input 
                  id="email"
                  placeholder="email@ejemplo.com" 
                  {...field} 
                  autoComplete="email"
                  aria-describedby="email-error"
                />
              </FormControl>
              <FormMessage id="email-error" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="password">{t('auth.login.password')}</FormLabel>
              <FormControl>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  {...field} 
                  autoComplete="current-password"
                  aria-describedby="password-error"
                />
              </FormControl>
              <FormMessage id="password-error" />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <Button 
            variant="link" 
            type="button" 
            onClick={handleForgotPassword} 
            className="p-0 h-auto font-normal"
            aria-label={t('auth.login.forgotPassword')}
          >
            {t('auth.login.forgotPassword')}
          </Button>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          aria-label={t('auth.login.loginButton')}
        >
          {t('auth.login.loginButton')}
        </Button>
        
        <div className="text-center text-sm text-muted-foreground">
          {t('auth.login.noAccount')}{' '}
          <Link 
            href="/auth/register" 
            className="text-primary hover:underline"
            aria-label={t('auth.login.registerNow')}
          >
            {t('auth.login.registerNow')}
          </Link>
        </div>
      </form>
    </Form>
  )
}