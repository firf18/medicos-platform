/**
 * 🔄 REINICIADOR DE SERVIDOR CON VARIABLES DE ENTORNO
 * 
 * Script para reiniciar el servidor de desarrollo y asegurar que lea las variables
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 REINICIANDO SERVIDOR DE DESARROLLO');
console.log('=' .repeat(50));

// Verificar que el archivo .env.local existe
const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ ERROR: El archivo .env.local no existe');
  console.log('🔧 SOLUCIÓN: Ejecuta primero el script de configuración');
  process.exit(1);
}

console.log('✅ Archivo .env.local encontrado');

// Leer el contenido del archivo
const envContent = fs.readFileSync(envPath, 'utf8');

// Verificar que contiene las variables necesarias
const requiredVars = [
  'DIDIT_API_KEY=iXRQ76_FbQRt_N5tGK3UqkkAt3P5bQ5M6dTSSAsg8Vk',
  'DIDIT_WEBHOOK_SECRET_KEY=NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck',
  'DIDIT_WORKFLOW_ID=3176221b-c77c-4fea-b2b3-da185ef18122'
];

console.log('\n🔍 VERIFICANDO VARIABLES EN .env.local:');
let allVarsPresent = true;

requiredVars.forEach(varLine => {
  if (envContent.includes(varLine)) {
    console.log(`✅ ${varLine.split('=')[0]}: Configurada`);
  } else {
    console.log(`❌ ${varLine.split('=')[0]}: NO ENCONTRADA`);
    allVarsPresent = false;
  }
});

if (!allVarsPresent) {
  console.log('\n❌ ERROR: Faltan variables requeridas en .env.local');
  console.log('🔧 SOLUCIÓN: Ejecuta el script de configuración nuevamente');
  process.exit(1);
}

console.log('\n✅ Todas las variables están configuradas correctamente');

// Función para matar procesos de Node.js
function killNodeProcesses() {
  return new Promise((resolve) => {
    console.log('\n🔄 Deteniendo procesos de Node.js existentes...');
    
    const killProcess = spawn('taskkill', ['/F', '/IM', 'node.exe'], { 
      shell: true,
      stdio: 'pipe'
    });
    
    killProcess.on('close', (code) => {
      console.log('✅ Procesos de Node.js detenidos');
      resolve();
    });
    
    killProcess.on('error', (error) => {
      console.log('⚠️  No se pudieron detener procesos existentes (puede ser normal)');
      resolve();
    });
  });
}

// Función para iniciar el servidor
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('\n🚀 Iniciando servidor de desarrollo...');
    console.log('📡 El servidor se iniciará en http://localhost:3000');
    
    const server = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        // Asegurar que las variables estén disponibles
        DIDIT_API_KEY: 'iXRQ76_FbQRt_N5tGK3UqkkAt3P5bQ5M6dTSSAsg8Vk',
        DIDIT_WEBHOOK_SECRET_KEY: 'NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck',
        DIDIT_WORKFLOW_ID: '3176221b-c77c-4fea-b2b3-da185ef18122',
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000'
      }
    });
    
    server.on('error', (error) => {
      console.error('❌ Error iniciando servidor:', error);
      reject(error);
    });
    
    // Esperar un poco para que el servidor inicie
    setTimeout(() => {
      console.log('\n🎉 SERVIDOR INICIADO EXITOSAMENTE!');
      console.log('\n📋 PRÓXIMOS PASOS:');
      console.log('1. ✅ Ve a http://localhost:3000/auth/register/doctor');
      console.log('2. ✅ Completa el formulario hasta verificación');
      console.log('3. ✅ Haz clic en "Iniciar Verificación de Identidad"');
      console.log('4. ✅ La verificación Didit debería funcionar sin errores');
      console.log('\n🏥 ¡EL REGISTRO DE MÉDICOS ESTÁ LISTO!');
      resolve();
    }, 3000);
  });
}

// Ejecutar el proceso completo
async function restartServer() {
  try {
    await killNodeProcesses();
    await startServer();
  } catch (error) {
    console.error('❌ Error reiniciando servidor:', error);
    process.exit(1);
  }
}

restartServer();


