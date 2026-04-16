# ShieldTech - Proyecto Cuatrimestral
## Sistema de Monitoreo de Salud en Tiempo Real

---

## Problematica del Problema

En Mexico, las enfermedades cardiovasculares son la primera causa de muerte, y muchas emergencias medicas ocurren cuando el paciente esta solo o lejos de un centro de salud. Los smartwatches actuales recopilan signos vitales pero no tienen un sistema centralizado que permita a doctores monitorear pacientes remotamente ni enviar alertas automaticas a contactos de emergencia.

ShieldTech resuelve esto proporcionando:
- Monitoreo continuo de signos vitales (ritmo cardiaco, oxigenacion, temperatura, presion arterial)
- Alertas automaticas cuando se detectan valores anormales
- Boton SOS con geolocalizacion para emergencias
- Panel medico para que doctores supervisen a sus pacientes remotamente
- Perfil medico completo accesible en emergencias

---

## Herramientas de Desarrollo Web (Justificacion)

| Herramienta | Version | Justificacion |
|---|---|---|
| **Laravel** | 12.x | Framework PHP robusto con autenticacion integrada (Sanctum), ORM Eloquent, validacion, middlewares y soporte nativo para MongoDB. Ideal para APIs REST seguras |
| **React** | 18.x | Libreria de UI con componentes reutilizables, estado reactivo y ecosistema maduro. Permite crear interfaces responsivas para movil y escritorio |
| **MongoDB Atlas** | Cloud | Base de datos NoSQL flexible para datos medicos con esquema variable. Hospedada en la nube para acceso desde cualquier dispositivo |
| **Tailwind CSS** | 4.x | Framework CSS utility-first que permite diseño responsivo rapido sin CSS personalizado |
| **Vite** | 7.x | Bundler moderno con Hot Module Replacement para desarrollo rapido |
| **Laravel Sanctum** | 4.x | Sistema de autenticacion por tokens API, ligero y seguro para SPAs |
| **Framer Motion** | 11.x | Libreria de animaciones para React que proporciona transiciones fluidas entre paginas |
| **Chart.js** | 4.x | Libreria de graficas para visualizar historiales de signos vitales |

### Justificacion del Framework

**Laravel + React** fue elegido sobre otras opciones por:

1. **vs Django + Vue**: Laravel tiene mejor integracion con MongoDB via `mongodb/laravel-mongodb` y Sanctum es mas simple que JWT para SPAs
2. **vs Express + React**: Laravel provee estructura MVC completa, validacion, middlewares y ORM sin configuracion adicional. Express requiere instalar todo por separado
3. **vs Next.js fullstack**: Laravel ofrece mejor separacion backend/frontend, middlewares de seguridad nativos y mejor soporte para roles/permisos

---

## Plan SDLC y S-SDLC

### Diagrama de Gantt (Etapas del Ciclo de Vida)

```
Semana:        1    2    3    4    5    6    7    8    9   10   11   12
               |----|----|----|----|----|----|----|----|----|----|----|----|
Analisis       [=========]
Req. Seguridad [=========]
Diseno              [=========]
Codificacion             [=======================]
Pruebas                                    [===========]
Pruebas Seg.                                    [===========]
Despliegue                                                [=====]
Documentacion  [=====================================================]
```

| Etapa | Fechas | Actividades SDLC | Actividades S-SDLC |
|---|---|---|---|
| Analisis | Sem 1-2 | Requerimientos funcionales, casos de uso | Identificacion de amenazas, requerimientos de seguridad |
| Diseno | Sem 2-3 | Arquitectura, modelo BD, wireframes | Diseno de autenticacion, cifrado, control de acceso |
| Codificacion | Sem 3-7 | Backend API, Frontend React, BD MongoDB | Implementacion de cifrado Vigenere, CSRF, headers seguridad |
| Pruebas | Sem 6-8 | Pruebas funcionales, integracion | Pruebas de penetracion, validacion de inputs, XSS |
| Despliegue | Sem 9-10 | Deploy en servidor, configuracion | Hardening, HTTPS, variables de entorno seguras |
| Mantenimiento | Sem 10-12 | Monitoreo, correccion de bugs | Actualizacion de dependencias, revision de logs |

