import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { Share } from 'lucide-react';

interface MedicalDocument {
  id: string;
  document_type: string;
  title: string;
  description: string;
  file_url: string;
  file_size: number;
  file_type: string;
  tags: string[];
  is_critical: boolean;
  shared_with_caregivers: boolean;
  created_at: string;
  updated_at: string;
  doctor_name: string;
}

interface FilterOptions {
  searchTerm: string;
  documentType: string;
  dateRange: string | null;
  isCritical: boolean;
}

interface DocumentsSectionProps {
  userId: string;
}

const getDocumentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    lab_result: 'Resultado de Laboratorio',
    prescription: 'Receta Médica',
    report: 'Informe Médico',
    image: 'Imagen Médica',
    certificate: 'Certificado',
    consent: 'Consentimiento',
    insurance: 'Seguro',
    other: 'Otro'
  };
  return labels[type] || type;
};

const downloadDocument = (document: MedicalDocument) => {
  if (document.file_url) {
    window.open(document.file_url, '_blank');
  }
};

const filterDocuments = (documents: MedicalDocument[], filters: FilterOptions): MedicalDocument[] => {
  return documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesType = filters.documentType === 'all' || doc.document_type === filters.documentType;
    const matchesCritical = !filters.isCritical || doc.is_critical;
    
    return matchesSearch && matchesType && matchesCritical;
  });
};

export function DocumentsSection({ userId }: DocumentsSectionProps) {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<MedicalDocument | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    documentType: 'all',
    dateRange: null,
    isCritical: false
  });
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchDocuments();
  }, [userId]);

  // Filtrar documentos según los filtros seleccionados
  useEffect(() => {
    const results = filterDocuments(documents, filters);
    setFilteredDocuments(results);
  }, [documents, filters]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('medical_documents')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDocuments = data?.map(doc => ({
        id: doc.id, 
        document_type: doc.document_type,
        title: doc.title,
        description: doc.description || '',
        file_url: doc.file_url || '',
        file_size: doc.file_size || 0,
        file_type: doc.file_type || 'pdf',
        tags: doc.tags || [],
        is_critical: doc.is_critical || false,
        shared_with_caregivers: doc.shared_with_caregivers || false,
        created_at: doc.created_at,
        updated_at: doc.updated_at || doc.created_at,
        doctor_name: doc.doctor_name || 'Dr. García Martínez'
      })) || [];

      setDocuments(formattedDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = (document: MedicalDocument) => {
    setSelectedDocument(document);
  };

  const handleCloseModal = () => {
    setSelectedDocument(null);
  };

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Obtener tipos de documento únicos para el filtro
  const documentTypes = documents.length > 0 
    ? [...new Set(documents.map(doc => doc.document_type))] 
    : ['lab_result', 'prescription', 'report', 'image', 'certificate', 'consent', 'insurance', 'other'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-64"></div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Documentos</h1>
            <p className="text-gray-600 mt-1">
              Gestiona todos tus documentos médicos en un solo lugar
            </p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <CloudArrowUpIcon className="w-5 h-5" />
            <span>Subir Documento</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filters.documentType}
              onChange={(e) => handleFilterChange({ documentType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los tipos</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>
                  {getDocumentTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Document List */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron documentos</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleDocumentClick(document)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{document.title}</h3>
                    <p className="text-gray-600 mt-1">{document.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{getDocumentTypeLabel(document.document_type)}</span>
                      <span>{new Date(document.created_at).toLocaleDateString()}</span>
                      <span>{document.doctor_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {document.is_critical && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                        Crítico
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle share functionality
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Share className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Document Detail Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedDocument.title}
                </h3>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tipo de Documento</label>
                    <p className="text-gray-900">{getDocumentTypeLabel(selectedDocument.document_type)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fecha de Creación</label>
                    <p className="text-gray-900">
                      {new Date(selectedDocument.created_at).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Creado por</label>
                    <p className="text-gray-900">{selectedDocument.doctor_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Estado</label>
                    <div className="flex items-center space-x-2">
                      {selectedDocument.is_critical && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          Crítico
                        </span>
                      )}
                      {selectedDocument.shared_with_caregivers && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          Compartido con confidentes
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedDocument.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Descripción</label>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">{selectedDocument.description}</p>
                  </div>
                )}
                
                {selectedDocument.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Etiquetas</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.tags.map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => downloadDocument(selectedDocument)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Descargar
                </button>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
