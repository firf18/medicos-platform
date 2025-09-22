/**
 * Professional Info Validations - Red-Salud Platform
 * 
 * Validaciones específicas para información profesional de médicos.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import { z } from 'zod';

// ============================================================================
// VALIDACIONES DE INFORMACIÓN PROFESIONAL
// ============================================================================

export const professionalInfoSchema = z.object({
  // licenseNumber eliminado - ahora se obtiene automáticamente de SACS durante verificación
  // El número de licencia MPPS se extrae automáticamente del scraping SACS
  
  licenseState: z.string()
    .min(2, 'Debe seleccionar un estado')
    .max(50, 'El estado no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  
  licenseExpiry: z.string()
    .refine((date) => {
      if (!date || date === '') return true; // Permitir vacío durante el proceso
      const expiryDate = new Date(date);
      const today = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);
      
      return expiryDate > today && expiryDate <= oneYearFromNow;
    }, 'La licencia debe estar vigente y no expirar en más de un año')
    .optional()
    .or(z.literal('')),
  
  yearsOfExperience: z.number()
    .min(0, 'Los años de experiencia no pueden ser negativos')
    .max(60, 'Los años de experiencia no pueden exceder 60 años')
    .int('Los años de experiencia deben ser un número entero')
    .optional(),
  
  // Información académica y profesional - OPCIONALES durante el proceso de registro
  university: z.string()
    .min(1, 'Debes seleccionar tu universidad de graduación')
    .max(100, 'La universidad no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  graduationYear: z.string()
    .regex(/^(\d{2})\/(\d{2})\/(\d{4})$/, 'La fecha debe tener el formato dd/mm/yyyy')
    .refine((dateStr) => {
      if (!dateStr || dateStr === '') return true; // Permitir vacío durante el proceso
      const [, day, month, year] = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/) || [];
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      return dayNum >= 1 && dayNum <= 31 && 
             monthNum >= 1 && monthNum <= 12 && 
             yearNum >= 1950 && yearNum <= new Date().getFullYear();
    }, 'Fecha de graduación inválida. Debe ser entre 1950 y el año actual')
    .optional()
    .or(z.literal('')),
  
  medicalBoard: z.string()
    .min(1, 'Debes seleccionar tu colegio médico')
    .max(100, 'El colegio médico no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  bio: z.string()
    .min(50, 'La biografía debe tener al menos 50 caracteres') // Reducido de 100 a 50
    .max(1000, 'La biografía no puede exceder 1000 caracteres')
    .refine((bio) => {
      if (!bio || bio === '') return true; // Permitir vacío durante el proceso
      // Verificar que no contenga información personal inapropiada
      const inappropriateWords = ['teléfono', 'dirección', 'email personal', 'casa'];
      return !inappropriateWords.some(word => bio.toLowerCase().includes(word));
    }, 'La biografía no debe contener información de contacto personal')
    .optional()
    .or(z.literal('')),
  
  // Validación de documento - OPCIONALES durante el proceso de registro
  documentType: z.enum(['cedula_identidad', 'cedula_extranjera'])
    .refine((type) => type !== undefined, 'Debes seleccionar un tipo de documento')
    .optional(),
  
  documentNumber: z.string()
    .min(6, 'El número de documento debe tener al menos 6 caracteres')
    .max(30, 'El número de documento no puede exceder 30 caracteres')
    .optional()
    .or(z.literal(''))
});

// ============================================================================
// VALIDACIONES ESPECÍFICAS PROFESIONALES
// ============================================================================

/**
 * Tipos de colegios médicos venezolanos
 */
export const VENEZUELAN_MEDICAL_BOARDS = [
  'MPPS', // Ministerio del Poder Popular para la Salud
  'CMC', // Colegio de Médicos de Caracas
  'CMDM', // Colegio de Médicos del Estado Miranda
  'CMDC', // Colegio de Médicos de Carabobo
  'CMDT', // Colegio de Médicos del Estado Táchira
  'CMDZ', // Colegio de Médicos del Zulia
  'CMDA', // Colegio de Médicos de Anzoátegui
  'CMDB', // Colegio de Médicos de Bolívar
  'CMDL', // Colegio de Médicos de Lara
] as const;

/**
 * Valida si un número de licencia médica es único en el sistema
 */
export async function validateUniqueLicenseNumber(licenseNumber: string): Promise<{ isValid: boolean; error?: string }> {
  try {
    // TODO: Implementar validación con Supabase
    // const { data, error } = await supabase
    //   .from('doctors')
    //   .select('license_number')
    //   .eq('license_number', licenseNumber)
    //   .single();
    
    // Por ahora retorna true para desarrollo
    return { isValid: true };
  } catch (error) {
    console.error('Error validando número de licencia:', error);
    return { 
      isValid: false, 
      error: 'Error al verificar la disponibilidad del número de licencia' 
    };
  }
}

/**
 * Valida el formato del documento según su tipo
 */
