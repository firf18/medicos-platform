/**
 * License Validation Service
 * @fileoverview Service responsible for medical license validation and availability checking
 * @compliance HIPAA-compliant license validation with audit trail
 */

import { createClient } from '@/lib/supabase/client';
import { logSecurityEvent } from '../logging/security-logger';
import { sanitizeLicenseNumber } from '../sanitization/input-sanitizer';
import puppeteer, { Browser, Page } from 'puppeteer';

export interface LicenseValidationResult {
  isValid: boolean;
  isAvailable: boolean;
  formatted: string;
  error?: string;
  suggestions?: string[];
  licenseInfo?: {
    type: 'cedula_profesional' | 'licencia_medica' | 'registro_profesional';
    state: string;
    format: string;
  };
  sacsData?: SACSValidationData;
  cacheInfo?: {
    cached: boolean;
    cachedAt: string;
    expiresAt: string;
  };
}

export interface SACSValidationData {
  cedula: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  subEspecialidad?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'VENCIDO' | 'NO_REGISTRADO';
  fechaEmision: string;
  fechaVencimiento: string;
  institucion: string;
  tipoProfesional: 'MEDICO' | 'VETERINARIO' | 'ODONTOLOGO' | 'FARMACEUTICO' | 'ENFERMERO' | 'OTRO';
  numeroRegistro: string;
  colegioProfesional: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  observaciones?: string;
  ultimaActualizacion: string;
  fuente: 'SACS';
  validado: boolean;
  errores?: string[];
}

export interface LicenseCacheData {
  cedula: string;
  sacsData: SACSValidationData;
  cachedAt: string;
  expiresAt: string;
  source: 'SACS' | 'CACHE';
}

interface CacheRecord {
  cedula: string;
  sacs_data: SACSValidationData;
  cached_at: string;
  expires_at: string;
}

export interface LicenseAvailabilityCheck {
  licenseNumber: string;
  formatted: string;
  isAvailable: boolean;
  checkedAt: string;
  source: 'database' | 'cache';
}

/**
 * Venezuelan medical license patterns
 */
const VENEZUELAN_LICENSE_PATTERNS = {
  cedula_profesional: {
    pattern: /^[A-Z]-\d{6,8}$/,
    description: 'Cédula Profesional Venezolana',
    example: 'V-12345678'
  },
  licencia_medica: {
    pattern: /^LM-\d{6,8}$/,
    description: 'Licencia Médica',
    example: 'LM-12345678'
  },
  registro_profesional: {
    pattern: /^RP-\d{6,8}$/,
    description: 'Registro Profesional',
    example: 'RP-12345678'
  }
};

/**
 * SACS scraping configuration
 */
const SACS_CONFIG = {
  baseUrl: 'https://sistemas.sacs.gob.ve/consultas/prfsnal_salud',
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 2000, // 2 seconds
  cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  selectors: {
    cedulaInput: 'input[name="cedula"]',
    submitButton: 'input[type="submit"]',
    resultsTable: 'table.resultados',
    noResultsMessage: '.no-resultados',
    errorMessage: '.error',
    loadingIndicator: '.loading',
    nombre: 'td:nth-child(1)',
    apellido: 'td:nth-child(2)',
    especialidad: 'td:nth-child(3)',
    estado: 'td:nth-child(4)',
    fechaEmision: 'td:nth-child(5)',
    fechaVencimiento: 'td:nth-child(6)',
    institucion: 'td:nth-child(7)',
    numeroRegistro: 'td:nth-child(8)'
  }
};

/**
 * Venezuelan medical specialties mapping
 */
