'use client';

import React, { useState } from 'react';

const DiditTestComponent: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setTestResult('Ejecutando prueba de Didit...');
    
    try {
      // Simular prueba de Didit
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResult('Prueba completada exitosamente');
    } catch (error) {
      setTestResult('Error en la prueba: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Prueba de Integración Didit</h2>
      
      <button
        onClick={runTest}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Ejecutando...' : 'Ejecutar Prueba'}
      </button>
      
      {testResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>{testResult}</p>
        </div>
      )}
    </div>
  );
};

export default DiditTestComponent;
