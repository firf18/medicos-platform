'use client';

export function useAuthError() {
  const getErrorMessage = (error: unknown): string => {
    // Si el error es un string, lo devolvemos directamente
    if (typeof error === 'string') {
      return error;
    }
    
    // Si el error tiene un mensaje, lo usamos
    if (error && typeof error === 'object' && 'message' in error) {
      return (error as { message: string }).message;
    }
    
    // Mapeo de códigos de error comunes de Supabase
    const errorMap: Record<string, string> = {
      'invalid_credentials': 'Credenciales de inicio de sesión inválidas. Por favor, verifica tu email y contraseña.',
      'email_not_confirmed': 'Tu correo electrónico no ha sido verificado. Por favor, verifica tu bandeja de entrada.',
      'user_already_exists': 'Ya existe una cuenta con este correo electrónico.',
      'weak_password': 'La contraseña es muy débil. Debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas y números.',
      'invalid_email': 'Formato de correo electrónico inválido.',
      'invalid_token': 'El enlace no es válido o ha expirado.',
      'session_expired': 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      'too_many_requests': 'Demasiadas solicitudes. Por favor, inténtalo de nuevo más tarde.',
      'network_error': 'Error de conexión. Por favor, verifica tu conexión a internet.',
    };
    
    // Buscar mensaje específico por código de error
    if (error && typeof error === 'object' && 'code' in error && typeof (error as { code: string }).code === 'string') {
      const errorCode = (error as { code: string }).code;
      if (errorMap[errorCode]) {
        return errorMap[errorCode];
      }
    }
    
    // Mensaje por defecto
    return 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
  };

  const getSuccessMessage = (action: string): string => {
    const successMessages: Record<string, string> = {
      'login': '¡Bienvenido de vuelta! Has iniciado sesión correctamente.',
      'register': '¡Registro exitoso! Por favor verifica tu correo electrónico para continuar.',
      'password_reset': 'Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico.',
      'password_update': '¡Contraseña actualizada correctamente!',
      'email_verification': '¡Correo verificado correctamente!',
      'email_resend': 'Hemos enviado un nuevo enlace de verificación a tu correo electrónico.',
    };
    
    return successMessages[action] || 'Operación completada exitosamente.';
  };

  return {
    getErrorMessage,
    getSuccessMessage,
  };
}