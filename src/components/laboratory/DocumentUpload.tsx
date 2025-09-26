'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Eye,
  Download,
  Loader2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface DocumentUploadProps {
  laboratoryId: string;
  onUploadComplete?: (document: any) => void;
  onError?: (error: string) => void;
}

const DOCUMENT_TYPES = [
  { value: 'rif_document', label: 'Documento RIF', required: true },
  { value: 'sanitary_license', label: 'Licencia Sanitaria', required: true },
  { value: 'municipal_license', label: 'Licencia Municipal', required: true },
  { value: 'insurance_certificate', label: 'Certificado de Seguro', required: true },
  { value: 'fire_safety', label: 'Certificado de Seguridad', required: true },
  { value: 'environmental_license', label: 'Licencia Ambiental', required: false },
  { value: 'biohazard_permit', label: 'Permiso de Bioseguridad', required: false },
  { value: 'equipment_certification', label: 'Certificación de Equipos', required: false },
  { value: 'personnel_certification', label: 'Certificación de Personal', required: false },
  { value: 'other', label: 'Otros Documentos', required: false },
];

export function DocumentUpload({ laboratoryId, onUploadComplete, onError }: DocumentUploadProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [documentName, setDocumentName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !selectedType || !documentName) {
      onError?.('Seleccione el tipo de documento y proporcione un nombre');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', selectedType);
      formData.append('document_name', documentName);
      formData.append('notes', notes);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`/api/laboratories/${laboratoryId}/documents`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (result.success) {
        setUploadedDocuments(prev => [...prev, result.document]);
        onUploadComplete?.(result.document);
        
        // Reset form
        setSelectedType('');
        setDocumentName('');
        setNotes('');
        
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        onError?.(result.error || 'Error al subir el documento');
      }
    } catch (error) {
      onError?.('Error de conexión. Intente nuevamente.');
    } finally {
      setUploading(false);
    }
  }, [selectedType, documentName, notes, laboratoryId, onUploadComplete, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const removeDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/laboratories/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
      }
    } catch (error) {
      onError?.('Error al eliminar el documento');
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(dt => dt.value === type)?.label || type;
  };

  const getRequiredDocuments = () => {
    return DOCUMENT_TYPES.filter(dt => dt.required);
  };

  const getUploadedRequiredTypes = () => {
    return uploadedDocuments
      .filter(doc => DOCUMENT_TYPES.find(dt => dt.value === doc.document_type)?.required)
      .map(doc => doc.document_type);
  };

  const requiredDocuments = getRequiredDocuments();
  const uploadedRequiredTypes = getUploadedRequiredTypes();
  const missingRequired = requiredDocuments.filter(
    req => !uploadedRequiredTypes.includes(req.value)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Documentos Requeridos
          </CardTitle>
          <CardDescription>
            Suba los documentos necesarios para la verificación de su laboratorio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document_type">Tipo de Documento *</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} {type.required && <span className="text-red-500">*</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_name">Nombre del Documento *</Label>
                <Input
                  id="document_name"
                  placeholder="Ej: RIF Laboratorio Central"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Información adicional sobre el documento..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                ${uploading ? 'pointer-events-none opacity-50' : ''}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-lg text-blue-600">Suelte el archivo aquí...</p>
              ) : (
                <div>
                  <p className="text-lg text-gray-600 mb-2">
                    Arrastre y suelte un archivo aquí, o haga clic para seleccionar
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, JPG, PNG, DOC, DOCX (máximo 10MB)
                  </p>
                </div>
              )}
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Subiendo documento...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Required Documents Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estado de Documentos Requeridos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requiredDocuments.map((doc) => {
              const isUploaded = uploadedRequiredTypes.includes(doc.value);
              return (
                <div
                  key={doc.value}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isUploaded ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center">
                    {isUploaded ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className={isUploaded ? 'text-green-700' : 'text-red-700'}>
                      {doc.label}
                    </span>
                  </div>
                  <span className={`text-sm ${isUploaded ? 'text-green-600' : 'text-red-600'}`}>
                    {isUploaded ? 'Completado' : 'Pendiente'}
                  </span>
                </div>
              );
            })}
          </div>

          {missingRequired.length > 0 && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Faltan {missingRequired.length} documento(s) requerido(s) para completar el registro.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      {uploadedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documentos Subidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.document_name}</p>
                      <p className="text-sm text-gray-500">
                        {getDocumentTypeLabel(doc.document_type)} • 
                        {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.file_url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(doc.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
