/**
 * Lab Tests Table Component - Red-Salud Platform
 * 
 * Componente especializado para mostrar tabla de tests de laboratorio.
 * Cumple con compliance HIPAA y principio de responsabilidad única.
 */

'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  MoreVertical, 
  Eye, 
  Play, 
  Send,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { LabTest, TestStatus, SortConfig } from '@/types/laboratory.types';
import { 
  getPriorityColor, 
  getStatusColor, 
  getPriorityText, 
  getStatusText,
  formatTestDate,
  calculateTimeRemaining,
  canChangeStatus
} from '@/lib/laboratory/lab-utils';
import { getStatusIcon } from './LabIcons';

// ============================================================================
// INTERFACES
// ============================================================================

interface LabTestsTableProps {
  tests: LabTest[];
  loading?: boolean;
  onTestClick?: (test: LabTest) => void;
  onStatusChange?: (testId: string, newStatus: TestStatus) => void;
  onDeleteTest?: (testId: string) => void;
  className?: string;
}

interface ActionMenuProps {
  test: LabTest;
  onView: () => void;
  onProcess: () => void;
  onSend: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

interface TableHeaderProps {
  label: string;
  sortKey: keyof LabTest;
  sortConfig: SortConfig | null;
  onSort: (key: keyof LabTest) => void;
  className?: string;
}

// ============================================================================
// COMPONENTE DE HEADER ORDENABLE
// ============================================================================

function TableHeader({ label, sortKey, sortConfig, onSort, className = '' }: TableHeaderProps) {
  const isSorted = sortConfig?.key === sortKey;
  const sortDirection = isSorted ? sortConfig?.direction : null;
  
  return (
    <th 
      className={`
        px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
        cursor-pointer hover:bg-gray-100 transition-colors duration-150
        ${className}
      `}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <div className="flex flex-col">
          <ChevronUp 
            className={`h-3 w-3 ${
              isSorted && sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'
            }`} 
          />
          <ChevronDown 
            className={`h-3 w-3 -mt-1 ${
              isSorted && sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'
            }`} 
          />
        </div>
      </div>
    </th>
  );
}

// ============================================================================
// COMPONENTE DE MENÚ DE ACCIONES
// ============================================================================

function ActionMenu({ test, onView, onProcess, onSend, onEdit, onDelete }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const canProcess = canChangeStatus(test.status, 'processing');
  const canSend = test.status === 'completed' || test.status === 'reviewed';
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-150"
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>
      
      {isOpen && (
        <>
          {/* Overlay para cerrar el menú */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menú de acciones */}
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
            <div className="py-1">
              <button
                onClick={() => { onView(); setIsOpen(false); }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver detalles
              </button>
              
              {canProcess && (
                <button
                  onClick={() => { onProcess(); setIsOpen(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Procesar
                </button>
              )}
              
              {canSend && (
                <button
                  onClick={() => { onSend(); setIsOpen(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar resultado
                </button>
              )}
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button
                onClick={() => { onEdit(); setIsOpen(false); }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </button>
              
              <button
                onClick={() => { onDelete(); setIsOpen(false); }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE DE FILA DE TEST
// ============================================================================

interface TestRowProps {
  test: LabTest;
  onTestClick?: (test: LabTest) => void;
  onStatusChange?: (testId: string, newStatus: TestStatus) => void;
  onDeleteTest?: (testId: string) => void;
}

function TestRow({ test, onTestClick, onStatusChange, onDeleteTest }: TestRowProps) {
  const timeRemaining = calculateTimeRemaining(test.expected_completion);
  
  const handleView = () => onTestClick?.(test);
  const handleProcess = () => onStatusChange?.(test.id, 'processing');
  const handleSend = () => onStatusChange?.(test.id, 'sent');
  const handleEdit = () => onTestClick?.(test);
  const handleDelete = () => onDeleteTest?.(test.id);
  
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      {/* Información del paciente y test */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {test.patient_name}
          </div>
          <div className="text-sm text-gray-600">
            {test.test_type}
          </div>
          {test.sample_id && (
            <div className="text-xs text-gray-500 mt-1">
              ID: {test.sample_id}
            </div>
          )}
          {test.notes && (
            <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
              📝 {test.notes}
            </div>
          )}
        </div>
      </td>
      
      {/* Médico solicitante */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {test.doctor_name}
      </td>
      
      {/* Prioridad */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`
          inline-flex px-2 py-1 text-xs font-semibold rounded-full border
          ${getPriorityColor(test.priority)}
        `}>
          {getPriorityText(test.priority)}
        </span>
      </td>
      
      {/* Estado */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`
          inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border
          ${getStatusColor(test.status)}
        `}>
          {getStatusIcon(test.status)}
          <span className="ml-1">{getStatusText(test.status)}</span>
        </span>
      </td>
      
      {/* Tiempos */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        <div className="space-y-1">
          <div>
            <span className="text-xs text-gray-500">Recibido:</span>
            <br />
            {formatTestDate(test.created_at, true)}
          </div>
          <div>
            <span className="text-xs text-gray-500">Esperado:</span>
            <br />
            {formatTestDate(test.expected_completion, true)}
          </div>
          <div className={`text-xs font-medium ${
            timeRemaining.isOverdue ? 'text-red-600' : 
            timeRemaining.urgency === 'high' ? 'text-orange-600' : 'text-gray-600'
          }`}>
            {timeRemaining.isOverdue && <AlertCircle className="h-3 w-3 inline mr-1" />}
            {timeRemaining.text}
          </div>
        </div>
      </td>
      
      {/* Acciones */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <ActionMenu
          test={test}
          onView={handleView}
          onProcess={handleProcess}
          onSend={handleSend}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </td>
    </tr>
  );
}

// ============================================================================
// COMPONENTE SKELETON PARA LOADING
// ============================================================================

function TableSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: 6 }).map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function LabTestsTable({
  tests,
  loading = false,
  onTestClick,
  onStatusChange,
  onDeleteTest,
  className = ''
}: LabTestsTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  // Ordenamiento de los tests
  const sortedTests = useMemo(() => {
    if (!sortConfig) return tests;
    
    return [...tests].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Manejo especial para fechas
      if (sortConfig.key === 'created_at' || sortConfig.key === 'expected_completion') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }
      
      // Manejo especial para prioridad
      if (sortConfig.key === 'priority') {
        const priorityOrder = { urgent: 5, stat: 4, high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[aValue as keyof typeof priorityOrder];
        bValue = priorityOrder[bValue as keyof typeof priorityOrder];
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [tests, sortConfig]);
  
  const handleSort = (key: keyof LabTest) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  if (loading) {
    return <TableSkeleton />;
  }
  
  if (tests.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-12 text-center ${className}`}>
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No se encontraron análisis
        </h3>
        <p className="text-gray-500">
          No hay análisis que coincidan con los filtros aplicados.
        </p>
      </div>
    );
  }
  
  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <TableHeader
                label="Paciente / Análisis"
                sortKey="patient_name"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <TableHeader
                label="Médico"
                sortKey="doctor_name"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <TableHeader
                label="Prioridad"
                sortKey="priority"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <TableHeader
                label="Estado"
                sortKey="status"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <TableHeader
                label="Tiempos"
                sortKey="created_at"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTests.map((test) => (
              <TestRow
                key={test.id}
                test={test}
                onTestClick={onTestClick}
                onStatusChange={onStatusChange}
                onDeleteTest={onDeleteTest}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer con información adicional */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Mostrando {sortedTests.length} análisis
          </span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
              Urgente
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
              Vencido
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              A tiempo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
