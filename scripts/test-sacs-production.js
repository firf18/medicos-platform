/**
 * 🧪 SCRIPT DE PRUEBA SIMPLE PARA PRODUCCIÓN
 * 
 * Script único para probar la validación de cédulas con SACS
 * Usa el validador original que funciona correctamente
 */

const puppeteer = require('puppeteer');

console.log('🧪 PRUEBA DE VALIDACIÓN SACS - PRODUCCIÓN');
console.log('=' .repeat(50));

async function testSACSValidation() {
  let browser = null;
  
  try {
    console.log('🚀 Iniciando prueba de validación SACS...');
    
    const testData = {
      documentType: 'cedula_identidad',
      documentNumber: 'V-13266929'
    };

    console.log('\n📋 DATOS DE PRUEBA:');
    console.log(`   Tipo: ${testData.documentType}`);
    console.log(`   Cédula: ${testData.documentNumber}`);

    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--ignore-certificate-errors',
        '--ignore-ssl-errors',
        '--ignore-certificate-errors-spki-list',
        '--disable-web-security',
        '--allow-running-insecure-content'
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.setBypassCSP(true);
    await page.setRequestInterception(true);
    page.on('request', (request) => request.continue());

    console.log('🌐 Navegando a SACS...');
    await page.goto('https://sistemas.sacs.gob.ve/consultas/prfsnal_salud', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('✅ Página SACS cargada');

    console.log('🔍 Ejecutando validación...');
    
    const result = await page.evaluate((cedulaCompleta) => {
      return new Promise((resolve) => {
        console.log(`🚀 Consultando: ${cedulaCompleta}`);

        if (typeof xajax_getPrfsnalByCed === 'function') {
          xajax_getPrfsnalByCed(cedulaCompleta);

          setTimeout(() => {
            const filas = Array.from(document.querySelectorAll('table tr'));
            if (filas.length === 0) {
              resolve({
                success: false,
                message: 'No se encontraron resultados',
                data: null
              });
              return;
            }

            const data = {
              cedula: null,
              nombre: null,
              profesion: null,
              matricula: null,
              fecha: null,
              especialidad: null
            };

            filas.forEach((fila) => {
              const celdas = Array.from(fila.querySelectorAll('td, th'));
              if (celdas.length > 0) {
                const cellTexts = celdas.map(c => c.textContent?.trim());
                
                if (cellTexts.length >= 2) {
                  const firstCell = cellTexts[0];
                  const secondCell = cellTexts[1];
                  
                  if (firstCell === 'NÚMERO DE CÉDULA:' && secondCell) {
                    data.cedula = secondCell;
                  } else if (firstCell === 'NOMBRE Y APELLIDO:' && secondCell) {
                    data.nombre = secondCell;
                  } else if (cellTexts.length >= 6) {
                    const [profesion, matricula, fecha] = cellTexts;
                    if (profesion && profesion.length > 3 && !profesion.includes('PROFESIÓN:')) {
                      data.profesion = profesion;
                      data.matricula = matricula;
                      data.fecha = fecha;
                    }
                  }
                  
                  // Buscar profesión médica
                  cellTexts.forEach(cellText => {
                    if (cellText && (cellText.includes('MÉDICO') || cellText.includes('CIRUJANO'))) {
                      if (!data.profesion || data.profesion.length < cellText.length) {
                        data.profesion = cellText;
                      }
                    }
                  });
                }
              }
            });

            // Verificar si hay datos válidos
            if (!data.nombre || data.nombre.length < 5) {
              resolve({
                success: false,
                message: 'Profesional no encontrado en SACS',
                data: data
              });
              return;
            }

            // Buscar especialidad con XPath
            const xpath = "/html/body/main/div/div/div/div/div[2]/div/div[3]/div/div/div[3]/div[2]/table/tbody/tr/td[6]/button";
            const postgradoBtn = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            if (postgradoBtn) {
              console.log('🩺 Buscando especialidad...');
              postgradoBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

              setTimeout(() => {
                const especialidad = Array.from(document.querySelectorAll('table tr'))
                  .map(row => Array.from(row.querySelectorAll('td, th')).map(c => c.textContent.trim()))
                  .flat()
                  .find(text => text.toLowerCase().includes('especialista en'));

                if (especialidad) {
                  data.especialidad = especialidad;
                }

                resolve({
                  success: true,
                  message: 'Datos extraídos exitosamente',
                  data: data
                });
              }, 2000);
            } else {
              resolve({
                success: true,
                message: 'Datos extraídos exitosamente',
                data: data
              });
            }
          }, 7000);
        } else {
          resolve({
            success: false,
            message: 'Función AJAX no disponible',
            data: null
          });
        }
      });
    }, testData.documentNumber);

    console.log('\n📊 RESULTADO:');
    console.log('=' .repeat(30));
    console.log(JSON.stringify(result, null, 2));

    console.log('\n🔍 ANÁLISIS:');
    if (result.success && result.data) {
      const data = result.data;
      const isMedicalProfessional = data.profesion && 
        (data.profesion.includes('MÉDICO') || data.profesion.includes('CIRUJANO'));
      
      console.log(`   ✅ Profesional médico: ${isMedicalProfessional ? 'SÍ' : 'NO'}`);
      console.log(`   ✅ Nombre: ${data.nombre || 'No detectado'}`);
      console.log(`   ✅ Profesión: ${data.profesion || 'No detectada'}`);
      console.log(`   ✅ Especialidad: ${data.especialidad || 'No especificada'}`);
      console.log(`   ✅ Matrícula: ${data.matricula || 'No detectada'}`);
      
      if (isMedicalProfessional) {
        console.log('\n🎯 ESTADO: ✅ VÁLIDO - Puede proceder con el registro');
      } else {
        console.log('\n🎯 ESTADO: ❌ NO VÁLIDO - No es médico');
      }
    } else {
      console.log(`   ❌ Error: ${result.message}`);
      console.log('\n🎯 ESTADO: ❌ NO VÁLIDO - Error en la consulta');
    }

    console.log('\n🎉 PRUEBA COMPLETADA');
    console.log('=' .repeat(30));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Ejecutar la prueba
testSACSValidation();
