/**
 * Script de diagnóstico actualizado para el esquema corregido
 */

const { z } = require('zod');

// Esquema actualizado con campos opcionales
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

// Simular datos típicos que podrían estar causando el problema
const testDataSets = [
  {
    name: "Datos completamente vacíos",
    data: {}
  },
  {
    name: "Solo campos requeridos básicos",
    data: {
      documentType: 'cedula_identidad',
      documentNumber: 'V-1234567'
    }
  },
  {
    name: "Con universidad y colegio médico",
    data: {
      documentType: 'cedula_identidad',
      documentNumber: 'V-1234567',
      university: 'Universidad Central de Venezuela (UCV)',
      medicalBoard: 'Colegio de Médicos del Distrito Federal'
    }
  },
  {
    name: "Con campos opcionales como undefined",
    data: {
      documentType: 'cedula_identidad',
      documentNumber: 'V-1234567',
      university: 'Universidad Central de Venezuela (UCV)',
      medicalBoard: 'Colegio de Médicos del Distrito Federal',
      licenseNumber: undefined,
      licenseState: undefined,
      licenseExpiry: undefined,
      yearsOfExperience: undefined,
      bio: undefined
    }
  },
  {
    name: "Con campos opcionales como strings vacíos",
    data: {
      documentType: 'cedula_identidad',
      documentNumber: 'V-1234567',
      university: 'Universidad Central de Venezuela (UCV)',
      medicalBoard: 'Colegio de Médicos del Distrito Federal',
      licenseNumber: '',
      licenseState: '',
      licenseExpiry: '',
      bio: ''
    }
  },
  {
    name: "Con graduationYear como undefined",
    data: {
      documentType: 'cedula_identidad',
      documentNumber: 'V-1234567',
      university: 'Universidad Central de Venezuela (UCV)',
      medicalBoard: 'Colegio de Médicos del Distrito Federal',
      graduationYear: undefined
    }
  },
  {
    name: "Solo documentType y documentNumber (caso real del bucle)",
    data: {
      documentType: 'cedula_identidad',
      documentNumber: 'V-1234567',
      university: '',
      medicalBoard: ''
    }
  }
];

console.log('🔍 DIAGNÓSTICO DEL ESQUEMA ACTUALIZADO');
console.log('======================================\n');

testDataSets.forEach((testCase, index) => {
  console.log(`📋 Test ${index + 1}: ${testCase.name}`);
  console.log('Datos:', JSON.stringify(testCase.data, null, 2));
  
  try {
    const result = professionalInfoSchema.safeParse(testCase.data);
    
    if (result.success) {
      console.log('✅ Validación EXITOSA');
    } else {
      console.log('❌ Validación FALLIDA');
      console.log('Error completo:', JSON.stringify(result.error, null, 2));
      
      // Verificar si hay errores disponibles
      if (result.error.errors && Array.isArray(result.error.errors)) {
        console.log('Errores:', JSON.stringify(result.error.errors, null, 2));
        
        // Analizar cada error específicamente
        result.error.errors.forEach((error, i) => {
          console.log(`  Error ${i + 1}:`);
          console.log(`    Campo: ${error.path.join('.')}`);
          console.log(`    Código: ${error.code}`);
          console.log(`    Mensaje: ${error.message}`);
          console.log(`    Valor recibido: ${JSON.stringify(error.input)}`);
          console.log(`    Valor esperado: ${error.expected || 'N/A'}`);
          console.log('');
        });
      } else {
        console.log('❌ No se pudieron obtener los errores específicos');
        console.log('Estructura del error:', Object.keys(result.error));
      }
    }
  } catch (error) {
    console.log('💥 ERROR EN VALIDACIÓN:', error.message);
  }
  
  console.log('---\n');
});

console.log('🏁 DIAGNÓSTICO COMPLETADO');
