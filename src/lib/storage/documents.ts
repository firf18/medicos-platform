/**
 * Document Storage Utilities
 * 
 * Handles file uploads and document management for pharmacy registration
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface UploadResult {
  url: string
  path: string
  fullPath: string
}

export async function uploadDocument(
  file: File,
  userId: string,
  entityType: 'pharmacy' | 'doctor' | 'clinic' | 'laboratory',
  folder?: string
): Promise<UploadResult> {
  const supabase = createClientComponentClient()
  
  // Validar archivo
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    throw new Error('El archivo excede el tamaño máximo de 10MB')
  }

  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido. Solo se aceptan PDF, JPG, JPEG y PNG')
  }

  // Generar nombre único del archivo
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = file.name.split('.').pop()
  const fileName = `${timestamp}_${random}.${extension}`

  // Construir ruta
  const basePath = `documents/${entityType}/${userId}`
  const filePath = folder ? `${basePath}/${folder}/${fileName}` : `${basePath}/${fileName}`

  try {
    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      throw new Error(`Error subiendo archivo: ${error.message}`)
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    return {
      url: urlData.publicUrl,
      path: filePath,
      fullPath: data.path
    }

  } catch (error) {
    console.error('Document upload error:', error)
    throw error
  }
}

export async function deleteDocument(path: string): Promise<void> {
  const supabase = createClientComponentClient()

  try {
    const { error } = await supabase.storage
      .from('documents')
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      throw new Error(`Error eliminando archivo: ${error.message}`)
    }
  } catch (error) {
    console.error('Document deletion error:', error)
    throw error
  }
}

export async function getDocumentUrl(path: string): Promise<string> {
  const supabase = createClientComponentClient()

  try {
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(path)

    return data.publicUrl
  } catch (error) {
    console.error('Get document URL error:', error)
    throw error
  }
}

export function validateDocumentFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png'
  ]

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo excede el tamaño máximo de 10MB'
    }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de archivo no permitido. Solo se aceptan PDF, JPG, JPEG y PNG'
    }
  }

  return { isValid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
