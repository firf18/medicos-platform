/**
 * Tipos y interfaces para el módulo de documentos médicos
 * Separado para mejorar la mantenibilidad y reutilización
 */

export interface MedicalDocument {
  id: string;
  document_type: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  tags: string[];
  is_critical: boolean;
  shared_with_caregivers: boolean;
  created_at: string;
  doctor_name?: string;
}

export interface DocumentsSectionProps {
  userId: string;
}

export interface DocumentFilters {
  searchTerm: string;
  filterType: string;
}

export interface DocumentActions {
  onDownload: (document: MedicalDocument) => void;
  onShare: (document: MedicalDocument) => void;
  onView: (document: MedicalDocument) => void;
}

export const DOCUMENT_TYPES = {
  'lab_result': 'Resultado de Laboratorio',
  'prescription': 'Receta Médica', 
  'report': 'Informe Médico',
  'image': 'Imagen Médica',
  'certificate': 'Certificado Médico',
  'consent': 'Consentimiento Informado',
  'insurance': 'Documento de Seguro',
  'other': 'Otro'
} as const;

export type DocumentType = keyof typeof DOCUMENT_TYPES;