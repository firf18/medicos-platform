/**
 * Pharmacy Validation Schema - Red-Salud Platform
 * 
 * Validaciones específicas para el registro y gestión de farmacias.
 * Cumple con las regulaciones mexicanas COFEPRIS y HIPAA.
 */

import { z } from 'zod';
import { MexicanState, PharmacyLicenseType, PharmacyBusinessType, PharmacyServiceType, PharmacyDocumentType } from '@/types/database/pharmacies.types';

// Validaciones básicas
const phoneRegex = /^(?:\+52\s?)?(?:\d{2,3}\s?)?(?:\d{3,4}\s?\d{4}|\d{10})$/;
const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}(?:[A-Z\d]{3})?$/;
const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/;
const postalCodeRegex = /^\d{5}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Estados mexicanos válidos
const mexicanStates: MexicanState[] = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Ciudad de México', 'Durango',
  'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán',
  'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro',
  'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco',
  'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

// Esquema para horarios de trabajo
export const workingHoursSchema = z.object({
  monday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    isOpen: z.boolean()
  }),
  tuesday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    isOpen: z.boolean()
  }),
  wednesday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    isOpen: z.boolean()
  }),
  thursday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    isOpen: z.boolean()
  }),
  friday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    isOpen: z.boolean()
  }),
  saturday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    isOpen: z.boolean()
  }),
  sunday: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
    isOpen: z.boolean()
  })
}).refine((data) => {
  // Validar que al menos un día esté abierto
  const anyDayOpen = Object.values(data).some(day => day.isOpen);
  return anyDayOpen;
}, {
  message: "La farmacia debe estar abierta al menos un día de la semana"
});

