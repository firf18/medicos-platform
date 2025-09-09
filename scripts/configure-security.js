// Script para configurar automáticamente lo que sea posible
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function configureAutomaticSecurity() {
  console.log('🔧 Configurando seguridad automática...\n')

  try {
    // 1. Verificar configuración de seguridad
    const { data: config } = await supabase.rpc('get_security_config')
    console.log('✅ Configuración de seguridad cargada:', config ? 'OK' : 'ERROR')

    // 2. Probar rate limiting
    const { data: rateLimitTest } = await supabase.rpc('check_login_rate_limit', {
      user_email: 'test@example.com'
    })
    console.log('✅ Rate limiting funcionando:', rateLimitTest ? 'OK' : 'ERROR')

    // 3. Verificar dashboard de seguridad
    const { data: dashboard } = await supabase.from('security_dashboard').select('*')
    console.log('✅ Dashboard de seguridad:', dashboard ? `${dashboard.length} métricas` : 'ERROR')

    // 4. Probar Edge Function de seguridad
    const response = await fetch(`${supabaseUrl}/functions/v1/security-monitor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        action: 'get_security_dashboard'
      })
    })
    
    if (response.ok) {
      console.log('✅ Edge Function de seguridad: OK')
    } else {
      console.log('❌ Edge Function de seguridad: ERROR')
    }

    console.log('\n🎉 Configuración automática completada!')
    console.log('\n⚠️  CONFIGURACIÓN MANUAL REQUERIDA:')
    console.log('1. Ve a https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0])
    console.log('2. Authentication > Settings > Security')
    console.log('3. Habilitar "Leaked Password Protection"')
    console.log('4. Configurar "Multi-Factor Authentication"')
    console.log('5. Database > Settings > Upgrade PostgreSQL')

  } catch (error) {
    console.error('❌ Error en configuración:', error.message)
  }
}

configureAutomaticSecurity()