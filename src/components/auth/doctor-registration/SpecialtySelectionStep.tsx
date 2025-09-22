'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Heart, 
  Stethoscope, 
  Brain, 
  Baby, 
  Scissors, 
  Scan, 
  Zap,
  CheckCircle,
  Star,
  Clock,
  Users
} from 'lucide-react';

import { 
  MEDICAL_SPECIALTIES, 
  getSpecialtiesByCategory,
  type MedicalSpecialty,
  type SpecialtyCategory 
} from '@/lib/medical-specialties/specialties-data';
import { DoctorRegistrationData } from '@/types/medical/specialties';
import DatabaseConnectedSpecialtySelection, { SpecialtyNavigationRef } from './specialty/DatabaseConnectedSpecialtySelection';

// Mapeo de iconos
const ICON_MAP: Record<string, any> = {
  'Heart': Heart,
  'Stethoscope': Stethoscope,
  'Brain': Brain,
  'Baby': Baby,
  'Scissors': Scissors,
  'Scan': Scan,
  'Zap': Zap
};

// Mapeo de colores
const COLOR_MAP: Record<string, string> = {
  'red': 'border-red-200 hover:border-red-400 text-red-700',
  'blue': 'border-blue-200 hover:border-blue-400 text-blue-700',
  'green': 'border-green-200 hover:border-green-400 text-green-700',
  'purple': 'border-purple-200 hover:border-purple-400 text-purple-700',
  'orange': 'border-orange-200 hover:border-orange-400 text-orange-700',
  'teal': 'border-teal-200 hover:border-teal-400 text-teal-700',
  'indigo': 'border-indigo-200 hover:border-indigo-400 text-indigo-700'
};

interface SpecialtySelectionStepProps {
  data: DoctorRegistrationData;
  updateData: (data: Partial<DoctorRegistrationData>) => void;
  onStepComplete: (step: 'specialty_selection') => void;
  onStepError: (step: 'specialty_selection', error: string) => void;
  isLoading: boolean;
  onNext?: () => void; // Nueva prop para manejar navegación manual
  onPrevious?: () => void; // Nueva prop para manejar navegación manual
}

export default function SpecialtySelectionStep({
  data,
  updateData,
  onStepComplete,
  onStepError,
  isLoading,
  onNext,
  onPrevious
}: SpecialtySelectionStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SpecialtyCategory | 'all'>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<any>(null);
  const specialtyNavigationRef = useRef<SpecialtyNavigationRef>(null);

  // Filtrar especialidades por búsqueda y categoría
  const filteredSpecialties = MEDICAL_SPECIALTIES.filter(specialty => {
    const matchesSearch = specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         specialty.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || specialty.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Categorías disponibles
  const categories: { value: SpecialtyCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'Todas las especialidades' },
    { value: 'medicina_general', label: 'Medicina General' },
    { value: 'especialidades_medicas', label: 'Especialidades Médicas' },
    { value: 'especialidades_quirurgicas', label: 'Especialidades Quirúrgicas' },
    { value: 'medicina_diagnostica', label: 'Medicina Diagnóstica' },
    { value: 'salud_mental', label: 'Salud Mental' },
    { value: 'pediatria_especializada', label: 'Pediatría Especializada' }
  ];

  // Manejar selección de especialidad
  const handleSpecialtySelect = (specialty: any) => {
    setSelectedSpecialty(specialty);
    updateData({ 
      specialtyId: specialty.id,
      selectedFeatures: []
    });
  };

  // Función para validar el formulario
  const validateForm = useCallback((showError = true) => {
    if (!selectedSpecialty) {
      if (showError) {
        onStepError('specialty_selection', 'Debes seleccionar una especialidad médica');
      }
      return false;
    }
    return true;
  }, [selectedSpecialty, onStepError]);

  // Función para manejar navegación manual hacia adelante
  const handleManualNext = useCallback(() => {
    const isValid = validateForm();
    if (isValid) {
      // Guardar datos antes de avanzar
      if (selectedSpecialty) {
        updateData({ 
          specialtyId: selectedSpecialty.id,
          selectedFeatures: []
        });
      }
      
      // Marcar paso como completado
      onStepComplete('specialty_selection');
      
      // Llamar función de navegación para avanzar al siguiente paso
      if (onNext) {
        onNext();
      }
    }
  }, [selectedSpecialty, validateForm, updateData, onStepComplete, onNext]);

  // Función para manejar navegación hacia atrás
  const handleManualPrevious = useCallback(() => {
    // Guardar datos antes de retroceder
    if (selectedSpecialty) {
      updateData({ 
        specialtyId: selectedSpecialty.id,
        selectedFeatures: []
      });
    }
    
    // Llamar función de navegación si está disponible
    if (onPrevious) {
      onPrevious();
    }
  }, [selectedSpecialty, updateData, onPrevious]);

  // Exponer funciones de navegación al componente padre
  useEffect(() => {
    // Exponer funciones globalmente para que el componente padre pueda acceder
    (window as any).specialty_selectionStepNavigation = {
      handleNext: handleManualNext,
      handlePrevious: handleManualPrevious,
      isValid: () => validateForm()
    };
    
    return () => {
      // Limpiar al desmontar
      delete (window as any).specialty_selectionStepNavigation;
    };
  }, [handleManualNext, handleManualPrevious, validateForm]);

  // Efecto para validar cuando cambian los datos (solo para mostrar errores)
  // Eliminado useEffect que validaba automáticamente
  // La validación se ejecutará solo cuando sea necesario (al intentar avanzar)

  return (
    <DatabaseConnectedSpecialtySelection
      ref={specialtyNavigationRef}
      selectedSpecialty={selectedSpecialty}
      onSpecialtySelect={handleSpecialtySelect}
      isLoading={isLoading}
    />
  );
}