---

## a) Analisis - Requerimientos Funcionales

### RF-01: Autenticacion de Usuarios
- El sistema debe permitir registro con nombre, email, contrasena y rol
- El sistema debe autenticar usuarios mediante tokens (Sanctum)
- El sistema debe soportar 3 roles: paciente, doctor, admin
- Las sesiones deben expirar automaticamente

### RF-02: Monitoreo de Signos Vitales
- El sistema debe registrar: ritmo cardiaco (BPM), oxigenacion (SpO2), temperatura, presion arterial, pasos
- El sistema debe almacenar coordenadas GPS con cada lectura
- El sistema debe mostrar historial paginado de signos vitales
- El sistema debe graficar tendencias de ritmo cardiaco y oxigenacion

### RF-03: Sistema de Alertas
- El sistema debe generar alertas automaticas cuando los signos vitales estan fuera de rango
- Umbrales: BPM < 50 o > 120, SpO2 < 90, Temp < 35 o > 39, Sistolica > 140
- El sistema debe permitir enviar alertas SOS manuales con geolocalizacion
- Las alertas deben poder marcarse como resueltas

### RF-04: Perfil Medico
- El sistema debe almacenar: tipo de sangre, genero, CURP, alergias, condiciones cronicas, medicamentos
- El sistema debe registrar 2 contactos de emergencia
- El sistema debe almacenar datos del doctor familiar (opcional)
- El sistema debe registrar seguro medico y direccion GPS del hogar

### RF-05: Panel de Doctor
- El doctor debe ver la lista de sus pacientes asignados
- El doctor debe ver signos vitales en tiempo real de cada paciente
- El doctor debe ver graficas de ritmo cardiaco, oxigenacion y presion arterial
- El doctor debe poder asignar/desasignar pacientes

### RF-06: Panel de Administrador
- El admin debe poder ver y gestionar todos los usuarios
- El admin debe poder cambiar roles de usuarios
- El admin debe poder crear respaldos de la base de datos
- El admin debe poder restaurar, descargar y eliminar respaldos

### RF-07: Responsividad
- La aplicacion debe funcionar en celular, tablet y escritorio
- Navegacion inferior en movil, barra superior en escritorio

---

## b) Requerimientos de Seguridad

### RS-01: Autenticacion y Autorizacion
- Contrasenas cifradas con bcrypt (12 rounds)
- Tokens de acceso via Laravel Sanctum (Bearer tokens)
- Middleware de verificacion de roles por ruta
- Revocacion de tokens anteriores al iniciar sesion

### RS-02: Proteccion de Datos
- Cifrado Vigenere para datos sensibles en registro de sesion
- Variables de entorno (.env) para credenciales de BD
- Archivo .env excluido de repositorio via .gitignore
- Datos medicos accesibles solo por el usuario propietario

### RS-03: Proteccion contra Ataques
- Proteccion CSRF en formularios (token meta tag)
- Headers de seguridad HTTP: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- Validacion de inputs en backend (tipo, rango, longitud)
- Sanitizacion de datos antes de almacenar en MongoDB

### RS-04: Privacidad
- Aviso de privacidad accesible desde el perfil
- Consentimiento explicito con fecha de aceptacion
- Cumplimiento con derechos ARCO
- Datos no compartidos con terceros

### RS-05: Infraestructura
- Base de datos en MongoDB Atlas (cifrado en transito y reposo)
- Conexion via MongoDB+SRV con TLS
- Sistema de respaldos integrado en panel de admin
- Logs de errores en storage/logs (no expuestos al publico)

---

## c) Diseno - Buenas Practicas y Mecanismos de Proteccion

