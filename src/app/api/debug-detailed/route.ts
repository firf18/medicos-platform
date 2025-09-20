import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const { documentNumber } = await request.json();
    
    console.log('🔍 Debug detallado con cédula:', documentNumber);
    
    const browser = await puppeteer.launch({
      headless: true,
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

    const page = await browser.newPage();
    await page.setBypassCSP(true);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      request.continue();
    });

    try {
      // Cargar página
      await page.goto('https://sistemas.sacs.gob.ve/consultas/prfsnal_salud', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Llenar formulario
      await page.select('select[name="tipo"]', '1');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      try {
        await page.select('select[name="datajs"]', 'V');
      } catch (error) {
        console.log('No se pudo seleccionar tipo de documento');
      }
      
      const cleanNumber = documentNumber.replace(/^V-/, '');
      await page.type('input[name="cedula_matricula"]', cleanNumber);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Capturar estado antes del envío
      const beforeSubmit = await page.evaluate(() => ({
        url: window.location.href,
        title: document.title,
        hasForm: !!document.querySelector('form'),
        formAction: document.querySelector('form')?.action,
        formMethod: document.querySelector('form')?.method
      }));
      
      console.log('Estado antes del envío:', beforeSubmit);
      
      // Enviar formulario
      try {
        await page.click('input[type="submit"]');
        console.log('Formulario enviado con click');
      } catch (error) {
        await page.keyboard.press('Enter');
        console.log('Formulario enviado con Enter');
      }
      
      // Esperar y capturar estado después del envío
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const afterSubmit = await page.evaluate(() => ({
        url: window.location.href,
        title: document.title,
        hasForm: !!document.querySelector('form'),
        formAction: document.querySelector('form')?.action,
        formMethod: document.querySelector('form')?.method,
        bodyText: document.body.textContent?.substring(0, 1000),
        hasResults: document.body.textContent?.includes('NOMBRE') || 
                   document.body.textContent?.includes('PROFESIÓN') ||
                   document.body.textContent?.includes('MATRÍCULA'),
        tablesCount: document.querySelectorAll('table').length
      }));
      
      console.log('Estado después del envío:', afterSubmit);
      
      // Esperar más tiempo para ver si hay cambios
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const finalState = await page.evaluate(() => ({
        url: window.location.href,
        title: document.title,
        bodyText: document.body.textContent?.substring(0, 2000),
        hasResults: document.body.textContent?.includes('NOMBRE') || 
                   document.body.textContent?.includes('PROFESIÓN') ||
                   document.body.textContent?.includes('MATRÍCULA'),
        tablesCount: document.querySelectorAll('table').length,
        allText: document.body.textContent || ''
      }));
      
      await browser.close();
      
      return NextResponse.json({
        success: true,
        beforeSubmit,
        afterSubmit,
        finalState,
        documentNumber: cleanNumber
      });

    } catch (error) {
      await browser.close();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error en debug detallado:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
