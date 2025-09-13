# 🏥 REGISTRO DE MÉDICOS - RED-SALUD.ORG

## 📋 Resumen del Sistema de Registro

El sistema de registro de médicos en Red-Salud está diseñado para cumplir con los más altos estándares de seguridad médica y compliance. Utiliza un flujo de 6 fases con verificación de identidad biométrica a través de Didit.me.

## 🔄 Flujo de Registro (6 Fases)

### 1. **Información Personal** (`personal_info`)
- Datos básicos del médico
- Validación de email único
- Contraseña segura con estándares médicos
- Verificación de teléfono

### 2. **Información Profesional** (`professional_info`)
- Cédula profesional mexicana
- Estado de expedición
- Fecha de expiración
- Años de experiencia
- Hospital/institución actual
- Afiliaciones clínicas
- Biografía profesional

### 3. **Selección de Especialidad** (`specialty_selection`)
- Especialidad médica principal
- Sub-especialidades (opcional)
- Características del dashboard
- Validación de coherencia especialidad-experiencia

### 4. **Verificación de Identidad** (`identity_verification`)
- Integración completa con Didit.me
- Verificación biométrica (selfie + documento)
- Validación de cédula profesional
- Screening AML (Anti-Lavado de Dinero)
- Detección de vida real (liveness)

### 5. **Configuración del Dashboard** (`dashboard_configuration`)
- Características específicas por especialidad
- Horarios de trabajo personalizables
- Configuraciones rápidas predefinidas
- Validación de horarios coherentes

### 6. **Revisión Final** (`final_review`)
- Resumen completo de datos
- Términos y condiciones médicos
- Política de privacidad HIPAA-style
- Confirmación de compliance

## 🔐 Seguridad y Compliance

### Validaciones Implementadas
- **Email único**: Verificación en tiempo real
- **Cédula única**: Validación contra base de datos
- **Contraseña segura**: Estándares médicos (8+ chars, mayúscula, minúscula, número, símbolo)
- **Datos sensibles**: Sanitización y validación de contenido
- **Audit trail**: Logging completo de todas las operaciones

### Integración con Didit.me
- **Verificación biométrica**: Selfie con detección de vida
- **Validación de documentos**: Cédula profesional mexicana
- **Face matching**: Comparación foto documento vs selfie
- **AML screening**: Verificación contra listas de lavado de dinero
- **Webhook seguro**: Notificaciones en tiempo real

## 🗄️ Base de Datos

### Tablas Principales
- `doctor_registrations`: Registro completo del médico
- `doctor_dashboard_configs`: Configuración personalizada
- `medical_specialties`: Catálogo de especialidades
- `profiles`: Perfiles de usuario (RLS habilitado)

### Políticas RLS (Row Level Security)
- Médicos solo pueden ver/editar su propio registro
- Administradores pueden ver todos los registros
- Especialidades médicas son de lectura pública
- Funciones de seguridad con `SECURITY DEFINER`

## 🚀 API Endpoints

### Registro de Médicos
- `POST /api/auth/register/doctor` - Registro completo
- `GET /api/auth/verify-email` - Verificación de email
- `POST /api/webhooks/didit` - Webhook de Didit.me

### Validaciones
- `GET /api/validation/email/:email` - Verificar email disponible
- `GET /api/validation/license/:license` - Verificar cédula disponible
- `GET /api/specialties` - Listar especialidades médicas

## 🎨 Componentes UI

### Componentes por Fase
- `PersonalInfoStep.tsx` - Información personal
- `ProfessionalInfoStep.tsx` - Datos profesionales
- `SpecialtySelectionStep.tsx` - Selección de especialidad
- `IdentityVerificationStep.tsx` - Verificación Didit.me
- `DashboardConfigurationStep.tsx` - Configuración dashboard
- `FinalReviewStep.tsx` - Revisión final

### Hooks Personalizados
- `useDoctorRegistration.ts` - Manejo completo del registro
- `useDiditVerification.ts` - Integración con Didit.me
- `useFormErrors.ts` - Manejo de errores de formulario

## 📱 Experiencia de Usuario

### Flujo Optimizado
1. **Progreso visual**: Barra de progreso con 6 pasos
2. **Validación en tiempo real**: Feedback inmediato
3. **Navegación flexible**: Ir hacia adelante/atrás
4. **Guardado automático**: Datos persisten entre sesiones
5. **Verificación biométrica**: Proceso guiado paso a paso

### Estados de Verificación
- `idle` - Sin iniciar
- `initiating` - Preparando verificación
- `pending` - Esperando documentos
- `processing` - Validando datos
- `completed` - Verificación exitosa
- `failed` - Verificación fallida

## 🔧 Configuración Técnica

### Variables de Entorno Requeridas
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://zonmvugejshdstymfdva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Dominio
NEXT_PUBLIC_SITE_URL=https://red-salud.org
NEXT_PUBLIC_DOMAIN=red-salud.org

# Didit.me
DIDIT_API_KEY=tu_didit_api_key
DIDIT_WEBHOOK_SECRET=tu_didit_webhook_secret
DIDIT_BASE_URL=https://api.didit.me

# Compliance Médico
HIPAA_COMPLIANCE_MODE=true
ENCRYPTION_KEY=tu_encryption_key
```

### Migraciones de Base de Datos
- `create_doctor_registration_tables` - Tablas principales
- `create_doctor_registration_rls_policies` - Políticas de seguridad

## 🧪 Testing

### Casos de Prueba Críticos
1. **Registro completo exitoso**
2. **Validación de email duplicado**
3. **Validación de cédula duplicada**
4. **Verificación Didit.me exitosa**
5. **Verificación Didit.me fallida**
6. **Navegación entre pasos**
7. **Persistencia de datos**

### Testing de Seguridad
- Validación de permisos RLS
- Sanitización de inputs
- Logging de eventos de seguridad
- Manejo de errores sin exposición de datos

## 📊 Monitoreo y Analytics

### Métricas Clave
- Tasa de completación del registro
- Tiempo promedio por fase
- Tasa de éxito de verificación Didit.me
- Errores más comunes por fase

### Logging de Seguridad
- Intentos de registro
- Verificaciones de identidad
- Errores de validación
- Eventos de compliance

## 🚨 Troubleshooting

### Problemas Comunes
1. **Verificación Didit.me falla**
   - Verificar configuración de API key
   - Revisar webhook URL
   - Validar formato de datos enviados

2. **Email ya registrado**
   - Verificar función `check_email_availability`
   - Revisar políticas RLS
   - Validar estado de la tabla profiles

3. **Cédula ya registrada**
   - Verificar función `check_license_availability`
   - Revisar unicidad en base de datos
   - Validar sanitización de datos

## 📈 Roadmap Futuro

### Mejoras Planificadas
- [ ] Integración con más proveedores de verificación
- [ ] Soporte para especialidades internacionales
- [ ] Dashboard de administración avanzado
- [ ] API de integración con sistemas hospitalarios
- [ ] Notificaciones push en tiempo real

### Optimizaciones
- [ ] Cache de especialidades médicas
- [ ] Compresión de imágenes de documentos
- [ ] CDN para assets estáticos
- [ ] Optimización de queries de base de datos

---

## 📞 Soporte

Para soporte técnico o preguntas sobre el sistema de registro:
- **Email**: soporte@red-salud.org
- **Documentación**: https://docs.red-salud.org
- **Status**: https://status.red-salud.org

---

**Última actualización**: Enero 2025  
**Versión**: 1.0.0  
**Compliance**: HIPAA-style, GDPR Ready
