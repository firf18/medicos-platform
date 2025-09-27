#!/usr/bin/env node

/**
 * 🗑️ SCRIPT PARA ELIMINAR TODOS LOS USUARIOS DE SUPABASE
 * 
 * Este script elimina todos los usuarios registrados en Supabase
 * usando el cliente admin con Service Role Key
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zonmvugejshdstymfdva.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no está configurado en .env.local');
  console.log('📝 Por favor, agrega tu Service Role Key en el archivo .env.local:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

async function deleteAllUsers() {
  try {
    console.log('🔍 Conectando a Supabase...');
    console.log('📍 URL:', supabaseUrl);
    
    // Obtener todos los usuarios
    console.log('📋 Obteniendo lista de usuarios...');
    const { data: usersResponse, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error al obtener usuarios:', listError.message);
      return;
    }
    
    const users = usersResponse?.users || [];
    
    if (!users || users.length === 0) {
      console.log('✅ No hay usuarios registrados en Supabase');
      return;
    }
    
    console.log(`📊 Se encontraron ${users.length} usuarios:`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email || 'Sin email'} (ID: ${user.id})`);
    });
    
    console.log('\n🗑️ Iniciando eliminación de usuarios...');
    
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        console.log(`🔄 Eliminando usuario: ${user.email}...`);
        
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`❌ Error al eliminar ${user.email}:`, deleteError.message);
          errorCount++;
        } else {
          console.log(`✅ Usuario ${user.email} eliminado exitosamente`);
          deletedCount++;
        }
        
        // Pequeña pausa para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.error(`❌ Error inesperado al eliminar ${user.email}:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 RESUMEN DE ELIMINACIÓN:');
    console.log(`✅ Usuarios eliminados: ${deletedCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📋 Total procesados: ${users.length}`);
    
    if (deletedCount === users.length) {
      console.log('\n🎉 ¡Todos los usuarios han sido eliminados exitosamente!');
    } else if (deletedCount > 0) {
      console.log('\n⚠️ Algunos usuarios fueron eliminados, pero hubo errores');
    } else {
      console.log('\n❌ No se pudo eliminar ningún usuario');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Función para confirmar la acción
async function confirmDeletion() {
  console.log('⚠️  ADVERTENCIA: Este script eliminará TODOS los usuarios de Supabase');
  console.log('📍 Proyecto:', supabaseUrl);
  console.log('');
  console.log('Esta acción es IRREVERSIBLE. ¿Estás seguro de que quieres continuar?');
  console.log('');
  console.log('Para continuar, ejecuta el script con el flag --confirm:');
  console.log('node scripts/delete-all-users.js --confirm');
  
  if (process.argv.includes('--confirm')) {
    console.log('✅ Confirmación recibida. Procediendo con la eliminación...\n');
    await deleteAllUsers();
  } else {
    console.log('❌ Operación cancelada. Usa --confirm para proceder.');
  }
}

// Ejecutar el script
confirmDeletion();
