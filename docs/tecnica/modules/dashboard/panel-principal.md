# Dashboard Principal

## Descripción
Pantalla principal de la aplicación tras el inicio de sesión. Muestra un resumen de la actividad diaria: estadísticas, lista de pacientes del día, panel de consulta rápida y calendario.

## Ruta
| Ruta | Vista | Acceso |
|------|-------|--------|
| `/` | `DashboardPage.vue` | Autenticado |

## Componentes Relacionados

| Componente | Ubicación | Propósito |
|------------|-----------|-----------|
| `DashboardPage.vue` | `modules/dashboard/presentation/pages/` | Página principal (layout) |
| `HeroCard.vue` | `modules/dashboard/presentation/components/` | Tarjeta de bienvenida con estadísticas (visitas hoy, pacientes nuevos/antiguos) |
| `PatientList.vue` | `modules/dashboard/presentation/components/` | Lista de pacientes del día |
| `ConsultationPanel.vue` | `modules/dashboard/presentation/components/` | Panel de consulta con detalle de paciente, síntomas, observación, prescripción |
| `RightPanel.vue` | `modules/dashboard/presentation/components/` | Panel lateral derecho: calendario mensual + mini-estadísticas |
| `AppSidebar.vue` | `shared/components/` | Sidebar de navegación |
| `TopBar.vue` | `shared/components/` | Barra superior con búsqueda, notificaciones, avatar |

## Lógica de Estado

### Props y emits
- Los componentes del dashboard NO reciben props del router
- No hay store dedicada al dashboard
- `PatientList.vue` contiene datos hardcoded (no conectado a API)
- `ConsultationPanel.vue` muestra datos de ejemplo

### Estado actual
El dashboard opera completamente con datos dummy/ficticios. No hay conexión a la API real ni use cases definidos para este módulo.

## Estado de Desarrollo
⚠️ **En progreso — Maqueta visual**. Los componentes muestran datos hardcoded. No hay integración con la API. No hay casos de uso definidos en la capa de dominio.

## Pendientes (Roadmap)

- [ ] Definir entidades de dominio para Dashboard (estadísticas, resumen diario)
- [ ] Crear repositorio e interfaz para datos del dashboard
- [ ] Implementar `GetDashboardStatsUseCase` y conectar con API
- [ ] Reemplazar datos hardcoded en `PatientList.vue` con datos reales
- [ ] Reemplazar datos hardcoded en `HeroCard.vue` con datos reales
- [ ] Conectar `ConsultationPanel.vue` con flujo real de consultas
- [ ] Conectar `RightPanel.vue` calendario con módulo de citas (aún no existe)
- [ ] Definir permisos específicos para dashboard si aplica
- [ ] Tests unitarios y de integración
