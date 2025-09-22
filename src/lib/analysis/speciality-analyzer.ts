/**
 * Algoritmo de Análisis de Especialidades Médicas
 * 
 * Analiza los datos obtenidos del SACS para determinar:
 * 1. Si es médico (no veterinario)
 * 2. Qué especialidad tiene
 * 3. Qué dashboard asignar
 * 4. Si el nombre coincide con la Fase 1
 */

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface SACSData {
  isValid: boolean;
  isVerified: boolean;
  doctorName?: string;
  specialty?: string;
  profession?: string;
  licenseNumber?: string;
  registrationDate?: string;
  hasPostgrados?: boolean;
  especialidad?: string;
  rawData?: any;
}

export interface DashboardAccess {
  allowedDashboards: string[];
  primaryDashboard: string;
  reason: string;
  requiresApproval: boolean;
}

export interface NameVerification {
  sacsName: string;
  registrationName: string;
  matches: boolean;
  confidence: number;
}

export interface SpecialityAnalysis {
  isValidMedicalProfessional: boolean;
  profession: string;
  specialty: string;
  dashboardAccess: DashboardAccess;
  nameVerification: NameVerification;
  legalStatus: 'legal' | 'requires_verification' | 'illegal';
  recommendations: string[];
}

// ============================================================================
// CONFIGURACIÓN DE ESPECIALIDADES Y DASHBOARDS
// ============================================================================

const MEDICAL_SPECIALTIES = {
  // Especialidades médicas principales
  'MEDICINA INTERNA': {
    dashboards: ['internal-medicine', 'general-medicine'],
    primary: 'internal-medicine',
    description: 'Especialista en Medicina Interna'
  },
  'CARDIOLOGIA': {
    dashboards: ['cardiology', 'internal-medicine'],
    primary: 'cardiology',
    description: 'Especialista en Cardiología'
  },
  'NEUROLOGIA': {
    dashboards: ['neurology', 'internal-medicine'],
    primary: 'neurology',
    description: 'Especialista en Neurología'
  },
  'PEDIATRIA': {
    dashboards: ['pediatrics', 'general-medicine'],
    primary: 'pediatrics',
    description: 'Especialista en Pediatría'
  },
  'GINECOLOGIA': {
    dashboards: ['gynecology', 'obstetrics'],
    primary: 'gynecology',
    description: 'Especialista en Ginecología'
  },
  'OBSTETRICIA': {
    dashboards: ['obstetrics', 'gynecology'],
    primary: 'obstetrics',
    description: 'Especialista en Obstetricia'
  },
  'CIRUGIA GENERAL': {
    dashboards: ['general-surgery', 'surgery'],
    primary: 'general-surgery',
    description: 'Especialista en Cirugía General'
  },
  'ORTOPEDIA': {
    dashboards: ['orthopedics', 'surgery'],
    primary: 'orthopedics',
    description: 'Especialista en Ortopedia'
  },
  'DERMATOLOGIA': {
    dashboards: ['dermatology', 'general-medicine'],
    primary: 'dermatology',
    description: 'Especialista en Dermatología'
  },
  'PSIQUIATRIA': {
    dashboards: ['psychiatry', 'mental-health'],
    primary: 'psychiatry',
    description: 'Especialista en Psiquiatría'
  },
  'ANESTESIOLOGIA': {
    dashboards: ['anesthesiology', 'surgery'],
    primary: 'anesthesiology',
    description: 'Especialista en Anestesiología'
  },
  'RADIOLOGIA': {
    dashboards: ['radiology', 'diagnostic-imaging'],
    primary: 'radiology',
    description: 'Especialista en Radiología'
  },
  'EMERGENCIA': {
    dashboards: ['emergency-medicine', 'general-medicine'],
    primary: 'emergency-medicine',
    description: 'Especialista en Medicina de Emergencia'
  },
  'FAMILIA': {
    dashboards: ['family-medicine', 'general-medicine'],
    primary: 'family-medicine',
    description: 'Especialista en Medicina Familiar'
  }
};

const PROFESSION_KEYWORDS = {
  // Profesiones médicas válidas
  MEDICO: ['MÉDICO', 'MEDICO', 'MÉDICO(A)', 'MEDICO(A)', 'MÉDICO(A)', 'MEDICO(A)', 'DOCTOR', 'DR.', 'DRA.'],
  CIRUJANO: ['CIRUJANO', 'CIRUJANA', 'CIRUJANO(A)', 'CIRUJANA(A)', 'CIRUJANO(A)', 'CIRUJANA(A)', 'SURGEON'],
  ESPECIALISTA: ['ESPECIALISTA', 'ESPECIALISTA EN', 'SPECIALIST']
};

const INVALID_PROFESSIONS = [
  'VETERINARIO',
  'VETERINARIA',
  'VETERINARY',
  'VET',
  'ENFERMERO',
  'ENFERMERA',
  'NURSE',
  'TÉCNICO',
  'TECNICO',
  'TECHNICIAN'
];

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Analiza los datos del SACS y determina el acceso al dashboard
 */
