# Módulo Funcional: Pacientes

## Propósito de Negocio
Gestionar el catálogo de pacientes de la clínica, permitiendo su registro, búsqueda y actualización de datos demográficos y de contacto.

## Actores
- Médico
- Recepcionista (futuro)
- Administrador

## Funcionalidades
| Funcionalidad | Estado |
|--------------|--------|
| Búsqueda de pacientes con filtros múltiples | ✅ Implementado |
| Creación de nuevo paciente | ✅ Implementado |
| Edición de datos del paciente | ✅ Implementado |
| Visualización de detalle del paciente | ⚠️ Parcial |
| Eliminación de pacientes | ❌ Pendiente |
| Paginación en listados | ❌ Pendiente |

## Criterios de Aceptación
- El usuario debe poder buscar pacientes por nombre, apellido, NSS, email o teléfono
- Los resultados deben mostrarse en una tabla con columnas configurables
- Al crear un paciente, los campos obligatorios deben validarse
- No se pueden duplicar pacientes con el mismo NSS o email
- Los datos de contacto deben incluir: email, teléfono, móvil, dirección

## Reglas de Negocio
- El NSS (número de seguridad social) es único por paciente
- El email es único por paciente
- Un paciente puede tener múltiples direcciones (futuro)
- Solo los usuarios con permiso `patient.create` pueden dar de alta pacientes
- Solo los usuarios con permiso `patient.update` pueden editar pacientes
- La eliminación es lógica (soft delete), no física

## Flujo Principal — Búsqueda
1. Usuario navega a `/patients`
2. Introduce criterios de búsqueda (nombre, apellido, NSS…)
3. El sistema muestra resultados en una tabla
4. Usuario hace clic en un paciente para ver detalle o editar

## Flujo Principal — Creación
1. Usuario hace clic en "Nuevo Paciente"
2. Rellena el formulario con datos personales, contacto y demográficos
3. Sistema valida que NSS y email no existan
4. Guarda el paciente y muestra confirmación

## Dependencias
- API de pacientes (`GET /patients`, `POST /patients`, `PUT /patients/{id}`)

## Estado
⚠️ **Parcial.** La estructura frontend está completa. Pendiente verificar conexión end-to-end con API y agregar eliminación y paginación.

## Pendientes (Roadmap)
- [ ] Implementar eliminación de pacientes (soft delete)
- [ ] Agregar paginación en el listado
- [ ] Agregar ordenamiento por columnas en la tabla
- [ ] Permitir gestión de direcciones múltiples
- [ ] Mostrar historial de consultas del paciente (futuro)
- [ ] Adjuntar documentos al perfil del paciente (futuro)
