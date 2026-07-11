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
│   │   └── ClinicRepository.ts   # Interfaz: get(), update(data)
│   └── use-cases/
│       └── UpdateClinicUseCase.ts # Caso de uso: actualizar datos de clínica
├── infrastructure/
│   └── ApiClinicRepository.ts    # Implementación HTTP: GET/PUT /admin/clinic
├── application/
│   └── containers/
│       └── clinicContainer.ts     # DI: provideClinicRepository, provideUpdateClinicUseCase
└── presentation/
    ├── composables/
    │   └── useClinicForm.ts       # Estado del formulario, validación, submit
    └── pages/
        └── ClinicEditPage.vue     # Página completa con formulario Vuetify
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
| `clinica.*` | nombre, direccion, telefono, email, ciudad, provincia, codigo_postal, web, cuit |

**Fix aplicado:** `medico.matricula` ahora resuelve desde `user.num_colegiado`. Antes usaba `user.email` (bug).

**Null handling:** Campos `null` → `"—"`.

## Componentes Relacionados

| Componente | Ubicación | Propósito |
|------------|-----------|-----------|
| `AppSidebar.vue` | `shared/components/` | Entrada "Clínica" en dropdown Ajustes (primer ítem) |
| `ClinicEditPage.vue` | `modules/admin/clinic/presentation/pages/` | Formulario de edición |
| `ReportFillPage.vue` | `modules/reports/presentation/pages/` | Consume variables vía composable |
| `ReportPdfExport.vue` | `modules/reports/presentation/components/` | Consume variables vía composable |
| `ReportDocumentRenderer.vue` | `modules/admin/report-template/presentation/components/` | Usa `{clinica.nombre}` |

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

ReportFillPage / ReportPdfExport
  → useReportVariableResolver(authStore.user, clinicStore.clinic)
    → variables computadas para templates
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
| `clinicContainer.ts` | `provideClinicRepository()` + `provideUpdateClinicUseCase()` |
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

## Estado de Desarrollo

✅ **Completo.** Módulo implementado con Clean Architecture completa. 26 tests unitarios para `useClinicForm` (14) y `ClinicEditPage` (12). Store con 9 tests. Composable resolver con 23 tests.

## Pendientes (Roadmap)

- [ ] Agregar vista previa de logo de clínica (si se implementa upload de logo en backend)
- [ ] Foto de portada / imágenes institucionales
- [ ] Historial de cambios de datos de clínica (auditoría)
