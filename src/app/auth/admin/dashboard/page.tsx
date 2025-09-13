import { AuthGuard } from '@/features/auth/components/auth-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Shield, Settings, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <AuthGuard requiredRole="admin">
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Gestiona usuarios, configuraciones y monitorea la actividad del sistema
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +12% desde el último mes
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Roles activos</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                Administradores, Médicos, Pacientes, Clínicas, Laboratorios
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Configuraciones</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Opciones de sistema configuradas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actividad reciente</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">
                Eventos en las últimas 24 horas
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de usuarios</CardTitle>
              <CardDescription>
                Administra cuentas de usuarios y sus roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full">Ver todos los usuarios</Button>
                <Button variant="outline" className="w-full">
                  Crear nuevo usuario
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Configuración del sistema</CardTitle>
              <CardDescription>
                Ajusta las configuraciones globales de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full">Configuración general</Button>
                <Button variant="outline" className="w-full">
                  Políticas de seguridad
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}