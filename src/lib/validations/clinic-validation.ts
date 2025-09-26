export interface ClinicRegistrationData {
  email: string;
  clinicName: string;
  legalName: string;
  rif: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  clinicType?: string;
  specialties?: string[];
  services?: string[];
}

export interface ClinicValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
}

export const validateClinicRegistration = (data: ClinicRegistrationData): ClinicValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  // Validar email
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email válido requerido';
  }

  // Validar nombre de clínica
  if (!data.clinicName || data.clinicName.trim().length < 2) {
    errors.clinicName = 'Nombre de clínica requerido (mínimo 2 caracteres)';
  }

  // Validar nombre legal
  if (!data.legalName || data.legalName.trim().length < 2) {
    errors.legalName = 'Nombre legal requerido (mínimo 2 caracteres)';
  }

  // Validar RIF
  if (!data.rif || !/^[JGVEP]-?\d{8}-?\d$/.test(data.rif.replace(/\s/g, ''))) {
    errors.rif = 'RIF válido requerido (formato: J-12345678-9)';
  }

  // Validar dirección
  if (!data.address || data.address.trim().length < 10) {
    errors.address = 'Dirección completa requerida (mínimo 10 caracteres)';
  }

  // Validar ciudad
  if (!data.city || data.city.trim().length < 2) {
    errors.city = 'Ciudad requerida (mínimo 2 caracteres)';
  }

  // Validar estado
  if (!data.state || data.state.trim().length < 2) {
    errors.state = 'Estado requerido (mínimo 2 caracteres)';
  }

  // Validar teléfono si se proporciona
  if (data.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(data.phone)) {
    warnings.push('Formato de teléfono puede ser mejorado');
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
};