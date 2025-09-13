# 🏥 Red-Salud Platform

Una plataforma integral para la gestión médica que conecta pacientes, doctores, clínicas y laboratorios.

## ⚡ INICIO RÁPIDO

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# SUPABASE CONFIGURATION (OBLIGATORIO)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui

# ENVIRONMENT
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Instalación

```bash
# Instalar dependencias
npm install

# Verificar configuración
npm run verify:setup

# Iniciar desarrollo
npm run dev
```

### 3. Configuración Manual

Revisa `SUPABASE_MANUAL_CONFIG.md` para configuraciones críticas de seguridad en Supabase.

## 🚀 Tecnologías

- **Framework**: Next.js 15 con App Router
- **Base de datos**: Supabase PostgreSQL
- **Autenticación**: Supabase Auth + RLS
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Shadcn/ui
- **TypeScript**: Para tipado estático
- **Estado**: Zustand + React Query

## 📋 Características

### ✅ Sistema de Autenticación Completo
- Registro con verificación OTP por email
- Login con protección contra ataques de fuerza bruta
- Recuperación de contraseña segura
- Múltiples roles (paciente, médico, clínica, laboratorio)
- Políticas RLS (Row Level Security) robustas

### ✅ Dashboards Especializados
- **Pacientes**: Historial médico, citas, medicamentos, métricas de salud
- **Médicos**: Gestión de pacientes, citas, diagnósticos  
- **Clínicas**: Administración de doctores y instalaciones
- **Laboratorios**: Gestión de resultados y estudios

### ✅ Funcionalidades Avanzadas
- Notificaciones en tiempo real
- Gestión de contactos de emergencia
- Planes de salud personalizados
- Documentos médicos seguros
- Métricas de salud y seguimiento

## 🛠️ Instalación Completa

1. **Clona el repositorio**
```bash
git clone <repository-url>
cd red-salud-platform
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura Supabase**
- Crea un proyecto en [Supabase](https://supabase.com)
- Las migraciones ya están aplicadas en tu proyecto
- Copia URL y clave anónima a `.env.local`

4. **Verifica el sistema**
```bash
npm run verify:setup
```

5. **Configura seguridad** (CRÍTICO)
- Sigue las instrucciones en `SUPABASE_MANUAL_CONFIG.md`
- Habilita protección de contraseñas filtradas
- Configura MFA para administradores

6. **Ejecuta en desarrollo**
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

- [DASHBOARD_README.md](./DASHBOARD_README.md) - Documentación del dashboard de pacientes
- [SUPABASE_MANUAL_CONFIG.md](./SUPABASE_MANUAL_CONFIG.md) - Configuraciones críticas de seguridad
- `scripts/verify-setup.js` - Script de verificación del sistema

## 🚀 Despliegue

El proyecto está configurado para desplegarse en Vercel:

```bash
vercel deploy --prod --env NEXT_PUBLIC_SUPABASE_URL=<your-url> --env NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
```

## 📄 Licencia

Este proyecto es privado y confidencial.