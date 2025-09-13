import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'El correo electrónico es requerido')
  .email('Ingresa un correo electrónico válido');

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número'
  );

export const confirmPasswordSchema = z.string().min(1, 'Confirma tu contraseña');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    firstName: z.string().min(1, 'El nombre es requerido'),
    lastName: z.string().min(1, 'El apellido es requerido'),
    role: z.enum(['patient', 'doctor']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// Nuevas validaciones para perfiles de usuario
export const profileSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

// Validaciones para datos médicos
export const medicalRecordSchema = z.object({
  diagnosis: z.string().min(1, 'El diagnóstico es requerido'),
  treatment: z.string().optional(),
  notes: z.string().optional(),
});

// Validaciones para citas
export const appointmentSchema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  time: z.string().min(1, 'La hora es requerida'),
  reason: z.string().min(1, 'El motivo es requerido'),
  doctorId: z.string().min(1, 'El médico es requerido'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;