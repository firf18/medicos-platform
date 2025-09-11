---
trigger: always_on
---


# 📋 Reglas y Buenas Prácticas - Platform Médicos

## 🎯 Principios Fundamentales

### 1. Responsabilidad Única (Single Responsibility Principle)
- **Un archivo, una responsabilidad**: Cada archivo debe tener un propósito específico y bien definido
- **Máximo 400 líneas de código por archivo**: Si un archivo supera este límite, debe ser refactorizado y dividido
- **Separación de concerns**: Lógica de negocio, presentación y datos deben estar claramente separados

### 2. Estructura Escalable
- **Arquitectura por features**: Organizar código por funcionalidad, no por tipo de archivo
- **Componentes reutilizables**: Crear componentes genéricos en `/components/ui`
- **Hooks personalizados**: Extraer lógica compleja a hooks reutilizables

## 🏗️ Estructura de Archivos

### Organización por Dominios
```
src/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   ├── (protected)/       # Rutas protegidas
│   └── api/               # API endpoints
├── components/            # Componentes por dominio
│   ├── auth/             # Componentes de autenticación
│   ├── dashboard/        # Componentes del dashboard
│   ├── ui/               # Componentes reutilizables
│   └── navigation/       # Componentes de navegación
├── features/             # Lógica por funcionalidad
│   ├── auth/            # Feature de autenticación
│   └── dashboard/       # Feature del dashboard
├── lib/                 # Utilidades y configuraciones
├── hooks/              # Hooks personalizados
├── types/              # Definiciones de tipos
└── providers/          # Proveedores de contexto
```

