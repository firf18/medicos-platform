# Configuración de Plantillas de Email - Supabase

## Problema Identificado

El sistema actual de envío de correos no estaba funcionando porque:
1. **No usaba Supabase Auth nativo** - Estaba creando usuarios temporales
2. **No tenía configuración SMTP** - Dependía del servicio por defecto de Supabase
3. **Flujo complejo** - Sistema personalizado propenso a errores

## Solución Implementada

### 1. ✅ API Simplificada
- **`/api/auth/send-verification-code`** - Usa `supabase.auth.signInWithOtp()`
- **`/api/auth/verify-email-code`** - Usa `supabase.auth.verifyOtp()`
- **`/auth/verify-email`** - Maneja confirmaciones PKCE

### 2. ✅ Plantillas de Email Configuradas
Las plantillas ahora envían **códigos OTP de 6 dígitos** en lugar de Magic Links:

```html
<!-- Magic Link Template (ahora OTP) -->
<h1>🔐 Código de Verificación</h1>
<p>Tu código de verificación es:</p>
<div style="font-size: 32px; font-weight: bold;">{{ .Token }}</div>
```

### 3. ✅ Páginas de Confirmación
- **`/auth/email-verified`** - Página de éxito
- **`/auth/email-error`** - Página de error

## Configuración Requerida

### Paso 1: Configurar Plantillas en Supabase Dashboard

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/zonmvugejshdstymfdva/auth/templates)
2. Edita la plantilla **"Magic Link"** con este contenido:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Código de Verificación</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: #2563eb; margin-bottom: 20px;">🔐 Código de Verificación</h1>
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Tu código de verificación para Platform Médicos es:
        </p>
        <div style="background-color: #ffffff; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; margin: 20px 0; font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px;">
            {{ .Token }}
        </div>
        <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            Este código expira en 10 minutos.
        </p>
        <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
            Si no solicitaste este código, puedes ignorar este email.
        </p>
    </div>
    <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af;">
        <p>© 2024 Platform Médicos. Todos los derechos reservados.</p>
    </div>
</body>
</html>
```

3. Cambia el **Asunto** a: `"Código de Verificación - Platform Médicos"`

### Paso 2: Configurar SMTP (Recomendado para Producción)

1. Ve a [Auth Settings](https://supabase.com/dashboard/project/zonmvugejshdstymfdva/settings/auth)
2. En la sección **"SMTP Settings"**:
   - ✅ **Enable custom SMTP**
   - **SMTP Host**: `smtp.gmail.com` (o tu proveedor)
   - **SMTP Port**: `587`
   - **SMTP User**: `tu-email@gmail.com`
   - **SMTP Password**: `tu-contraseña-de-aplicación`
   - **SMTP Sender Name**: `Platform Médicos`

### Paso 3: Configurar URLs de Redirección

1. Ve a [URL Configuration](https://supabase.com/dashboard/project/zonmvugejshdstymfdva/auth/url-configuration)
2. Agrega estas URLs a **"Redirect URLs"**:
   - `http://localhost:3000/auth/verify-email`
   - `https://tu-dominio.com/auth/verify-email`

## Cómo Funciona Ahora

### Flujo de Verificación de Email

1. **Usuario ingresa email** → Se llama a `/api/auth/send-verification-code`
2. **Supabase envía OTP** → Email con código de 6 dígitos
3. **Usuario ingresa código** → Se llama a `/api/auth/verify-email-code`
4. **Verificación exitosa** → Usuario puede continuar

### Flujo PKCE (Para Magic Links)

1. **Usuario hace clic en enlace** → Va a `/auth/verify-email?token_hash=...`
2. **Servidor verifica token** → Usa `supabase.auth.verifyOtp()`
3. **Redirección** → Va a `/auth/email-verified` o `/auth/email-error`

## Pruebas

### Desarrollo Local
```bash
# Los correos se capturan en Mailpit
supabase status
# Ve a la URL de Mailpit para ver los correos
```

### Producción
- Configura SMTP personalizado
- Prueba con emails reales
- Monitorea logs de Supabase

## Beneficios de la Nueva Implementación

✅ **Más confiable** - Usa Supabase Auth nativo
✅ **Más simple** - Menos código personalizado
✅ **Mejor UX** - Códigos OTP claros y profesionales
✅ **Más seguro** - No crea usuarios temporales
✅ **Mejor mantenimiento** - Menos puntos de falla

## Troubleshooting

### Los correos no llegan
1. Verifica configuración SMTP
2. Revisa logs de Supabase
3. Verifica que el email no esté en spam

### Códigos no funcionan
1. Verifica que el código no haya expirado (10 min)
2. Revisa que el email sea el mismo
3. Verifica logs de la API

### Errores de verificación
1. Revisa configuración de URLs de redirección
2. Verifica que las páginas de éxito/error existan
3. Revisa logs del servidor
