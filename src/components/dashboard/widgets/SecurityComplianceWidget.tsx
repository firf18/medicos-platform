/**
 * Sistema de Seguridad y Cumplimiento Avanzado
 * Auditoría, encriptación, cumplimiento HIPAA y seguridad de datos
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  Activity,
  Database,
  Key,
  FileText,
  Settings,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Users,
  Server,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Globe,
  LockIcon
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'login' | 'data_access' | 'data_modification' | 'export' | 'security_alert';
  description: string;
  timestamp: string;
  user: string;
  ipAddress: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'resolved' | 'pending' | 'investigating';
}

interface ComplianceCheck {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  lastChecked: string;
  description: string;
  requirements: string[];
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    expirationDays: number;
  };
  dataEncryption: {
    atRest: boolean;
    inTransit: boolean;
    keyRotation: number;
  };
  auditLogging: boolean;
  ipWhitelist: string[];
  deviceManagement: boolean;
}

export default function SecurityComplianceWidget() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: true,
      expirationDays: 90
    },
    dataEncryption: {
      atRest: true,
      inTransit: true,
      keyRotation: 30
    },
    auditLogging: true,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    deviceManagement: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    // Simular eventos de seguridad
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'login',
        description: 'Inicio de sesión exitoso desde dispositivo móvil',
        timestamp: new Date().toISOString(),
        user: 'Dr. Juan Pérez',
        ipAddress: '192.168.1.100',
        location: 'Caracas, Venezuela',
        severity: 'low',
        status: 'resolved'
      },
      {
        id: '2',
        type: 'data_access',
        description: 'Acceso a expediente médico de paciente María González',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        user: 'Dr. Juan Pérez',
        ipAddress: '192.168.1.100',
        location: 'Caracas, Venezuela',
        severity: 'low',
        status: 'resolved'
      },
      {
        id: '3',
        type: 'security_alert',
        description: 'Intento de acceso desde IP no autorizada',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user: 'Unknown',
        ipAddress: '203.0.113.45',
        location: 'Unknown',
        severity: 'high',
        status: 'investigating'
      },
      {
        id: '4',
        type: 'export',
        description: 'Exportación de datos de pacientes',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        user: 'Dr. Juan Pérez',
        ipAddress: '192.168.1.100',
        location: 'Caracas, Venezuela',
        severity: 'medium',
        status: 'resolved'
      }
    ];

    // Simular verificaciones de cumplimiento
    const mockCompliance: ComplianceCheck[] = [
      {
        id: '1',
        name: 'Encriptación de Datos en Reposo',
        status: 'pass',
        lastChecked: new Date().toISOString(),
        description: 'Todos los datos médicos están encriptados usando AES-256',
        requirements: ['AES-256 encryption', 'Key management', 'Secure storage']
      },
      {
        id: '2',
        name: 'Encriptación en Tránsito',
        status: 'pass',
        lastChecked: new Date().toISOString(),
        description: 'Todas las comunicaciones usan TLS 1.3',
        requirements: ['TLS 1.3', 'Certificate validation', 'Perfect Forward Secrecy']
      },
      {
        id: '3',
        name: 'Autenticación de Dos Factores',
        status: 'pass',
        lastChecked: new Date().toISOString(),
        description: '2FA habilitado para todos los usuarios médicos',
        requirements: ['TOTP support', 'SMS backup', 'Hardware tokens']
      },
      {
        id: '4',
        name: 'Auditoría de Accesos',
        status: 'warning',
        lastChecked: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'Logs de auditoría requieren revisión manual',
        requirements: ['Comprehensive logging', 'Real-time monitoring', 'Automated alerts']
      },
      {
        id: '5',
        name: 'Cumplimiento HIPAA',
        status: 'pass',
        lastChecked: new Date().toISOString(),
        description: 'Sistema cumple con estándares HIPAA',
        requirements: ['Administrative safeguards', 'Physical safeguards', 'Technical safeguards']
      }
    ];

    setSecurityEvents(mockEvents);
    setComplianceChecks(mockCompliance);
  };

  const runSecurityScan = async () => {
    setIsScanning(true);
    // Simular escaneo de seguridad
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsScanning(false);
    loadSecurityData(); // Recargar datos después del escaneo
  };

  const updateSecuritySetting = (key: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'investigating':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplianceStatus = (status: string) => {
    switch (status) {
      case 'pass':
        return { color: 'text-green-600', icon: CheckCircle };
      case 'fail':
        return { color: 'text-red-600', icon: AlertTriangle };
      case 'warning':
        return { color: 'text-yellow-600', icon: AlertTriangle };
      default:
        return { color: 'text-gray-600', icon: Clock };
    }
  };

  const criticalEvents = securityEvents.filter(e => e.severity === 'critical' || e.severity === 'high');
  const failedCompliance = complianceChecks.filter(c => c.status === 'fail');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Seguridad y Cumplimiento
              </CardTitle>
              <CardDescription>
                Monitoreo de seguridad, auditoría y cumplimiento HIPAA
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={runSecurityScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    Escaneando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Escanear Seguridad
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alertas Críticas */}
      {criticalEvents.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertas de Seguridad Críticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">{event.description}</p>
                      <p className="text-sm text-red-600">
                        {event.user} • {event.ipAddress} • {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getSeverityColor(event.severity)}>
                    {event.severity === 'critical' ? 'Crítico' : 'Alto'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado de Cumplimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Estado de Cumplimiento
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {complianceChecks.filter(c => c.status === 'pass').length}/{complianceChecks.length} Cumple
              </Badge>
              {failedCompliance.length > 0 && (
                <Badge variant="destructive">
                  {failedCompliance.length} Fallos
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceChecks.map((check) => {
              const statusInfo = getComplianceStatus(check.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={check.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                    <div>
                      <h4 className="font-medium">{check.name}</h4>
                      <p className="text-sm text-gray-600">{check.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {check.requirements.map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={statusInfo.color}>
                      {check.status === 'pass' ? 'Cumple' :
                       check.status === 'fail' ? 'Falla' : 'Advertencia'}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(check.lastChecked).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Seguridad */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Configuración de Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Autenticación</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Key className="h-4 w-4" />
                      <span className="text-sm">Autenticación de Dos Factores</span>
                    </div>
                    <Switch 
                      checked={securitySettings.twoFactorAuth} 
                      onCheckedChange={(checked) => updateSecuritySetting('twoFactorAuth', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Timeout de Sesión (minutos)</span>
                    </div>
                    <Input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Encriptación</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4" />
                      <span className="text-sm">Encriptación en Reposo</span>
                    </div>
                    <Switch 
                      checked={securitySettings.dataEncryption.atRest} 
                      onCheckedChange={(checked) => updateSecuritySetting('dataEncryption', { ...securitySettings.dataEncryption, atRest: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">Encriptación en Tránsito</span>
                    </div>
                    <Switch 
                      checked={securitySettings.dataEncryption.inTransit} 
                      onCheckedChange={(checked) => updateSecuritySetting('dataEncryption', { ...securitySettings.dataEncryption, inTransit: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4" />
                      <span className="text-sm">Rotación de Claves (días)</span>
                    </div>
                    <Input
                      type="number"
                      value={securitySettings.dataEncryption.keyRotation}
                      onChange={(e) => updateSecuritySetting('dataEncryption', { ...securitySettings.dataEncryption, keyRotation: parseInt(e.target.value) })}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eventos de Seguridad Recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Eventos de Seguridad Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    event.type === 'login' ? 'bg-green-100' :
                    event.type === 'data_access' ? 'bg-blue-100' :
                    event.type === 'security_alert' ? 'bg-red-100' :
                    event.type === 'export' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    {event.type === 'login' && <User className="h-4 w-4 text-green-600" />}
                    {event.type === 'data_access' && <Database className="h-4 w-4 text-blue-600" />}
                    {event.type === 'security_alert' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {event.type === 'export' && <Download className="h-4 w-4 text-yellow-600" />}
                    {event.type === 'data_modification' && <Edit className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{event.description}</p>
                    <p className="text-xs text-gray-500">
                      {event.user} • {event.ipAddress} • {event.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getSeverityColor(event.severity)}>
                    {event.severity}
                  </Badge>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status === 'resolved' ? 'Resuelto' :
                     event.status === 'pending' ? 'Pendiente' : 'Investigando'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de Seguridad */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos Hoy</p>
                <p className="text-2xl font-bold text-blue-600">{securityEvents.length}</p>
                <p className="text-xs text-gray-500">actividad</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cumplimiento</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((complianceChecks.filter(c => c.status === 'pass').length / complianceChecks.length) * 100)}%
                </p>
                <p className="text-xs text-gray-500">HIPAA</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas</p>
                <p className="text-2xl font-bold text-orange-600">{criticalEvents.length}</p>
                <p className="text-xs text-gray-500">pendientes</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Encriptación</p>
                <p className="text-2xl font-bold text-purple-600">AES-256</p>
                <p className="text-xs text-gray-500">estándar</p>
              </div>
              <Lock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
