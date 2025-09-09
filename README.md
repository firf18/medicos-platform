# Plataforma Médicos

Una plataforma web para la gestión médica desarrollada con Next.js y Supabase.

## 🚀 Tecnologías

- **Framework**: Next.js 14
- **Base de datos**: Supabase
- **Autenticación**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Componentes personalizados
- **TypeScript**: Para tipado estático

## 📋 Características

- ✅ Sistema de autenticación completo (login, registro, verificación por email)
- ✅ Dashboard para pacientes
- ✅ Dashboard para médicos
- ✅ Gestión de perfiles
- ✅ Rutas protegidas
- ✅ Verificación de email
- ✅ Recuperación de contraseña
- ✅ Responsive design

## 🛠️ Instalación

1. Clona el repositorio
```bash
git clone <repository-url>
cd platform-medicos
```

2. Instala las dependencias
```bash
npm install
```

3. Configura las variables de entorno
```bash
cp .env.local.example .env.local
```

4. Configura Supabase
- Crea un proyecto en [Supabase](https://supabase.com)
- Ejecuta las migraciones en `supabase/migrations/`
- Actualiza las variables de entorno en `.env.local`

5. Ejecuta el proyecto
```bash
npm run dev
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
├── components/            # Componentes reutilizables
├── features/              # Características por dominio
├── hooks/                 # Hooks personalizados
├── lib/                   # Utilidades y configuraciones
├── providers/             # Providers de contexto
└── types/                 # Definiciones de tipos
```

## 🔐 Autenticación

El proyecto utiliza Supabase Auth con:
- Registro con verificación de email
- Login con email y contraseña
- Recuperación de contraseña
- Rutas protegidas
- Gestión de sesiones

## 📚 Documentación Adicional

- [AUTH_SETUP.md](./AUTH_SETUP.md) - Configuración de autenticación
- [DASHBOARD_README.md](./DASHBOARD_README.md) - Documentación del dashboard
- [SOLUCION_VERIFICACION_EMAIL.md](./SOLUCION_VERIFICACION_EMAIL.md) - Solución de verificación de email

## 🚀 Despliegue

El proyecto está configurado para desplegarse en Vercel:

```bash
vercel deploy --prod --env NEXT_PUBLIC_SUPABASE_URL=<your-url> --env NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
```

## 📄 Licencia

Este proyecto es privado y confidencial.