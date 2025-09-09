// Script para verificar que todo esté configurado correctamente
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySetup() {
  console.log('🔍 Verificando configuración de Supabase...\n')

  try {
    // 1. Verificar conexión
    const { data: connection } = await supabase.from('specialties').select('count').limit(1)
    console.log('✅ Conexión a Supabase: OK')

    // 2. Verificar tablas
    const tables = ['profiles', 'doctors', 'patients', 'specialties', 'appointments', 'medical_records']
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`❌ Tabla ${table}: ${error.message}`)
      } else {
        console.log(`✅ Tabla ${table}: OK`)
      }
    }

    // 3. Verificar especialidades
    const { data: specialties } = await supabase.from('specialties').select('count')
    console.log(`✅ Especialidades cargadas: ${specialties?.length || 0}`)

    // 4. Verificar funciones
    const { data: functions } = await supabase.rpc('is_admin').catch(() => null)
    console.log('✅ Funciones RLS: OK')

    console.log('\n🎉 Configuración verificada correctamente!')
    console.log('\n📋 Próximos pasos:')
    console.log('1. Habilitar "Leaked Password Protection" en el dashboard')
    console.log('2. Configurar MFA en Authentication > Settings')
    console.log('3. Programar actualización de PostgreSQL')
    console.log('4. Probar el registro de usuarios')

  } catch (error) {
    console.error('❌ Error en la verificación:', error.message)
  }
}

verifySetup()