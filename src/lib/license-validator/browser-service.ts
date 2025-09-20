/**
 * Browser Service - Red-Salud Platform
 * 
 * Servicio especializado para manejo de navegador Puppeteer.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { BrowserState, PageSession, ScrapingError, VerificationErrorType } from '@/types/license-validator.types';
import { VALIDATOR_CONFIG, SCRAPING_CONFIG, TIMEOUTS, ENVIRONMENT_CONFIG } from './config';
import { logger } from '@/lib/logging/logger';

// ============================================================================
// SERVICIO DE NAVEGADOR
// ============================================================================

export class BrowserService {
  private browser: Browser | null = null;
  private activeSessions: Map<string, PageSession> = new Map();
  private state: BrowserState = {
    isInitialized: false,
    isAvailable: false,
    lastActivity: null,
    activePages: 0
  };

  // ============================================================================
  // MÉTODOS DE INICIALIZACIÓN
  // ============================================================================

  /**
   * Inicializa el navegador Puppeteer con configuración optimizada
   */
  async initialize(): Promise<void> {
    if (this.browser && this.state.isInitialized) {
      return;
    }

    try {
      logger.info('browser', 'Initializing Puppeteer browser', {
        headless: ENVIRONMENT_CONFIG.ENABLE_HEADLESS,
        environment: process.env.NODE_ENV
      });

      this.browser = await puppeteer.launch({
        headless: ENVIRONMENT_CONFIG.ENABLE_HEADLESS,
        args: VALIDATOR_CONFIG.BROWSER_ARGS,
        defaultViewport: {
          width: 1366,
          height: 768
        },
        ignoreHTTPSErrors: SCRAPING_CONFIG.ignoreHTTPSErrors,
        // Configuración adicional para estabilidad
        timeout: TIMEOUTS.PAGE_NAVIGATION,
        handleSIGINT: false,
        handleSIGTERM: false,
        handleSIGHUP: false
      });

      this.state = {
        isInitialized: true,
        isAvailable: true,
        lastActivity: new Date(),
        activePages: 0,
        sessionId: `browser_${Date.now()}`
      };

      // Configurar event listeners para el navegador
      this.browser.on('disconnected', () => {
        logger.warn('browser', 'Browser disconnected unexpectedly');
        this.handleBrowserDisconnection();
      });

      logger.info('browser', 'Puppeteer browser initialized successfully', {
        sessionId: this.state.sessionId
      });

    } catch (error) {
      logger.error('browser', 'Failed to initialize Puppeteer browser', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      this.state.isInitialized = false;
      this.state.isAvailable = false;
      
      throw new Error('No se pudo inicializar el navegador para la verificación');
    }
  }

  /**
   * Crea una nueva página con configuración optimizada
   */
  async createPage(): Promise<Page> {
    if (!this.browser || !this.state.isAvailable) {
      await this.initialize();
    }

    if (!this.browser) {
      throw new Error('Browser no disponible');
    }

    try {
      const page = await this.browser.newPage();
      
      // Configurar la página
      await this.configurePage(page);
      
      // Crear sesión para tracking
      const sessionId = `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const session: PageSession = {
        id: sessionId,
        url: '',
        startTime: new Date(),
        status: 'active'
      };
      
      this.activeSessions.set(sessionId, session);
      this.state.activePages++;
      this.state.lastActivity = new Date();
      
      // Configurar cleanup automático cuando se cierre la página
      page.on('close', () => {
        this.cleanupPageSession(sessionId);
      });

      logger.info('browser', 'New page created', { sessionId });
      
      return page;

    } catch (error) {
      logger.error('browser', 'Failed to create new page', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  // ============================================================================
  // CONFIGURACIÓN DE PÁGINA
  // ============================================================================

  /**
   * Configura una página con todas las opciones necesarias
   */
  private async configurePage(page: Page): Promise<void> {
    try {
      // Configurar User Agent
      await page.setUserAgent(VALIDATOR_CONFIG.USER_AGENT);
      
      // Configurar viewport
      await page.setViewport({
        width: 1366,
        height: 768,
        deviceScaleFactor: 1
      });
      
      // Configurar timeouts
      page.setDefaultTimeout(SCRAPING_CONFIG.defaultTimeout);
      page.setDefaultNavigationTimeout(TIMEOUTS.PAGE_NAVIGATION);
      
      // Bypass CSP si está habilitado
      if (SCRAPING_CONFIG.bypassCSP) {
        await page.setBypassCSP(true);
      }
      
      // Configurar JavaScript si está habilitado
      await page.setJavaScriptEnabled(SCRAPING_CONFIG.enableJavaScript);
      
      // Configurar interceptación de requests
      await page.setRequestInterception(true);
      
      page.on('request', (request) => {
        // Filtrar requests innecesarios para mejorar performance
        const resourceType = request.resourceType();
        if (['image', 'font', 'media'].includes(resourceType)) {
          request.abort();
        } else {
          request.continue();
        }
      });
      
      // Configurar manejo de errores
      page.on('error', (error) => {
        logger.warn('browser', 'Page error occurred', { 
          error: error.message,
          url: page.url()
        });
      });
      
      page.on('pageerror', (error) => {
        logger.warn('browser', 'Page script error occurred', { 
          error: error.message,
          url: page.url()
        });
      });
      
      page.on('console', (msg) => {
        if (ENVIRONMENT_CONFIG.ENABLE_DEBUG) {
          logger.debug('browser', 'Page console message', {
            type: msg.type(),
            text: msg.text(),
            url: page.url()
          });
        }
      });

      // Configurar headers adicionales de seguridad
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      });

    } catch (error) {
      logger.error('browser', 'Failed to configure page', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  // ============================================================================
  // UTILIDADES DE NAVEGACIÓN
  // ============================================================================

  /**
   * Navega a una URL con retry automático
   */
  async navigateWithRetry(page: Page, url: string, maxRetries: number = 3): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info('browser', `Navigation attempt ${attempt}/${maxRetries}`, { url });
        
        await page.goto(url, {
          waitUntil: SCRAPING_CONFIG.waitForNetworkIdle ? 'networkidle0' : 'domcontentloaded',
          timeout: TIMEOUTS.PAGE_NAVIGATION
        });
        
        // Actualizar sesión
        const sessionId = this.getSessionIdForPage(page);
        if (sessionId) {
          const session = this.activeSessions.get(sessionId);
          if (session) {
            session.url = url;
          }
        }
        
        logger.info('browser', 'Navigation successful', { url, attempt });
        return;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Navigation failed');
        logger.warn('browser', `Navigation attempt ${attempt} failed`, { 
          url, 
          error: lastError.message,
          attempt
        });
        
        if (attempt < maxRetries) {
          const delay = TIMEOUTS.RETRY_BACKOFF_BASE * attempt;
          await this.wait(delay);
        }
      }
    }
    
    if (lastError) {
      throw lastError;
    }
  }

  /**
   * Espera a que un elemento esté presente con timeout
   */
  async waitForElement(page: Page, selector: string, timeout?: number): Promise<void> {
    try {
      await page.waitForSelector(selector, { 
        timeout: timeout || TIMEOUTS.ELEMENT_WAIT,
        visible: true
      });
    } catch (error) {
      logger.error('browser', 'Element wait timeout', { 
        selector, 
        timeout,
        url: page.url()
      });
      throw new Error(`Elemento no encontrado: ${selector}`);
    }
  }

  /**
   * Ejecuta una función en el contexto de la página con manejo de errores
   */
  async evaluateWithErrorHandling<T>(
    page: Page, 
    fn: Function, 
    ...args: any[]
  ): Promise<T> {
    try {
      const result = await page.evaluate(fn, ...args);
      return result;
    } catch (error) {
      logger.error('browser', 'Page evaluation failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        url: page.url()
      });
      throw error;
    }
  }

  // ============================================================================
  // UTILIDADES DE TIEMPO Y DELAY
  // ============================================================================

  /**
   * Espera un tiempo aleatorio para simular comportamiento humano
   */
  async humanDelay(): Promise<void> {
    const delay = Math.random() * 
      (TIMEOUTS.HUMAN_DELAY_MAX - TIMEOUTS.HUMAN_DELAY_MIN) + 
      TIMEOUTS.HUMAN_DELAY_MIN;
    await this.wait(delay);
  }

  /**
   * Espera un tiempo específico
   */
  async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // GESTIÓN DE SESIONES
  // ============================================================================

  /**
   * Obtiene el ID de sesión para una página específica
   */
  private getSessionIdForPage(page: Page): string | null {
    for (const [sessionId, session] of this.activeSessions) {
      if (session.status === 'active') {
        return sessionId;
      }
    }
    return null;
  }

  /**
   * Limpia una sesión de página cuando se cierra
   */
  private cleanupPageSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.endTime = new Date();
      session.status = 'completed';
      this.state.activePages = Math.max(0, this.state.activePages - 1);
      
      // Remover sesión después de un tiempo
      setTimeout(() => {
        this.activeSessions.delete(sessionId);
      }, 60000); // 1 minuto
    }
  }

  /**
   * Maneja la desconexión inesperada del navegador
   */
  private handleBrowserDisconnection(): void {
    this.state.isAvailable = false;
    this.browser = null;
    
    // Marcar todas las sesiones como error
    for (const session of this.activeSessions.values()) {
      if (session.status === 'active') {
        session.status = 'error';
        session.endTime = new Date();
        session.errors = [{
          type: 'BROWSER_ERROR' as VerificationErrorType,
          message: 'Browser disconnected unexpectedly',
          timestamp: new Date().toISOString(),
          source: 'browser' as const
        }];
      }
    }
  }

  // ============================================================================
  // CAPTURA DE PANTALLA Y DEBUGGING
  // ============================================================================

  /**
   * Captura una pantalla para debugging
   */
  async captureScreenshot(page: Page, name: string): Promise<string | null> {
    if (!ENVIRONMENT_CONFIG.ENABLE_SCREENSHOTS) {
      return null;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot_${name}_${timestamp}.png`;
      const path = `./debug/screenshots/${filename}`;
      
      await page.screenshot({ 
        path,
        fullPage: true 
      });
      
      logger.info('browser', 'Screenshot captured', { filename, path });
      return path;
      
    } catch (error) {
      logger.error('browser', 'Failed to capture screenshot', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  }

  // ============================================================================
  // ESTADO Y CLEANUP
  // ============================================================================

  /**
   * Obtiene el estado actual del navegador
   */
  getState(): BrowserState {
    return { ...this.state };
  }

  /**
   * Obtiene las sesiones activas
   */
  getActiveSessions(): PageSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Verifica si el navegador está saludable
   */
  async isHealthy(): Promise<boolean> {
    try {
      if (!this.browser || !this.state.isAvailable) {
        return false;
      }
      
      // Crear una página de prueba simple
      const testPage = await this.browser.newPage();
      await testPage.goto('about:blank');
      await testPage.close();
      
      return true;
      
    } catch (error) {
      logger.error('browser', 'Health check failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }

  /**
   * Cierra el navegador y limpia recursos
   */
  async close(): Promise<void> {
    try {
      if (this.browser) {
        // Cerrar todas las páginas activas
        const pages = await this.browser.pages();
        await Promise.all(pages.map(page => page.close().catch(() => {})));
        
        // Cerrar el navegador
        await this.browser.close();
        this.browser = null;
        
        logger.info('browser', 'Browser closed successfully', {
          sessionId: this.state.sessionId
        });
      }
      
      // Limpiar estado
      this.state = {
        isInitialized: false,
        isAvailable: false,
        lastActivity: null,
        activePages: 0
      };
      
      this.activeSessions.clear();
      
    } catch (error) {
      logger.error('browser', 'Error during browser cleanup', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Reinicia el navegador completamente
   */
  async restart(): Promise<void> {
    logger.info('browser', 'Restarting browser');
    await this.close();
    await this.initialize();
  }
}

// ============================================================================
// INSTANCIA SINGLETON
// ============================================================================

let browserServiceInstance: BrowserService | null = null;

/**
 * Obtiene la instancia singleton del servicio de navegador
 */
export function getBrowserService(): BrowserService {
  if (!browserServiceInstance) {
    browserServiceInstance = new BrowserService();
  }
  return browserServiceInstance;
}

/**
 * Función de cleanup para cerrar el navegador al finalizar
 */
export async function cleanupBrowserService(): Promise<void> {
  if (browserServiceInstance) {
    await browserServiceInstance.close();
    browserServiceInstance = null;
  }
}
