# Módulo Funcional: Administración — Datos de la Clínica

## Propósito de Negocio

Permitir al administrador configurar los datos institucionales de la clínica (nombre, dirección, contacto, CUIT) que aparecen en los informes médicos y en la interfaz del sistema. Reemplaza valores previamente hardcodeados como "Materia Gris" por datos dinámicos obtenidos de la API.

## Actores

- Administrador

## Funcionalidades

| Funcionalidad | Estado |
|--------------|--------|
| Visualización de datos actuales de la clínica | ✅ Implementado |
| Edición de todos los campos institucionales | ✅ Implementado |
| Validación de formato (email, URL, longitudes máx.) | ✅ Implementado |
| Los datos se reflejan automáticamente en informes | ✅ Implementado |
| Carga automática al iniciar la aplicación | ✅ Implementado |
| Acceso restringido por permiso `admin.clinic.update` | ✅ Implementado |

## Criterios de Aceptación

- Solo los administradores con permiso `admin.clinic.update` pueden acceder
- La página muestra los datos actuales al cargar (obtenidos de `GET /admin/clinic`)
- Todos los campos del formulario son editables
- La validación rechaza emails inválidos y URLs mal formadas
- Al guardar, se envía `PUT /admin/clinic` solo con los campos modificados
- Tras guardar exitosamente, los nuevos datos se reflejan en:
  - Encabezados de informes médicos
  - Variables de sistema `{clinica.*}`
  - Vista previa de plantillas de informes
- Si la clínica no existe en backend (404), se muestra mensaje informativo
- Si el usuario no es admin (403), se redirige al dashboard

## Reglas de Negocio

- La clínica es un singleton: existe una sola fila en el sistema
- No se puede crear ni eliminar la clínica — solo editar
- Todos los campos son opcionales en el PUT (PATCH-like semantics)
- Los campos `created_at` y `updated_at` son solo lectura (gestionados por backend)
- El CUIT es informativo, no se valida formato fiscal
- El teléfono acepta formato libre (nacional e internacional)
- La URL del sitio web debe ser una URL válida (con protocolo)

## Flujo Principal

1. Administrador hace clic en "Ajustes" (⚙️) en la sidebar
2. Selecciona "Clínica" en el dropdown (primer ítem)
3. El sistema carga los datos actuales desde `GET /admin/clinic`
4. Se muestra el formulario con todos los campos precargados
5. Administrador modifica los campos necesarios
6. Hace clic en "Guardar cambios"
7. El sistema valida los campos (email, URL, longitudes)
8. Si la validación pasa → `PUT /admin/clinic` → toast de éxito
9. Los nuevos datos se reflejan inmediatamente en:
   - Informes médicos (nombre, dirección, teléfono, etc.)
   - Variables de plantilla `{clinica.nombre}`, `{clinica.cuit}`, etc.

## Flujos Alternativos

### Clínica no configurada (404)
1. Administrador accede a la página
2. El sistema intenta `GET /admin/clinic` → 404
3. Se muestra mensaje: "No hay datos de clínica configurados. Use el formulario para crearlos."
4. El formulario aparece vacío, listo para completar
5. Al guardar, se crea el registro vía PUT

### Error de validación (422)
1. Administrador ingresa un email inválido (ej: "no-es-email")
2. Al guardar, el backend responde 422
3. Se muestran los errores de validación debajo de cada campo
4. El administrador corrige y vuelve a guardar

### Sin permisos (403)
1. Usuario sin rol admin intenta acceder a `/admin/clinic`
2. El guard del router verifica el permiso `admin.clinic.update`
3. No tiene el permiso → redirige al dashboard
4. La entrada "Clínica" no aparece en el menú Ajustes

### Campos del profesional sin datos
1. El endpoint `/me` devuelve `num_colegiado: null` (profesional sin matrícula cargada)
2. En los informes, la variable `{medico.matricula}` muestra `"—"`
3. El sistema no falla — maneja nulos gracefulmente

## Dependencias

- API `GET /admin/clinic` — obtener datos de clínica
- API `PUT /admin/clinic` — actualizar datos
- API `GET /me` — campos del profesional (`apellido`, `num_colegiado`, `especialidad`, `telefono`)
- Store `useClinicStore` — caché reactiva de datos de clínica
- Composable `useReportVariableResolver` — resuelve variables para informes
- Permiso `admin.clinic.update` — control de acceso

## Estado

✅ **Completo.** Página, formulario, validación, store, integración con informes y sidebar — todo implementado.

## Pendientes (Roadmap)

- [ ] Subida de logo de la clínica (requiere endpoint en backend)
- [ ] Vista previa de cómo se ven los datos en un informe real
- [ ] Historial de cambios (quién modificó qué y cuándo)
