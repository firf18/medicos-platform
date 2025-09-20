/**
 * Validador de Cédulas Profesionales Médicas Venezolanas
 * 
 * Sistema para verificar la autenticidad de cédulas profesionales de médicos venezolanos
 * mediante scraping del sitio web oficial del gobierno.
 */

import puppeteer, { Browser } from 'puppeteer';
import { logger } from '@/lib/logging/logger';

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
   * Valida una cédula profesional médica venezolana
   * @param licenseData Datos de la cédula a verificar
   * @returns Resultado de la verificación
   */
  async validateVenezuelanMedicalLicense(
    licenseData: VenezuelanDoctorLicenseData
  ): Promise<LicenseVerificationResult> {
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
      logger.info('verification', 'Ejecutando consulta AJAX con detección de postgrados para:', cedulaCompleta);

      // Ejecutar la consulta completa con detección de postgrados
      const result = await page.evaluate((cedula) => {
        return new Promise((resolve) => {
          // Verificar si la función de consulta está disponible
          if (typeof xajax_getPrfsnalByCed === 'function') {
            console.log('🚀 Consultando profesional:', cedula);
            
            // Ejecutar la función que dispara la consulta AJAX
            xajax_getPrfsnalByCed(cedula);

            // Esperar 7 segundos para que cargue la tabla
            setTimeout(() => {
              const filas = Array.from(document.querySelectorAll('table tr'));
              if (filas.length === 0) {
                console.warn('⚠️ No se encontraron resultados');
                resolve({
                  success: false,
                  message: 'No se encontraron resultados en la tabla',
                  data: null
                });
                return;
              }

              console.log('📄 Datos básicos encontrados:');
              const data = {
                cedula: null,
                nombre: null,
                profesion: null,
                matricula: null,
                fecha: null,
                tomo: null,
                folio: null,
                postgrados: false,
                especialidad: null
              };

              filas.forEach((fila, i) => {
                const celdas = Array.from(fila.querySelectorAll('td, th'));
                if (celdas.length > 0) {
                  const cellTexts = celdas.map(c => c.textContent?.trim());
                  console.log(`Fila ${i}:`, cellTexts);
                  
                  // Extraer datos específicos
                  if (cellTexts.length >= 2) {
                    const firstCell = cellTexts[0];
                    const secondCell = cellTexts[1];
                    
                    if (firstCell === 'NÚMERO DE CÉDULA:' && secondCell) {
                      data.cedula = secondCell;
                    } else if (firstCell === 'NOMBRE Y APELLIDO:' && secondCell) {
                      data.nombre = secondCell;
                    } else if (cellTexts.length >= 6) {
                      // Fila de datos completos
                      const [profesion, matricula, fecha, tomo, folio, postgrados] = cellTexts;
                      if (profesion && profesion.length > 3) {
                        data.profesion = profesion;
                        data.matricula = matricula;
                        data.fecha = fecha;
                        data.tomo = tomo;
                        data.folio = folio;
                        data.postgrados = postgrados === 'Postgrados';
                      }
                    }
                  }
                }
              });

              // Usar XPath para encontrar el botón Postgrado
              const xpath = "/html/body/main/div/div/div/div/div[2]/div/div[3]/div/div/div[3]/div[2]/table/tbody/tr/td[6]/button";
              const postgradoBtn = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

              if (postgradoBtn && data.postgrados) {
                console.log('🩺 Botón Postgrado encontrado, haciendo clic...');
                postgradoBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

                // Esperar 2 segundos para que cargue la especialidad
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

                  resolve({
                    success: true,
                    message: 'Datos extraídos exitosamente con postgrados',
                    data: data
                  });
                }, 2000);
              } else {
                console.log('ℹ️ No hay botón Postgrado o no tiene postgrados');
                resolve({
                  success: true,
                  message: 'Datos extraídos exitosamente sin postgrados',
                  data: data
                });
              }
            }, 7000);
          } else {
            console.error('❌ La función xajax_getPrfsnalByCed no está disponible');
            resolve({
              success: false,
              message: 'Función AJAX no disponible',
              data: null
            });
          }
        });
      }, cedulaCompleta);

      logger.info('verification', 'Resultado completo:', result);

      // Verificar si se encontraron datos válidos
      if (result.success && result.data) {
        const data = result.data;
        
        if (data.nombre && data.nombre.length > 5) {
          return {
            isValid: true,
            isVerified: true,
            verificationSource: 'sacs',
            doctorName: data.nombre,
            licenseStatus: 'active',
            specialty: data.especialidad || data.profesion,
            verificationDate: new Date().toISOString(),
            rawData: {
              cedula: data.cedula,
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
          error: result.message || 'No se pudieron extraer datos',
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
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    } finally {
      await browser.close();
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
 * Función de conveniencia para validar una cédula profesional médica venezolana
 * @param licenseData Datos de la cédula a verificar
 * @returns Resultado de la verificación
 */
export async function validateVenezuelanMedicalLicense(
  licenseData: VenezuelanDoctorLicenseData
): Promise<LicenseVerificationResult> {
  const validator = new ProfessionalLicenseValidator();
  
  try {
    const result = await validator.validateVenezuelanMedicalLicense(licenseData);
    return result;
  } finally {
    await validator.close();
  }
}
