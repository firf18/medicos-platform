# Configuración de Autenticación con Códigos OTP

Este documento explica cómo configurar correctamente la autenticación para que envíe códigos de 6 dígitos en lugar de enlaces de verificación.

## Problema Identificado

Tu aplicación está configurada para recibir códigos OTP de 6 dígitos, pero Supabase está enviando enlaces de confirmación por defecto. Esto causa confusión en los usuarios.

## Solución Implementada

### 1. Componente de Verificación Mejorado

Se creó `EmailVerificationForm.tsx` que:
- Maneja códigos de 6 dígitos con inputs individuales
- Soporta pegar códigos completos
- Tiene timer de expiración (10 minutos)
- Cooldown para reenvío (1 minuto)
- Maneja tanto códigos OTP como enlaces de verificación

### 2. Página de Verificación Actualizada

La página `verify-email/page.tsx` ahora:
- Detecta automáticamente enlaces de verificación en la URL
- Usa el nuevo componente de verificación
- Maneja errores de manera más robusta
- Proporciona mejor UX con mensajes claros

### 3. Scripts de Configuración

#### `scripts/configure-auth-otp.js`
Proporciona plantillas de email y guía de configuración manual.

#### `scripts/test-auth-config.js`
Prueba la configuración de autenticación para verificar que funciona correctamente.

## Configuración Manual Requerida

### En Supabase Dashboard

1. **Ve a Authentication → Settings**

2. **En la sección "Email":**
   - ✅ Enable email confirmations
   - ✅ Enable email change confirmations  
   - ✅ Secure email change
   - ✅ Double confirm email changes

3. **En "URL Configuration":**
   - Site URL: `http://localhost:3000` (desarrollo) o tu dominio (producción)
   - Redirect URLs: `http://localhost:3000/auth/verify-email`

4. **En "Email Templates":**

   **Para Confirmación de Registro:**
   ```
   Asunto: Confirma tu cuenta - Código de verificación
   
   Cuerpo:
   <h2>Confirma tu cuenta</h2>
   <p>Hola,</p>
   <p>Gracias por registrarte. Para completar tu registro, ingresa el siguiente código de verificación:</p>
   <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
     <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">{{ .Token }}</h1>
   </div>
   <p><strong>Este código expira en 10 minutos.</strong></p>
   <p>Si no solicitaste esta verificación, puedes ignorar este correo.</p>
   <p>Saludos,<br>El equipo de Plataforma Médicos</p>
   ```

   **Para Recuperación de Contraseña:**
   ```
   Asunto: Recupera tu contraseña - Código de verificación
   
   Cuerpo:
   <h2>Recupera tu contraseña</h2>
   <p>Hola,</p>
   <p>Recibimos una solicitud para restablecer tu contraseña. Ingresa el siguiente código:</p>
   <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
     <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">{{ .Token }}</h1>
   </div>
   <p><strong>Este código expira en 10 minutos.</strong></p>
   <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
   <p>Saludos,<br>El equipo de Plataforma Médicos</p>
   ```

## Comandos para Ejecutar

```bash
# 1. Configurar autenticación (proporciona plantillas)
npm run config:auth

# 2. Aplicar migración de base de datos
# (Esto se hace automáticamente con Supabase)

# 3. Probar la configuración
npm run test:auth

# 4. Reiniciar la aplicación
npm run dev
```

## Características de la Solución

### ✅ Funcionalidades Implementadas

- **Códigos OTP de 6 dígitos**: Inputs individuales para mejor UX
- **Auto-focus**: Navegación automática entre campos
- **Pegar códigos**: Soporte para pegar códigos completos
- **Timer de expiración**: Muestra tiempo restante (10 minutos)
- **Cooldown de reenvío**: Previene spam (1 minuto)
- **Compatibilidad dual**: Maneja tanto códigos como enlaces
- **Detección automática**: Detecta enlaces en la URL
- **Manejo de errores**: Mensajes claros y acciones de recuperación
- **Validación robusta**: Solo acepta números de 6 dígitos
- **Limpieza automática**: Limpia campos en caso de error

### 🔒 Seguridad

- **Expiración de códigos**: 10 minutos máximo
- **Límite de intentos**: Rastreo de intentos fallidos
- **Validación del lado del servidor**: Verificación en Supabase
- **Limpieza automática**: Códigos antiguos se eliminan
- **Auditoría**: Registro de intentos de verificación

### 📱 UX/UI

- **Diseño intuitivo**: Campos grandes y claros
- **Feedback visual**: Estados de carga y error
- **Responsive**: Funciona en móviles y desktop
- **Accesibilidad**: Labels y navegación por teclado
- **Mensajes claros**: Instrucciones paso a paso

## Solución de Problemas

### Si sigues recibiendo enlaces en lugar de códigos:

1. **Verifica las plantillas de email** en Supabase Dashboard
2. **Asegúrate de usar `{{ .Token }}`** en las plantillas
3. **No incluyas enlaces** de confirmación automática
4. **Verifica la configuración** de URL en Supabase

### Si los códigos no llegan:

1. **Revisa la carpeta de spam**
2. **Verifica la configuración SMTP** en Supabase
3. **Usa el botón de reenvío** (respeta el cooldown)
4. **Contacta al soporte** si persiste el problema

### Si hay errores de verificación:

1. **Verifica que el código sea de 6 dígitos**
2. **Asegúrate de que no haya expirado** (10 minutos)
3. **Intenta solicitar un nuevo código**
4. **Revisa los logs** en Supabase Dashboard

## Monitoreo y Métricas

La solución incluye:
- **Tabla de intentos**: `email_verification_attempts`
- **Funciones de estadísticas**: `get_verification_stats()`
- **Limpieza automática**: Datos antiguos se eliminan
- **Logs de auditoría**: Registro en Supabase

## Próximos Pasos

1. **Configurar las plantillas** manualmente en Supabase Dashboard
2. **Probar el flujo completo** con usuarios reales
3. **Monitorear métricas** de verificación exitosa
4. **Ajustar tiempos** si es necesario (expiración, cooldown)
5. **Implementar notificaciones** para administradores

## Soporte

Si necesitas ayuda adicional:
1. Ejecuta `npm run test:auth` para diagnosticar problemas
2. Revisa los logs en Supabase Dashboard → Logs
3. Verifica la configuración en Authentication → Settings
4. Contacta al equipo de desarrollo con los detalles del error