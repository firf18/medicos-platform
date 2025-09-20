/**
 * 🔧 APLICADOR DE MIGRACIONES FALTANTES
 * 
 * Script para aplicar las migraciones que faltan en Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🔧 APLICANDO MIGRACIONES FALTANTES A SUPABASE');
console.log('=' .repeat(50));

// Función para cargar variables de entorno
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ Archivo .env.local no encontrado');
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return envVars;
}

async function applyMissingMigrations() {
  try {
    // Cargar variables de entorno
    const envVars = loadEnvFile();
    
    const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Variables de Supabase no configuradas');
      return;
    }
    
    console.log('🔗 Conectando a Supabase...');
    
    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verificar qué tablas faltan
    console.log('\n🔍 VERIFICANDO TABLAS FALTANTES...');
    
    const missingTables = [
      'patient_profiles',
      'notifications'
    ];
    
    for (const tableName of missingTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: Tabla existe`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: Error de acceso`);
      }
    }
    
    // Crear tabla patient_profiles si no existe
    console.log('\n🏥 CREANDO TABLA PATIENT_PROFILES...');
    const createPatientProfilesSQL = `
      CREATE TABLE IF NOT EXISTS patient_profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE,
        gender VARCHAR(20),
        phone VARCHAR(20),
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(20),
        blood_type VARCHAR(10),
        allergies TEXT[],
        chronic_conditions TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Habilitar RLS
      ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
      
      -- Política para que los pacientes vean su propio perfil
      CREATE POLICY "Patients can view their own profile" ON patient_profiles
        FOR SELECT USING (auth.uid() = id);
      
      -- Política para que los pacientes actualicen su propio perfil
      CREATE POLICY "Patients can update their own profile" ON patient_profiles
        FOR UPDATE USING (auth.uid() = id);
      
      -- Política para que los médicos vean perfiles de sus pacientes
      CREATE POLICY "Doctors can view patient profiles" ON patient_profiles
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM appointments 
            WHERE appointments.patient_id = patient_profiles.id 
            AND appointments.doctor_id = auth.uid()
          )
        );
    `;
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: createPatientProfilesSQL });
      if (error) {
        console.log('⚠️  Error creando patient_profiles:', error.message);
      } else {
        console.log('✅ Tabla patient_profiles creada');
      }
    } catch (err) {
      console.log('⚠️  No se pudo crear patient_profiles:', err.message);
    }
    
    // Crear tabla notifications si no existe
    console.log('\n🔔 CREANDO TABLA NOTIFICATIONS...');
    const createNotificationsSQL = `
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'info',
        is_read BOOLEAN DEFAULT false,
        related_entity_type VARCHAR(50),
        related_entity_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Habilitar RLS
      ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
      
      -- Política para que los usuarios vean sus propias notificaciones
      CREATE POLICY "Users can view their own notifications" ON notifications
        FOR SELECT USING (auth.uid() = user_id);
      
      -- Política para que los usuarios actualicen sus propias notificaciones
      CREATE POLICY "Users can update their own notifications" ON notifications
        FOR UPDATE USING (auth.uid() = user_id);
      
      -- Política para que los usuarios inserten notificaciones para sí mismos
      CREATE POLICY "Users can insert notifications for themselves" ON notifications
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `;
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: createNotificationsSQL });
      if (error) {
        console.log('⚠️  Error creando notifications:', error.message);
      } else {
        console.log('✅ Tabla notifications creada');
      }
    } catch (err) {
      console.log('⚠️  No se pudo crear notifications:', err.message);
    }
    
    // Verificar estado final
    console.log('\n📊 VERIFICACIÓN FINAL...');
    const tablesToCheck = [
      'profiles',
      'medical_specialties',
      'doctor_profiles',
      'patient_profiles',
      'appointments',
      'medical_records',
      'notifications',
      'clinics',
      'identity_verifications',
      'doctor_dashboard_configs'
    ];
    
    let allTablesExist = true;
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
          allTablesExist = false;
        } else {
          console.log(`✅ ${tableName}: Tabla existe`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: Error de acceso`);
        allTablesExist = false;
      }
    }
    
    console.log('\n📊 RESUMEN:');
    if (allTablesExist) {
      console.log('✅ TODAS LAS TABLAS ESTÁN DISPONIBLES');
      console.log('🚀 La base de datos está lista para uso');
    } else {
      console.log('⚠️  ALGUNAS TABLAS AÚN FALTAN');
      console.log('🔧 Puede ser necesario aplicar migraciones manualmente');
    }
    
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. ✅ Ejecuta: npm run dev');
    console.log('2. ✅ Prueba el registro de médicos');
    console.log('3. ✅ Verifica el dashboard de pacientes');
    console.log('4. ✅ Prueba la autenticación multi-rol');
    
  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

// Ejecutar aplicación de migraciones
applyMissingMigrations().then(() => {
  console.log('\n🏥 ¡APLICACIÓN DE MIGRACIONES COMPLETADA!');
}).catch(error => {
  console.log('❌ Error en aplicación de migraciones:', error.message);
});
