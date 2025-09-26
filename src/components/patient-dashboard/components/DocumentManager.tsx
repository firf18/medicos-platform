'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  DocumentTextIcon, 
  FolderIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon
} from '@heroicons/react/24/outline';

interface DocumentManagerProps {
  userId: string;
  darkMode: boolean;
  realTimeData?: any;
}

interface MedicalDocument {
  id: string;
  name: string;
  type: 'lab_result' | 'prescription' | 'imaging' | 'report' | 'insurance' | 'other';
  fileType: string;
  fileSize: number;
  uploadDate: string;
  doctorName?: string;
  category: string;
  tags: string[];
  isShared: boolean;
  downloadUrl: string;
  thumbnailUrl?: string;
  description?: string;
}

interface DocumentCategory {
  id: string;
  name: string;
  count: number;
  color: string;
}

export function DocumentManager({ userId, darkMode, realTimeData }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<MedicalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentMetadata, setDocumentMetadata] = useState({
    name: '',
    type: 'other' as const,
    category: '',
    tags: [] as string[],
    description: '',
    doctorName: ''
  });
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadDocuments();
    loadCategories();
  }, [userId]);

  useEffect(() => {
    filterDocuments();
  }, [documents, selectedCategory, searchQuery]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('medical_documents')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const processedDocuments: MedicalDocument[] = data.map(doc => ({
          id: doc.id,
          name: doc.document_name,
          type: doc.document_type,
          fileType: doc.file_type,
          fileSize: doc.file_size,
          uploadDate: doc.created_at,
          doctorName: doc.doctor_name,
          category: doc.category || 'general',
          tags: doc.tags || [],
          isShared: doc.is_shared || false,
          downloadUrl: doc.file_url,
          thumbnailUrl: doc.thumbnail_url,
          description: doc.description
        }));

        setDocuments(processedDocuments);
      }

    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        const processedCategories: DocumentCategory[] = data.map(cat => ({
          id: cat.id,
          name: cat.name,
          count: 0, // Se calculará después
          color: cat.color || 'blue'
        }));

        setCategories(processedCategories);
      }

    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredDocuments(filtered);
  };

  const uploadDocument = async () => {
    if (!selectedFile) return;

    try {
      setUploadProgress(0);
      
      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Subir archivo a Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('medical-documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('medical-documents')
        .getPublicUrl(filePath);

      // Guardar metadata en la base de datos
      const documentData = {
        patient_id: userId,
        document_name: documentMetadata.name || selectedFile.name,
        document_type: documentMetadata.type,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
        file_url: publicUrlData.publicUrl,
        category: documentMetadata.category,
        tags: documentMetadata.tags,
        description: documentMetadata.description,
        doctor_name: documentMetadata.doctorName,
        is_shared: false
      };

      const { error: dbError } = await supabase
        .from('medical_documents')
        .insert([documentData]);

      if (dbError) throw dbError;

      setUploadProgress(100);
      setTimeout(() => {
        setShowUploadModal(false);
        setSelectedFile(null);
        setDocumentMetadata({
          name: '',
          type: 'other',
          category: '',
          tags: [],
          description: '',
          doctorName: ''
        });
        setUploadProgress(0);
        loadDocuments();
      }, 500);

    } catch (error) {
      console.error('Error uploading document:', error);
      setUploadProgress(0);
    }
  };

  const downloadDocument = (document: MedicalDocument) => {
    window.open(document.downloadUrl, '_blank');
  };

  const shareDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('medical_documents')
        .update({ is_shared: true })
        .eq('id', documentId);

      if (error) throw error;

      // Crear enlace compartible
      const shareUrl = `${window.location.origin}/shared/document/${documentId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Documento Médico',
          text: 'Documento médico compartido',
          url: shareUrl
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        alert('Enlace copiado al portapapeles');
      }

      loadDocuments();

    } catch (error) {
      console.error('Error sharing document:', error);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('medical_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      loadDocuments();

    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const getDocumentIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <PhotoIcon className="w-8 h-8 text-blue-500" />;
    } else if (fileType.startsWith('video/')) {
      return <FilmIcon className="w-8 h-8 text-purple-500" />;
    } else if (fileType.includes('pdf')) {
      return <DocumentIcon className="w-8 h-8 text-red-500" />;
    } else {
      return <DocumentTextIcon className="w-8 h-8 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lab_result': return 'text-green-600 bg-green-50';
      case 'prescription': return 'text-blue-600 bg-blue-50';
      case 'imaging': return 'text-purple-600 bg-purple-50';
      case 'report': return 'text-orange-600 bg-orange-50';
      case 'insurance': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'lab_result': return 'Resultado de Laboratorio';
      case 'prescription': return 'Receta Médica';
      case 'imaging': return 'Imagen Médica';
      case 'report': return 'Reporte Médico';
      case 'insurance': return 'Seguro Médico';
      default: return 'Otro';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Gestor de Documentos
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {documents.length} documentos médicos
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            <FolderIcon className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            onClick={loadDocuments}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            <ArrowPathIcon className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        >
          <option value="all">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lista/Grid de documentos */}
      {filteredDocuments.length === 0 ? (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No hay documentos</p>
          <p className="text-sm">Sube tu primer documento médico</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {filteredDocuments.map((document) => (
            <div
              key={document.id}
              className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} hover:shadow-md transition-shadow`}
            >
              {viewMode === 'grid' ? (
                // Vista de cuadrícula
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getDocumentIcon(document.fileType)}
                      <div className="flex-1 min-w-0">
                        <h5 className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {document.name}
                        </h5>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatFileSize(document.fileSize)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(document.type)}`}>
                      {getTypeText(document.type)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {formatDate(document.uploadDate)}
                    </span>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => downloadDocument(document)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => shareDocument(document.id)}
                        className="p-1 text-green-600 hover:text-green-800 transition-colors"
                      >
                        <ShareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDocument(document.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // Vista de lista
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getDocumentIcon(document.fileType)}
                    <div>
                      <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {document.name}
                      </h5>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {formatFileSize(document.fileSize)}
                        </span>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>•</span>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {formatDate(document.uploadDate)}
                        </span>
                        <span className={`px-2 py-1 rounded-full font-medium ${getTypeColor(document.type)}`}>
                          {getTypeText(document.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadDocument(document)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => shareDocument(document.id)}
                      className="p-2 text-green-600 hover:text-green-800 transition-colors"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteDocument(document.id)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de subida */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96 max-w-full mx-4`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Subir Documento
            </h3>
            
            {uploadProgress > 0 ? (
              <div className="space-y-4">
                <div className="text-center">
                  <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-2 text-blue-500" />
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Subiendo documento...
                  </p>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                
                <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {uploadProgress}%
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Archivo
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        if (!documentMetadata.name) {
                          setDocumentMetadata(prev => ({ ...prev, name: file.name }));
                        }
                      }
                    }}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    className={`w-full p-2 border rounded-lg ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                  />
                </div>
                
                {selectedFile && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Nombre del Documento
                      </label>
                      <input
                        type="text"
                        value={documentMetadata.name}
                        onChange={(e) => setDocumentMetadata(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Tipo de Documento
                      </label>
                      <select
                        value={documentMetadata.type}
                        onChange={(e) => setDocumentMetadata(prev => ({ ...prev, type: e.target.value as any }))}
                        className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      >
                        <option value="other">Otro</option>
                        <option value="lab_result">Resultado de Laboratorio</option>
                        <option value="prescription">Receta Médica</option>
                        <option value="imaging">Imagen Médica</option>
                        <option value="report">Reporte Médico</option>
                        <option value="insurance">Seguro Médico</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Descripción (opcional)
                      </label>
                      <textarea
                        value={documentMetadata.description}
                        onChange={(e) => setDocumentMetadata(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descripción del documento..."
                        className={`w-full p-2 rounded-lg border resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setUploadProgress(0);
                }}
                disabled={uploadProgress > 0 && uploadProgress < 100}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} text-gray-900 transition-colors disabled:opacity-50`}
              >
                Cancelar
              </button>
              {uploadProgress === 0 && (
                <button
                  onClick={uploadDocument}
                  disabled={!selectedFile}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Subir
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
