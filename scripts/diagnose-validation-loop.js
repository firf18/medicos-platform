/**
 * Script de diagnóstico para identificar el problema del bucle infinito
 * en la validación del paso professional_info
 */

const { z } = require('zod');

// Simular el esquema exacto del archivo
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
    name: "Con campos opcionales como null",
    data: {
      documentType: 'cedula_identidad',
      documentNumber: 'V-1234567',
      university: 'Universidad Central de Venezuela (UCV)',
      medicalBoard: 'Colegio de Médicos del Distrito Federal',
      licenseNumber: null,
      licenseState: null,
      licenseExpiry: null,
      yearsOfExperience: null,
      bio: null
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
    name: "Con graduationYear como null",
    data: {
      documentType: 'cedula_identidad',
      documentNumber: 'V-1234567',
      university: 'Universidad Central de Venezuela (UCV)',
      medicalBoard: 'Colegio de Médicos del Distrito Federal',
      graduationYear: null
    }
  }
];

console.log('🔍 DIAGNÓSTICO DEL BUCLE INFINITO DE VALIDACIÓN');
console.log('================================================\n');

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

// Test específico para identificar el problema con el tipo de datos
console.log('🎯 ANÁLISIS ESPECÍFICO DE TIPOS DE DATOS');
console.log('=======================================\n');

const problematicData = {
  documentType: 'cedula_identidad',
  documentNumber: 'V-1234567',
  university: 'Universidad Central de Venezuela (UCV)',
  medicalBoard: 'Colegio de Médicos del Distrito Federal',
  graduationYear: undefined
};

console.log('Datos problemáticos:', JSON.stringify(problematicData, null, 2));

// Verificar cada campo individualmente
Object.keys(problematicData).forEach(field => {
  const value = problematicData[field];
  console.log(`\n🔍 Campo: ${field}`);
  console.log(`   Valor: ${JSON.stringify(value)}`);
  console.log(`   Tipo: ${typeof value}`);
  console.log(`   Es undefined: ${value === undefined}`);
  console.log(`   Es null: ${value === null}`);
  console.log(`   Es string vacío: ${value === ''}`);
});

console.log('\n🏁 DIAGNÓSTICO COMPLETADO');
