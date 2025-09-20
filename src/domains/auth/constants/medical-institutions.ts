/**
 * Medical Institutions Constants
 * @fileoverview Venezuelan medical institutions data for doctor registration
 * @compliance Medical education institution validation for licensing
 */

// Lista de universidades venezolanas reconocidas para medicina
export const VENEZUELAN_UNIVERSITIES = [
  'Universidad Central de Venezuela (UCV)',
  'Universidad del Zulia (LUZ)',
  'Universidad de Los Andes (ULA)',
  'Universidad de Carabobo (UC)',
  'Universidad de Oriente (UDO)',
  'Universidad Centroccidental Lisandro Alvarado (UCLA)',
  'Universidad Nacional Experimental Rómulo Gallegos (UNERG)',
  'Universidad Nacional Experimental Francisco de Miranda (UNEFM)',
  'Universidad de las Ciencias de la Salud "Hugo Chávez Frías" (UCS)',
  'Universidad Bolivariana de Venezuela (UBV)',
  'Universidad José Antonio Páez (UJAP)',
  'Universidad Santa María (USM)',
  'Universidad Rafael Urdaneta (URU)',
  'Universidad Católica Andrés Bello (UCAB)',
  'Universidad Metropolitana (UNIMET)'
] as const;

// Lista de colegios de médicos por estado venezolano
export const MEDICAL_COLLEGES = [
  'Colegio de Médicos del Estado Anzoátegui',
  'Colegio de Médicos del Estado Apure',
  'Colegio de Médicos del Estado Aragua',
  'Colegio de Médicos del Estado Barinas',
  'Colegio de Médicos del Estado Bolívar',
  'Colegio de Médicos del Estado Carabobo',
  'Colegio de Médicos del Distrito Federal',
  'Colegio de Médicos del Estado Cojedes',
  'Colegio de Médicos del Estado Delta Amacuro',
  'Colegio de Médicos del Estado Falcón',
  'Colegio de Médicos del Estado Guárico',
  'Colegio de Médicos del Estado Lara',
  'Colegio de Médicos del Estado Mérida',
  'Colegio de Médicos del Estado Miranda',
  'Colegio de Médicos del Estado Monagas',
  'Colegio de Médicos del Estado Nueva Esparta',
  'Colegio de Médicos del Estado Portuguesa',
  'Colegio de Médicos del Estado Sucre',
  'Colegio de Médicos del Estado Táchira',
  'Colegio de Médicos del Estado Trujillo',
  'Colegio de Médicos del Estado Vargas',
  'Colegio de Médicos del Estado Yaracuy',
  'Colegio de Médicos del Estado Zulia'
] as const;

// Tipos derivados de las constantes
export type VenezuelanUniversity = typeof VENEZUELAN_UNIVERSITIES[number];
export type MedicalCollege = typeof MEDICAL_COLLEGES[number];

// Estados venezolanos para validación
export const VENEZUELAN_STATES = [
  'Anzoátegui',
  'Apure', 
  'Aragua',
  'Barinas',
  'Bolívar',
  'Carabobo',
  'Distrito Federal',
  'Cojedes',
  'Delta Amacuro',
  'Falcón',
  'Guárico',
  'Lara',
  'Mérida',
  'Miranda',
  'Monagas',
  'Nueva Esparta',
  'Portuguesa',
  'Sucre',
  'Táchira',
  'Trujillo',
  'Vargas',
  'Yaracuy',
  'Zulia'
] as const;

export type VenezuelanState = typeof VENEZUELAN_STATES[number];

// Función para obtener el colegio médico por estado
export const getMedicalCollegeByState = (state: string): string | null => {
  const stateIndex = VENEZUELAN_STATES.findIndex(s => s.toLowerCase() === state.toLowerCase());
  return stateIndex !== -1 ? MEDICAL_COLLEGES[stateIndex] : null;
};

// Función para validar universidad
export const isValidUniversity = (university: string): boolean => {
  return VENEZUELAN_UNIVERSITIES.some(u => 
    u.toLowerCase().includes(university.toLowerCase()) ||
    university.toLowerCase().includes(u.toLowerCase())
  );
};

// Función para obtener sugerencias de universidad
export const getUniversitySuggestions = (query: string): VenezuelanUniversity[] => {
  if (!query || query.length < 2) return [];
  
  const lowercaseQuery = query.toLowerCase();
  return VENEZUELAN_UNIVERSITIES.filter(university =>
    university.toLowerCase().includes(lowercaseQuery)
  );
};
