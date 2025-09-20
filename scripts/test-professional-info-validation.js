/**
 * Script de prueba para verificar la validación del paso professional_info
 * 
 * Este script simula el proceso de validación que estaba causando el bucle infinito
 */

const { z } = require('zod');

// Simular el esquema actualizado
const professionalInfoSchema = z.object({
  // Campos opcionales durante el proceso de registro
  licenseNumber: z.string()
    .min(6, 'El número de licencia debe tener al menos 6 caracteres')
    .max(20, 'El número de licencia no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'El número de licencia solo puede contener letras mayúsculas, números y guiones')
    .optional()
    .or(z.literal('')),
  
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
  
  // Información académica y profesional - REQUERIDOS
  university: z.string()
    .min(2, 'Debes seleccionar tu universidad de graduación')
    .max(100, 'La universidad no puede exceder 100 caracteres'),
  
  graduationYear: z.number()
    .min(1950, 'El año de graduación no puede ser anterior a 1950')
    .max(new Date().getFullYear(), 'El año de graduación no puede ser futuro')
    .int('El año de graduación debe ser un número entero')
    .optional(),
  
  medicalBoard: z.string()
    .min(2, 'Debes seleccionar tu colegio médico')
    .max(100, 'El colegio médico no puede exceder 100 caracteres'),
  
  bio: z.string()
    .min(100, 'La biografía debe tener al menos 100 caracteres')
    .max(1000, 'La biografía no puede exceder 1000 caracteres')
    .refine((bio) => {
      if (!bio || bio === '') return true; // Permitir vacío durante el proceso
      // Verificar que no contenga información personal inapropiada
      const inappropriateWords = ['teléfono', 'dirección', 'email personal', 'casa'];
      return !inappropriateWords.some(word => bio.toLowerCase().includes(word));
    }, 'La biografía no debe contener información de contacto personal')
    .optional()
    .or(z.literal('')),
  
  // Validación de documento - REQUERIDOS para el paso professional_info
  documentType: z.enum(['cedula_identidad', 'cedula_extranjera'])
    .refine((type) => type !== undefined, 'Debes seleccionar un tipo de documento'),
  
  documentNumber: z.string()
    .min(6, 'El número de documento debe tener al menos 6 caracteres')
    .max(30, 'El número de documento no puede exceder 30 caracteres')
    .refine((value) => {
      // Esta validación se hará en el componente con el contexto completo
      return true;
    }, 'Formato de documento inválido para el tipo seleccionado')
});

console.log('🧪 Probando validación del paso professional_info...\n');

// Caso 1: Datos mínimos requeridos (debería pasar)
console.log('📋 Caso 1: Datos mínimos requeridos');
const minimalData = {
  university: 'Universidad Central de Venezuela (UCV)',
  medicalBoard: 'Colegio de Médicos del Distrito Federal',
  documentType: 'cedula_identidad',
  documentNumber: 'V-13266929'
};

try {
  const result1 = professionalInfoSchema.parse(minimalData);
  console.log('✅ Validación exitosa:', Object.keys(result1));
} catch (error) {
  console.log('❌ Error de validación:', error.errors?.map(e => e.message) || error.message);
}

// Caso 2: Datos completos (debería pasar)
console.log('\n📋 Caso 2: Datos completos');
const completeData = {
  licenseNumber: 'LIC123456',
  licenseState: 'Distrito Capital',
  licenseExpiry: '2025-12-31',
  yearsOfExperience: 5,
  university: 'Universidad Central de Venezuela (UCV)',
  graduationYear: 2019,
  medicalBoard: 'Colegio de Médicos del Distrito Federal',
  bio: 'Médico cirujano con experiencia en medicina general y atención primaria. Especializado en el manejo de pacientes con enfermedades crónicas.',
  documentType: 'cedula_identidad',
  documentNumber: 'V-13266929'
};

try {
  const result2 = professionalInfoSchema.parse(completeData);
  console.log('✅ Validación exitosa:', Object.keys(result2));
} catch (error) {
  console.log('❌ Error de validación:', error.errors?.map(e => e.message) || error.message);
}

// Caso 3: Datos faltantes (debería fallar solo en campos requeridos)
console.log('\n📋 Caso 3: Datos faltantes');
const incompleteData = {
  university: '', // Campo requerido vacío
  medicalBoard: 'Colegio de Médicos del Distrito Federal',
  documentType: 'cedula_identidad',
  documentNumber: 'V-13266929'
};

try {
  const result3 = professionalInfoSchema.parse(incompleteData);
  console.log('✅ Validación exitosa:', Object.keys(result3));
} catch (error) {
  console.log('❌ Error de validación (esperado):', error.errors?.map(e => e.message) || error.message);
}

// Caso 4: Datos con campos opcionales vacíos (debería pasar)
console.log('\n📋 Caso 4: Campos opcionales vacíos');
const optionalEmptyData = {
  licenseNumber: '',
  licenseState: '',
  licenseExpiry: '',
  bio: '',
  university: 'Universidad Central de Venezuela (UCV)',
  medicalBoard: 'Colegio de Médicos del Distrito Federal',
  documentType: 'cedula_identidad',
  documentNumber: 'V-13266929'
};

try {
  const result4 = professionalInfoSchema.parse(optionalEmptyData);
  console.log('✅ Validación exitosa:', Object.keys(result4));
} catch (error) {
  console.log('❌ Error de validación:', error.errors?.map(e => e.message) || error.message);
}

console.log('\n🎯 Resumen:');
console.log('- Los campos requeridos son: university, medicalBoard, documentType, documentNumber');
console.log('- Los campos opcionales pueden estar vacíos durante el proceso de registro');
console.log('- Esto debería resolver el bucle infinito de validación');
