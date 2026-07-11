# Delta for Dashboard Weather Feature

## ADDED Requirements

### weather-data: Weather Display

| # | Requirement | Strength |
|---|-------------|----------|
| WD-REQ-01 | Fetch real-time weather from Open-Meteo API via `GET /v1/forecast?latitude={lat}&longitude={lon}&current_weather=true` using coordinates | MUST |
| WD-REQ-02 | Display temperature as integer in Celsius with `°C` suffix | MUST |
| WD-REQ-03 | Display weather description in Spanish, mapped from WMO weather code | MUST |
| WD-REQ-04 | Render an SVG weather icon corresponding to the WMO code returned by Open-Meteo | MUST |
| WD-REQ-05 | Show a loading skeleton or spinner in the weather section while the fetch is in progress | MUST |
| WD-REQ-06 | Show a non-blocking error state (e.g. "No disponible") when the API fails or times out — HeroCard stats MUST still render | MUST |
| WD-REQ-07 | Automatically fetch weather when the dashboard page mounts | MUST |
| WD-REQ-08 | Show an empty skeleton placeholder before any fetch has started (before coordinates are resolved) | SHOULD |

#### Scenario: Weather loads with valid coordinates
- GIVEN coordinates (latitude and longitude) are available
- WHEN the dashboard page mounts
- THEN HeroCard displays temperature (°C), Spanish description, and an SVG icon matching the WMO code from Open-Meteo

#### Scenario: Weather icon matches WMO code
- GIVEN Open-Meteo returns `weathercode: 0` (clear sky)
- WHEN weather data is rendered
- THEN a sun icon is shown
- AND codes 1-3 → partly-cloudy, 45-48 → fog, 51-67 → rain, 71-77 → snow, 80-82 → showers, 95-99 → thunder; all other codes → default "not-available" icon

#### Scenario: Temperature in Celsius
- GIVEN Open-Meteo returns `temperature: 22.3`
- WHEN the temperature is rendered
- THEN it displays as `22°C` (rounded integer, Celsius unit)

#### Scenario: Weather description in Spanish
- GIVEN WMO code 0 (clear sky)
- WHEN the description is mapped
- THEN it displays "Despejado"

#### Scenario: Loading spinner while fetching
- GIVEN a weather fetch is in progress
- WHEN the weather section renders
- THEN a loading indicator replaces temperature and description until the fetch completes

#### Scenario: API returns error (not crash)
- GIVEN Open-Meteo responds with status ≥ 400 or a network error occurs
- WHEN the fetch completes
- THEN "No disponible" is shown in the weather section
- AND the HeroCard stats section (visits, appointments) continues to display normally

#### Scenario: API timeout
- GIVEN the Open-Meteo fetch exceeds 10 seconds
- WHEN the timeout fires
- THEN the fetch is aborted
- AND "No disponible" error state is displayed

#### Scenario: Weather refreshes on dashboard mount
- GIVEN the user navigates to the dashboard route
- WHEN `DashboardPage.vue` mounts
- THEN weather data is fetched automatically

#### Scenario: Empty state before first load
- GIVEN coordinates are not yet resolved
- WHEN HeroCard first renders
- THEN a skeleton placeholder occupies the weather section area

### geolocation: Browser Geolocation

| # | Requirement | Strength |
|---|-------------|----------|
| GL-REQ-01 | Request browser location via `navigator.geolocation.getCurrentPosition()` on dashboard mount | MUST |
| GL-REQ-02 | When geolocation is denied by the user, show a non-blocking message and activate the city-fallback mechanism | MUST |
| GL-REQ-03 | When `navigator.geolocation` is not available, treat it the same as a denial | MUST |

#### Scenario: Geolocation denied
- GIVEN the user clicks "Deny" on the browser geolocation permission prompt
- WHEN the permission result is received
- THEN the info message "Permite ubicación para clima real o escribe una ciudad:" is displayed
- AND the city selector fallback component becomes visible

#### Scenario: Geolocation unavailable (old browser)
- GIVEN `navigator.geolocation` is `undefined`
- WHEN the dashboard mounts
- THEN the info message and city selector fallback are shown

### city-fallback: Manual City Selector

| # | Requirement | Strength |
|---|-------------|----------|
| CF-REQ-01 | Show a text input when geolocation is denied or unavailable | MUST |
| CF-REQ-02 | Geocode the entered city name via Nominatim `GET /search?q={city}&format=json&limit=1` to obtain lat/lon | MUST |
| CF-REQ-03 | Fetch weather for the geocoded city coordinates via Open-Meteo | MUST |
| CF-REQ-04 | Show "Ciudad no encontrada" when Nominatim returns zero results | MUST |

#### Scenario: User selects a city
- GIVEN the city selector input is visible and the user types "Bogotá" and presses Enter
- WHEN Nominatim returns coordinates for Bogotá
- THEN Open-Meteo is called with those coordinates
- AND HeroCard updates showing Bogotá's current temperature, description, and icon

#### Scenario: City not found
- GIVEN the user types "Xyzzz123" in the city input
- WHEN Nominatim returns an empty result set
- THEN "Ciudad no encontrada" is displayed below the input
