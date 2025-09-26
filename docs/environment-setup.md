# Variables de Entorno Requeridas

Para que el sistema de verificación de email funcione correctamente, necesitas configurar las siguientes variables de entorno:

## Archivo .env.local

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zonmvugejshdstymfdva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvbm12dWdlanNoZHN0eW1mZHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMjE4OTQsImV4cCI6MjA3MjU5Nzg5NH0.MWyU7xDmAr5EsR661nwSC1q7D90I1_oQUhwGqtlJd6k

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Pasos para Configurar

1. **Crear archivo .env.local** en la raíz del proyecto
2. **Copiar las variables** de arriba al archivo
3. **Reiniciar el servidor** de desarrollo
4. **Probar el sistema** de verificación de email

## Verificación

Una vez configurado, el sistema debería:
- ✅ Enviar códigos OTP a través de Supabase Auth
- ✅ Verificar códigos correctamente
- ✅ Manejar errores apropiadamente
- ✅ Mostrar mensajes de éxito/error

## ⚠️ Problema Identificado: URL No Configurada

**El error "Error enviando código de verificación" puede estar causado por:**

1. **NEXT_PUBLIC_SITE_URL no configurada** - Esto causa que `emailRedirectTo` sea `"undefined/auth/verify-email"`
2. **Variables de entorno faltantes** - Supabase no puede conectarse correctamente

## Troubleshooting

Si sigues viendo "Error enviando código de verificación":
1. **Verifica que NEXT_PUBLIC_SITE_URL esté configurada** en .env.local
2. **Verifica que las variables de entorno estén configuradas**
3. **Revisa la consola del servidor** para más detalles
4. **Verifica que Supabase esté funcionando correctamente**
5. **Habilita OTP en Supabase Dashboard** (Authentication > Settings)
