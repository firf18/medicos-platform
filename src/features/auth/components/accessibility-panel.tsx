'use client';

import { useAccessibility } from '@/features/auth/hooks/use-accessibility';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Contrast, Move, Type } from 'lucide-react';

export function AccessibilityPanel() {
  const {
    isHighContrast,
    isReducedMotion,
    fontSize,
    toggleHighContrast,
    setReducedMotion,
    changeFontSize
  } = useAccessibility();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Contrast className="h-5 w-5" />
          Accesibilidad
        </CardTitle>
        <CardDescription>
          Configura las opciones de accesibilidad para mejorar tu experiencia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Contrast className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="high-contrast" className="font-medium">
              Alto contraste
            </Label>
          </div>
          <Switch
            id="high-contrast"
            checked={isHighContrast}
            onCheckedChange={toggleHighContrast}
            aria-label="Alternar modo de alto contraste"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Move className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="reduced-motion" className="font-medium">
              Movimiento reducido
            </Label>
          </div>
          <Switch
            id="reduced-motion"
            checked={isReducedMotion}
            onCheckedChange={setReducedMotion}
            aria-label="Alternar movimiento reducido"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Type className="h-4 w-4 text-muted-foreground" />
            <Label className="font-medium">
              Tamaño de texto
            </Label>
          </div>
          <Select value={fontSize} onValueChange={changeFontSize}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequeño</SelectItem>
              <SelectItem value="medium">Mediano</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}