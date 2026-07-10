## Exploration: Frontend Clinic + User Specs

### Current State

The frontend (Vue 3 + Vite + Pinia) has a modular hexagonal architecture (`src/modules/<feature>/`). Auth is handled by a single Pinia store (`useAuthStore`), reports use a `SystemVariableRegistry` for `{category.key}` interpolation in dynamic templates, and there is NO clinic data store yet.

### Affected Areas

| File | Role | Lines | Change |
|------|------|-------|--------|
| `src/shared/types/index.ts` | AuthUser interface + all shared types | 289 | Add 4 nullable fields to AuthUser |
| `src/core/store/auth.ts` | Pinia auth store (only store in app) | 74 | No changes needed — fields come from /me response |
| `src/modules/auth/infrastructure/ApiUserRepository.ts` | /auth/me fetch | 51 | No changes — response auto-mapped |
| `src/shared/types/SystemVariableRegistry.ts` | Variable registry class | 153 | No changes needed |
| `src/shared/composables/useSystemVariableRegistry.ts` | Fetches system-variables, fallback vars | 109 | Add ~17 missing variables in fallback + real fetch |
| `src/modules/reports/presentation/pages/ReportFillPage.vue` | Report fill/edit page with resolver | 726 | Extract ~60 duplicated resolver lines → shared composable; fix "Materia Gris" hardcode (L483); fix medico.matricula→email bug (L493); add new medico.* + clinica.* resolvers |
| `src/modules/reports/presentation/components/ReportPdfExport.vue` | PDF export with resolver | 161 | Replace ~60 duplicated resolver lines → use shared composable; fix "Materia Gris" hardcode (L107); fix same bug (L117) |
| `src/modules/admin/report-template/presentation/components/ReportDocumentRenderer.vue` | Template preview renderer | 512 | Fix hardcoded `clinica.nombre` (L303) |
| `src/core/services/serviceRegistry.ts` | Service locator for DI | 22 | Add clinic store setter/getter |
| `src/main.ts` | App bootstrap | 60 | Fetch clinic on init |
| **NEW** `src/core/store/clinic.ts` | Pinia clinic store | ~50 est. | New file |
| **NEW** `src/shared/composables/useReportVariableResolver.ts` | Shared resolver composable | ~100 est. | New file — extracted logic |

### Current Patterns

**Store pattern** (from `src/core/store/auth.ts`):
- `defineStore("name", () => { ... })` setup syntax
- `ref()` for reactive state, functions for actions
- Returns public API object
- Uses `getX()` from `@/core/services/serviceRegistry` for DI

**Service call pattern** (from `ApiReportRepository.ts`):
- `import { fetchClient } from "@/core/api/httpClient"`
- `fetchClient("/path", { method: "GET" })` returns parsed JSON
- Repositories implement domain interfaces, instantiated in `application/containers/`

**Variable resolution pattern**:
1. `SystemVariableRegistry` class: register category+key+resolver, then `interpolate(text)`
2. Runtime resolvers currently built inline in both `ReportFillPage` and `ReportPdfExport`
3. Template builder (`useSystemVariableRegistry`) fetches `/admin/system-variables` for metadata only (category, key, label, description — NO resolvers)
4. Fallback vars in `useSystemVariableRegistry.ts` register 14 metadata entries (no resolvers)
5. `ReportDocumentRenderer` has separate hardcoded `previewVars` (L298-309)

### Exact Locations of Issues

1. **AuthUser type** — `src/shared/types/index.ts:7-14`
   ```ts
   export interface AuthUser {
     id: number | string;
     name: string;
     email: string;
     permissions: PermissionShape[] | string[] | Record<string, number>;
     roles?: RoleSummary[];
     is_active?: boolean;
   }
   ```

2. **/me fetch** — `src/modules/auth/infrastructure/ApiUserRepository.ts:32-34`
   ```ts
   async me(): Promise<AuthUser> {
     return await fetchClient("/auth/me", { method: "GET", ignoreUnauthorized: true });
   }
   ```

3. **"Materia Gris" hardcode** (2 locations + 1 preview):
   - `ReportFillPage.vue:483` — `registry.register("clinica", "nombre", "Clínica", undefined, () => "Materia Gris"); // TODO: backend`
   - `ReportPdfExport.vue:107` — `registry.register('clinica', 'nombre', 'Clínica', undefined, () => 'Materia Gris')`
   - `ReportDocumentRenderer.vue:303` — `'clinica.nombre': 'Clínica Materia Gris',` (preview data)

4. **medico.matricula → email BUG** (2 locations):
   - `ReportFillPage.vue:493` — `if (u?.email) registry.register("medico", "matricula", "Matrícula", undefined, () => String(u.email));`
   - `ReportPdfExport.vue:117` — `if (u?.email) registry.register('medico', 'matricula', 'Matrícula', undefined, () => String(u.email))`

5. **Duplicated resolver blocks** (~60 lines each):
   - `ReportFillPage.vue:451-510` — variableResolver computed
   - `ReportPdfExport.vue:74-134` — variableResolver computed
   - Identical logic: fecha (3), paciente (10), clinica (1), medico (2), usuario (3), legacy (4) + calcAge wrapper

6. **System variables metadata** — `src/shared/composables/useSystemVariableRegistry.ts:68-83`
   Current fallback registers 14 variables. Missing ~17 resolver-backed entries for clinica.* and medico.* fields.

### Missing Variables (detailed)

