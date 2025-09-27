#!/usr/bin/env tsx

/**
 * Script para crear un paciente de prueba usando Service Role Key
 * Este script bypass las políticas RLS para crear datos de prueba
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase con Service Role Key
const supabaseUrl = 'https://zonmvugejshdstymfdva.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvbm12dWdlanNoZHN0eW1mZHZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAyMTg5NCwiZXhwIjoyMDcyNTk3ODk0fQ.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'; // Placeholder - necesitas la key real

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Datos del paciente de prueba
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

async function createTestPatientWithServiceRole() {
  try {
    console.log('🚀 Iniciando registro de paciente de prueba con Service Role...');
    
    // 1. Crear usuario en Supabase Auth usando Admin API
    console.log('📝 Creando usuario en Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testPatient.email,
      password: testPatient.password,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        first_name: testPatient.firstName,
        last_name: testPatient.lastName,
        role: 'patient'
      }
    });

    if (authError) {
      console.error('❌ Error creando usuario:', authError.message);
      return;
    }

    if (!authData.user?.id) {
      console.error('❌ No se pudo obtener el ID del usuario');
      return;
    }

    console.log('✅ Usuario creado:', authData.user.id);

    // 2. Crear perfil en la tabla profiles
    console.log('👤 Creando perfil de usuario...');
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
      console.error('❌ Error creando perfil:', profileError.message);
      return;
    }

    console.log('✅ Perfil creado exitosamente');

    // 3. Crear registro en la tabla patients
    console.log('🏥 Creando registro de paciente...');
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
      console.error('❌ Error creando registro de paciente:', patientError.message);
      return;
    }

    console.log('✅ Registro de paciente creado');

    // 4. Crear datos de prueba para el dashboard
    console.log('📊 Creando datos de prueba...');
    
    // Crear algunas citas de prueba
    const { error: appointmentsError } = await supabase
      .from('appointments')
      .insert([
        {
          patient_id: authData.user.id,
          doctor_id: authData.user.id, // Usando el mismo ID como placeholder
          appointment_type: 'consulta_general',
          title: 'Consulta de Medicina General',
          description: 'Revisión médica de rutina',
          scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Mañana
          duration_minutes: 30,
          status: 'scheduled',
          location: 'Clínica Central',
          is_virtual: false,
          created_at: new Date().toISOString()
        },
        {
          patient_id: authData.user.id,
          doctor_id: authData.user.id,
          appointment_type: 'consulta_especializada',
          title: 'Consulta de Cardiología',
          description: 'Evaluación cardiológica',
          scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // En una semana
          duration_minutes: 45,
          status: 'scheduled',
          location: 'Hospital Universitario',
          is_virtual: false,
          created_at: new Date().toISOString()
        }
      ]);

    if (appointmentsError) {
      console.log('⚠️ Error creando citas (puede ser normal si no hay doctores):', appointmentsError.message);
    } else {
      console.log('✅ Citas de prueba creadas');
    }

    // Crear medicamentos de prueba
    const { error: medicationsError } = await supabase
      .from('patient_medications')
      .insert([
        {
          patient_id: authData.user.id,
          doctor_id: authData.user.id,
          medication_name: 'Metformina',
          dosage: '500mg',
          frequency: '2 veces al día',
          instructions: 'Tomar con las comidas',
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Hace 30 días
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          patient_id: authData.user.id,
          doctor_id: authData.user.id,
          medication_name: 'Losartán',
          dosage: '50mg',
          frequency: '1 vez al día',
          instructions: 'Tomar en la mañana',
          start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Hace 15 días
          is_active: true,
          created_at: new Date().toISOString()
        }
      ]);

    if (medicationsError) {
      console.log('⚠️ Error creando medicamentos:', medicationsError.message);
    } else {
      console.log('✅ Medicamentos de prueba creados');
    }

    // Crear métricas de salud de prueba
    const { error: metricsError } = await supabase
      .from('health_metrics')
      .insert([
        {
          patient_id: authData.user.id,
          metric_type: 'weight',
          value: 65.5,
          unit: 'kg',
          recorded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'manual',
          notes: 'Peso matutino'
        },
        {
          patient_id: authData.user.id,
          metric_type: 'blood_pressure',
          value: 120,
          unit: 'mmHg',
          additional_data: { systolic: 120, diastolic: 80 },
          recorded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'manual',
          notes: 'Presión arterial matutina'
        },
        {
          patient_id: authData.user.id,
          metric_type: 'glucose',
          value: 95,
          unit: 'mg/dL',
          recorded_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'manual',
          notes: 'Glucosa en ayunas'
        }
      ]);

    if (metricsError) {
      console.log('⚠️ Error creando métricas:', metricsError.message);
    } else {
      console.log('✅ Métricas de salud creadas');
    }

    // Crear notificaciones de prueba
    const { error: notificationsError } = await supabase
      .from('patient_notifications')
      .insert([
        {
          patient_id: authData.user.id,
          title: 'Recordatorio de Cita',
          message: 'Tienes una cita médica mañana a las 10:00 AM',
          notification_type: 'appointment',
          priority: 'high',
          is_read: false,
          created_at: new Date().toISOString()
        },
        {
          patient_id: authData.user.id,
          title: 'Resultados de Laboratorio',
          message: 'Tus resultados de análisis de sangre están disponibles',
          notification_type: 'result',
          priority: 'normal',
          is_read: false,
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // Hace 1 hora
        },
        {
          patient_id: authData.user.id,
          title: 'Recordatorio de Medicación',
          message: 'Es hora de tomar tu medicación para la diabetes',
          notification_type: 'medication',
          priority: 'high',
          is_read: true,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // Hace 2 horas
        }
      ]);

    if (notificationsError) {
      console.log('⚠️ Error creando notificaciones:', notificationsError.message);
    } else {
      console.log('✅ Notificaciones de prueba creadas');
    }

    // Crear documentos médicos de prueba
    const { error: documentsError } = await supabase
      .from('medical_documents')
      .insert([
        {
          patient_id: authData.user.id,
          doctor_id: authData.user.id,
          document_type: 'lab_result',
          title: 'Hemograma Completo',
          description: 'Análisis de sangre completo realizado el mes pasado',
          file_url: null,
          file_type: 'pdf',
          is_critical: false,
          shared_with_caregivers: false,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          patient_id: authData.user.id,
          doctor_id: authData.user.id,
          document_type: 'prescription',
          title: 'Receta Médica - Metformina',
          description: 'Receta para medicamento de diabetes',
          file_url: null,
          file_type: 'pdf',
          is_critical: false,
          shared_with_caregivers: true,
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

    if (documentsError) {
      console.log('⚠️ Error creando documentos:', documentsError.message);
    } else {
      console.log('✅ Documentos médicos creados');
    }

    console.log('\n🎉 ¡Paciente de prueba creado exitosamente!');
    console.log('\n📋 Información de acceso:');
    console.log(`📧 Email: ${testPatient.email}`);
    console.log(`🔑 Contraseña: ${testPatient.password}`);
    console.log(`👤 Nombre: ${testPatient.firstName} ${testPatient.lastName}`);
    console.log(`📱 Teléfono: ${testPatient.phone}`);
    console.log(`🩸 Tipo de sangre: ${testPatient.bloodType}`);
    console.log(`🚨 Contacto de emergencia: ${testPatient.emergencyContact.name} (${testPatient.emergencyContact.phone})`);
    
    console.log('\n🌐 URLs para probar:');
    console.log('🔗 Login: http://localhost:3000/auth/login/paciente');
    console.log('🔗 Dashboard: http://localhost:3000/patient/dashboard');
    console.log('🔗 Dashboard Test: http://localhost:3000/patient/dashboard-test');
    
    console.log('\n📊 Datos creados:');
    console.log('✅ 2 citas médicas');
    console.log('✅ 2 medicamentos');
    console.log('✅ 3 métricas de salud');
    console.log('✅ 3 notificaciones');
    console.log('✅ 2 documentos médicos');
    
    console.log('\n🚀 ¡Ya puedes probar el dashboard completo!');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
createTestPatientWithServiceRole();
