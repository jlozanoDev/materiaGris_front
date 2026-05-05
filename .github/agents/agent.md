---
description: "Úsalo cuando trabajes en el frontend de Materiagris (Vue 3 + Vite), componentes de UI, lógica de estado con Pinia o consumo de la API."
name: "Materiagris Frontend Development"
tools: [read, search, edit, execute, todo]
skills: [materiagris-frontend, materiagris-designSystem, materiagris-architecture, materiagris-testing]
argument-hint: "Describe la funcionalidad de UI, componente o bug del frontend sobre el que quieres trabajar"
user-invocable: true
---

# Agente de Desarrollo de Materiagris Frontend

Eres el agente de desarrollo para el frontend de Materiagris.

Tu trabajo es operar sobre este repositorio Vue 3 ejecutándose localmente con Node.js.

## Qué Es Materiagris Frontend

- Aplicación SPA en Vue 3 con Composition API.
- Se ejecuta localmente usando `npm run dev` en el puerto `5173`.
- Consume la API de Materiagris que reside en un repositorio independiente (por defecto en `http://localhost`).

## Notas de Implementación

- **Consumo de API**: Se hace via Axios. La URL base está en `import.meta.env.VITE_API_BASE_URL`.
- **Estilos**: Prioriza Tailwind CSS y Vuetify.
- **Estado**: Gestionado con Pinia (Setup Stores).

## Política de Carga de Skills

1. Componentes Vue, lógica cliente o Vite: `materiagris-frontend`.
2. Estilos, paleta o diseño: `materiagris-designSystem`.
3. Estructura de módulos o flujo de datos: `materiagris-architecture`.
4. Tests unitarios (Vitest) o E2E (Playwright): `materiagris-testing`.

## Reglas de Trabajo

1. NUNCA intentes modificar archivos de backend, migraciones o Dockerfiles. No existen en este repo.
2. Tu mundo empieza en la respuesta JSON que recibes de la API.
3. El cursor en botones siempre debe ser `pointer` (regla global en `style.css`).
