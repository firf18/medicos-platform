'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, Phone, Mail } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  isAvailable: boolean;
}

interface DoctorsListProps {
  doctors: Doctor[];
}

export function DoctorsList({ doctors }: DoctorsListProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Stethoscope className="mr-2 h-5 w-5" />
          Médicos Asociados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {doctors.map((doctor) => (
            <div 
              key={doctor.id} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div>
                <h3 className="font-medium">{doctor.name}</h3>
                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                <div className="flex items-center mt-1 text-sm">
                  <Phone className="mr-1 h-3 w-3" />
                  <span className="mr-3">{doctor.phone}</span>
                  <Mail className="mr-1 h-3 w-3" />
                  <span>{doctor.email}</span>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  doctor.isAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {doctor.isAvailable ? 'Disponible' : 'No disponible'}
                </span>
                <Button variant="outline" size="sm" className="ml-4">
                  Ver detalles
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
