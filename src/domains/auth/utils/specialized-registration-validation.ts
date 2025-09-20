/**
 * Specialized Registration Validation Utils
 * @fileoverview Validation utilities for specialized user registration
 * @compliance Medical data validation with security audit trail
 */

import {
  UserType,
  SpecializedRegistrationData,
  RegistrationFormErrors,
  PatientRegistrationData,
  DoctorRegistrationData,
  ClinicRegistrationData,
  LaboratoryRegistrationData,
  VALIDATION_RULES
} from '../types/specialized-registration.types';

/**
 * Validate base registration fields (common to all user types)
 */
export const validateBaseFields = (data: Partial<SpecializedRegistrationData>): RegistrationFormErrors => {
  const errors: RegistrationFormErrors = {};

  // First name validation
  if (!data.firstName?.trim()) {
    errors.firstName = 'El nombre es requerido';
  } else if (data.firstName.length < 2) {
    errors.firstName = 'El nombre debe tener al menos 2 caracteres';
  } else if (data.firstName.length > 50) {
    errors.firstName = 'El nombre no puede exceder 50 caracteres';
  }

  // Last name validation
  if (!data.lastName?.trim()) {
    errors.lastName = 'El apellido es requerido';
  } else if (data.lastName.length < 2) {
    errors.lastName = 'El apellido debe tener al menos 2 caracteres';
  } else if (data.lastName.length > 50) {
    errors.lastName = 'El apellido no puede exceder 50 caracteres';
  }

  // Email validation
  if (!data.email?.trim()) {
    errors.email = 'El correo electrónico es requerido';
  } else if (!VALIDATION_RULES.EMAIL.PATTERN.test(data.email)) {
    errors.email = VALIDATION_RULES.EMAIL.MESSAGE;
  }

  // Password validation
  if (!data.password) {
    errors.password = 'La contraseña es requerida';
  } else if (!VALIDATION_RULES.PASSWORD.PATTERN.test(data.password)) {
    errors.password = VALIDATION_RULES.PASSWORD.MESSAGE;
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = 'La confirmación de contraseña es requerida';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }

  // Phone validation (optional)
  if (data.phone && data.phone.trim()) {
    if (!VALIDATION_RULES.PHONE.PATTERN.test(data.phone)) {
      errors.phone = VALIDATION_RULES.PHONE.MESSAGE;
    }
  }

  return errors;
};

/**
 * Validate patient-specific fields
 */
export const validatePatientFields = (data: Partial<PatientRegistrationData>): RegistrationFormErrors => {
  const errors: RegistrationFormErrors = {};

  // Date of birth validation
  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'La fecha de nacimiento es requerida';
  } else {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (birthDate > today) {
      errors.dateOfBirth = 'La fecha de nacimiento no puede ser futura';
    } else if (age > 120) {
      errors.dateOfBirth = 'Fecha de nacimiento inválida';
    } else if (age < 0) {
      errors.dateOfBirth = 'Fecha de nacimiento inválida';
    }
  }

  // Emergency contact validation (optional)
  if (data.emergencyContactName && !data.emergencyContactPhone) {
    errors.emergencyContactPhone = 'Teléfono de contacto de emergencia es requerido si proporciona un nombre';
  }

  if (data.emergencyContactPhone && !data.emergencyContactName) {
    errors.emergencyContactName = 'Nombre de contacto de emergencia es requerido si proporciona un teléfono';
  }

  if (data.emergencyContactPhone && !VALIDATION_RULES.PHONE.PATTERN.test(data.emergencyContactPhone)) {
    errors.emergencyContactPhone = 'Formato de teléfono de emergencia inválido';
  }

  return errors;
};

/**
 * Validate doctor-specific fields
 */
export const validateDoctorFields = (data: Partial<DoctorRegistrationData>): RegistrationFormErrors => {
  const errors: RegistrationFormErrors = {};

  // License number validation
  if (!data.licenseNumber?.trim()) {
    errors.licenseNumber = 'El número de matrícula médica es requerido';
  } else if (!VALIDATION_RULES.LICENSE.PATTERN.test(data.licenseNumber)) {
    errors.licenseNumber = VALIDATION_RULES.LICENSE.MESSAGE;
  }

  // Specialty validation
  if (!data.specialtyId?.trim()) {
    errors.specialtyId = 'La especialidad médica es requerida';
  }

  // Years of experience validation (optional)
  if (data.yearsOfExperience !== undefined) {
    const years = Number(data.yearsOfExperience);
    if (isNaN(years) || years < 0) {
      errors.yearsOfExperience = 'Los años de experiencia deben ser un número positivo';
    } else if (years > 50) {
      errors.yearsOfExperience = 'Los años de experiencia no pueden exceder 50';
    }
  }

  // Bio validation (optional)
  if (data.bio && data.bio.length > 500) {
    errors.bio = 'La biografía no puede exceder 500 caracteres';
  }

  return errors;
};

/**
 * Validate clinic-specific fields
 */
