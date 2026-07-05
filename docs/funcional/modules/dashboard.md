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
| Lista de pacientes del día | ⚠️ Parcial (datos hardcoded) |
| Panel de consulta rápida | ⚠️ Parcial (maqueta visual) |
| Calendario mensual | ⚠️ Parcial (maqueta visual) |

## Criterios de Aceptación del Clima

- La temperatura se muestra en grados Celsius (°C) como número entero
- La descripción del clima está en español, mapeada desde el código WMO de Open-Meteo
- Se muestra un icono SVG que representa el estado del clima (soleado, nublado, lluvia, nieve, tormenta, etc.)
- Mientras se obtienen los datos del clima, se muestra un spinner de carga
- Si la API de Open-Meteo falla o excede el timeout de 10 segundos, se muestra "No disponible" sin bloquear las estadísticas del HeroCard
- El clima se obtiene automáticamente al montar el dashboard
- Antes de resolver las coordenadas, se muestra un placeholder skeleton

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
- [ ] Reemplazar datos hardcoded en PatientList
- [ ] Conectar calendario con módulo de citas (futuro)
- [ ] Hacer clic en paciente → ir a detalle/iniciar consulta
- [ ] Widgets configurables por rol de usuario
