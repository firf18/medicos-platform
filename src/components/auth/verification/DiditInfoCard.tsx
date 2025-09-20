/**
 * Didit Info Card Component - Red-Salud Platform
 * 
 * Componente especializado para mostrar información sobre Didit.me.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield,
  Camera,
  FileText,
  Search,
  Globe,
  MapPin,
  Award,
  User,
  Eye,
  Zap
} from 'lucide-react';

export function DiditInfoCard() {
  return (
    <>
      {/* Información sobre Didit.me */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Verificación Segura con Didit.me
          </CardTitle>
          <CardDescription>
            Didit.me es la plataforma de verificación de identidad líder mundial, utilizada por instituciones 
            médicas y financieras para verificar profesionales de la salud.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start space-x-3">
              <Camera className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Verificación Biométrica</h4>
                <p className="text-sm text-gray-600">Selfie con detección de vida real avanzada</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Validación de Documentos</h4>
                <p className="text-sm text-gray-600">Cédula profesional y de identidad venezolana</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Search className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Verificación AML</h4>
                <p className="text-sm text-gray-600">Cumplimiento anti-lavado de dinero</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Globe className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Estándares Globales</h4>
                <p className="text-sm text-gray-600">GDPR, ISO 27001, SOC 2 Type II</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información específica para médicos venezolanos */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Verificación para Médicos Venezolanos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div className="flex items-start space-x-2">
              <Award className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Cédula Profesional</p>
                <p>Validamos tu cédula profesional venezolana (MPPS, CMC, etc.)</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Cédula de Identidad</p>
                <p>Verificamos tu cédula de identidad venezolana (V- o E-)</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Eye className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Verificación Biométrica</p>
                <p>Comparamos tu rostro con la foto de tu documento</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Zap className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Proceso Rápido</p>
                <p>Verificación completa en menos de 5 minutos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
