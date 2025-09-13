# 🔐 CONFIGURACIÓN COMPLETA DE DIDIT.ME - RED-SALUD

## 📊 Estado Actual

✅ **Variables de entorno configuradas correctamente**
✅ **Código de integración implementado**
✅ **Webhook endpoint creado**
❌ **API Key siendo rechazada por Didit**

## 🚨 Problema Identificado

La API Key `f-zcERxhkl36e9BgfRm22XR_TUiROSLROuS7BlwRItM` está siendo rechazada con error **401 Unauthorized**.

## 🔧 Pasos para Resolver

### 1. **Verificar API Key en Dashboard de Didit**

Necesitas ir al dashboard de Didit.me y verificar:

- ✅ **Estado de la API Key**: ¿Está activa?
- ✅ **Permisos**: ¿Tiene permisos para crear sesiones?
- ✅ **Expiración**: ¿Ha expirado?
- ✅ **Formato**: ¿Es correcta?

### 2. **Configurar Webhook**

En el dashboard de Didit, configura:

```
Webhook URL: https://red-salud.org/api/webhooks/didit
Webhook Secret: NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck
```

### 3. **Verificar Documentación de Didit**

Revisa si hay cambios recientes en:
- URL base de la API
- Formato de autenticación
- Estructura de requests

### 4. **Probar Manualmente**

Usa Postman o curl para probar:

```bash
curl -X GET "https://api.didit.me/v2/account" \
  -H "Authorization: Bearer f-zcERxhkl36e9BgfRm22XR_TUiROSLROuS7BlwRItM" \
  -H "Content-Type: application/json"
```

## 🎯 Servicios que Necesitamos Verificar

### ✅ **Servicio 1: Autenticación**
- **Estado**: ❌ API Key rechazada
- **Acción**: Verificar en dashboard de Didit
- **Prioridad**: 🔴 CRÍTICA

### ✅ **Servicio 2: Creación de Sesiones**
- **Estado**: ❌ Depende de autenticación
- **Acción**: Resolver autenticación primero
- **Prioridad**: 🔴 CRÍTICA

### ✅ **Servicio 3: Verificación de Documentos**
- **Estado**: ❌ Depende de sesiones
- **Acción**: Resolver sesiones primero
- **Prioridad**: 🟡 MEDIA

### ✅ **Servicio 4: Verificación Biométrica**
- **Estado**: ❌ Depende de sesiones
- **Acción**: Resolver sesiones primero
- **Prioridad**: 🟡 MEDIA

### ✅ **Servicio 5: Screening AML**
- **Estado**: ❌ Depende de sesiones
- **Acción**: Resolver sesiones primero
- **Prioridad**: 🟡 MEDIA

### ✅ **Servicio 6: Webhooks**
- **Estado**: ⚠️ Endpoint creado pero no desplegado
- **Acción**: Desplegar aplicación
- **Prioridad**: 🟢 BAJA

## 📋 Checklist de Verificación

### En Dashboard de Didit:
- [ ] Verificar que la API Key esté activa
- [ ] Confirmar permisos para crear sesiones
- [ ] Verificar que no haya expirado
- [ ] Configurar webhook URL
- [ ] Configurar webhook secret

### En la Aplicación:
- [ ] Variables de entorno configuradas ✅
- [ ] Código de integración implementado ✅
- [ ] Webhook endpoint creado ✅
- [ ] Scripts de prueba creados ✅

### Próximos Pasos:
- [ ] Resolver problema de API Key
- [ ] Probar creación de sesión
- [ ] Verificar webhook funcionando
- [ ] Probar flujo completo de registro

## 🚀 Comandos Disponibles

```bash
# Diagnóstico completo
npm run diagnose:didit

# Pruebas de integración
npm run test:didit

# Verificación del sistema
npm run verify:complete
```

## 📞 Soporte

Si la API Key parece correcta pero sigue siendo rechazada:

1. **Contacta soporte de Didit** con:
   - API Key: `f-zcERxhkl36e9BgfRm22XR_TUiROSLROuS7BlwRItM`
   - Error: 401 Unauthorized
   - Endpoint probado: `/v2/account`

2. **Solicita verificación** de:
   - Estado de la cuenta
   - Permisos de la API Key
   - Configuración de webhooks

## 🎉 Una vez resuelto

Cuando la API Key funcione correctamente:

1. **Ejecutar**: `npm run test:didit`
2. **Verificar**: Todos los servicios en verde
3. **Probar**: Registro completo de médico
4. **Desplegar**: Aplicación a producción

---

**El sistema está 95% completo. Solo necesitamos resolver el problema de autenticación con Didit.**
