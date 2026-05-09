# Materia Gris Frontend - Instrucciones de Desarrollo (Local Node)

Este repositorio contiene el **Frontend de Materia Gris** construido con Vue 3 y Vite.
Hablame siempre en español.

## 🚀 Ejecución Local

A diferencia del backend, el frontend se ejecuta directamente con Node.js en tu máquina host:

1. **Instalar**: `npm install`
2. **Ejecutar**: `npm run dev` (Disponible en `http://localhost:5173`)
3. **Variables**: Revisa `.env` para asegurar que `VITE_API_BASE_URL` apunta a la API (por defecto `http://localhost`).

## 🏗️ Conexión con la API

- La API debe estar levantada (normalmente vía Docker en el repo hermano).
- Las peticiones usan `withCredentials: true` para manejar las cookies JWT de sesión.

## 🛠️ Comandos Frecuentes

- **Desarrollo**: `npm run dev`
- **Build**: `npm run build`
- **Tests Unitarios**: `npm run test`
- **Tests E2E**: `npm run test:e2e`

## 📝 Convenciones

- **Estilos**: Usa clases de utilidad de Tailwind. Evita CSS personalizado.
- **Componentes**: Usa `<script setup>` y Composition API.
- **Idioma**: Código en **inglés**, comentarios/docs en **español**.
