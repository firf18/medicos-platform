/**
 * Especialidades médicas específicas para Venezuela
 */

export const VENEZUELAN_MEDICAL_SPECIALTIES = [
  // Especialidades Básicas
  { id: 'medicina_general', name: 'Medicina General', category: 'basica' },
  { id: 'medicina_interna', name: 'Medicina Interna', category: 'basica' },
  { id: 'pediatria', name: 'Pediatría', category: 'basica' },
  { id: 'ginecologia_obstetricia', name: 'Ginecología y Obstetricia', category: 'basica' },
  { id: 'cirugia_general', name: 'Cirugía General', category: 'basica' },
  
  // Especialidades Quirúrgicas
  { id: 'cardiologia', name: 'Cardiología', category: 'quirurgica' },
  { id: 'neurologia', name: 'Neurología', category: 'quirurgica' },
  { id: 'ortopedia_traumatologia', name: 'Ortopedia y Traumatología', category: 'quirurgica' },
  { id: 'urologia', name: 'Urología', category: 'quirurgica' },
  { id: 'oftalmologia', name: 'Oftalmología', category: 'quirurgica' },
  { id: 'otorrinolaringologia', name: 'Otorrinolaringología', category: 'quirurgica' },
  { id: 'cirugia_plastica', name: 'Cirugía Plástica', category: 'quirurgica' },
  { id: 'neurocirugia', name: 'Neurocirugía', category: 'quirurgica' },
  
  // Especialidades Médicas
  { id: 'dermatologia', name: 'Dermatología', category: 'medica' },
  { id: 'psiquiatria', name: 'Psiquiatría', category: 'medica' },
  { id: 'anestesiologia', name: 'Anestesiología', category: 'medica' },
  { id: 'radiologia', name: 'Radiología', category: 'medica' },
  { id: 'patologia', name: 'Patología', category: 'medica' },
  { id: 'medicina_laboral', name: 'Medicina del Trabajo', category: 'medica' },
  { id: 'medicina_deportiva', name: 'Medicina Deportiva', category: 'medica' },
  
  // Especialidades por Sistemas
  { id: 'gastroenterologia', name: 'Gastroenterología', category: 'sistemas' },
  { id: 'neumologia', name: 'Neumología', category: 'sistemas' },
  { id: 'endocrinologia', name: 'Endocrinología', category: 'sistemas' },
  { id: 'reumatologia', name: 'Reumatología', category: 'sistemas' },
  { id: 'hematologia', name: 'Hematología', category: 'sistemas' },
  { id: 'nefrologia', name: 'Nefrología', category: 'sistemas' },
  { id: 'oncologia', name: 'Oncología', category: 'sistemas' },
  
  // Especialidades de Emergencia
  { id: 'medicina_emergencia', name: 'Medicina de Emergencia', category: 'emergencia' },
  { id: 'medicina_critica', name: 'Medicina Crítica', category: 'emergencia' },
  { id: 'traumatologia', name: 'Traumatología', category: 'emergencia' },
  
  // Especialidades Pediátricas
  { id: 'pediatria_cardiologia', name: 'Cardiología Pediátrica', category: 'pediatrica' },
  { id: 'pediatria_neurologia', name: 'Neurología Pediátrica', category: 'pediatrica' },
  { id: 'pediatria_oncologia', name: 'Oncología Pediátrica', category: 'pediatrica' },
  
  // Especialidades Geriátricas
  { id: 'geriatria', name: 'Geriatría', category: 'geriatrica' },
  
  // Especialidades de Laboratorio
  { id: 'laboratorio_clinico', name: 'Laboratorio Clínico', category: 'laboratorio' },
  { id: 'microbiologia', name: 'Microbiología', category: 'laboratorio' },
  { id: 'bioquimica', name: 'Bioquímica', category: 'laboratorio' },
  
  // Especialidades de Imagen
  { id: 'radiologia_diagnostica', name: 'Radiología Diagnóstica', category: 'imagen' },
  { id: 'medicina_nuclear', name: 'Medicina Nuclear', category: 'imagen' },
  { id: 'ultrasonografia', name: 'Ultrasonografía', category: 'imagen' },
  
  // Especialidades de Rehabilitación
  { id: 'fisiatria', name: 'Fisiatría', category: 'rehabilitacion' },
  { id: 'fisioterapia', name: 'Fisioterapia', category: 'rehabilitacion' },
  { id: 'terapia_ocupacional', name: 'Terapia Ocupacional', category: 'rehabilitacion' },
  
  // Especialidades de Salud Mental
  { id: 'psicologia_clinica', name: 'Psicología Clínica', category: 'salud_mental' },
  { id: 'psicologia_educativa', name: 'Psicología Educativa', category: 'salud_mental' },
  
  // Especialidades de Salud Pública
  { id: 'salud_publica', name: 'Salud Pública', category: 'salud_publica' },
  { id: 'epidemiologia', name: 'Epidemiología', category: 'salud_publica' },
  { id: 'medicina_preventiva', name: 'Medicina Preventiva', category: 'salud_publica' }
];

export const SPECIALTY_CATEGORIES = [
  { id: 'basica', name: 'Especialidades Básicas', color: 'blue' },
  { id: 'quirurgica', name: 'Especialidades Quirúrgicas', color: 'red' },
  { id: 'medica', name: 'Especialidades Médicas', color: 'green' },
  { id: 'sistemas', name: 'Especialidades por Sistemas', color: 'purple' },
  { id: 'emergencia', name: 'Especialidades de Emergencia', color: 'orange' },
  { id: 'pediatrica', name: 'Especialidades Pediátricas', color: 'pink' },
  { id: 'geriatrica', name: 'Especialidades Geriátricas', color: 'gray' },
  { id: 'laboratorio', name: 'Especialidades de Laboratorio', color: 'yellow' },
  { id: 'imagen', name: 'Especialidades de Imagen', color: 'cyan' },
  { id: 'rehabilitacion', name: 'Especialidades de Rehabilitación', color: 'lime' },
  { id: 'salud_mental', name: 'Especialidades de Salud Mental', color: 'indigo' },
  { id: 'salud_publica', name: 'Especialidades de Salud Pública', color: 'teal' }
];

export const getSpecialtiesByCategory = (category: string) => {
  return VENEZUELAN_MEDICAL_SPECIALTIES.filter(specialty => specialty.category === category);
};

export const getSpecialtyById = (id: string) => {
  return VENEZUELAN_MEDICAL_SPECIALTIES.find(specialty => specialty.id === id);
};
