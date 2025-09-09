"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Plus,
  FileText,
  User,
} from "lucide-react";

interface SecondOpinionRequest {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_review" | "completed";
  requestDate: string;
  responseDate?: string;
  doctorName?: string;
  specialty: string;
  priority: "low" | "medium" | "high";
}

const mockRequests: SecondOpinionRequest[] = [
  {
    id: "1",
    title: "Revisión de Diagnóstico Cardíaco",
    description: "Solicito segunda opinión sobre diagnóstico de arritmia",
    status: "completed",
    requestDate: "2024-01-10",
    responseDate: "2024-01-15",
    doctorName: "Dr. Martínez López",
    specialty: "Cardiología",
    priority: "high",
  },
  {
    id: "2",
    title: "Evaluación de Tratamiento Oncológico",
    description: "Segunda opinión sobre plan de tratamiento propuesto",
    status: "in_review",
    requestDate: "2024-01-20",
    specialty: "Oncología",
    priority: "high",
  },
];

interface SecondOpinionSectionProps {
  userId: string;
}

export default function SecondOpinionSection({ userId }: SecondOpinionSectionProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_review":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "in_review":
        return <Clock className="h-4 w-4" />;
      case "pending":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Segunda Opinión</h2>
          <p className="text-gray-600">
            Solicita opiniones médicas adicionales para tus casos
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {mockRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <p className="text-sm text-gray-600">{request.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(request.priority)}>
                    {request.priority.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusIcon(request.status)}
                    <span className="ml-1 capitalize">
                      {request.status.replace("_", " ")}
                    </span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{request.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Fecha de solicitud:</span>
                  <p className="font-medium">
                    {new Date(request.requestDate).toLocaleDateString("es-ES")}
                  </p>
                </div>
                {request.responseDate && (
                  <div>
                    <span className="text-gray-600">Fecha de respuesta:</span>
                    <p className="font-medium">
                      {new Date(request.responseDate).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                )}
              </div>

              {request.doctorName && (
                <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Revisado por: {request.doctorName}
                    </p>
                    <p className="text-xs text-blue-700">{request.specialty}</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Detalles
                </Button>
                {request.status === "completed" && (
                  <Button size="sm" className="flex-1">
                    Ver Respuesta
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">
            ¿Cómo funciona la Segunda Opinión?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ul className="space-y-2 text-sm">
            <li>• Envía tu caso médico con toda la documentación relevante</li>
            <li>• Un especialista independiente revisará tu caso</li>
            <li>• Recibirás una opinión médica detallada en 3-5 días hábiles</li>
            <li>• Puedes discutir los resultados con tu médico tratante</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}