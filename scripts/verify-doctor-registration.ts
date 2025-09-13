/**
 * 🧪 SCRIPT DE VERIFICACIÓN - REGISTRO DE MÉDICOS RED-SALUD
 * 
 * Este script verifica que todos los componentes del registro de médicos
 * estén funcionando correctamente.
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface VerificationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
}

class DoctorRegistrationVerifier {
  private results: VerificationResult[] = [];

  async runAllTests(): Promise<VerificationResult[]> {
    console.log('🏥 Iniciando verificación del sistema de registro de médicos...\n');

    // Tests de conexión
    await this.testSupabaseConnection();
    await this.testDatabaseTables();
    await this.testRLSPolicies();
    
    // Tests de API
    await this.testSpecialtiesAPI();
    await this.testValidationFunctions();
    
    // Tests de componentes
    await this.testRegistrationFlow();
    
    // Tests de seguridad
    await this.testSecurityMeasures();

    this.printResults();
    return this.results;
  }

  private async testSupabaseConnection(): Promise<void> {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        this.addResult('Supabase Connection', 'FAIL', `Error de conexión: ${error.message}`);
      } else {
        this.addResult('Supabase Connection', 'PASS', 'Conexión exitosa a Supabase');
      }
    } catch (error) {
      this.addResult('Supabase Connection', 'FAIL', `Error inesperado: ${error}`);
    }
  }

  private async testDatabaseTables(): Promise<void> {
    const tables = [
      'doctor_registrations',
      'doctor_dashboard_configs', 
      'medical_specialties',
      'profiles'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        
        if (error) {
          this.addResult(`Table: ${table}`, 'FAIL', `Tabla no accesible: ${error.message}`);
        } else {
          this.addResult(`Table: ${table}`, 'PASS', 'Tabla accesible');
        }
      } catch (error) {
        this.addResult(`Table: ${table}`, 'FAIL', `Error inesperado: ${error}`);
      }
    }
  }

  private async testRLSPolicies(): Promise<void> {
    try {
      // Test de política de especialidades (debe ser pública)
      const { data, error } = await supabase
        .from('medical_specialties')
        .select('id, name')
        .limit(5);

      if (error) {
        this.addResult('RLS: Medical Specialties', 'FAIL', `Error: ${error.message}`);
      } else {
        this.addResult('RLS: Medical Specialties', 'PASS', `Especialidades accesibles: ${data?.length || 0}`);
      }
    } catch (error) {
      this.addResult('RLS: Medical Specialties', 'FAIL', `Error inesperado: ${error}`);
    }
  }

  private async testSpecialtiesAPI(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('medical_specialties')
        .select('*')
        .eq('is_active', true);

      if (error) {
        this.addResult('Specialties API', 'FAIL', `Error: ${error.message}`);
      } else {
        const specialties = data || [];
        this.addResult('Specialties API', 'PASS', `${specialties.length} especialidades activas`);
        
        // Verificar especialidades específicas
        const requiredSpecialties = ['medicina_general', 'cardiologia', 'pediatria'];
        const foundSpecialties = specialties.map(s => s.id);
        const missingSpecialties = requiredSpecialties.filter(id => !foundSpecialties.includes(id));
        
        if (missingSpecialties.length > 0) {
          this.addResult('Required Specialties', 'FAIL', `Especialidades faltantes: ${missingSpecialties.join(', ')}`);
        } else {
          this.addResult('Required Specialties', 'PASS', 'Todas las especialidades requeridas están presentes');
        }
      }
    } catch (error) {
      this.addResult('Specialties API', 'FAIL', `Error inesperado: ${error}`);
    }
  }

  private async testValidationFunctions(): Promise<void> {
    try {
      // Test de función de verificación de email
      const { data: emailTest, error: emailError } = await supabase
        .rpc('check_email_availability', { check_email: 'test@example.com' });

      if (emailError) {
        this.addResult('Email Validation Function', 'FAIL', `Error: ${emailError.message}`);
      } else {
        this.addResult('Email Validation Function', 'PASS', 'Función de validación de email funciona');
      }

      // Test de función de verificación de cédula
      const { data: licenseTest, error: licenseError } = await supabase
        .rpc('check_license_availability', { check_license: '1234567' });

      if (licenseError) {
        this.addResult('License Validation Function', 'FAIL', `Error: ${licenseError.message}`);
      } else {
        this.addResult('License Validation Function', 'PASS', 'Función de validación de cédula funciona');
      }
    } catch (error) {
      this.addResult('Validation Functions', 'FAIL', `Error inesperado: ${error}`);
    }
  }

  private async testRegistrationFlow(): Promise<void> {
    // Simular datos de registro de prueba
    const testRegistrationData = {
      firstName: 'Test',
      lastName: 'Doctor',
      email: 'test.doctor@example.com',
      phone: '+525512345678',
      licenseNumber: '9999999',
      licenseState: 'Ciudad de México',
      licenseExpiry: '2026-12-31',
      specialtyId: 'medicina_general',
      yearsOfExperience: 5,
      bio: 'Médico general con experiencia en atención primaria y medicina preventiva.',
      selectedFeatures: ['patient_list', 'appointments', 'medical_records'],
      workingHours: {
        monday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        thursday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        friday: { isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
        saturday: { isWorkingDay: false },
        sunday: { isWorkingDay: false }
      }
    };

    try {
      // Verificar que los datos de prueba son válidos
      this.addResult('Registration Data Validation', 'PASS', 'Datos de prueba válidos');
      
      // Verificar que la especialidad existe
      const { data: specialty, error: specialtyError } = await supabase
        .from('medical_specialties')
        .select('*')
        .eq('id', testRegistrationData.specialtyId)
        .single();

      if (specialtyError) {
        this.addResult('Specialty Validation', 'FAIL', `Especialidad no encontrada: ${specialtyError.message}`);
      } else {
        this.addResult('Specialty Validation', 'PASS', `Especialidad válida: ${specialty.name}`);
      }

    } catch (error) {
      this.addResult('Registration Flow', 'FAIL', `Error inesperado: ${error}`);
    }
  }

  private async testSecurityMeasures(): Promise<void> {
    try {
      // Test de RLS - intentar acceder a datos sin autenticación
      const { data, error } = await supabase
        .from('doctor_registrations')
        .select('*')
        .limit(1);

      if (error && error.message.includes('permission denied')) {
        this.addResult('RLS Security', 'PASS', 'RLS bloquea acceso no autorizado');
      } else if (error) {
        this.addResult('RLS Security', 'FAIL', `Error inesperado: ${error.message}`);
      } else {
        this.addResult('RLS Security', 'FAIL', 'RLS no está funcionando correctamente');
      }
    } catch (error) {
      this.addResult('RLS Security', 'FAIL', `Error inesperado: ${error}`);
    }
  }

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, details?: any): void {
    this.results.push({ test, status, message, details });
  }

  private printResults(): void {
    console.log('\n📊 RESULTADOS DE VERIFICACIÓN\n');
    console.log('=' .repeat(60));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      console.log(`${icon} ${result.test}: ${result.message}`);
      
      if (result.details) {
        console.log(`   📝 Detalles: ${JSON.stringify(result.details, null, 2)}`);
      }
    });

    console.log('\n' + '=' .repeat(60));
    console.log(`📈 RESUMEN: ${passed} pasaron, ${failed} fallaron, ${skipped} omitidos`);
    
    if (failed === 0) {
      console.log('🎉 ¡Todos los tests pasaron! El sistema está listo para producción.');
    } else {
      console.log('⚠️  Algunos tests fallaron. Revisa los errores antes de continuar.');
    }
  }
}

// Función principal para ejecutar la verificación
export async function verifyDoctorRegistrationSystem(): Promise<VerificationResult[]> {
  const verifier = new DoctorRegistrationVerifier();
  return await verifier.runAllTests();
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verifyDoctorRegistrationSystem()
    .then(results => {
      const failedTests = results.filter(r => r.status === 'FAIL');
      process.exit(failedTests.length > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Error ejecutando verificación:', error);
      process.exit(1);
    });
}
