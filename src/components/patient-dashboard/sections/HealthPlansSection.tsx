"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import { Badge } from "../../ui/badge";
import {
  Target,
  TrendingUp,
  Calendar,
  Award,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface HealthGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  status: "active" | "completed" | "overdue";
  category: "weight" | "exercise" | "medication" | "lifestyle";
}

interface TreatmentPlan {
  id: string;
  name: string;
  doctor: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: "active" | "completed" | "paused";
  nextStep: string;
  totalSteps: number;
  completedSteps: number;
}

const mockHealthGoals: HealthGoal[] = [
  {
    id: "1",
    title: "Reducir Peso",
    description: "Perder 5kg en 3 meses",
    targetValue: 75,
    currentValue: 78,
    unit: "kg",
    deadline: "2024-04-15",
    status: "active",
    category: "weight",
  },
  {
    id: "2",
    title: "Ejercicio Semanal",
    description: "Realizar 150 minutos de ejercicio por semana",
    targetValue: 150,
    currentValue: 120,
    unit: "min",
    deadline: "2024-12-31",
    status: "active",
    category: "exercise",
  },
  {
    id: "3",
    title: "Adherencia Medicación",
    description: "Tomar medicación diaria sin faltas",
    targetValue: 100,
    currentValue: 95,
    unit: "%",
    deadline: "2024-12-31",
    status: "active",
    category: "medication",
  },
];

const mockTreatmentPlans: TreatmentPlan[] = [
  {
    id: "1",
    name: "Plan de Rehabilitación Cardíaca",
    doctor: "Dr. García Martínez",
    startDate: "2024-01-15",
    endDate: "2024-04-15",
    progress: 65,
    status: "active",
    nextStep: "Sesión de fisioterapia - Miércoles 10:00",
    totalSteps: 12,
    completedSteps: 8,
  },
  {
    id: "2",
    name: "Control de Diabetes",
    doctor: "Dra. López Ruiz",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    progress: 40,
    status: "active",
    nextStep: "Análisis de glucosa - Próxima semana",
    totalSteps: 24,
    completedSteps: 10,
  },
];

interface HealthPlansSectionProps {
  userId: string;
}

export default function HealthPlansSection({ userId }: HealthPlansSectionProps) {
  const [activeTab, setActiveTab] = useState<"goals" | "treatments">("goals");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "active":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "weight":
        return <TrendingUp className="h-4 w-4" />;
      case "exercise":
        return <Target className="h-4 w-4" />;
      case "medication":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Planes de Salud</h2>
          <p className="text-gray-600">Gestiona tus objetivos y tratamientos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Plan
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("goals")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "goals"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Objetivos de Salud
        </button>
        <button
          onClick={() => setActiveTab("treatments")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "treatments"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Planes de Tratamiento
        </button>
      </div>

      {/* Content */}
      {activeTab === "goals" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockHealthGoals.map((goal) => {
            const progressPercentage = Math.min(
              (goal.currentValue / goal.targetValue) * 100,
              100
            );
            const isReverse = goal.category === "weight"; // Para peso, menos es mejor
            const displayProgress = isReverse
              ? Math.max(
                  0,
                  100 -
                    ((goal.currentValue - goal.targetValue) /
                      goal.targetValue) *
                      100
                )
              : progressPercentage;

            return (
              <Card key={goal.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(goal.category)}
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(goal.status)}>
                      {getStatusIcon(goal.status)}
                      <span className="ml-1 capitalize">{goal.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{goal.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso</span>
                      <span className="font-medium">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <Progress value={displayProgress} className="h-2" />
                    <div className="text-xs text-gray-500">
                      {Math.round(displayProgress)}% completado
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Fecha límite:</span>
                    <span className="font-medium">
                      {new Date(goal.deadline).toLocaleDateString("es-ES")}
                    </span>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "treatments" && (
        <div className="space-y-4">
          {mockTreatmentPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <p className="text-gray-600">Dr. {plan.doctor}</p>
                  </div>
                  <Badge className={getStatusColor(plan.status)}>
                    {getStatusIcon(plan.status)}
                    <span className="ml-1 capitalize">{plan.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Inicio:</span>
                    <p className="font-medium">
                      {new Date(plan.startDate).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Fin estimado:</span>
                    <p className="font-medium">
                      {new Date(plan.endDate).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso del tratamiento</span>
                    <span className="font-medium">{plan.progress}%</span>
                  </div>
                  <Progress value={plan.progress} className="h-2" />
                  <div className="text-xs text-gray-500">
                    {plan.completedSteps} de {plan.totalSteps} pasos completados
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Próximo paso:
                    </span>
                  </div>
                  <p className="text-sm text-blue-800 mt-1">{plan.nextStep}</p>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Ver Cronograma
                  </Button>
                  <Button size="sm" className="flex-1">
                    Contactar Doctor
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Achievement Section */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-900">Logros Recientes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center space-x-3 bg-white p-3 rounded-lg">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm">7 días consecutivos</p>
                <p className="text-xs text-gray-600">Tomando medicación</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white p-3 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Meta semanal</p>
                <p className="text-xs text-gray-600">150 min de ejercicio</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white p-3 rounded-lg">
              <div className="bg-purple-100 p-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Mejora constante</p>
                <p className="text-xs text-gray-600">Presión arterial</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
