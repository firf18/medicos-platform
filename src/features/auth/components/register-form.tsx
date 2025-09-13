'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from '@/providers/i18n/hooks/use-translation'
import Link from 'next/link'

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'El nombre es requerido'),
    lastName: z.string().min(1, 'El apellido es requerido'),
    email: z.string().email('Email inválido').min(1, 'El email es requerido'),
    role: z.enum(['patient', 'doctor', 'clinic', 'laboratory']),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Por favor confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const { signUp } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { t } = useTranslation()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'patient',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const result = await signUp(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      })

      if (result.success) {
        toast({
          title: t('common.success'),
          description: t('auth.verifyEmail.codeSent', { email: data.email }),
        })
        router.push('/auth/verify-email')
      } else {
        toast({
          title: 'Error en el registro',
          description: (result.error as any)?.message || 'Ocurrió un error inesperado',
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

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit as any)} 
        className="space-y-4"
        aria-label={t('auth.register.title')}
      >
        <FormField
          control={form.control as any}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="firstName">{t('auth.register.firstName')}</FormLabel>
              <FormControl>
                <Input 
                  id="firstName"
                  placeholder={t('auth.register.firstName')} 
                  {...field} 
                  autoComplete="given-name"
                  aria-describedby="firstName-error"
                />
              </FormControl>
              <FormMessage id="firstName-error" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="lastName">{t('auth.register.lastName')}</FormLabel>
              <FormControl>
                <Input 
                  id="lastName"
                  placeholder={t('auth.register.lastName')} 
                  {...field} 
                  autoComplete="family-name"
                  aria-describedby="lastName-error"
                />
              </FormControl>
              <FormMessage id="lastName-error" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="email">{t('auth.register.email')}</FormLabel>
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
          control={form.control as any}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="role">{t('auth.register.role')}</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                aria-describedby="role-error"
              >
                <FormControl>
                  <SelectTrigger id="role">
                    <SelectValue placeholder={t('auth.register.role')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="patient">{t('auth.register.patient')}</SelectItem>
                  <SelectItem value="doctor">{t('auth.register.doctor')}</SelectItem>
                  <SelectItem value="clinic">{t('auth.register.clinic')}</SelectItem>
                  <SelectItem value="laboratory">{t('auth.register.laboratory')}</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t('auth.register.roleDescription')}
              </FormDescription>
              <FormMessage id="role-error" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="password">{t('auth.register.password')}</FormLabel>
              <FormControl>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  {...field} 
                  autoComplete="new-password"
                  aria-describedby="password-error"
                />
              </FormControl>
              <FormDescription>
                {t('validation.minLength', { min: 6 })}
              </FormDescription>
              <FormMessage id="password-error" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="confirmPassword">{t('auth.register.confirmPassword')}</FormLabel>
              <FormControl>
                <Input 
                  id="confirmPassword"
                  type="password" 
                  placeholder="••••••••" 
                  {...field} 
                  autoComplete="new-password"
                  aria-describedby="confirmPassword-error"
                />
              </FormControl>
              <FormMessage id="confirmPassword-error" />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          aria-label={t('auth.register.registerButton')}
        >
          {t('auth.register.registerButton')}
        </Button>
        
        <div className="text-center text-sm text-muted-foreground">
          {t('auth.register.haveAccount')}{' '}
          <Link 
            href="/auth/login" 
            className="text-primary hover:underline"
            aria-label={t('auth.register.loginNow')}
          >
            {t('auth.register.loginNow')}
          </Link>
        </div>
      </form>
    </Form>
  )
}