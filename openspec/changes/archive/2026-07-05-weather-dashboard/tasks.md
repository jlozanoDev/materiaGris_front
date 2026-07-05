# Tasks: Dashboard Weather Feature

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~572 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Foundation + Core + Use Case Tests (267 lines) → PR 2: UI + Component Tests (305 lines) |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation: entities, wmoMapper, geolocation provider, repository, API impl, use case, container, env vars, use case tests | PR 1 | Self-contained with tests |
| 2 | UI: WeatherDisplay, CitySelector, composable wiring, HeroCard replacement, component tests, docs | PR 2 | Depends on PR 1 interfaces |

## Phase 1: Foundation (WD-REQ-01, GL-REQ-01/03)

- [x] 1.1 Create `src/modules/dashboard/domain/entities/WeatherData.ts` — interface `{ temperature, description, wmoCode, iconName }`
- [x] 1.2 Create `src/shared/utils/wmoCodeMapper.ts` — WMO code → `{ description, iconName }` (9 code groups: 0→sunny, 1-3→cloudy-sun, 45/48→foggy, 51-55→drizzle, 61-65→rainy, 71-77→snowy, 80-82→shower, 95-99→thunder) + default fallback
- [x] 1.3 Create `src/shared/providers/GeolocationProvider.ts` — `GeolocationProvider` interface + `BrowserGeolocationProvider` (wraps `navigator.geolocation`) + `MockGeolocationProvider`
- [x] 1.4 Extend `src/modules/dashboard/domain/repositories/DashboardRepository.ts` — add `getWeather(lat, lon): Promise<WeatherData>`
- [x] 1.5 Add `VITE_WEATHER_DEFAULT_LAT`, `VITE_WEATHER_DEFAULT_LON` to `.env` and `.env.example`

## Phase 2: Core Logic (WD-REQ-01/06, GL-REQ-01/02, CF-REQ-02/03)

- [x] 2.1 Implement `getWeather()` in `src/modules/dashboard/infrastructure/ApiDashboardRepository.ts` — raw `fetch()` to `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code&timezone=auto`, 10s timeout via `AbortController`, parse response, map WMO via `wmoCodeMapper`, return `WeatherData`
- [x] 2.2 Create `src/modules/dashboard/domain/use-cases/GetWeatherUseCase.ts` — inject `DashboardRepository` + `GeolocationProvider`, `execute(lat?, lon?)` auto-geolocates when no coords, delegates to repo, returns `WeatherData`
- [x] 2.3 Add `provideGetWeatherUseCase()` to `src/modules/dashboard/application/containers/dashboardContainer.ts`

## Phase 3: UI Components (WD-REQ-02/03/04/05/06/08, GL-REQ-02, CF-REQ-01/02/04)

- [x] 3.1 Create `src/modules/dashboard/presentation/components/WeatherDisplay.vue` — props: `weatherData`, `loading`, `error`, renders: skeleton placeholder (empty), spinner (loading), "No disponible" (error), temp+icon+description (data); inline SVG icons per `iconName`
- [x] 3.2 Create `src/modules/dashboard/presentation/components/CitySelector.vue` — text input, 300ms debounce, Nominatim geocode via raw `fetch()`, emit `city-selected` with `{lat, lon}`, show "Ciudad no encontrada" on empty results
- [x] 3.3 Modify `src/modules/dashboard/presentation/composables/useDashboard.ts` — add `weather`, `weatherLoading`, `weatherError` refs, `fetchWeather()` (geolocate → fallback to env defaults → use case), `selectCity(lat, lon)`, expose city picker visibility flag on geolocation denial
- [x] 3.4 Modify `src/modules/dashboard/presentation/components/HeroCard.vue` — replace hardcoded weather (lines 86-108) with `<WeatherDisplay>` bound to new weather props + show `<CitySelector>` when geolocation denied

## Phase 4: Testing (all spec scenarios)

- [x] 4.1 Unit test `src/modules/dashboard/domain/use-cases/__tests__/GetWeatherUseCase.test.ts` — mock `DashboardRepository` + `MockGeolocationProvider`, verify coords pass through, `WeatherData` returned, error handling, timeout behavior
- [x] 4.2 Component test `src/modules/dashboard/presentation/components/__tests__/HeroCard.test.ts` — mount with mocked `useDashboard`, assert `WeatherDisplay` receives correct `weatherData` with temp, description, icon
- [x] 4.3 Extend `src/modules/dashboard/presentation/composables/__tests__/useDashboard.test.ts` — scenario: geolocation denied shows city fallback, city selection triggers weather fetch, API error sets `weatherError`

## Phase 5: Documentation

- [x] 5.1 Update `docs/tecnica/modules/dashboard/panel-principal.md` and `docs/funcional/modules/dashboard.md` with weather feature architecture and flows (verified: tech docs at `modules/dashboard/panel-principal.md`, func docs at `modules/dashboard.md`)
