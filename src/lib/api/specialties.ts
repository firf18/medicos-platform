/**
 * Specialties API - Platform Médicos Elite
 * 
 * API para consultar especialidades médicas desde Supabase
 */

import { createClient } from '@/lib/supabase/client';

export interface DatabaseSpecialty {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
}

export interface SpecialtyStats {
  total: number;
  available: number;
  comingSoon: number;
  byCategory: Record<string, number>;
}

/**
 * Obtener todas las especialidades médicas de Supabase
 */
export async function fetchSpecialties(): Promise<DatabaseSpecialty[]> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('medical_specialties')
      .select('id, name, description, category, icon, color')
      .order('name', { ascending: true }); // Orden alfabético

    if (error) {
      console.error('Error fetching specialties:', error);
      throw new Error('Failed to fetch specialties');
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchSpecialties:', error);
    throw error;
  }
}

/**
 * Calcular estadísticas dinámicas de especialidades
 */
export function calculateSpecialtyStats(specialties: DatabaseSpecialty[]): SpecialtyStats {
  const total = specialties.length;
  const available = specialties.filter(s => s.id === 'general_medicine').length;
  const comingSoon = total - available;
  
  // Contar por categoría
  const byCategory: Record<string, number> = {};
  specialties.forEach(specialty => {
    byCategory[specialty.category] = (byCategory[specialty.category] || 0) + 1;
  });

  return {
    total,
    available,
    comingSoon,
    byCategory
  };
}

/**
 * Filtrar especialidades por categoría
 */
export function filterSpecialtiesByCategory(
  specialties: DatabaseSpecialty[], 
  category: string
): DatabaseSpecialty[] {
  if (category === 'all') return specialties;
  return specialties.filter(specialty => specialty.category === category);
}

/**
 * Obtener especialidades con paginación
 */
export function paginateSpecialties(
  specialties: DatabaseSpecialty[],
  page: number,
  itemsPerPage: number
): DatabaseSpecialty[] {
  const startIndex = page * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return specialties.slice(startIndex, endIndex);
}

/**
 * Verificar si una especialidad está disponible
 */
export function isSpecialtyAvailable(specialtyId: string): boolean {
  return specialtyId === 'general_medicine';
}
