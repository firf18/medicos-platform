# 🏥 Platform Médicos - Red Salud

**Plataforma médica completa para la gestión integral de servicios de salud en Venezuela**

## 🚀 Descripción

Platform Médicos es una aplicación web moderna desarrollada con Next.js 15 y Supabase que facilita la gestión médica integral. La plataforma conecta médicos, pacientes, clínicas y laboratorios en un ecosistema digital seguro y escalable.

## ✨ Características Principales

### 👨‍⚕️ Para Médicos
- **Dashboard Personalizado**: Configuración específica por especialidad médica
- **Gestión de Pacientes**: Historiales médicos completos y seguimiento
- **Verificación Profesional**: Validación de cédulas profesionales con SACS/MPPS
- **Citas Médicas**: Sistema completo de programación y gestión
- **Comunicación Segura**: Chat en tiempo real con pacientes

### 👥 Para Pacientes
- **Portal Personal**: Acceso a historiales y documentos médicos
- **Gestión de Citas**: Programación y seguimiento de consultas
- **Telemedicina**: Consultas virtuales con médicos
- **Medicamentos**: Seguimiento de prescripciones y recordatorios
- **Contactos de Emergencia**: Gestión de familiares y cuidadores

### 🏢 Para Clínicas y Laboratorios
- **Gestión Administrativa**: Control de personal y recursos
- **Integración de Servicios**: Resultados de laboratorio e imágenes
- **Analytics**: Métricas de rendimiento y estadísticas
- **Compliance**: Cumplimiento normativo y auditoría

## 🛠️ Tecnologías

### Frontend
- **Next.js 15**: App Router, Server Components, Streaming SSR
- **React 18**: Hooks, Context API, Error Boundaries
- **TypeScript**: Tipado estático y IntelliSense
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Componentes accesibles y reutilizables

### Backend
- **Supabase**: Base de datos PostgreSQL con RLS
- **Row Level Security**: Protección granular de datos médicos
- **Real-time**: Subscripciones y actualizaciones en vivo
- **Authentication**: Auth multi-factor y social

### Validaciones y Seguridad
- **Zod**: Schemas de validación runtime
- **HIPAA Compliance**: Estándares de seguridad médica
- **Audit Trail**: Registro completo de actividades
- **Identity Verification**: Integración con Didit.me

### Testing y Quality
- **Vitest**: Testing unitario y de integración
- **Cypress**: Testing end-to-end
- **ESLint**: Linting y mejores prácticas
- **Prettier**: Formateo consistente de código

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (protected)/       # Rutas protegidas
│   ├── doctor/            # Dashboard médicos
│   ├── patient/           # Portal pacientes
│   ├── clinic/            # Gestión clínicas
│   ├── laboratory/        # Gestión laboratorios
│   └── api/               # API endpoints
├── components/            # Componentes React por dominio
│   ├── auth/             # Autenticación
│   ├── dashboard/        # Dashboards especializados
│   ├── patient-dashboard/# Dashboard pacientes
│   ├── ui/               # Componentes base
│   └── navigation/       # Navegación
├── domains/              # Lógica de dominio médico
│   ├── auth/            # Autenticación y registro
│   ├── compliance/      # Verificación y compliance
│   ├── medical-records/ # Historiales médicos
│   └── emergency/       # Servicios de emergencia
├── features/            # Features transversales
│   └── auth/           # Sistema de autenticación
├── lib/                # Configuraciones y utilidades
│   ├── supabase/      # Cliente Supabase
│   ├── validations/   # Schemas de validación
│   └── utils/         # Funciones utilitarias
├── types/             # Tipos TypeScript
│   ├── database/     # Tipos de base de datos
│   ├── auth/         # Tipos de autenticación
│   └── medical/      # Tipos médicos
├── hooks/            # Custom React hooks
├── providers/        # Context providers
└── middleware.ts     # Protección de rutas
```

## 🚦 Instalación y Configuración

### Prerrequisitos
- Node.js 18.17 o superior
- npm o yarn
- Cuenta de Supabase
- Cuenta de Didit.me (opcional, para verificación)

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/platform-medicos.git
cd platform-medicos
```

