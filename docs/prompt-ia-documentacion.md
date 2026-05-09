# Prompt Maestro: Auditoría y Reorganización de Documentación Vue.js

Este documento contiene el prompt optimizado para que una IA (como Gemini con la extensión de Google Workspace o ChatGPT con acceso a archivos) analice, estructure y complete la documentación de tu proyecto.

---

## El Prompt

Copia y pega el siguiente texto en el chat de la IA:

> **Actúa como un Arquitecto de Software Senior y Tech Lead. Tu objetivo es realizar una auditoría completa, reorganización y expansión de la documentación técnica de mi proyecto Vue.js.**
>
> ### 1. Contexto del Proyecto
> * **Nombre del Proyecto:** MateriaGris_local
> * **Tecnologías:** Vue.js (especificar si es vue3, Vite/Webpack, Pinia/Vuex).
> * **Ubicación:** /docs
>
> ### 2. Fase de Análisis
> * Busca y lee todos los documentos relacionados con el proyecto en mi unidad.
> * Identifica todas las **pantallas (vistas)**, **componentes clave** y **flujos de usuario** descritos.
> * Detecta incoherencias entre lo documentado y lo que debería existir en un flujo lógico de aplicación.
>
> ### 3. Tarea de Reorganización (Arquitectura de Información)
> * Propón una estructura de documentación organizada por **Módulos Lógicos** (ej. `Módulo de Autenticación`, `Panel de Administración`, 
etc.).
> * Clasifica los documentos existentes dentro de esta nueva jerarquía.
>
> ### 4. Generación de Contenido (Nuevos Archivos)
> Para cada pantalla o funcionalidad identificada que NO tenga documentación detallada, genera el contenido de un nuevo archivo `.md` con la siguiente estructura:
> * **Título:** Nombre de la Pantalla/Funcionalidad.
> * **Descripción:** Propósito y objetivo de negocio.
> * **Componentes Relacionados:** Lista de componentes de Vue que intervienen.
> * **Lógica de Estado:** Qué datos maneja (props, emits, store).
> * **Estado de Desarrollo:** (Identificar si parece terminado o en progreso).
> * **Sección de Pendientes (Roadmap):** Lista detallada de lo que falta por desarrollar o documentar para que el módulo sea funcional al 100%.
>
> ### 5. Entregable Esperado
> 1.  Un **Índice General** de la nueva estructura propuesta.
> 2.  El contenido íntegro de los nuevos archivos Markdown para las secciones faltantes.
> 3.  Un resumen de "Gaps" o vacíos críticos detectados en el proyecto.

---

## Instrucciones de Uso

1.  **Personalización:** Antes de enviar el prompt, rellena los corchetes `[INSERTAR NOMBRE AQUÍ]` con el nombre de la carpeta o del proyecto tal como aparece en tu Drive.
2.  **Permisos:** Asegúrate de que la extensión de "Google Workspace" (en el caso de Gemini) esté activada para que la IA pueda leer tus archivos.
3.  **Iteración:** Si el proyecto es muy extenso, puedes decir: *"Empecemos solo con el Módulo de Usuarios, analiza la documentación y genera los pendientes de ese módulo primero"*.
