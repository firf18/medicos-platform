/**
 * Validador de Cédulas Profesionales Médicas Venezolanas
 * 
 * Sistema para verificar la autenticidad de cédulas profesionales de médicos venezolanos
 * mediante scraping del sitio web oficial del gobierno.
 */

import puppeteer, { Browser } from 'puppeteer';
import { logger } from '@/lib/logging/logger';
import { analyzeDoctorSpeciality } from '@/lib/analysis/speciality-analyzer';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface VenezuelanDoctorLicenseData {
  documentType: 'cedula_identidad' | 'cedula_extranjera' | 'matricula';
  documentNumber: string; // Número de cédula, pasaporte o matrícula
  firstName?: string;
  lastName?: string;
}

export interface LicenseVerificationResult {
  isValid: boolean;
  isVerified: boolean;
  verificationSource: 'sacs' | 'mpps' | 'other';
  doctorName?: string;
  licenseStatus?: string;
  specialty?: string;
  verificationDate?: string;
  verificationId?: string;
  rawData?: Record<string, unknown>;
  error?: string;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const VALIDATOR_CONFIG = {
  // URLs de los sitios oficiales para verificación
  SACS_URL: 'https://sistemas.sacs.gob.ve/consultas/prfsnal_salud',
  MPPS_URL: 'https://mpps.gob.ve/consulta-publica/',
  
  // Tiempo de espera para cargar páginas (aumentado para sitio lento)
  PAGE_LOAD_TIMEOUT: 60000,
  
  // Tiempo de espera para selecciones
  SELECT_TIMEOUT: 10000,
  
  // Número máximo de intentos
  MAX_RETRIES: 3,
  
  // User agent para evitar detección de bot
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// ============================================================================
// CLASE PRINCIPAL
// ============================================================================

export class ProfessionalLicenseValidator {
  private browser: Browser | null = null;

  /**
   * Inicializa el navegador Puppeteer
   */
  private async initialize(): Promise<void> {
    if (this.browser) {
      return;
    }

    try {
      logger.info('verification', 'Initializing Puppeteer browser');
      
      this.browser = await puppeteer.launch({
        headless: true, // Ejecutar en modo headless para producción
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--ignore-certificate-errors',
          '--ignore-ssl-errors',
          '--ignore-certificate-errors-spki-list',
          '--disable-web-security',
          '--allow-running-insecure-content',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      logger.info('verification', 'Puppeteer browser initialized successfully');
    } catch (error) {
      logger.error('verification', 'Failed to initialize Puppeteer browser', { error });
      throw new Error('No se pudo inicializar el navegador para la verificación');
    }
  }

  /**
   * Cierra el navegador Puppeteer
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('verification', 'Puppeteer browser closed');
    }
  }

  /**
   * Valida una cédula profesional médica venezolana con análisis de especialidad
   * @param licenseData Datos de la cédula a verificar
   * @param firstName Nombre del médico (para verificación)
   * @param lastName Apellido del médico (para verificación)
   * @returns Resultado de la verificación con análisis completo
   */
  async validateVenezuelanMedicalLicense(
    licenseData: VenezuelanDoctorLicenseData,
    firstName?: string,
    lastName?: string
  ): Promise<LicenseVerificationResult & { analysis?: any }> {
    try {
      logger.info('verification', 'Starting Venezuelan medical license validation', {
        documentType: licenseData.documentType,
        documentNumber: licenseData.documentNumber
      });

      // Validar formato básico
      const formatValidation = this.validateDocumentFormat(licenseData);
      if (!formatValidation.isValid) {
        return {
          isValid: false,
          isVerified: false,
          error: formatValidation.error,
          verificationSource: 'other'
        };
      }

      // Intentar verificación a través de SACS
      const sacsResult = await this.verifyViaSACS(licenseData);
      
      if (sacsResult.isVerified) {
        logger.info('verification', 'SACS verification completed', {
          isValid: sacsResult.isValid,
          doctorName: sacsResult.doctorName
        });
        
        // Si se proporcionan nombre y apellido, realizar análisis completo
        if (firstName && lastName) {
          const sacsDataForAnalysis = {
            isValid: sacsResult.isValid,
            isVerified: sacsResult.isVerified,
            doctorName: sacsResult.doctorName,
            specialty: sacsResult.specialty,
            profession: (sacsResult.rawData as any)?.profesion || 'MÉDICO(A) CIRUJANO(A)', // Usar profesion del scraping
            licenseNumber: (sacsResult.rawData as any)?.matricula || '',
            registrationDate: (sacsResult.rawData as any)?.fecha || '',
            hasPostgrados: (sacsResult.rawData as any)?.postgrados || false,
            especialidad: (sacsResult.rawData as any)?.especialidad || '',
            rawData: sacsResult.rawData
          };
          
          
          const analysis = analyzeDoctorSpeciality(
            sacsDataForAnalysis,
            firstName,
            lastName
          );
          
          logger.info('verification', 'Speciality analysis completed', {
            isMedicalProfessional: analysis.isValidMedicalProfessional,
            specialty: analysis.specialty,
            primaryDashboard: analysis.dashboardAccess.primaryDashboard,
            nameMatches: analysis.nameVerification.matches
          });
          
          return {
            ...sacsResult,
            analysis: analysis
          };
        }
        
        return sacsResult;
      }

      // Si SACS falla, intentar MPPS como fallback
      logger.warn('verification', 'SACS verification failed, trying MPPS fallback');
      const mppsResult = await this.verifyViaMPPS(licenseData);
      
      if (mppsResult.isVerified) {
        logger.info('verification', 'MPPS verification completed', {
          isValid: mppsResult.isValid,
          doctorName: mppsResult.doctorName
        });
        return mppsResult;
      }

      // Si ambos fallan, retornar error
      logger.error('verification', 'All verification methods failed');
      return {
        isValid: false,
        isVerified: false,
        error: 'No se pudo verificar la cédula profesional en los sistemas oficiales',
        verificationSource: 'other'
      };

    } catch (error) {
      logger.error('verification', 'Error during license validation', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      return {
        isValid: false,
        isVerified: false,
        error: error instanceof Error ? error.message : 'Error desconocido durante la verificación',
        verificationSource: 'other'
      };
    }
  }

  /**
   * Valida el formato básico del documento
   */
  private validateDocumentFormat(licenseData: VenezuelanDoctorLicenseData): { isValid: boolean; error?: string } {
    const { documentType, documentNumber } = licenseData;

    if (!documentNumber || documentNumber.trim().length === 0) {
      return { isValid: false, error: 'El número de documento es requerido' };
    }

    // Validar formato según el tipo de documento
    switch (documentType) {
      case 'cedula_identidad':
        if (!/^V-\d{7,8}$/.test(documentNumber)) {
          return { isValid: false, error: 'Formato de cédula venezolana inválido. Use V-12345678' };
        }
        break;
      
      case 'cedula_extranjera':
        if (!/^E-\d{7,8}$/.test(documentNumber)) {
          return { isValid: false, error: 'Formato de cédula extranjera inválido. Use E-12345678' };
        }
        break;
      
      case 'matricula':
        if (!/^MPPS-\d{4,5}$/.test(documentNumber)) {
          return { isValid: false, error: 'Formato de matrícula inválido. Use MPPS-12345' };
        }
        break;
      
      default:
        return { isValid: false, error: 'Tipo de documento no válido' };
    }

    return { isValid: true };
  }

  /**
   * Verifica la cédula profesional mediante scraping del sitio SACS
   * SOLUCIÓN DEFINITIVA: Función AJAX directa con detección de postgrados
   * @param licenseData Datos de la cédula a verificar
   * @returns Resultado de la verificación
   */
  private async verifyViaSACS(licenseData: VenezuelanDoctorLicenseData): Promise<LicenseVerificationResult> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();
    await page.setUserAgent(VALIDATOR_CONFIG.USER_AGENT);
    
    // Configurar para ignorar errores de certificado SSL
    await page.setBypassCSP(true);
    
    // Interceptar requests para manejar errores SSL
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      request.continue();
    });
    
    // Manejar errores de página
    page.on('error', (error) => {
      logger.warn('verification', 'Page error occurred', { error: error.message });
    });
    
    page.on('pageerror', (error) => {
      logger.warn('verification', 'Page script error occurred', { error: error.message });
    });

    try {
      logger.info('verification', 'Starting SACS verification with AJAX + Postgrados detection', {
        documentType: licenseData.documentType,
        documentNumber: licenseData.documentNumber
      });

      // Navegar a la página de verificación
      await page.goto(VALIDATOR_CONFIG.SACS_URL, {
        waitUntil: 'networkidle0',
        timeout: VALIDATOR_CONFIG.PAGE_LOAD_TIMEOUT
      });

      // Esperar a que la página cargue completamente
      await new Promise(resolve => setTimeout(resolve, 5000));

      logger.info('verification', 'SACS page loaded successfully');

      // SOLUCIÓN DEFINITIVA: Usar la función AJAX directa con detección de postgrados
      const cedulaCompleta = licenseData.documentNumber;
      logger.info('verification', 'Ejecutando consulta AJAX usando script exacto que funciona para:', { cedula: cedulaCompleta });

      // Ejecutar el script exacto que funciona (adaptado del script proporcionado)
      const result = await page.evaluate((cedulaCompleta) => {
        return new Promise((resolve) => {
          console.log(`🚀 Consultando profesional: ${cedulaCompleta}`);

          // Timeout de seguridad de 15 segundos
          const safetyTimeout = setTimeout(() => {
            console.warn('⏰ Timeout de seguridad alcanzado - resolviendo con datos básicos');
            resolve({
              success: false,
              message: 'Timeout en la consulta - intente nuevamente',
              data: null
            });
          }, 15000);

          if (typeof (window as any).xajax_getPrfsnalByCed === 'function') {
            (window as any).xajax_getPrfsnalByCed(cedulaCompleta);

            // Esperar 7 segundos para que cargue la tabla
            setTimeout(() => {
              const filas = Array.from(document.querySelectorAll('table tr'));
              if (filas.length === 0) {
                console.warn('⚠️ No se encontraron resultados');
                clearTimeout(safetyTimeout);
                resolve({
                  success: false,
                  message: 'No se encontraron resultados en la tabla',
                  data: null
                });
                return;
              }

              console.log('📄 Datos básicos encontrados:');
              
              // Procesar exactamente como en el script original
              const data = {
                cedula: null,
                nombre: null,
                profesion: null,
                matricula: null,
                fechaRegistro: null,
                tomo: null,
                folio: null,
                especialidad: null,
                licenseStatus: null,
                isValid: false
              };

              filas.forEach((fila, i) => {
                const celdas = Array.from(fila.querySelectorAll('td, th'));
                if (celdas.length > 0) {
                  const cellTexts = celdas.map(c => c.textContent.trim());
                  console.log(`Fila ${i}:`, cellTexts);

                  // Extraer según el patrón exacto del script que funciona
                  if (cellTexts.length === 2) {
                    const [firstCell, secondCell] = cellTexts;
                    
                    if (firstCell === 'NÚMERO DE CÉDULA:' && secondCell) {
                      data.cedula = secondCell;
                    } else if (firstCell === 'NOMBRE Y APELLIDO:' && secondCell) {
                      data.nombre = secondCell;
                    }
                  } else if (cellTexts.length === 6) {
                    // Fila de datos completos como: ['MÉDICO(A) CIRUJANO(A)', 'MPPS-67301', '2005-01-13', '101', '87', 'Postgrados']
                    const [profesion, matricula, fecha, tomo, folio, postgrados] = cellTexts;
                    
                    if (profesion && (profesion.includes('MÉDICO') || profesion.includes('CIRUJANO'))) {
                      data.profesion = profesion;
                      data.matricula = matricula;
                      data.fechaRegistro = fecha;
                      data.tomo = tomo;
                      data.folio = folio;
                      data.licenseStatus = profesion; // Store profession as license status
                      data.isValid = true;
                      
                      console.log(`✅ Datos médicos extraídos: ${profesion}, Matrícula: ${matricula}`);
                    }
                  }
                }
              });

              // Verificar si hay botón de postgrado de manera más robusta
              console.log('🔍 Buscando botón de postgrado...');
              
              // Buscar botón que contenga "Postgrado" o "Postgrados"
              const postgradoBtn = Array.from(document.querySelectorAll('button, input[type="button"], a'))
                .find(btn => {
                  const text = btn.textContent?.trim() || '';
                  return text.toLowerCase().includes('postgrado');
                });

              // Verificar también si hay una columna que indica postgrados
              const hasPostgradosColumn = Array.from(document.querySelectorAll('table tr'))
                .some(row => {
                  const cells = Array.from(row.querySelectorAll('td, th'));
                  return cells.some(cell => cell.textContent?.trim() === 'Postgrados');
                });

              if (postgradoBtn && hasPostgradosColumn) {
                console.log('🩺 Botón Postgrado encontrado, haciendo clic...');
                
                try {
                  postgradoBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

                  // Esperar 3 segundos para que cargue la especialidad
                  setTimeout(() => {
                    const especialidad = Array.from(document.querySelectorAll('table tr'))
                      .map(row => Array.from(row.querySelectorAll('td, th')).map(c => c.textContent.trim()))
                      .flat()
                      .find(text => text.toLowerCase().includes('especialista en'));

                    if (especialidad) {
                      console.log(`🎓 Especialidad encontrada: ${especialidad}`);
                      data.especialidad = especialidad;
                    } else {
                      console.warn('⚠️ No se detectó especialidad después de hacer clic en Postgrado');
                    }

                    clearTimeout(safetyTimeout);
                    resolve({
                      success: true,
                      message: 'Datos extraídos exitosamente con especialidad',
                      data: data
                    });
                  }, 3000); // Aumentamos a 3 segundos
                } catch (error) {
                  console.error('Error al hacer clic en postgrado:', error);
                  // Si falla el clic, continuar sin especialidad
                  clearTimeout(safetyTimeout);
                  resolve({
                    success: true,
                    message: 'Datos extraídos exitosamente (error en postgrado)',
                    data: data
                  });
                }
              } else {
                console.log('ℹ️ No se encontró botón de postgrado o médico sin postgrados');
                
                // Verificar si la profesión ya contiene especialidad
                if (data.profesion && data.profesion.includes('ESPECIALISTA')) {
                  data.especialidad = data.profesion;
                  data.profesion = 'MÉDICO(A) CIRUJANO(A)';
                  console.log(`🎓 Especialidad extraída de profesión: ${data.especialidad}`);
                }
                
                // Resolver inmediatamente para médicos sin postgrado
                clearTimeout(safetyTimeout);
                resolve({
                  success: true,
                  message: 'Datos extraídos exitosamente - médico sin postgrados',
                  data: data
                });
              }
            }, 7000);
          } else {
            console.error('❌ La función xajax_getPrfsnalByCed no está disponible');
            clearTimeout(safetyTimeout);
            resolve({
              success: false,
              message: 'Función AJAX no disponible',
              data: null
            });
          }
        });
      }, cedulaCompleta);

      logger.info('verification', 'Resultado completo:', { result });

      // Verificar si se encontraron datos válidos
      if ((result as any).success && (result as any).data) {
        const data = (result as any).data;
        
        if (data.nombre && data.nombre.length > 5) {
          return {
            isValid: true,
            isVerified: true,
            verificationSource: 'sacs',
            doctorName: data.nombre,
            licenseStatus: data.profesion || 'MÉDICO(A) CIRUJANO(A)',
            specialty: data.especialidad || null,
            verificationDate: new Date().toISOString(),
            rawData: {
              cedula: data.cedula,
              nombre: data.nombre,
              profesion: data.profesion,
              matricula: data.matricula,
              fecha: data.fecha,
              tomo: data.tomo,
              folio: data.folio,
              postgrados: data.postgrados,
              especialidad: data.especialidad,
              extractionMethod: 'ajax_with_postgrados'
            }
          };
        } else {
          return {
            isValid: false,
            isVerified: true,
            verificationSource: 'sacs',
            error: 'Profesional no encontrado en el registro SACS',
            rawData: {
              result,
              extractionMethod: 'ajax_with_postgrados'
            }
          };
        }
      } else {
        return {
          isValid: false,
          isVerified: false,
          verificationSource: 'sacs',
          error: (result as any).message || 'No se pudieron extraer datos',
          rawData: {
            result,
            extractionMethod: 'ajax_with_postgrados'
          }
        };
      }

    } catch (error) {
      logger.error('verification', 'Error during SACS verification', { error: error instanceof Error ? error.message : 'Unknown error' });
      return {
        isValid: false,
        isVerified: false,
        verificationSource: 'sacs',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Verifica la licencia a través del MPPS (fallback)
   */
  private async verifyViaMPPS(licenseData: VenezuelanDoctorLicenseData): Promise<LicenseVerificationResult> {
    // Implementación básica para MPPS como fallback
    // Por ahora retornamos un resultado no verificado
    logger.info('verification', 'MPPS verification not implemented yet, returning unverified result');
    
    return {
      isValid: false,
      isVerified: false,
      error: 'Verificación MPPS no implementada',
      verificationSource: 'mpps'
    };
  }
}

// ============================================================================
// FUNCIÓN DE CONVENIENCIA
// ============================================================================

/**
 * Función de conveniencia para validar una cédula profesional médica venezolana con análisis
 * @param licenseData Datos de la cédula a verificar
 * @param firstName Nombre del médico (opcional, para análisis completo)
 * @param lastName Apellido del médico (opcional, para análisis completo)
 * @returns Resultado de la verificación con análisis completo
 */
export async function validateVenezuelanMedicalLicense(
  licenseData: VenezuelanDoctorLicenseData,
  firstName?: string,
  lastName?: string
): Promise<LicenseVerificationResult & { analysis?: any }> {
  const validator = new ProfessionalLicenseValidator();
  
  try {
    const result = await validator.validateVenezuelanMedicalLicense(licenseData, firstName, lastName);
    return result;
  } finally {
    await validator.close();
  }
}
