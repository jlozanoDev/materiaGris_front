# Módulo Técnico: Admin — Configuración de Clínica

## Descripción

Módulo de administración para la edición de datos institucionales de la clínica. Sigue Clean Architecture con capas domain → infrastructure → application → presentation. La clínica es un singleton (una sola fila en base de datos), por lo que no hay listado ni CRUD múltiple — solo una página de edición.

## Rutas

| Ruta | Vista | Permiso Requerido |
|------|-------|-------------------|
| `/admin/clinic` | `ClinicEditPage.vue` | `admin.clinic.update` |

## Estructura del módulo

```
src/modules/admin/clinic/
├── domain/
│   ├── entities/
│   │   └── Clinic.ts            # Re-exporta tipo Clinic de shared/types
│   ├── repositories/
│   │   └── ClinicRepository.ts   # Interfaz: get(), update(data), uploadLogo(file)
│   └── use-cases/
│       ├── UpdateClinicUseCase.ts # Caso de uso: actualizar datos de clínica
│       └── UploadClinicLogoUseCase.ts # Caso de uso: subir logo multipart
├── infrastructure/
│   └── ApiClinicRepository.ts    # Implementación HTTP: GET/PUT /admin/clinic, POST /admin/clinic/logo
├── application/
│   └── containers/
│       └── clinicContainer.ts     # DI: provideClinicRepository, provideUpdateClinicUseCase, provideUploadClinicLogoUseCase
└── presentation/
    ├── composables/
    │   ├── useClinicForm.ts       # Estado del formulario, validación, submit
    │   └── useClinicLogo.ts       # Validación (MIME, 5MB), upload, estado reactivo
    ├── components/
    │   └── ClinicLogoUpload.vue   # Drop zone, file picker, preview, errores
    └── pages/
        └── ClinicEditPage.vue     # Página completa con formulario + logo upload
```

## Store Global

| Store | Ubicación | Propósito |
|-------|-----------|-----------|
| `useClinicStore` | `core/store/clinic.ts` | Pinia setup syntax. Cachea datos de clínica para toda la app. Fetch en `main.ts` al iniciar. |

### API del Store

| Propiedad/Acción | Tipo | Descripción |
|-----------------|------|-------------|
| `clinic` | `Ref<Clinic \| null>` | Datos de la clínica |
| `loading` | `Ref<boolean>` | Estado de carga |
| `error` | `Ref<string \| null>` | Mensaje de error |
| `fetchClinic()` | async | GET /admin/clinic → actualiza `clinic` |
| `updateLogo(url)` | sync | Actualiza `clinic.logo` sin fetch adicional |

## Composable Compartido

### `useReportVariableResolver(user, clinic)`

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `user` | `Ref<AuthUser>` | Usuario autenticado (reactivo) |
| `clinic` | `Ref<Clinic \| null>` | Datos de clínica (reactivo) |
| **Retorna** | `{ variables: ComputedRef }` | Objeto con todas las variables resueltas |

**Variables mapeadas:**

| Categoría | Variables |
|-----------|-----------|
| `medico.*` | nombre, apellido, matricula, nro_colegiado, especialidad, telefono |
| `usuario.*` | nombre |
| `clinica.*` | nombre, direccion, telefono, email, ciudad, provincia, codigo_postal, web, cuit, logo |

**Fix aplicado:** `medico.matricula` ahora resuelve desde `user.num_colegiado`. Antes usaba `user.email` (bug).

**Null handling:** Campos `null` → `"—"` (excepto `clinica.logo` → `""` para no mostrar `<img>` vacío).

**`clinica.logo`:** Resuelve a `<img src="URL" alt="Logo" style="max-width:100%">` cuando existe, o `""` cuando es `null`. El HTML se renderiza via `v-html` en `FixedTextRenderer`.

## Componentes Relacionados

