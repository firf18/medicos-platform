# Didit Webhook Configuration - Platform Médicos Elite
# 
# Variables de entorno necesarias para la integración con webhooks de Didit
# siguiendo las mejores prácticas de seguridad médica

# =============================================================================
# DIDIT API CONFIGURATION
# =============================================================================

# API Key de Didit (obtenida del Business Console)
DIDIT_API_KEY=your_didit_api_key_here

# Base URL de la API de Didit
DIDIT_BASE_URL=https://api.didit.me

# Workflow ID para verificación médica
DIDIT_WORKFLOW_ID=medical_verification_workflow

# =============================================================================
# WEBHOOK CONFIGURATION
# =============================================================================

# Secret key para verificar webhooks de Didit (obtenida del Business Console)
DIDIT_WEBHOOK_SECRET_KEY=your_webhook_secret_key_here

# URL del webhook (debe ser accesible públicamente)
DIDIT_WEBHOOK_URL=https://yourdomain.com/api/didit/webhook

# =============================================================================
# CALLBACK CONFIGURATION
# =============================================================================

# URL de callback después de la verificación
DIDIT_CALLBACK_URL=https://yourdomain.com/api/auth/didit/callback

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================

# Tiempo de expiración de sesiones (en milisegundos)
DIDIT_SESSION_EXPIRATION_TIME=300000

# Número máximo de reintentos permitidos
DIDIT_MAX_RETRIES=3

# Nivel de seguridad requerido
DIDIT_SECURITY_LEVEL=high

# =============================================================================
# CLOUDFLARE CONFIGURATION (si usas Cloudflare)
# =============================================================================

# IP de Didit para whitelist en Cloudflare
DIDIT_IP_WHITELIST=18.203.201.92

# =============================================================================
# DEVELOPMENT CONFIGURATION
# =============================================================================

# Para desarrollo local, usar ngrok o similar
# DIDIT_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/didit/webhook
# DIDIT_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/auth/didit/callback

# =============================================================================
# PRODUCTION CONFIGURATION
# =============================================================================

# Para producción, usar tu dominio real
# DIDIT_WEBHOOK_URL=https://red-salud.org/api/didit/webhook
# DIDIT_CALLBACK_URL=https://red-salud.org/api/auth/didit/callback

# =============================================================================
# MONITORING AND LOGGING
# =============================================================================

# Habilitar logging detallado de webhooks
DIDIT_WEBHOOK_DEBUG=true

# URL del servicio de logging (opcional)
LOGGING_SERVICE_URL=https://your-logging-service.com/api/logs

# API Key para el servicio de logging
LOGGING_API_KEY=your_logging_api_key_here

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================

# Configuración de Supabase (ya existente)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# =============================================================================
# NOTIFICATIONS
# =============================================================================

# Email para notificaciones de webhook (opcional)
WEBHOOK_NOTIFICATION_EMAIL=admin@red-salud.org

# Slack webhook para notificaciones (opcional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/slack/webhook

# =============================================================================
# RATE LIMITING
# =============================================================================

# Límite de requests por minuto para webhooks
WEBHOOK_RATE_LIMIT=100

# Tiempo de ventana para rate limiting (en minutos)
WEBHOOK_RATE_WINDOW=1
