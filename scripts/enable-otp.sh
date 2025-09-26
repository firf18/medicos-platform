#!/bin/bash

# Script para habilitar OTP en Supabase Auth
# Este script configura OTP y las plantillas de email

# Configuración
PROJECT_REF="zonmvugejshdstymfdva"  # Tu project ID
SUPABASE_ACCESS_TOKEN=""  # Necesitas obtener este token del dashboard

# Verificar que el token esté configurado
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ Error: Necesitas configurar SUPABASE_ACCESS_TOKEN"
    echo "Obtén tu token en: https://supabase.com/dashboard/account/tokens"
    exit 1
fi

echo "🔧 Habilitando OTP en Supabase Auth..."

# Habilitar OTP en la configuración de Auth
curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enable_signup": true,
    "enable_otp": true,
    "enable_email_signup": true,
    "enable_email_otp": true,
    "enable_phone_signup": false,
    "enable_phone_otp": false
  }'

echo ""
echo "📧 Configurando plantillas de email para OTP..."

# Configurar plantilla Magic Link para usar OTP
curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mailer_subjects_magic_link": "Código de Verificación - Platform Médicos",
    "mailer_templates_magic_link_content": "<h1>🔐 Código de Verificación</h1><p>Tu código de verificación es:</p><div style=\"font-size: 32px; font-weight: bold; color: #2563eb; margin: 20px 0;\">{{ .Token }}</div><p>Este código expira en 10 minutos.</p><p>Si no solicitaste este código, puedes ignorar este email.</p><hr><p><small>Platform Médicos - Sistema de Registro de Médicos</small></p>"
  }'

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📋 Resumen de cambios:"
echo "✅ OTP habilitado para email"
echo "✅ Registros habilitados"
echo "✅ Plantilla de email configurada para códigos OTP"
echo ""
echo "🔧 Próximos pasos:"
echo "1. Verificar en el Dashboard que OTP esté habilitado"
echo "2. Probar el sistema de verificación"
echo "3. Configurar SMTP personalizado (opcional)"
