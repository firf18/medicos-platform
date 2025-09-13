# Flujos de Autenticación - Pruebas de Extremo a Extremo

## 1. Flujo de Registro Completo

### Descripción
Verificar el flujo completo de registro de un nuevo usuario, desde el formulario hasta la verificación de email.

### Pasos
1. Navegar a la página de registro
2. Completar el formulario con datos válidos
3. Seleccionar un tipo de cuenta
4. Enviar el formulario
5. Verificar que se muestra el mensaje de éxito
6. Verificar que se redirige a la página de verificación de email
7. Verificar que se recibe el email de verificación
8. Hacer clic en el enlace de verificación
9. Verificar que se muestra la confirmación de verificación
10. Verificar que se puede iniciar sesión con las credenciales

### Criterios de Éxito
- El usuario se crea correctamente en la base de datos
- Se envía el email de verificación
- El enlace de verificación funciona correctamente
- El usuario puede iniciar sesión después de verificar el email

## 2. Flujo de Inicio de Sesión

### Descripción
Verificar el flujo completo de inicio de sesión de un usuario existente.

### Pasos
1. Navegar a la página de inicio de sesión
2. Ingresar credenciales válidas
3. Enviar el formulario
4. Verificar que se redirige al dashboard apropiado según el rol
5. Verificar que se muestra el mensaje de bienvenida

### Criterios de Éxito
- El usuario inicia sesión correctamente
- Se redirige al dashboard apropiado
- Se muestra el mensaje de bienvenida

## 3. Flujo de Recuperación de Contraseña

### Descripción
Verificar el flujo completo de recuperación de contraseña.

### Pasos
1. Navegar a la página de inicio de sesión
2. Hacer clic en "¿Olvidaste tu contraseña?"
3. Ingresar el email registrado
4. Enviar el formulario
5. Verificar que se muestra el mensaje de éxito
6. Verificar que se recibe el email de recuperación
7. Hacer clic en el enlace de recuperación
8. Ingresar nueva contraseña
9. Confirmar nueva contraseña
10. Enviar el formulario
11. Verificar que se muestra el mensaje de éxito
12. Verificar que se redirige a la página de inicio de sesión
13. Iniciar sesión con la nueva contraseña

### Criterios de Éxito
- Se envía el email de recuperación
- El enlace de recuperación funciona correctamente
- La contraseña se actualiza correctamente
- El usuario puede iniciar sesión con la nueva contraseña

## 4. Flujo de Protección de Rutas

### Descripción
Verificar que las rutas protegidas no son accesibles sin autenticación.

### Pasos
1. Navegar directamente a una ruta protegida sin iniciar sesión
2. Verificar que se redirige a la página de inicio de sesión
3. Iniciar sesión con credenciales válidas
4. Verificar que se redirige a la ruta protegida original
5. Cerrar sesión
6. Verificar que las rutas protegidas ya no son accesibles

### Criterios de Éxito
- Las rutas protegidas redirigen a la página de inicio de sesión cuando no hay sesión
- Después de iniciar sesión, se redirige a la ruta protegida original
- Después de cerrar sesión, las rutas protegidas ya no son accesibles

## 5. Flujo de Verificación de Roles

### Descripción
Verificar que los usuarios solo pueden acceder a las rutas permitidas por su rol.

### Pasos
1. Iniciar sesión con un usuario de tipo "paciente"
2. Intentar acceder a una ruta que requiere rol "admin"
3. Verificar que se muestra la página de acceso denegado
4. Iniciar sesión con un usuario de tipo "admin"
5. Intentar acceder a la misma ruta
6. Verificar que se permite el acceso

### Criterios de Éxito
- Los usuarios sin el rol adecuado son redirigidos a la página de acceso denegado
- Los usuarios con el rol adecuado pueden acceder a las rutas protegidas

## 6. Flujo de Expiración de Sesión

### Descripción
Verificar que las sesiones expiradas son manejadas correctamente.

### Pasos
1. Iniciar sesión con un usuario
2. Esperar a que la sesión expire (o simular expiración)
3. Intentar acceder a una ruta protegida
4. Verificar que se redirige a la página de inicio de sesión
5. Verificar que se muestra el mensaje de sesión expirada

### Criterios de Éxito
- Las sesiones expiradas redirigen a la página de inicio de sesión
- Se muestra el mensaje de sesión expirada
- El estado de autenticación se limpia correctamente

## 7. Flujo de Reenvío de Verificación de Email

### Descripción
Verificar que los usuarios pueden solicitar un nuevo email de verificación.

### Pasos
1. Navegar a la página de reenvío de verificación
2. Ingresar un email registrado
3. Enviar el formulario
4. Verificar que se muestra el mensaje de éxito
5. Verificar que se recibe el nuevo email de verificación

### Criterios de Éxito
- Se envía el nuevo email de verificación
- Se muestra el mensaje de éxito

## Consideraciones Técnicas

### Datos de Prueba
- Usar emails únicos para cada prueba
- Usar contraseñas que cumplan con los requisitos de seguridad
- Preparar usuarios de prueba con diferentes roles

### Variables de Entorno
- Configurar variables de entorno para el entorno de pruebas
- Usar una base de datos de prueba separada

### Herramientas Recomendadas
- Cypress para pruebas e2e
- Supabase local para pruebas de base de datos
- MailHog o similar para pruebas de emails