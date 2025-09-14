# 🔧 CONFIGURACIÓN DNS CORRECTA - RED-SALUD.ORG

## ❌ **PROBLEMA ACTUAL**

### **ESTADO DESPUÉS DE ELIMINAR REGISTROS:**
- **`red-salud.org`**: No resuelve a ninguna IP ❌
- **`www.red-salud.org`**: Dominio no existe ❌
- **Error**: `Could not resolve host` ❌

### **CAUSA:**
Al eliminar los registros DNS, el dominio **no apunta a ningún lugar**.

## 🛠️ **SOLUCIÓN INMEDIATA**

### **PASO 1: RECREAR REGISTROS DNS EN CLOUDFLARE**

#### **1.1 Acceder a Cloudflare Dashboard:**
1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com)
2. Selecciona `red-salud.org`
3. Ve a **DNS** → **Records**
4. Haz clic en **"+ Add record"**

#### **1.2 Crear registro CNAME para apex (@):**
```
Tipo: CNAME
Nombre: @
Contenido: cname.vercel-dns.com
Proxy: ❌ DESACTIVAR (Gris - DNS only)
TTL: Auto
```

#### **1.3 Crear registro CNAME para www:**
```
Tipo: CNAME
Nombre: www
Contenido: cname.vercel-dns.com
Proxy: ❌ DESACTIVAR (Gris - DNS only)
TTL: Auto
```

### **PASO 2: VERIFICAR CONFIGURACIÓN**

#### **2.1 Verificar que los registros se crearon:**
- Deberías ver **2 registros CNAME**
- Ambos con **Proxy desactivado** (Gris)
- Ambos apuntando a `cname.vercel-dns.com`

#### **2.2 Esperar propagación DNS:**
- **Tiempo estimado**: 5-15 minutos
- **Máximo**: 24 horas

### **PASO 3: VERIFICAR FUNCIONAMIENTO**

#### **3.1 Comandos de verificación:**
```bash
# Verificar resolución DNS
nslookup red-salud.org

# Verificar www
nslookup www.red-salud.org

# Probar acceso HTTPS
curl -I https://red-salud.org

# Probar www HTTPS
curl -I https://www.red-salud.org
```

#### **3.2 Resultados esperados:**
```bash
# nslookup red-salud.org debería mostrar:
# Addresses: 66.33.60.193, 76.76.21.142 (IPs de Vercel)

# curl -I https://red-salud.org debería mostrar:
# HTTP/1.1 200 OK
# Server: Vercel
```

## ⚠️ **IMPORTANTE**

### **POR QUÉ DESACTIVAR EL PROXY:**
1. **Cloudflare intercepta requests** cuando el proxy está activo
2. **Vercel necesita acceso directo** para funcionar
3. **El proxy causa conflictos** con Vercel

### **CONFIGURACIÓN CORRECTA:**
- ✅ **Proxy desactivado** (Gris - DNS only)
- ✅ **CNAME apuntando a Vercel**
- ✅ **TTL en Auto**

## 🔍 **VERIFICACIÓN PASO A PASO**

### **ANTES DE CREAR REGISTROS:**
```bash
nslookup red-salud.org
# Resultado: No resuelve (INCORRECTO)
```

### **DESPUÉS DE CREAR REGISTROS:**
```bash
nslookup red-salud.org
# Resultado: IPs de Vercel (CORRECTO)
```

### **PRUEBA DE ACCESO:**
```bash
curl -I https://red-salud.org
# Resultado esperado: 200 OK (CORRECTO)
```

## 📋 **CHECKLIST DE CONFIGURACIÓN**

- [ ] Crear registro CNAME para @ (apex)
- [ ] Crear registro CNAME para www
- [ ] Desactivar proxy en ambos registros (Gris)
- [ ] Verificar que apuntan a `cname.vercel-dns.com`
- [ ] Esperar propagación DNS (5-15 min)
- [ ] Probar `nslookup red-salud.org`
- [ ] Probar `nslookup www.red-salud.org`
- [ ] Probar `curl -I https://red-salud.org`
- [ ] Probar `curl -I https://www.red-salud.org`
- [ ] Verificar que devuelven 200 OK
- [ ] Probar funcionalidad completa

## 🎯 **PRÓXIMOS PASOS**

1. **Recrear registros DNS** (5 minutos)
2. **Esperar propagación** (5-15 minutos)
3. **Verificar funcionamiento** (2 minutos)
4. **Continuar con análisis de GitHub** ✅

---

**Una vez recreados los registros DNS correctamente, el dominio `red-salud.org` funcionará perfectamente con Vercel.**
