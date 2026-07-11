# Exploration: Dashboard Weather/Temperature Real-Time Feature

## Current State

The dashboard `HeroCard.vue` component displays weather information **completely hardcoded** — no data source, no API call, no reactive state:

```vue
<!-- HeroCard.vue lines 87-109 — static weather section -->
<div class="text-2xl font-bold">22°C</div>
<div class="text-xs text-white/70">Soleado</div>
```

The weather section is a static SVG (sun+cloud icon) with fixed text. It receives NO weather prop, has NO weather entity, and is not part of the `DashboardStats` interface. The `useDashboard` composable does not fetch weather data. The prior dashboard refactor (`necesito-refactorizar-el-front-del-dashboard`) explicitly marked "Widget de clima real (requiere API externa)" as **Out of Scope**.

**Weather data source**: hardcoded | mock

**Has geolocation**: false — zero usage of `navigator.geolocation` anywhere in the codebase

**Weather-related packages**: none in `package.json`

**Environment variables**: Only `VITE_API_BASE_URL=http://localhost` exists. No weather API keys or endpoints configured.

## Files Analyzed

| File | Relevance |
|------|-----------|
| `src/modules/dashboard/presentation/pages/DashboardPage.vue` | Main dashboard page — mounts `HeroCard` with `stats` prop (no weather) |
| `src/modules/dashboard/presentation/components/HeroCard.vue` | **Primary target** — contains hardcoded `22°C` / `Soleado` at lines 105-107 |
| `src/modules/dashboard/presentation/composables/useDashboard.ts` | Composable — fetches stats/patients/reports/metrics, ZERO weather logic |
| `src/modules/dashboard/domain/entities/DashboardStats.ts` | Entity — `{ visits, newPatients, returningPatients }` only, no weather |
| `src/modules/dashboard/domain/repositories/DashboardRepository.ts` | Interface — 5 methods, none for weather |
| `src/modules/dashboard/domain/use-cases/GetDashboardStatsUseCase.ts` | Use case — computes KPIs from patient data, no weather |
| `src/modules/dashboard/infrastructure/ApiDashboardRepository.ts` | API repo — calls `/patients/find`, `/reports`, `/admin/users`, etc. No weather endpoint |
| `src/modules/dashboard/application/containers/dashboardContainer.ts` | DI container — 4 providers, no weather |
| `src/core/api/httpClient.ts` | HTTP client — supports external URLs (not just relative paths). Can call weather API directly |
| `src/core/config/env.ts` | `VITE_API_BASE_URL` — only env var exposed |
| `.env` / `.env.example` | Single variable `VITE_API_BASE_URL=http://localhost` |
| `package.json` | No weather packages (no axios, no openweather, no weather-js) |
| `vite.config.js` | Standard Vite config — no env var definitions beyond Vite defaults |
| `openspec/changes/necesito-refactorizar-el-front-del-dashboard/proposal.md` | Prior refactor — weather explicitly out of scope |
| `docs/tecnica/modules/dashboard/panel-principal.md` | Docs — notes HeroCard has hardcoded data |

## Architecture Context

The dashboard module follows the project's **hexagonal architecture** pattern:

```
modules/dashboard/
├── domain/          ← entities, repository interfaces, use cases
├── infrastructure/  ← ApiDashboardRepository (fetchClient calls)
├── application/     ← DI containers (provideX functions)
└── presentation/    ← composables, components, pages
```

All HTTP calls go through `fetchClient` from `@/core/api/httpClient.ts`, which supports:
- Relative paths (prepends `VITE_API_BASE_URL`)
- Absolute URLs (`http://` or `https://` prefix)
- JWT auth via token getter
- Custom headers, timeout, abort

**New features follow strict layering**: entity → repository interface → use case → API implementation → container → composable → component.

## Approaches

### Approach A: Frontend-Only — Direct Weather API Call

Call a public weather API (e.g., OpenWeatherMap, WeatherAPI.com, Open-Meteo) directly from the browser. The frontend obtains geolocation via `navigator.geolocation` and calls the weather API.

**Data flow**: `HeroCard` → `useDashboard.fetchWeather()` → `fetchClient("https://api.openweathermap.org/...")` → API response

