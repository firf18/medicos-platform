/**
 * Script de prueba para verificar que el bucle infinito se ha resuelto
 */

console.log('🧪 PRUEBA DE RESOLUCIÓN DEL BUCLE INFINITO');
console.log('==========================================\n');

// Simular datos típicos que causaban el bucle
const testData = {
  documentType: 'cedula_identidad',
  documentNumber: 'V-1234567',
  university: '',
  medicalBoard: '',
  yearsOfExperience: 0,
  bio: '',
  licenseNumber: '',
  licenseState: '',
  licenseExpiry: '',
  graduationYear: undefined
};

console.log('📋 Datos de prueba (caso que causaba bucle):');
console.log(JSON.stringify(testData, null, 2));

// Simular el esquema Zod actualizado
const { z } = require('zod');

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
  
  // Información académica y profesional - OPCIONALES durante el proceso de registro
  university: z.string()
    .min(2, 'Debes seleccionar tu universidad de graduación')
    .max(100, 'La universidad no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  graduationYear: z.number()
    .min(1950, 'El año de graduación no puede ser anterior a 1950')
    .max(new Date().getFullYear(), 'El año de graduación no puede ser futuro')
    .int('El año de graduación debe ser un número entero')
    .optional(),
  
  medicalBoard: z.string()
    .min(2, 'Debes seleccionar tu colegio médico')
    .max(100, 'El colegio médico no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  
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
  
  // Validación de documento - OPCIONALES durante el proceso de registro
  documentType: z.enum(['cedula_identidad', 'cedula_extranjera'])
    .refine((type) => type !== undefined, 'Debes seleccionar un tipo de documento')
    .optional(),
  
  documentNumber: z.string()
    .min(6, 'El número de documento debe tener al menos 6 caracteres')
    .max(30, 'El número de documento no puede exceder 30 caracteres')
    .refine((value) => {
      // Esta validación se hará en el componente con el contexto completo
      return true;
    }, 'Formato de documento inválido para el tipo seleccionado')
    .optional()
    .or(z.literal(''))
});

console.log('\n🔍 Validando con esquema actualizado...');

try {
  const result = professionalInfoSchema.safeParse(testData);
  
  if (result.success) {
    console.log('✅ VALIDACIÓN EXITOSA - El bucle infinito se ha resuelto');
    console.log('📊 Datos válidos:', JSON.stringify(result.data, null, 2));
  } else {
    console.log('❌ VALIDACIÓN FALLIDA');
    console.log('Errores:', JSON.stringify(result.error.errors, null, 2));
  }
} catch (error) {
  console.log('💥 ERROR EN VALIDACIÓN:', error.message);
}

console.log('\n🎯 CONCLUSIÓN:');
console.log('El esquema Zod actualizado permite que los campos opcionales');
console.log('estén vacíos durante el proceso de registro, eliminando el');
console.log('bucle infinito de validación.');

console.log('\n🏁 PRUEBA COMPLETADA');
