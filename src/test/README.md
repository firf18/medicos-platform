# 🧪 Tests Automatizados - Plataforma Médicos

Esta carpeta contiene la suite de tests automatizados para asegurar la calidad y funcionalidad del código.

## 📋 **Configuración de Testing**

- **Framework**: Vitest (más rápido que Jest)
- **Testing Library**: React Testing Library
- **Entorno**: jsdom para simular el DOM
- **Cobertura**: c8 para reportes de cobertura

## 🚀 **Comandos de Testing**

```bash
# Ejecutar tests en modo watch (desarrollo)
npm run test

# Ejecutar tests una vez (CI/CD)
npm run test:run

# Ejecutar tests con reporte de cobertura
npm run test:coverage

# Abrir interfaz visual de tests
npm run test:ui
```

## 📁 **Estructura de Tests**

```
src/test/
├── components/          # Tests de componentes React
├── hooks/              # Tests de hooks personalizados
├── utils/              # Tests de utilidades y funciones
├── setup.ts            # Configuración global de tests
└── README.md           # Esta documentación
```

## ✅ **Tests Implementados**

### **Componentes**
- `AdvancedSearchForm.test.tsx` - Tests del formulario de búsqueda avanzada

### **Hooks**
- `useSearch.test.ts` - Tests del hook de búsqueda

### **Utilidades**
- `validations.test.ts` - Tests de funciones de validación

## 🎯 **Criterios de Testing**

### **Componentes**
- ✅ Renderizado correcto
- ✅ Interacciones de usuario
- ✅ Estados de carga y error
- ✅ Props y callbacks
- ✅ Accesibilidad básica

### **Hooks**
- ✅ Estados iniciales
- ✅ Actualizaciones de estado
- ✅ Efectos secundarios
- ✅ Limpieza de memoria

### **Utilidades**
- ✅ Casos válidos e inválidos
- ✅ Casos edge
- ✅ Manejo de errores
- ✅ Tipos de retorno

## 🛡️ **Cobertura de Código**

**Meta de cobertura**: Mínimo 80% en componentes críticos

**Áreas críticas a testear**:
- Componentes de autenticación
- Formularios de citas médicas
- Validaciones de datos
- Funciones de búsqueda
- Hooks de estado

## 📝 **Guías para Escribir Tests**

### **Principios**
1. **AAA Pattern**: Arrange, Act, Assert
2. **Tests descriptivos**: Nombres claros y específicos
3. **Isolation**: Cada test debe ser independiente
4. **Realistic**: Simular casos de uso reales

### **Ejemplo de Test**
```typescript
describe('ComponenteName', () => {
  it('should render with correct initial state', () => {
    // Arrange
    const props = { initialValue: 'test' }
    
    // Act
    render(<ComponentName {...props} />)
    
    // Assert
    expect(screen.getByText('test')).toBeInTheDocument()
  })
})
```

### **Mock Guidelines**
- Mock servicios externos (Supabase, APIs)
- Mock solo lo necesario
- Usar mocks realistas
- Limpiar mocks entre tests

## 🔧 **Configuración Personalizada**

### **Mock de Supabase**
```typescript
// En setup.ts
global.mockSupabase = {
  from: () => ({
    select: () => ({ data: [], error: null }),
    // ... otros métodos
  })
}
```

### **Mock de Next.js Router**
```typescript
// Para componentes que usan useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
  })
}))
```

## 🚨 **Testing de Seguridad**

### **Tests de Validación**
- Validación de emails
- Validación de contraseñas
- Validación de datos médicos
- Sanitización de inputs

### **Tests de Autorización**
- Acceso a rutas protegidas
- Permisos por rol de usuario
- Políticas RLS simuladas

## 📊 **Reportes y CI/CD**

### **Reporte de Cobertura**
Los reportes se generan en `coverage/` y incluyen:
- Porcentaje de líneas cubiertas
- Funciones no testeadas
- Ramas no cubiertas

### **Integración Continua**
```yaml
# Ejemplo para GitHub Actions
- name: Run Tests
  run: npm run test:run

- name: Generate Coverage
  run: npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## 🎯 **Próximos Tests a Implementar**

### **Alta Prioridad**
- [ ] Tests de autenticación
- [ ] Tests del sistema de chat
- [ ] Tests de formularios de citas
- [ ] Tests de dashboard de médicos

### **Media Prioridad**
- [ ] Tests de componentes UI
- [ ] Tests de navegación
- [ ] Tests de notificaciones
- [ ] Tests E2E básicos

### **Baja Prioridad**
- [ ] Tests de performance
- [ ] Tests de accesibilidad
- [ ] Tests de compatibilidad
- [ ] Tests de integración completos

## 🔍 **Debugging Tests**

### **Comandos Útiles**
```bash
# Ejecutar un test específico
npm run test -- search.test.ts

# Ejecutar con modo verbose
npm run test -- --reporter=verbose

# Ejecutar con debugging
npm run test -- --inspect-brk
```

### **Tips de Debugging**
- Usar `screen.debug()` para ver el DOM renderizado
- Usar `console.log` en los tests durante desarrollo
- Verificar que los mocks están funcionando correctamente
- Revisar los mensajes de error detalladamente

## 📚 **Recursos Adicionales**

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

💡 **Recuerda**: Los tests son código de producción. Manténlos limpios, legibles y actualizados.
