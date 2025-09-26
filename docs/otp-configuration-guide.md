# Solución: Error "Signups not allowed for otp"

## 🔍 Problema Identificado

El error **"Signups not allowed for otp"** y **"otp_disabled"** indica que:

1. **OTP está deshabilitado** en la configuración de Supabase Auth
2. **Los registros no están permitidos** para OTP
3. **Las plantillas de email** no están configuradas para enviar códigos OTP

## ✅ Solución: Habilitar OTP en Supabase Dashboard

### Paso 1: Acceder a la Configuración de Auth

1. Ve a tu [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto **"Platform-Medicos"**
3. Ve a **Authentication > Settings**

### Paso 2: Habilitar OTP

En la sección **"Auth Providers"**:

1. **Habilita "Email"** si no está habilitado
2. **Habilita "Enable email signups"**
3. **Habilita "Enable email OTP"**

### Paso 3: Configurar Plantillas de Email

Ve a **Authentication > Email Templates**:

1. **Selecciona "Magic Link"** template
2. **Modifica el contenido** para enviar códigos OTP:

```html
<h1>🔐 Código de Verificación</h1>
<p>Tu código de verificación es:</p>
<div style="font-size: 32px; font-weight: bold; color: #2563eb; margin: 20px 0;">
  {{ .Token }}
</div>
<p>Este código expira en 10 minutos.</p>
<p>Si no solicitaste este código, puedes ignorar este email.</p>
<hr>
<p><small>Platform Médicos - Sistema de Registro de Médicos</small></p>
```

3. **Guarda los cambios**

### Paso 4: Configurar URL de Redirección

En **Authentication > URL Configuration**:

1. **Site URL**: `http://localhost:3000` (para desarrollo)
2. **Redirect URLs**: Agrega `http://localhost:3000/auth/verify-email`

## 🚀 Verificación

Una vez configurado:

1. **Reinicia tu servidor** de desarrollo
2. **Prueba el sistema** de verificación de email
3. **Verifica que los códigos OTP** se envíen correctamente

## 🔧 Configuración Alternativa con Script

Si prefieres usar el script automático:

1. **Obtén tu Access Token** en [Account Tokens](https://supabase.com/dashboard/account/tokens)
2. **Ejecuta el script**:
   ```bash
   SUPABASE_ACCESS_TOKEN="tu_token_aqui" ./scripts/enable-otp.sh
   ```

## 📋 Checklist de Configuración

- [ ] OTP habilitado en Auth Settings
- [ ] Email signups habilitado
- [ ] Plantilla Magic Link configurada para OTP
- [ ] URL de redirección configurada
- [ ] Variables de entorno configuradas (.env.local)
- [ ] Servidor reiniciado
- [ ] Sistema probado

## 🐛 Troubleshooting

Si sigues viendo errores:

1. **Verifica los logs** de Supabase Auth
2. **Revisa la configuración** en el Dashboard
3. **Confirma que las variables de entorno** estén configuradas
4. **Verifica que el servidor** esté usando las nuevas configuraciones
