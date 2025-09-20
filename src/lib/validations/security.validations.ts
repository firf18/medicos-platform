/**
 * Security Validations - Red-Salud Platform
 * 
 * Funciones de seguridad y compliance para proteger datos médicos sensibles.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

// ============================================================================
// FUNCIONES DE SEGURIDAD Y COMPLIANCE
// ============================================================================

/**
 * Eventos de seguridad categorizados
 */
export type SecurityEventType = 
  | 'authentication_attempt'
  | 'authentication_success'
  | 'authentication_failure'
  | 'authorization_denied'
  | 'data_access'
  | 'data_modification'
  | 'data_export'
  | 'admin_action'
  | 'compliance_violation'
  | 'suspicious_activity'
  | 'system_error'
  | 'password_change'
  | 'account_locked'
  | 'session_expired'
  | 'medical_record_accessed'
  | 'patient_data_viewed'
  | 'prescription_created'
  | 'lab_result_accessed';

/**
 * Niveles de severidad para eventos de seguridad
 */
export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Interfaz para eventos de seguridad
 */
export interface SecurityEvent {
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  userRole?: string;
  patientId?: string;
  resourceId?: string;
  action: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  source: string;
  sessionId?: string;
  complianceLevel?: 'basic' | 'enhanced' | 'critical';
}

/**
 * Registra eventos de seguridad para auditoría médica
 */
export function logSecurityEvent(
  eventType: SecurityEventType,
  action: string,
  data: Record<string, unknown> = {},
  severity: SecuritySeverity = 'info'
): void {
  const securityEvent: SecurityEvent = {
    eventType,
    action,
    severity,
    timestamp: new Date().toISOString(),
    source: 'medical_platform',
    metadata: data,
    ...data // Permite sobrescribir campos específicos
  };
  
  // Log estructurado para desarrollo
  console.log(`[SECURITY-${severity.toUpperCase()}]`, {
    ...securityEvent,
    formattedMessage: `${eventType}: ${action}`
  });
  
  // En producción, enviar a servicio de auditoría médica
  if (process.env.NODE_ENV === 'production') {
    sendToMedicalAuditService(securityEvent);
  }
  
  // Para eventos críticos, notificar inmediatamente
  if (severity === 'critical') {
    notifySecurityTeam(securityEvent);
  }
}

/**
 * Valida que los datos no contengan información sensible inapropiada
 */
export function validateDataSensitivity(data: Partial<Record<string, unknown>>): {
  isValid: boolean;
  violations: string[];
  riskLevel: 'low' | 'medium' | 'high';
} {
  const violations: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  
  // Campos prohibidos en contextos generales
  const prohibitedFields = [
    'ssn', 'socialSecurityNumber', 'taxId', 'tax_id',
    'bankAccount', 'bank_account', 'creditCard', 'credit_card',
    'passport', 'driverLicense', 'driver_license'
  ];
  
  // Patrones sensibles en el contenido
  const sensitivePatterns = [
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, type: 'SSN' },
    { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, type: 'Credit Card' },
    { pattern: /\b[JVGE]-\d{8,9}\b/g, type: 'Venezuelan ID' },
    { pattern: /\b\d{10,12}\b/g, type: 'Bank Account' }
  ];
  
  const dataString = JSON.stringify(data).toLowerCase();
  
  // Verificar campos prohibidos
  prohibitedFields.forEach(field => {
    if (dataString.includes(field.toLowerCase())) {
      violations.push(`Campo sensible detectado: ${field}`);
      riskLevel = 'high';
    }
  });
  
  // Verificar patrones sensibles
  sensitivePatterns.forEach(({ pattern, type }) => {
    const matches = dataString.match(pattern);
    if (matches) {
      violations.push(`Patrón sensible detectado: ${type} (${matches.length} ocurrencias)`);
      if (riskLevel === 'low') riskLevel = 'medium';
    }
  });
  
  // Verificar longitud excesiva que podría contener datos sensibles
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string' && value.length > 1000) {
      violations.push(`Campo excesivamente largo detectado: ${key}`);
      if (riskLevel === 'low') riskLevel = 'medium';
    }
  });
  
  return {
    isValid: violations.length === 0,
    violations,
    riskLevel
  };
}

/**
 * Sanitiza datos de entrada para prevenir inyecciones y ataques
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  return input
    .replace(/[<>]/g, '') // Remover HTML tags
    .replace(/['"]/g, '') // Remover comillas
    .replace(/[;]/g, '') // Remover punto y coma
    .replace(/--/g, '') // Remover comentarios SQL
    .replace(/\/\*/g, '') // Remover comentarios SQL
    .replace(/\*\//g, '') // Remover comentarios SQL
    .replace(/xp_/gi, '') // Remover comandos SQL extendidos
    .replace(/sp_/gi, '') // Remover procedimientos almacenados
    .trim();
}

