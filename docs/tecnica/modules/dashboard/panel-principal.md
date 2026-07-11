# Dashboard Principal

## Descripción
Pantalla principal de la aplicación tras el inicio de sesión. Muestra un resumen de la actividad diaria: estadísticas, lista de pacientes del día, panel de consulta rápida, calendario y clima actual basado en la ubicación del usuario.

## Ruta
| Ruta | Vista | Acceso |
|------|-------|--------|
| `/` | `DashboardPage.vue` | Autenticado |

## Componentes Relacionados

| Componente | Ubicación | Propósito |
|------------|-----------|-----------|
| `DashboardPage.vue` | `modules/dashboard/presentation/pages/` | Página principal (layout). Renderiza skeletons de carga para el rol admin y reparte estados de carga a los widgets del doctor |
| `HeroCard.vue` | `modules/dashboard/presentation/components/` | Tarjeta de bienvenida con estadísticas (visitas hoy, pacientes nuevos/antiguos) y clima actual. Incluye skeleton de estadísticas |
| `WeatherDisplay.vue` | `modules/dashboard/presentation/components/` | Sub-componente que renderiza temperatura, descripción e icono SVG del clima. Maneja estados: vacío (skeleton), carga (spinner), error ("No disponible") y datos |
| `CitySelector.vue` | `modules/dashboard/presentation/components/` | Selector manual de ciudad con búsqueda debounced (300ms) vía Nominatim. Se muestra cuando la geolocalización es denegada |
| `PatientList.vue` | `modules/dashboard/presentation/components/` | Lista de pacientes del día. Incluye skeleton de 5 filas y estado vacío |
| `PendingReportsWidget.vue` | `modules/dashboard/presentation/components/` | Widget de informes pendientes de firma. Incluye skeleton de 3 filas, badge de conteo y estado vacío |
| `QuickActions.vue` | `modules/dashboard/presentation/components/` | Botonera de accesos directos (sin carga de datos) |
| `RightPanel.vue` | `modules/dashboard/presentation/components/` | Panel lateral derecho: calendario mensual + lecturas diarias (sin carga de datos) |
| `UiSkeleton.vue` | `shared/components/` | Componente genérico de skeleton con variantes `text`, `circle` y `rect` |
| `AppSidebar.vue` | `shared/components/` | Sidebar de navegación |
| `TopBar.vue` | `shared/components/` | Barra superior con búsqueda, notificaciones, avatar |

## Arquitectura del Clima

### Flujo de datos

```
DashboardPage mount
  └─ useDashboard.fetchWeather()
       ├─ BrowserGeolocationProvider.getCurrentPosition()
       │    ├─ [granted] → { lat, lon }
       │    └─ [denied/unavailable] → env defaults + showCitySelector = true
       └─ GetWeatherUseCase.execute(lat, lon)
            └─ DashboardRepository.getWeather(lat, lon)
                 └─ ApiDashboardRepository: raw fetch("https://api.open-meteo.com/v1/forecast?...")
                      └─ parse → WeatherData { temperature, description, wmoCode, iconName }
                           └─ useDashboard.weather.value = data
                                └─ HeroCard → WeatherDisplay renderiza temp + icono + descripción
```

### Entidades

| Archivo | Descripción |
|---------|-------------|
| `modules/dashboard/domain/entities/WeatherData.ts` | `{ temperature: number, description: string, wmoCode: number, iconName: string }` |

### wmoCodeMapper

| Archivo | Descripción |
|---------|-------------|
| `shared/utils/wmoCodeMapper.ts` | Mapa de códigos WMO (0-99) → `{ description (es), iconName }`. Cubre 9 grupos + fallback "Desconocido" |

| Código WMO | Descripción (es) | Icono |
|------------|-----------------|-------|
| 0 | Despejado | sunny |
| 1-3 | Parcialmente nublado | cloudy-sun |
| 45,48 | Niebla | foggy |
| 51-55 | Llovizna | drizzle |
| 61-65 | Lluvia | rainy |
| 71-77 | Nieve | snowy |
| 80-82 | Chubascos | shower |
| 95-99 | Tormenta | thunder |
| otros | Desconocido | unknown |

### Proveedor de Geolocalización

| Archivo | Descripción |
|---------|-------------|
| `shared/providers/GeolocationProvider.ts` | Interfaz `GeolocationProvider` + `BrowserGeolocationProvider` (wraps `navigator.geolocation`) + `MockGeolocationProvider` (para tests) |

### Repositorio

| Archivo | Descripción |
|---------|-------------|
| `modules/dashboard/domain/repositories/DashboardRepository.ts` | Interfaz extendida con `getWeather(lat, lon): Promise<WeatherData>` |
| `modules/dashboard/infrastructure/ApiDashboardRepository.ts` | Implementación `getWeather()` usando `fetch()` directo a Open-Meteo con timeout de 10s via `AbortController`. **No usa `fetchClient`** para evitar fuga de JWT a APIs externas |

