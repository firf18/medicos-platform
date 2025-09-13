# 🌐 GUÍA COMPLETA DE DESPLIEGUE A CLOUDFLARE PAGES

## 🎯 **OBJETIVO**
Desplegar Red-Salud en Cloudflare Pages para que Didit pueda enviar webhooks correctamente.

## 📋 **PASOS PARA DESPLEGAR**

### **1. Preparar el Proyecto**

```bash
# Construir y preparar para despliegue
npm run deploy:build
```

### **2. Configurar Cloudflare Pages**

#### **A. Crear cuenta en Cloudflare**
1. Ve a [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Inicia sesión o crea una cuenta
3. Conecta tu cuenta de GitHub

#### **B. Crear nuevo proyecto**
1. Haz clic en **"Create a project"**
2. Selecciona **"Connect to Git"**
3. Conecta tu repositorio `platform-medicos`

#### **C. Configurar build settings**
```
Framework preset: Next.js (Static HTML Export)
Build command: npm run build
Build output directory: out
Root directory: /
```

#### **D. Configurar variables de entorno**
En la sección **"Environment variables"**, agrega:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zonmvugejshdstymfdva.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvbm12dWdlanNoZHN0eW1mZHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMjE4OTQsImV4cCI6MjA3MjU5Nzg5NH0.MWyU7xDmAr5EsR661nwSC1q7D90I1_oQUhwGqtlJd6k` |
| `NEXT_PUBLIC_SITE_URL` | `https://red-salud.org` |
| `NEXT_PUBLIC_DOMAIN` | `red-salud.org` |
| `DIDIT_API_KEY` | `f-zcERxhkl36e9BgfRm22XR_TUiROSLROuS7BlwRItM` |
| `DIDIT_WEBHOOK_SECRET` | `NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck` |
| `DIDIT_BASE_URL` | `https://api.didit.me` |
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_APP_ENV` | `production` |

### **3. Configurar el Dominio**

#### **A. En Cloudflare Pages**
1. Ve a **"Custom domains"**
2. Agrega `red-salud.org`
3. Configura el DNS según las instrucciones

#### **B. En tu proveedor de DNS**
Configura los registros DNS:
```
Tipo: CNAME
Nombre: @
Valor: red-salud.org.pages.dev
TTL: Auto
```

### **4. Desplegar**

1. Haz clic en **"Save and Deploy"**
2. Espera a que termine el build
3. Verifica que la aplicación esté funcionando

## 🔧 **CONFIGURACIÓN POST-DESPLIEGUE**

### **1. Actualizar Webhook en Didit**

Una vez desplegado, ve al panel de Didit y actualiza:

```
URL del Webhook: https://red-salud.org/api/webhooks/didit
Clave secreta del Webhook: NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck
```

### **2. Probar la Integración**

```bash
# Probar localmente (con la URL de producción)
npm run test:didit

# Verificar que el webhook funcione
curl -X POST https://red-salud.org/api/webhooks/didit \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

## 🚨 **SOLUCIÓN AL PROBLEMA ACTUAL**

### **Problema identificado:**
- ✅ **Código**: Implementado correctamente
- ✅ **Variables de entorno**: Configuradas
- ❌ **Despliegue**: Solo en local
- ❌ **Webhook**: No puede llegar a localhost

### **Solución:**
1. **Desplegar a Cloudflare Pages** ✅
2. **Configurar dominio** ✅
3. **Actualizar webhook en Didit** ✅
4. **Probar integración completa** ✅

## 📊 **ESTADO ACTUAL**

| Componente | Estado | Acción Requerida |
|------------|--------|------------------|
| 🔐 API Key Didit | ❌ Rechazada | Verificar en dashboard |
| 🌐 Webhook URL | ❌ No desplegado | Desplegar a Cloudflare |
| 🔗 Dominio | ❌ No configurado | Configurar DNS |
| 📱 Aplicación | ✅ Lista | Desplegar |

## 🎉 **RESULTADO ESPERADO**

Después del despliegue:

1. ✅ **Aplicación funcionando** en `https://red-salud.org`
2. ✅ **Webhook recibiendo** notificaciones de Didit
3. ✅ **Registro de médicos** completamente funcional
4. ✅ **Verificación biométrica** operativa
5. ✅ **Sistema médico** listo para producción

## 🚀 **COMANDOS RÁPIDOS**

```bash
# Preparar para despliegue
npm run deploy:build

# Verificar configuración
npm run diagnose:didit

# Probar integración
npm run test:didit
```

## 📞 **SOPORTE**

Si tienes problemas:

1. **Revisar logs** en Cloudflare Pages
2. **Verificar DNS** en tu proveedor
3. **Comprobar variables** de entorno
4. **Contactar soporte** de Cloudflare o Didit

---

**¡Una vez desplegado, el sistema estará 100% funcional!**