export const validateClinicFields = (data: Partial<ClinicRegistrationData>): RegistrationFormErrors => {
  const errors: RegistrationFormErrors = {};

  // Clinic name validation
  if (!data.clinicName?.trim()) {
    errors.clinicName = 'El nombre de la clínica es requerido';
  } else if (data.clinicName.length < 3) {
    errors.clinicName = 'El nombre de la clínica debe tener al menos 3 caracteres';
  } else if (data.clinicName.length > 100) {
    errors.clinicName = 'El nombre de la clínica no puede exceder 100 caracteres';
  }

  // Address validation
  if (!data.address?.trim()) {
    errors.address = 'La dirección es requerida';
  } else if (data.address.length < 10) {
    errors.address = 'La dirección debe ser más específica';
  }

  // City validation
  if (!data.city?.trim()) {
    errors.city = 'La ciudad es requerida';
  }

  // State validation
  if (!data.state?.trim()) {
    errors.state = 'El estado es requerido';
  }

  // Phone validation (required for clinics)
  if (!data.phone?.trim()) {
    errors.phone = 'El teléfono es requerido para clínicas';
  } else if (!VALIDATION_RULES.PHONE.PATTERN.test(data.phone)) {
    errors.phone = VALIDATION_RULES.PHONE.MESSAGE;
  }

  // Website validation (optional)
  if (data.website && data.website.trim()) {
    const websitePattern = /^https?:\/\/.+\..+/;
    if (!websitePattern.test(data.website)) {
      errors.website = 'Ingresa una URL válida (ejemplo: https://www.ejemplo.com)';
    }
  }

  return errors;
};

/**
 * Validate laboratory-specific fields
 */
export const validateLaboratoryFields = (data: Partial<LaboratoryRegistrationData>): RegistrationFormErrors => {
  const errors: RegistrationFormErrors = {};

  // Lab name validation
  if (!data.labName?.trim()) {
    errors.labName = 'El nombre del laboratorio es requerido';
  } else if (data.labName.length < 3) {
    errors.labName = 'El nombre del laboratorio debe tener al menos 3 caracteres';
  } else if (data.labName.length > 100) {
    errors.labName = 'El nombre del laboratorio no puede exceder 100 caracteres';
  }

  // Address validation
  if (!data.address?.trim()) {
    errors.address = 'La dirección es requerida';
  } else if (data.address.length < 10) {
    errors.address = 'La dirección debe ser más específica';
  }

  // City validation
  if (!data.city?.trim()) {
    errors.city = 'La ciudad es requerida';
  }

  // State validation
  if (!data.state?.trim()) {
    errors.state = 'El estado es requerido';
  }

  // Phone validation (required for laboratories)
  if (!data.phone?.trim()) {
    errors.phone = 'El teléfono es requerido para laboratorios';
  } else if (!VALIDATION_RULES.PHONE.PATTERN.test(data.phone)) {
    errors.phone = VALIDATION_RULES.PHONE.MESSAGE;
  }

  // Website validation (optional)
  if (data.website && data.website.trim()) {
    const websitePattern = /^https?:\/\/.+\..+/;
    if (!websitePattern.test(data.website)) {
      errors.website = 'Ingresa una URL válida (ejemplo: https://www.ejemplo.com)';
    }
  }

  return errors;
};

/**
 * Comprehensive validation based on user type
 */
export const validateRegistrationData = (
  userType: UserType,
  data: Partial<SpecializedRegistrationData>
): { isValid: boolean; errors: RegistrationFormErrors } => {
  let errors: RegistrationFormErrors = {};

  // Validate base fields for all user types
  const baseErrors = validateBaseFields(data);
  errors = { ...errors, ...baseErrors };

  // Validate user-type specific fields
  switch (userType) {
    case 'patient':
      const patientErrors = validatePatientFields(data as Partial<PatientRegistrationData>);
      errors = { ...errors, ...patientErrors };
      break;

    case 'doctor':
      const doctorErrors = validateDoctorFields(data as Partial<DoctorRegistrationData>);
      errors = { ...errors, ...doctorErrors };
      break;

    case 'clinic':
      const clinicErrors = validateClinicFields(data as Partial<ClinicRegistrationData>);
      errors = { ...errors, ...clinicErrors };
      break;

    case 'laboratory':
      const labErrors = validateLaboratoryFields(data as Partial<LaboratoryRegistrationData>);
      errors = { ...errors, ...labErrors };
      break;

    default:
      errors.userType = 'Tipo de usuario inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitize form data
 */
export const sanitizeRegistrationData = (
  userType: UserType,
  data: SpecializedRegistrationData
): SpecializedRegistrationData => {
  const sanitized = {
    ...data,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.toLowerCase().trim()
  };

  // Type-specific sanitization
  if (userType === 'clinic') {
    const clinicData = sanitized as ClinicRegistrationData;
    return {
      ...clinicData,
      clinicName: clinicData.clinicName.trim(),
      address: clinicData.address.trim(),
      city: clinicData.city.trim(),
      state: clinicData.state.trim(),
      website: clinicData.website?.trim() || undefined
    };
  }

  if (userType === 'laboratory') {
    const labData = sanitized as LaboratoryRegistrationData;
    return {
      ...labData,
      labName: labData.labName.trim(),
      address: labData.address.trim(),
      city: labData.city.trim(),
      state: labData.state.trim(),
      website: labData.website?.trim() || undefined
    };
  }

  if (userType === 'doctor') {
    const doctorData = sanitized as DoctorRegistrationData;
    return {
      ...doctorData,
      licenseNumber: doctorData.licenseNumber.trim(),
      bio: doctorData.bio?.trim() || undefined
    };
  }

  return sanitized;
};

/**
 * Get field validation status
 */
export const getFieldValidationStatus = (
  fieldName: string,
  errors: RegistrationFormErrors
): 'valid' | 'invalid' | 'neutral' => {
  if (errors[fieldName as keyof RegistrationFormErrors]) {
    return 'invalid';
  }
  return 'neutral';
};

/**
 * Check if form is ready for submission
 */
export const isFormReadyForSubmission = (
  userType: UserType,
  data: Partial<SpecializedRegistrationData>
): boolean => {
  const validation = validateRegistrationData(userType, data);
  return validation.isValid;
};
