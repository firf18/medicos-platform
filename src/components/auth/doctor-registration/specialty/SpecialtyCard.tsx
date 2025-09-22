/**
 * SpecialtyCard Component - Elite Medical Platform
 * 
 * Tarjeta individual de especialidad médica con diseño profesional y características expandibles.
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronRight, 
  ChevronDown, 
  CheckCircle, 
  Star, 
  Zap, 
  Crown, 
  Clock,
  Info,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardFeature } from '@/lib/medical-specialties/dashboard-features';

interface SpecialtyCardProps {
  specialty: {
    id: string;
    name: string;
    description: string;
    icon: any;
    color: string;
    category: string;
    isComingSoon?: boolean;
  };
  isSelected: boolean;
  isAvailable: boolean;
  coreFeatures: DashboardFeature[];
  advancedFeatures: DashboardFeature[];
  premiumFeatures: DashboardFeature[];
  onSelect: () => void;
  onLearnMore?: () => void;
}

const SpecialtyCard: React.FC<SpecialtyCardProps> = ({
  specialty,
  isSelected,
  isAvailable,
  coreFeatures,
  advancedFeatures,
  premiumFeatures,
  onSelect,
  onLearnMore
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = specialty.icon;

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { border: string; bg: string; text: string; icon: string }> = {
      'blue': { 
        border: 'border-blue-200 hover:border-blue-400', 
        bg: 'bg-blue-50', 
        text: 'text-blue-700', 
        icon: 'text-blue-600' 
      },
      'green': { 
        border: 'border-green-200 hover:border-green-400', 
        bg: 'bg-green-50', 
        text: 'text-green-700', 
        icon: 'text-green-600' 
      },
      'red': { 
        border: 'border-red-200 hover:border-red-400', 
        bg: 'bg-red-50', 
        text: 'text-red-700', 
        icon: 'text-red-600' 
      },
      'purple': { 
        border: 'border-purple-200 hover:border-purple-400', 
        bg: 'bg-purple-50', 
        text: 'text-purple-700', 
        icon: 'text-purple-600' 
      },
      'orange': { 
        border: 'border-orange-200 hover:border-orange-400', 
        bg: 'bg-orange-50', 
        text: 'text-orange-700', 
        icon: 'text-orange-600' 
      },
      'pink': { 
        border: 'border-pink-200 hover:border-pink-400', 
        bg: 'bg-pink-50', 
        text: 'text-pink-700', 
        icon: 'text-pink-600' 
      },
      'indigo': { 
        border: 'border-indigo-200 hover:border-indigo-400', 
        bg: 'bg-indigo-50', 
        text: 'text-indigo-700', 
        icon: 'text-indigo-600' 
      },
      'teal': { 
        border: 'border-teal-200 hover:border-teal-400', 
        bg: 'bg-teal-50', 
        text: 'text-teal-700', 
        icon: 'text-teal-600' 
      },
      'amber': { 
        border: 'border-amber-200 hover:border-amber-400', 
        bg: 'bg-amber-50', 
        text: 'text-amber-700', 
        icon: 'text-amber-600' 
      },
      'cyan': { 
        border: 'border-cyan-200 hover:border-cyan-400', 
        bg: 'bg-cyan-50', 
        text: 'text-cyan-700', 
        icon: 'text-cyan-600' 
      },
      'yellow': { 
        border: 'border-yellow-200 hover:border-yellow-400', 
        bg: 'bg-yellow-50', 
        text: 'text-yellow-700', 
        icon: 'text-yellow-600' 
      },
      'sky': { 
        border: 'border-sky-200 hover:border-sky-400', 
        bg: 'bg-sky-50', 
        text: 'text-sky-700', 
        icon: 'text-sky-600' 
      },
      'gray': { 
        border: 'border-gray-200 hover:border-gray-400', 
        bg: 'bg-gray-50', 
        text: 'text-gray-700', 
        icon: 'text-gray-600' 
      },
      'violet': { 
        border: 'border-violet-200 hover:border-violet-400', 
        bg: 'bg-violet-50', 
        text: 'text-violet-700', 
        icon: 'text-violet-600' 
      },
    };
    
    return colorMap[color] || colorMap['blue'];
  };

  const colors = getColorClasses(specialty.color);

  const FeatureList = ({ features, categoryName, icon }: { 
    features: DashboardFeature[]; 
    categoryName: string; 
    icon: React.ReactNode 
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        {categoryName}
        <Badge variant="outline" className="text-xs">
          {features.length}
        </Badge>
      </div>
      <div className="space-y-1">
        {features.slice(0, 3).map((feature) => (
          <div key={feature.id} className="flex items-start gap-2 text-sm">
            <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
            <div>
              <span className="font-medium">{feature.name}</span>
              <p className="text-xs text-gray-600 mt-0.5">{feature.description}</p>
            </div>
          </div>
        ))}
        {features.length > 3 && (
          <div className="text-xs text-gray-500 italic">
            +{features.length - 3} características adicionales
          </div>
        )}
      </div>
    </div>
  );

  if (specialty.isComingSoon) {
    return (
      <Card className={cn(
        "relative transition-all duration-300 cursor-not-allowed opacity-75",
        "border-dashed border-2 border-gray-300 bg-gray-50"
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gray-100">
                <IconComponent className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-600">{specialty.name}</CardTitle>
                <CardDescription className="text-sm">
                  {specialty.description}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <Clock className="h-3 w-3 mr-1" />
              Próximamente
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-4">
              Estamos trabajando para traer esta especialidad muy pronto
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              disabled
              className="cursor-not-allowed"
            >
              <Info className="h-4 w-4 mr-2" />
              Notificarme cuando esté lista
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "relative transition-all duration-300 cursor-pointer",
      colors.border,
      isSelected 
        ? `${colors.bg} border-2 shadow-lg scale-105` 
        : "hover:shadow-md border",
      !isAvailable && "opacity-50 cursor-not-allowed"
    )}>
      {isSelected && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className={cn("rounded-full p-1", colors.bg)}>
            <CheckCircle className={cn("h-6 w-6", colors.icon)} />
          </div>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-xl", colors.bg)}>
              <IconComponent className={cn("h-6 w-6", colors.icon)} />
            </div>
            <div>
              <CardTitle className={cn("text-lg", colors.text)}>
                {specialty.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {specialty.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={onSelect}
              disabled={!isAvailable}
              className={cn(
                "transition-all duration-200",
                isSelected && `${colors.bg} ${colors.text} border-transparent`
              )}
            >
              {isSelected ? "Seleccionada" : "Seleccionar"}
            </Button>
            {specialty.id === 'general_medicine' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs"
              >
                {isExpanded ? (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Menos detalles
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-3 w-3 mr-1" />
                    Ver características
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Características expandibles - Solo para Medicina General */}
      {specialty.id === 'general_medicine' && isExpanded && (
        <CardContent className="pt-0">
          <div className="border-t pt-4">
            <ScrollArea className="h-80 pr-4">
              <div className="space-y-6">
                {/* Características Principales */}
                <FeatureList 
                  features={coreFeatures}
                  categoryName="Características Principales"
                  icon={<Star className="h-4 w-4 text-blue-500" />}
                />

                {/* Características Avanzadas */}
                <FeatureList 
                  features={advancedFeatures}
                  categoryName="Características Avanzadas"
                  icon={<Zap className="h-4 w-4 text-orange-500" />}
                />

                {/* Características Premium */}
                <FeatureList 
                  features={premiumFeatures}
                  categoryName="Características Premium"
                  icon={<Crown className="h-4 w-4 text-purple-500" />}
                />

                {/* Workflows de Ejemplo */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Flujos de Trabajo Incluidos
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Badge variant="outline" className="justify-start text-xs py-1">
                      📋 Chequeo de Rutina Completo
                    </Badge>
                    <Badge variant="outline" className="justify-start text-xs py-1">
                      🩺 Manejo de Enfermedad Crónica
                    </Badge>
                    <Badge variant="outline" className="justify-start text-xs py-1">
                      🚨 Atención de Urgencias
                    </Badge>
                  </div>
                </div>

                {/* Integraciones */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Integraciones Disponibles
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['Laboratorios', 'Farmacias', 'Seguros', 'Telemedicina'].map((integration) => (
                      <Badge key={integration} variant="secondary" className="text-xs">
                        {integration}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      )}

      {/* Otras especialidades - Vista simplificada */}
      {specialty.id !== 'general_medicine' && (
        <CardContent className="pt-0">
          <div className="text-center py-4">
            <Clock className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-3">
              Dashboard especializado en desarrollo
            </p>
            <div className="space-y-2">
              <Badge variant="outline" className="text-xs">
                Funcionalidades básicas disponibles
              </Badge>
              <p className="text-xs text-gray-500">
                Características avanzadas llegando pronto
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SpecialtyCard;