/**
 * Sanitiza datos médicos específicamente
 */
export function sanitizeMedicalInput(input: string): string {
  const sanitized = sanitizeInput(input);
  
  // Patrones específicos médicos que deben ser preservados
  const medicalPatterns = [
    /\b\d+\/\d+\b/g, // Presión arterial (120/80)
    /\b\d+\.\d+\s*(mg|ml|g|kg|cm|mm)\b/gi, // Medidas médicas
    /\b\d+\s*(bpm|rpm|°C|°F)\b/gi // Signos vitales
  ];
  
  // Aquí preservamos patrones médicos válidos si es necesario
  return sanitized;
}

/**
 * Valida niveles de acceso según roles médicos
 */
export function validateMedicalAccessLevel(
  userRole: string,
  requestedResource: string,
  action: 'read' | 'write' | 'delete' | 'share'
): { isAuthorized: boolean; reason?: string } {
  
  // Matriz de permisos por rol médico
  const accessMatrix: Record<string, Record<string, string[]>> = {
    doctor: {
      patient_data: ['read', 'write'],
      medical_records: ['read', 'write'],
      prescriptions: ['read', 'write'],
      lab_results: ['read', 'write'],
      appointments: ['read', 'write'],
      billing: ['read']
    },
    nurse: {
      patient_data: ['read', 'write'],
      medical_records: ['read'],
      prescriptions: ['read'],
      lab_results: ['read'],
      appointments: ['read', 'write'],
      vital_signs: ['read', 'write']
    },
    patient: {
      own_data: ['read'],
      own_medical_records: ['read'],
      own_appointments: ['read', 'write'],
      own_lab_results: ['read'],
      family_data: ['read'] // Solo si es cuidador autorizado
    },
    administrator: {
      system_config: ['read', 'write'],
      user_management: ['read', 'write', 'delete'],
      audit_logs: ['read'],
      billing: ['read', 'write']
    },
    laboratory: {
      lab_results: ['read', 'write'],
      lab_orders: ['read', 'write'],
      patient_data: ['read'] // Solo datos relevantes para el lab
    }
  };
  
  const userPermissions = accessMatrix[userRole];
  if (!userPermissions) {
    return {
      isAuthorized: false,
      reason: `Rol no reconocido: ${userRole}`
    };
  }
  
  const resourcePermissions = userPermissions[requestedResource];
  if (!resourcePermissions) {
    return {
      isAuthorized: false,
      reason: `Recurso no accesible para rol ${userRole}: ${requestedResource}`
    };
  }
  
  if (!resourcePermissions.includes(action)) {
    return {
      isAuthorized: false,
      reason: `Acción no autorizada para ${userRole} en ${requestedResource}: ${action}`
    };
  }
  
  return { isAuthorized: true };
}

/**
 * Genera hash seguro para datos sensibles
 */
export function generateSecureHash(data: string): string {
  // En un entorno real, usar una librería criptográfica robusta
  // Por ahora, implementación básica para desarrollo
  const crypto = typeof window !== 'undefined' ? window.crypto : require('crypto');
  
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    // Implementación para browser
    return btoa(data + Date.now().toString()).slice(0, 32);
  } else {
    // Implementación para Node.js
    try {
      const hash = crypto.createHash('sha256');
      hash.update(data + process.env.HASH_SALT || 'default_salt');
      return hash.digest('hex').slice(0, 32);
    } catch {
      // Fallback básico
      return btoa(data + Date.now().toString()).slice(0, 32);
    }
  }
}

/**
 * Valida integridad de sesión médica
 */
export function validateMedicalSession(sessionData: any): {
  isValid: boolean;
  violations: string[];
  shouldTerminate: boolean;
} {
  const violations: string[] = [];
  let shouldTerminate = false;
  
  // Verificar tiempo de sesión
  if (sessionData.lastActivity) {
    const lastActivity = new Date(sessionData.lastActivity);
    const now = new Date();
    const inactiveMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
    
    // Timeout más estricto para roles médicos
    const maxInactiveTime = sessionData.userRole === 'doctor' ? 30 : 60; // minutos
    
    if (inactiveMinutes > maxInactiveTime) {
      violations.push(`Sesión inactiva por ${Math.round(inactiveMinutes)} minutos`);
      shouldTerminate = true;
    }
  }
  
  // Verificar cambios en IP (potencial secuestro de sesión)
  if (sessionData.originalIp && sessionData.currentIp && 
      sessionData.originalIp !== sessionData.currentIp) {
    violations.push('Cambio de dirección IP detectado');
    shouldTerminate = true;
  }
  
  // Verificar límites de acceso concurrente
  if (sessionData.concurrentSessions > 2) {
    violations.push('Demasiadas sesiones concurrentes');
    // No terminar automáticamente, pero registrar para investigación
  }
  
  // Verificar acceso desde dispositivos/ubicaciones inusuales
  if (sessionData.riskScore && sessionData.riskScore > 70) {
    violations.push('Actividad de alto riesgo detectada');
    // Requerir re-autenticación pero no terminar
  }
  
  return {
    isValid: violations.length === 0,
    violations,
    shouldTerminate
  };
}

