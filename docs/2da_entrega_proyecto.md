# ShieldTech - 2da Entrega
## Reporte de Pruebas de Seguridad

---

## a) Tipos de Pruebas Ejecutadas

| Tipo | Descripcion | Herramienta |
|---|---|---|
| Pruebas de autenticacion | Verificar que usuarios no autenticados no acceden a recursos protegidos | Postman / curl |
| Pruebas de autorizacion | Verificar que cada rol solo accede a sus rutas permitidas | Postman / curl |
| Pruebas de inyeccion | Intentar inyeccion NoSQL y XSS en campos de entrada | Manual + navegador |
| Pruebas de cifrado | Verificar que contrasenas estan hasheadas y tokens son seguros | Inspeccion de BD |
| Pruebas de headers | Verificar headers de seguridad HTTP en respuestas | DevTools navegador |
| Pruebas de sesion | Verificar expiracion de tokens y revocacion al logout | Postman |
| Pruebas de Vigenere | Verificar cifrado/descifrado correcto del modulo | PHPUnit |

## b) Niveles de Pruebas

| Nivel | Descripcion | Alcance |
|---|---|---|
| Unitarias | Pruebas del modulo VigenereCipher aislado | Cifrado/descifrado de strings |
| Integracion | Pruebas de endpoints API con autenticacion | Login, registro, CRUD vitales |
| Sistema | Pruebas end-to-end del flujo completo | Registro -> Login -> Dashboard -> Vitales -> Alertas |
| Seguridad | Pruebas especificas de vulnerabilidades | OWASP Top 10 aplicables |

---

## Reporte de Resultados de Pruebas

### Usuarios Finales (3 usuarios)

| Usuario | Rol | Prueba Realizada | Resultado | Observaciones |
|---|---|---|---|---|
| Usuario Final 1 | Paciente | Registro, login, ver dashboard, registrar vitales, enviar SOS | PASS | Flujo completo sin errores. Interfaz intuitiva en celular |
| Usuario Final 2 | Paciente | Editar perfil medico, ver historial de alertas, aceptar privacidad | PASS | Todos los campos se guardan correctamente. GPS funciona |
| Usuario Final 3 | Doctor | Login, ver pacientes, ver detalle con graficas, asignar paciente | PASS | Graficas de signos vitales se muestran correctamente |

### Usuarios Programadores (3 usuarios)

| Programador | Prueba Realizada | Resultado | Observaciones |
|---|---|---|---|
| Programador 1 | Intentar acceder a /api/admin/users con token de paciente | PASS (403) | Middleware CheckRole bloquea correctamente |
| Programador 2 | Enviar JSON malformado a /api/vitals, inyeccion NoSQL en email | PASS | Validacion rechaza datos invalidos. MongoDB no es vulnerable a SQL injection |
| Programador 3 | Inspeccionar headers HTTP, verificar que .env no es accesible, verificar bcrypt en BD | PASS | Headers de seguridad presentes. .env no expuesto. Contrasenas hasheadas |

### Detalle de Pruebas de Seguridad

#### Prueba 1: Acceso sin autenticacion
```
GET /api/dashboard (sin token)
Resultado: 401 {"message": "Unauthenticated."}
Estado: PASS
```

#### Prueba 2: Escalacion de privilegios
```
GET /api/admin/users (con token de paciente)
Resultado: 403 {"message": "No tienes permisos para esta accion."}
Estado: PASS
```

#### Prueba 3: Inyeccion en campo email
```
POST /api/login {"email": "admin'--", "password": "test"}
Resultado: 422 {"errors": {"email": ["El campo email debe ser una direccion de correo valida."]}}
Estado: PASS
```

#### Prueba 4: XSS en campo de notas
```
PUT /api/profile {"notes": "<script>alert('xss')</script>"}
Resultado: Se almacena como texto plano. React escapa HTML automaticamente al renderizar.
Estado: PASS
```

#### Prueba 5: Headers de seguridad
```
Respuesta HTTP incluye:
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self), camera=(), microphone=()
Estado: PASS
```

#### Prueba 6: Token expirado / revocado
```
POST /api/logout (revoca token actual)
GET /api/dashboard (con token revocado)
Resultado: 401 Unauthenticated
Estado: PASS
```

