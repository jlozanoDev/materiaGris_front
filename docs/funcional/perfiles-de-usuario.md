# Perfiles de Usuario

## Médico

| Atributo | Descripción |
|----------|-------------|
| **Objetivo** | Atender pacientes y gestionar consultas médicas |
| **Acceso principal** | Dashboard (`/`) y Pacientes (`/patients`) |
| **Funcionalidades clave** | Ver resumen diario, buscar pacientes, consultar historial |
| **Permisos típicos** | `patient.view`, `patient.create`, `patient.update` |
| **Frecuencia de uso** | Alta (uso diario) |

**Flujo típico:**
1. Inicia sesión → Dashboard con resumen del día
2. Busca un paciente en la lista de pacientes del día
3. Accede al detalle del paciente
4. Realiza la consulta (futuro: registrar diagnóstico, receta, órdenes)
5. Cierra la consulta

## Administrador

| Atributo | Descripción |
|----------|-------------|
| **Objetivo** | Mantener el sistema: usuarios, roles y permisos |
| **Acceso principal** | Panel de administración (`/admin/*`) |
| **Funcionalidades clave** | CRUD usuarios, gestión de roles, asignación de permisos |
| **Permisos típicos** | `admin.user.*`, `admin.role.*`, `admin.permission.*` |
| **Frecuencia de uso** | Media (uso semanal o ante cambios en el equipo) |

**Flujo típico:**
1. Inicia sesión → Dashboard
2. Navega a Administración → Usuarios
3. Crea un nuevo usuario o edita uno existente
4. Asigna roles y permisos específicos
5. El usuario creado ya puede acceder al sistema

## Recepcionista (futuro)

| Atributo | Descripción |
|----------|-------------|
| **Objetivo** | Registrar pacientes y gestionar la agenda |
| **Acceso principal** | Pacientes y Calendario (futuro) |
| **Funcionalidades clave** | Alta de pacientes, búsqueda, gestión de citas |
| **Permisos típicos** | `patient.create`, `patient.view` |
| **Frecuencia de uso** | Alta (uso diario) |

**Flujo típico (futuro):**
1. Inicia sesión → Panel de recepcionista
2. Registra un nuevo paciente que llega al consultorio
3. Asigna una cita en el calendario
4. Deriva al paciente a la sala de espera
