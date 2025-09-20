/**
 * Laboratory Icons Component - Red-Salud Platform
 * 
 * Componentes de iconos específicos para el dominio de laboratorio médico.
 * Separado de utilities para cumplir con principio de responsabilidad única.
 */

import React from 'react';
import { 
  CheckCircle, 
  TestTube, 
  Send, 
  Upload, 
  Clock,
  AlertTriangle,
  XCircle,
  Pause
} from 'lucide-react';
import { TestStatus, TestPriority } from '@/types/laboratory.types';

// ============================================================================
// COMPONENTES DE ICONOS
// ============================================================================

interface IconProps {
  className?: string;
}

export function getStatusIcon(status: TestStatus, iconProps: IconProps = { className: "h-4 w-4" }) {
  switch (status) {
    case 'completed':
    case 'reviewed':
      return <CheckCircle {...iconProps} />;
    case 'processing':
      return <TestTube {...iconProps} />;
    case 'sent':
      return <Send {...iconProps} />;
    case 'received':
    case 'registered':
      return <Upload {...iconProps} />;
    case 'rejected':
      return <XCircle {...iconProps} />;
    case 'pending':
      return <Clock {...iconProps} />;
    case 'cancelled':
      return <Pause {...iconProps} />;
    default:
      return <Clock {...iconProps} />;
  }
}

export function getPriorityIcon(priority: TestPriority, iconProps: IconProps = { className: "h-4 w-4" }) {
  switch (priority) {
    case 'urgent':
    case 'high':
      return <AlertTriangle {...iconProps} />;
    case 'normal':
    case 'low':
      return <Clock {...iconProps} />;
    default:
      return <Clock {...iconProps} />;
  }
}

// Componentes específicos para uso directo
export const StatusIcon: React.FC<{ status: TestStatus; className?: string }> = ({ 
  status, 
  className = "h-4 w-4" 
}) => {
  return getStatusIcon(status, { className });
};

export const PriorityIcon: React.FC<{ priority: TestPriority; className?: string }> = ({ 
  priority, 
  className = "h-4 w-4" 
}) => {
  return getPriorityIcon(priority, { className });
};
