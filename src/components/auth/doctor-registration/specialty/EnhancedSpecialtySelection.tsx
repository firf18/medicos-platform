/**
 * Enhanced Specialty Selection Component - Elite Medical Platform
 * 
 * Componente completo de selección de especialidades con diseño profesional,
 * scroll lateral, categorización y características expandibles.
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Stethoscope,
  Heart,
  Brain,
  Baby,
  Scissors,
  Activity,
  Eye,
  Users,
  Zap,
  Shield,
  Star,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

import SpecialtyCard from './SpecialtyCard';
import { 
  DASHBOARD_FEATURES, 
  SPECIALTY_DASHBOARD_CONFIGS,
  getSpecialtyConfig,
  DashboardFeature 
} from '@/lib/medical-specialties/dashboard-features';

// Tipos e interfaces
interface MedicalSpecialty {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  color: string;
  is_active: boolean;
  isComingSoon?: boolean;
}

interface EnhancedSpecialtySelectionProps {
  selectedSpecialty: MedicalSpecialty | null;
  onSpecialtySelect: (specialty: MedicalSpecialty) => void;
  isLoading?: boolean;
}

// Datos de especialidades con categorización mejorada
const MEDICAL_SPECIALTIES_DATA: MedicalSpecialty[] = [
  // Atención Primaria
  {
    id: 'general_medicine',
    name: 'Medicina General',
    description: 'Atención médica integral para pacientes de todas las edades',
    category: 'primary_care',
    icon: Stethoscope,
    color: 'blue',
    is_active: true
  },
  {
    id: 'family_medicine',
    name: 'Medicina Familiar',
    description: 'Atención médica integral para toda la familia',
    category: 'primary_care',
    icon: Users,
    color: 'green',
    is_active: true,
    isComingSoon: true
  },
  {
    id: 'pediatrics',
    name: 'Pediatría',
    description: 'Medicina especializada en el cuidado de niños y adolescentes',
    category: 'primary_care',
    icon: Baby,
    color: 'pink',
    is_active: true,
    isComingSoon: true
  },

  // Medicina Interna
  {
    id: 'internal_medicine',
    name: 'Medicina Interna',
    description: 'Diagnóstico y tratamiento de enfermedades internas del adulto',
    category: 'internal_medicine',
    icon: Activity,
    color: 'blue',
    is_active: true,
    isComingSoon: true
  },
  {
    id: 'cardiology',
    name: 'Cardiología',
    description: 'Especialidad médica que se ocupa del corazón y sistema cardiovascular',
    category: 'internal_medicine',
    icon: Heart,
    color: 'red',
    is_active: true,
    isComingSoon: true
  },
  {
    id: 'neurology',
    name: 'Neurología',
    description: 'Especialidad médica que trata el sistema nervioso',
    category: 'internal_medicine',
    icon: Brain,
    color: 'purple',
    is_active: true,
    isComingSoon: true
  },
  {
    id: 'endocrinology',
    name: 'Endocrinología',
    description: 'Diagnóstico y tratamiento de trastornos hormonales',
    category: 'internal_medicine',
    icon: Zap,
    color: 'yellow',
    is_active: true,
    isComingSoon: true
  },

  // Especialidades Quirúrgicas
  {
    id: 'general_surgery',
    name: 'Cirugía General',
    description: 'Procedimientos quirúrgicos generales y abdominales',
    category: 'surgery',
    icon: Scissors,
    color: 'orange',
    is_active: true,
    isComingSoon: true
  },
  {
    id: 'neurosurgery',
    name: 'Neurocirugía',
    description: 'Cirugía del sistema nervioso central y periférico',
    category: 'surgery',
    icon: Brain,
    color: 'purple',
    is_active: true,
    isComingSoon: true
  },
  {
    id: 'orthopedics',
    name: 'Ortopedia y Traumatología',
    description: 'Tratamiento del sistema musculoesquelético',
    category: 'surgery',
    icon: Shield,
    color: 'orange',
    is_active: true,
    isComingSoon: true
  },

  // Especialidades Diagnósticas
  {
    id: 'radiology',
    name: 'Radiología',
    description: 'Especialidad médica que utiliza imágenes médicas para diagnóstico',
    category: 'diagnostic',
    icon: Eye,
    color: 'teal',
    is_active: true,
    isComingSoon: true
  },
  {
    id: 'pathology',
    name: 'Patología',
    description: 'Diagnóstico de enfermedades mediante análisis de tejidos',
    category: 'diagnostic',
    icon: Eye,
    color: 'violet',
    is_active: true,
    isComingSoon: true
  },

  // Medicina de Emergencias
  {
    id: 'emergency_medicine',
    name: 'Medicina de Emergencias',
    description: 'Atención médica especializada en situaciones de emergencia',
    category: 'emergency',
    icon: Zap,
    color: 'red',
    is_active: true,
    isComingSoon: true
  }
];

// Categorías de especialidades
const SPECIALTY_CATEGORIES = [
  { 
    id: 'all', 
    name: 'Todas las Especialidades', 
    icon: Grid3X3, 
    color: 'gray' 
  },
  { 
    id: 'primary_care', 
    name: 'Atención Primaria', 
    icon: Stethoscope, 
    color: 'blue' 
  },
  { 
    id: 'internal_medicine', 
    name: 'Medicina Interna', 
    icon: Activity, 
    color: 'green' 
  },
  { 
    id: 'surgery', 
    name: 'Especialidades Quirúrgicas', 
    icon: Scissors, 
    color: 'orange' 
  },
  { 
    id: 'diagnostic', 
    name: 'Especialidades Diagnósticas', 
    icon: Eye, 
    color: 'purple' 
  },
  { 
    id: 'emergency', 
    name: 'Medicina de Emergencias', 
    icon: Zap, 
    color: 'red' 
  }
];

const EnhancedSpecialtySelection: React.FC<EnhancedSpecialtySelectionProps> = ({
  selectedSpecialty,
  onSpecialtySelect,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtrado de especialidades
  const filteredSpecialties = useMemo(() => {
    return MEDICAL_SPECIALTIES_DATA.filter(specialty => {
      const matchesSearch = specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          specialty.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || specialty.category === selectedCategory;
      return matchesSearch && matchesCategory && specialty.is_active;
    });
  }, [searchTerm, selectedCategory]);

  // Función para obtener características de una especialidad
  const getSpecialtyFeatures = (specialtyId: string) => {
    const config = getSpecialtyConfig(specialtyId);
    if (!config) {
      return { core: [], advanced: [], premium: [] };
    }

    const core = config.coreFeatures.map(id => DASHBOARD_FEATURES[id]).filter(Boolean);
    const advanced = config.advancedFeatures.map(id => DASHBOARD_FEATURES[id]).filter(Boolean);
    const premium = config.premiumFeatures.map(id => DASHBOARD_FEATURES[id]).filter(Boolean);

    return { core, advanced, premium };
  };

  // Estadísticas de especialidades
  const stats = useMemo(() => {
    const available = filteredSpecialties.filter(s => !s.isComingSoon).length;
    const comingSoon = filteredSpecialties.filter(s => s.isComingSoon).length;
    return { available, comingSoon, total: filteredSpecialties.length };
  }, [filteredSpecialties]);

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Selecciona tu Especialidad Médica
          </h2>
          <p className="text-gray-600">
            Configura tu dashboard especializado con las mejores herramientas para tu práctica
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.available}</div>
            <div className="text-xs text-gray-500">Disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.comingSoon}</div>
            <div className="text-xs text-gray-500">Próximamente</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium">
                Buscar especialidad
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Modo de vista */}
            <div className="flex items-end gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Categorías */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Categorías</h3>
        <ScrollArea className="w-full" orientation="horizontal">
          <div className="flex space-x-2 pb-2">
            {SPECIALTY_CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              const isActive = selectedCategory === category.id;
              
              return (
                <Button
                  key={category.id}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex-shrink-0 transition-all duration-200",
                    isActive && "shadow-lg"
                  )}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {category.name}
                  {category.id !== 'all' && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {MEDICAL_SPECIALTIES_DATA.filter(s => s.category === category.id && s.is_active).length}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Especialidad destacada - Medicina General */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-blue-900">
                ⭐ Medicina General - Disponible Ahora
              </CardTitle>
              <CardDescription className="text-blue-700">
                Dashboard completo con todas las características principales implementadas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              ✅ 25+ Características
            </Badge>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              ✅ IA Integrada
            </Badge>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              ✅ Telemedicina
            </Badge>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              ✅ Laboratorio
            </Badge>
          </div>
          {selectedSpecialty?.id !== 'general_medicine' && (
            <Button 
              onClick={() => onSpecialtySelect(MEDICAL_SPECIALTIES_DATA[0])}
              className="w-full lg:w-auto"
            >
              Seleccionar Medicina General
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Lista de especialidades */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Especialidades Disponibles
          </h3>
          <div className="text-sm text-gray-500">
            {filteredSpecialties.length} especialidades encontradas
          </div>
        </div>

        {filteredSpecialties.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No se encontraron especialidades
              </h3>
              <p className="text-gray-500">
                Intenta ajustar los filtros o el término de búsqueda
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 lg:grid-cols-2 gap-6" 
              : "space-y-4"
          )}>
            {filteredSpecialties.map((specialty) => {
              const features = getSpecialtyFeatures(specialty.id);
              
              return (
                <SpecialtyCard
                  key={specialty.id}
                  specialty={specialty}
                  isSelected={selectedSpecialty?.id === specialty.id}
                  isAvailable={!specialty.isComingSoon}
                  coreFeatures={features.core}
                  advancedFeatures={features.advanced}
                  premiumFeatures={features.premium}
                  onSelect={() => !specialty.isComingSoon && onSpecialtySelect(specialty)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Información adicional */}
      {selectedSpecialty && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-800">
              <div className="p-2 rounded-lg bg-green-100">
                <selectedSpecialty.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">
                  {selectedSpecialty.name} seleccionada
                </p>
                <p className="text-sm text-green-600">
                  Puedes continuar al siguiente paso para completar tu registro
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedSpecialtySelection;
