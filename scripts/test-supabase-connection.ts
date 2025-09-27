#!/usr/bin/env tsx

/**
 * Script para verificar la conexión con Supabase y crear un paciente de prueba
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://zonmvugejshdstymfdva.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvbm12dWdlanNoZHN0eW1mZHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMjE4OTQsImV4cCI6MjA3MjU5Nzg5NH0.MWyU7xDmAr5EsR661nwSC1q7D90I1_oQUhwGqtlJd6k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  try {
    console.log('🔍 Verificando conexión con Supabase...');
    
    // Verificar conexión básica
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Error de conexión:', error.message);
      return;
    }

    console.log('✅ Conexión exitosa con Supabase');

    // Verificar tablas disponibles
    console.log('📋 Verificando tablas disponibles...');
    
    const tables = ['profiles', 'patients', 'appointments', 'patient_medications', 'health_metrics', 'patient_notifications', 'medical_documents'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (tableError) {
          console.log(`⚠️ Tabla ${table}: ${tableError.message}`);
        } else {
          console.log(`✅ Tabla ${table}: Disponible`);
        }
      } catch (err) {
        console.log(`❌ Tabla ${table}: Error inesperado`);
      }
    }

    // Intentar crear usuario con diferentes emails
    console.log('\n🧪 Probando creación de usuario...');
    
    const testEmails = [
      'test@test.com',
      'user@test.com',
      'patient@test.com',
      'maria@test.com'
    ];

    for (const email of testEmails) {
      try {
        console.log(`📧 Probando email: ${email}`);
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email,
          password: 'TestPassword123!',
          options: {
            data: {
              first_name: 'Test',
              last_name: 'User',
              role: 'patient'
            }
          }
        });

        if (authError) {
          console.log(`❌ ${email}: ${authError.message}`);
        } else {
          console.log(`✅ ${email}: Usuario creado exitosamente!`);
          console.log(`🆔 ID: ${authData.user?.id}`);
          
          // Limpiar el usuario creado
          if (authData.user?.id) {
            await supabase.auth.admin.deleteUser(authData.user.id);
            console.log(`🗑️ Usuario ${email} eliminado`);
          }
          break;
        }
      } catch (err) {
        console.log(`❌ ${email}: Error inesperado`);
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
testSupabaseConnection();
