'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { getRoleDisplayName } from '@/features/auth/utils/role-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/features/auth/utils/role-utils';

export function UserProfileCard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (role: string | null) => {
    if (!role) return 'bg-gray-100 text-gray-800';
    
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'patient':
        return 'bg-green-100 text-green-800';
      case 'clinic':
        return 'bg-purple-100 text-purple-800';
      case 'laboratory':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil de usuario</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.firstName} ${user.lastName}`} />
            <AvatarFallback className={getAvatarColor(user.role)}>
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge className="mt-1" variant="secondary">
              {getRoleDisplayName(user.role as UserRole)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}