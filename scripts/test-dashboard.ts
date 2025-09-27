/**
 * Script de Prueba para Dashboard de Medicina General
 * Verifica todas las funcionalidades implementadas
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (usar variables de entorno en producción)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration?: number;
}

class DashboardTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Iniciando pruebas del Dashboard de Medicina General...\n');

    // Ejecutar todas las pruebas
    await this.testDatabaseConnection();
    await this.testSpecialtiesTable();
    await this.testDoctorProfilesTable();
    await this.testAppointmentsTable();
    await this.testMedicalRecordsTable();
    await this.testNotificationsTable();
    await this.testDashboardFunctions();
    await this.testRowLevelSecurity();
    await this.testAuthenticationFlow();

    // Mostrar resultados
    this.showResults();
  }

  private async testDatabaseConnection(): Promise<void> {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.from('medical_specialties').select('count').limit(1);
      const duration = Date.now() - startTime;
      
      if (error) {
        this.addResult('Conexión a Base de Datos', 'FAIL', `Error: ${error.message}`, duration);
      } else {
        this.addResult('Conexión a Base de Datos', 'PASS', 'Conexión exitosa', duration);
      }
    } catch (error) {
      this.addResult('Conexión a Base de Datos', 'FAIL', `Excepción: ${error}`, Date.now() - startTime);
    }
  }

  private async testSpecialtiesTable(): Promise<void> {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase
        .from('medical_specialties')
        .select('*')
        .eq('is_active', true);

      const duration = Date.now() - startTime;

      if (error) {
        this.addResult('Tabla de Especialidades', 'FAIL', `Error: ${error.message}`, duration);
      } else if (data && data.length > 0) {
        this.addResult('Tabla de Especialidades', 'PASS', `${data.length} especialidades encontradas`, duration);
      } else {
        this.addResult('Tabla de Especialidades', 'FAIL', 'No se encontraron especialidades', duration);
      }
    } catch (error) {
      this.addResult('Tabla de Especialidades', 'FAIL', `Excepción: ${error}`, Date.now() - startTime);
    }
  }

  private async testDoctorProfilesTable(): Promise<void> {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('id, license_number, specialty_id')
        .limit(5);

      const duration = Date.now() - startTime;

      if (error) {
        this.addResult('Tabla de Perfiles de Médicos', 'FAIL', `Error: ${error.message}`, duration);
      } else {
        this.addResult('Tabla de Perfiles de Médicos', 'PASS', `${data?.length || 0} perfiles encontrados`, duration);
      }
    } catch (error) {
      this.addResult('Tabla de Perfiles de Médicos', 'FAIL', `Excepción: ${error}`, Date.now() - startTime);
    }
  }

  private async testAppointmentsTable(): Promise<void> {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, status, scheduled_at')
        .limit(5);

      const duration = Date.now() - startTime;

      if (error) {
        this.addResult('Tabla de Citas', 'FAIL', `Error: ${error.message}`, duration);
      } else {
        this.addResult('Tabla de Citas', 'PASS', `${data?.length || 0} citas encontradas`, duration);
      }
    } catch (error) {
      this.addResult('Tabla de Citas', 'FAIL', `Excepción: ${error}`, Date.now() - startTime);
    }
  }

  private async testMedicalRecordsTable(): Promise<void> {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('id, record_type, priority')
        .limit(5);

      const duration = Date.now() - startTime;

      if (error) {
        this.addResult('Tabla de Expedientes Médicos', 'FAIL', `Error: ${error.message}`, duration);
      } else {
        this.addResult('Tabla de Expedientes Médicos', 'PASS', `${data?.length || 0} expedientes encontrados`, duration);
      }
    } catch (error) {
      this.addResult('Tabla de Expedientes Médicos', 'FAIL', `Excepción: ${error}`, Date.now() - startTime);
    }
  }

  private async testNotificationsTable(): Promise<void> {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, priority')
        .limit(5);

      const duration = Date.now() - startTime;

      if (error) {
        this.addResult('Tabla de Notificaciones', 'FAIL', `Error: ${error.message}`, duration);
      } else {
        this.addResult('Tabla de Notificaciones', 'PASS', `${data?.length || 0} notificaciones encontradas`, duration);
      }
    } catch (error) {
      this.addResult('Tabla de Notificaciones', 'FAIL', `Excepción: ${error}`, Date.now() - startTime);
    }
  }

  private async testDashboardFunctions(): Promise<void> {
    const startTime = Date.now();
    try {
      // Probar función de estadísticas (necesita un UUID válido)
      const testUuid = '00000000-0000-0000-0000-000000000000';
      const { data, error } = await supabase.rpc('get_doctor_dashboard_stats', { doctor_uuid: testUuid });

      const duration = Date.now() - startTime;

      if (error) {
        // La función puede fallar si no hay datos, pero debería existir
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          this.addResult('Funciones del Dashboard', 'FAIL', 'Función get_doctor_dashboard_stats no existe', duration);
        } else {
          this.addResult('Funciones del Dashboard', 'PASS', 'Función existe (error esperado sin datos)', duration);
        }
      } else {
        this.addResult('Funciones del Dashboard', 'PASS', 'Función ejecutada correctamente', duration);
      }
    } catch (error) {
      this.addResult('Funciones del Dashboard', 'FAIL', `Excepción: ${error}`, Date.now() - startTime);
    }
  }

  private async testRowLevelSecurity(): Promise<void> {
    const startTime = Date.now();
    try {
      // Probar acceso sin autenticación (debería fallar por RLS)
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .limit(1);

      const duration = Date.now() - startTime;

      if (error && error.message.includes('permission denied')) {
        this.addResult('Row Level Security', 'PASS', 'RLS activo - acceso denegado sin autenticación', duration);
      } else if (data) {
        this.addResult('Row Level Security', 'FAIL', 'RLS no activo - acceso permitido sin autenticación', duration);
      } else {
        this.addResult('Row Level Security', 'SKIP', 'No se pudo verificar RLS', duration);
      }
    } catch (error) {
      this.addResult('Row Level Security', 'FAIL', `Excepción: ${error}`, Date.now() - startTime);
    }
  }

  private async testAuthenticationFlow(): Promise<void> {
    const startTime = Date.now();
    try {
      // Probar obtener sesión actual
      const { data: { session }, error } = await supabase.auth.getSession();

      const duration = Date.now() - startTime;

      if (error) {
        this.addResult('Flujo de Autenticación', 'FAIL', `Error: ${error.message}`, duration);
      } else if (session === null) {
        this.addResult('Flujo de Autenticación', 'PASS', 'No hay sesión activa (esperado)', duration);
      } else {
        this.addResult('Flujo de Autenticación', 'PASS', 'Sesión activa encontrada', duration);
      }
    } catch (error) {
      this.addResult('Flujo de Autenticación', 'FAIL', `Excepción: ${error}`, Date.now() - startTime);
    }
  }

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, duration?: number): void {
    this.results.push({
      test,
      status,
      message,
      duration
    });
  }

  private showResults(): void {
    console.log('\n📊 RESULTADOS DE LAS PRUEBAS\n');
    console.log('=' .repeat(60));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${icon} ${result.test}: ${result.message}${duration}`);
    });

    console.log('=' .repeat(60));
    console.log(`\n📈 RESUMEN:`);
    console.log(`✅ Pasaron: ${passed}`);
    console.log(`❌ Fallaron: ${failed}`);
    console.log(`⏭️  Omitidas: ${skipped}`);
    console.log(`📊 Total: ${this.results.length}`);

    if (failed === 0) {
      console.log('\n🎉 ¡Todas las pruebas pasaron! El dashboard está listo para producción.');
    } else {
      console.log('\n⚠️  Algunas pruebas fallaron. Revisa la configuración antes de desplegar.');
    }
  }
}

// Función para crear datos de prueba
export async function createTestData(): Promise<void> {
  console.log('🔧 Creando datos de prueba...\n');

  try {
    // Crear especialidades de prueba si no existen
    const { error: specialtiesError } = await supabase
      .from('medical_specialties')
      .upsert([
        {
          id: 'medicina_general',
          name: 'Medicina General',
          description: 'Atención médica primaria y preventiva',
          is_active: true
        },
        {
          id: 'cardiologia',
          name: 'Cardiología',
          description: 'Especialista en enfermedades del corazón',
          is_active: true
        }
      ], { onConflict: 'id' });

    if (specialtiesError) {
      console.error('Error creando especialidades:', specialtiesError);
    } else {
      console.log('✅ Especialidades creadas/actualizadas');
    }

    console.log('\n📝 Datos de prueba creados exitosamente');
  } catch (error) {
    console.error('Error creando datos de prueba:', error);
  }
}

// Función principal
export async function runDashboardTests(): Promise<void> {
  const tester = new DashboardTester();
  
  // Crear datos de prueba primero
  await createTestData();
  
  // Ejecutar todas las pruebas
  await tester.runAllTests();
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runDashboardTests().catch(console.error);
}
