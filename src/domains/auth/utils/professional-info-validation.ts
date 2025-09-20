/**
 * Professional Info Validation Utils
 * @fileoverview Validation utilities for doctor professional information
 * @compliance Medical data validation with security audit trail
 */

import {
  ProfessionalInfoFormData,
  ProfessionalInfoFormErrors,
  ValidationResult,
  DocumentType,
  DOCUMENT_PATTERNS,
  LICENSE_PATTERNS,
  EXPERIENCE_VALIDATION,
  BIO_VALIDATION,
  GRADUATION_YEAR_VALIDATION
} from '../types/professional-info.types';
import { isValidUniversity } from '../constants/medical-institutions';

/**
 * Get document placeholder text based on document type
 * @param documentType - Type of identification document
 * @returns Placeholder text for the document input field
 */
export const getDocumentPlaceholder = (documentType: DocumentType): string => {
  switch (documentType) {
    case 'cedula_identidad':
      return 'V-12345678 o E-12345678';
    case 'cedula_extranjera':
      return 'E-12345678';
    default:
      return 'Número de documento';
  }
};

/**
 * Validate document number format
 * @param documentNumber - Document number to validate
 * @param documentType - Type of document
 * @returns Validation result with error message if invalid
 */
export const validateDocumentNumber = (
  documentNumber: string,
  documentType: DocumentType
): { isValid: boolean; error?: string } => {
  if (!documentNumber.trim()) {
    return { isValid: false, error: 'El número de documento es requerido' };
  }

  const pattern = DOCUMENT_PATTERNS[documentType];
  if (!pattern.test(documentNumber)) {
    const placeholder = getDocumentPlaceholder(documentType);
    return { 
      isValid: false, 
      error: `Formato inválido. Use el formato: ${placeholder}` 
    };
  }

  return { isValid: true };
};

/**
 * Validate license number format
 * @param licenseNumber - Medical license number to validate
 * @returns Validation result with error message if invalid
 */
export const validateLicenseNumber = (licenseNumber: string): { isValid: boolean; error?: string } => {
  if (!licenseNumber.trim()) {
    return { isValid: false, error: 'El número de matrícula es requerido' };
  }

  const isValidFormat = Object.values(LICENSE_PATTERNS).some(pattern => 
    pattern.test(licenseNumber)
  );

  if (!isValidFormat) {
    return {
      isValid: false,
      error: 'Formato de matrícula inválido. Debe ser numérico (ej: 12345) o alfanumérico (ej: MP12345)'
    };
  }

  return { isValid: true };
};

/**
 * Validate years of experience
 * @param years - Years of experience to validate
 * @returns Validation result with error message if invalid
 */
export const validateExperience = (years: number): { isValid: boolean; error?: string } => {
  if (years < EXPERIENCE_VALIDATION.MIN_YEARS) {
    return { isValid: false, error: 'Los años de experiencia no pueden ser negativos' };
  }

  if (years > EXPERIENCE_VALIDATION.MAX_YEARS) {
    return { isValid: false, error: `Máximo ${EXPERIENCE_VALIDATION.MAX_YEARS} años de experiencia` };
  }

  if (years > EXPERIENCE_VALIDATION.TYPICAL_MAX) {
    return { 
      isValid: true, 
      error: `${years} años es inusualmente alto. Verifique que sea correcto` 
    };
  }

  return { isValid: true };
};

/**
 * Validate professional bio
 * @param bio - Professional bio to validate
 * @returns Validation result with error message if invalid
 */
export const validateBio = (bio: string): { isValid: boolean; error?: string } => {
  const trimmedBio = bio.trim();
  
  if (!trimmedBio) {
    return { isValid: false, error: 'La biografía profesional es requerida' };
  }

  if (trimmedBio.length < BIO_VALIDATION.MIN_LENGTH) {
    return { 
      isValid: false, 
      error: `La biografía debe tener al menos ${BIO_VALIDATION.MIN_LENGTH} caracteres (actual: ${trimmedBio.length})` 
    };
  }

  if (trimmedBio.length > BIO_VALIDATION.MAX_LENGTH) {
    return { 
      isValid: false, 
      error: `La biografía no puede exceder ${BIO_VALIDATION.MAX_LENGTH} caracteres (actual: ${trimmedBio.length})` 
    };
  }

  // Check for basic quality indicators
  const sentences = trimmedBio.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 2) {
    return {
      isValid: true,
      error: 'Considere agregar más detalles sobre su experiencia y especialización'
    };
  }

  return { isValid: true };
};

/**
 * Validate university
 * @param university - University name to validate
 * @returns Validation result with error message if invalid
 */
export const validateUniversity = (university: string): { isValid: boolean; error?: string } => {
  if (!university.trim()) {
    return { isValid: false, error: 'La universidad es requerida' };
  }

  if (!isValidUniversity(university)) {
    return {
      isValid: true,
      error: 'Universidad no reconocida. Verifique que sea una institución médica válida'
    };
  }

  return { isValid: true };
};

/**
 * Validate graduation year
 * @param graduationYear - Graduation year to validate
 * @param yearsOfExperience - Years of experience for cross-validation
 * @returns Validation result with error message if invalid
 */