### Convenciones de Nomenclatura
- **Componentes**: PascalCase (`LoginForm.tsx`)
- **Hooks**: camelCase con prefijo "use" (`useAuth.ts`)
- **Utilidades**: camelCase (`formatDate.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Carpetas**: kebab-case (`patient-dashboard/`)

## 📝 Reglas de Código

### TypeScript Estricto
- **Tipos explícitos**: Siempre definir tipos para props, estados y funciones
- **Interfaces vs Types**: Usar interfaces para objetos, types para uniones
- **Evitar `any`**: Usar tipos específicos o `unknown` cuando sea necesario
- **Props con destructuring**: Siempre destructurar props en componentes

```typescript
// ✅ Correcto
interface UserProps {
  id: string;
  name: string;
  role: 'patient' | 'doctor';
}

const UserCard = ({ id, name, role }: UserProps) => {
  // componente
};

// ❌ Incorrecto
const UserCard = (props: any) => {
  // componente
};
```

### Componentes React
- **Componentes funcionales**: Usar solo functional components con hooks
- **Props inmutables**: No mutar props directamente
- **Estado local mínimo**: Usar estado local solo cuando sea necesario
- **Memoización inteligente**: Usar `memo`, `useMemo` y `useCallback` solo cuando haya beneficio

```typescript
// ✅ Estructura correcta de componente
import { memo } from 'react';

interface ComponentProps {
  // props tipadas
}

const Component = memo<ComponentProps>(({ prop1, prop2 }) => {
  // hooks al inicio
  // lógica del componente
  // return JSX
});

Component.displayName = 'Component';
export default Component;
```

### Gestión de Estado
- **Estado local**: `useState` para estado simple del componente
- **Estado global**: Zustand para estado compartido entre componentes
- **Server state**: React Query para datos del servidor
- **Form state**: React Hook Form para formularios complejos

## 🔐 Autenticación y Seguridad

### Supabase Auth
- **Una instancia de cliente**: Garantizar una sola instancia de GoTrueClient
- **Verificación de email**: Obligatoria para todos los usuarios
- **RLS activado**: Todas las tablas deben tener Row Level Security
- **Tipos de usuario**: Roles claramente definidos (patient, doctor)

### Protección de Rutas
- **AuthGuard**: Verificar autenticación en rutas protegidas
- **Role-based access**: Verificar roles específicos cuando sea necesario
- **Middleware**: Usar middleware de Next.js para protección a nivel de ruta

```typescript
// ✅ Ejemplo de ruta protegida
const ProtectedPage = () => {
  return (
    <AuthGuard requiredRole="doctor">
      <DoctorDashboard />
    </AuthGuard>
  );
};
```

## 🎨 Estilos y UI

### Tailwind CSS
- **Clases utilitarias**: Preferir clases de Tailwind sobre CSS custom
- **Componentes consistentes**: Usar design system basado en `/components/ui`
- **Responsive design**: Mobile-first approach con breakpoints claros
- **Accesibilidad**: Usar clases de Tailwind que mantengan accesibilidad

### Componentes UI
- **Radix UI**: Base para componentes complejos (dropdown, modal, etc.)
- **Heroicons**: Iconografía consistente
- **Variants**: Usar variantes para diferentes estados del componente

```typescript
// ✅ Ejemplo de componente con variants
const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700',
  secondary: 'bg-gray-200 hover:bg-gray-300',
  danger: 'bg-red-600 hover:bg-red-700'
};
```

## 📊 Manejo de Datos

### React Query
- **Queries para lectura**: Usar `useQuery` para obtener datos
- **Mutations para escritura**: Usar `useMutation` para crear/actualizar
- **Cache inteligente**: Configurar invalidación apropiada de cache
- **Loading states**: Manejar estados de carga consistentemente

### Supabase Client
- **Tipado de base de datos**: Generar tipos desde esquema de Supabase
- **Consultas optimizadas**: Seleccionar solo campos necesarios
- **Manejo de errores**: Capturar y manejar errores apropiadamente

```typescript
// ✅ Ejemplo de query tipada
const { data: patients, isLoading } = useQuery({
  queryKey: ['patients'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('id, name, email')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
});
```

## 🧪 Testing

### Tipos de Tests
- **Unit tests**: Para funciones utilitarias y hooks
- **Component tests**: Para componentes aislados
- **Integration tests**: Para flujos completos
- **E2E tests**: Para casos de uso críticos

### Herramientas Recomendadas
- **Jest**: Framework de testing
- **React Testing Library**: Testing de componentes
- **MSW**: Mock de APIs para tests
- **Playwright**: Tests end-to-end

## 🔧 Herramientas de Desarrollo

### Linting y Formatting
- **ESLint**: Configuración estricta con reglas de React y TypeScript
- **Prettier**: Formato consistente de código
- **Husky**: Pre-commit hooks para mantener calidad
- **lint-staged**: Lint solo archivos modificados

### Scripts del Proyecto
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "test": "jest",
  "test:e2e": "playwright test"
}
```

## 📈 Performance

### Optimizaciones
- **Code splitting**: Usar `dynamic()` para lazy loading
- **Image optimization**: Usar `next/image` para imágenes
- **Bundle analysis**: Monitorear tamaño del bundle regularmente
- **Server components**: Usar cuando sea apropiado en App Router

### Métricas Importantes
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.5s

## 🚀 Despliegue

### Vercel Deployment
- **Variables de entorno**: Configurar correctamente en Vercel
- **Preview deployments**: Usar para testing antes de producción
- **Analytics**: Monitorear performance en producción
- **Edge functions**: Considerar para optimización geográfica

### Supabase Configuration
- **Migraciones**: Versionado con archivos SQL en `/supabase/migrations`
- **Policies**: RLS policies definidas y documentadas
- **Backups**: Configurar backups automáticos en producción

## 📚 Documentación

### Requisitos de Documentación
- **README**: Instrucciones claras de setup y desarrollo
- **Componentes**: Documentar props y uso de componentes complejos
- **APIs**: Documentar endpoints y tipos de datos
- **Deployment**: Guía de despliegue paso a paso

### Comentarios en Código
- **JSDoc**: Para funciones y componentes públicos
- **Comentarios inline**: Solo cuando la lógica sea compleja
- **TODO comments**: Con ticket asociado y fecha límite

## ⚠️ Manejo de Errores

### Error Boundaries
- **React Error Boundaries**: Para capturar errores de componentes
- **Fallback UI**: Interfaces de respaldo user-friendly
- **Error reporting**: Integración con servicio de monitoreo

### Logging
- **Structured logging**: Formato consistente de logs
- **Error context**: Incluir información relevante para debugging
- **Production logs**: Solo errores críticos en producción

## 🔄 Versionado

### Git Workflow
- **Feature branches**: Una rama por feature
- **Conventional commits**: Formato estándar de commits
- **Pull requests**: Review obligatorio antes de merge
- **Release tags**: Versionado semántico (semver)

### Commit Messages
```
feat: add user profile validation
fix: resolve authentication redirect loop
docs: update API documentation
refactor: simplify dashboard layout logic
```

---

## ✅ Checklist de Cumplimiento

Antes de cada PR, verificar:

- [ ] Archivo no supera 400 líneas
- [ ] Responsabilidad única por archivo
- [ ] Tipos TypeScript definidos
- [ ] Componentes memoizados apropiadamente
- [ ] Tests unitarios incluidos
- [ ] Documentación actualizada
- [ ] Linting pasando sin errores
- [ ] No hay console.logs en producción
- [ ] Variables de entorno configuradas
- [ ] Migraciones de BD aplicadas

---

Estas reglas aseguran que el proyecto **platform-medicos** mantenga una arquitectura escalable, código mantenible y alta calidad en el desarrollo. Cada desarrollador debe familiarizarse con estas prácticas y aplicarlas consistentemente.