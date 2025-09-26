/**
 * Medical Specialty Validation Service
 * @fileoverview Comprehensive validation for medical specialties and sub-specialties
 * @compliance HIPAA-compliant specialty validation with Venezuelan medical standards
 */

import { logSecurityEvent } from '@/lib/security/logging/security-logger';
import { createClient } from '@/lib/supabase/client';

/**
 * Medical specialty categories
 */
export type MedicalSpecialtyCategory = 
  | 'medicina_interna'
  | 'cirugia'
  | 'pediatria'
  | 'ginecologia_obstetricia'
  | 'psiquiatria'
  | 'radiologia'
  | 'anestesiologia'
  | 'medicina_emergencia'
  | 'medicina_familiar'
  | 'medicina_preventiva'
  | 'patologia'
  | 'medicina_laboral'
  | 'medicina_deportiva'
  | 'medicina_estetica'
  | 'medicina_legal'
  | 'veterinaria'
  | 'odontologia';

/**
 * Medical specialty interface
 */
export interface MedicalSpecialty {
  id: string;
  name: string;
  category: MedicalSpecialtyCategory;
  subSpecialties: string[];
  requirements: SpecialtyRequirements;
  availability: SpecialtyAvailability;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Specialty requirements
 */
export interface SpecialtyRequirements {
  minYearsExperience: number;
  requiredCertifications: string[];
  requiredLicenses: string[];
  continuingEducationHours: number;
  residencyRequired: boolean;
  fellowshipRequired: boolean;
  boardCertificationRequired: boolean;
  additionalRequirements: string[];
}

/**
 * Specialty availability
 */
export interface SpecialtyAvailability {
  isAvailable: boolean;
  maxSlots: number;
  currentSlots: number;
  waitingList: boolean;
  priorityLevel: 'high' | 'medium' | 'low';
  restrictions: string[];
}

/**
 * Specialty validation result
 */
export interface SpecialtyValidationResult {
  isValid: boolean;
  specialty: MedicalSpecialty;
  subSpecialty?: string;
  requirementsMet: boolean;
  availabilityStatus: 'available' | 'waiting_list' | 'unavailable';
  missingRequirements: string[];
  warnings: string[];
  recommendations: string[];
  confidence: 'high' | 'medium' | 'low';
  lastValidated: string;
}

/**
 * Medical specialty validation service
 */
export class MedicalSpecialtyValidationService {
  
