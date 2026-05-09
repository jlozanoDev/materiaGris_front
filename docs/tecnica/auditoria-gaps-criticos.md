# Resumen de Gaps y Vacíos Críticos Detectados

## 🔴 Críticos

### 1. Dashboard sin conexión a API
- `PatientList.vue`, `HeroCard.vue`, `ConsultationPanel.vue`, `RightPanel.vue` usan datos hardcoded
- No existen casos de uso para el dashboard
- No hay entidades de dominio ni repositorios definidos
- **Impacto**: La pantalla principal de la app no muestra datos reales

### 2. Sidebar referencia rutas inexistentes
- `AppSidebar.vue` tiene entradas para `/calendar`, `/chat` y `/clock`
- Estas rutas NO están definidas en el router (`core/router/index.js`)
- Navegar a ellas lanza error 404
- **Impacto**: UX rota, enlaces muertos en navegación principal

### 3. Duplicidad de AuthService
- `main.js` crea `AuthService` y lo registra via `serviceRegistry`
- `LoginView.vue` crea su propia instancia via `provideAuthService()`
- Posible inconsistencia en el manejo de sesión
- **Impacto**: Riesgo de bugs de autenticación, violación del patrón de DI

### 4. DataTable duplicado
- Existen `UiDataTable.vue` (TanStack Table) y `UiVuetifyDataTable.vue` (Vuetify)
- Solo `UiVuetifyDataTable` se usa en las vistas
- `UiDataTable` es código muerto (no referenciado)
- **Impacto**: Bundle inflado, mantenimiento duplicado

## 🟡 Medios

### 5. Sin persistencia real verificada
- Los módulos admin (users, roles, permissions) tienen infraestructura completa pero no se ha verificado conexión end-to-end con API
- No hay evidencia de que los casos de uso se ejecuten correctamente contra endpoints reales

### 6. Módulo de Consultas no implementado
- `consultations-module.md` en API docs define tabla, permisos y endpoints
- No existe implementación backend ni frontend
- El `ConsultationPanel.vue` en dashboard sugiere que debería existir
- **Impacto**: Funcionalidad crítica de negocio no implementada

### 7. Mezcla de librerías UI
- PrimeVue, Vuetify y Tailwind CSS coexisten
- Potencial conflicto de estilos y peso innecesario en bundle
- **Impacto**: Mantenibilidad, consistencia visual, performance

### 8. Sin tests implementados
- Carpeta `tests/` existe pero vacía (sin archivos de test)
- No hay cobertura de tests unitarios ni E2E
- **Impacto**: Riesgo de regresiones, imposibilidad de CI/CD confiable

## 🟢 Leves

### 9. Documentación de pantallas faltante
- No existían docs individuales por módulo/pantalla (se crearon en esta auditoría)
- Solo existían docs de arquitectura general y ACL/permisos

### 10. Sin manejo de errores consistente
- No se observa un patrón unificado de notificaciones toast para errores de API
- Algunos componentes pueden no mostrar estados de carga/error

### 11. Sin paginación en listados
- Las tablas de users, roles, patients no muestran paginación
- Con datasets reales (>100 registros) la UX se degradará

## Resumen de Acciones Recomendadas

| Prioridad | Acción | Módulo |
|-----------|--------|--------|
| 🔴 Crítica | Conectar Dashboard con API real | Dashboard |
| 🔴 Crítica | Eliminar o implementar rutas del sidebar | Core/Router |
| 🔴 Crítica | Unificar AuthService (eliminar duplicación) | Auth |
| 🔴 Crítica | Eliminar `UiDataTable` no utilizado | Shared |
| 🟡 Media | Verificar integración API en admin/users/roles/permissions | Admin |
| 🟡 Media | Implementar módulo de Consultas | Consultations |
| 🟡 Media | Unificar librería UI (elegir una) | Global |
| 🟡 Media | Implementar tests unitarios y E2E | Global |
| 🟢 Leve | Agregar paginación en listados | Admin, Patients |
| 🟢 Leve | Agregar estados de carga y error | Global |
