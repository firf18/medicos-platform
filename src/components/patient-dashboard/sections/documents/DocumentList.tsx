'use client';

import { MedicalDocument } from './types';
import { getDocumentTypeLabel, getDocumentIcon } from './utils';

interface DocumentListProps {
  documents: MedicalDocument[];
  onDocumentClick: (document: MedicalDocument) => void;
}

export function DocumentList({
  documents,
  onDocumentClick
}: DocumentListProps) {
  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron documentos</h3>
          <p className="text-gray-500 text-center">
            Parece que no hay documentos disponibles para mostrar en este momento.
          </p>
        </div>
      ) : (
        documents.map((document) => (
          <div
            key={document.id}
            className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md cursor-pointer transition-shadow"
            onClick={() => onDocumentClick(document)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {getDocumentIcon(document.document_type)}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{document.title}</h4>
                  <p className="text-sm text-gray-500 mb-2">
                    {getDocumentTypeLabel(document.document_type)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {document.tags.length > 3 && (
                      <span className="bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded">
                        +{document.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">
                  {new Date(document.created_at).toLocaleDateString('es-ES')}
                </p>
                <p className="text-xs text-gray-400">{document.doctor_name}</p>
              </div>
            </div>
            {document.is_critical && (
              <div className="mt-3 bg-red-50 border-l-4 border-red-400 p-2 text-sm text-red-700">
                <span className="font-medium">⚠️ Documento crítico:</span> Este documento requiere atención prioritaria.
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
