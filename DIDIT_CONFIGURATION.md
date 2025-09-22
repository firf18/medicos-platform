# Didit.me Configuration - Platform Médicos Elite
# 
# Variables de entorno necesarias para la integración con Didit.me
# Siguiendo las mejores prácticas de NextAuth.js y white-label

# ============================================================================
# DIDIT API CONFIGURATION
# ============================================================================

# API Key de Didit (obligatoria)
# Obtener desde: https://dashboard.didit.me/api-keys
DIDIT_API_KEY=your_didit_api_key_here

# Base URL de la API de Didit (opcional, por defecto usa la oficial)
DIDIT_BASE_URL=https://api.didit.me

# Workflow ID específico para médicos venezolanos (opcional)
# Crear workflow personalizado en: https://dashboard.didit.me/workflows
DIDIT_WORKFLOW_ID=medical_verification_venezuela

# ============================================================================
# CALLBACK CONFIGURATION
# ============================================================================

# URL base de la aplicación (obligatoria para callbacks)
NEXT_PUBLIC_SITE_URL=https://yourmedicalplatform.com

# URL de callback para Didit (se construye automáticamente)
# Formato: ${NEXT_PUBLIC_SITE_URL}/api/auth/didit/callback

# ============================================================================
# WHITE-LABEL CONFIGURATION
# ============================================================================

# Configuración de marca blanca para Didit
DIDIT_BRAND_NAME=Platform Médicos
DIDIT_BRAND_LOGO=https://yourmedicalplatform.com/logo.png
DIDIT_BRAND_COLOR=#2563eb
DIDIT_BRAND_PRIMARY_COLOR=#1d4ed8
DIDIT_BRAND_SECONDARY_COLOR=#3b82f6

# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================

# Nivel de seguridad para verificaciones médicas
DIDIT_SECURITY_LEVEL=high

# Tiempo de expiración de sesiones (en milisegundos)
DIDIT_SESSION_TIMEOUT=300000

# Número máximo de reintentos
DIDIT_MAX_RETRIES=3

# ============================================================================
# COMPLIANCE CONFIGURATION
# ============================================================================

# Configuración de compliance médico
DIDIT_COMPLIANCE_MODE=hipaa
DIDIT_AUDIT_LOGGING=true
DIDIT_DATA_RETENTION_DAYS=2555

# ============================================================================
# DEVELOPMENT CONFIGURATION
# ============================================================================

# Modo de desarrollo (usa sandbox de Didit)
NODE_ENV=development
DIDIT_SANDBOX_MODE=true

# Para producción, cambiar a:
# NODE_ENV=production
# DIDIT_SANDBOX_MODE=false

# ============================================================================
# MONITORING CONFIGURATION
# ============================================================================

# Configuración de monitoreo y alertas
DIDIT_MONITORING_ENABLED=true
DIDIT_ALERT_EMAIL=admin@yourmedicalplatform.com
DIDIT_WEBHOOK_URL=https://yourmedicalplatform.com/api/webhooks/didit

# ============================================================================
# EJEMPLO DE CONFIGURACIÓN COMPLETA
# ============================================================================

# Para desarrollo local:
# DIDIT_API_KEY=didit_test_1234567890abcdef
# DIDIT_BASE_URL=https://api-sandbox.didit.me
# DIDIT_WORKFLOW_ID=medical_verification_dev
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
# DIDIT_SANDBOX_MODE=true

# Para producción:
# DIDIT_API_KEY=didit_live_1234567890abcdef
# DIDIT_BASE_URL=https://api.didit.me
# DIDIT_WORKFLOW_ID=medical_verification_prod
# NEXT_PUBLIC_SITE_URL=https://yourmedicalplatform.com
# DIDIT_SANDBOX_MODE=false
# DIDIT_SECURITY_LEVEL=high
# DIDIT_COMPLIANCE_MODE=hipaa
