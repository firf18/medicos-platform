/**
 * Verification Results Card Component - Red-Salud Platform
 * 
 * Componente especializado para mostrar los resultados detallados de verificación.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface VerificationSummary {
  isFullyVerified: boolean;
  verificationScore: number;
  completedChecks: string[];
  failedChecks: string[];
  warnings: string[];
}

interface VerificationResultsCardProps {
  summary: VerificationSummary;
  isVisible: boolean;
}

export function VerificationResultsCard({ summary, isVisible }: VerificationResultsCardProps) {
  if (!isVisible) return null;

  const { isFullyVerified, verificationScore, completedChecks, failedChecks, warnings } = summary;

  return (
    <Card className={`border-2 ${isFullyVerified ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center ${isFullyVerified ? 'text-green-800' : 'text-yellow-800'}`}>
          {isFullyVerified ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertTriangle className="h-5 w-5 mr-2" />
          )}
          {isFullyVerified ? 'Verificación Exitosa' : 'Verificación Parcial'}
          <Badge className={`ml-auto ${isFullyVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {verificationScore}% de confianza
          </Badge>
        </CardTitle>
        <CardDescription className={isFullyVerified ? 'text-green-700' : 'text-yellow-700'}>
          {isFullyVerified 
            ? 'Todos los checks de verificación han sido completados satisfactoriamente.'
            : 'La verificación se completó pero requiere revisión adicional.'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Checks completados */}
          {completedChecks.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Verificaciones Exitosas ({completedChecks.length})
              </h4>
              <div className="space-y-2">
                {completedChecks.map((check, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800 mr-2 mb-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {check}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Checks fallidos */}
          {failedChecks.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                Verificaciones Pendientes ({failedChecks.length})
              </h4>
              <div className="space-y-2">
                {failedChecks.map((check, index) => (
                  <Badge key={index} variant="destructive" className="mr-2 mb-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {check}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-600" />
              Observaciones ({warnings.length})
            </h4>
            <div className="space-y-1">
              {warnings.map((warning, index) => (
                <p key={index} className="text-sm text-gray-600 flex items-start">
                  <AlertTriangle className="h-3 w-3 mr-2 mt-0.5 text-yellow-500 flex-shrink-0" />
                  {warning}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
