import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando finalización de registro de médico...');
    
    const registrationData = await request.json();
    console.log('📊 Datos de registro recibidos:', {
      email: registrationData.email,
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      specialtyId: registrationData.specialtyId,
      phone: registrationData.phone,
      hasPassword: !!registrationData.password,
      passwordLength: registrationData.password?.length || 0
    });

    // Validación previa de datos críticos
    if (!registrationData.password || registrationData.password.length < 6) {
      console.log('❌ Contraseña inválida para crear usuario');
      return NextResponse.json({ error: 'Contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }
    
    if (!registrationData.firstName || !registrationData.lastName) {
      console.log('❌ Nombre y apellido requeridos para crear usuario');
      return NextResponse.json({ error: 'Nombre y apellido son requeridos' }, { status: 400 });
    }

    // Verificar conectividad con Supabase
    console.log('🔍 Verificando conectividad con Supabase...');
    const admin = createAdminClient();
    
    try {
      const { data: testData, error: testError } = await (admin as any)
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('❌ Error de conectividad con Supabase:', testError);
        return NextResponse.json({ 
          error: 'Error de conectividad con la base de datos',
          details: testError.message,
          errorCode: 'database_connection_error'
        }, { status: 500 });
      }
      console.log('✅ Conectividad con Supabase verificada');
    } catch (connectivityError) {
      console.error('❌ Error de conectividad con Supabase:', connectivityError);
      return NextResponse.json({ 
        error: 'Error de conectividad con la base de datos',
        details: connectivityError.message,
        errorCode: 'database_connection_error'
      }, { status: 500 });
    }

    // Buscar registro existente por email
    console.log('🔍 Buscando registro existente por email:', registrationData.email);
    const { data: reg, error: regErr } = await (admin as any)
      .from('doctor_registrations')
      .select('*')
      .eq('email', registrationData.email)
      .maybeSingle();

    if (regErr) {
      console.error('❌ Error buscando registro:', regErr);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }

    let registrationId = reg?.id;

    // Si no existe registro, crear uno nuevo
    if (!reg) {
      console.log('⚠️ Registro no encontrado, creando nuevo registro para email:', registrationData.email);
      
      const newRegistrationData = {
        email: registrationData.email,
        first_name: registrationData.firstName,
        last_name: registrationData.lastName,
        phone: registrationData.phone,
        specialty_id: registrationData.specialtyId,
        license_number: registrationData.licenseNumber || `PENDING_SACS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        license_state: registrationData.licenseState || 'PENDING',
        license_expiry: registrationData.licenseExpiry || '2025-12-31',
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📋 Datos para crear registro:', {
        email: newRegistrationData.email,
        licenseNumber: newRegistrationData.license_number,
        licenseState: newRegistrationData.license_state,
        licenseExpiry: newRegistrationData.license_expiry
      });

      const { data: newReg, error: newRegErr } = await (admin as any)
        .from('doctor_registrations')
        .insert(newRegistrationData)
        .select()
        .single();

      if (newRegErr) {
        console.error('❌ Error creando nuevo registro:', newRegErr);
        return NextResponse.json({ 
          error: `No se pudo crear el registro: ${newRegErr.message}`,
          details: newRegErr.message
        }, { status: 400 });
      }

      console.log('✅ Nuevo registro creado:', { id: newReg.id, email: newReg.email });
      registrationId = newReg.id;
    } else {
      console.log('✅ Registro existente encontrado:', { id: reg.id, email: reg.email });
    }

    // Verificar si el usuario ya existe en Supabase Auth
    console.log('🔍 Verificando si usuario ya existe en Auth...');
    const { data: authUsers, error: listError } = await (admin as any).auth.admin.listUsers();
    
    let existingUser = null;
    if (!listError && authUsers?.users) {
      existingUser = authUsers.users.find(user => user.email === registrationData.email);
      if (existingUser) {
        console.log('✅ Usuario existente encontrado en Auth:', existingUser.id);
      }
    }

    let authData = null;
    let authError = null;

    if (existingUser) {
      // Usar usuario existente
      console.log('✅ Usando usuario existente de Auth');
      authData = { user: existingUser };
    } else {
      // Crear nuevo usuario en Auth
      console.log('🔍 Creando nuevo usuario en Supabase Auth...');
      
      const userConfig = {
        email: registrationData.email,
        password: registrationData.password,
        email_confirm: true, // Confirmar automáticamente para permitir login
        user_metadata: {
          firstName: registrationData.firstName,
          lastName: registrationData.lastName,
          userType: 'doctor',
          registrationStep: 'auth_created',
          phone: registrationData.phone,
          specialtyId: registrationData.specialtyId,
          licenseNumber: registrationData.licenseNumber || 'PENDING_SACS',
          documentNumber: registrationData.documentNumber,
          documentType: registrationData.documentType || 'cedula'
        }
      };
      
      try {
        console.log('📋 Datos para crear usuario:', {
          email: userConfig.email,
          hasPassword: !!userConfig.password,
          passwordLength: userConfig.password?.length,
          firstName: userConfig.user_metadata.firstName,
          lastName: userConfig.user_metadata.lastName,
          emailConfirm: userConfig.email_confirm
        });
        
        // Usar el método de signUp público en lugar del admin
        const { data: signUpData, error: signUpError } = await admin.auth.signUp({
          email: registrationData.email,
          password: registrationData.password,
          options: {
            data: {
              firstName: registrationData.firstName,
              lastName: registrationData.lastName,
              userType: 'doctor',
              registrationStep: 'auth_created',
              phone: registrationData.phone,
              specialtyId: registrationData.specialtyId,
              licenseNumber: registrationData.licenseNumber || 'PENDING_SACS',
              documentNumber: registrationData.documentNumber,
              documentType: registrationData.documentType || 'cedula'
            }
          }
        });

        // Asignar los datos de signUp a authData para el resto del código
        if (signUpData?.user) {
          authData = signUpData;
        }
        if (signUpError) {
          authError = signUpError;
        }

        // Confirmar automáticamente el email ya que se verificó manualmente
        if (signUpData?.user && !signUpError) {
          console.log('📧 Confirmando email automáticamente (ya verificado manualmente)...');
          
          const { error: confirmError } = await admin.auth.admin.updateUserById(
            signUpData.user.id, 
            { email_confirm: true }
          );
          
          if (confirmError) {
            console.log('⚠️ Error confirmando email:', confirmError.message);
          } else {
            console.log('✅ Email confirmado automáticamente');
          }
        }
        
        if (authError) {
          console.error('❌ Error detallado creando usuario en Auth:', {
            message: authError.message,
            status: authError.status
          });
          
          // Si es el error específico de "Database error creating new user"
          if (authError.message === 'Database error creating new user') {
            console.log('⚠️ Error de configuración de Supabase Auth detectado');
            console.log('🔧 Implementando solución directa en base de datos...');
            
            // SOLUCIÓN DIRECTA: Crear usuario directamente en la base de datos
            const userId = crypto.randomUUID();
            // Usar bcrypt para encriptación correcta
            const hashedPassword = await bcrypt.hash(registrationData.password, 10);
            
            const directUserData = {
              id: userId,
              aud: 'authenticated',
              role: 'authenticated',
              email: registrationData.email,
              encrypted_password: hashedPassword,
              email_confirmed_at: null, // NO confirmar automáticamente para forzar login
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              raw_app_meta_data: {
                provider: 'email',
                providers: ['email']
              },
              raw_user_meta_data: {
                firstName: registrationData.firstName,
                lastName: registrationData.lastName,
                userType: 'doctor',
                registrationStep: 'auth_created_direct'
              },
              is_super_admin: null,
              last_sign_in_at: null,
              phone: null,
              phone_confirmed_at: null,
              phone_change: '',
              phone_change_token: '',
              phone_change_sent_at: null,
              email_change_token_current: '',
              email_change_confirm_status: 0,
              banned_until: null,
              reauthentication_token: '',
              reauthentication_sent_at: null,
              is_sso_user: false,
              deleted_at: null,
              is_anonymous: false
            };
            
            console.log('🔍 Creando usuario directamente en base de datos...');
            const { error: directInsertError } = await (admin as any)
              .rpc('create_user_directly', {
                user_id: userId,
                user_email: registrationData.email,
                user_password: hashedPassword,
                user_metadata: directUserData.raw_user_meta_data
              });
            
            if (directInsertError) {
              console.error('❌ Error creando usuario directamente:', directInsertError);
              throw new Error(`No se pudo crear usuario: ${directInsertError.message}`);
            } else {
              console.log('✅ Usuario creado directamente en base de datos:', userId);
              
              // Confirmar automáticamente el email para permitir login
              console.log('📧 Confirmando email automáticamente...');
              const { error: confirmError } = await (admin as any)
                .rpc('confirm_user_email', { user_email: registrationData.email });
              
              if (confirmError) {
                console.log('⚠️ Error confirmando email:', confirmError.message);
                // No es crítico, continuamos
              } else {
                console.log('✅ Email confirmado automáticamente');
              }
              
              authData = { user: { id: userId, email: registrationData.email } };
              authError = null;
            }
          } else {
            throw new Error(`No se pudo crear usuario: ${authError.message}`);
          }
        } else {
          console.log('✅ Usuario creado exitosamente en Auth:', authData.user?.id);
        }
        
      } catch (createError) {
        console.error('❌ Error en creación de usuario:', createError);
        authError = createError;
        throw createError;
      }
    }
    
    // Si no hay authData, significa que hubo un error y no se pudo crear el usuario
    if (!authData?.user) {
      console.error('❌ No se pudo crear usuario en Auth');
      return NextResponse.json({ 
        error: 'No se pudo crear usuario en el sistema de autenticación',
        details: 'Error interno del servidor de autenticación',
        errorCode: 'auth_creation_failed'
      }, { status: 500 });
    }
    
    console.log('✅ Usuario disponible en Auth:', authData.user.id);
    
    // Actualizar el registro con el user_id y todos los datos adicionales
    const updateData = {
      user_id: authData.user.id,
      bio: registrationData.bio || null,
      years_of_experience: registrationData.yearsOfExperience || 0,
      current_hospital: registrationData.currentHospital || null,
      clinic_affiliations: registrationData.clinicAffiliations || [],
      sub_specialties: registrationData.subSpecialties || [],
      selected_features: registrationData.selectedFeatures || [],
      working_hours: registrationData.workingHours || {},
      identity_verification: registrationData.identityVerification || {},
      verification_status: 'pending',
      is_verified: false,
      updated_at: new Date().toISOString()
    };
    
    const { error: updateErr } = await (admin as any)
      .from('doctor_registrations')
      .update(updateData)
      .eq('id', registrationId);
    
    if (updateErr) {
      console.error('❌ Error actualizando registro con user_id:', updateErr);
      return NextResponse.json({ error: 'Error actualizando registro' }, { status: 500 });
    }
    
    console.log('✅ Registro actualizado con user_id:', authData.user.id);
    
    // Crear perfil en la tabla profiles
    const profileData = {
      id: authData.user.id,
      email: registrationData.email,
      first_name: registrationData.firstName,
      last_name: registrationData.lastName,
      phone: registrationData.phone,
      role: 'doctor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: profileError } = await (admin as any)
      .from('profiles')
      .insert(profileData);

    if (profileError) {
      console.log('❌ Error creando perfil:', profileError.message);
      return NextResponse.json({ error: `No se pudo crear perfil: ${profileError.message}` }, { status: 400 });
    }
    
    console.log('✅ Perfil creado para user_id:', authData.user.id);

    // Crear perfil de doctor en la tabla doctors
    const licenseNumber = registrationData.licenseNumber || `PENDING_SACS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const doctorData = {
      id: authData.user.id,
      specialty_id: registrationData.specialtyId, // Mantener como varchar para compatibilidad
      license_number: licenseNumber,
      email: registrationData.email,
      first_name: registrationData.firstName,
      last_name: registrationData.lastName,
      full_name: `${registrationData.firstName} ${registrationData.lastName}`,
      bio: registrationData.bio || null,
      experience_years: registrationData.yearsOfExperience || 0,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: doctorError } = await (admin as any)
      .from('doctors')
      .insert(doctorData);

    if (doctorError) {
      console.log('❌ Error creando perfil de doctor:', doctorError.message);
      return NextResponse.json({ error: `No se pudo crear perfil de doctor: ${doctorError.message}` }, { status: 400 });
    }
    
    console.log('✅ Perfil de doctor creado para user_id:', authData.user.id);

    // Crear configuración del dashboard del doctor
    if (registrationData.selectedFeatures && registrationData.selectedFeatures.length > 0) {
      const dashboardConfigData = {
        doctor_id: authData.user.id,
        selected_features: registrationData.selectedFeatures,
        working_hours: registrationData.workingHours || {},
        theme_preferences: {},
        notification_settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: dashboardError } = await (admin as any)
        .from('doctor_dashboard_configs')
        .insert(dashboardConfigData);

      if (dashboardError) {
        console.log('⚠️ Error creando configuración del dashboard:', dashboardError.message);
        // No es crítico, continuamos
      } else {
        console.log('✅ Configuración del dashboard creada para user_id:', authData.user.id);
      }
    }

    // Enviar notificación (opcional)
    console.log('📧 Enviando notificación de registro completado...');
    // Aquí podrías agregar lógica para enviar emails o notificaciones

    console.log('✅ Registro completado exitosamente');
    
    return NextResponse.json({
      success: true,
      message: 'Registro completado exitosamente',
      data: {
        userId: authData.user.id,
        email: registrationData.email,
        registrationId: registrationId
      }
    });

  } catch (error) {
    console.error('❌ Error en finalización de registro:', error);
    
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido',
      errorCode: 'internal_server_error'
    }, { status: 500 });
  }
}