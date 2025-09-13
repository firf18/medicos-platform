# Instrucciones de Configuración de Supabase - Red-Salud

## 📋 Configuración Inicial

### 1. Variables de Entorno

Asegúrate de tener las siguientes variables en tu archivo `.env.local`:

```bash
# SUPABASE CONFIGURATION (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# MEDICAL COMPLIANCE
MEDICAL_AUDIT_ENDPOINT=https://audit.yourcompany.com
HIPAA_COMPLIANCE_MODE=true
ENCRYPTION_KEY=tu_encryption_key_aqui

# ENVIRONMENT
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Ejecutar Migraciones

Para configurar las tablas necesarias en Supabase:

```bash
# Si tienes Supabase CLI instalado
supabase db push

# O ejecuta manualmente la migración en el dashboard de Supabase
```

### 3. Estructura de Tablas Creadas

El script de migración creará las siguientes tablas:

#### `medical_specialties`
- Catálogo de especialidades médicas
- Incluye configuración de dashboard y validaciones requeridas

#### `doctor_profiles`
- Perfiles específicos de médicos
- Información profesional y de verificación
- Vinculado a `auth.users`

#### `doctor_dashboard_configs`
- Configuraciones personalizadas del dashboard
- Horarios de trabajo y preferencias

#### `identity_verifications`
- Registro de verificaciones de identidad
- Integración con servicios como Didit

### 4. Políticas de Seguridad (RLS)

El sistema implementa Row Level Security con las siguientes políticas:

- **Médicos**: Solo pueden acceder a su propia información
- **Pacientes**: Solo pueden ver médicos verificados
- **Administradores**: Acceso completo para gestión

### 5. Datos de Ejemplo

La migración incluye especialidades básicas:
- Medicina General
- Cardiología
- Dermatología
- Pediatría
- Ginecología

## 🔧 Funcionalidades Implementadas

### Registro de Médicos
- ✅ Validación en tiempo real
- ✅ Verificación de email único
- ✅ Verificación de cédula profesional única
- ✅ Creación automática de perfil
- ✅ Configuración de dashboard personalizado
- ✅ Auditoría de seguridad

### Seguridad
- ✅ Row Level Security (RLS)
- ✅ Validación de datos médicos
- ✅ Logging de eventos de seguridad
- ✅ Compliance HIPAA-style

### Integración
- ✅ Next.js 15 App Router
- ✅ TypeScript estricto
- ✅ React Hook Form con validaciones
- ✅ Shadcn/ui components
- ✅ Tailwind CSS

## 🚀 Cómo Probar el Registro

1. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Navegar al registro de médicos:**
   ```
   http://localhost:3000/auth/register/doctor
   ```

3. **Completar el formulario paso a paso:**
   - Información Personal
   - Información Profesional  
   - Selección de Especialidad
   - Verificación de Identidad (opcional por ahora)
   - Configuración del Dashboard
   - Revisión Final

4. **Verificar en Supabase:**
   - Revisa que se creó el usuario en `auth.users`
   - Verifica el perfil en `profiles`
   - Confirma el perfil médico en `doctor_profiles`
   - Revisa la configuración en `doctor_dashboard_configs`

## 🐛 Solución de Problemas

### Error: "Missing environment variables"
- Verifica que todas las variables de entorno estén configuradas
- Reinicia el servidor después de agregar variables

### Error: "Table does not exist"
- Ejecuta las migraciones de base de datos
- Verifica que tienes permisos en Supabase

### Error: "Email already registered"
- El sistema previene registros duplicados
- Usa un email diferente o elimina el registro existente

### Error: "License number already exists"
- Cada cédula profesional debe ser única
- Verifica que no esté ya registrada

## 📝 Notas Importantes

1. **Desarrollo vs Producción:**
   - En desarrollo, algunos controles están relajados
   - En producción, todas las validaciones son estrictas

2. **Verificación de Identidad:**
   - Por ahora es opcional para desarrollo
   - En producción será obligatorio

3. **Logging y Auditoría:**
   - Todos los eventos se registran para compliance
   - En producción se envían a servicio de auditoría

4. **Performance:**
   - Las consultas están optimizadas con índices
   - RLS está configurado para máximo rendimiento

## 🔄 Próximos Pasos

1. Implementar verificación de identidad con Didit
2. Agregar más especialidades médicas
3. Implementar notificaciones en tiempo real
4. Configurar backup automático
5. Implementar métricas de performance
