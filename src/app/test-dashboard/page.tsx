'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Stethoscope, ArrowRight, User } from 'lucide-react';

export default function TestDashboardPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const specialties = [
    { id: 'medicina-general', name: 'Medicina General', description: 'Atención médica integral', icon: '🩺' },
    { id: 'cardiologia', name: 'Cardiología', description: 'Especialista en corazón', icon: '❤️' },
    { id: 'pediatria', name: 'Pediatría', description: 'Atención infantil', icon: '👶' },
    { id: 'dermatologia', name: 'Dermatología', description: 'Cuidado de la piel', icon: '🔬' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏥 Test Dashboard - Red-Salud
          </h1>
          <p className="text-gray-600">
            Selecciona una especialidad para probar su dashboard personalizado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {specialties.map((specialty) => (
            <Card 
              key={specialty.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedSpecialty === specialty.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => setSelectedSpecialty(specialty.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <span className="text-2xl">{specialty.icon}</span>
                  <span>{specialty.name}</span>
                </CardTitle>
                <CardDescription>{specialty.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Badge variant={specialty.id === 'medicina-general' ? 'default' : 'secondary'}>
                    {specialty.id === 'medicina-general' ? 'Disponible' : 'Próximamente'}
                  </Badge>
                  {specialty.id === 'medicina-general' && (
                    <Link href={`/dashboard/${specialty.id}`}>
                      <Button size="sm">
                        Ver Dashboard
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard de Medicina General */}
        {selectedSpecialty === 'medicina-general' && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <Stethoscope className="h-5 w-5 mr-2" />
                Dashboard de Medicina General - ✅ Completado
              </CardTitle>
              <CardDescription className="text-green-700">
                Dashboard especializado completamente funcional con todos los widgets médicos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-medium text-green-800">Widgets incluidos:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>❤️ Monitor de Signos Vitales</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>🛡️ Alertas Preventivas</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>👥 Lista de Pacientes</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>📅 Agenda de Citas</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>🔔 Notificaciones</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>📊 Analytics Avanzados</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-green-200">
                  <Link href="/dashboard/medicina-general">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Abrir Dashboard de Medicina General
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información sobre otros dashboards */}
        {selectedSpecialty && selectedSpecialty !== 'medicina-general' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">
                Dashboard de {specialties.find(s => s.id === selectedSpecialty)?.name} - 🚧 En desarrollo
              </CardTitle>
              <CardDescription className="text-yellow-700">
                Este dashboard estará disponible próximamente con características específicas para la especialidad.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-700">
                El dashboard de {specialties.find(s => s.id === selectedSpecialty)?.name} incluirá widgets 
                especializados y herramientas específicas para esta área médica.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Enlaces útiles */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium text-gray-900 mb-1">Registro Médico</h4>
              <p className="text-xs text-gray-600 mb-3">
                Completa el registro con especialidad
              </p>
              <Link href="/auth/register/doctor">
                <Button size="sm" variant="outline" className="w-full">
                  Ir al Registro
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Stethoscope className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium text-gray-900 mb-1">Dashboard Directo</h4>
              <p className="text-xs text-gray-600 mb-3">
                Acceso directo al dashboard
              </p>
              <Link href="/dashboard/medicina-general">
                <Button size="sm" variant="outline" className="w-full">
                  Ver Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Badge className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium text-gray-900 mb-1">Inicio</h4>
              <p className="text-xs text-gray-600 mb-3">
                Volver a la página principal
              </p>
              <Link href="/">
                <Button size="sm" variant="outline" className="w-full">
                  Ir al Inicio
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
