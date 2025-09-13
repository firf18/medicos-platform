'use client';

import { useState, useEffect } from 'react';
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
} from '@/lib/medical-specialties';
import { DoctorRegistrationData } from '@/types/medical/specialties';

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
}

export default function SpecialtySelectionStep({
  data,
  updateData,
  onStepComplete,
  onStepError,
  isLoading
}: SpecialtySelectionStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SpecialtyCategory | 'all'>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<MedicalSpecialty | null>(
    data.specialtyId ? MEDICAL_SPECIALTIES.find(s => s.id === data.specialtyId) || null : null
  );

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
  const handleSpecialtySelect = (specialty: MedicalSpecialty) => {
    setSelectedSpecialty(specialty);
    updateData({ 
      specialtyId: specialty.id,
      selectedFeatures: specialty.dashboardFeatures.map(f => f.id)
    });
  };

  // Validar y marcar como completado
  useEffect(() => {
    if (selectedSpecialty) {
      onStepComplete('specialty_selection');
    } else {
      onStepError('specialty_selection', 'Debes seleccionar una especialidad médica');
    }
  }, [selectedSpecialty, onStepComplete, onStepError]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Selecciona tu Especialidad Médica
        </h2>
        <p className="text-gray-600">
          Elige la especialidad que mejor describa tu práctica médica. Esto personalizará tu dashboard 
          con las herramientas específicas que necesitas.
        </p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar especialidad médica..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros de categoría */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de especialidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpecialties.map((specialty) => {
          const IconComponent = ICON_MAP[specialty.icon] || Stethoscope;
          const colorClasses = COLOR_MAP[specialty.color] || COLOR_MAP.blue;
          const isSelected = selectedSpecialty?.id === specialty.id;

          return (
            <Card
              key={specialty.id}
              className={`
                cursor-pointer transition-all duration-200 hover:shadow-lg
                ${isSelected 
                  ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
                  : `border-2 ${colorClasses}`
                }
              `}
              onClick={() => handleSpecialtySelect(specialty)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <IconComponent className={`h-6 w-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <CardTitle className="text-lg">{specialty.name}</CardTitle>
                <CardDescription className="text-sm">
                  {specialty.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Badges de información */}
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {specialty.complexity === 'basic' ? 'Básico' : 
                       specialty.complexity === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {specialty.estimatedPatients === 'low' ? 'Pocos pacientes' : 
                       specialty.estimatedPatients === 'medium' ? 'Volumen medio' : 'Alto volumen'}
                    </Badge>
                  </div>

                  {/* Características principales */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-700">Características principales:</p>
                    <div className="space-y-1">
                      {specialty.dashboardFeatures.slice(0, 3).map((feature) => (
                        <div key={feature.id} className="flex items-center text-xs text-gray-600">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                          {feature.name}
                        </div>
                      ))}
                      {specialty.dashboardFeatures.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{specialty.dashboardFeatures.length - 3} características más
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Información de la especialidad seleccionada */}
      {selectedSpecialty && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Especialidad Seleccionada: {selectedSpecialty.name}
            </CardTitle>
            <CardDescription className="text-green-700">
              Tu dashboard será configurado con {selectedSpecialty.dashboardFeatures.length} características 
              especializadas para {selectedSpecialty.name.toLowerCase()}.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-800 mb-2">Características incluidas:</h4>
                <div className="space-y-1">
                  {selectedSpecialty.dashboardFeatures.filter(f => f.priority === 'essential').map((feature) => (
                    <div key={feature.id} className="flex items-center text-sm text-green-700">
                      <Star className="h-3 w-3 mr-2 text-yellow-500" />
                      {feature.name}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-green-800 mb-2">Validaciones requeridas:</h4>
                <div className="space-y-1">
                  {selectedSpecialty.requiredValidations.map((validation) => (
                    <div key={validation.id} className="flex items-center text-sm text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {validation.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensaje si no hay resultados */}
      {filteredSpecialties.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron especialidades
          </h3>
          <p className="text-gray-600">
            Intenta con otros términos de búsqueda o selecciona una categoría diferente.
          </p>
        </div>
      )}
    </div>
  );
}
