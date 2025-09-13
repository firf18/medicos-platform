'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEmailVerification } from '@/features/auth/hooks/use-email-verification'
import { useToast } from '@/hooks/use-toast'
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

const verificationSchema = z.object({
  code: z.string().min(6, 'El código de verificación debe tener 6 caracteres'),
})

type VerificationFormValues = z.infer<typeof verificationSchema>

export function EmailVerificationForm() {
  const { isLoading, verifyEmail, resendVerificationEmail } = useEmailVerification()
  const { toast } = useToast()

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: '',
    },
  })

  const onSubmit = async (data: VerificationFormValues) => {
    try {
      const result = await verifyEmail(data.code)

      if (result.success) {
        toast({
          title: '¡Email verificado!',
          description: 'Tu email ha sido verificado exitosamente.',
        })
      } else {
        toast({
          title: 'Error de verificación',
          description: (result.error as any)?.message || 'Código inválido',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      })
    }
  }

  const handleResendCode = async () => {
    try {
      // Aquí necesitaríamos obtener el email del usuario de alguna forma
      // Por ahora usamos un email de ejemplo
      const result = await resendVerificationEmail('user@example.com')

      if (result.success) {
        toast({
          title: 'Código reenviado',
          description: 'Hemos enviado un nuevo código de verificación a tu email.',
        })
      } else {
        toast({
          title: 'Error al reenviar',
          description: (result.error as any)?.message || 'Ocurrió un error al reenviar el código',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de verificación</FormLabel>
              <FormControl>
                <Input placeholder="123456" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Verificando...' : 'Verificar email'}
          </Button>
          <Button type="button" variant="link" onClick={handleResendCode} disabled={isLoading} className="w-full">
            Reenviar código
          </Button>
        </div>
      </form>
    </Form>
  )
}