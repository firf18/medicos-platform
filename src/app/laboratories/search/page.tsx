import React from 'react';
import { LaboratorySearch } from '@/components/laboratory/LaboratorySearch';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buscar Laboratorios | Platform Médicos',
  description: 'Encuentre laboratorios médicos verificados en Venezuela. Búsqueda por ubicación, especialidad y tipo de laboratorio.',
};

export default function LaboratorySearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Laboratorios Médicos en Venezuela
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encuentre laboratorios médicos verificados y certificados en todo el país. 
            Todos nuestros laboratorios cumplen con las regulaciones sanitarias venezolanas.
          </p>
        </div>
        
        <LaboratorySearch 
          onLaboratorySelect={(laboratory) => {
            // Navigate to laboratory details
            window.location.href = `/laboratories/${laboratory.id}`;
          }}
          showFilters={true}
          limit={20}
        />
      </div>
    </div>
  );
}