**Registered as metadata only (no runtime resolver)**:
- `clinica.direccion` — only fallback metadata, no resolver in ReportFillPage/PdfExport
- `clinica.telefono` — only fallback metadata, no resolver
- `medico.matricula` — fallback metadata exists, but runtime resolver is bugged (uses email)
- `medico.especialidad` — only fallback metadata, no resolver

**Not registered at all (need both metadata + runtime resolver)**:
- `clinica.cuit` — new field from backend
- `clinica.razon_social` — new
- `clinica.email` — new
- `medico.num_colegiado` — replaces bugged medico.matricula
- `medico.telefono` — new
- `medico.apellido` — new (from AuthUser.apellido)

Also need to correct `medico.matricula` resolver to use `num_colegiado` instead of `email`.

### Gotchas / Surprises

1. **No centralized app init**: `fetchUser()` is called in `onMounted` of individual pages (DashboardPage, PatientsPage, etc.) and in `router.beforeEach`. There is NO single `App.vue` onMounted or main.ts hook that fetches user on startup. Adding clinic fetch needs similar pattern.

2. **SystemVariableRegistry split personality**: The fallback registry in `useSystemVariableRegistry.ts` only registers metadata (no resolvers), while the runtime resolvers in ReportFillPage/PdfExport instantiate their own `new SystemVariableRegistry()` with actual resolver functions. These are TWO separate instances. The template builder autocomplete reads from the fallback; the fill page builds its own.

3. **ReportDocumentRenderer previewVars**: `src/modules/admin/report-template/presentation/components/ReportDocumentRenderer.vue:298-309` has a separate hardcoded `previewVars` object. This is a THIRD location for variable values. Should at least remove the hardcoded clinic name.

4. **ApiReportRepository.archive()** uses raw `fetch()` instead of `fetchClient()` (line 106-117) — an existing inconsistency but not in scope.

5. **No `Calendar`/`Accordion` imports needed** — the task says "Delete ~80 duplicated lines in ReportFillPage and ReportPdfExport" but these are NOT duplicate component imports; they are duplicated resolver registration logic (~60 lines, not 80). The 80 figure may include other duplicated patterns.

6. **AuthUser keys in localStorage**: User is serialized/deserialized to localStorage via `_storage.get("user")`. Adding fields to AuthUser is safe since deserialization will just include whatever JSON the backend returns.

### Line Counts and Complexity

| Area | Lines | Complexity | Notes |
|------|-------|------------|-------|
| AuthUser type change | +4 lines | Low | Add 4 optional fields |
| New clinic store | ~50 new | Low | Follows auth store pattern exactly |
| Shared resolver composable | ~100 new | Medium | Must handle both ReportFillPage and PdfExport contexts |
| Extract resolver from ReportFillPage | -60 lines | Medium | Replace with composable call |
| Extract resolver from ReportPdfExport | -60 lines | Medium | Replace with composable call |
| Fix "Materia Gris" hardcodes | 3 locations | Low | Replace with clinic store value |
| Fix medico.matricula bug | 2 locations | Low | Replace u.email → u.num_colegiado |
| Register ~17 variables | ~40 lines | Low | In useSystemVariableRegistry + shared composable |
| main.ts clinic init | ~5 lines | Low | fetch after auth setup |

### Recommended Implementation Approach

1. **Extend AuthUser first** — Add `apellido?, num_colegiado?, especialidad?, telefono?` to the interface. No code changes needed elsewhere since /me is a transparent pass-through.

2. **Create clinic store** (`src/core/store/clinic.ts`) — Follow `auth.ts` pattern: fetch GET `/admin/clinic`, cache in ref, persist. Register in `serviceRegistry.ts`.

3. **Extract shared resolver composable** (`src/shared/composables/useReportVariableResolver.ts`) — Accept patient data, user data, and clinic data as inputs. Register all variables. Export a `resolve(text: string): string` function.

4. **Refactor ReportFillPage** — Delete lines 451-510 (variableResolver computed). Import and use the shared composable, passing `patientData`, `authStore.user`, and `clinicStore.clinic`.

5. **Refactor ReportPdfExport** — Delete lines 74-134. Use same shared composable.

6. **Fix bugs**: Replace `u.email` → `u.num_colegiado` for medico.matricula in the shared composable.

7. **Fix "Materia Gris" hardcodes**: Replace with `clinicStore.clinic?.nombre ?? ""`.

8. **Register missing variables in `useSystemVariableRegistry.ts` fallback** — Add clinica.cuit, clinica.razon_social, clinica.email, medico.num_colegiado, medico.telefono entries.

9. **Update ReportDocumentRenderer previewVars** — Remove hardcoded clinic name or make it dynamic.

10. **Trigger clinic fetch** — In `main.ts` after auth setup, call `clinicStore.fetchClinic()`.

**Order of operations**: 1 (type) → 2 (store) → 3 (composable) → 4+5 (refactor pages) → 6+7 (fix bugs) → 8 (metadata) → 9+10 (cleanup/init).

### Ready for Proposal

Yes — all investigation complete. The orchestrator should tell the user:
- Confirmed: AuthUser missing 4 fields, medico.matricula is bugged (uses email), "Materia Gris" is hardcoded in 3 places, ~120 lines of resolver logic is duplicated, no clinic store exists.
- Recommended: Create shared composable, clinic store, extend AuthUser, fix both bugs, register ~17 missing variables.
- Risk: Low — all changes are additive or refactoring existing patterns.
- Effort: Medium (~200 lines of new code, ~150 lines removed, 3 files refactored).