#### Prueba 7: Doctor accede a paciente de otro doctor
```
GET /api/doctor/patients/{id_paciente_ajeno}
Resultado: 403 {"message": "No autorizado."}
Estado: PASS
```

#### Prueba 8: Cifrado Vigenere
```
Texto: "demo@shieldtech.com"
Clave: "SHIELDTECH"
Cifrado: "vlus@dkbinkllkl.nrf"
Descifrado: "demo@shieldtech.com"
Estado: PASS
```

---

## Fallas Detectadas y Recomendaciones

| # | Falla | Severidad | Recomendacion | Estado |
|---|---|---|---|---|
| 1 | No hay rate limiting en endpoint de login | Media | Implementar throttle de 5 intentos por minuto | Pendiente |
| 2 | Tokens no tienen fecha de expiracion | Baja | Configurar expiracion en config/sanctum.php | Pendiente |
| 3 | No hay logs de intentos de login fallidos | Baja | Agregar logging en AuthController | Pendiente |
| 4 | Respaldos almacenan datos completos en MongoDB | Media | Cifrar datos del respaldo antes de almacenar | Pendiente |
| 5 | No hay validacion de complejidad de contrasena | Media | Agregar regla de mayusculas, numeros y simbolos | Pendiente |

---

## Leyes y Regulaciones Aplicables

### Ley Federal de Proteccion de Datos Personales en Posesion de los Particulares (LFPDPPP)
- **Articulo 6**: Los datos personales deben ser tratados de manera licita
- **Articulo 9**: Datos sensibles (salud) requieren consentimiento expreso
- **Cumplimiento**: Aviso de privacidad con checkbox de consentimiento y fecha de aceptacion

### Derechos ARCO (Acceso, Rectificacion, Cancelacion, Oposicion)
- **Acceso**: El usuario puede ver todos sus datos desde su perfil
- **Rectificacion**: El usuario puede editar su perfil medico en cualquier momento
- **Cancelacion**: El admin puede eliminar cuentas desde el panel
- **Oposicion**: El usuario puede revocar su consentimiento de privacidad

### NOM-024-SSA3-2012 (Sistemas de Informacion de Registro Electronico para la Salud)
- Registro de datos clinicos con fecha y hora
- Acceso controlado por roles (paciente, doctor, admin)
- Respaldos de informacion implementados

---

## Estandares, Protocolos y Herramientas de Seguridad

### Estandares
| Estandar | Aplicacion |
|---|---|
| OWASP Top 10 | Guia para prevencion de vulnerabilidades web |
| PSR-12 | Estandar de codificacion PHP |
| HTTPS/TLS | Cifrado de comunicacion en transito |
| bcrypt | Cifrado de contrasenas (12 rounds) |

### Protocolos de Seguridad
| Protocolo | Implementacion |
|---|---|
| Autenticacion por tokens | Laravel Sanctum con Bearer tokens |
| Control de acceso basado en roles (RBAC) | Middleware CheckRole con 3 roles |
| Cifrado en transito | MongoDB Atlas usa TLS por defecto |
| Cifrado en reposo | MongoDB Atlas cifra datos almacenados |
| Cifrado Vigenere | Modulo custom para datos de sesion |

### Herramientas
| Herramienta | Uso |
|---|---|
| Laravel Sanctum | Autenticacion API por tokens |
| Middleware SecurityHeaders | Headers HTTP de proteccion |
| MongoDB Atlas | BD en nube con cifrado y respaldos |
| bcrypt (PHP) | Hash de contrasenas |
| .env + .gitignore | Proteccion de credenciales |
| React DOM | Escape automatico de HTML (prevencion XSS) |

### Infraestructura
```
[Cliente: Navegador/Movil]
        |
        | HTTPS (TLS 1.3)
        |
[Servidor: Laravel API]
  - Middleware SecurityHeaders
  - Middleware CheckRole
  - Sanctum Token Auth
  - Validacion de inputs
  - Cifrado Vigenere
        |
        | MongoDB+SRV (TLS)
        |
[MongoDB Atlas - Nube]
  - Cifrado en reposo (AES-256)
  - Cifrado en transito (TLS)
  - Respaldos automaticos
  - Acceso por IP whitelist
```
