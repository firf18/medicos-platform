'use client';

import { MedicalDocument } from './types';
import { getDocumentTypeLabel } from './utils';

interface DocumentDetailModalProps {
  document: MedicalDocument;
  onClose: () => void;
  onDownload: (document: MedicalDocument) => void;
}

export function DocumentDetailModal({
  document,
  onClose,
  onDownload
}: DocumentDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {document.title}
          </h3>
          <button
            onClick={onClose}
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
              <p className="text-gray-900">{getDocumentTypeLabel(document.document_type)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha de Creación</label>
              <p className="text-gray-900">
                {new Date(document.created_at).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Creado por</label>
              <p className="text-gray-900">{document.doctor_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <div className="flex items-center space-x-2">
                {document.is_critical && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    Crítico
                  </span>
                )}
                {document.shared_with_caregivers && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    Compartido con confidentes
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {document.description && (
            <div>
              <label className="text-sm font-medium text-gray-700">Descripción</label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{document.description}</p>
            </div>
          )}
          
          {document.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Etiquetas</label>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag, index) => (
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
            onClick={() => onDownload(document)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Descargar
          </button>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}