const VENEZUELAN_SPECIALTIES = {
  'MEDICINA GENERAL': ['MEDICINA INTERNA', 'MEDICINA FAMILIAR'],
  'CIRUGIA GENERAL': ['CIRUGIA PLASTICA', 'CIRUGIA CARDIOVASCULAR', 'CIRUGIA PEDIATRICA'],
  'PEDIATRIA': ['NEONATOLOGIA', 'CARDIOLOGIA PEDIATRICA'],
  'GINECOLOGIA': ['OBSTETRICIA', 'GINECOLOGIA ONCOLOGICA'],
  'CARDIOLOGIA': ['CARDIOLOGIA INTERVENCIONISTA', 'ELECTROFISIOLOGIA'],
  'NEUROLOGIA': ['NEUROCIRUGIA', 'NEUROLOGIA PEDIATRICA'],
  'PSIQUIATRIA': ['PSIQUIATRIA INFANTIL', 'PSIQUIATRIA GERIATRICA'],
  'DERMATOLOGIA': ['DERMATOLOGIA PEDIATRICA'],
  'OFTALMOLOGIA': ['OFTALMOLOGIA PEDIATRICA'],
  'OTORRINOLARINGOLOGIA': ['OTORRINOLARINGOLOGIA PEDIATRICA'],
  'ORTOPEDIA': ['ORTOPEDIA PEDIATRICA', 'TRAUMATOLOGIA'],
  'ANESTESIOLOGIA': ['ANESTESIOLOGIA PEDIATRICA'],
  'RADIOLOGIA': ['RADIOLOGIA PEDIATRICA', 'RADIOLOGIA INTERVENCIONISTA'],
  'MEDICINA INTERNA': ['GASTROENTEROLOGIA', 'NEFROLOGIA', 'ENDOCRINOLOGIA'],
  'EMERGENCIA': ['MEDICINA DE EMERGENCIA'],
  'VETERINARIA': ['VETERINARIA GENERAL', 'VETERINARIA PECUARIA']
};

/**
 * License validation service with real Supabase integration
 */
export class LicenseValidationService {
  private static readonly MAX_LICENSE_LENGTH = 15;
  private static readonly MIN_LICENSE_LENGTH = 8;
  private static readonly CACHE_TABLE = 'license_validation_cache';
  private static browser: Browser | null = null;

