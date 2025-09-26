/**
 * 🧪 ENDPOINT DE PRUEBA PARA VERIFICAR SUPABASE
 * 
 * Este endpoint prueba la conectividad con Supabase y la creación de usuarios
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 ENDPOINT DE PRUEBA INICIADO');
    
    const admin = createAdminClient();
    
    // Test 1: Verificar conectividad básica
    console.log('🔍 Test 1: Verificando conectividad básica...');
    try {
      const { data: testData, error: testError } = await (admin as any)
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('❌ Error de conectividad:', testError);
        return NextResponse.json({ 
          error: 'Error de conectividad con Supabase',
          details: testError.message,
          code: testError.code
        }, { status: 500 });
      }
      
      console.log('✅ Conectividad básica verificada');
    } catch (connectivityError) {
      console.error('❌ Error de conectividad:', connectivityError);
      return NextResponse.json({ 
        error: 'Error de conectividad con Supabase',
        details: connectivityError.message
      }, { status: 500 });
    }
    
    // Test 2: Verificar variables de entorno
    console.log('🔍 Test 2: Verificando variables de entorno...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Variables de entorno:', {
      supabaseUrl: supabaseUrl ? '✅ Configurado' : '❌ No configurado',
      serviceKey: serviceKey ? '✅ Configurado' : '❌ No configurado',
      urlLength: supabaseUrl?.length || 0,
      keyLength: serviceKey?.length || 0
    });
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ 
        error: 'Variables de entorno faltantes',
        details: {
          supabaseUrl: !!supabaseUrl,
          serviceKey: !!serviceKey
        }
      }, { status: 500 });
    }
    
    // Test 3: Intentar crear un usuario de prueba con diferentes configuraciones
    console.log('🔍 Test 3: Intentando crear usuario de prueba...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123';
    
    // Probar diferentes configuraciones
    const testConfigs = [
      {
        name: 'Configuración básica',
        config: {
          email: testEmail,
          password: testPassword,
          email_confirm: true
        }
      },
      {
        name: 'Con user_metadata',
        config: {
          email: testEmail,
          password: testPassword,
          email_confirm: true,
          user_metadata: {
            firstName: 'Test',
            lastName: 'User'
          }
        }
      },
      {
        name: 'Sin email_confirm',
        config: {
          email: testEmail,
          password: testPassword
        }
      }
    ];
    
    let lastError = null;
    
    for (const testConfig of testConfigs) {
      console.log(`🔍 Probando: ${testConfig.name}`);
      
      try {
        const { data: authData, error: authError } = await (admin as any).auth.admin.createUser(testConfig.config);
        
        if (authError) {
          console.error(`❌ Error con ${testConfig.name}:`, {
            message: authError.message,
            status: authError.status,
            statusCode: authError.statusCode,
            error: authError.error,
            error_code: authError.error_code,
            error_description: authError.error_description,
            error_id: authError.error_id,
            fullError: authError
          });
          
          lastError = authError;
          
          // Si es el mismo error, continuar con la siguiente configuración
          if (authError.message === 'Database error creating new user') {
            console.log(`⚠️ Mismo error con ${testConfig.name}, probando siguiente configuración...`);
            continue;
          }
        } else {
          console.log(`✅ Usuario creado exitosamente con ${testConfig.name}:`, authData.user?.id);
          
          // Limpiar: eliminar el usuario de prueba
          try {
            await (admin as any).auth.admin.deleteUser(authData.user.id);
            console.log('✅ Usuario de prueba eliminado');
          } catch (deleteError) {
            console.log('⚠️ No se pudo eliminar usuario de prueba:', deleteError.message);
          }
          
          // Si una configuración funciona, usar esa
          break;
        }
        
      } catch (authTestError) {
        console.error(`❌ Error en test ${testConfig.name}:`, authTestError);
        lastError = authTestError;
      }
    }
    
    if (lastError) {
      return NextResponse.json({ 
        error: 'Error creando usuario de prueba',
        details: lastError.message,
        errorCode: lastError.error_code || lastError.error,
        status: lastError.status,
        statusCode: lastError.statusCode,
        error_description: lastError.error_description,
        error_id: lastError.error_id,
        diagnosis: 'Este es un problema de configuración del proyecto Supabase, no del código'
      }, { status: 400 });
    }
    
    console.log('✅ Todos los tests pasaron exitosamente');
    
    return NextResponse.json({
      success: true,
      message: 'Todos los tests de Supabase pasaron exitosamente',
      tests: {
        connectivity: '✅ OK',
        environment: '✅ OK',
        userCreation: '✅ OK'
      }
    });
    
  } catch (error) {
    console.error('❌ Error en endpoint de prueba:', error);
    return NextResponse.json({ 
      error: 'Error interno en endpoint de prueba',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
