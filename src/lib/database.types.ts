/**
 * ⚠️ DEPRECATED: Este archivo ha sido refactorizado por dominios médicos
 * 
 * Para mantener compatibilidad hacia atrás, re-exportamos los tipos desde la nueva estructura modular.
 * Los nuevos tipos están organizados por dominio médico en src/types/database/
 * 
 * @deprecated Usar imports desde src/types/database/ en lugar de este archivo
 */

// Re-exportar todos los tipos desde la nueva estructura modular
export * from '@/types/database';

// Mantener compatibilidad con el tipo Database original
export type {
  CompleteMedicalDatabase as Database,
  Json,
  AllDatabaseTables,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes
} from '@/types/database';