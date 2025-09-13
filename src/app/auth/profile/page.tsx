'use client';

import { UserProfileCard } from '@/features/auth/components/user-profile-card';
import { AuthGuard } from '@/features/auth/components/auth-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <AuthGuard>
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Perfil</h1>
            <p className="text-muted-foreground">
              Gestiona tu información de perfil y configuración de cuenta
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <UserProfileCard />
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de cuenta</CardTitle>
                  <CardDescription>
                    Administra tu cuenta y preferencias
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Seguridad</h3>
                    <p className="text-sm text-muted-foreground">
                      Actualiza tu contraseña y configura métodos de autenticación
                    </p>
                    <div className="mt-4 space-y-2">
                      <Button variant="outline" className="w-full">
                        Cambiar contraseña
                      </Button>
                      <Button variant="outline" className="w-full">
                        Configurar autenticación de dos factores
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium">Acciones de cuenta</h3>
                    <p className="text-sm text-muted-foreground">
                      Gestiona tu cuenta y preferencias de privacidad
                    </p>
                    <div className="mt-4 space-y-2">
                      <Button variant="outline" className="w-full">
                        Editar perfil
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={handleSignOut}
                      >
                        Cerrar sesión
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}