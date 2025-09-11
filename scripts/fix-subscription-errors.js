#!/usr/bin/env node

/**
 * Script para actualizar referencias de subscription.unsubscribe() 
 * que pueden fallar con las nuevas versiones de Supabase
 */

const fs = require('fs');
const path = require('path');

// Función para buscar archivos recursivamente
function findFiles(dir, extension = '.tsx', files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findFiles(fullPath, extension, files);
    } else if (stat.isFile() && (item.endsWith(extension) || item.endsWith('.ts'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Función para verificar y corregir archivos
function checkAndFixSubscriptionUsage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar patrones problemáticos
    const problematicPatterns = [
      /subscription\.unsubscribe\(\)/g,
      /subscription\?\\.unsubscribe\(\)/g,
      /return\s+\(\)\s*=>\s*{\s*subscription\.unsubscribe\(\)/g,
      /return\s+\(\)\s*=>\s*subscription\.unsubscribe\(\)/g
    ];
    
    let hasIssues = false;
    let newContent = content;
    
    // Verificar si el archivo usa onAuthStateChange
    if (content.includes('onAuthStateChange')) {
      console.log(`🔍 Verificando: ${filePath}`);
      
      // Buscar patrones problemáticos
      for (const pattern of problematicPatterns) {
        if (pattern.test(content)) {
          hasIssues = true;
          console.log(`  ⚠️  Patrón problemático encontrado: ${pattern.source}`);
        }
      }
      
      // Aplicar correcciones comunes
      if (hasIssues) {
        console.log(`  🔧 Aplicando correcciones...`);
        
        // Corregir subscription.unsubscribe() simple
        newContent = newContent.replace(
          /return\s*\(\)\s*=>\s*subscription\.unsubscribe\(\);?/g,
          `return () => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.warn('⚠️ Error cleaning up auth subscription:', error);
      }
    };`
        );
        
        // Corregir subscription?.unsubscribe() 
        newContent = newContent.replace(
          /return\s*\(\)\s*=>\s*{\s*subscription\?\\.unsubscribe\(\);?\s*};?/g,
          `return () => {
      try {
        subscription?.unsubscribe();
      } catch (error) {
        console.warn('⚠️ Error cleaning up auth subscription:', error);
      }
    };`
        );
        
        // Corregir en bloques return más complejos
        newContent = newContent.replace(
          /return\s*\(\)\s*=>\s*{\s*([^}]*)\s*subscription\.unsubscribe\(\);?\s*([^}]*)\s*};?/g,
          (match, before, after) => {
            return `return () => {${before}
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.warn('⚠️ Error cleaning up auth subscription:', error);
      }${after}
    };`;
          }
        );
        
        // Guardar archivo corregido
        if (newContent !== content) {
          fs.writeFileSync(filePath, newContent);
          console.log(`  ✅ Archivo corregido exitosamente`);
        } else {
          console.log(`  ℹ️  No se requirieron cambios`);
        }
      } else {
        console.log(`  ✅ No se encontraron problemas`);
      }
    }
    
    return hasIssues;
    
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 VERIFICADOR DE SUSCRIPCIONES SUPABASE');
  console.log('=' .repeat(50));
  
  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ Directorio src/ no encontrado');
    process.exit(1);
  }
  
  // Buscar archivos TypeScript/React
  console.log('🔍 Buscando archivos...');
  const files = findFiles(srcDir);
  console.log(`📁 Encontrados ${files.length} archivos\n`);
  
  let totalIssues = 0;
  let fixedFiles = 0;
  
  // Verificar cada archivo
  for (const file of files) {
    const hadIssues = checkAndFixSubscriptionUsage(file);
    if (hadIssues) {
      totalIssues++;
      fixedFiles++;
    }
  }
  
  console.log('\n📊 RESUMEN:');
  console.log('=' .repeat(30));
  console.log(`📁 Archivos verificados: ${files.length}`);
  console.log(`⚠️  Archivos con problemas: ${totalIssues}`);
  console.log(`🔧 Archivos corregidos: ${fixedFiles}`);
  
  if (totalIssues === 0) {
    console.log('\n🎉 ¡No se encontraron problemas!');
  } else {
    console.log('\n✅ Correcciones aplicadas exitosamente');
    console.log('\n📝 RECOMENDACIONES:');
    console.log('• Ejecuta npm run dev para probar los cambios');
    console.log('• Verifica que no haya errores de TypeScript');
    console.log('• Prueba el flujo de autenticación');
  }
}

main();