### Arquitectura
```
[React SPA] <--HTTPS/Token--> [Laravel API] <--TLS--> [MongoDB Atlas]
     |                              |
     |-- Framer Motion             |-- Sanctum (tokens)
     |-- React Router              |-- Middleware CheckRole
     |-- Axios + interceptors      |-- Middleware SecurityHeaders
     |-- Context Auth              |-- Validacion de inputs
     |-- Tailwind CSS              |-- Bcrypt (passwords)
                                   |-- Cifrado Vigenere (sesion)
```

### Buenas Practicas Implementadas
1. **Separacion de responsabilidades**: Frontend (React) y Backend (Laravel API) independientes
2. **Principio de minimo privilegio**: Cada rol solo accede a sus rutas autorizadas
3. **Defensa en profundidad**: Multiples capas de seguridad (token + middleware + validacion)
4. **Datos sensibles fuera del codigo**: Credenciales en .env, nunca en repositorio
5. **Modelo MVC**: Controllers, Models, Views separados y organizados

### Mecanismos de Proteccion
| Mecanismo | Implementacion | Archivo |
|---|---|---|
| Cifrado de contrasenas | bcrypt 12 rounds | `Auth::make()` |
| Tokens API | Laravel Sanctum Bearer | `PersonalAccessToken.php` |
| Roles y permisos | Middleware CheckRole | `CheckRole.php` |
| Headers seguridad | Middleware SecurityHeaders | `SecurityHeaders.php` |
| Validacion de inputs | `$request->validate()` | Controllers API |
| CSRF Protection | Meta tag + Sanctum stateful | `app.blade.php` |
| Cifrado Vigenere | Modulo custom | `VigenereCipher.php` |

---

## d) Codificacion

### d.1) Estandares de Codificacion

#### Backend (PHP/Laravel)
- PSR-12 para estilo de codigo PHP
- Nombres de clases en PascalCase: `VitalSignController`
- Nombres de metodos en camelCase: `patientDetail()`
- Nombres de tablas/colecciones en snake_case: `vital_signs`
- Validacion obligatoria en todos los endpoints que reciben datos
- Respuestas JSON estandarizadas con codigos HTTP correctos

#### Frontend (React/JavaScript)
- Componentes funcionales con hooks
- Nombres de componentes en PascalCase: `DoctorPatients.jsx`
- Estado manejado con Context API (AuthContext)
- Axios interceptors para inyeccion automatica de tokens
- Manejo de errores 401 con redireccion automatica a login

#### Privacidad y Confidencialidad
- Contrasenas NUNCA almacenadas en texto plano (bcrypt hash)
- Tokens de sesion con hash SHA-256 en base de datos
- Variables de entorno para credenciales (DB_URI, APP_KEY)
- .gitignore excluye: .env, vendor/, node_modules/, storage/logs/
- Datos medicos solo accesibles por el usuario propietario o su doctor asignado
- Panel de admin protegido por middleware de rol
- Aviso de privacidad con consentimiento explicito y fecha

### d.2) Pruebas de Seguridad

| Prueba | Tipo | Resultado Esperado |
|---|---|---|
| Acceso sin token a /api/dashboard | Autenticacion | 401 Unauthorized |
| Paciente accede a /api/admin/users | Autorizacion | 403 Forbidden |
| Inyeccion SQL en campo email | Inyeccion | Rechazado por validacion |
| XSS en campo de notas medicas | XSS | Sanitizado por React |
| CSRF sin token | CSRF | 419 Token Mismatch |
| Fuerza bruta en login | Rate limiting | Bloqueado despues de intentos |
| Acceso a .env via URL | Exposicion | 404 Not Found |
| Doctor accede a paciente ajeno | Autorizacion | 403 No autorizado |

---

## Modulo de Cifrado Vigenere

El cifrado Vigenere se implementa para proteger datos sensibles durante el registro de sesion.
