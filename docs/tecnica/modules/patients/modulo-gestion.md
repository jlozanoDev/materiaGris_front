# Gestión de Pacientes

## Descripción
Módulo para la gestión del catálogo de pacientes: búsqueda avanzada, creación y actualización de datos demográficos y de contacto.

## Ruta
| Ruta | Vista | Acceso |
|------|-------|--------|
| `/patients` | `PatientsPage.vue` | Autenticado |

## Componentes Relacionados

| Componente | Ubicación | Propósito |
|------------|-----------|-----------|
| `PatientsPage.vue` | `modules/patients/presentation/pages/` | Página principal del módulo |
| `UiVuetifyDataTable.vue` | `shared/components/` | DataTable para listado de pacientes |

## Lógica de Estado

### Composable: `usePatients` (`modules/patients/presentation/composables/usePatients.js`)

Gestiona el estado reactivo local de la página de pacientes.

### Casos de Uso (Domain)

| Use Case | Método | Propósito |
|----------|--------|-----------|
| `SearchPatientsUseCase` | `execute(filters)` | Buscar pacientes con filtros (nombre, documento, etc.) |
| `CreatePatientUseCase` | `execute(patientData)` | Crear nuevo paciente |
| `UpdatePatientUseCase` | `execute(id, data)` | Actualizar paciente existente |

### Infraestructura

| Clase | Propósito |
|-------|-----------|
| `ApiPatientRepository` | Implementación HTTP con `fetchClient` |

### Contenedor (DI)

| Contenedor | Exporta |
|------------|---------|
| `patientsContainer.js` | `provideSearchPatientsUseCase()`, `provideCreatePatientUseCase()` |

### Entidad: `Patient` (`domain/entities/Patient.js`)

Atributos principales: `medicalRecordNumber`, `nationalId`, `firstName`, `lastName`, `secondLastName`, `gender`, `dateOfBirth`, `city`, `email`, `phone`, `mobile`, `addressLine1`, `addressLine2`, `neighborhood`, `postalCode`, `state`, `country`, `contactName`, `contactPhone`, `isActive`.

## Estado de Desarrollo
⚠️ **Parcial**. La estructura Clean Architecture está completa (entidad, repositorio, casos de uso, infraestructura, contenedor, presentación). Sin embargo:
- No existe use case para eliminación de pacientes
- No hay un `DeletePatientUseCase` aunque la UI podría requerirlo
- No se verificó si el composable `usePatients` consume correctamente los use cases

## Pendientes (Roadmap)

- [ ] Implementar `DeletePatientUseCase` (soft delete)
- [ ] Verificar que `usePatients` composable usa correctamente `SearchPatientsUseCase` y `CreatePatientUseCase`
- [ ] Agregar paginación en el listado de pacientes
- [ ] Soporte para ordenamiento por columnas
- [ ] Confirmar permisos: `patient.view`, `patient.create`, `patient.update`, `patient.delete`
- [ ] Agregar validación de formularios (nombre, documento único, email)
- [ ] Tests unitarios para casos de uso y composable
- [ ] Integrar con módulo de consultas cuando exista (historial de consultas del paciente)
