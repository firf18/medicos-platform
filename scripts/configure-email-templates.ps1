# Script PowerShell para configurar plantillas de email OTP en Supabase
# Este script configura las plantillas necesarias para el envío de códigos OTP

param(
    [string]$ProjectRef = "zonmvugejshdstymfdva",
    [string]$AccessToken = $env:SUPABASE_ACCESS_TOKEN
)

Write-Host "🔧 Configurando plantillas de email OTP para Supabase..." -ForegroundColor Blue

# Verificar que tenemos las variables necesarias
if (-not $AccessToken) {
    Write-Host "❌ Error: SUPABASE_ACCESS_TOKEN no está configurado" -ForegroundColor Red
    Write-Host "   Obtén tu token en: https://supabase.com/dashboard/account/tokens" -ForegroundColor Yellow
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
    
    # Verificar si OTP está habilitado
    $otpEnabled = $currentConfig.external_email_enabled
    Write-Host "📧 Email externo habilitado: $otpEnabled" -ForegroundColor Yellow
    
    if (-not $otpEnabled) {
        Write-Host "⚠️  Email externo no está habilitado" -ForegroundColor Yellow
        Write-Host "   Necesitas habilitar SMTP personalizado en el Dashboard de Supabase" -ForegroundColor Yellow
        Write-Host "   Ve a: https://supabase.com/dashboard/project/$ProjectRef/settings/auth" -ForegroundColor Cyan
        Write-Host "   Y configura un servidor SMTP personalizado" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "⚠️  No se pudo obtener la configuración actual" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Plantilla Magic Link para OTP:" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Para configurar el envío de códigos OTP, ve a:" -ForegroundColor Yellow
Write-Host "https://supabase.com/dashboard/project/$ProjectRef/auth/templates" -ForegroundColor Cyan
Write-Host ""
Write-Host "Y edita la plantilla 'Magic Link' con este contenido:" -ForegroundColor Yellow
Write-Host ""

$template = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Código de Verificación - Platform Médicos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .code-container {
            background-color: #f8f9fa;
            border: 2px solid #2563eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            letter-spacing: 5px;
            margin: 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #9ca3af;
        }
        .warning {
            background-color: #fef3cd;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐 Platform Médicos</div>
            <h1 style="color: #2563eb; margin-bottom: 20px;">Código de Verificación</h1>
        </div>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Tu código de verificación para completar el registro médico es:
        </p>
        
        <div class="code-container">
            <p class="code">{{ .Token }}</p>
        </div>
        
        <div class="warning">
            <p style="margin: 0; font-weight: bold;">⚠️ Importante:</p>
            <p style="margin: 5px 0 0 0;">
                Este código expira en 10 minutos. Si no solicitaste este código, puedes ignorar este email.
            </p>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            Si tienes problemas con el código, contacta a nuestro equipo de soporte.
        </p>
    </div>
    
    <div class="footer">
        <p>© 2024 Platform Médicos. Todos los derechos reservados.</p>
        <p>Sistema de Registro de Médicos - Verificación de Identidad</p>
    </div>
</body>
</html>
"@

Write-Host $template -ForegroundColor White

Write-Host ""
Write-Host "📧 Asunto del email:" -ForegroundColor Blue
Write-Host "Código de Verificación - Platform Médicos" -ForegroundColor White
Write-Host ""

Write-Host "✅ Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Blue
Write-Host "1. Ve al Dashboard de Supabase y configura la plantilla Magic Link" -ForegroundColor Yellow
Write-Host "2. Configura un servidor SMTP personalizado si no lo has hecho" -ForegroundColor Yellow
Write-Host "3. Prueba el sistema de verificación de email" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔗 Enlaces útiles:" -ForegroundColor Blue
Write-Host "   - Plantillas: https://supabase.com/dashboard/project/$ProjectRef/auth/templates" -ForegroundColor Cyan
Write-Host "   - Configuración SMTP: https://supabase.com/dashboard/project/$ProjectRef/settings/auth" -ForegroundColor Cyan
Write-Host "   - Configuración de URLs: https://supabase.com/dashboard/project/$ProjectRef/auth/url-configuration" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 ¡Listo para usar!" -ForegroundColor Green
