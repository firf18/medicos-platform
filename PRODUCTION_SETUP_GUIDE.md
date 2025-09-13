# 🚀 GUÍA COMPLETA DE CONFIGURACIÓN PARA PRODUCCIÓN

## 📊 **ESTADO ACTUAL**

### ✅ **LO QUE YA ESTÁ CONFIGURADO:**
- ✅ **Proyecto en GitHub**: `https://github.com/firf18/medicos-platform.git`
- ✅ **Desplegado en Vercel**: `https://red-salud-platform-iwak76pbf-firf1818-8965s-projects.vercel.app`
- ✅ **Dominio agregado**: `red-salud.org` en Vercel
- ✅ **MCP configurado**: Vercel + GitHub funcionando
- ✅ **Variables de entorno**: Configuradas
- ✅ **GitHub Actions**: Configurado para despliegue automático
- ✅ **Scripts de monitoreo**: Creados

### ❌ **LO QUE FALTA POR HACER:**

## 🔧 **PASO 1: CONFIGURAR DNS EN CLOUDFLARE**

### **1.1 Ve a tu dashboard de Cloudflare**
1. Inicia sesión en [Cloudflare](https://dash.cloudflare.com)
2. Selecciona el dominio `red-salud.org`

### **1.2 Configura los registros DNS:**
```
Tipo: CNAME
Nombre: @
Valor: cname.vercel-dns.com
Proxy: ✅ Activado

Tipo: CNAME  
Nombre: www
Valor: cname.vercel-dns.com
Proxy: ✅ Activado
```

### **1.3 Configura SSL/TLS:**
- Modo de encriptación: **"Completo (estricto)"**
- Siempre usar HTTPS: ✅ **Activado**
- HSTS: ✅ **Activado**

### **1.4 Configura Seguridad:**
- Nivel de seguridad: **"Alto"**
- Bot Fight Mode: ✅ **Activado**
- Challenge Passage: **30 minutos**

## 🔑 **PASO 2: CONFIGURAR SECRETS EN GITHUB**

### **2.1 Ve a tu repositorio en GitHub**
1. Ve a `https://github.com/firf18/medicos-platform`
2. Haz clic en **Settings** → **Secrets and variables** → **Actions**

### **2.2 Agrega estos secrets:**
```
VERCEL_TOKEN = gJC7Ln77wkBoKlUSbo0wFxYA
VERCEL_ORG_ID = firf1818-8965s
VERCEL_PROJECT_ID = red-salud-platform
```

### **2.3 Para obtener VERCEL_PROJECT_ID:**
```bash
vercel ls --token gJC7Ln77wkBoKlUSbo0wFxYA --yes
```

## 🔗 **PASO 3: CONFIGURAR WEBHOOK DE DIDIT**

### **3.1 Una vez que el DNS esté funcionando:**
1. Ve al panel de Didit
2. Configura el webhook:
   ```
   URL: https://red-salud.org/api/webhooks/didit
   Secret: NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck
   ```

## 🧪 **PASO 4: PROBAR EL SISTEMA**

### **4.1 Verificar que todo funcione:**
```bash
npm run health:check
```

### **4.2 Probar despliegue automático:**
1. Haz un cambio pequeño en el código
2. Haz commit y push a GitHub
3. Verifica que se despliegue automáticamente en Vercel

## 🎯 **RESULTADO FINAL**

Una vez completado todo:

### ✅ **Despliegue Automático:**
- Cada push a `main` → Despliegue automático a Vercel
- Tests automáticos antes del despliegue
- Notificaciones de estado

### ✅ **URLs Funcionando:**
- **Aplicación**: `https://red-salud.org`
- **Registro de médicos**: `https://red-salud.org/auth/register/doctor`
- **Webhook Didit**: `https://red-salud.org/api/webhooks/didit`

### ✅ **Monitoreo:**
- Script de verificación de salud
- Logs de Vercel
- Notificaciones de errores

## 📋 **COMANDOS ÚTILES**

```bash
# Desplegar manualmente
npm run deploy:auto

# Verificar estado de servicios
npm run health:check

# Configurar producción completa
npm run setup:production

# Ver logs de Vercel
vercel logs --token gJC7Ln77wkBoKlUSbo0wFxYA
```

## 🚨 **ORDEN DE PRIORIDAD**

1. **🔴 CRÍTICO**: Configurar DNS en Cloudflare
2. **🟡 IMPORTANTE**: Configurar secrets en GitHub
3. **🟡 IMPORTANTE**: Actualizar webhook de Didit
4. **🟢 OPCIONAL**: Configurar monitoreo avanzado

## 💡 **CONSEJOS**

- **DNS**: Puede tomar hasta 24 horas para propagarse completamente
- **Testing**: Usa `npm run health:check` para verificar el estado
- **Logs**: Revisa los logs de Vercel si hay problemas
- **Backup**: Mantén backups de las configuraciones importantes

---

**¿Por dónde quieres empezar? Te recomiendo comenzar con la configuración del DNS en Cloudflare.**