export const validateGraduationYear = (
  graduationYear: number | undefined,
  yearsOfExperience: number
): { isValid: boolean; error?: string } => {
  if (!graduationYear) {
    return { isValid: false, error: 'El año de graduación es requerido' };
  }

  const currentYear = new Date().getFullYear();
  
  if (graduationYear < GRADUATION_YEAR_VALIDATION.MIN_YEAR) {
    return { isValid: false, error: `Año mínimo: ${GRADUATION_YEAR_VALIDATION.MIN_YEAR}` };
  }

  if (graduationYear > currentYear) {
    return { isValid: false, error: 'El año de graduación no puede ser futuro' };
  }

  // Cross-validate with experience
  const yearsSinceGraduation = currentYear - graduationYear;
  const experienceDiscrepancy = Math.abs(yearsSinceGraduation - yearsOfExperience);
  
  if (experienceDiscrepancy > 5) {
    return {
      isValid: true,
      error: `Inconsistencia: ${yearsSinceGraduation} años desde graduación vs ${yearsOfExperience} años de experiencia`
    };
  }

  return { isValid: true };
};

/**
 * Validate medical board
 * @param medicalBoard - Medical board name to validate
 * @returns Validation result with error message if invalid
 */
export const validateMedicalBoard = (medicalBoard: string): { isValid: boolean; error?: string } => {
  if (!medicalBoard.trim()) {
    return { isValid: false, error: 'El colegio de médicos es requerido' };
  }

  if (!medicalBoard.toLowerCase().includes('colegio')) {
    return {
      isValid: true,
      error: 'Verifique que sea un colegio de médicos válido'
    };
  }

  return { isValid: true };
};

/**
 * Process document number input to ensure proper format
 * @param value - Raw input value
 * @param documentType - Type of document
 * @returns Processed document number
 */
export const processDocumentNumber = (value: string, documentType: DocumentType): string => {
  // Remove all non-alphanumeric characters except hyphens
  let processedValue = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  
  // Handle Venezuelan ID format
  if (documentType === 'cedula_identidad') {
    // If starts with V or E, ensure proper format
    if (processedValue.match(/^[VE]/)) {
      const letterPart = processedValue.substring(0, 1);
      const numberPart = processedValue.substring(1).replace(/[^0-9]/g, '');
      
      if (numberPart) {
        processedValue = `${letterPart}-${numberPart}`;
      } else {
        processedValue = letterPart;
      }
    } else if (processedValue.match(/^[0-9]/)) {
      // If starts with number, add V- prefix
      const numbersOnly = processedValue.replace(/[^0-9]/g, '');
      if (numbersOnly) {
        processedValue = `V-${numbersOnly}`;
      }
    }
  } else if (documentType === 'cedula_extranjera') {
    // For foreign ID, ensure E- prefix
    if (processedValue.match(/^E/)) {
      const numberPart = processedValue.substring(1).replace(/[^0-9]/g, '');
      if (numberPart) {
        processedValue = `E-${numberPart}`;
      } else {
        processedValue = 'E';
      }
    } else if (processedValue.match(/^[0-9]/)) {
      const numbersOnly = processedValue.replace(/[^0-9]/g, '');
      if (numbersOnly) {
        processedValue = `E-${numbersOnly}`;
      }
    }
  }
  
  return processedValue;
};

/**
 * Comprehensive form validation
 * @param formData - Form data to validate
 * @returns Validation result with all errors
 */
export const validateProfessionalInfoForm = (formData: ProfessionalInfoFormData): ValidationResult => {
  const errors: ProfessionalInfoFormErrors = {};
  let isValid = true;

  // Validate document number
  const documentValidation = validateDocumentNumber(formData.documentNumber, formData.documentType);
  if (!documentValidation.isValid) {
    errors.documentNumber = documentValidation.error;
    isValid = false;
  }

  // Validate license number
  const licenseValidation = validateLicenseNumber(formData.licenseNumber);
  if (!licenseValidation.isValid) {
    errors.licenseNumber = licenseValidation.error;
    isValid = false;
  }

  // Validate experience
  const experienceValidation = validateExperience(formData.yearsOfExperience);
  if (!experienceValidation.isValid) {
    errors.yearsOfExperience = experienceValidation.error;
    isValid = false;
  }

  // Validate bio
  const bioValidation = validateBio(formData.bio);
  if (!bioValidation.isValid) {
    errors.bio = bioValidation.error;
    isValid = false;
  }

  // Validate university
  const universityValidation = validateUniversity(formData.university);
  if (!universityValidation.isValid) {
    errors.university = universityValidation.error;
    isValid = false;
  }

  // Validate graduation year
  const graduationValidation = validateGraduationYear(formData.graduationYear, formData.yearsOfExperience);
  if (!graduationValidation.isValid) {
    errors.graduationYear = graduationValidation.error;
    isValid = false;
  }

  // Validate medical board
  const boardValidation = validateMedicalBoard(formData.medicalBoard);
  if (!boardValidation.isValid) {
    errors.medicalBoard = boardValidation.error;
    isValid = false;
  }

  return { isValid, errors };
};