**Implementation**:
1. Add `VITE_WEATHER_API_KEY` to `.env`
2. Create `WeatherData` entity in `domain/entities/`
3. Create `WeatherRepository` interface in `domain/repositories/`
4. Create `GetWeatherUseCase` in `domain/use-cases/`
5. Implement `ApiWeatherRepository` in `infrastructure/` — calls external API directly via `fetchClient`
6. Add `provideWeatherUseCase()` to `dashboardContainer.ts`
7. Update `useDashboard.ts` composable — add `weather` ref + `fetchWeather()` method
8. Update `HeroCard.vue` — replace hardcoded values with `dashboard.weather.value`

**Pros**:
- No backend changes needed — 100% frontend work
- Simple: one module, one external API call
- Fast to implement (1-2 sessions)
- Can use free-tier weather APIs (Open-Meteo is completely free, no API key)

**Cons**:
- API key exposed in browser (if using key-based API like OpenWeatherMap)
- CORS may block requests depending on weather API (Open-Meteo supports CORS, OpenWeatherMap free tier may not)
- No caching across users — each browser hits weather API independently
- Rate limits per IP apply
- Users can block geolocation — need fallback location

**Effort**: Medium

---

### Approach B: Backend-Proxy — New Laravel Weather Endpoint

Add a new backend endpoint (`GET /api/dashboard/weather`) that proxies the weather API call server-side. The frontend calls the backend, which calls the external weather API. Location can be passed from frontend or determined server-side via IP.

**Data flow**: `HeroCard` → `useDashboard` → `ApiDashboardRepository.getWeather(lat, lon)` → `fetchClient("/api/dashboard/weather?lat=...&lon=...")` → Laravel controller → external weather API → JSON response

**Implementation**:
1. **Backend**: New `GET /api/dashboard/weather` endpoint in Laravel
2. **Backend**: Weather service/command calling external API (server-side, API key in `.env`)
3. **Backend**: Cache weather response (e.g., 15-30 min per location)
4. **Frontend**: Add `getWeather(lat, lon)` to `DashboardRepository` interface
5. **Frontend**: Implement in `ApiDashboardRepository` — calls backend endpoint
6. **Frontend**: Create `WeatherData` entity and `GetWeatherUseCase`
7. **Frontend**: Update `useDashboard.ts` composable
8. **Frontend**: Update `HeroCard.vue` component

**Pros**:
- API key never exposed to browser — server-side only
- CORS not an issue — backend-to-backend call
- Caching possible (reduce API costs, improve response time)
- Single rate limit for all users (server IP)
- Can add location fallback via IP geolocation on server
- Fits the existing hexagonal architecture (`/api/` prefix, `fetchClient` → backend)

**Cons**:
- Requires backend work — new Laravel endpoint, service, tests
- Two teams/contexts involved (frontend + backend)
- More total work (2-3 sessions)
- Adds latency (browser → backend → external API → backend → browser)
- Backend must handle geolocation or location params from frontend

**Effort**: Large (cross-stack)

---

### Approach C: Hybrid — Frontend Calls Open-Meteo (Free, No Key)

Same as Approach A but specifically using **Open-Meteo** (`https://open-meteo.com/`), which:
- Is completely free, no API key required
- Supports CORS (browser-friendly)
- Returns JSON with current temperature, weather code, humidity, wind
- No rate limits for non-commercial use

This eliminates the API key exposure concern entirely.

**Pros** (same as A, plus):
- No API key at all — zero exposure risk
- No registration needed
- Free forever (open data)
- Simple: just a URL call with lat/lon

**Cons**:
- Still client-side geolocation required
- No server-side caching
- Rate limits per IP (though generous)

**Effort**: Medium (same as A, simpler configuration)

## Recommendation

**Approach C (Hybrid with Open-Meteo)** is recommended for the following reasons:

1. **Zero backend dependency** — can be built entirely in the frontend, matching the "frontend-only" spirit of this task
2. **No API keys** — Open-Meteo requires no registration, no key, no billing
3. **Fits existing architecture** — follows the same hexagonal pattern used by other dashboard features
4. **Free and open** — no cost, no rate limit concerns for clinical dashboard usage
5. **Simple fallback** — if geolocation is denied, fall back to a default city (e.g., Madrid) or a hardcoded location

