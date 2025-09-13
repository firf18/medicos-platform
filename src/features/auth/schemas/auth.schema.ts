import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const registerSchema = z
  .object({
    email: z.string().email('Email inválido').min(1, 'El email es requerido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
        'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
      ),
    confirmPassword: z.string().min(1, 'Por favor confirma tu contraseña'),
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre no puede tener más de 50 caracteres'),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(50, 'El apellido no puede tener más de 50 caracteres'),
    role: z.enum(['patient', 'doctor', 'clinic', 'laboratory']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  confirmPassword: z.string().min(1, 'Por favor confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export const resendVerificationSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>