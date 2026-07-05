# Design: Clima Real en Dashboard con Open-Meteo

## Technical Approach

Extend existing hexagonal dashboard module with weather capability. Add `WeatherData` entity, extend `DashboardRepository` with `getWeather(lat,lon)`, create `GetWeatherUseCase`, implement raw `fetch()` to Open-Meteo in `ApiDashboardRepository`. Inject `GeolocationProvider` for testability. Modify `HeroCard` to render `WeatherDisplay` sub-component driven by reactive `useDashboard` state.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|----------|---------|----------|--------|
| Weather API | Open-Meteo vs OpenWeatherMap vs backend proxy | Open-Meteo: free, no key, CORS-enabled. OpenWeatherMap: needs API key exposed. Backend proxy: cross-stack, more latency | **Open-Meteo** — zero secrets, zero backend changes |
| HTTP client for external API | `fetchClient` vs raw `fetch()` | `fetchClient` auto-attaches JWT to external requests. Raw `fetch()` avoids credential leakage | **Raw `fetch()`** — Open-Meteo is public, no auth needed |
| Geolocation testability | Direct `navigator.geolocation` vs injectable provider | Direct: brittle in jsdom. Injectable: swap browser impl for mock | **`GeolocationProvider` interface** — enables unit testing of use case + composable |
| Weather in HeroCard | Extend HeroCard with weather slots vs extract sub-component | Sub-component isolates weather state (loading/error/data) without bloating HeroCard | **`WeatherDisplay` sub-component** — single responsibility, testable in isolation |
| City fallback | Nominatim geocoding vs hardcoded city list | Nominatim: free, global coverage, no key. Hardcoded: limited, stale | **Nominatim geocoding** — search debounced 300ms, with rate-limit respect |

## Data Flow

```
DashboardPage mount
  └─ useDashboard.fetchWeather()
       ├─ GeolocationProvider.getCurrentPosition()
       │    ├─ [granted] → { lat, lon }
       │    └─ [denied]  → user types city → Nominatim geocode → { lat, lon }
       └─ GetWeatherUseCase.execute(lat, lon)
            └─ DashboardRepository.getWeather(lat, lon)
                 └─ ApiDashboardRepository: fetch("https://api.open-meteo.com/v1/forecast?...")
                      └─ parse → WeatherData { temperature, description, wmoCode, iconName }
                           └─ useDashboard.weather.value = data
                                └─ HeroCard → WeatherDisplay renders temp + icon + description
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/modules/dashboard/domain/entities/WeatherData.ts` | **New** | `{ temperature: number, description: string, wmoCode: number, iconName: string }` |
| `src/modules/dashboard/domain/repositories/DashboardRepository.ts` | Modify | Add `getWeather(lat: number, lon: number): Promise<WeatherData>` |
| `src/modules/dashboard/domain/use-cases/GetWeatherUseCase.ts` | **New** | Orchestrates `GeolocationProvider` + `DashboardRepository.getWeather()` |
| `src/modules/dashboard/infrastructure/ApiDashboardRepository.ts` | Modify | Implement `getWeather()` — raw `fetch()` to Open-Meteo, parse response, map WMO |
| `src/modules/dashboard/application/containers/dashboardContainer.ts` | Modify | Add `provideGetWeatherUseCase()` |
| `src/modules/dashboard/presentation/composables/useDashboard.ts` | Modify | Add `weather`, `weatherLoading`, `weatherError`, `fetchWeather()`, `selectCity()` refs |
| `src/modules/dashboard/presentation/components/HeroCard.vue` | Modify | Replace hardcoded weather section with `<WeatherDisplay>` sub-component |
| `src/modules/dashboard/presentation/components/WeatherDisplay.vue` | **New** | Shows temp, icon, description. Handles loading/error/empty states |
| `src/modules/dashboard/presentation/components/CitySelector.vue` | **New** | Input + debounced search → Nominatim geocoding |
| `src/shared/providers/GeolocationProvider.ts` | **New** | Interface + `BrowserGeolocationProvider` implementation |
| `src/shared/utils/wmoCodeMapper.ts` | **New** | WMO code → `{ description: string, iconName: string }` (~15 codes) |
| `.env` / `.env.example` | Modify | Add `VITE_WEATHER_DEFAULT_LAT`, `VITE_WEATHER_DEFAULT_LON` |
| `src/modules/dashboard/domain/use-cases/__tests__/GetWeatherUseCase.test.ts` | **New** | Unit: mock repository + mock geolocation provider |
| `src/modules/dashboard/presentation/composables/__tests__/useDashboard.test.ts` | Modify | Add weather fetch + city fallback scenarios |
| `src/modules/dashboard/presentation/components/__tests__/HeroCard.test.ts` | **New** | Component: render with mocked weather data |

## Contracts

### WeatherData entity
```ts
export interface WeatherData {
  temperature: number;   // °C
  description: string;   // Spanish, e.g. "Soleado"
  wmoCode: number;       // WMO weather code (0-99)
  iconName: string;      // e.g. "sunny", "cloudy", "rainy"
}
```

### DashboardRepository extension
```ts
getWeather(lat: number, lon: number): Promise<WeatherData>
```

### GeolocationProvider interface
```ts
export interface GeolocationProvider {
  getCurrentPosition(): Promise<{ lat: number; lon: number }>;
}
```

### Open-Meteo API contract
```
GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code&timezone=auto
```
Response: `{ current: { temperature_2m: number, weather_code: number } }`

### Nominatim geocoding
```
GET https://nominatim.openstreetmap.org/search?q={city}&format=json&limit=1
```
Response: `[{ lat: string, lon: string, display_name: string }]`

## WMO Code Mapping

Core codes covered (utility `wmoCodeMapper(code) → { description, icon }`):

| Code | Description (es) | Icon |
|------|-----------------|------|
| 0 | Despejado | sunny |
| 1-3 | Parcialmente nublado | cloudy-sun |
| 45,48 | Niebla | foggy |
| 51-55 | Llovizna | drizzle |
| 61-65 | Lluvia | rainy |
| 71-77 | Nieve | snowy |
| 80-82 | Chubascos | shower |
| 95-99 | Tormenta | thunder |

Default for unknown codes: `{ description: "Desconocido", icon: "unknown" }`

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| Unit | `GetWeatherUseCase` | Mock `DashboardRepository` + `GeolocationProvider`, verify coordinates pass through, verify WeatherData returned |
| Unit | `wmoCodeMapper` | Parameterized test: each WMO code → correct description + icon |
| Unit | `useDashboard` weather refs | Mock `GeolocationProvider`, verify `weather` ref updates after `fetchWeather()` |
| Component | `WeatherDisplay` | Mount with prop variants: loading/error/empty/data, assert rendered text + icon |
| Component | `HeroCard` | Mount with mocked `useDashboard`, assert WeatherDisplay receives correct data |
| Integration | Full flow | `jest.spyOn(global, 'fetch')` → mock Open-Meteo response → verify composable → component chain |

## Migration / Rollout

No migration required. Feature is additive — HeroCard weather section goes from hardcoded to reactive. Rollback: revert HeroCard to hardcoded values, delete new files.

## Open Questions

- [ ] Which SVG icon set to use for weather icons? (Proposal: inline SVGs in `WeatherDisplay.vue` or iconify/lucide mappings)
- [ ] Default city for geolocation-denied users: hardcoded in `.env` or last-used from localStorage?
