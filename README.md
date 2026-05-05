# Vue 3 + Vite

Plantilla para desarrollar la SPA frontend con Vue 3 y Vite.

## Desarrollo local

Instalar dependencias:

```
cd frontend
npm install
```

Iniciar servidor de desarrollo:

```
npm run dev
```

La app se servirá en el puerto configurado por Vite (por defecto `http://localhost:5173`).

## Construir para producción

```
npm run build
```

Para más detalles sobre Vue 3 y `script setup`, consulta la documentación oficial.

## Reglas de interfaz

- **Cursor en botones:** todos los elementos `button` (y elementos con `role="button"`) deben mostrar el cursor `pointer` para indicar interactividad. Esta regla global está en [frontend/src/style.css](frontend/src/style.css#L1-L200).
