# Proposal: Clima Real en Dashboard con Open-Meteo

## Intent

El dashboard muestra clima falso hardcodeado (`22°C` / `Soleado` en HeroCard.vue:105-107). Los doctores no pueden confiar en él. Reemplazar con clima real según ubicación del navegador, usando Open-Meteo (API gratuita, sin clave, CORS-enabled).

## Scope

### In Scope

- Reemplazar texto/icono hardcodeados en HeroCard con datos reactivos de `https://api.open-meteo.com/v1/forecast`
- Geolocalización vía `navigator.geolocation` con fallback a selector manual de ciudad
- Mostrar: temperatura (°C), descripción en español, icono SVG mapeado desde código WMO
- Seguir arquitectura hexagonal existente: `WeatherData` → repositorio → use case → API impl → contenedor DI → composable
- Estados: loading, error, vacío (sin ubicación)
- Tests unitarios del use case y del composable
- Tests de integración para HeroCard con datos meteorológicos

### Out of Scope

- Sin cambios de backend (cero endpoints Laravel)
- Sin pronóstico/historial meteorológico
- Sin multi-ciudad o ubicaciones guardadas
- Sin alertas ni notificaciones meteorológicas
- Sin caché server-side

## Capabilities

### New Capabilities

- `dashboard-weather`: Clima en tiempo real desde Open-Meteo, con geolocalización del navegador y fallback a selección manual de ciudad. Entidad `WeatherData`, repositorio, use case, e integración en `useDashboard`.

### Modified Capabilities

None (el módulo dashboard no tiene specs previos en `openspec/specs/`).

## Approach

Frontend-only — `fetch()` directo a Open-Meteo sin pasar por backend. Misma arquitectura hexagonal que el resto del dashboard:

```
WeatherData entity → DashboardRepository.getWeather(lat,lon) → GetWeatherUseCase
→ ApiDashboardRepository (fetch a open-meteo.com) → dashboardContainer.provideGetWeatherUseCase()
→ useDashboard (weather ref + geolocation + city fallback) → HeroCard.vue
```

**Geolocalización**: `navigator.geolocation.getCurrentPosition()` inyectada como dependencia (`GeolocationProvider`) para testabilidad. Si el usuario deniega → mostrar mensaje y selector de ciudad (input + debounce → Nominatim geocoding → Open-Meteo).

**Mapeo WMO**: utilidad con ~15 códigos WMO → { description_es, icon_svg_name }.

**HTTP**: `fetch()` crudo a Open-Meteo (no `fetchClient` — evita enviar JWT y credenciales a API externa).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `domain/entities/WeatherData.ts` | New | `{ temperature, description, wmoCode, iconName }` |
| `domain/repositories/DashboardRepository.ts` | Modified | Añadir `getWeather(lat, lon)` |
| `domain/use-cases/GetWeatherUseCase.ts` | New | Orquesta repositorio + geolocalización |
| `infrastructure/ApiDashboardRepository.ts` | Modified | Implementar `getWeather()` con `fetch()` a Open-Meteo |
| `application/containers/dashboardContainer.ts` | Modified | Añadir `provideGetWeatherUseCase()` |
| `presentation/composables/useDashboard.ts` | Modified | Añadir `weather`, `fetchWeather()`, geolocation, city selector |
| `presentation/components/HeroCard.vue` | Modified | Reemplazar hardcodeado con `dashboard.weather` reactivo |
| `presentation/components/CityWeatherFallback.vue` | New | Selector de ciudad cuando geolocalización denegada |
| `.env` / `.env.example` | Modified | `VITE_WEATHER_DEFAULT_LAT`, `VITE_WEATHER_DEFAULT_LON` |
| `shared/utils/wmoCodeMapper.ts` | New | Mapeo de códigos WMO a descripción + icono |
| Tests (~3 archivos) | New/Modified | `GetWeatherUseCase.test.ts`, `useDashboard.test.ts`, `HeroCard.test.ts` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Usuario deniega geolocalización | High | Fallback a selector de ciudad con geocoding vía Nominatim |
| Open-Meteo fuera de servicio | Low | Mostrar último clima conocido o mensaje "No disponible" |
| CORS bloquea `fetch()` a Open-Meteo | Very Low | Open-Meteo tiene CORS headers abiertos; documentado y estable |
| `navigator.geolocation` frágil en tests | Medium | Inyectar `GeolocationProvider` como dependencia explícita |
| Mapeo WMO incompleto | Low | Cubrir ~15 códigos más comunes; default genérico para el resto |

## Rollback Plan

1. Revertir `HeroCard.vue` a valores hardcodeados (`22°C` / `Soleado`)
2. Eliminar `weather` ref y `fetchWeather()` de `useDashboard.ts`
3. Eliminar `getWeather()` de `DashboardRepository` y `ApiDashboardRepository`
4. Remover `provideGetWeatherUseCase()` del contenedor
5. Borrar archivos nuevos: `WeatherData.ts`, `GetWeatherUseCase.ts`, `CityWeatherFallback.vue`, `wmoCodeMapper.ts`

## Dependencies

- `https://api.open-meteo.com/v1/forecast` — API pública gratuita, sin registro
- `https://nominatim.openstreetmap.org/search` — geocoding para fallback de ciudad
- `navigator.geolocation` — API del navegador, disponible en todos los browsers modernos
- Sin dependencias npm nuevas

## Success Criteria

- [ ] HeroCard muestra temperatura y descripción reales desde Open-Meteo según ubicación del usuario
- [ ] Si el usuario deniega geolocalización, aparece selector de ciudad funcional
- [ ] Icono SVG cambia según código WMO (sol, nubes, lluvia, etc.)
- [ ] Estados de loading y error se manejan sin bloquear el resto del dashboard
- [ ] `GetWeatherUseCase` tiene tests unitarios con mock de repositorio y geolocalización
- [ ] Build de producción exitoso (`npm run build`)
