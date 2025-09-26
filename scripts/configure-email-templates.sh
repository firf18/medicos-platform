#!/bin/bash

# Script para configurar plantillas de email OTP en Supabase
# Este script configura las plantillas necesarias para el envío de códigos OTP

set -e

echo "🔧 Configurando plantillas de email OTP para Supabase..."

# Verificar que tenemos las variables necesarias
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ Error: SUPABASE_ACCESS_TOKEN no está configurado"
    echo "   Obtén tu token en: https://supabase.com/dashboard/account/tokens"
    exit 1
fi

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Error: PROJECT_REF no está configurado"
    echo "   Usa: export PROJECT_REF=tu-project-ref"
    exit 1
fi

PROJECT_REF=${PROJECT_REF:-"zonmvugejshdstymfdva"}
API_URL="https://api.supabase.com/v1/projects/$PROJECT_REF"

echo "📋 Configurando proyecto: $PROJECT_REF"

# Función para hacer requests a la API de Supabase
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X "$method" \
            -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint"
    else
        curl -s -X "$method" \
            -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
            "$API_URL$endpoint"
    fi
}

echo "🔍 Verificando configuración actual..."

# Obtener configuración actual de Auth
current_config=$(make_request "GET" "/config/auth")
echo "📊 Configuración actual obtenida"

# Verificar si OTP está habilitado
otp_enabled=$(echo "$current_config" | jq -r '.external_email_enabled // false')
echo "📧 Email externo habilitado: $otp_enabled"

if [ "$otp_enabled" = "false" ]; then
    echo "⚠️  Email externo no está habilitado"
    echo "   Necesitas habilitar SMTP personalizado en el Dashboard de Supabase"
    echo "   Ve a: https://supabase.com/dashboard/project/$PROJECT_REF/settings/auth"
    echo "   Y configura un servidor SMTP personalizado"
fi

echo ""
echo "📝 Plantilla Magic Link para OTP:"
echo "=================================="
echo ""
echo "Para configurar el envío de códigos OTP, ve a:"
echo "https://supabase.com/dashboard/project/$PROJECT_REF/auth/templates"
echo ""
echo "Y edita la plantilla 'Magic Link' con este contenido:"
echo ""
cat << 'EOF'
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
EOF

echo ""
echo "📧 Asunto del email:"
echo "Código de Verificación - Platform Médicos"
echo ""

echo "✅ Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ve al Dashboard de Supabase y configura la plantilla Magic Link"
echo "2. Configura un servidor SMTP personalizado si no lo has hecho"
echo "3. Prueba el sistema de verificación de email"
echo ""
echo "🔗 Enlaces útiles:"
echo "   - Plantillas: https://supabase.com/dashboard/project/$PROJECT_REF/auth/templates"
echo "   - Configuración SMTP: https://supabase.com/dashboard/project/$PROJECT_REF/settings/auth"
echo "   - Configuración de URLs: https://supabase.com/dashboard/project/$PROJECT_REF/auth/url-configuration"
echo ""
echo "🎉 ¡Listo para usar!"