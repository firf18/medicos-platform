'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  LogEntry, 
  LogLevel, 
  LogCategory, 
  logger 
} from '@/lib/logging/logger';

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  debug: 'bg-gray-100 text-gray-800',
  info: 'bg-blue-100 text-blue-800',
  warn: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800'
};

const LOG_CATEGORY_COLORS: Record<LogCategory, string> = {
  auth: 'bg-purple-100 text-purple-800',
  registration: 'bg-green-100 text-green-800',
  verification: 'bg-indigo-100 text-indigo-800',
  security: 'bg-red-100 text-red-800',
  system: 'bg-gray-100 text-gray-800',
  api: 'bg-blue-100 text-blue-800',
  database: 'bg-orange-100 text-orange-800'
};

export function LoggingViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<LogCategory | 'all'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Cargar logs iniciales
  useEffect(() => {
    const initialLogs = logger.getLogs();
    setLogs(initialLogs);
  }, []);

  // Auto-refrescar logs
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const currentLogs = logger.getLogs();
      setLogs(currentLogs);
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filtrar logs
  const filteredLogs = logs.filter(log => {
    if (filterLevel !== 'all' && log.level !== filterLevel) {
      return false;
    }
    
    if (filterCategory !== 'all' && log.category !== filterCategory) {
      return false;
    }
    
    return true;
  });

  // Limpiar logs
  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  // Exportar logs
  const exportLogs = () => {
    const logData = logger.exportLogs();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Sistema de Logs</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearLogs}
          >
            Limpiar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportLogs}
          >
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-1 block">Nivel</label>
            <Select 
              value={filterLevel} 
              onValueChange={(value: LogLevel | 'all') => setFilterLevel(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warn</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-1 block">Categoría</label>
            <Select 
              value={filterCategory} 
              onValueChange={(value: LogCategory | 'all') => setFilterCategory(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="auth">Auth</SelectItem>
                <SelectItem value="registration">Registro</SelectItem>
                <SelectItem value="verification">Verificación</SelectItem>
                <SelectItem value="security">Seguridad</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="database">Base de Datos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Auto-refrescar</span>
            </label>
          </div>
        </div>
        
        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="space-y-2">
            {filteredLogs.map((log, index) => (
              <div 
                key={index} 
                className="p-3 rounded-lg border text-sm font-mono"
              >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge className={LOG_LEVEL_COLORS[log.level]}>
                    {log.level.toUpperCase()}
                  </Badge>
                  <Badge className={LOG_CATEGORY_COLORS[log.category]}>
                    {log.category}
                  </Badge>
                  <span className="text-gray-500 text-xs">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  {log.userId && (
                    <Badge variant="outline" className="text-xs">
                      User: {log.userId}
                    </Badge>
                  )}
                </div>
                
                <div className="font-medium mb-1">{log.message}</div>
                
                {log.metadata && (
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap mt-2">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))}
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay logs que coincidan con los filtros
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
