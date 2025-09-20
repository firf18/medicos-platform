/**
 * Utilidades y funciones helper para el módulo de documentos
 * Separadas para mejorar la testabilidad y reutilización
 */

import { MedicalDocument, DOCUMENT_TYPES } from './types';

/**
 * Obtiene la etiqueta legible para un tipo de documento
 */
export const getDocumentTypeLabel = (type: string): string => {
  return DOCUMENT_TYPES[type as keyof typeof DOCUMENT_TYPES] || type;
};

/**
 * Obtiene el icono correspondiente para un tipo de documento
 */
export const getDocumentIcon = (type: string) => {
  switch (type) {
    case 'lab_result':
    case 'report':
      return 'DocumentTextIcon';
    case 'image':
      return 'FolderIcon';
    default:
      return 'DocumentTextIcon';
  }
};

/**
 * Formatea el tamaño de archivo en unidades legibles
 */
export const getFileSize = (bytes: number | null): string => {
  if (!bytes) return 'Tamaño desconocido';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Filtra documentos según término de búsqueda y tipo
 */
export const filterDocuments = (
  documents: MedicalDocument[], 
  searchTerm: string, 
  filterType: string
): MedicalDocument[] => {
  return documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || doc.document_type === filterType;
    
    return matchesSearch && matchesFilter;
  });
};

/**
 * Extrae tipos únicos de documentos para filtros
 */
export const getUniqueDocumentTypes = (documents: MedicalDocument[]): string[] => {
  return [...new Set(documents.map(doc => doc.document_type))];
};

/**
 * Descarga un documento (simulado o real)
 */
export const downloadDocument = (doc: MedicalDocument): void => {
  if (doc.file_url) {
    window.open(doc.file_url, '_blank');
  } else {
    // Generar documento simulado
    const content = `
DOCUMENTO MÉDICO
================

Título: ${doc.title}
Tipo: ${getDocumentTypeLabel(doc.document_type)}
Fecha: ${new Date(doc.created_at).toLocaleDateString('es-ES')}
Médico: ${doc.doctor_name}

${doc.description ? `Descripción:\n${doc.description}` : ''}

${doc.tags.length > 0 ? `Etiquetas: ${doc.tags.join(', ')}` : ''}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};