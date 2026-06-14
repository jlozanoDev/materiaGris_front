# Módulo Funcional: Administración — Cabecera y Pie en Plantillas de Informe

## Propósito de Negocio

Permitir al administrador configurar **cabeceras y pies configurables** en las plantillas de informe, usando el mismo sistema de campos que el cuerpo del informe. Esto permite personalizar el encabezado (nombre del médico, clínica, logotipo textual) y pie (página X de Y, pie de firma) de cada tipo de informe sin tocar código.

## Actores

- **Administrador**: diseña la cabecera, cuerpo y pie de cada plantilla
- **Médico**: visualiza cabecera/pie en modo read-only al rellenar el informe

## Funcionalidades

| Funcionalidad | Estado |
|--------------|--------|
| Cabecera configurable con toggle on/off | ✅ Implementado |
| Pie configurable con toggle on/off | ✅ Implementado |
| Selector de páginas (todas/primera/última) | ✅ Implementado |
| Builder drag & drop en cabecera y pie | ✅ Implementado |
| 10 tipos de campo en cabecera y pie | ✅ Implementado |
| Vista previa con cabecera y pie | ✅ Implementado |
| Render read-only en formulario de reporte | ✅ Implementado |
| Variables de sistema en texto fijo de cabecera/pie | ✅ Implementado |
| Templates legacy sin cabecera/pie cargan con defaults | ✅ Implementado |

## Criterios de Aceptación

- El administrador puede activar/desactivar la cabecera con un toggle
- El administrador puede seleccionar en qué páginas aparece la cabecera (todas/primera/última)
- La cabecera y el pie usan el mismo sistema de campos que el cuerpo
- Los templates existentes sin cabecera/pie funcionan sin cambios
- En el formulario de reporte, la cabecera y el pie se muestran como texto estático (sin inputs)
- Las variables de sistema (`{paciente.nombre}`) se interpolar correctamente en cabecera y pie

## Reglas de Negocio

- Cabecera y pie tienen `enabled: false` por defecto (comportamiento legacy)
- Los campos en cabecera/pie son read-only en el formulario de reporte
- `pageDisplay` se serializa pero el render multi-página real es futuro (MVP renderiza estático)
- Las claves (`key`) de los campos deben ser únicas en toda la plantilla (cabecera + cuerpo + pie)
- Si la cabecera/pie están deshabilitados, no se renderizan en ninguna vista

## Flujo Principal

1. Administrador navega a `Configuración > Plantillas > [Plantilla] > Editar`
2. Ve las pestañas: **Cabecera | Cuerpo | Pie**
3. Selecciona "Cabecera"
4. Activa la cabecera con el toggle
5. Selecciona "Mostrar en: Todas las páginas" (o Primera/Última)
6. Añade secciones y campos en la cabecera usando la paleta
7. Cambia a "Pie" y repite el proceso
8. Guarda la plantilla
9. Vista previa muestra cabecera y pie
10. Médico ve cabecera y pie como texto estático al rellenar informe

## Flujo de Reporte (Médico)

1. Médico abre un informe basado en la plantilla
2. Ve la cabecera configurada (texto estático) sobre el formulario
3. Rellena los campos del cuerpo normalmente
4. Ve el pie configurado (texto estático) bajo el formulario
5. La cabecera y pie NO son editables

## Dependencias

- API: misma que plantillas existentes — `structure` es JSON libre, backend acepta campos extra
- Variables de sistema: mismas que cuerpo (`{paciente.nombre}`, `{usuario.nombre_completo}`, etc.)
