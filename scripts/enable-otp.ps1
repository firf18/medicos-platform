# Script PowerShell para habilitar OTP en Supabase
# Este script habilita la funcionalidad OTP para el envío de códigos de verificación

param(
    [string]$ProjectRef = "zonmvugejshdstymfdva",
    [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN
)

Write-Host "🔧 Habilitando OTP en Supabase..." -ForegroundColor Blue

# Verificar que tenemos las variables necesarias
if (-not $AccessToken) {
    Write-Host "❌ Error: SUPABASE_ACCESS_TOKEN no está configurado" -ForegroundColor Red
    Write-Host "   Obtén tu token en: https://supabase.com/dashboard/account/tokens" -ForegroundColor Yellow
    Write-Host "   Luego ejecuta: `$env:SUPABASE_ACCESS_TOKEN = 'tu-token-aqui'" -ForegroundColor Yellow
    exit 1
}

$API_URL = "https://api.supabase.com/v1/projects/$ProjectRef"

Write-Host "📋 Configurando proyecto: $ProjectRef" -ForegroundColor Green

# Función para hacer requests a la API de Supabase
function Invoke-SupabaseRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Data = $null
    )
    
    $headers = @{
        "Authorization" = "Bearer $AccessToken"
        "Content-Type" = "application/json"
    }
    
    try {
        if ($Data) {
            $response = Invoke-RestMethod -Uri "$API_URL$Endpoint" -Method $Method -Headers $headers -Body $Data
        } else {
            $response = Invoke-RestMethod -Uri "$API_URL$Endpoint" -Method $Method -Headers $headers
        }
        return $response
    }
    catch {
        Write-Host "❌ Error en request: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "🔍 Verificando configuración actual..." -ForegroundColor Blue

# Obtener configuración actual de Auth
try {
    $currentConfig = Invoke-SupabaseRequest -Method "GET" -Endpoint "/config/auth"
    Write-Host "📊 Configuración actual obtenida" -ForegroundColor Green
    
    # Mostrar configuración actual
    Write-Host ""
    Write-Host "📋 Configuración actual:" -ForegroundColor Blue
    Write-Host "   - Email externo habilitado: $($currentConfig.external_email_enabled)" -ForegroundColor Yellow
    Write-Host "   - Confirmación de email habilitada: $($currentConfig.mailer_autoconfirm)" -ForegroundColor Yellow
    Write-Host "   - Cambio de email seguro: $($currentConfig.mailer_secure_email_change_enabled)" -ForegroundColor Yellow
    Write-Host "   - SMTP Host: $($currentConfig.smtp_host)" -ForegroundColor Yellow
    Write-Host "   - SMTP Port: $($currentConfig.smtp_port)" -ForegroundColor Yellow
    Write-Host "   - SMTP User: $($currentConfig.smtp_user)" -ForegroundColor Yellow
    Write-Host "   - SMTP Sender Name: $($currentConfig.smtp_sender_name)" -ForegroundColor Yellow
}
catch {
    Write-Host "⚠️  No se pudo obtener la configuración actual" -ForegroundColor Yellow
    Write-Host "   Continuando con la configuración..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Configurando OTP..." -ForegroundColor Blue

# Configuración para habilitar OTP
$otpConfig = @{
    external_email_enabled = $true
    mailer_autoconfirm = $false
    mailer_secure_email_change_enabled = $true
    smtp_admin_email = "no-reply@red-salud.org"
    smtp_sender_name = "Platform Médicos"
} | ConvertTo-Json

try {
    $result = Invoke-SupabaseRequest -Method "PATCH" -Endpoint "/config/auth" -Data $otpConfig
    
    if ($result) {
        Write-Host "✅ OTP configurado exitosamente!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Configuración aplicada:" -ForegroundColor Blue
        Write-Host "   - Email externo: HABILITADO" -ForegroundColor Green
        Write-Host "   - Auto-confirmación: DESHABILITADA (requiere verificación)" -ForegroundColor Green
        Write-Host "   - Cambio de email seguro: HABILITADO" -ForegroundColor Green
        Write-Host "   - Email admin: no-reply@red-salud.org" -ForegroundColor Green
        Write-Host "   - Nombre del remitente: Platform Médicos" -ForegroundColor Green
    } else {
        Write-Host "❌ Error configurando OTP" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Error configurando OTP: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⚠️  IMPORTANTE: Configuración SMTP requerida" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para que los emails se envíen correctamente, necesitas configurar un servidor SMTP:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ve a: https://supabase.com/dashboard/project/$ProjectRef/settings/auth" -ForegroundColor Cyan
Write-Host "2. En la sección 'SMTP Settings':" -ForegroundColor Yellow
Write-Host "   - ✅ Habilita 'Enable custom SMTP'" -ForegroundColor Green
Write-Host "   - 📧 SMTP Host: smtp.gmail.com (o tu proveedor)" -ForegroundColor White
Write-Host "   - 🔌 SMTP Port: 587" -ForegroundColor White
Write-Host "   - 👤 SMTP User: tu-email@gmail.com" -ForegroundColor White
Write-Host "   - 🔑 SMTP Password: tu-contraseña-de-aplicación" -ForegroundColor White
Write-Host "   - 📝 SMTP Sender Name: Platform Médicos" -ForegroundColor White
Write-Host ""
Write-Host "3. Configura las plantillas de email:" -ForegroundColor Yellow
Write-Host "   - Ve a: https://supabase.com/dashboard/project/$ProjectRef/auth/templates" -ForegroundColor Cyan
Write-Host "   - Edita la plantilla 'Magic Link' para mostrar códigos OTP" -ForegroundColor White
Write-Host ""
Write-Host "4. Configura las URLs de redirección:" -ForegroundColor Yellow
Write-Host "   - Ve a: https://supabase.com/dashboard/project/$ProjectRef/auth/url-configuration" -ForegroundColor Cyan
Write-Host "   - Agrega: http://localhost:3000/auth/verify-email" -ForegroundColor White
Write-Host "   - Agrega: https://red-salud.org/auth/verify-email" -ForegroundColor White
Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Para probar el sistema:" -ForegroundColor Blue
Write-Host "1. Ejecuta el servidor de desarrollo" -ForegroundColor Yellow
Write-Host "2. Ve a la página de registro médico" -ForegroundColor Yellow
Write-Host "3. Ingresa un email válido" -ForegroundColor Yellow
Write-Host "4. Verifica que recibas el código OTP" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔗 Enlaces útiles:" -ForegroundColor Blue
Write-Host "   - Dashboard: https://supabase.com/dashboard/project/$ProjectRef" -ForegroundColor Cyan
Write-Host "   - Auth Settings: https://supabase.com/dashboard/project/$ProjectRef/settings/auth" -ForegroundColor Cyan
Write-Host "   - Email Templates: https://supabase.com/dashboard/project/$ProjectRef/auth/templates" -ForegroundColor Cyan
Write-Host "   - URL Configuration: https://supabase.com/dashboard/project/$ProjectRef/auth/url-configuration" -ForegroundColor Cyan
