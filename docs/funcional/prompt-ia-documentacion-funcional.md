# Prompt Maestro: Auditoría y Reorganización de Documentación Funcional

Este documento contiene el prompt optimizado para que una IA analice, estructure y complete la documentación funcional del proyecto.

---

## El Prompt

Copia y pega el siguiente texto en el chat de la IA:

> **Actúa como un Product Manager y Analista Funcional Senior. Tu objetivo es realizar una auditoría completa, reorganización y expansión de la documentación funcional de mi proyecto.**
>
> ### 1. Contexto del Proyecto
> * **Nombre del Proyecto:** MateriaGris
> * **Sector:** Salud / Gestión de Pacientes
> * **Tipo:** SPA (Vue 3) con API REST (Laravel)
> * **Ubicación de la documentación funcional:** `docs/funcional/`
>
> ### 2. Fase de Análisis
> * Busca y lee toda la documentación funcional existente en `docs/funcional/`.
> * Identifica los **perfiles de usuario** (médico, administrador, recepcionista, etc.).
> * Identifica todas las **funcionalidades** implementadas y las planificadas.
> * Revisa el código y la documentación técnica en `docs/tecnica/` para extraer reglas de negocio implícitas.
> * Detecta incoherencias entre lo documentado y el comportamiento real de la aplicación.
>
> ### 3. Tarea de Reorganización (Arquitectura de Información)
> * Propón una estructura de documentación organizada por **Módulos Funcionales** (ej. `Autenticación`, `Gestión de Pacientes`, `Administración del Sistema`).
> * Clasifica los documentos existentes dentro de esta nueva jerarquía.
>
> ### 4. Generación de Contenido (Nuevos Archivos)
> Para cada funcionalidad o módulo identificado que NO tenga documentación funcional detallada, genera el contenido de un nuevo archivo `.md` con la siguiente estructura:
> * **Propósito de Negocio:** Problema que resuelve y objetivo.
> * **Actores:** Roles de usuario que interactúan (médico, administrador, recepcionista).
> * **Funcionalidades:** Lista de características que ofrece.
> * **Criterios de Aceptación:** Condiciones que debe cumplir para considerarse completa.
> * **Reglas de Negocio:** Validaciones, restricciones y lógica de dominio.
> * **Flujo Principal:** Secuencia de pasos que sigue el usuario para completar la tarea.
> * **Flujos Alternativos:** Casos edge, errores, excepciones.
> * **Dependencias:** De qué otros módulos o servicios depende.
> * **Estado de Desarrollo:** (Implementado / Parcial / Planificado).
> * **Pendientes (Roadmap):** Lista detallada de lo que falta para considerar el módulo completo.
>
> ### 5. Entregable Esperado
> 1. Un **Índice Funcional** actualizado con la nueva estructura.
> 2. El contenido íntegro de los nuevos archivos Markdown para las secciones faltantes.
> 3. Un **Mapa de Cobertura** que muestre qué funcionalidades están documentadas vs implementadas.
> 4. Un resumen de **Gaps Funcionales** detectados (funcionalidades de negocio no cubiertas).

---

## Instrucciones de Uso

1. **Antes de enviar**, asegúrate de que la IA tenga acceso a los archivos en `docs/funcional/` y `docs/tecnica/`.
2. **Iteración:** Si el proyecto es muy extenso, puedes acotar: *"Empecemos solo con el Módulo de Autenticación, analiza la documentación funcional y genera los pendientes de ese módulo primero"*.
3. **Actualización continua:** Este prompt está diseñado para ejecutarse cada vez que se complete un hito de desarrollo, para mantener la documentación funcional al día.