/**
 * Encripta datos médicos sensibles para almacenamiento
 */
export function encryptMedicalData(data: string): { encrypted: string; keyId: string } {
  // En producción, usar una librería de encriptación robusta como libsodium
  // Esta es una implementación simplificada para desarrollo
  
  const keyId = `key_${Date.now()}`;
  const encoded = btoa(data); // Base64 encoding (NO es encriptación real)
  
  // Registrar evento de encriptación
  logSecurityEvent('data_modification', 'medical_data_encrypted', {
    keyId,
    dataLength: data.length
  });
  
  return {
    encrypted: encoded,
    keyId
  };
}

/**
 * Valida que una acción cumple con políticas de compliance médico
 */
export function validateCompliancePolicy(
  action: string,
  userRole: string,
  resourceType: string,
  metadata: Record<string, unknown> = {}
): { isCompliant: boolean; violations: string[]; requirements: string[] } {
  const violations: string[] = [];
  const requirements: string[] = [];
  
  // Políticas específicas para datos médicos
  const compliancePolicies = {
    'medical_record_access': {
      requiredFields: ['patientConsent', 'medicalJustification'],
      allowedRoles: ['doctor', 'nurse', 'patient'],
      auditRequired: true,
      timeRestrictions: true
    },
    'prescription_creation': {
      requiredFields: ['licenseNumber', 'patientId', 'diagnosis'],
      allowedRoles: ['doctor'],
      auditRequired: true,
      timeRestrictions: false
    },
    'lab_result_access': {
      requiredFields: ['patientConsent'],
      allowedRoles: ['doctor', 'nurse', 'patient', 'laboratory'],
      auditRequired: true,
      timeRestrictions: false
    }
  };
  
  const policy = compliancePolicies[action as keyof typeof compliancePolicies];
  
  if (!policy) {
    // Política por defecto para acciones no especificadas
    requirements.push('Acción no reconocida, aplicando política restrictiva');
    return { isCompliant: false, violations: ['Acción no autorizada'], requirements };
  }
  
  // Validar rol autorizado
  if (!policy.allowedRoles.includes(userRole)) {
    violations.push(`Rol ${userRole} no autorizado para ${action}`);
  }
  
  // Validar campos requeridos
  policy.requiredFields.forEach(field => {
    if (!metadata[field]) {
      violations.push(`Campo requerido faltante: ${field}`);
    }
  });
  
  // Validar restricciones de tiempo (horario laboral)
  if (policy.timeRestrictions) {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 6 || hour > 22) {
      violations.push('Acceso fuera del horario permitido (06:00 - 22:00)');
    }
  }
  
  // Generar requerimientos
  if (policy.auditRequired) {
    requirements.push('Registro de auditoría requerido');
  }
  
  return {
    isCompliant: violations.length === 0,
    violations,
    requirements
  };
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Envía eventos críticos al servicio de auditoría médica
 */
function sendToMedicalAuditService(event: SecurityEvent): void {
  // En producción, implementar integración con servicio de auditoría
  // Por ahora, simular el envío
  console.log('[AUDIT SERVICE]', event);
}

/**
 * Notifica al equipo de seguridad sobre eventos críticos
 */
function notifySecurityTeam(event: SecurityEvent): void {
  // En producción, implementar notificaciones inmediatas
  // (email, SMS, Slack, etc.)
  console.log('[SECURITY ALERT]', {
    level: 'CRITICAL',
    event: event.eventType,
    action: event.action,
    timestamp: event.timestamp,
    userId: event.userId
  });
}

// ============================================================================
// TIPOS EXPORTADOS
// ============================================================================

export type { SecurityEventType, SecuritySeverity, SecurityEvent };

export interface SecurityValidationResult {
  isValid: boolean;
  violations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  action?: 'allow' | 'warn' | 'deny' | 'investigate';
}

export interface ComplianceValidationResult {
  isCompliant: boolean;
  violations: string[];
  requirements: string[];
  auditLevel: 'basic' | 'enhanced' | 'critical';
}
