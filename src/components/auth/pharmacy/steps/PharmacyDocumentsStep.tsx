'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, ArrowRight, ArrowLeft, Upload, FileText, X, Check } from 'lucide-react'
import { PharmacyRegistrationData, PharmacyDocumentType } from '@/types/database/pharmacies.types'

interface PharmacyDocumentsStepProps {
  data: Partial<PharmacyRegistrationData>
  updateData: (data: Partial<PharmacyRegistrationData>) => void
  onStepComplete: (data: Partial<PharmacyRegistrationData>) => void
  onStepError: (errors: Record<string, string>) => void
  isLoading: boolean
  errors: Record<string, string>
  onNext: () => void
  onPrevious: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const documentTypes = [
  { value: 'license', label: 'Licencia Sanitaria' },
  { value: 'permit', label: 'Permiso de Funcionamiento' },
  { value: 'insurance', label: 'Póliza de Seguro' },
  { value: 'certificate', label: 'Certificado' },
  { value: 'contract', label: 'Contrato' },
  { value: 'other', label: 'Otro' }
]

const requiredDocuments = [
  {
    type: 'license',
    name: 'Licencia Sanitaria',
    description: 'Licencia sanitaria vigente expedida por la autoridad competente',
    required: true
  },
  {
    type: 'permit',
    name: 'RFC o CURP',
    description: 'Registro Federal de Contribuyentes o CURP del propietario',
    required: true
  },
  {
    type: 'certificate',
    name: 'Cédula Profesional del Responsable',
    description: 'Cédula profesional del Químico Farmacéutico Responsable',
    required: true
  }
]

interface DocumentFile {
  name: string
  type: PharmacyDocumentType
  file: File
  id: string
}

export function PharmacyDocumentsStep({
  data,
  updateData,
  onStepComplete,
  onStepError,
  isLoading,
  errors,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep
}: PharmacyDocumentsStepProps) {
  const [documents, setDocuments] = useState<DocumentFile[]>(data.documents || [])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDocuments(data.documents || [])
  }, [data])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (documents.length === 0) {
      errors.documents = 'Debes subir al menos un documento'
    }

    // Check for required document types
    const uploadedTypes = documents.map(doc => doc.type)
    const hasLicense = uploadedTypes.includes('license')
    const hasRFC = uploadedTypes.includes('permit')
    const hasCertificate = uploadedTypes.includes('certificate')

    if (!hasLicense) {
      errors.license = 'La Licencia Sanitaria es requerida'
    }
    if (!hasRFC) {
      errors.rfc = 'El RFC o CURP es requerido'
    }
    if (!hasCertificate) {
      errors.certificate = 'La Cédula Profesional del Responsable es requerida'
    }

    // Validate file sizes (max 10MB each)
    documents.forEach((doc, index) => {
      if (doc.file.size > 10 * 1024 * 1024) {
        errors[`file_${index}`] = `${doc.name}: El archivo es muy grande (máximo 10MB)`
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newDocuments: DocumentFile[] = []
    
    Array.from(files).forEach((file) => {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        setValidationErrors(prev => ({
          ...prev,
          [`file_${file.name}`]: 'Solo se permiten archivos PDF, JPG, JPEG y PNG'
        }))
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setValidationErrors(prev => ({
          ...prev,
          [`file_${file.name}`]: 'El archivo es muy grande (máximo 10MB)'
        }))
        return
      }

      newDocuments.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: 'other' as PharmacyDocumentType,
        file
      })
    })

    setDocuments(prev => [...prev, ...newDocuments])
    
    // Clear general document error if files were added
    if (newDocuments.length > 0 && validationErrors.documents) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.documents
        return newErrors
      })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
  }

  const updateDocumentType = (id: string, type: PharmacyDocumentType) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, type } : doc
    ))
  }

  const updateDocumentName = (id: string, name: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, name } : doc
    ))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleNext = () => {
    const formData = { documents }
    if (validateForm()) {
      updateData(formData)
      onStepComplete(formData)
    } else {
      onStepError(validationErrors)
    }
  }

  const handlePrevious = () => {
    updateData({ documents })
    onPrevious()
  }

  const getFieldError = (field: string) => {
    return errors[field] || validationErrors[field] || ''
  }

  const getRequiredDocumentStatus = (type: string) => {
    return documents.some(doc => doc.type === type)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Required Documents Checklist */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Documentos Requeridos
          </h3>
          
          <div className="space-y-3">
            {requiredDocuments.map((reqDoc) => (
              <div key={reqDoc.type} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className={`mt-1 ${getRequiredDocumentStatus(reqDoc.type) ? 'text-green-600' : 'text-gray-400'}`}>
                  {getRequiredDocumentStatus(reqDoc.type) ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{reqDoc.name}</h4>
                  <p className="text-sm text-gray-600">{reqDoc.description}</p>
                  {getFieldError(reqDoc.type) && (
                    <div className="flex items-center space-x-1 text-red-600 text-xs mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{getFieldError(reqDoc.type)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* File Upload Area */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Subir Documentos
          </h3>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-orange-400 bg-orange-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Archivos PDF, JPG, JPEG y PNG hasta 10MB cada uno
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Seleccionar Archivos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
          
          {getFieldError('documents') && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('documents')}</span>
            </div>
          )}
        </div>

        {/* Uploaded Documents */}
        {documents.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Documentos Subidos ({documents.length})
            </h3>
            
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <input
                            type="text"
                            value={doc.name}
                            onChange={(e) => updateDocumentName(doc.id, e.target.value)}
                            className="font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                          />
                          <p className="text-sm text-gray-600">
                            {formatFileSize(doc.file.size)} • {doc.file.type}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(doc.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Label htmlFor={`type_${doc.id}`} className="text-sm font-medium">
                          Tipo de documento:
                        </Label>
                        <Select 
                          value={doc.type} 
                          onValueChange={(value) => updateDocumentType(doc.id, value as PharmacyDocumentType)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {documentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {getFieldError(`file_${doc.id}`) && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>{getFieldError(`file_${doc.id}`)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Lineamientos para Documentos</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>• Todos los documentos deben estar vigentes y ser legibles</div>
            <div>• Los archivos deben ser de alta calidad para facilitar la verificación</div>
            <div>• Asegúrate de que los nombres y fechas sean claramente visibles</div>
            <div>• Los documentos en formato PDF son preferidos</div>
            <div>• Máximo 10MB por archivo</div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Seguridad y Privacidad</h4>
          <p className="text-sm text-green-800">
            Todos los documentos son almacenados de forma segura y cifrada. Solo el equipo de 
            verificación autorizado tendrá acceso para revisar y validar tu información. 
            Los documentos no serán compartidos con terceros.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || isLoading}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Anterior</span>
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700"
        >
          <span>Siguiente</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
