import React from 'react';
import { LaboratorySearch } from '@/components/laboratory/LaboratorySearch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  CheckCircle, 
  Users, 
  Shield, 
  Clock,
  ArrowRight,
  Star
} from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Laboratorios Médicos en Venezuela | Platform Médicos',
  description: 'Encuentre laboratorios médicos verificados y certificados en Venezuela. Búsqueda por ubicación, especialidad y tipo de laboratorio.',
  keywords: 'laboratorios médicos, Venezuela, análisis clínicos, patología, medicina',
};

export default function LaboratorySearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Laboratorios Médicos en Venezuela
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Encuentre laboratorios médicos verificados y certificados en todo el país. 
              Todos nuestros laboratorios cumplen con las regulaciones sanitarias venezolanas.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">500+</h3>
                <p className="text-gray-600">Laboratorios Registrados</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">100%</h3>
                <p className="text-gray-600">Verificados</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">24</h3>
                <p className="text-gray-600">Estados Cubiertos</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">24/7</h3>
                <p className="text-gray-600">Soporte</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Search className="mr-2 h-5 w-5" />
                Buscar Laboratorios
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-3"
                onClick={() => window.location.href = '/laboratories/register'}
              >
                Registrar Laboratorio
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Por qué elegir nuestros laboratorios?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Todos los laboratorios en nuestra plataforma han sido verificados y cumplen con los más altos estándares de calidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Verificación Completa</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Todos los laboratorios son verificados por nuestro equipo de expertos, 
                incluyendo documentación legal, licencias sanitarias y certificaciones.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Cumplimiento Regulatorio</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Cumplimos con todas las regulaciones sanitarias venezolanas y 
                estándares internacionales de calidad en laboratorios médicos.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Información Actualizada</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Mantenemos información actualizada sobre horarios, servicios, 
                especialidades y datos de contacto de cada laboratorio.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <div id="search-section">
          <LaboratorySearch 
            onLaboratorySelect={(laboratory) => {
              window.location.href = `/laboratories/${laboratory.id}`;
            }}
            showFilters={true}
            limit={20}
          />
        </div>
      </div>

      {/* Popular Categories */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Especialidades Populares
            </h2>
            <p className="text-lg text-gray-600">
              Encuentre laboratorios especializados en diferentes áreas médicas
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              'Análisis Clínicos',
              'Patología',
              'Microbiología',
              'Hematología',
              'Bioquímica',
              'Inmunología',
              'Genética',
              'Toxicología',
              'Endocrinología',
              'Cardiología',
              'Oncología',
              'Pediatría'
            ].map((specialty) => (
              <Button
                key={specialty}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => {
                  // Filter by specialty
                  const searchComponent = document.querySelector('[data-search-component]');
                  if (searchComponent) {
                    // Trigger search with specialty filter
                    window.location.href = `/laboratories/search?specialty=${encodeURIComponent(specialty)}`;
                  }
                }}
              >
                <div className="text-sm font-medium text-center">{specialty}</div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros usuarios
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Dr. María González',
                role: 'Médico General',
                location: 'Caracas',
                content: 'Excelente plataforma para encontrar laboratorios confiables. La verificación es rigurosa y la información siempre está actualizada.',
                rating: 5
              },
              {
                name: 'Dr. Carlos Rodríguez',
                role: 'Patólogo',
                location: 'Valencia',
                content: 'Como profesional médico, valoro mucho la calidad de los laboratorios verificados. Es una herramienta indispensable.',
                rating: 5
              },
              {
                name: 'Ana Martínez',
                role: 'Paciente',
                location: 'Maracaibo',
                content: 'Fácil de usar y muy confiable. Encontré el laboratorio perfecto cerca de mi casa con todos los servicios que necesitaba.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Tienes un laboratorio médico?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a nuestra red de laboratorios verificados y llega a más pacientes en toda Venezuela.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
              onClick={() => window.location.href = '/laboratories/register'}
            >
              Registrar Mi Laboratorio
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3"
              onClick={() => window.location.href = '/contact'}
            >
              Más Información
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