### 2. Instalar dependencias
```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env.local
```

Configurar las siguientes variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Aplicación
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development

# Verificación de Identidad (Opcional)
DIDIT_API_KEY=tu_didit_api_key
DIDIT_WORKFLOW_ID=tu_workflow_id

# Seguridad
RATE_LIMIT_ENABLED=true
SESSION_TIMEOUT_MINUTES=30
```

### 4. Configurar base de datos
```bash
# Aplicar migraciones
npm run db:migrate

# Insertar datos de prueba (opcional)
npm run db:seed
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🧪 Testing

### Ejecutar tests
```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:coverage

# Tests e2e
npm run test:e2e

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🚀 Deployment

### Vercel (Recomendado)
1. Conectar repositorio en Vercel
2. Configurar variables de entorno
3. Deploy automático en push a main

### Docker
```bash
# Build
docker build -t platform-medicos .

# Run
docker run -p 3000:3000 platform-medicos
```

## 📊 Arquitectura y Principios

### Domain-Driven Design
- **Bounded Contexts**: Cada dominio médico es independiente
- **Aggregates**: Entidades médicas cohesivas
- **Value Objects**: Objetos inmutables para datos médicos

### Clean Architecture
- **Presentación**: Componentes React
- **Aplicación**: Hooks y servicios
- **Dominio**: Lógica de negocio médica
- **Infraestructura**: Supabase y APIs externas

### Principios SOLID
- **Single Responsibility**: Cada archivo tiene una responsabilidad única
- **Open/Closed**: Extensible sin modificación
- **Liskov Substitution**: Interfaces consistentes
- **Interface Segregation**: Interfaces específicas
- **Dependency Inversion**: Dependencias abstraídas

## 🔒 Seguridad y Compliance

### HIPAA Compliance
- **Encryption**: Datos encriptados en tránsito y reposo
- **Access Control**: RLS granular por rol médico
- **Audit Trail**: Registro completo de accesos
- **Data Minimization**: Solo datos necesarios

### Verificación de Identidad
- **Didit.me Integration**: Verificación biométrica
- **SACS/MPPS**: Validación de cédulas profesionales
- **Multi-factor Auth**: Autenticación robusta

## 📈 Monitoreo y Analytics

### Métricas de Negocio
- Usuarios activos por rol
- Citas programadas y completadas
- Tiempo de respuesta médica
- Satisfacción del paciente

### Métricas Técnicas
- Performance de API
- Errores y uptime
- Uso de recursos
- Seguridad y compliance

## 🤝 Contribución

### Proceso de Desarrollo
1. Fork del repositorio
2. Crear branch feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit con mensaje descriptivo
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código
- **TypeScript estricto**: Tipos explícitos obligatorios
- **Functional Components**: Solo componentes funcionales
- **Custom Hooks**: Lógica reutilizable en hooks
- **Error Boundaries**: Manejo de errores robusto
- **Testing**: Coverage mínimo del 80%

### Convenciones
- **Commits**: Conventional Commits
- **Branches**: feature/, fix/, hotfix/
- **PR Templates**: Seguir plantillas establecidas
- **Code Review**: Mínimo 2 revisores para código médico

## 📞 Soporte

### Documentación
- [Guía de Desarrollo](./docs/development-guide.md)
- [API Reference](./docs/api-reference.md)
- [Deployment Guide](./docs/deployment-guide.md)

### Contacto
- **Email**: soporte@platform-medicos.com
- **Slack**: #platform-medicos
- **Issues**: GitHub Issues para bugs y features

## 📄 Licencia

Este proyecto está licenciado bajo MIT License - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Reconocimientos

- **Equipo de Desarrollo**: Por la implementación y mantenimiento
- **Comunidad Médica**: Por feedback y requerimientos
- **Open Source**: Por las herramientas y librerías utilizadas

---

**Platform Médicos** - Transformando la atención médica digital en Venezuela 🇻🇪
