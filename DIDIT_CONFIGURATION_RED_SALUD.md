# Didit.me Configuration - Platform Médicos Elite
# 
# Variables de entorno configuradas con tus credenciales reales

# ============================================================================
# DIDIT API CONFIGURATION - CONFIGURADO CON TUS CREDENCIALES
# ============================================================================

# API Key de Didit (CONFIGURADA)
DIDIT_API_KEY=iXRQ76_FbQRt_N5tGK3UqkkAt3P5bQ5M6dTSSAsg8Vk

# Clave secreta del Webhook (CONFIGURADA)
DIDIT_WEBHOOK_SECRET=NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck

# Base URL de la API de Didit
DIDIT_BASE_URL=https://api.didit.me

# Workflow ID específico para médicos venezolanos
DIDIT_WORKFLOW_ID=medical_verification_venezuela

# ============================================================================
# CALLBACK CONFIGURATION - URL CORREGIDA
# ============================================================================

# URL base de la aplicación (CORREGIDA)
NEXT_PUBLIC_SITE_URL=https://red-salud.org

# URL de callback para Didit (CORREGIDA)
# Formato: ${NEXT_PUBLIC_SITE_URL}/api/auth/didit/callback
# URL CORRECTA: https://red-salud.org/api/auth/didit/callback
# URL INCORRECTA: https://red-salud.org/api/webhooks/didit

# ============================================================================
# WHITE-LABEL CONFIGURATION
# ============================================================================

# Configuración de marca médica
DIDIT_BRAND_NAME=Platform Médicos
DIDIT_BRAND_LOGO=https://red-salud.org/logo.png
DIDIT_BRAND_COLOR=#2563eb
DIDIT_BRAND_PRIMARY_COLOR=#1d4ed8
DIDIT_BRAND_SECONDARY_COLOR=#3b82f6

# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================

# Nivel de seguridad para verificaciones médicas
DIDIT_SECURITY_LEVEL=high

# Tiempo de expiración de sesiones (5 minutos)
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

# Modo de desarrollo
NODE_ENV=development
DIDIT_SANDBOX_MODE=false

# ============================================================================
# MONITORING CONFIGURATION
# ============================================================================

# Configuración de monitoreo y alertas
DIDIT_MONITORING_ENABLED=true
DIDIT_ALERT_EMAIL=admin@red-salud.org
DIDIT_WEBHOOK_URL=https://red-salud.org/api/auth/didit/callback

# ============================================================================
# RESUMEN DE CONFIGURACIÓN
# ============================================================================

# ✅ API Key configurada: iXRQ76_FbQRt_N5tGK3UqkkAt3P5bQ5M6dTSSAsg8Vk
# ✅ Webhook Secret configurado: NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck
# ✅ URL de callback corregida: https://red-salud.org/api/auth/didit/callback
# ✅ Navegación de Fase 3 a Fase 4 corregida
# ✅ Componente DiditVerificationStep implementado
# ✅ APIs de Didit implementadas

# ============================================================================
# INSTRUCCIONES DE CONFIGURACIÓN EN DIDIT
# ============================================================================

# 1. En el dashboard de Didit.me:
#    - Ve a Settings > Webhooks
#    - Configura la URL: https://red-salud.org/api/auth/didit/callback
#    - Usa la clave secreta: NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck

# 2. En el dashboard de Didit.me:
#    - Ve a API Keys
#    - Usa la API Key: iXRQ76_FbQRt_N5tGK3UqkkAt3P5bQ5M6dTSSAsg8Vk

# 3. En el dashboard de Didit.me:
#    - Ve a Workflows
#    - Crea un workflow llamado: medical_verification_venezuela
#    - Configura para documentos venezolanos (cédula)

# 4. En el dashboard de Didit.me:
#    - Ve a White Label
#    - Configura la marca: Platform Médicos
#    - Sube el logo de tu plataforma médica
#    - Configura los colores médicos