| Componente | Ubicación | Propósito |
|------------|-----------|-----------|
| `AppSidebar.vue` | `shared/components/` | Entrada "Clínica" en dropdown Ajustes (primer ítem) |
| `ClinicEditPage.vue` | `modules/admin/clinic/presentation/pages/` | Formulario de edición + logo upload |
| `ClinicLogoUpload.vue` | `modules/admin/clinic/presentation/components/` | Drop zone, file picker, preview, errores |
| `ReportFillPage.vue` | `modules/reports/presentation/pages/` | Consume variables vía composable |
| `ReportPdfExport.vue` | `modules/reports/presentation/components/` | Consume variables vía composable |
| `ReportDocumentRenderer.vue` | `modules/admin/report-template/presentation/components/` | Usa `{clinica.nombre}` y `{clinica.logo}` |
| `PreviewModal.vue` | `modules/admin/report-template/presentation/components/` | Vista previa con resolución de variables |
| `PrintPreviewModal.vue` | `modules/admin/report-template/presentation/components/` | Vista impresión con resolución de variables |

## Lógica de Estado

### Flujo de datos

```
main.ts
  → clinicStore.fetchClinic()         # GET /admin/clinic al iniciar
    → ApiClinicRepository (via fetchClient)
      → clinicStore.clinic = response

ClinicEditPage.vue
  → clinicContainer.provideUpdateClinicUseCase()
    → useClinicForm(clinicStore)
      → UpdateClinicUseCase.execute(data)
        → ApiClinicRepository.update(data)  # PUT /admin/clinic
          → clinicStore.clinic = response   # Actualiza cache

ClinicEditPage.vue (logo)
  → useClinicLogo()
    → provideUploadClinicLogoUseCase()
      → UploadClinicLogoUseCase.execute(file)
        → ApiClinicRepository.uploadLogo(file)  # POST /admin/clinic/logo (multipart)
          → clinicStore.updateLogo(url)         # Actualiza logo en cache
            → <ClinicLogoUpload> preview actualizado

ReportFillPage / ReportPdfExport
  → useReportVariableResolver(authStore.user, clinicStore.clinic)
    → variables computadas para templates

ReportTemplateBuilderPage
  → useClinicStore + useReportVariableResolver
    → variableResolver pasado a PreviewModal y PrintPreviewModal
      → DynamicFormRenderer / ReportDocumentRenderer resuelven {clinica.logo}
```

### Validación del formulario

| Campo | Regla | Máx |
|-------|-------|-----|
| nombre | string | 255 |
| direccion | string | 500 |
| telefono | string | 50 |
| email | email válido | 255 |
| ciudad | string | 255 |
| provincia | string | 255 |
| codigo_postal | string | 20 |
| web | URL válida | 255 |
| cuit | string | 20 |

## DI (Inyección de Dependencias)

| Contenedor | Exporta |
|------------|---------|
| `clinicContainer.ts` | `provideClinicRepository()` + `provideUpdateClinicUseCase()` + `provideUploadClinicLogoUseCase()` |
| `serviceRegistry.ts` | `setClinicStore()` + `getClinicStore()` |

## Sidebar

Entrada en dropdown "Ajustes" del `AppSidebar.vue`:

```html
<!-- Clínica — primer ítem del dropdown -->
<li v-if="authStore.hasPermission('admin.clinic.update')">
  <button @click="openAdminRoute({ name: 'AdminClinic' })">
    <i class="pi pi-building"></i>
    <span>Clínica</span>
  </button>
</li>
```

El permiso `admin.clinic.update` también se agregó al computed `hasAnySettingsPermission`.

## Sistema de Variables de Sistema (useSystemVariableRegistry)

Registro de variables del sistema para el builder de plantillas. Incluye `clinica.logo` en `registerFallbackVariables()` para que la variable esté disponible incluso sin conexión a API.

**Variables registradas bajo `clinica.*`:** nombre, direccion, telefono, email, ciudad, provincia, codigo_postal, web, cuit, logo.

## Estado de Desarrollo

✅ **Completo.** Módulo implementado con Clean Architecture completa. 41 tests unitarios: `useClinicForm` (14), `ClinicEditPage` (15 + 6 de logo), store (9), composable resolver (23). Logo upload con validación MIME, 5MB, drop zone, preview, y resolución de `{clinica.logo}` en plantillas.

## Pendientes (Roadmap)

- [ ] Foto de portada / imágenes institucionales
- [ ] Historial de cambios de datos de clínica (auditoría)
