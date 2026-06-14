# Módulo Funcional: Dashboard

## Propósito de Negocio
Proporcionar al médico una visión general del día: pacientes pendientes, consultas activas y estadísticas rápidas, permitiendo acceder rápidamente a las tareas del día.

## Actores
- Médico (principal)
- Administrador (visión general)

## Funcionalidades
| Funcionalidad | Estado |
|--------------|--------|
| Tarjeta de bienvenida con estadísticas (visitas hoy, pacientes nuevos/antiguos) | ⚠️ Parcial (datos hardcoded) |
| Lista de pacientes del día | ⚠️ Parcial (datos hardcoded) |
| Panel de consulta rápida | ⚠️ Parcial (maqueta visual) |
| Calendario mensual | ⚠️ Parcial (maqueta visual) |
| Conexión con datos reales de la API | ❌ Pendiente |

## Criterios de Aceptación
- El dashboard debe cargar los datos del día actual desde la API
- Las estadísticas deben reflejar datos reales (no hardcoded)
- La lista de pacientes del día debe ser interactiva (clic → detalle del paciente)
- El panel de consulta debe permitir iniciar una consulta desde el dashboard
- El calendario debe mostrar las citas del mes (futuro)

## Reglas de Negocio
- El dashboard solo muestra información del día actual
- Los datos deben actualizarse al menos cada vez que se accede a la página
- Solo los médicos ven la lista de pacientes del día

## Flujo Principal
1. Médico inicia sesión → redirigido a `/`
2. Ve el resumen del día: visitas hoy, pacientes nuevos, pacientes antiguos
3. Ve la lista de pacientes con consulta programada para hoy
4. Hace clic en un paciente → abre el panel de consulta
5. Desde el panel puede registrar la consulta (futuro)

## Dependencias
- API de dashboard/estadísticas (no implementada)
- API de pacientes
- API de consultas (no implementada)

## Estado
⚠️ **Parcial — maqueta visual.** Todos los componentes muestran datos hardcoded. No hay integración con API real.

## Pendientes (Roadmap)
- [ ] Definir endpoint de estadísticas del dashboard en la API
- [ ] Reemplazar datos hardcoded en HeroCard, PatientList
- [ ] Conectar calendario con módulo de citas (futuro)
- [ ] Hacer clic en paciente → ir a detalle/iniciar consulta
- [ ] Widgets configurables por rol de usuario
