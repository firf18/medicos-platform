'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  DocumentTextIcon, 
  FolderIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

interface DocumentsSectionProps {
  userId: string;
}

interface MedicalDocument {
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

export function DocumentsSection({ userId }: DocumentsSectionProps) {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<MedicalDocument | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchDocuments();
  }, [userId]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_documents')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDocuments = data?.map(doc => ({
        ...doc,
        doctor_name: 'Dr. García Martínez' // Mock data for now
      })) || [];

      setDocuments(formattedDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const types = {
      'lab_result': 'Resultado de Laboratorio',
      'prescription': 'Receta Médica',
      'report': 'Informe Médico',
      'image': 'Imagen Médica',
      'certificate': 'Certificado Médico',
      'consent': 'Consentimiento Informado',
      'insurance': 'Documento de Seguro',
      'other': 'Otro'
    };
    return types[type as keyof typeof types] || type;
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'lab_result':
      case 'report':
        return DocumentTextIcon;
      case 'image':
        return FolderIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getFileSize = (bytes: number | null) => {
    if (!bytes) return 'Tamaño desconocido';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const downloadDocument = (doc: MedicalDocument) => {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank');
    } else {
      // Generate a simple document
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

  const shareDocument = async (doc: MedicalDocument) => {
    try {
      const { error } = await supabase
        .from('medical_documents')
        .update({ shared_with_caregivers: !doc.shared_with_caregivers })
        .eq('id', doc.id);

      if (error) throw error;
      fetchDocuments();
    } catch (error) {
      console.error('Error sharing document:', error);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || doc.document_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const documentTypes = [...new Set(documents.map(doc => doc.document_type))];

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
    <div className="space-y-6">
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg pl-10 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterType !== 'all' ? 'No se encontraron documentos' : 'No tienes documentos'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterType !== 'all' 
              ? 'Intenta con otros términos de búsqueda o filtros'
              : 'Tus documentos médicos aparecerán aquí'
            }
          </p>
          {!searchTerm && filterType === 'all' && (
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Subir Primer Documento
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((document) => {
            const Icon = getDocumentIcon(document.document_type);
            return (
              <div key={document.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      document.is_critical ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        document.is_critical ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {document.title}
                        </h3>
                        {document.is_critical && (
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                            Crítico
                          </span>
                        )}
                        {document.shared_with_caregivers && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            Compartido
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Tipo:</span> {getDocumentTypeLabel(document.document_type)}
                        </div>
                        <div>
                          <span className="font-medium">Fecha:</span> {' '}
                          {new Date(document.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div>
                          <span className="font-medium">Creado por:</span> {document.doctor_name}
                        </div>
                        {document.file_size && (
                          <div>
                            <span className="font-medium">Tamaño:</span> {getFileSize(document.file_size)}
                          </div>
                        )}
                      </div>

                      {document.description && (
                        <p className="text-sm text-gray-700 mb-3">
                          {document.description}
                        </p>
                      )}

                      {document.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {document.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => setSelectedDocument(document)}
                      className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>Ver</span>
                    </button>
                    
                    <button
                      onClick={() => downloadDocument(document)}
                      className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 flex items-center space-x-1"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span>Descargar</span>
                    </button>
                    
                    <button
                      onClick={() => shareDocument(document)}
                      className={`px-3 py-2 rounded text-sm flex items-center space-x-1 ${
                        document.shared_with_caregivers
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-yellow-600 text-white hover:bg-yellow-700'
                      }`}
                    >
                      <ShareIcon className="w-4 h-4" />
                      <span>{document.shared_with_caregivers ? 'Compartido' : 'Compartir'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
  );
}