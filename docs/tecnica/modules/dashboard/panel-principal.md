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
| `DashboardPage.vue` | `modules/dashboard/presentation/pages/` | Página principal (layout) |
| `HeroCard.vue` | `modules/dashboard/presentation/components/` | Tarjeta de bienvenida con estadísticas (visitas hoy, pacientes nuevos/antiguos) y clima actual |
| `WeatherDisplay.vue` | `modules/dashboard/presentation/components/` | Sub-componente que renderiza temperatura, descripción e icono SVG del clima. Maneja estados: vacío (skeleton), carga (spinner), error ("No disponible") y datos |
| `CitySelector.vue` | `modules/dashboard/presentation/components/` | Selector manual de ciudad con búsqueda debounced (300ms) vía Nominatim. Se muestra cuando la geolocalización es denegada |
| `PatientList.vue` | `modules/dashboard/presentation/components/` | Lista de pacientes del día |
| `ConsultationPanel.vue` | `modules/dashboard/presentation/components/` | Panel de consulta con detalle de paciente, síntomas, observación, prescripción |
| `RightPanel.vue` | `modules/dashboard/presentation/components/` | Panel lateral derecho: calendario mensual + mini-estadísticas |
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
- `HeroCard` recibe nuevas props: `weatherData`, `weatherLoading`, `weatherError`, `showCitySelector`; emite `select-city`
- `PatientList.vue` contiene datos hardcoded (no conectado a API)
- `ConsultationPanel.vue` muestra datos de ejemplo

### Estado actual
El dashboard carga estadísticas y pacientes desde la API real vía casos de uso. El clima se obtiene de Open-Meteo con geolocalización del navegador y fallback a ciudad manual.

## Tests

| Archivo | Tipo | Tests |
|---------|------|-------|
| `modules/dashboard/domain/use-cases/__tests__/GetWeatherUseCase.test.ts` | Unitario | 5 tests: coordenadas explícitas, auto-geolocalización, error de geolocalización, error de API, paso de coordenadas |
| `modules/dashboard/presentation/components/__tests__/HeroCard.test.ts` | Componente | 6 tests: renderizado con datos, skeleton loading, error de clima, city selector visible, variantes de icono, error de estadísticas |
| `modules/dashboard/presentation/composables/__tests__/useDashboard.test.ts` | Unitario/Integración | 5 tests de clima: loading state, fallback geolocalización, error API, selectCity, selectCity error |
| `shared/utils/__tests__/wmoCodeMapper.test.ts` | Unitario | 18 tests: cada grupo WMO + default |

## Estado de Desarrollo
✅ **Funcional.** El clima se obtiene de Open-Meteo en tiempo real. La geolocalización del navegador es el método principal con fallback a ciudad manual vía Nominatim.

## Pendientes (Roadmap)
- [ ] Conectar `PatientList.vue` con datos reales (parcial — datos hardcoded)
- [ ] Conectar `ConsultationPanel.vue` con flujo real de consultas
- [ ] Conectar `RightPanel.vue` calendario con módulo de citas (aún no existe)
- [ ] Definir permisos específicos para dashboard si aplica
