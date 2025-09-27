/**
 * Sistema de Reportes y Documentación Automática
 * Generación automática de reportes, expedientes y documentación médica
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Download, 
  Upload, 
  Printer, 
  Eye, 
  Edit,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Pill,
  Heart,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Settings,
  Filter,
  Search,
  Plus,
  Trash2,
  Share,
  Mail,
  MessageSquare
} from 'lucide-react';

interface MedicalReport {
  id: string;
  type: 'consultation' | 'lab_result' | 'prescription' | 'discharge' | 'follow_up' | 'emergency';
  title: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  status: 'draft' | 'completed' | 'signed' | 'archived';
  content: {
    chiefComplaint?: string;
    historyOfPresentIllness?: string;
    physicalExamination?: string;
    assessment?: string;
    plan?: string;
    medications?: any[];
    vitalSigns?: any;
    labResults?: any[];
    followUpInstructions?: string;
  };
  attachments?: string[];
  isTemplate?: boolean;
  templateId?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  specialty: string;
  sections: string[];
  isDefault: boolean;
  usageCount: number;
}

export default function AutomatedReportsWidget() {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadReports();
    loadTemplates();
  }, []);

  const loadReports = async () => {
    // Simular carga de reportes
    const mockReports: MedicalReport[] = [
      {
        id: '1',
        type: 'consultation',
        title: 'Consulta de Medicina General - María González',
        patientId: 'patient-1',
        patientName: 'María González',
        doctorId: 'doctor-1',
        doctorName: 'Dr. Juan Pérez',
        date: new Date().toISOString(),
        status: 'completed',
        content: {
          chiefComplaint: 'Dolor de cabeza y mareos',
          historyOfPresentIllness: 'Paciente refiere cefalea de 3 días de evolución, asociada a mareos ocasionales',
          physicalExamination: 'PA: 140/90 mmHg, FC: 85 lpm, Temp: 36.8°C',
          assessment: 'Hipertensión arterial no controlada',
          plan: 'Ajustar medicación antihipertensiva, control en 2 semanas',
          medications: [
            { name: 'Losartán', dosage: '50mg', frequency: '1x día' }
          ],
          vitalSigns: {
            bloodPressure: { systolic: 140, diastolic: 90 },
            heartRate: 85,
            temperature: 36.8
          }
        }
      },
      {
        id: '2',
        type: 'lab_result',
        title: 'Resultados de Laboratorio - Juan Pérez',
        patientId: 'patient-2',
        patientName: 'Juan Pérez',
        doctorId: 'doctor-1',
        doctorName: 'Dr. Juan Pérez',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'signed',
        content: {
          labResults: [
            { test: 'Glucosa', value: '95', unit: 'mg/dL', normal: true },
            { test: 'Colesterol Total', value: '220', unit: 'mg/dL', normal: false },
            { test: 'Triglicéridos', value: '180', unit: 'mg/dL', normal: false }
          ]
        }
      },
      {
        id: '3',
        type: 'prescription',
        title: 'Receta Médica - Ana Rodríguez',
        patientId: 'patient-3',
        patientName: 'Ana Rodríguez',
        doctorId: 'doctor-1',
        doctorName: 'Dr. Juan Pérez',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        content: {
          medications: [
            { name: 'Metformina', dosage: '500mg', frequency: '2x día', instructions: 'Con las comidas' },
            { name: 'Atorvastatina', dosage: '20mg', frequency: '1x día', instructions: 'En la noche' }
          ]
        }
      }
    ];

    setReports(mockReports);
  };

  const loadTemplates = async () => {
    const mockTemplates: ReportTemplate[] = [
      {
        id: '1',
        name: 'Consulta General',
        type: 'consultation',
        specialty: 'Medicina General',
        sections: ['chiefComplaint', 'historyOfPresentIllness', 'physicalExamination', 'assessment', 'plan'],
        isDefault: true,
        usageCount: 45
      },
      {
        id: '2',
        name: 'Consulta de Seguimiento',
        type: 'follow_up',
        specialty: 'Medicina General',
        sections: ['chiefComplaint', 'physicalExamination', 'assessment', 'plan'],
        isDefault: false,
        usageCount: 23
      },
      {
        id: '3',
        name: 'Receta Estándar',
        type: 'prescription',
        specialty: 'Medicina General',
        sections: ['medications', 'instructions'],
        isDefault: true,
        usageCount: 67
      }
    ];

    setTemplates(mockTemplates);
  };

  const generateReport = async (templateId: string, patientId: string) => {
    setIsGenerating(true);
    
    // Simular generación de reporte
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newReport: MedicalReport = {
      id: Date.now().toString(),
      type: template.type as any,
      title: `${template.name} - Paciente ${patientId}`,
      patientId,
      patientName: 'Paciente Nuevo',
      doctorId: 'current-doctor',
      doctorName: 'Dr. Actual',
      date: new Date().toISOString(),
      status: 'draft',
      content: {},
      isTemplate: false,
      templateId
    };

    setReports(prev => [newReport, ...prev]);
    setIsGenerating(false);
  };

  const exportReport = (reportId: string, format: 'pdf' | 'docx' | 'html') => {
    console.log(`Exporting report ${reportId} as ${format}`);
    // Implementar exportación real
  };

  const shareReport = (reportId: string) => {
    console.log(`Sharing report ${reportId}`);
    // Implementar compartir reporte
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      completed: 'default',
      signed: 'outline',
      archived: 'destructive'
    } as const;

    const colors = {
      draft: 'text-gray-600',
      completed: 'text-green-600',
      signed: 'text-blue-600',
      archived: 'text-red-600'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status === 'draft' ? 'Borrador' :
         status === 'completed' ? 'Completado' :
         status === 'signed' ? 'Firmado' : 'Archivado'}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <Stethoscope className="h-4 w-4" />;
      case 'lab_result':
        return <Activity className="h-4 w-4" />;
      case 'prescription':
        return <Pill className="h-4 w-4" />;
      case 'discharge':
        return <CheckCircle className="h-4 w-4" />;
      case 'follow_up':
        return <Calendar className="h-4 w-4" />;
      case 'emergency':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Reportes y Documentación Automática
              </CardTitle>
              <CardDescription>
                Generación automática de reportes médicos y documentación
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setShowTemplates(!showTemplates)}>
                <Plus className="h-4 w-4 mr-1" />
                Nuevo Reporte
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar reportes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="consultation">Consultas</SelectItem>
                <SelectItem value="lab_result">Resultados de Lab</SelectItem>
                <SelectItem value="prescription">Recetas</SelectItem>
                <SelectItem value="discharge">Alta Médica</SelectItem>
                <SelectItem value="follow_up">Seguimiento</SelectItem>
                <SelectItem value="emergency">Emergencias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Plantillas de Reportes */}
      {showTemplates && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Plantillas de Reportes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    {template.isDefault && (
                      <Badge variant="outline">Por defecto</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{template.specialty}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {template.usageCount} usos
                    </span>
                    <Button 
                      size="sm"
                      onClick={() => generateReport(template.id, 'current-patient')}
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Generando...' : 'Usar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Reportes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Reportes Recientes
            </div>
            <Badge variant="secondary">{filteredReports.length} reportes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(report.type)}
                    <div>
                      <h4 className="font-medium">{report.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <User className="h-3 w-3" />
                        <span>{report.patientName}</span>
                        <Clock className="h-3 w-3" />
                        <span>{new Date(report.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(report.status)}
                    <Badge variant="outline">{report.type}</Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportReport(report.id, 'pdf')}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => shareReport(report.id)}>
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reportes Hoy</p>
                <p className="text-2xl font-bold text-blue-600">12</p>
                <p className="text-xs text-gray-500">+3 vs ayer</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-green-600">8min</p>
                <p className="text-xs text-gray-500">por reporte</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Plantillas</p>
                <p className="text-2xl font-bold text-purple-600">{templates.length}</p>
                <p className="text-xs text-gray-500">disponibles</p>
              </div>
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eficiencia</p>
                <p className="text-2xl font-bold text-orange-600">94%</p>
                <p className="text-xs text-gray-500">automatización</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reporte Detallado */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                {getTypeIcon(selectedReport.type)}
                <span className="ml-2">{selectedReport.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(selectedReport.status)}
                <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedReport.content.chiefComplaint && (
                <div>
                  <h4 className="font-medium mb-2">Motivo de Consulta:</h4>
                  <p className="text-sm text-gray-700">{selectedReport.content.chiefComplaint}</p>
                </div>
              )}
              
              {selectedReport.content.historyOfPresentIllness && (
                <div>
                  <h4 className="font-medium mb-2">Historia de la Enfermedad Actual:</h4>
                  <p className="text-sm text-gray-700">{selectedReport.content.historyOfPresentIllness}</p>
                </div>
              )}
              
              {selectedReport.content.physicalExamination && (
                <div>
                  <h4 className="font-medium mb-2">Examen Físico:</h4>
                  <p className="text-sm text-gray-700">{selectedReport.content.physicalExamination}</p>
                </div>
              )}
              
              {selectedReport.content.assessment && (
                <div>
                  <h4 className="font-medium mb-2">Evaluación:</h4>
                  <p className="text-sm text-gray-700">{selectedReport.content.assessment}</p>
                </div>
              )}
              
              {selectedReport.content.plan && (
                <div>
                  <h4 className="font-medium mb-2">Plan de Tratamiento:</h4>
                  <p className="text-sm text-gray-700">{selectedReport.content.plan}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
