# Flujo de Usuario: Gestión de Pacientes

## Descripción
Proceso completo de búsqueda, creación y edición de pacientes en el sistema.

## Diagrama de flujo

```
Usuario → Navega a /patients
  │
  ├── Listado de pacientes (con paginación futura)
  │     ├── Filtros de búsqueda: nombre, apellido, NSS, email, teléfono
  │     └── Resultados en tabla
  │
  ├── Hace clic en paciente existente
  │     └── → Detalle del paciente / Edición
  │           ├── Modifica datos personales
  │           ├── Modifica datos de contacto
  │           ├── Modifica dirección
  │           └── Guarda cambios → Confirmación → Vuelve al listado
  │
  └── Hace clic en "Nuevo Paciente"
        └── → Formulario de creación
              ├── Datos personales: nombre, apellidos, género, fecha nacimiento, NSS
              ├── Datos de contacto: email, teléfono, móvil
              ├── Dirección: calle, número, ciudad, provincia, código postal, país
              ├── Contacto alternativo: nombre, teléfono
              └── Guarda → Confirmación → Vuelve al listado
```

## Pasos detallados

### Búsqueda
1. Usuario navega a `/patients`
2. La tabla muestra pacientes (inicialmente los más recientes)
3. Usuario introduce filtros en los campos de búsqueda
4. Los resultados se actualizan dinámicamente
5. Usuario hace clic en una fila para ver detalle o editar

### Creación de paciente
1. Usuario hace clic en "Nuevo Paciente"
2. Rellena el formulario con los datos obligatorios
3. Sistema valida:
   - NSS único (si se proporciona)
   - Email único (si se proporciona)
   - Formato de email válido
   - Datos obligatorios presentes
4. Guarda → muestra toast de éxito → vuelve al listado

### Edición de paciente
1. Usuario hace clic en un paciente del listado
2. Se abre el formulario con datos precargados
3. Usuario modifica los campos necesarios
4. Sistema valida los cambios
5. Guarda → muestra toast de éxito → vuelve al listado

## Reglas de negocio aplicadas
- NSS único por paciente
- Email único por paciente
- Soft delete: los pacientes eliminados no se muestran pero persisten en BD
- Permisos: `patient.create` para crear, `patient.update` para editar, `patient.view` para ver
