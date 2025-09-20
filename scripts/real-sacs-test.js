/**
 * 🔍 PRUEBA REAL DE SCRAPING SACS
 * 
 * Script para hacer scraping real a SACS con la cédula V-13266929
 * Sin simulaciones, datos reales del sistema SACS
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

console.log('🔍 PRUEBA REAL DE SCRAPING SACS CON CÉDULA V-13266929');
console.log('=' .repeat(60));

async function realSACSTest() {
  let browser = null;
  
  try {
    console.log('🚀 Iniciando navegador Puppeteer...');
    browser = await puppeteer.launch({
      headless: false, // Mostrar navegador para debugging
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
        '--ignore-certificate-errors-spki-list',
        '--disable-web-security',
        '--allow-running-insecure-content'
      ]
    });

    const page = await browser.newPage();
    
    // Configurar user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Configurar para ignorar errores SSL
    await page.setBypassCSP(true);
    
    // Interceptar requests
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      request.continue();
    });
    
    // Manejar errores de página
    page.on('error', (error) => {
      console.log('⚠️ Error de página:', error.message);
    });
    
    page.on('pageerror', (error) => {
      console.log('⚠️ Error de script:', error.message);
    });

    console.log('🌐 Navegando a SACS...');
    const SACS_URL = 'https://sistemas.sacs.gob.ve/consultas/prfsnal_salud';
    
    await page.goto(SACS_URL, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('✅ Página SACS cargada exitosamente');
    
    // Esperar a que la página cargue completamente
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('🔍 Ejecutando consulta real con cédula V-13266929...');
    
    // Ejecutar la consulta real con la cédula
    const result = await page.evaluate((cedula) => {
      return new Promise((resolve) => {
        console.log('🚀 Iniciando consulta real para:', cedula);
        
        // Verificar si la función de consulta está disponible
        if (typeof xajax_getPrfsnalByCed === 'function') {
          console.log('✅ Función xajax_getPrfsnalByCed encontrada');
          
          // Ejecutar la función que dispara la consulta AJAX
          xajax_getPrfsnalByCed(cedula);
          console.log('📡 Consulta AJAX enviada');

          // Esperar 10 segundos para que cargue la tabla
          setTimeout(() => {
            console.log('🔍 Buscando resultados en la tabla...');
            
            const filas = Array.from(document.querySelectorAll('table tr'));
            console.log(`📊 Encontradas ${filas.length} filas en la tabla`);
            
            if (filas.length === 0) {
              console.warn('⚠️ No se encontraron resultados');
              resolve({
                success: false,
                message: 'No se encontraron resultados en la tabla',
                data: null,
                rawHTML: document.body.innerHTML.substring(0, 1000)
              });
              return;
            }

            console.log('📄 Extrayendo datos del profesional...');
            const data = {
              cedula: null,
              nombre: null,
              profesion: null,
              matricula: null,
              fecha: null,
              tomo: null,
              folio: null,
              postgrados: false,
              especialidad: null,
              rawData: []
            };

            // Extraer datos de todas las filas
            filas.forEach((fila, i) => {
              const celdas = Array.from(fila.querySelectorAll('td, th'));
              if (celdas.length > 0) {
                const cellTexts = celdas.map(c => c.textContent?.trim() || '');
                console.log(`Fila ${i}:`, cellTexts);
                
                data.rawData.push({
                  rowIndex: i,
                  cells: cellTexts
                });
                
                // Extraer datos específicos
                if (cellTexts.length >= 2) {
                  const firstCell = cellTexts[0];
                  const secondCell = cellTexts[1];
                  
                  if (firstCell === 'NÚMERO DE CÉDULA:' && secondCell) {
                    data.cedula = secondCell;
                    console.log('✅ Cédula encontrada:', secondCell);
                  } else if (firstCell === 'NOMBRE Y APELLIDO:' && secondCell) {
                    data.nombre = secondCell;
                    console.log('✅ Nombre encontrado:', secondCell);
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
                      console.log('✅ Datos profesionales encontrados:', {
                        profesion, matricula, fecha, tomo, folio, postgrados
                      });
                    }
                  }
                  
                  // Buscar profesión en cualquier celda que contenga "MÉDICO" o "CIRUJANO"
                  cellTexts.forEach(cellText => {
                    if (cellText && (cellText.includes('MÉDICO') || cellText.includes('CIRUJANO'))) {
                      if (!data.profesion || data.profesion.length < cellText.length) {
                        data.profesion = cellText;
                        console.log('✅ Profesión detectada:', cellText);
                      }
                    }
                  });
                }
              }
            });

            console.log('🎓 Verificando postgrados...');
            
            // Usar XPath para encontrar el botón Postgrado
            const xpath = "/html/body/main/div/div/div/div/div[2]/div/div[3]/div/div/div[3]/div[2]/table/tbody/tr/td[6]/button";
            const postgradoBtn = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            if (postgradoBtn && data.postgrados) {
              console.log('🩺 Botón Postgrado encontrado, haciendo clic...');
              postgradoBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

              // Esperar 3 segundos para que cargue la especialidad
              setTimeout(() => {
                console.log('🔍 Buscando especialidad después del clic...');
                
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
                  data: data,
                  timestamp: new Date().toISOString()
                });
              }, 3000);
            } else {
              console.log('ℹ️ No hay botón Postgrado o no tiene postgrados');
              
              // Si no hay botón de postgrados pero tenemos especialidad en la profesión, separarla
              if (data.profesion && data.profesion.includes('ESPECIALISTA')) {
                // La profesión contiene la especialidad, separarla
                data.especialidad = data.profesion;
                // Mantener solo la parte base de la profesión
                data.profesion = 'MÉDICO(A) CIRUJANO(A)';
                console.log(`🎓 Separando especialidad de profesión: ${data.especialidad}`);
              }
              
              resolve({
                success: true,
                message: 'Datos extraídos exitosamente sin postgrados',
                data: data,
                timestamp: new Date().toISOString()
              });
            }
          }, 10000); // Esperar 10 segundos para la consulta
        } else {
          console.error('❌ La función xajax_getPrfsnalByCed no está disponible');
          resolve({
            success: false,
            message: 'Función AJAX no disponible',
            data: null,
            rawHTML: document.body.innerHTML.substring(0, 1000)
          });
        }
      });
    }, '13266929'); // Usar solo el número sin el V-

    console.log('\n📊 RESULTADO REAL DE LA CONSULTA SACS:');
    console.log('=' .repeat(60));
    console.log(JSON.stringify(result, null, 2));

    if (result.success && result.data) {
      const data = result.data;
      
      console.log('\n✅ DATOS EXTRAÍDOS EXITOSAMENTE:');
      console.log(`   Cédula: ${data.cedula}`);
      console.log(`   Nombre: ${data.nombre}`);
      console.log(`   Profesión: ${data.profesion}`);
      console.log(`   Matrícula: ${data.matricula}`);
      console.log(`   Fecha: ${data.fecha}`);
      console.log(`   Postgrados: ${data.postgrados ? 'Sí' : 'No'}`);
      console.log(`   Especialidad: ${data.especialidad || 'No especificada'}`);
      
      // Análisis de validez profesional
      console.log('\n🔍 ANÁLISIS DE VALIDEZ PROFESIONAL:');
      
      const isMedicalProfessional = data.profesion && 
        (data.profesion.includes('MÉDICO') || data.profesion.includes('CIRUJANO'));
      
      console.log(`   Es profesional médico: ${isMedicalProfessional ? 'SÍ' : 'NO'}`);
      console.log(`   Razón: ${isMedicalProfessional ? 'Profesión contiene MÉDICO/CIRUJANO' : 'Profesión no es médica'}`);
      
      if (isMedicalProfessional) {
        console.log('✅ PROFESIONAL VÁLIDO - Puede proceder con el registro');
      } else {
        console.log('❌ PROFESIONAL NO VÁLIDO - No es médico');
      }
    }

  } catch (error) {
    console.error('❌ Error durante la prueba real:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (browser) {
      console.log('\n🔒 Cerrando navegador...');
      await browser.close();
    }
  }
}

// Ejecutar la prueba real
realSACSTest();
