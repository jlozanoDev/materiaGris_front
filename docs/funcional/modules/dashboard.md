# Módulo Funcional: Dashboard

## Propósito de Negocio
Proporcionar al médico una visión general del día: pacientes pendientes, consultas activas, estadísticas rápidas y el clima actual, permitiendo acceder rápidamente a las tareas del día.

## Actores
- Médico (principal)
- Administrador (visión general)

## Funcionalidades
| Funcionalidad | Estado |
|--------------|--------|
| Tarjeta de bienvenida con estadísticas (visitas hoy, pacientes nuevos/antiguos) | ✅ Completo (conectado a API) |
| Clima actual con temperatura e icono según ubicación | ✅ Completo (Open-Meteo + geolocalización) |
| Selección manual de ciudad cuando la geolocalización es denegada | ✅ Completo (Nominatim) |
| Lista de pacientes del día | ✅ Completo (conectado a API) |
| Informes pendientes de firma | ✅ Completo (conectado a API) |
| Métricas del sistema (rol admin) | ✅ Completo (conectado a API) |
| Panel de consulta rápida | ⚠️ Parcial (maqueta visual) |
| Calendario mensual | ⚠️ Parcial (maqueta visual) |
| Estados de carga (skeleton) en cada apartado con datos | ✅ Completo |

## Criterios de Aceptación del Clima

- La temperatura se muestra en grados Celsius (°C) como número entero
- La descripción del clima está en español, mapeada desde el código WMO de Open-Meteo
- Se muestra un icono SVG que representa el estado del clima (soleado, nublado, lluvia, nieve, tormenta, etc.)
- Mientras se obtienen los datos del clima, se muestra un spinner de carga
- Si la API de Open-Meteo falla o excede el timeout de 10 segundos, se muestra "No disponible" sin bloquear las estadísticas del HeroCard
- El clima se obtiene automáticamente al montar el dashboard
- Antes de resolver las coordenadas, se muestra un placeholder skeleton

## Estados de Carga

- Cada apartado que consume datos de la API muestra un skeleton mientras se encuentra en carga:
  - `HeroCard`: skeleton sobre el número de visitas y las tarjetas de pacientes nuevos/antiguos.
  - `WeatherDisplay`: skeleton/spinner mientras se resuelve la ubicación y el clima.
  - `PatientList`: 5 filas skeleton que simulan el listado de pacientes.
  - `PendingReportsWidget`: 3 filas skeleton que simulan los informes pendientes.
  - Métricas del sistema (rol admin): 6 tarjetas skeleton que simulan cada KPI.
- Los skeletons desaparecen una vez finalizada la petición, independientemente de que los datos estén vacíos o contengan valores.

## Reglas de Negocio del Clima

- Se solicita geolocalización del navegador al cargar el dashboard
- Si el usuario deniega la geolocalización, se activa el selector manual de ciudad
- Si `navigator.geolocation` no está disponible, se trata como denegación
- La ciudad se busca con un debounce de 300ms al escribir
- Si la ciudad no se encuentra en Nominatim, se muestra "Ciudad no encontrada"
- Las coordenadas por defecto (Madrid) se usan como fallback cuando la geolocalización falla

## Flujo Principal del Clima

1. Dashboard se monta
2. Se solicita ubicación al navegador
3a. Si el usuario acepta → se obtienen coordenadas → se llama a Open-Meteo → se muestra temperatura + icono + descripción
3b. Si el usuario deniega → se muestran coordenadas por defecto + selector de ciudad → el usuario escribe una ciudad → Nominatim geocodifica → se llama a Open-Meteo → se muestra el clima
4. Si Open-Meteo falla → se muestra "No disponible" (las estadísticas continúan visibles)

## Dependencias

- API de dashboard/estadísticas (parcial — conectado)
- Open-Meteo API (gratuita, sin API key) — `https://api.open-meteo.com/v1/forecast`
- Nominatim API (gratuita, OpenStreetMap) — `https://nominatim.openstreetmap.org/search`
- API de pacientes
- API de consultas (no implementada)

## Estado
✅ **Funcional con clima en tiempo real.** Las estadísticas se cargan desde la API. El clima se obtiene de Open-Meteo. La geolocalización tiene fallback a ciudad manual.

## Pendientes (Roadmap)
- [ ] Conectar calendario con módulo de citas (futuro)
- [ ] Conectar panel de consulta rápida con flujo real de consultas
- [ ] Widgets configurables por rol de usuario