  /**
   * Venezuelan medical specialties database
   */
  private static readonly VENEZUELAN_SPECIALTIES: Record<string, MedicalSpecialty> = {
    // Medicina Interna
    'cardiologia': {
      id: 'cardio_001',
      name: 'Cardiología',
      category: 'medicina_interna',
      subSpecialties: ['Cardiología Intervencionista', 'Electrofisiología', 'Ecocardiografía'],
      requirements: {
        minYearsExperience: 3,
        requiredCertifications: ['Certificado de Especialidad en Cardiología'],
        requiredLicenses: ['licencia_medica'],
        continuingEducationHours: 40,
        residencyRequired: true,
        fellowshipRequired: false,
        boardCertificationRequired: true,
        additionalRequirements: ['Certificación en RCP Avanzado', 'Certificación en Electrocardiografía']
      },
      availability: {
        isAvailable: true,
        maxSlots: 50,
        currentSlots: 35,
        waitingList: false,
        priorityLevel: 'high',
        restrictions: []
      },
      description: 'Especialidad médica que se encarga del diagnóstico y tratamiento de enfermedades del corazón y sistema cardiovascular.',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    
    'neurologia': {
      id: 'neuro_001',
      name: 'Neurología',
      category: 'medicina_interna',
      subSpecialties: ['Neurofisiología', 'Neurología Pediátrica', 'Neurología Vascular'],
      requirements: {
        minYearsExperience: 3,
        requiredCertifications: ['Certificado de Especialidad en Neurología'],
        requiredLicenses: ['licencia_medica'],
        continuingEducationHours: 40,
        residencyRequired: true,
        fellowshipRequired: false,
        boardCertificationRequired: true,
        additionalRequirements: ['Certificación en Electroencefalografía']
      },
      availability: {
        isAvailable: true,
        maxSlots: 30,
        currentSlots: 22,
        waitingList: false,
        priorityLevel: 'high',
        restrictions: []
      },
      description: 'Especialidad médica que estudia la estructura, función y desarrollo del sistema nervioso.',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    
    'gastroenterologia': {
      id: 'gastro_001',
      name: 'Gastroenterología',
      category: 'medicina_interna',
      subSpecialties: ['Endoscopia Digestiva', 'Hepatología', 'Nutrición Clínica'],
      requirements: {
        minYearsExperience: 3,
        requiredCertifications: ['Certificado de Especialidad en Gastroenterología'],
        requiredLicenses: ['licencia_medica'],
        continuingEducationHours: 40,
        residencyRequired: true,
        fellowshipRequired: false,
        boardCertificationRequired: true,
        additionalRequirements: ['Certificación en Endoscopia']
      },
      availability: {
        isAvailable: true,
        maxSlots: 25,
        currentSlots: 18,
        waitingList: false,
        priorityLevel: 'medium',
        restrictions: []
      },
      description: 'Especialidad médica que se ocupa del diagnóstico y tratamiento de enfermedades del aparato digestivo.',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    
    // Cirugía
    'cirugia_general': {
      id: 'cirugia_001',
      name: 'Cirugía General',
      category: 'cirugia',
      subSpecialties: ['Cirugía Laparoscópica', 'Cirugía de Trauma', 'Cirugía Oncológica'],
      requirements: {
        minYearsExperience: 4,
        requiredCertifications: ['Certificado de Especialidad en Cirugía General'],
        requiredLicenses: ['licencia_medica'],
        continuingEducationHours: 50,
        residencyRequired: true,
        fellowshipRequired: false,
        boardCertificationRequired: true,
        additionalRequirements: ['Certificación en Cirugía Mínimamente Invasiva']
      },
      availability: {
        isAvailable: true,
        maxSlots: 40,
        currentSlots: 28,
        waitingList: false,
        priorityLevel: 'high',
        restrictions: []
      },
      description: 'Especialidad quirúrgica que abarca el diagnóstico y tratamiento quirúrgico de enfermedades del abdomen.',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    
    'cirugia_cardiovascular': {
      id: 'cirugia_cardio_001',
      name: 'Cirugía Cardiovascular',
      category: 'cirugia',
      subSpecialties: ['Cirugía Cardíaca Pediátrica', 'Cirugía Vascular', 'Cirugía Torácica'],
      requirements: {
        minYearsExperience: 5,
        requiredCertifications: ['Certificado de Especialidad en Cirugía Cardiovascular'],
        requiredLicenses: ['licencia_medica'],
        continuingEducationHours: 60,
        residencyRequired: true,
        fellowshipRequired: true,
        boardCertificationRequired: true,
        additionalRequirements: ['Certificación en Cirugía Cardíaca', 'Certificación en ECMO']
      },
      availability: {
        isAvailable: true,
        maxSlots: 15,
        currentSlots: 12,
        waitingList: true,
        priorityLevel: 'high',
        restrictions: ['Requiere experiencia previa en cirugía general']
      },
      description: 'Especialidad quirúrgica que se encarga del tratamiento quirúrgico de enfermedades del corazón y vasos sanguíneos.',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    
    // Pediatría
    'pediatria': {
      id: 'pediatria_001',
      name: 'Pediatría',
      category: 'pediatria',
      subSpecialties: ['Neonatología', 'Cardiología Pediátrica', 'Neurología Pediátrica'],
      requirements: {
        minYearsExperience: 3,
        requiredCertifications: ['Certificado de Especialidad en Pediatría'],
        requiredLicenses: ['licencia_medica'],
        continuingEducationHours: 40,
        residencyRequired: true,
        fellowshipRequired: false,
        boardCertificationRequired: true,
        additionalRequirements: ['Certificación en RCP Pediátrico']
      },
      availability: {
        isAvailable: true,
        maxSlots: 60,
        currentSlots: 45,
        waitingList: false,
        priorityLevel: 'high',
        restrictions: []
      },
      description: 'Especialidad médica que se ocupa del cuidado de la salud de bebés, niños y adolescentes.',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    
    // Ginecología y Obstetricia
    'ginecologia_obstetricia': {
      id: 'gineco_001',
      name: 'Ginecología y Obstetricia',
      category: 'ginecologia_obstetricia',
      subSpecialties: ['Reproducción Humana', 'Oncología Ginecológica', 'Uroginecología'],
      requirements: {
        minYearsExperience: 3,
        requiredCertifications: ['Certificado de Especialidad en Ginecología y Obstetricia'],
        requiredLicenses: ['licencia_medica'],
        continuingEducationHours: 40,
        residencyRequired: true,
        fellowshipRequired: false,
        boardCertificationRequired: true,
        additionalRequirements: ['Certificación en Ultrasonido Obstétrico']
      },
      availability: {
        isAvailable: true,
        maxSlots: 35,
        currentSlots: 28,
        waitingList: false,
        priorityLevel: 'high',
        restrictions: []
      },
      description: 'Especialidad médica que se encarga del cuidado de la salud reproductiva de la mujer.',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    
    // Veterinaria
    'veterinaria_clinica': {
      id: 'vet_clinica_001',
      name: 'Veterinaria Clínica',
      category: 'veterinaria',
      subSpecialties: ['Cirugía Veterinaria', 'Medicina Interna Veterinaria', 'Dermatología Veterinaria'],
      requirements: {
        minYearsExperience: 2,
        requiredCertifications: ['Certificado de Especialidad en Veterinaria Clínica'],
        requiredLicenses: ['cedula_profesional_veterinario'],
        continuingEducationHours: 30,
        residencyRequired: false,
        fellowshipRequired: false,
        boardCertificationRequired: false,
        additionalRequirements: ['Certificación en Anestesia Veterinaria']
      },
      availability: {
        isAvailable: true,
        maxSlots: 20,
        currentSlots: 15,
        waitingList: false,
        priorityLevel: 'medium',
        restrictions: []
      },
      description: 'Especialidad veterinaria que se encarga del diagnóstico y tratamiento de enfermedades en animales.',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    
    // Odontología
    'odontologia_general': {
      id: 'odonto_general_001',
      name: 'Odontología General',
      category: 'odontologia',
      subSpecialties: ['Endodoncia', 'Periodoncia', 'Ortodoncia'],
      requirements: {
        minYearsExperience: 1,
        requiredCertifications: ['Certificado de Especialidad en Odontología'],
        requiredLicenses: ['cedula_profesional_odontologo'],
        continuingEducationHours: 20,
        residencyRequired: false,
        fellowshipRequired: false,
        boardCertificationRequired: false,
        additionalRequirements: ['Certificación en Radiología Dental']
      },
      availability: {
        isAvailable: true,
        maxSlots: 30,
        currentSlots: 22,
        waitingList: false,
        priorityLevel: 'medium',
        restrictions: []
      },
      description: 'Especialidad odontológica que se encarga del cuidado integral de la salud bucal.',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  /**
   * Validate medical specialty
   */
  static async validateSpecialty(
    specialtyName: string,
    subSpecialty?: string,
    doctorCredentials?: {
      licenseNumber?: string;
      yearsExperience?: number;
      certifications?: string[];
      professionalType?: 'medico' | 'veterinario' | 'odontologo';
    }
  ): Promise<SpecialtyValidationResult> {
    try {
      const normalizedSpecialty = specialtyName.toLowerCase().replace(/\s+/g, '_');
      const specialty = this.VENEZUELAN_SPECIALTIES[normalizedSpecialty];

      if (!specialty) {
        return {
          isValid: false,
          specialty: this.getDefaultSpecialty(),
          requirementsMet: false,
          availabilityStatus: 'unavailable',
          missingRequirements: ['Especialidad no reconocida'],
          warnings: [],
          recommendations: ['Verificar el nombre de la especialidad'],
          confidence: 'low',
          lastValidated: new Date().toISOString()
        };
      }

      const result: SpecialtyValidationResult = {
        isValid: true,
        specialty,
        subSpecialty,
        requirementsMet: true,
        availabilityStatus: 'available',
        missingRequirements: [],
        warnings: [],
        recommendations: [],
        confidence: 'high',
        lastValidated: new Date().toISOString()
      };

      // Validate sub-specialty
      if (subSpecialty) {
        const isValidSubSpecialty = specialty.subSpecialties.some(sub => 
          sub.toLowerCase() === subSpecialty.toLowerCase()
        );
        
        if (!isValidSubSpecialty) {
          result.warnings.push(`Sub-especialidad '${subSpecialty}' no reconocida para ${specialty}`);
          result.recommendations.push(`Sub-especialidades disponibles: ${availableSubSpecialties.join(', ')}`);
        }
      }

      // Validate requirements if doctor credentials are provided
      if (doctorCredentials) {
        this.validateRequirements(result, doctorCredentials);
      }

      // Check availability
      this.checkAvailability(result);

      // Determine confidence level
      result.confidence = this.determineConfidence(result);

      // Log validation
      logSecurityEvent('medical_specialty_validated', {
        specialty: specialtyName,
        subSpecialty,
        isValid: result.isValid,
        requirementsMet: result.requirementsMet,
        availabilityStatus: result.availabilityStatus,
        confidence: result.confidence,
        timestamp: result.lastValidated
      });

      return result;

    } catch (error) {
      logSecurityEvent('medical_specialty_validation_error', {
        specialty: specialtyName,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return {
        isValid: false,
        specialty: this.getDefaultSpecialty(),
        requirementsMet: false,
        availabilityStatus: 'unavailable',
        missingRequirements: ['Error en validación'],
        warnings: [],
        recommendations: [],
        confidence: 'low',
        lastValidated: new Date().toISOString()
      };
    }
  }

  /**
   * Validate specialty requirements
   */
  private static validateRequirements(
    result: SpecialtyValidationResult,
    credentials: {
      licenseNumber?: string;
      yearsExperience?: number;
      certifications?: string[];
      professionalType?: 'medico' | 'veterinario' | 'odontologo';
    }
  ): void {
    const requirements = result.specialty.requirements;

    // Check years of experience
    if (credentials.yearsExperience !== undefined) {
      if (credentials.yearsExperience < requirements.minYearsExperience) {
        result.missingRequirements.push(
          `Experiencia insuficiente: se requieren ${requirements.minYearsExperience} años, tiene ${credentials.yearsExperience}` 
        );
        result.requirementsMet = false;
      }
    }

    // Check certifications
    if (credentials.certifications) {
      for (const requiredCert of requirements.requiredCertifications) {
        const hasCertification = credentials.certifications.some(cert => 
          cert.toLowerCase().includes(requiredCert.toLowerCase())
        );
        
        if (!hasCertification) {
          result.missingRequirements.push(`Certificación requerida: ${requiredCert}`);
          result.requirementsMet = false;
        }
      }
    }

    // Check professional type compatibility
    if (credentials.professionalType) {
      const isCompatible = this.isProfessionalTypeCompatible(
        credentials.professionalType,
        result.specialty.category
      );
      
      if (!isCompatible) {
        result.missingRequirements.push(
          `Tipo profesional '${credentials.professionalType}' no compatible con especialidad '${result.specialty.category}'`
        );
        result.requirementsMet = false;
      }
    }

    // Add recommendations
    if (requirements.residencyRequired && !credentials.certifications?.some(cert => cert.includes('Residencia'))) {
      result.recommendations.push('Se recomienda completar programa de residencia');
    }

    if (requirements.fellowshipRequired && !credentials.certifications?.some(cert => cert.includes('Fellowship'))) {
      result.recommendations.push('Se recomienda completar programa de fellowship');
    }

    if (requirements.boardCertificationRequired && !credentials.certifications?.some(cert => cert.includes('Board'))) {
      result.recommendations.push('Se recomienda obtener certificación de board');
    }
  }

  /**
   * Check specialty availability
   */
  private static checkAvailability(result: SpecialtyValidationResult): void {
    const availability = result.specialty.availability;

    if (!availability.isAvailable) {
      result.availabilityStatus = 'unavailable';
      result.warnings.push('Especialidad no disponible actualmente');
      return;
    }

    if (availability.currentSlots >= availability.maxSlots) {
      if (availability.waitingList) {
        result.availabilityStatus = 'waiting_list';
        result.warnings.push('Especialidad con lista de espera');
      } else {
        result.availabilityStatus = 'unavailable';
        result.warnings.push('Especialidad sin cupos disponibles');
      }
    }

    if (availability.restrictions.length > 0) {
      result.warnings.push('Restricciones: ' + availability.restrictions.join(', '));
    }
  }

  /**
   * Check if professional type is compatible with specialty category
   */
  private static isProfessionalTypeCompatible(
    professionalType: 'medico' | 'veterinario' | 'odontologo',
    specialtyCategory: MedicalSpecialtyCategory
  ): boolean {
    const compatibility: Record<string, MedicalSpecialtyCategory[]> = {
      'medico': [
        'medicina_interna', 'cirugia', 'pediatria', 'ginecologia_obstetricia',
        'psiquiatria', 'radiologia', 'anestesiologia', 'medicina_emergencia',
        'medicina_familiar', 'medicina_preventiva', 'patologia', 'medicina_laboral',
        'medicina_deportiva', 'medicina_estetica', 'medicina_legal'
      ],
      'veterinario': ['veterinaria'],
      'odontologo': ['odontologia']
    };

    return compatibility[professionalType]?.includes(specialtyCategory) || false;
  }

  /**
   * Determine confidence level
   */
  private static determineConfidence(result: SpecialtyValidationResult): 'high' | 'medium' | 'low' {
    let score = 0;

    if (result.isValid) score += 2;
    if (result.requirementsMet) score += 2;
    if (result.availabilityStatus === 'available') score += 1;
    if (result.warnings.length === 0) score += 1;
    if (result.missingRequirements.length === 0) score += 1;

    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  /**
   * Get default specialty for error cases
   */
  private static getDefaultSpecialty(): MedicalSpecialty {
    return {
      id: 'default',
      name: 'Especialidad No Reconocida',
      category: 'medicina_interna',
      subSpecialties: [],
      requirements: {
        minYearsExperience: 0,
        requiredCertifications: [],
        requiredLicenses: [],
        continuingEducationHours: 0,
        residencyRequired: false,
        fellowshipRequired: false,
        boardCertificationRequired: false,
        additionalRequirements: []
      },
      availability: {
        isAvailable: false,
        maxSlots: 0,
        currentSlots: 0,
        waitingList: false,
        priorityLevel: 'low',
        restrictions: ['Especialidad no reconocida']
      },
      description: 'Especialidad no reconocida en el sistema',
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Get all available specialties
   */
  static getAllSpecialties(): MedicalSpecialty[] {
    return Object.values(this.VENEZUELAN_SPECIALTIES);
  }

  /**
   * Get specialties by category
   */
  static getSpecialtiesByCategory(category: MedicalSpecialtyCategory): MedicalSpecialty[] {
    return Object.values(this.VENEZUELAN_SPECIALTIES).filter(specialty => 
      specialty.category === category
    );
  }

  /**
   * Search specialties by name
   */
  static searchSpecialties(query: string): MedicalSpecialty[] {
    const normalizedQuery = query.toLowerCase();
    
    return Object.values(this.VENEZUELAN_SPECIALTIES).filter(specialty =>
      specialty.name.toLowerCase().includes(normalizedQuery) ||
      specialty.description.toLowerCase().includes(normalizedQuery) ||
      specialty.subSpecialties.some(sub => sub.toLowerCase().includes(normalizedQuery))
    );
  }

  /**
   * Validate medical schedules for specialty
   */
  static validateMedicalSchedules(
    specialtyId: string,
    workingHours: {
      monday: { isWorkingDay: boolean; startTime?: string; endTime?: string };
      tuesday: { isWorkingDay: boolean; startTime?: string; endTime?: string };
      wednesday: { isWorkingDay: boolean; startTime?: string; endTime?: string };
      thursday: { isWorkingDay: boolean; startTime?: string; endTime?: string };
      friday: { isWorkingDay: boolean; startTime?: string; endTime?: string };
      saturday: { isWorkingDay: boolean; startTime?: string; endTime?: string };
      sunday: { isWorkingDay: boolean; startTime?: string; endTime?: string };
    }
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];
    totalHours: number;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let totalHours = 0;

    try {
      const specialty = this.VENEZUELAN_SPECIALTIES[specialtyId];
      if (!specialty) {
        errors.push('Especialidad no encontrada');
        return { isValid: false, errors, warnings, recommendations, totalHours };
      }

      const days = Object.entries(workingHours);
      
      for (const [day, schedule] of days) {
        if (schedule.isWorkingDay) {
          if (!schedule.startTime || !schedule.endTime) {
            errors.push(`${day}: Horarios de inicio y fin son requeridos`);
            continue;
          }

          const startTime = this.parseTime(schedule.startTime);
          const endTime = this.parseTime(schedule.endTime);

          if (!startTime || !endTime) {
            errors.push(`${day}: Formato de horario inválido`);
            continue;
          }

          const dayHours = this.calculateHours(startTime, endTime);
          
          if (dayHours <= 0) {
            errors.push(`${day}: Horario de fin debe ser posterior al de inicio`);
            continue;
          }

          if (dayHours > 12) {
            warnings.push(`${day}: Horario muy extenso (${dayHours}h), considere descansos`);
          }

          if (dayHours < 4) {
            warnings.push(`${day}: Horario muy corto (${dayHours}h)`);
          }

          totalHours += dayHours;
        }
      }

      // Validate minimum working hours based on specialty
      const minHours = this.getMinimumHoursForSpecialty(specialtyId);
      if (totalHours < minHours) {
        errors.push(`Horas mínimas requeridas: ${minHours}h, configuradas: ${totalHours}h`);
      }

      // Specialty-specific validations
      this.validateSpecialtySpecificSchedules(specialtyId, workingHours, warnings, recommendations);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        recommendations,
        totalHours
      };

    } catch (error) {
      errors.push('Error validando horarios médicos');
      return { isValid: false, errors, warnings, recommendations, totalHours };
    }
  }

  /**
   * Check specialty availability with detailed status
   */
  static async checkSpecialtyAvailability(specialtyId: string): Promise<{
    available: boolean;
    status: 'available' | 'waiting_list' | 'unavailable' | 'restricted';
    slotsRemaining: number;
    estimatedWaitTime?: string;
    restrictions: string[];
    priorityLevel: 'high' | 'medium' | 'low';
  }> {
    try {
      const specialty = this.VENEZUELAN_SPECIALTIES[specialtyId];
      if (!specialty) {
        return {
          available: false,
          status: 'unavailable',
          slotsRemaining: 0,
          restrictions: ['Especialidad no encontrada'],
          priorityLevel: 'low'
        };
      }

      const availability = specialty.availability;
      const slotsRemaining = availability.maxSlots - availability.currentSlots;

      let status: 'available' | 'waiting_list' | 'unavailable' | 'restricted' = 'available';
      let estimatedWaitTime: string | undefined;

      if (!availability.isAvailable) {
        status = 'unavailable';
      } else if (slotsRemaining <= 0) {
        status = availability.waitingList ? 'waiting_list' : 'unavailable';
        if (availability.waitingList) {
          estimatedWaitTime = this.calculateEstimatedWaitTime(specialtyId);
        }
      } else if (availability.restrictions.length > 0) {
        status = 'restricted';
      }

      return {
        available: availability.isAvailable && slotsRemaining > 0,
        status,
        slotsRemaining: Math.max(0, slotsRemaining),
        estimatedWaitTime,
        restrictions: availability.restrictions,
        priorityLevel: availability.priorityLevel
      };

    } catch (error) {
      return {
        available: false,
        status: 'unavailable',
        slotsRemaining: 0,
        restrictions: ['Error verificando disponibilidad'],
        priorityLevel: 'low'
      };
    }
  }

  /**
   * Validate sub-specialties with detailed requirements
   */
  static validateSubSpecialties(
    specialtyId: string,
    subSpecialties: string[]
  ): {
    valid: boolean;
    validSubSpecialties: string[];
    invalidSubSpecialties: string[];
    missingRequirements: string[];
    recommendations: string[];
  } {
    const validSubSpecialties: string[] = [];
    const invalidSubSpecialties: string[] = [];
    const missingRequirements: string[] = [];
    const recommendations: string[] = [];

    try {
      const specialty = this.VENEZUELAN_SPECIALTIES[specialtyId];
      if (!specialty) {
        return {
          valid: false,
          validSubSpecialties: [],
          invalidSubSpecialties: subSpecialties,
          missingRequirements: ['Especialidad no encontrada'],
          recommendations: []
        };
      }

      for (const subSpecialty of subSpecialties) {
        const isValid = specialty.subSpecialties.some(sub => 
          sub.toLowerCase() === subSpecialty.toLowerCase()
        );

        if (isValid) {
          validSubSpecialties.push(subSpecialty);
        } else {
          invalidSubSpecialties.push(subSpecialty);
        }
      }

      // Check if specialty allows multiple sub-specialties
      if (subSpecialties.length > 1 && !this.allowsMultipleSubSpecialties(specialtyId)) {
        missingRequirements.push('Esta especialidad no permite múltiples sub-especialidades');
      }

      // Provide recommendations for invalid sub-specialties
      if (invalidSubSpecialties.length > 0) {
        recommendations.push(`Sub-especialidades válidas: ${specialty.subSpecialties.join(', ')}`);
      }

      return {
        valid: invalidSubSpecialties.length === 0,
        validSubSpecialties,
        invalidSubSpecialties,
        missingRequirements,
        recommendations
      };

    } catch (error) {
      return {
        valid: false,
        validSubSpecialties: [],
        invalidSubSpecialties: subSpecialties,
        missingRequirements: ['Error validando sub-especialidades'],
        recommendations: []
      };
    }
  }

  /**
   * Get specialty validation service status
   */
  static getStatus(): {
    initialized: boolean;
    totalSpecialties: number;
    categories: number;
    activeSpecialties: number;
  } {
    const specialties = Object.values(this.VENEZUELAN_SPECIALTIES);
    
    return {
      initialized: true,
      totalSpecialties: specialties.length,
      categories: new Set(specialties.map(s => s.category)).size,
      activeSpecialties: specialties.filter(s => s.isActive).length
    };
  }

  // Helper methods for new validations

  private static parseTime(timeString: string): { hours: number; minutes: number } | null {
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null;
      }
      return { hours, minutes };
    } catch {
      return null;
    }
  }

  private static calculateHours(startTime: { hours: number; minutes: number }, endTime: { hours: number; minutes: number }): number {
    const startMinutes = startTime.hours * 60 + startTime.minutes;
    const endMinutes = endTime.hours * 60 + endTime.minutes;
    return (endMinutes - startMinutes) / 60;
  }

  private static getMinimumHoursForSpecialty(specialtyId: string): number {
    const specialty = this.VENEZUELAN_SPECIALTIES[specialtyId];
    if (!specialty) return 0;

    // Different specialties have different minimum hour requirements
    const minHoursMap: Record<string, number> = {
      'cardiologia': 40,
      'neurologia': 40,
      'pediatria': 35,
      'ginecologia_obstetricia': 40,
      'cirugia_general': 45,
      'medicina_emergencia': 48,
      'medicina_familiar': 30,
      'psiquiatria': 35,
      'radiologia': 40,
      'anestesiologia': 40
    };

    return minHoursMap[specialtyId] || 30; // Default 30 hours
  }

  private static validateSpecialtySpecificSchedules(
    specialtyId: string,
    workingHours: any,
    warnings: string[],
    recommendations: string[]
  ): void {
    // Emergency medicine should have 24/7 availability
    if (specialtyId === 'medicina_emergencia') {
      const hasWeekendHours = workingHours.saturday.isWorkingDay || workingHours.sunday.isWorkingDay;
      if (!hasWeekendHours) {
        warnings.push('Medicina de emergencia debería tener horarios de fin de semana');
      }
    }

    // Surgery specialties should have consistent schedules
    if (specialtyId.includes('cirugia')) {
      const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      const weekdayHours = weekdays.filter(day => workingHours[day].isWorkingDay).length;
      
      if (weekdayHours < 4) {
        recommendations.push('Especialidades quirúrgicas requieren horarios consistentes de lunes a viernes');
      }
    }

    // Psychiatry should have flexible hours
    if (specialtyId === 'psiquiatria') {
      const hasEveningHours = Object.values(workingHours).some((schedule: any) => {
        if (!schedule.isWorkingDay || !schedule.startTime) return false;
        const startTime = this.parseTime(schedule.startTime);
        return startTime && startTime.hours >= 17; // After 5 PM
      });

      if (!hasEveningHours) {
        recommendations.push('Psiquiatría se beneficia de horarios vespertinos');
      }
    }
  }

  private static calculateEstimatedWaitTime(specialtyId: string): string {
    // This would integrate with actual waiting list data
    const waitTimeMap: Record<string, string> = {
      'cardiologia': '2-4 semanas',
      'neurologia': '3-6 semanas',
      'pediatria': '1-2 semanas',
      'ginecologia_obstetricia': '2-3 semanas',
      'cirugia_general': '4-8 semanas'
    };

    return waitTimeMap[specialtyId] || '2-6 semanas';
  }

  private static allowsMultipleSubSpecialties(specialtyId: string): boolean {
    // Some specialties allow multiple sub-specialties, others don't
    const multiSubSpecialtyMap: Record<string, boolean> = {
      'cardiologia': true,
      'neurologia': true,
      'cirugia_general': true,
      'medicina_interna': true,
      'pediatria': false,
      'ginecologia_obstetricia': false,
      'psiquiatria': false
    };

    return multiSubSpecialtyMap[specialtyId] || false;
  }
}
