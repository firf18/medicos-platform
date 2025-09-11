/**
 * Script para limpiar el estado de autenticación corrupto
 * Ejecutar en la consola del navegador cuando hay problemas de cookies
 */

console.log('🧹 Limpiando estado de autenticación...');

// Limpiar localStorage
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('auth')) {
    localStorage.removeItem(key);
    console.log(`✅ Removido localStorage: ${key}`);
  }
});

// Limpiar sessionStorage
Object.keys(sessionStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('auth')) {
    sessionStorage.removeItem(key);
    console.log(`✅ Removido sessionStorage: ${key}`);
  }
});

// Limpiar cookies de Supabase
document.cookie.split(";").forEach(function(c) { 
  const cookieName = c.replace(/^ +/, "").replace(/=.*/, "");
  if (cookieName.includes('supabase') || cookieName.includes('auth')) {
    document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    console.log(`✅ Removida cookie: ${cookieName}`);
  }
});

console.log('🎉 Estado de autenticación limpiado. ¡Recarga la página!');
console.log('🔄 Ejecuta: window.location.reload()');