  /**
   * Validate Venezuelan medical license format
   */
  static validateLicenseFormat(licenseNumber: string): LicenseValidationResult {
    try {
      // Sanitize input
      const sanitizedLicense = sanitizeLicenseNumber(licenseNumber);
      
      if (!sanitizedLicense) {
        return {
          isValid: false,
          isAvailable: false,
          formatted: '',
          error: 'Número de licencia es requerido'
        };
      }

      // Normalize to uppercase
      const normalizedLicense = sanitizedLicense.toUpperCase().trim();

      // Check length
      if (normalizedLicense.length < this.MIN_LICENSE_LENGTH || normalizedLicense.length > this.MAX_LICENSE_LENGTH) {
        return {
          isValid: false,
          isAvailable: false,
          formatted: '',
          error: `Número de licencia debe tener entre ${this.MIN_LICENSE_LENGTH} y ${this.MAX_LICENSE_LENGTH} caracteres`
        };
      }

      // Check against known patterns
      for (const [type, pattern] of Object.entries(VENEZUELAN_LICENSE_PATTERNS)) {
        if (pattern.pattern.test(normalizedLicense)) {
          return {
            isValid: true,
            isAvailable: false, // Will be checked separately
            formatted: normalizedLicense,
            error: undefined,
            licenseInfo: {
              type: type as 'cedula_profesional' | 'licencia_medica' | 'registro_profesional',
              state: 'Venezuela',
              format: pattern.example
            }
          };
        }
      }

      return {
        isValid: false,
        isAvailable: false,
        formatted: '',
        error: 'Formato de licencia médica inválido. Use formato: V-12345678, LM-12345678, o RP-12345678'
      };

    } catch (error) {
      logSecurityEvent(
        'data_access',
        'license_validation_error',
        {
          licenseNumber: licenseNumber.substring(0, 5) + '***',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        'error'
      );

      return {
        isValid: false,
        isAvailable: false,
        formatted: '',
        error: 'Error interno de validación'
      };
    }
  }

  /**
   * Scrape SACS system for license validation
   */
  static async scrapeSACS(cedula: string): Promise<SACSValidationData> {
    try {
      // Validate cedula format first
      if (!this.isValidCedulaFormat(cedula)) {
        throw new Error('Formato de cédula inválido');
      }

      // Check cache first
      const cachedData = await this.getCachedValidation(cedula);
      if (cachedData) {
        logSecurityEvent(
          'data_access',
          'sacs_cache_hit',
          {
            cedula: cedula.substring(0, 5) + '***'
          },
          'info'
        );
        return cachedData.sacsData;
      }

      logSecurityEvent(
        'data_access',
        'sacs_scraping_started',
        {
          cedula: cedula.substring(0, 5) + '***'
        },
        'info'
      );

      // Initialize browser if needed
      if (!this.browser) {
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        });
      }

      const page = await this.browser.newPage();
      
      try {
        // Set user agent and viewport
        await page.setUserAgent(SACS_CONFIG.userAgent);
        await page.setViewport({ width: 1920, height: 1080 });

        // Navigate to SACS
        await page.goto(SACS_CONFIG.baseUrl, { 
          waitUntil: 'networkidle2',
          timeout: SACS_CONFIG.timeout 
        });

        // Wait for form to load
        await page.waitForSelector(SACS_CONFIG.selectors.cedulaInput, { timeout: 10000 });

        // Fill cedula input
        await page.type(SACS_CONFIG.selectors.cedulaInput, cedula);

        // Submit form
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: SACS_CONFIG.timeout }),
          page.click(SACS_CONFIG.selectors.submitButton)
        ]);

        // Wait for results to load
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check for error messages
        const errorElement = await page.$(SACS_CONFIG.selectors.errorMessage);
        if (errorElement) {
          const errorText = await page.evaluate(el => el.textContent, errorElement);
          throw new Error(`Error en SACS: ${errorText}`);
        }

        // Check for no results message
        const noResultsElement = await page.$(SACS_CONFIG.selectors.noResultsMessage);
        if (noResultsElement) {
          const sacsData: SACSValidationData = {
            cedula,
            nombre: '',
            apellido: '',
            especialidad: '',
            estado: 'NO_REGISTRADO',
            fechaEmision: '',
            fechaVencimiento: '',
            institucion: '',
            tipoProfesional: 'OTRO',
            numeroRegistro: '',
            colegioProfesional: '',
            ultimaActualizacion: new Date().toISOString(),
            fuente: 'SACS',
            validado: true,
            errores: ['No registrado en SACS']
          };

          // Cache the result
          await this.cacheValidation(cedula, sacsData);
          
          return sacsData;
        }

        // Extract data from results table
        const sacsData = await this.extractSACSData(page, cedula);

        // Cache the result
        await this.cacheValidation(cedula, sacsData);

        logSecurityEvent(
          'data_access',
          'sacs_scraping_completed',
          {
            cedula: cedula.substring(0, 5) + '***',
            estado: sacsData.estado,
            especialidad: sacsData.especialidad
          },
          'info'
        );

        return sacsData;

      } finally {
        await page.close();
      }

    } catch (error) {
      logSecurityEvent(
        'data_access',
        'sacs_scraping_error',
        {
          cedula: cedula.substring(0, 5) + '***',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        'error'
      );

      // Return error data
      return {
        cedula,
        nombre: '',
        apellido: '',
        especialidad: '',
        estado: 'NO_REGISTRADO',
        fechaEmision: '',
        fechaVencimiento: '',
        institucion: '',
        tipoProfesional: 'OTRO',
        numeroRegistro: '',
        colegioProfesional: '',
        ultimaActualizacion: new Date().toISOString(),
        fuente: 'SACS',
        validado: false,
        errores: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Extract data from SACS results page
   */
  private static async extractSACSData(page: Page, cedula: string): Promise<SACSValidationData> {
    try {
      // Check if results table exists
      const resultsTable = await page.$(SACS_CONFIG.selectors.resultsTable);
      if (!resultsTable) {
        throw new Error('No se encontró tabla de resultados');
      }

      // Extract data from table
      const data = await page.evaluate((selectors) => {
        const nombre = document.querySelector(selectors.nombre)?.textContent?.trim() || '';
        const apellido = document.querySelector(selectors.apellido)?.textContent?.trim() || '';
        const especialidad = document.querySelector(selectors.especialidad)?.textContent?.trim() || '';
        const estado = document.querySelector(selectors.estado)?.textContent?.trim() || '';
        const fechaEmision = document.querySelector(selectors.fechaEmision)?.textContent?.trim() || '';
        const fechaVencimiento = document.querySelector(selectors.fechaVencimiento)?.textContent?.trim() || '';
        const institucion = document.querySelector(selectors.institucion)?.textContent?.trim() || '';
        const numeroRegistro = document.querySelector(selectors.numeroRegistro)?.textContent?.trim() || '';

        return {
          nombre,
          apellido,
          especialidad,
          estado,
          fechaEmision,
          fechaVencimiento,
          institucion,
          numeroRegistro
        };
      }, SACS_CONFIG.selectors);

      // Determine professional type based on specialty
      const tipoProfesional = this.determineProfessionalType(data.especialidad);

      // Determine status
      const estado = this.determineStatus(data.estado, data.fechaVencimiento);

      const sacsData: SACSValidationData = {
        cedula,
        nombre: data.nombre,
        apellido: data.apellido,
        especialidad: data.especialidad,
        estado,
        fechaEmision: data.fechaEmision,
        fechaVencimiento: data.fechaVencimiento,
        institucion: data.institucion,
        tipoProfesional,
        numeroRegistro: data.numeroRegistro,
        colegioProfesional: this.getColegioProfesional(tipoProfesional),
        ultimaActualizacion: new Date().toISOString(),
        fuente: 'SACS',
        validado: true
      };

      return sacsData;

    } catch (error) {
      throw new Error(`Error extrayendo datos de SACS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Determine professional type from specialty
   */
  private static determineProfessionalType(especialidad: string): SACSValidationData['tipoProfesional'] {
    const upperEspecialidad = especialidad.toUpperCase();
    
    if (upperEspecialidad.includes('VETERINAR')) {
      return 'VETERINARIO';
    } else if (upperEspecialidad.includes('ODONTOLOG') || upperEspecialidad.includes('DENTAL')) {
      return 'ODONTOLOGO';
    } else if (upperEspecialidad.includes('FARMACEUT') || upperEspecialidad.includes('QUIMICO')) {
      return 'FARMACEUTICO';
    } else if (upperEspecialidad.includes('ENFERMER')) {
      return 'ENFERMERO';
    } else if (upperEspecialidad.includes('MEDICINA') || upperEspecialidad.includes('CIRUGIA') || 
               upperEspecialidad.includes('PEDIATR') || upperEspecialidad.includes('GINECOLOG') ||
               upperEspecialidad.includes('CARDIOLOG') || upperEspecialidad.includes('NEUROLOG') ||
               upperEspecialidad.includes('PSIQUIATR') || upperEspecialidad.includes('DERMATOLOG') ||
               upperEspecialidad.includes('OFTALMOLOG') || upperEspecialidad.includes('OTORRINOLARINGOLOG') ||
               upperEspecialidad.includes('ORTOPED') || upperEspecialidad.includes('ANESTESIOLOG') ||
               upperEspecialidad.includes('RADIOLOG') || upperEspecialidad.includes('EMERGENCIA')) {
      return 'MEDICO';
    } else {
      return 'OTRO';
    }
  }

  /**
   * Determine license status
   */
  private static determineStatus(estado: string, fechaVencimiento: string): SACSValidationData['estado'] {
    const upperEstado = estado.toUpperCase();
    
    if (upperEstado.includes('ACTIVO') || upperEstado.includes('VIGENTE')) {
      // Check if expired
      if (fechaVencimiento) {
        const vencimiento = new Date(fechaVencimiento);
        const hoy = new Date();
        if (vencimiento < hoy) {
          return 'VENCIDO';
        }
      }
      return 'ACTIVO';
    } else if (upperEstado.includes('INACTIVO') || upperEstado.includes('SUSPENDIDO')) {
      return 'SUSPENDIDO';
    } else if (upperEstado.includes('VENCIDO') || upperEstado.includes('EXPIRADO')) {
      return 'VENCIDO';
    } else {
      return 'INACTIVO';
    }
  }

  /**
   * Get colegio profesional based on professional type
   */
  private static getColegioProfesional(tipoProfesional: SACSValidationData['tipoProfesional']): string {
    const colegios = {
      'MEDICO': 'Colegio de Médicos de Venezuela',
      'VETERINARIO': 'Colegio de Veterinarios de Venezuela',
      'ODONTOLOGO': 'Colegio de Odontólogos de Venezuela',
      'FARMACEUTICO': 'Colegio de Farmacéuticos de Venezuela',
      'ENFERMERO': 'Colegio de Enfermeros de Venezuela',
      'OTRO': 'Colegio Profesional'
    };
    
    return colegios[tipoProfesional] || 'Colegio Profesional';
  }

  /**
   * Validate cedula format
   */
  private static isValidCedulaFormat(cedula: string): boolean {
    // Venezuelan cedula format: V-12345678, E-12345678, J-12345678, G-12345678
    const cedulaPattern = /^[JVGE]-\d{7,8}$/;
    return cedulaPattern.test(cedula.toUpperCase());
  }

  /**
   * Get cached validation data
   */
  private static async getCachedValidation(cedula: string): Promise<LicenseCacheData | null> {
    try {
      // Note: This would require creating the license_validation_cache table in Supabase
      // For now, we'll return null to always fetch fresh data
      console.log('Checking cache for cedula:', cedula.substring(0, 5) + '***');
      return null;

    } catch (error) {
      return null;
    }
  }

  /**
   * Cache validation data
   */
  private static async cacheValidation(cedula: string, sacsData: SACSValidationData): Promise<void> {
    try {
      const supabase = createClient();
      const expiresAt = new Date(Date.now() + SACS_CONFIG.cacheExpiry);

      const cacheRecord: CacheRecord = {
        cedula,
        sacs_data: sacsData,
        cached_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      };

      // Note: This would require creating the license_validation_cache table in Supabase
      // For now, we'll use a mock implementation
      console.log('Caching validation data:', {
        cedula: cacheRecord.cedula.substring(0, 5) + '***',
        cached_at: cacheRecord.cached_at
      });

    } catch (error) {
      logSecurityEvent(
        'data_access',
        'license_cache_error',
        {
          cedula: cedula.substring(0, 5) + '***',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        'error'
      );
    }
  }

  /**
   * Format license number to standard format
   */
  static formatLicenseNumber(licenseNumber: string): string {
    try {
      const sanitizedLicense = sanitizeLicenseNumber(licenseNumber);
      if (!sanitizedLicense) return '';

      return sanitizedLicense.toUpperCase().trim();

    } catch (error) {
      return licenseNumber;
    }
  }

  /**
   * Check license availability in Supabase database
   */
  static async checkLicenseAvailability(licenseNumber: string): Promise<LicenseAvailabilityCheck> {
    try {
      const supabase = createClient();
      
      // Validate format first
      const formatValidation = this.validateLicenseFormat(licenseNumber);
      if (!formatValidation.isValid) {
        throw new Error(formatValidation.error || 'Licencia inválida');
      }

      const formattedLicense = formatValidation.formatted;

      // Log the check attempt
      logSecurityEvent(
        'data_access',
        'license_availability_check_started',
        {
          licenseNumber: formattedLicense.substring(0, 5) + '***'
        },
        'info'
      );

      // Check in doctor_profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('doctor_profiles')
        .select('license_number')
        .eq('license_number', formattedLicense)
        .maybeSingle();

      if (profileError) {
        logSecurityEvent(
          'data_access',
          'license_availability_check_error',
          {
            licenseNumber: formattedLicense.substring(0, 5) + '***',
            error: profileError.message
          },
          'error'
        );
        throw new Error('Error verificando disponibilidad de la licencia');
      }

      // Check in doctor_registrations table (for pending registrations)
      const { data: registrationData, error: registrationError } = await supabase
        .from('doctor_registrations')
        .select('license_number')
        .eq('license_number', formattedLicense)
        .maybeSingle();

      if (registrationError) {
        logSecurityEvent(
          'data_access',
          'license_availability_check_error',
          {
            licenseNumber: formattedLicense.substring(0, 5) + '***',
            error: registrationError.message
          },
          'error'
        );
        throw new Error('Error verificando registros pendientes');
      }

      const isAvailable = !profileData && !registrationData;

      // Log the result
      logSecurityEvent(
        'data_access',
        'license_availability_check_completed',
        {
          licenseNumber: formattedLicense.substring(0, 5) + '***',
          isAvailable
        },
        'info'
      );

      return {
        licenseNumber: formattedLicense,
        formatted: formattedLicense,
        isAvailable,
        checkedAt: new Date().toISOString(),
        source: 'database'
      };

    } catch (error) {
      logSecurityEvent(
        'data_access',
        'license_availability_check_failed',
        {
          licenseNumber: licenseNumber.substring(0, 5) + '***',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        'error'
      );

      throw error;
    }
  }

  /**
   * Comprehensive license validation (format + availability + SACS verification)
   */
  static async validateLicense(licenseNumber: string, cedula?: string): Promise<LicenseValidationResult> {
    try {
      // First validate format
      const formatValidation = this.validateLicenseFormat(licenseNumber);
      if (!formatValidation.isValid) {
        return formatValidation;
      }

      // Check availability in our database
      const availabilityCheck = await this.checkLicenseAvailability(licenseNumber);
      
      // If cedula is provided, scrape SACS for additional validation
      let sacsData: SACSValidationData | undefined;
      let cacheInfo: LicenseValidationResult['cacheInfo'];
      
      if (cedula) {
        try {
          sacsData = await this.scrapeSACS(cedula);
          
          // Check if cached
          const cachedData = await this.getCachedValidation(cedula);
          cacheInfo = {
            cached: !!cachedData,
            cachedAt: cachedData?.cachedAt || new Date().toISOString(),
            expiresAt: cachedData?.expiresAt || new Date(Date.now() + SACS_CONFIG.cacheExpiry).toISOString()
          };
          
          // Validate specialty if SACS data is available
          if (sacsData && sacsData.validado && sacsData.especialidad) {
            const specialtyValidation = this.validateSpecialty(sacsData.especialidad);
            if (!specialtyValidation.valid) {
              sacsData.errores = sacsData.errores || [];
              sacsData.errores.push(`Especialidad no válida: ${specialtyValidation.error}`);
            }
          }
          
        } catch (error) {
          logSecurityEvent(
            'data_access',
            'sacs_validation_error',
            {
              cedula: cedula.substring(0, 5) + '***',
              licenseNumber: licenseNumber.substring(0, 5) + '***',
              error: error instanceof Error ? error.message : 'Unknown error'
            },
            'error'
          );
        }
      }
      
      return {
        ...formatValidation,
        isAvailable: availabilityCheck.isAvailable,
        sacsData,
        cacheInfo,
        error: availabilityCheck.isAvailable ? undefined : 'Esta licencia médica ya está registrada'
      };

    } catch (error) {
      return {
        isValid: false,
        isAvailable: false,
        formatted: '',
        error: error instanceof Error ? error.message : 'Error verificando licencia'
      };
    }
  }

  /**
   * Validate medical specialty
   */
  static validateSpecialty(especialidad: string): { valid: boolean; error?: string; subSpecialties?: string[] } {
    try {
      const upperEspecialidad = especialidad.toUpperCase().trim();
      
      // Check if it's a main specialty
      if (VENEZUELAN_SPECIALTIES[upperEspecialidad as keyof typeof VENEZUELAN_SPECIALTIES]) {
        return {
          valid: true,
          subSpecialties: VENEZUELAN_SPECIALTIES[upperEspecialidad as keyof typeof VENEZUELAN_SPECIALTIES]
        };
      }
      
      // Check if it's a sub-specialty
      for (const [mainSpecialty, subSpecialties] of Object.entries(VENEZUELAN_SPECIALTIES)) {
        if (subSpecialties.includes(upperEspecialidad)) {
          return {
            valid: true,
            subSpecialties: [mainSpecialty, ...subSpecialties]
          };
        }
      }
      
      return {
        valid: false,
        error: `Especialidad '${especialidad}' no reconocida en Venezuela`
      };
      
    } catch (error) {
      return {
        valid: false,
        error: 'Error validando especialidad'
      };
    }
  }

  /**
   * Validate license expiration
   */
  static validateLicenseExpiration(fechaVencimiento: string): { valid: boolean; expired: boolean; daysUntilExpiry: number; error?: string } {
    try {
      if (!fechaVencimiento) {
        return {
          valid: false,
          expired: false,
          daysUntilExpiry: 0,
          error: 'Fecha de vencimiento no proporcionada'
        };
      }
      
      const vencimiento = new Date(fechaVencimiento);
      const hoy = new Date();
      
      if (isNaN(vencimiento.getTime())) {
        return {
          valid: false,
          expired: false,
          daysUntilExpiry: 0,
          error: 'Fecha de vencimiento inválida'
        };
      }
      
      const diffTime = vencimiento.getTime() - hoy.getTime();
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        valid: true,
        expired: daysUntilExpiry < 0,
        daysUntilExpiry: Math.max(0, daysUntilExpiry)
      };
      
    } catch (error) {
      return {
        valid: false,
        expired: false,
        daysUntilExpiry: 0,
        error: 'Error validando fecha de vencimiento'
      };
    }
  }

  /**
   * Get all supported specialties
   */
  static getSupportedSpecialties(): { main: string[]; sub: string[]; all: string[] } {
    const mainSpecialties = Object.keys(VENEZUELAN_SPECIALTIES);
    const subSpecialties = Object.values(VENEZUELAN_SPECIALTIES).flat();
    const allSpecialties = [...mainSpecialties, ...subSpecialties];
    
    return {
      main: mainSpecialties,
      sub: subSpecialties,
      all: allSpecialties
    };
  }

  /**
   * Test SACS scraping with provided cedulas
   */
  static async testSACSScraping(cedulas: string[]): Promise<{ cedula: string; result: SACSValidationData; success: boolean }[]> {
    const results: { cedula: string; result: SACSValidationData; success: boolean }[] = [];
    
    for (const cedula of cedulas) {
      try {
        const result = await this.scrapeSACS(cedula);
        results.push({
          cedula,
          result,
          success: result.validado
        });
      } catch (error) {
        results.push({
          cedula,
          result: {
            cedula,
            nombre: '',
            apellido: '',
            especialidad: '',
            estado: 'NO_REGISTRADO',
            fechaEmision: '',
            fechaVencimiento: '',
            institucion: '',
            tipoProfesional: 'OTRO',
            numeroRegistro: '',
            colegioProfesional: '',
            ultimaActualizacion: new Date().toISOString(),
            fuente: 'SACS',
            validado: false,
            errores: [error instanceof Error ? error.message : 'Unknown error']
          },
          success: false
        });
      }
    }
    
    return results;
  }

  /**
   * Cleanup browser resources
   */
  static async cleanup(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      logSecurityEvent(
        'data_access',
        'browser_cleanup_error',
        {
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        'error'
      );
    }
  }

  /**
   * Verify license with external medical board (placeholder for future integration)
   */
  static async verifyLicenseWithMedicalBoard(licenseNumber: string): Promise<{
    isValid: boolean;
    isActive: boolean;
    expiresAt?: string;
    issuedBy?: string;
    error?: string;
  }> {
    try {
      // This is a placeholder for future integration with Venezuelan medical boards
      // For now, we'll return a mock response
      
      logSecurityEvent(
        'data_access',
        'license_external_verification_started',
        {
          licenseNumber: licenseNumber.substring(0, 5) + '***'
        },
        'info'
      );

      // Mock verification - in production, this would call external APIs
      const mockResponse = {
        isValid: true,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        issuedBy: 'Colegio de Médicos de Venezuela',
        error: undefined
      };

      logSecurityEvent(
        'data_access',
        'license_external_verification_completed',
        {
          licenseNumber: licenseNumber.substring(0, 5) + '***',
          isValid: mockResponse.isValid
        },
        'info'
      );

      return mockResponse;

    } catch (error) {
      logSecurityEvent(
        'data_access',
        'license_external_verification_failed',
        {
          licenseNumber: licenseNumber.substring(0, 5) + '***',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        'error'
      );

      return {
        isValid: false,
        isActive: false,
        error: 'Error verificando licencia con colegio médico'
      };
    }
  }

  /**
   * Get license type information
   */
  static getLicenseTypeInfo(licenseNumber: string): { type: string; description: string; example: string } | null {
    try {
      const normalizedLicense = licenseNumber.toUpperCase().trim();

      for (const [type, pattern] of Object.entries(VENEZUELAN_LICENSE_PATTERNS)) {
        if (pattern.pattern.test(normalizedLicense)) {
          return {
            type,
            description: pattern.description,
            example: pattern.example
          };
        }
      }

      return null;

    } catch (error) {
      return null;
    }
  }

  /**
   * Suggest alternative license numbers
   */
  static suggestAlternativeLicenses(baseLicense: string): string[] {
    try {
      const suggestions: string[] = [];
      const normalizedLicense = baseLicense.toUpperCase().trim();

      // Extract prefix and number
      const match = normalizedLicense.match(/^([A-Z]+)-(\d+)$/);
      if (match) {
        const prefix = match[1];
        const number = match[2];
        
        // Generate suggestions with different last digits
        for (let i = 1; i <= 3; i++) {
          const newNumber = number.slice(0, -1) + ((parseInt(number.slice(-1)) + i) % 10);
          suggestions.push(`${prefix}-${newNumber}`);
        }
      }

      return suggestions.slice(0, 3); // Limit to 3 suggestions

    } catch (error) {
      return [];
    }
  }
}