export function analyzeSpecialityAndAccess(
  sacsData: SACSData,
  registrationFirstName: string,
  registrationLastName: string
): SpecialityAnalysis {
  
  // 1. Verificar si es un profesional médico válido
  const isValidMedical = validateMedicalProfessional(sacsData);
  
  // 2. Detectar especialidad (solo si es médico válido)
  let specialty = 'NO APLICA';
  let dashboardAccess = {
    allowedDashboards: [],
    primaryDashboard: 'none',
    reason: 'No es un profesional médico válido',
    requiresApproval: true
  };
  
  if (isValidMedical) {
    specialty = detectSpecialty(sacsData);
    dashboardAccess = determineDashboardAccess(specialty, sacsData);
  }
  
  // 3. Verificar nombre
  const nameVerification = verifyNameMatch(
    sacsData.doctorName || '',
    `${registrationFirstName} ${registrationLastName}`
  );
  
  // 4. Determinar estado legal
  const legalStatus = determineLegalStatus(sacsData, isValidMedical);
  
  // 5. Generar recomendaciones
  const recommendations = generateRecommendations(
    isValidMedical,
    specialty,
    nameVerification,
    legalStatus
  );

  return {
    isValidMedicalProfessional: isValidMedical,
    profession: sacsData.profession || sacsData.rawData?.profesion || 'Desconocida',
    specialty: specialty,
    dashboardAccess: dashboardAccess,
    nameVerification: nameVerification,
    legalStatus: legalStatus,
    recommendations: recommendations
  };
}

/**
 * Valida si es un profesional médico válido (no veterinario, etc.)
 */
function validateMedicalProfessional(sacsData: SACSData): boolean {
  // Usar tanto profession como profesion (del scraping)
  const professionText = sacsData.profession || sacsData.rawData?.profesion;
  
  if (!sacsData.isValid || !professionText) {
    return false;
  }

  const profession = professionText.toUpperCase();
  
  // IMPORTANTE: Verificar profesiones inválidas PRIMERO
  // Esto incluye veterinarios, enfermeros, técnicos, etc.
  for (const invalidProfession of INVALID_PROFESSIONS) {
    if (profession.includes(invalidProfession)) {
      return false;
    }
  }
  
  // Verificar que SÍ sea una profesión médica válida
  // Buscar cualquier variación de MÉDICO (pero NO veterinario)
  if ((profession.includes('MÉDICO') || profession.includes('MEDICO')) && 
      !profession.includes('VETERINARIO')) {
    return true;
  }
  
  // Buscar cualquier variación de CIRUJANO
  if (profession.includes('CIRUJANO') || profession.includes('CIRUJANA')) {
    return true;
  }
  
  // Buscar cualquier variación de ESPECIALISTA
  if (profession.includes('ESPECIALISTA')) {
    return true;
  }
  
  // Buscar DOCTOR
  if (profession.includes('DOCTOR') || profession.includes('DR.') || profession.includes('DRA.')) {
    return true;
  }
  
  return false;
}

/**
 * Detecta la especialidad del médico (puede ser múltiple)
 */
function detectSpecialty(sacsData: SACSData): string {
  const specialties: string[] = [];
  
  // Priorizar especialidad específica si existe
  if (sacsData.especialidad) {
    // Si hay múltiples especialidades separadas por comas, guiones, o "Y"
    const especialidadText = sacsData.especialidad.toUpperCase();
    const separators = [',', ';', ' - ', ' Y ', ' Y', 'Y '];
    
    let foundMultiple = false;
    for (const separator of separators) {
      if (especialidadText.includes(separator)) {
        const parts = especialidadText.split(separator).map(p => p.trim()).filter(p => p.length > 0);
        specialties.push(...parts);
        foundMultiple = true;
        break;
      }
    }
    
    if (!foundMultiple) {
      specialties.push(especialidadText);
    }
  }
  
  // Buscar en la profesión SOLO si contiene palabras específicas de especialidad
  if (sacsData.profession && specialties.length === 0) {
    const profession = sacsData.profession.toUpperCase();
    
    // Buscar coincidencias exactas de especialidades
    for (const [specialty, config] of Object.entries(MEDICAL_SPECIALTIES)) {
      if (profession.includes(specialty)) {
        specialties.push(specialty);
      }
    }
    
    // IMPORTANTE: NO asumir especialidad basada solo en "MÉDICO" o "CIRUJANO"
    // Estas son profesiones base, no especialidades específicas
    // Solo detectar especialidad si hay palabras específicas como "ESPECIALISTA EN"
    if (profession.includes('ESPECIALISTA EN')) {
      // Extraer la especialidad después de "ESPECIALISTA EN"
      const especialistaMatch = profession.match(/ESPECIALISTA EN\s+([^,]+)/);
      if (especialistaMatch) {
        specialties.push(especialistaMatch[1].trim());
      }
    }
  }
  
  // Si no se encontraron especialidades, retornar medicina general
  if (specialties.length === 0) {
    return 'MEDICINA GENERAL';
  }
  
  // Si hay múltiples especialidades, unirlas con "Y"
  if (specialties.length > 1) {
    return specialties.join(' Y ');
  }
  
  return specialties[0];
}