### Caso de Uso

| Archivo | Descripción |
|---------|-------------|
| `modules/dashboard/domain/use-cases/GetWeatherUseCase.ts` | Inyecta `DashboardRepository` + `GeolocationProvider`. `execute(lat?, lon?)` auto-geolocaliza si no hay coordenadas |

### Contenedor

| Archivo | Descripción |
|---------|-------------|
| `modules/dashboard/application/containers/dashboardContainer.ts` | Nueva función `provideGetWeatherUseCase()` que instancia `ApiDashboardRepository` + `BrowserGeolocationProvider` |

### Composable

| Archivo | Descripción |
|---------|-------------|
| `modules/dashboard/presentation/composables/useDashboard.ts` | Nuevos refs: `weather`, `weatherLoading`, `weatherError`, `showCitySelector`. Nuevas funciones: `fetchWeather()` (geolocaliza → fallback env → use case), `selectCity(lat,lon)` (salta geolocalización y obtiene clima directo) |

### APIs Externas

| API | Uso | Autenticación |
|-----|-----|---------------|
| Open-Meteo `GET /v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code&timezone=auto` | Obtener temperatura y código WMO actual | Ninguna (gratuita, CORS habilitado) |
| Nominatim `GET /search?q={city}&format=json&limit=1` | Geocodificar nombre de ciudad a coordenadas | Ninguna (gratuita, OpenStreetMap) |

### Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_WEATHER_DEFAULT_LAT` | `40.4168` | Latitud por defecto (Madrid) cuando la geolocalización falla |
| `VITE_WEATHER_DEFAULT_LON` | `-3.7038` | Longitud por defecto (Madrid) cuando la geolocalización falla |

## Lógica de Estado

### Props y emits
- Los componentes del dashboard NO reciben props del router
- No hay store dedicada al dashboard
- `WeatherDisplay` recibe props: `weatherData`, `loading`, `error`
- `CitySelector` emite `city-selected` con `{ lat, lon, name }`
- `HeroCard` recibe props: `stats`, `loading`, `error`, `userName`, `weatherData`, `weatherLoading`, `weatherError`, `showCitySelector`; emite `select-city`
- `PatientList.vue` recibe props: `patients`, `loading`
- `PendingReportsWidget.vue` recibe props: `reports`, `loading`, `role`
- `ConsultationPanel.vue` muestra datos de ejemplo

### Estado de carga
- `useDashboard` expone un único `loading` para las peticiones del dashboard (`stats`, `patients`, `pendingReports`, `systemMetrics`).
- El clima tiene su propio `weatherLoading` independiente.
- Cada widget con datos recibe la prop `loading` correspondiente y renderiza skeletons mientras es `true`.
- `Skeleton.vue` es el componente base reutilizable para todos los skeletons del dashboard.

### Estado actual
El dashboard carga estadísticas, pacientes e informes pendientes desde la API real vía casos de uso. El rol admin carga métricas del sistema. El clima se obtiene de Open-Meteo con geolocalización del navegador y fallback a ciudad manual.

## Tests

| Archivo | Tipo | Tests |
|---------|------|-------|
| `modules/dashboard/domain/use-cases/__tests__/GetWeatherUseCase.test.ts` | Unitario | 5 tests: coordenadas explícitas, auto-geolocalización, error de geolocalización, error de API, paso de coordenadas |
| `modules/dashboard/presentation/components/__tests__/HeroCard.test.ts` | Componente | 6 tests: renderizado con datos, skeleton loading, error de clima, city selector visible, variantes de icono, error de estadísticas |
| `modules/dashboard/presentation/components/__tests__/WeatherDisplay.test.ts` | Componente | 12 tests: skeleton vacío, spinner de carga, error, renderizado de cada variante de icono |
| `modules/dashboard/presentation/components/__tests__/CitySelector.test.ts` | Componente | 4 tests: búsqueda debounced, selección, error, limpieza de timer |
| `modules/dashboard/presentation/composables/__tests__/useDashboard.test.ts` | Unitario/Integración | 10 tests: roles doctor/admin/sin permisos, carga de stats/patients/reports/metrics, estados de loading, flujo completo del clima |
| `shared/utils/__tests__/wmoCodeMapper.test.ts` | Unitario | 18 tests: cada grupo WMO + default |

## Estado de Desarrollo
✅ **Funcional.** El clima se obtiene de Open-Meteo en tiempo real. La geolocalización del navegador es el método principal con fallback a ciudad manual vía Nominatim.

## Pendientes (Roadmap)
- [ ] Conectar `ConsultationPanel.vue` con flujo real de consultas
- [ ] Conectar `RightPanel.vue` calendario con módulo de citas (aún no existe)
- [ ] Definir permisos específicos para dashboard si aplica
