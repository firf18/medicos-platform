"use client";

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateTestPatientPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const supabase = createClientComponentClient();

  const createTestPatient = async () => {
    try {
      setLoading(true);
      setError('');
      setResult('');

      const testPatient = {
        email: 'maria.gonzalez.patient@gmail.com',
        password: 'TestPatient123!',
        firstName: 'María',
        lastName: 'González',
        phone: '+584121234567',
        dateOfBirth: '1985-06-15',
        bloodType: 'O+',
        allergies: ['Penicilina', 'Polen'],
        emergencyContact: {
          name: 'Carlos González',
          phone: '+584121234568',
          relationship: 'Esposo'
        }
      };

      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testPatient.email,
        password: testPatient.password,
        options: {
          data: {
            first_name: testPatient.firstName,
            last_name: testPatient.lastName,
            role: 'patient'
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user?.id) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      let resultMessage = `✅ Usuario creado: ${authData.user.id}\n`;

      // 2. Crear perfil en la tabla profiles
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            first_name: testPatient.firstName,
            last_name: testPatient.lastName,
            email: testPatient.email,
            phone: testPatient.phone,
            role: 'patient',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          resultMessage += `⚠️ Error creando perfil: ${profileError.message}\n`;
        } else {
          resultMessage += `✅ Perfil creado exitosamente\n`;
        }
      } catch (profileErr) {
        resultMessage += `⚠️ Error creando perfil: ${profileErr}\n`;
      }

      // 3. Crear registro en la tabla patients
      try {
        const { error: patientError } = await supabase
          .from('patients')
          .insert({
            id: authData.user.id,
            date_of_birth: testPatient.dateOfBirth,
            blood_type: testPatient.bloodType,
            allergies: testPatient.allergies,
            emergency_contact_name: testPatient.emergencyContact.name,
            emergency_contact_phone: testPatient.emergencyContact.phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (patientError) {
          resultMessage += `⚠️ Error creando registro de paciente: ${patientError.message}\n`;
        } else {
          resultMessage += `✅ Registro de paciente creado\n`;
        }
      } catch (patientErr) {
        resultMessage += `⚠️ Error creando registro de paciente: ${patientErr}\n`;
      }

      // 4. Crear datos de prueba
      const userId = authData.user.id;
      
      // Citas
      try {
        const { error: appointmentsError } = await supabase
          .from('appointments')
          .insert([
            {
              patient_id: userId,
              doctor_id: userId,
              appointment_type: 'consulta_general',
              title: 'Consulta de Medicina General',
              description: 'Revisión médica de rutina',
              scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              duration_minutes: 30,
              status: 'scheduled',
              location: 'Clínica Central',
              is_virtual: false,
              created_at: new Date().toISOString()
            }
          ]);

        if (appointmentsError) {
          resultMessage += `⚠️ Error creando citas: ${appointmentsError.message}\n`;
        } else {
          resultMessage += `✅ Citas de prueba creadas\n`;
        }
      } catch (appointmentsErr) {
        resultMessage += `⚠️ Error creando citas: ${appointmentsErr}\n`;
      }

      // Medicamentos
      try {
        const { error: medicationsError } = await supabase
          .from('patient_medications')
          .insert([
            {
              patient_id: userId,
              doctor_id: userId,
              medication_name: 'Metformina',
              dosage: '500mg',
              frequency: '2 veces al día',
              instructions: 'Tomar con las comidas',
              start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              is_active: true,
              created_at: new Date().toISOString()
            }
          ]);

        if (medicationsError) {
          resultMessage += `⚠️ Error creando medicamentos: ${medicationsError.message}\n`;
        } else {
          resultMessage += `✅ Medicamentos de prueba creados\n`;
        }
      } catch (medicationsErr) {
        resultMessage += `⚠️ Error creando medicamentos: ${medicationsErr}\n`;
      }

      // Métricas de salud
      try {
        const { error: metricsError } = await supabase
          .from('health_metrics')
          .insert([
            {
              patient_id: userId,
              metric_type: 'weight',
              value: 65.5,
              unit: 'kg',
              recorded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              source: 'manual',
              notes: 'Peso matutino'
            }
          ]);

        if (metricsError) {
          resultMessage += `⚠️ Error creando métricas: ${metricsError.message}\n`;
        } else {
          resultMessage += `✅ Métricas de salud creadas\n`;
        }
      } catch (metricsErr) {
        resultMessage += `⚠️ Error creando métricas: ${metricsErr}\n`;
      }

      // Notificaciones
      try {
        const { error: notificationsError } = await supabase
          .from('patient_notifications')
          .insert([
            {
              patient_id: userId,
              title: 'Recordatorio de Cita',
              message: 'Tienes una cita médica mañana a las 10:00 AM',
              notification_type: 'appointment',
              priority: 'high',
              is_read: false,
              created_at: new Date().toISOString()
            }
          ]);

        if (notificationsError) {
          resultMessage += `⚠️ Error creando notificaciones: ${notificationsError.message}\n`;
        } else {
          resultMessage += `✅ Notificaciones de prueba creadas\n`;
        }
      } catch (notificationsErr) {
        resultMessage += `⚠️ Error creando notificaciones: ${notificationsErr}\n`;
      }

      resultMessage += `\n🎉 ¡Paciente de prueba creado!\n\n`;
      resultMessage += `📋 Información de acceso:\n`;
      resultMessage += `📧 Email: ${testPatient.email}\n`;
      resultMessage += `🔑 Contraseña: ${testPatient.password}\n`;
      resultMessage += `👤 Nombre: ${testPatient.firstName} ${testPatient.lastName}\n\n`;
      resultMessage += `🌐 URLs para probar:\n`;
      resultMessage += `🔗 Login: http://localhost:3000/auth/login/paciente\n`;
      resultMessage += `🔗 Dashboard: http://localhost:3000/patient/dashboard\n`;
      resultMessage += `🔗 Dashboard Test: http://localhost:3000/patient/dashboard-test\n`;

      setResult(resultMessage);

    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Crear Paciente de Prueba
            </CardTitle>
            <p className="text-center text-gray-600">
              Este formulario crea un paciente de prueba con datos completos para probar el dashboard
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Datos del Paciente de Prueba:</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Email:</strong> maria.gonzalez.patient@gmail.com</p>
                <p><strong>Contraseña:</strong> TestPatient123!</p>
                <p><strong>Nombre:</strong> María González</p>
                <p><strong>Teléfono:</strong> +584121234567</p>
                <p><strong>Tipo de sangre:</strong> O+</p>
                <p><strong>Alergias:</strong> Penicilina, Polen</p>
              </div>
            </div>

            <Button 
              onClick={createTestPatient} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Creando Paciente...' : 'Crear Paciente de Prueba'}
            </Button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">Error:</h4>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Resultado:</h4>
                <pre className="text-green-800 text-sm whitespace-pre-wrap">{result}</pre>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Después de crear el paciente:</h3>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Ve a <code className="bg-gray-200 px-1 rounded">http://localhost:3000/auth/login/paciente</code></li>
                <li>Inicia sesión con el email y contraseña mostrados arriba</li>
                <li>Navega al dashboard en <code className="bg-gray-200 px-1 rounded">http://localhost:3000/patient/dashboard</code></li>
                <li>O usa la página de prueba en <code className="bg-gray-200 px-1 rounded">http://localhost:3000/patient/dashboard-test</code></li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