export function validateDocumentFormat(documentType: string, documentNumber: string): { isValid: boolean; error?: string } {
  switch (documentType) {
    case 'cedula_identidad':
      // Formato: V-XXXXXXXX o E-XXXXXXXX
      if (!/^[VE]-\d{7,8}$/.test(documentNumber)) {
        return {
          isValid: false,
          error: 'La cédula debe tener el formato V-XXXXXXXX o E-XXXXXXXX'
        };
      }
      break;
    
    case 'cedula_extranjera':
      // Formato: E-XXXXXXXX (para extranjeros)
      if (!/^E-\d{7,8}$/.test(documentNumber)) {
        return {
          isValid: false,
          error: 'La cédula extranjera debe tener el formato E-XXXXXXXX'
        };
      }
      break;
    
    case 'matricula':
      // Formato: MPPS-XXXXX o CMC-XXXXX u otros colegios médicos
      const medicalBoardRegex = new RegExp(
        `^(${VENEZUELAN_MEDICAL_BOARDS.join('|')})-\\d{4,6}$`,
        'i'
      );
      if (!medicalBoardRegex.test(documentNumber)) {
        return {
          isValid: false,
          error: 'La matrícula debe tener el formato COLEGIO-NUMERO (ej: MPPS-12345)'
        };
      }
      break;
    
    default:
      return {
        isValid: false,
        error: 'Tipo de documento no válido'
      };
  }
  
  return { isValid: true };
}

/**
 * Valida la coherencia entre años de graduación y experiencia
 */
export function validateGraduationExperience(graduationYear: number, yearsOfExperience: number): { isValid: boolean; error?: string } {
  const currentYear = new Date().getFullYear();
  const yearsSinceGraduation = currentYear - graduationYear;
  
  if (yearsOfExperience > yearsSinceGraduation) {
    return {
      isValid: false,
      error: `Los años de experiencia (${yearsOfExperience}) no pueden ser mayores a los años desde la graduación (${yearsSinceGraduation})`
    };
  }
  
  return { isValid: true };
}

/**
 * Valida que la biografía profesional sea apropiada
 */
export function validateProfessionalBio(bio: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (bio.length < 100) {
    errors.push('La biografía debe tener al menos 100 caracteres');
  }
  
  if (bio.length > 1000) {
    errors.push('La biografía no puede exceder 1000 caracteres');
  }
  
  // Verificar que no contenga información personal inapropiada
  const inappropriateWords = [
    'teléfono', 'telefono', 'phone', 'celular',
    'dirección', 'direccion', 'address', 'casa',
    'email personal', 'correo personal', 'gmail', 'hotmail',
    'whatsapp', 'instagram', 'facebook', 'twitter'
  ];
  
  const foundInappropriate = inappropriateWords.filter(word => 
    bio.toLowerCase().includes(word.toLowerCase())
  );
  
  if (foundInappropriate.length > 0) {
    errors.push(`La biografía no debe contener información de contacto personal: ${foundInappropriate.join(', ')}`);
  }
  
  // Verificar que contenga información profesional relevante
  const professionalKeywords = [
    'medicina', 'medico', 'doctor', 'especialista', 'experiencia',
    'hospital', 'clinica', 'paciente', 'tratamiento', 'consulta',
    'diagnostico', 'salud', 'atencion', 'cuidado'
  ];
  
  const foundProfessional = professionalKeywords.some(keyword => 
    bio.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (!foundProfessional) {
    errors.push('La biografía debe incluir información relevante sobre tu experiencia médica y profesional');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida el rango de años de experiencia por especialidad
 */
export function validateExperienceBySpecialty(specialtyId: string, yearsOfExperience: number): { isValid: boolean; error?: string } {
  // Especialidades que requieren más experiencia
  const highExperienceSpecialties = [
    'cardiology', 'neurology', 'oncology', 'surgery',
    'neurosurgery', 'cardiac_surgery', 'transplant_surgery'
  ];
  
  // Especialidades que pueden ser practicadas con menos experiencia
  const lowExperienceSpecialties = [
    'general_medicine', 'family_medicine', 'internal_medicine',
    'pediatrics', 'dermatology', 'ophthalmology'
  ];
  
  if (highExperienceSpecialties.includes(specialtyId) && yearsOfExperience < 5) {
    return {
      isValid: false,
      error: 'Esta especialidad requiere al menos 5 años de experiencia médica'
    };
  }
  
  if (yearsOfExperience < 1 && !lowExperienceSpecialties.includes(specialtyId)) {
    return {
      isValid: false,
      error: 'Se requiere al menos 1 año de experiencia médica'
    };
  }
  
  return { isValid: true };
}

// ============================================================================
// TIPOS EXPORTADOS
// ============================================================================

export type ProfessionalInfoValidation = z.infer<typeof professionalInfoSchema>;
export type VenezuelanMedicalBoard = typeof VENEZUELAN_MEDICAL_BOARDS[number];