// Esquema para información básica de farmacia
export const pharmacyBasicInfoSchema = z.object({
  pharmacyName: z.string()
    .min(3, 'El nombre de la farmacia debe tener al menos 3 caracteres')
    .max(100, 'El nombre de la farmacia no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-\.&0-9]+$/, 'El nombre contiene caracteres no válidos'),
  
  commercialName: z.string()
    .max(100, 'El nombre comercial no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-\.&0-9]*$/, 'El nombre comercial contiene caracteres no válidos')
    .optional(),
  
  email: z.string()
    .email('El email no tiene un formato válido')
    .max(255, 'El email es demasiado largo'),
  
  phone: z.string()
    .regex(phoneRegex, 'El número de teléfono no tiene un formato válido')
    .transform(val => val.replace(/\s/g, '')), // Remover espacios
  
  secondaryPhone: z.string()
    .regex(phoneRegex, 'El número de teléfono secundario no tiene un formato válido')
    .transform(val => val.replace(/\s/g, ''))
    .optional()
    .or(z.literal('')),
  
  website: z.string()
    .url('La URL del sitio web no es válida')
    .optional()
    .or(z.literal(''))
});

// Esquema para información legal
export const pharmacyLegalInfoSchema = z.object({
  rfc: z.string()
    .regex(rfcRegex, 'El RFC no tiene un formato válido')
    .optional()
    .or(z.literal('')),
  
  curp: z.string()
    .regex(curpRegex, 'El CURP no tiene un formato válido')
    .optional()
    .or(z.literal('')),
  
  licenseNumber: z.string()
    .min(5, 'El número de licencia debe tener al menos 5 caracteres')
    .max(50, 'El número de licencia no puede exceder 50 caracteres'),
  
  licenseType: z.enum(['farmacia', 'farmacia_hospitalaria', 'farmacia_veterinaria', 'botica'] as const),
  
  licenseIssuer: z.string()
    .min(3, 'El emisor de la licencia debe tener al menos 3 caracteres')
    .max(100, 'El emisor de la licencia no puede exceder 100 caracteres'),
  
  licenseExpiryDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD')
    .refine((date) => {
      const expiryDate = new Date(date);
      const today = new Date();
      return expiryDate > today;
    }, 'La fecha de expiración debe ser futura'),
  
  cofeprisRegistration: z.string()
    .max(50, 'El registro COFEPRIS no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  
  sanitaryPermit: z.string()
    .max(50, 'El permiso sanitario no puede exceder 50 caracteres')
    .optional()
    .or(z.literal(''))
});

// Esquema para información comercial
export const pharmacyBusinessInfoSchema = z.object({
  businessType: z.enum(['individual', 'corporation', 'partnership', 'cooperative'] as const),
  
  taxRegime: z.string()
    .min(10, 'El régimen fiscal debe tener al menos 10 caracteres')
    .max(100, 'El régimen fiscal no puede exceder 100 caracteres')
});

// Esquema para dirección
export const pharmacyAddressSchema = z.object({
  address: z.string()
    .min(10, 'La dirección debe tener al menos 10 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  
  city: z.string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(100, 'La ciudad no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-\.]+$/, 'La ciudad contiene caracteres no válidos'),
  
  state: z.enum(mexicanStates as [MexicanState, ...MexicanState[]]),
  
  postalCode: z.string()
    .regex(postalCodeRegex, 'El código postal debe tener 5 dígitos')
});

// Esquema para servicios
export const pharmacyServicesSchema = z.object({
  businessHours: workingHoursSchema,
  
  services: z.array(z.string())
    .min(1, 'Debe seleccionar al menos un servicio')
    .max(20, 'No puede seleccionar más de 20 servicios'),
  
  specialties: z.array(z.string())
    .max(10, 'No puede seleccionar más de 10 especialidades')
    .optional()
    .default([])
});

// Esquema para documentos
export const pharmacyDocumentSchema = z.object({
  name: z.string()
    .min(3, 'El nombre del documento debe tener al menos 3 caracteres')
    .max(100, 'El nombre del documento no puede exceder 100 caracteres'),
  
  type: z.enum(['license', 'permit', 'insurance', 'certificate', 'contract', 'other'] as const),
  
  file: z.instanceof(File, 'Debe seleccionar un archivo')
    .refine((file) => file.size <= 10 * 1024 * 1024, 'El archivo no puede exceder 10MB')
    .refine(
      (file) => ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
      'Solo se permiten archivos PDF, JPG, JPEG y PNG'
    )
});

export const pharmacyDocumentsSchema = z.object({
  documents: z.array(pharmacyDocumentSchema)
    .min(1, 'Debe cargar al menos un documento')
    .max(20, 'No puede cargar más de 20 documentos')
});

// Esquema para términos y condiciones
export const pharmacyTermsSchema = z.object({
  acceptTerms: z.boolean()
    .refine(val => val === true, 'Debe aceptar los términos y condiciones'),
  
  acceptPrivacyPolicy: z.boolean()
    .refine(val => val === true, 'Debe aceptar la política de privacidad'),
  
  acceptDataProcessing: z.boolean()
    .refine(val => val === true, 'Debe aceptar el procesamiento de datos personales')
});

// Esquema completo para registro de farmacia
export const pharmacyRegistrationSchema = z.object({
  // Paso 1: Información básica
  ...pharmacyBasicInfoSchema.shape,
  
  // Paso 2: Información legal
  ...pharmacyLegalInfoSchema.shape,
  
  // Paso 3: Información comercial
  ...pharmacyBusinessInfoSchema.shape,
  
  // Paso 4: Dirección
  ...pharmacyAddressSchema.shape,
  
  // Paso 5: Servicios y horarios
  ...pharmacyServicesSchema.shape,
  
  // Paso 6: Documentos
  ...pharmacyDocumentsSchema.shape,
  
  // Paso 7: Términos y condiciones
  ...pharmacyTermsSchema.shape
});

// Esquemas para pasos individuales
export const pharmacyStepSchemas = {
  1: pharmacyBasicInfoSchema,
  2: pharmacyLegalInfoSchema,
  3: pharmacyBusinessInfoSchema,
  4: pharmacyAddressSchema,
  5: pharmacyServicesSchema,
  6: pharmacyDocumentsSchema,
  7: pharmacyTermsSchema
};

// Esquema para actualización de farmacia
export const pharmacyUpdateSchema = pharmacyRegistrationSchema.partial().omit({
  documents: true,
  acceptTerms: true,
  acceptPrivacyPolicy: true,
  acceptDataProcessing: true
});

// Esquema para personal de farmacia
export const pharmacyStaffSchema = z.object({
  firstName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, 'El nombre solo puede contener letras'),
  
  lastName: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, 'El apellido solo puede contener letras'),
  
  email: z.string()
    .email('El email no tiene un formato válido')
    .max(255, 'El email es demasiado largo'),
  
  phone: z.string()
    .regex(phoneRegex, 'El número de teléfono no tiene un formato válido')
    .optional(),
  
  role: z.enum(['pharmacist', 'pharmacy_technician', 'manager', 'cashier', 'intern'] as const),
  
  licenseNumber: z.string()
    .max(50, 'El número de licencia no puede exceder 50 caracteres')
    .optional(),
  
  licenseType: z.enum(['quimico_farmaceutico', 'farmaceutico_clinico', 'tecnico_farmaceutico'] as const)
    .optional(),
  
  hireDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD'),
  
  workingHours: workingHoursSchema,
  
  canDispensePrescriptions: z.boolean().default(false),
  canManageInventory: z.boolean().default(false),
  canAccessReports: z.boolean().default(false)
});

// Esquema para inventario de farmacia
export const pharmacyInventorySchema = z.object({
  productName: z.string()
    .min(3, 'El nombre del producto debe tener al menos 3 caracteres')
    .max(200, 'El nombre del producto no puede exceder 200 caracteres'),
  
  genericName: z.string()
    .max(200, 'El nombre genérico no puede exceder 200 caracteres')
    .optional(),
  
  brandName: z.string()
    .max(200, 'El nombre de marca no puede exceder 200 caracteres')
    .optional(),
  
  dosageForm: z.string()
    .min(3, 'La forma farmacéutica debe tener al menos 3 caracteres')
    .max(50, 'La forma farmacéutica no puede exceder 50 caracteres'),
  
  strength: z.string()
    .min(1, 'La concentración es requerida')
    .max(50, 'La concentración no puede exceder 50 caracteres'),
  
  unit: z.string()
    .min(1, 'La unidad es requerida')
    .max(20, 'La unidad no puede exceder 20 caracteres'),
  
  registrationNumber: z.string()
    .max(50, 'El número de registro no puede exceder 50 caracteres')
    .optional(),
  
  batchNumber: z.string()
    .max(50, 'El número de lote no puede exceder 50 caracteres')
    .optional(),
  
  expirationDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD')
    .refine((date) => {
      const expiryDate = new Date(date);
      const today = new Date();
      return expiryDate > today;
    }, 'La fecha de expiración debe ser futura'),
  
  currentStock: z.number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
  
  minimumStock: z.number()
    .int('El stock mínimo debe ser un número entero')
    .min(0, 'El stock mínimo no puede ser negativo'),
  
  maximumStock: z.number()
    .int('El stock máximo debe ser un número entero')
    .min(0, 'El stock máximo no puede ser negativo')
    .optional(),
  
  unitCost: z.number()
    .min(0, 'El costo unitario no puede ser negativo')
    .optional(),
  
  sellingPrice: z.number()
    .min(0, 'El precio de venta no puede ser negativo')
    .optional(),
  
  drugCategory: z.enum(['prescription', 'otc', 'controlled_substance'] as const),
  
  controlledSubstanceSchedule: z.string()
    .max(10, 'La clasificación de sustancia controlada no puede exceder 10 caracteres')
    .optional(),
  
  requiresPrescription: z.boolean().default(true),
  
  supplierName: z.string()
    .max(100, 'El nombre del proveedor no puede exceder 100 caracteres')
    .optional(),
  
  supplierContact: z.string()
    .max(200, 'El contacto del proveedor no puede exceder 200 caracteres')
    .optional()
});

// Tipos derivados de los esquemas
export type PharmacyBasicInfo = z.infer<typeof pharmacyBasicInfoSchema>;
export type PharmacyLegalInfo = z.infer<typeof pharmacyLegalInfoSchema>;
export type PharmacyBusinessInfo = z.infer<typeof pharmacyBusinessInfoSchema>;
export type PharmacyAddress = z.infer<typeof pharmacyAddressSchema>;
export type PharmacyServices = z.infer<typeof pharmacyServicesSchema>;
export type PharmacyDocuments = z.infer<typeof pharmacyDocumentsSchema>;
export type PharmacyTerms = z.infer<typeof pharmacyTermsSchema>;
export type PharmacyRegistration = z.infer<typeof pharmacyRegistrationSchema>;
export type PharmacyUpdate = z.infer<typeof pharmacyUpdateSchema>;
export type PharmacyStaff = z.infer<typeof pharmacyStaffSchema>;
export type PharmacyInventory = z.infer<typeof pharmacyInventorySchema>;
export type WorkingHours = z.infer<typeof workingHoursSchema>;

// Funciones de validación personalizadas
export function validateRFC(rfc: string): boolean {
  return rfcRegex.test(rfc);
}

export function validateCURP(curp: string): boolean {
  return curpRegex.test(curp);
}

export function validatePhoneNumber(phone: string): boolean {
  return phoneRegex.test(phone);
}

export function validateEmail(email: string): boolean {
  return emailRegex.test(email);
}

export function validatePostalCode(postalCode: string): boolean {
  return postalCodeRegex.test(postalCode);
}

export function validateLicenseExpiry(date: string): boolean {
  const expiryDate = new Date(date);
  const today = new Date();
  return expiryDate > today;
}

export function validateBusinessHours(hours: WorkingHours): boolean {
  // Verificar que al menos un día esté abierto
  const anyDayOpen = Object.values(hours).some(day => day.isOpen);
  if (!anyDayOpen) return false;
  
  // Verificar que las horas de apertura sean antes que las de cierre
  for (const day of Object.values(hours)) {
    if (day.isOpen) {
      const openTime = new Date(`2000-01-01T${day.open}:00`);
      const closeTime = new Date(`2000-01-01T${day.close}:00`);
      if (openTime >= closeTime) return false;
    }
  }
  
  return true;
}

// Mensajes de error personalizados
export const pharmacyValidationMessages = {
  required: 'Este campo es requerido',
  invalidEmail: 'El email no tiene un formato válido',
  invalidPhone: 'El número de teléfono no tiene un formato válido',
  invalidRFC: 'El RFC no tiene un formato válido',
  invalidCURP: 'El CURP no tiene un formato válido',
  invalidPostalCode: 'El código postal debe tener 5 dígitos',
  invalidDate: 'La fecha no tiene un formato válido',
  futureDateRequired: 'La fecha debe ser futura',
  minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
  maxLength: (max: number) => `No puede exceder ${max} caracteres`,
  invalidCharacters: 'Contiene caracteres no válidos',
  atLeastOneService: 'Debe seleccionar al menos un servicio',
  atLeastOneDocument: 'Debe cargar al menos un documento',
  acceptTermsRequired: 'Debe aceptar los términos y condiciones',
  acceptPrivacyRequired: 'Debe aceptar la política de privacidad',
  acceptDataProcessingRequired: 'Debe aceptar el procesamiento de datos personales',
  fileTooBig: 'El archivo no puede exceder 10MB',
  invalidFileType: 'Solo se permiten archivos PDF, JPG, JPEG y PNG',
  atLeastOneDayOpen: 'La farmacia debe estar abierta al menos un día de la semana',
  invalidBusinessHours: 'La hora de apertura debe ser antes que la hora de cierre'
};
