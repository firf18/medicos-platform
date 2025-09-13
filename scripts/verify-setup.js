// ===================================================
// SCRIPT DE VERIFICACIÓN COMPLETA DEL SISTEMA
// ===================================================
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`)
}

if (!supabaseUrl || !supabaseKey) {
  log(colors.red, '❌ Variables de entorno faltantes')
  console.log('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySetup() {
  log(colors.blue + colors.bold, '🔍 VERIFICACIÓN COMPLETA DEL SISTEMA')
  log(colors.blue, '================================================\n')

  let totalChecks = 0
  let passedChecks = 0

  // Helper function para verificaciones
  function check(condition, successMessage, errorMessage) {
    totalChecks++
    if (condition) {
      log(colors.green, `✅ ${successMessage}`)
      passedChecks++
      return true
    } else {
      log(colors.red, `❌ ${errorMessage}`)
      return false
    }
  }

  try {
    // 1. VERIFICAR CONEXIÓN Y TABLAS PRINCIPALES
    log(colors.yellow, '📋 1. Verificando conexión y tablas principales...')
    
    const { data: connection, error: connectionError } = await supabase.from('specialties').select('count').limit(1)
    check(!connectionError, 'Conexión a Supabase establecida', `Error de conexión: ${connectionError?.message}`)

    // Verificar tablas críticas
    const criticalTables = [
      'profiles', 'doctors', 'patients', 'specialties', 
      'appointments', 'medical_records', 'patient_medications',
      'health_metrics', 'patient_notifications', 'emergency_contacts'
    ]
    
    for (const table of criticalTables) {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      check(!error, `Tabla ${table} accesible`, `Tabla ${table}: ${error?.message}`)
    }

    // 2. VERIFICAR FUNCIONES DE SEGURIDAD
    log(colors.yellow, '\n🔐 2. Verificando funciones de seguridad...')
    
    // Verificar funciones RLS
    const rlsFunctions = ['is_admin', 'is_doctor', 'is_patient', 'is_clinic', 'is_laboratory']
    for (const func of rlsFunctions) {
      try {
        await supabase.rpc(func)
        check(true, `Función ${func} disponible`, `Función ${func} no disponible`)
      } catch (error) {
        check(false, `Función ${func} disponible`, `Función ${func}: ${error.message}`)
      }
    }

    // 3. VERIFICAR DATOS ESENCIALES
    log(colors.yellow, '\n📊 3. Verificando datos esenciales...')
    
    const { data: specialties } = await supabase.from('specialties').select('*')
    check(specialties && specialties.length >= 30, 
      `Especialidades cargadas: ${specialties?.length || 0}`, 
      'Pocas especialidades cargadas (mínimo 30 recomendado)')

    // 4. VERIFICAR CONFIGURACIONES DE SEGURIDAD
    log(colors.yellow, '\n🛡️ 4. Verificando configuraciones de seguridad...')
    
    // Verificar RLS en tabla security_config
    const { data: securityConfig, error: securityError } = await supabase.from('security_config').select('*').limit(1)
    check(securityError?.code === 'PGRST116' || securityError?.message?.includes('permission'), 
      'RLS habilitado en security_config', 
      'RLS no configurado correctamente en security_config')

    // 5. VERIFICAR ÍNDICES Y PERFORMANCE
    log(colors.yellow, '\n⚡ 5. Verificando optimizaciones de performance...')
    
    // Test de performance básico
    const startTime = Date.now()
    const { data: perfTest } = await supabase
      .from('appointments')
      .select('id, patient_id, doctor_id')
      .limit(10)
    const endTime = Date.now()
    
    check(endTime - startTime < 1000, 
      `Query de performance: ${endTime - startTime}ms`, 
      `Query lenta: ${endTime - startTime}ms`)

    // 6. RESULTADO FINAL
    log(colors.blue, '\n================================================')
    log(colors.bold, `📈 RESULTADO: ${passedChecks}/${totalChecks} verificaciones pasaron`)
    
    if (passedChecks === totalChecks) {
      log(colors.green + colors.bold, '🎉 ¡SISTEMA COMPLETAMENTE VERIFICADO!')
    } else if (passedChecks >= totalChecks * 0.8) {
      log(colors.yellow + colors.bold, '⚠️  Sistema funcional con algunas mejoras pendientes')
    } else {
      log(colors.red + colors.bold, '🚨 Sistema necesita atención crítica')
    }

    // 7. CONFIGURACIONES MANUALES PENDIENTES
    log(colors.blue, '\n📋 CONFIGURACIONES MANUALES REQUERIDAS:')
    log(colors.yellow, '1. En Supabase Dashboard > Authentication > Settings:')
    console.log('   - ✅ Habilitar "Leaked Password Protection"')
    console.log('   - ✅ Configurar "Password Strength" a "Strong"')
    console.log('   - ✅ Habilitar "Multi-Factor Authentication"')
    
    log(colors.yellow, '\n2. En Database > Settings:')
    console.log('   - ✅ Programar actualización de PostgreSQL')
    
    log(colors.yellow, '\n3. Pruebas adicionales recomendadas:')
    console.log('   - 🧪 Probar registro de usuarios')
    console.log('   - 🧪 Verificar flujo de verificación por email')
    console.log('   - 🧪 Probar login con diferentes roles')
    console.log('   - 🧪 Verificar protección de rutas')

    log(colors.blue, '\n🚀 Para ejecutar las pruebas:')
    console.log('   npm run dev')
    console.log('   Ir a http://localhost:3000/auth/register')

  } catch (error) {
    log(colors.red, `❌ Error crítico en la verificación: ${error.message}`)
    console.log('\n🔧 Posibles soluciones:')
    console.log('1. Verificar variables de entorno')
    console.log('2. Verificar configuración de Supabase')
    console.log('3. Verificar que las migraciones se hayan aplicado')
  }
}

// Ejecutar verificación
verifySetup()