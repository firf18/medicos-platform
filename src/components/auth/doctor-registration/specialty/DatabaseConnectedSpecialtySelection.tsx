/**
 * Database Connected Specialty Selection - Platform Médicos Elite
 * 
 * Sistema 3x3 conectado a datos reales de Supabase con navegación por páginas
 */

'use client';

import React, { useState, useMemo, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight,
  Star,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle,
  Stethoscope,
  Activity,
  Scissors,
  Baby,
  Eye,
  Zap,
  Heart,
  Brain,
  Droplet,
  Bone,
  Layers,
  Shield,
  Bug,
  Droplets,
  GitBranch,
  Ear,
  Scan,
  Microscope,
  Dna,
  Moon,
  Users,
  Apple,
  RotateCcw,
  Trophy,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

interface DatabaseSpecialty {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
}

interface DatabaseConnectedSpecialtySelectionProps {
  selectedSpecialty: DatabaseSpecialty | null;
  onSpecialtySelect: (specialty: DatabaseSpecialty) => void;
  isLoading?: boolean;
}

export interface SpecialtyNavigationRef {
  goToNextPage: () => void;
  goToPrevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  currentPage: number;
  totalPages: number;
}

interface CompactSpecialtyCard3x3Props {
  specialty: DatabaseSpecialty;
  isSelected: boolean;
  onSelect: () => void;
}

// ============================================================================
// CONFIGURACIÓN 3x3
// ============================================================================

const GRID_3X3_CONFIG = {
  ROWS: 3,
  COLS: 3,
  ITEMS_PER_PAGE: 9, // 3 rows × 3 cols = 9 especialidades por página
  CARD_HEIGHT: 'h-48', // Altura aumentada para mejor visual
  CARD_WIDTH: 'w-full'
};

// ============================================================================
// MAPEO DE ICONOS
// ============================================================================

const ICON_MAP: Record<string, any> = {
  'Stethoscope': Stethoscope,
  'Activity': Activity,
  'Scissors': Scissors,
  'Baby': Baby,
  'Eye': Eye,
  'Zap': Zap,
  'Heart': Heart,
  'Brain': Brain,
  'Droplet': Droplet,
  'Bone': Bone,
  'Layers': Layers,
  'Shield': Shield,
  'Bug': Bug,
  'Droplets': Droplets,
  'GitBranch': GitBranch,
  'Ear': Ear,
  'Scan': Scan,
  'Microscope': Microscope,
  'Dna': Dna,
  'Moon': Moon,
  'Users': Users,
  'Apple': Apple,
  'RotateCcw': RotateCcw,
  'Trophy': Trophy,
  'Briefcase': Briefcase,
  'Sparkles': Sparkles,
  'Clock': Clock
};

// ============================================================================
// COLORES
// ============================================================================

const COLOR_CLASSES: Record<string, any> = {
  blue: { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600', hover: 'hover:border-blue-400' },
  green: { border: 'border-green-200', bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600', hover: 'hover:border-green-400' },
  red: { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-600', hover: 'hover:border-red-400' },
  orange: { border: 'border-orange-200', bg: 'bg-orange-50', text: 'text-orange-700', icon: 'text-orange-600', hover: 'hover:border-orange-400' },
  purple: { border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-600', hover: 'hover:border-purple-400' },
  pink: { border: 'border-pink-200', bg: 'bg-pink-50', text: 'text-pink-700', icon: 'text-pink-600', hover: 'hover:border-pink-400' },
  indigo: { border: 'border-indigo-200', bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-600', hover: 'hover:border-indigo-400' },
  teal: { border: 'border-teal-200', bg: 'bg-teal-50', text: 'text-teal-700', icon: 'text-teal-600', hover: 'hover:border-teal-400' },
  amber: { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-600', hover: 'hover:border-amber-400' },
  cyan: { border: 'border-cyan-200', bg: 'bg-cyan-50', text: 'text-cyan-700', icon: 'text-cyan-600', hover: 'hover:border-cyan-400' },
  yellow: { border: 'border-yellow-200', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-600', hover: 'hover:border-yellow-400' },
  sky: { border: 'border-sky-200', bg: 'bg-sky-50', text: 'text-sky-700', icon: 'text-sky-600', hover: 'hover:border-sky-400' },
  gray: { border: 'border-gray-200', bg: 'bg-gray-50', text: 'text-gray-700', icon: 'text-gray-600', hover: 'hover:border-gray-400' },
  violet: { border: 'border-violet-200', bg: 'bg-violet-50', text: 'text-violet-700', icon: 'text-violet-600', hover: 'hover:border-violet-400' }
};

// ============================================================================
// CATEGORÍAS CON DATOS REALES
// ============================================================================

const CATEGORY_CONFIG = {
  'primary_care': { name: 'Atención Primaria', icon: Stethoscope, color: 'blue' },
  'internal_medicine': { name: 'Medicina Interna', icon: Activity, color: 'green' },
  'surgery': { name: 'Especialidades Quirúrgicas', icon: Scissors, color: 'orange' },
  'pediatrics': { name: 'Pediatría Especializada', icon: Baby, color: 'pink' },
  'diagnostic': { name: 'Especialidades Diagnósticas', icon: Eye, color: 'purple' },
  'emergency': { name: 'Medicina de Emergencias', icon: Zap, color: 'red' }
};

// ============================================================================
// COMPONENTE DE TARJETA 3x3
// ============================================================================

const CompactSpecialtyCard3x3: React.FC<CompactSpecialtyCard3x3Props> = ({
  specialty,
  isSelected,
  onSelect
}) => {
  const IconComponent = ICON_MAP[specialty.icon] || Stethoscope;
  const colors = COLOR_CLASSES[specialty.color] || COLOR_CLASSES.blue;
  const isGeneralMedicine = specialty.id === 'general_medicine';
  const isComingSoon = !isGeneralMedicine;

  if (isComingSoon) {
    return (
      <Card className={cn(
        "relative transition-all duration-200 cursor-not-allowed",
        "border-dashed border-2 border-gray-300 bg-gray-50/50",
        GRID_3X3_CONFIG.CARD_HEIGHT,
        GRID_3X3_CONFIG.CARD_WIDTH
      )}>
        <CardContent className="p-4 h-full flex flex-col justify-between">
          {/* Header con icono y título */}
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-lg bg-gray-100 flex-shrink-0">
              <IconComponent className="h-6 w-6 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-600 truncate leading-tight">
                {specialty.name}
              </h4>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 mt-2 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Q2 2025
              </Badge>
            </div>
          </div>
          
          {/* Descripción centrada */}
          <div className="flex-1 flex flex-col justify-center py-2">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              {specialty.description}
            </p>
          </div>
          
          {/* Footer con estado */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-gray-400" />
              <p className="text-xs text-gray-600">
                En desarrollo
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              disabled
              className="w-full cursor-not-allowed text-xs h-8 bg-gray-100 border-gray-300 text-gray-500"
            >
              Próximamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "relative transition-all duration-200 cursor-pointer",
      GRID_3X3_CONFIG.CARD_HEIGHT,
      GRID_3X3_CONFIG.CARD_WIDTH,
      colors.border,
      isSelected 
        ? `${colors.bg} border-2 shadow-lg` 
        : "hover:shadow-md border-2",
      colors.hover
    )}>
      {isSelected && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className={cn("rounded-full p-1", colors.bg)}>
            <CheckCircle className={cn("h-5 w-5", colors.icon)} />
          </div>
        </div>
      )}

      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn("p-3 rounded-lg flex-shrink-0", colors.bg)}>
            <IconComponent className={cn("h-6 w-6", colors.icon)} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={cn("font-medium text-sm truncate", colors.text)}>
              {specialty.name}
            </h4>
            <Badge className="bg-green-100 text-green-800 border-green-200 mt-1 text-xs">
              <Star className="h-3 w-3 mr-1" />
              Disponible
            </Badge>
          </div>
        </div>
        
        <p className="text-xs text-gray-600 mb-4 flex-1">
          {specialty.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">25+ Herramientas</Badge>
            <Badge variant="secondary" className="text-xs">IA Integrada</Badge>
            <Badge variant="secondary" className="text-xs">Telemedicina</Badge>
          </div>
          
          <Button
            onClick={onSelect}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className={cn(
              "w-full transition-all duration-200",
              isSelected 
                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" 
                : `border-blue-200 text-blue-700 hover:bg-blue-50`
            )}
          >
            {isSelected ? "✓ Seleccionada" : "Seleccionar"}
            {!isSelected && <ArrowRight className="h-3 w-3 ml-1" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const DatabaseConnectedSpecialtySelection = forwardRef<SpecialtyNavigationRef, DatabaseConnectedSpecialtySelectionProps>(({
  selectedSpecialty,
  onSpecialtySelect,
  isLoading = false
}, ref) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [specialties, setSpecialties] = useState<DatabaseSpecialty[]>([]);
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // CARGAR DATOS REALES DE SUPABASE
  // ============================================================================

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        setLoading(true);
        
        // Cargar datos reales de Supabase
        const { fetchSpecialties } = await import('@/lib/api/specialties');
        const data = await fetchSpecialties();
        
        // Si no hay datos, usar datos de respaldo
        const mockData: DatabaseSpecialty[] = data.length > 0 ? data : [
          // Atención Primaria
          { id: 'general_medicine', name: 'Medicina General', description: 'Atención médica integral para pacientes de todas las edades', category: 'primary_care', icon: 'Stethoscope', color: 'blue' },
          { id: 'allergy_immunology', name: 'Alergología', description: 'Diagnóstico y tratamiento de alergias e inmunología', category: 'internal_medicine', icon: 'Shield', color: 'yellow' },
          { id: 'anesthesiology', name: 'Anestesiología', description: 'Manejo anestésico y cuidados perioperatorios', category: 'surgery', icon: 'Moon', color: 'indigo' },
          { id: 'vascular_surgery', name: 'Angiología y Cirugía Vascular', description: 'Cirugía de vasos sanguíneos y sistema circulatorio', category: 'surgery', icon: 'GitBranch', color: 'red' },
          { id: 'cardiology', name: 'Cardiología', description: 'Especialidad médica que se ocupa del corazón y sistema cardiovascular', category: 'internal_medicine', icon: 'Heart', color: 'red' },
          { id: 'general_surgery', name: 'Cirugía General', description: 'Procedimientos quirúrgicos generales y abdominales', category: 'surgery', icon: 'Scissors', color: 'orange' },
          { id: 'plastic_surgery', name: 'Cirugía Plástica', description: 'Cirugía reconstructiva y estética', category: 'surgery', icon: 'Sparkles', color: 'pink' },
          { id: 'thoracic_surgery', name: 'Cirugía Torácica', description: 'Cirugía de tórax, pulmones y mediastino', category: 'surgery', icon: 'Heart', color: 'blue' },
          { id: 'dermatology', name: 'Dermatología', description: 'Diagnóstico y tratamiento de enfermedades de la piel', category: 'internal_medicine', icon: 'Layers', color: 'pink' },
          { id: 'endocrinology', name: 'Endocrinología', description: 'Diagnóstico y tratamiento de trastornos hormonales', category: 'internal_medicine', icon: 'Zap', color: 'yellow' },
          { id: 'family_medicine', name: 'Medicina Familiar', description: 'Atención médica integral para toda la familia', category: 'primary_care', icon: 'Users', color: 'green' },
          { id: 'gastroenterology', name: 'Gastroenterología', description: 'Diagnóstico y tratamiento del sistema digestivo', category: 'internal_medicine', icon: 'Activity', color: 'green' },
          { id: 'medical_genetics', name: 'Genética Médica', description: 'Diagnóstico y consejo genético', category: 'diagnostic', icon: 'Dna', color: 'cyan' },
          { id: 'geriatrics', name: 'Geriatría', description: 'Atención médica especializada para adultos mayores', category: 'primary_care', icon: 'Clock', color: 'gray' },
          { id: 'gynecology', name: 'Ginecología y Obstetricia', description: 'Salud del sistema reproductor femenino y embarazo', category: 'surgery', icon: 'Heart', color: 'pink' },
          { id: 'hematology', name: 'Hematología', description: 'Diagnóstico y tratamiento de enfermedades de la sangre', category: 'internal_medicine', icon: 'Droplet', color: 'red' },
          { id: 'infectious_diseases', name: 'Infectología', description: 'Diagnóstico y tratamiento de enfermedades infecciosas', category: 'internal_medicine', icon: 'Bug', color: 'orange' },
          { id: 'emergency_medicine', name: 'Medicina de Emergencias', description: 'Atención médica especializada en situaciones de emergencia', category: 'emergency', icon: 'Zap', color: 'red' },
          { id: 'occupational_medicine', name: 'Medicina del Trabajo', description: 'Salud ocupacional y medicina laboral', category: 'primary_care', icon: 'Briefcase', color: 'blue' },
          { id: 'sports_medicine', name: 'Medicina Deportiva', description: 'Prevención y tratamiento de lesiones deportivas', category: 'primary_care', icon: 'Trophy', color: 'orange' },
          { id: 'physical_rehabilitation', name: 'Medicina Física y Rehabilitación', description: 'Rehabilitación y medicina física', category: 'primary_care', icon: 'RotateCcw', color: 'blue' },
          { id: 'internal_medicine', name: 'Medicina Interna', description: 'Diagnóstico y tratamiento de enfermedades internas del adulto', category: 'internal_medicine', icon: 'Activity', color: 'blue' },
          { id: 'palliative_care', name: 'Medicina Paliativa', description: 'Cuidados paliativos y manejo del dolor', category: 'internal_medicine', icon: 'Heart', color: 'purple' },
          { id: 'preventive_medicine', name: 'Medicina Preventiva', description: 'Prevención de enfermedades y promoción de la salud', category: 'primary_care', icon: 'Shield', color: 'green' },
          { id: 'nephrology', name: 'Nefrología', description: 'Diagnóstico y tratamiento de enfermedades renales', category: 'internal_medicine', icon: 'Droplets', color: 'cyan' },
          { id: 'neonatology', name: 'Neonatología', description: 'Cuidados médicos especializados para recién nacidos', category: 'pediatrics', icon: 'Baby', color: 'pink' },
          { id: 'pulmonology', name: 'Neumología', description: 'Diagnóstico y tratamiento de enfermedades respiratorias', category: 'internal_medicine', icon: 'Heart', color: 'sky' },
          { id: 'neurosurgery', name: 'Neurocirugía', description: 'Cirugía del sistema nervioso central y periférico', category: 'surgery', icon: 'Brain', color: 'purple' },
          { id: 'neurology', name: 'Neurología', description: 'Especialidad médica que trata el sistema nervioso', category: 'internal_medicine', icon: 'Brain', color: 'purple' },
          { id: 'clinical_nutrition', name: 'Nutriología Clínica', description: 'Evaluación y tratamiento nutricional especializado', category: 'primary_care', icon: 'Apple', color: 'green' },
          { id: 'ophthalmology', name: 'Oftalmología', description: 'Cuidado de la salud ocular y visual', category: 'surgery', icon: 'Eye', color: 'amber' },
          { id: 'oncology', name: 'Oncología', description: 'Diagnóstico y tratamiento del cáncer', category: 'internal_medicine', icon: 'Shield', color: 'purple' },
          { id: 'orthopedics', name: 'Ortopedia y Traumatología', description: 'Tratamiento del sistema musculoesquelético', category: 'surgery', icon: 'Bone', color: 'orange' },
          { id: 'otolaryngology', name: 'Otorrinolaringología', description: 'Cirugía y medicina de oído, nariz y garganta', category: 'surgery', icon: 'Ear', color: 'green' },
          { id: 'pathology', name: 'Patología', description: 'Diagnóstico de enfermedades mediante análisis de tejidos', category: 'diagnostic', icon: 'Microscope', color: 'violet' },
          { id: 'pediatrics', name: 'Pediatría', description: 'Medicina especializada en el cuidado de niños y adolescentes', category: 'primary_care', icon: 'Baby', color: 'green' },
          { id: 'psychiatry', name: 'Psiquiatría', description: 'Diagnóstico y tratamiento de trastornos mentales', category: 'internal_medicine', icon: 'Brain', color: 'indigo' },
          { id: 'radiology', name: 'Radiología', description: 'Especialidad médica que utiliza imágenes médicas para diagnóstico', category: 'diagnostic', icon: 'Scan', color: 'teal' },
          { id: 'rheumatology', name: 'Reumatología', description: 'Enfermedades reumáticas y autoinmunes', category: 'internal_medicine', icon: 'Bone', color: 'red' },
          { id: 'urology', name: 'Urología', description: 'Cirugía y medicina del sistema genitourinario', category: 'surgery', icon: 'Droplets', color: 'blue' }
        ];

        // Ordenar alfabéticamente (los datos de Supabase ya vienen ordenados)
        const sortedData = (data.length > 0 ? data : mockData).sort((a, b) => a.name.localeCompare(b.name));
        setSpecialties(sortedData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading specialties:', error);
        setLoading(false);
      }
    };

    loadSpecialties();
  }, []);

  // ============================================================================
  // DATOS CALCULADOS DINÁMICAMENTE
  // ============================================================================

  // Filtrar especialidades por categoría
  const filteredSpecialties = useMemo(() => {
    if (selectedCategory === 'all') return specialties;
    return specialties.filter(specialty => specialty.category === selectedCategory);
  }, [specialties, selectedCategory]);

  // Calcular estadísticas reales
  const stats = useMemo(() => {
    const total = specialties.length;
    const available = specialties.filter(s => s.id === 'general_medicine').length;
    const comingSoon = total - available;
    
    return { total, available, comingSoon };
  }, [specialties]);

  // Calcular estadísticas por categoría
  const categoryStats = useMemo(() => {
    const categories = Object.keys(CATEGORY_CONFIG).map(categoryId => {
      const categorySpecialties = specialties.filter(s => s.category === categoryId);
      return {
        id: categoryId,
        ...CATEGORY_CONFIG[categoryId as keyof typeof CATEGORY_CONFIG],
        count: categorySpecialties.length
      };
    });
    return categories;
  }, [specialties]);

  // Paginación
  const totalPages = Math.ceil(filteredSpecialties.length / GRID_3X3_CONFIG.ITEMS_PER_PAGE);
  const currentSpecialties = useMemo(() => {
    const startIndex = currentPage * GRID_3X3_CONFIG.ITEMS_PER_PAGE;
    const endIndex = startIndex + GRID_3X3_CONFIG.ITEMS_PER_PAGE;
    return filteredSpecialties.slice(startIndex, endIndex);
  }, [filteredSpecialties, currentPage]);

  // Resetear página al cambiar categoría
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(0);
  };

  // Navegación
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Exponer funciones para control externo
  useImperativeHandle(ref, () => ({
    goToNextPage,
    goToPrevPage,
    canGoNext: currentPage < totalPages - 1,
    canGoPrev: currentPage > 0,
    currentPage: currentPage + 1,
    totalPages
  }));


  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando especialidades médicas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Stats conectadas a datos reales */}
      <div className="bg-white px-6 py-3 border-b">
        <div className="flex justify-center gap-8 text-sm">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{stats.available}</div>
            <div className="text-gray-500">Disponible</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-600">{stats.comingSoon}</div>
            <div className="text-gray-500">Próximamente</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-600">{stats.total}</div>
            <div className="text-gray-500">Total</div>
          </div>
        </div>
      </div>

      {/* Layout principal 3x3 */}
      <div className="flex-1 flex px-6 py-6 gap-6 min-h-0 overflow-x-hidden">
        {/* Sidebar de categorías conectado a datos reales */}
        <div className="w-72 flex-shrink-0">
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Categorías</CardTitle>
              <CardDescription className="text-sm">
                Selecciona una categoría médica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Todas las especialidades */}
              <Button
                variant={selectedCategory === 'all' ? "default" : "ghost"}
                className="w-full justify-start h-auto p-4"
                onClick={() => handleCategoryChange('all')}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Stethoscope className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">Todas las Especialidades</div>
                    <div className="text-xs opacity-75">{stats.total} especialidades</div>
                  </div>
                </div>
              </Button>

              {/* Categorías con datos reales */}
              {categoryStats.map((category) => {
                const IconComponent = category.icon;
                const isActive = selectedCategory === category.id;
                const colors = COLOR_CLASSES[category.color];
                
                return (
                  <Button
                    key={category.id}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-auto p-4 transition-all duration-200",
                      isActive ? `${colors.bg} ${colors.text}` : "hover:bg-gray-50"
                    )}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={cn(
                        "p-2 rounded-lg flex-shrink-0",
                        isActive ? colors.bg : "bg-gray-100"
                      )}>
                        <IconComponent className={cn(
                          "h-5 w-5",
                          isActive ? colors.icon : "text-gray-600"
                        )} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{category.name}</div>
                        <div className="text-xs opacity-75">{category.count} especialidades</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Área principal GRID 3x3 */}
        <div className="flex-1 flex flex-col min-h-0 max-w-full">
          {/* Header con navegación por páginas */}
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedCategory === 'all' 
                  ? 'Todas las Especialidades' 
                  : CATEGORY_CONFIG[selectedCategory as keyof typeof CATEGORY_CONFIG]?.name || 'Especialidades'
                }
              </h3>
              <p className="text-sm text-gray-600">
                Mostrando {currentSpecialties.length} de {filteredSpecialties.length} especialidades
              </p>
            </div>
            
            {/* Navegación por páginas restaurada */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevPage}
                disabled={currentPage === 0}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-gray-600 px-3">
                Página {currentPage + 1} de {totalPages || 1}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage >= totalPages - 1}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* GRID 3x3 DE ESPECIALIDADES CON SCROLL */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="grid grid-cols-3 gap-4 pb-20 max-w-full">
              {currentSpecialties.map((specialty) => (
                <CompactSpecialtyCard3x3
                  key={specialty.id}
                  specialty={specialty}
                  isSelected={selectedSpecialty?.id === specialty.id}
                  onSelect={() => onSpecialtySelect(specialty)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

DatabaseConnectedSpecialtySelection.displayName = 'DatabaseConnectedSpecialtySelection';

export default DatabaseConnectedSpecialtySelection;
