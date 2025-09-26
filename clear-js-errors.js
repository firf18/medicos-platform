// Script para limpiar errores de JavaScript
// Ejecutar en la consola del navegador

function clearJavaScriptErrors() {
  console.log('🧹 Limpiando errores de JavaScript...');
  
  // Limpiar caché del navegador
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
        console.log('🗑️ Caché eliminado:', name);
      });
    });
  }
  
  // Limpiar localStorage
  localStorage.clear();
  console.log('🗑️ localStorage limpiado');
  
  // Limpiar sessionStorage
  sessionStorage.clear();
  console.log('🗑️ sessionStorage limpiado');
  
  // Recargar página
  console.log('🔄 Recargando página...');
  window.location.reload();
}

// Ejecutar limpieza
clearJavaScriptErrors();