**Tradeoff accepted**: no server-side caching. For a dashboard that loads once per session, a direct API call is acceptable. If performance/cost becomes an issue later, migrate to Approach B as a future iteration.

**If backend work is already planned/in progress** for a `/dashboard/stats` aggregated endpoint, Approach B can be folded into that work as a secondary endpoint.

## Affected Areas (Approach C)

| Area | Change Type | Description |
|------|-------------|-------------|
| `.env` / `.env.example` | Modified | Add `VITE_WEATHER_DEFAULT_LAT`, `VITE_WEATHER_DEFAULT_LON` (fallback coordinates) |
| `src/modules/dashboard/domain/entities/` | New file | `WeatherData.ts` — `{ temperature, condition, icon, description }` |
| `src/modules/dashboard/domain/repositories/DashboardRepository.ts` | Modified | Add `getWeather(lat: number, lon: number): Promise<WeatherData>` |
| `src/modules/dashboard/domain/use-cases/` | New file | `GetWeatherUseCase.ts` — receives repository by constructor |
| `src/modules/dashboard/infrastructure/ApiDashboardRepository.ts` | Modified | Implement `getWeather()` calling `https://api.open-meteo.com/v1/forecast?...` |
| `src/modules/dashboard/application/containers/dashboardContainer.ts` | Modified | Add `provideGetWeatherUseCase()` |
| `src/modules/dashboard/presentation/composables/useDashboard.ts` | Modified | Add `weather` ref, `fetchWeather()` method, geolocation logic |
| `src/modules/dashboard/presentation/components/HeroCard.vue` | Modified | Replace hardcoded `22°C` / `Soleado` with reactive `dashboard.weather` |
| `src/modules/dashboard/presentation/composables/__tests__/useDashboard.test.ts` | Modified | Add weather fetching tests |
| `src/modules/dashboard/domain/use-cases/__tests__/` | New file | `GetWeatherUseCase.test.ts` |

## Files to Change (Approach C)

**New files (4)**:
- `src/modules/dashboard/domain/entities/WeatherData.ts`
- `src/modules/dashboard/domain/use-cases/GetWeatherUseCase.ts`
- `src/modules/dashboard/domain/use-cases/__tests__/GetWeatherUseCase.test.ts`
- (optionally) `src/shared/composables/useGeolocation.ts` — reusable geolocation composable

**Modified files (7)**:
- `.env` / `.env.example`
- `src/modules/dashboard/domain/repositories/DashboardRepository.ts`
- `src/modules/dashboard/infrastructure/ApiDashboardRepository.ts`
- `src/modules/dashboard/application/containers/dashboardContainer.ts`
- `src/modules/dashboard/presentation/composables/useDashboard.ts`
- `src/modules/dashboard/presentation/components/HeroCard.vue`
- `src/modules/dashboard/presentation/composables/__tests__/useDashboard.test.ts`

**Untouched**:
- `DashboardPage.vue` — already passes `stats`, weather would be exposed via composable
- `RightPanel.vue` — no weather content
- Router, httpClient, core config

**Total**: ~11 files, estimated **medium** effort (1-2 sessions)

## Risks

1. **User denies geolocation** — HeroCard must show fallback (default city coordinates from env vars or a "Permitir ubicación" prompt). Mitigation: env-based default location + graceful degradation.

2. **Open-Meteo API changes** — free APIs can change or deprecate. Mitigation: Open-Meteo is a well-established open-data project (backed by national weather services). The endpoint structure is stable.

3. **Weather icon mapping** — Open-Meteo returns WMO weather codes (0-99). We need to map codes to UI icons/descriptions. Mitigation: small mapping utility with ~15 common codes.

4. **Loading state flash** — weather API call adds latency. HeroCard already has loading skeleton support for stats; extend it to weather section.

5. **HTTPS in production** — Open-Meteo uses HTTPS. The `fetchClient` support for absolute URLs handles this. No issue.

6. **Test fragility** — tests mocking `navigator.geolocation` can be flaky. Mitigation: inject geolocation as a dependency rather than calling it directly in the composable.

## Ready for Proposal

**Yes** — the exploration is complete. Recommend proceeding to `sdd-propose` with Approach C (Open-Meteo direct call) as the primary approach, with Approach B (backend proxy) as an alternative if backend work is already in progress.