/**
 * Determina qué dashboards puede acceder el médico
 * IMPORTANTE: Todos los médicos tienen acceso al dashboard de medicina general
 */
function determineDashboardAccess(specialty: string, sacsData: SACSData): DashboardAccess {
  const specialtyConfig = MEDICAL_SPECIALTIES[specialty as keyof typeof MEDICAL_SPECIALTIES];
  
  if (specialtyConfig) {
    // Garantizar que todos los médicos tengan acceso a medicina general
    const allowedDashboards = [...new Set([
      'general-medicine', // Siempre incluir medicina general
      ...specialtyConfig.dashboards
    ])];
    
    return {
      allowedDashboards,
      primaryDashboard: specialtyConfig.primary,
      reason: `Acceso autorizado como ${specialtyConfig.description} + medicina general`,
      requiresApproval: false
    };
  }
  
  // Si no se encuentra especialidad específica, acceso básico
  return {
    allowedDashboards: ['general-medicine'],
    primaryDashboard: 'general-medicine',
    reason: 'Acceso básico como médico general',
    requiresApproval: true
  };
}

/**
 * Verifica si el nombre del SACS coincide con el nombre de registro
 */
function verifyNameMatch(sacsName: string, registrationName: string): NameVerification {
  if (!sacsName || !registrationName) {
    return {
      sacsName: sacsName || '',
      registrationName: registrationName || '',
      matches: false,
      confidence: 0
    };
  }
  
  // Normalizar nombres (mayúsculas, sin acentos, sin espacios extra)
  const normalizeName = (name: string) => {
    return name
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
  };
  
  const normalizedSacsName = normalizeName(sacsName);
  const normalizedRegistrationName = normalizeName(registrationName);
  
  // Calcular similitud usando algoritmo de Levenshtein simplificado
  const similarity = calculateNameSimilarity(normalizedSacsName, normalizedRegistrationName);
  
  return {
    sacsName: sacsName,
    registrationName: registrationName,
    matches: similarity >= 0.8, // 80% de similitud mínima
    confidence: similarity
  };
}

/**
 * Calcula la similitud entre dos nombres
 */
function calculateNameSimilarity(name1: string, name2: string): number {
  const words1 = name1.split(' ');
  const words2 = name2.split(' ');
  
  let matches = 0;
  let totalWords = Math.max(words1.length, words2.length);
  
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2) {
        matches++;
        break;
      }
    }
  }
  
  return matches / totalWords;
}

/**
 * Determina el estado legal del profesional
 */
function determineLegalStatus(sacsData: SACSData, isValidMedical: boolean): 'legal' | 'requires_verification' | 'illegal' {
  if (!sacsData.isValid || !isValidMedical) {
    return 'illegal';
  }
  
  if (!sacsData.hasPostgrados && !sacsData.especialidad) {
    return 'requires_verification';
  }
  
  return 'legal';
}

/**
 * Genera recomendaciones basadas en el análisis
 */
function generateRecommendations(
  isValidMedical: boolean,
  specialty: string,
  nameVerification: NameVerification,
  legalStatus: string
): string[] {
  const recommendations: string[] = [];
  
  if (!isValidMedical) {
    recommendations.push('❌ No es un profesional médico válido. Solo se permiten médicos.');
    return recommendations;
  }
  
  if (!nameVerification.matches) {
    recommendations.push('⚠️ El nombre no coincide exactamente. Se requiere verificación manual.');
  }
  
  if (legalStatus === 'requires_verification') {
    recommendations.push('📋 Se requiere verificación adicional de especialidad.');
  }
  
  if (legalStatus === 'legal') {
    if (specialty === 'MEDICINA GENERAL') {
      recommendations.push('✅ Profesional médico válido sin especialidad específica.');
      recommendations.push('🎯 Profesión: Médico Cirujano - Acceso a medicina general');
    } else {
      recommendations.push('✅ Profesional médico válido con especialidad reconocida.');
      recommendations.push(`🎯 Especialidad detectada: ${specialty}`);
    }
  } else {
    recommendations.push(`🎯 Especialidad detectada: ${specialty}`);
  }
  
  return recommendations;
}

// ============================================================================
// FUNCIÓN DE CONVENIENCIA
// ============================================================================

/**
 * Función principal para analizar especialidad y acceso
 */
export function analyzeDoctorSpeciality(
  sacsData: SACSData,
  firstName: string,
  lastName: string
): SpecialityAnalysis {
  return analyzeSpecialityAndAccess(sacsData, firstName, lastName);
}
