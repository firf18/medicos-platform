# Configuración de Cloudflare para red-salud.org

## 1. CONFIGURAR DNS
Ve a tu dashboard de Cloudflare y configura:

### Registros DNS:
- Tipo: CNAME
- Nombre: @
- Valor: cname.vercel-dns.com
- Proxy: ✅ Activado

- Tipo: CNAME  
- Nombre: www
- Valor: cname.vercel-dns.com
- Proxy: ✅ Activado

## 2. CONFIGURAR SSL/TLS
- Modo de encriptación: "Completo (estricto)"
- Siempre usar HTTPS: ✅ Activado
- HSTS: ✅ Activado

## 3. CONFIGURAR CACHE
- Nivel de caché: "Estándar"
- TTL del navegador: "Respetar encabezados existentes"

## 4. CONFIGURAR SEGURIDAD
- Nivel de seguridad: "Alto"
- Bot Fight Mode: ✅ Activado
- Challenge Passage: 30 minutos

## 5. CONFIGURAR PÁGINAS DE ERROR
- 404: https://red-salud.org/404
- 500: https://red-salud.org/500

## 6. CONFIGURAR REDIRECCIONES
- HTTP a HTTPS: ✅ Automático
- www a non-www: ✅ Configurado

## 7. CONFIGURAR WEBHOOKS
Una vez que el dominio esté funcionando:
- Ve al panel de Didit
- Configura webhook URL: https://red-salud.org/api/webhooks/didit
- Configura webhook secret: NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck
