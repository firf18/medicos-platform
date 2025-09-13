# 🔧 CONFIGURACIÓN MANUAL DE SUPABASE

Este documento contiene las configuraciones **críticas** que debes hacer manualmente en el Dashboard de Supabase para completar la optimización de seguridad.

## 🚨 **CONFIGURACIONES CRÍTICAS - HACER INMEDIATAMENTE**

### **1. Configuración de Autenticación (CRÍTICO)**

Ve a **Authentication > Settings** en tu dashboard de Supabase:

#### **Password Security (Obligatorio)**
- ✅ **Habilitar "Leaked Password Protection"**
  - Previene uso de contraseñas comprometidas
  - Valida contra base de datos HaveIBeenPwned
  
- ✅ **Configurar "Password Strength" a "Strong"**
  - Mínimo 8 caracteres
  - Requiere mayúsculas, minúsculas y números
  
#### **Multi-Factor Authentication (Recomendado)**
- ✅ **Habilitar MFA para administradores**
  - Protección adicional para cuentas críticas
  - Configurar TOTP (Time-based One-Time Password)

#### **URL Configuration (Verificar)**
```
Site URL: 
- Desarrollo: http://localhost:3000
- Producción: https://tu-dominio.com

Redirect URLs:
- http://localhost:3000/auth/verify-email
- https://tu-dominio.com/auth/verify-email
- http://localhost:3000/auth/callback
- https://tu-dominio.com/auth/callback
```

### **2. Configuración de Base de Datos (IMPORTANTE)**

Ve a **Database > Settings**:

#### **PostgreSQL Version (Crítico)**
- ✅ **Programar actualización a la versión más reciente**
  - Versión actual detectada: 17.4.1.075
  - Versión recomendada: Última disponible
  - Incluye parches de seguridad críticos

#### **Connection Pooling (Performance)**
- ✅ **Configurar Connection Pooling**
  - Modo: Transaction
  - Pool Size: 15-25 (según tu plan)
  - Max Client Connections: Ajustar según uso

### **3. Plantillas de Email (FUNCIONAL)**

Ve a **Authentication > Email Templates**:

#### **Confirm signup (Obligatorio)**
```html
<h2>Confirma tu cuenta - Plataforma Médicos</h2>
<p>Hola,</p>
<p>Gracias por registrarte en nuestra plataforma médica. Para completar tu registro, ingresa el siguiente código de verificación:</p>
<div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
  <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">{{ .Token }}</h1>
</div>
<p><strong>Este código expira en 10 minutos.</strong></p>
<p>Si no solicitaste esta verificación, puedes ignorar este correo.</p>
<p>Saludos,<br>El equipo de Plataforma Médicos</p>
```

#### **Reset password (Obligatorio)**
```html
<h2>Recupera tu contraseña - Plataforma Médicos</h2>
<p>Hola,</p>
<p>Recibimos una solicitud para restablecer tu contraseña. Ingresa el siguiente código:</p>
<div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
  <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">{{ .Token }}</h1>
</div>
<p><strong>Este código expira en 10 minutos.</strong></p>
<p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
<p>Saludos,<br>El equipo de Plataforma Médicos</p>
```

## 📊 **CONFIGURACIONES OPCIONALES (PRODUCCIÓN)**

### **4. Configuración de Storage (Si usas archivos)**

Ve a **Storage > Settings**:

- ✅ **Configurar políticas de archivos médicos**
- ✅ **Límites de tamaño de archivo**
- ✅ **Tipos de archivo permitidos**

### **5. Configuración de Edge Functions (Si las usas)**

Ve a **Edge Functions > Settings**:

- ✅ **Configurar variables de entorno**
- ✅ **Límites de memoria y timeout**

### **6. Monitoreo y Logs (Recomendado)**

Ve a **Logs & Monitoring**:

- ✅ **Habilitar alertas de errores críticos**
- ✅ **Configurar retención de logs**
- ✅ **Monitoreo de performance**

## 🧪 **VERIFICACIÓN POST-CONFIGURACIÓN**

Después de completar las configuraciones, ejecuta:

```bash
# Verificar configuración
npm run verify:setup

# Probar la aplicación
npm run dev
```

### **Flujo de Pruebas Recomendado**

1. **Registro de Usuario**:
   - Ve a `http://localhost:3000/auth/register`
   - Registra un médico y un paciente
   - Verifica que lleguen los códigos OTP

2. **Login y Redirección**:
   - Prueba login con ambos tipos de usuario
   - Verifica redirección correcta a dashboards

3. **Protección de Rutas**:
   - Intenta acceder a rutas protegidas sin login
   - Verifica que se bloquee el acceso

4. **Funcionalidades del Dashboard**:
   - Prueba creación de pacientes (médicos)
   - Prueba visualización de datos (pacientes)

## 🚨 **PROBLEMAS COMUNES Y SOLUCIONES**

### **Error: "Leaked Password Protection failed"**
```
Solución: Verificar que la configuración esté habilitada
Verificar conectividad a HaveIBeenPwned API
```

### **Error: "Email templates not working"**
```
Solución: Verificar que se usa {{ .Token }} (no {{ .token }})
Verificar configuración SMTP si es personalizada
```

### **Error: "Connection pool exhausted"**
```
Solución: Aumentar pool size en Database Settings
Optimizar queries para reducir conexiones concurrentes
```

## ✅ **CHECKLIST DE CONFIGURACIÓN**

- [ ] ✅ Leaked Password Protection habilitado
- [ ] ✅ Password Strength configurado a "Strong"
- [ ] ✅ MFA habilitado para admins
- [ ] ✅ URLs de redirect configuradas
- [ ] ✅ PostgreSQL actualizado
- [ ] ✅ Plantillas de email configuradas
- [ ] ✅ Connection pooling optimizado
- [ ] ✅ Tests de registro funcionando
- [ ] ✅ Tests de login funcionando
- [ ] ✅ Protección de rutas verificada

## 🎯 **SIGUIENTE PASO**

Una vez completadas estas configuraciones, estarás listo para:

1. **Desplegar a producción**
2. **Implementar dashboards especializados**
3. **Agregar funcionalidades avanzadas**

---

💡 **Tip**: Guarda este archivo y marca cada elemento cuando lo completes. Estas configuraciones son **críticas** para la seguridad en producción.
