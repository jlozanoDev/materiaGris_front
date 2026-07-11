import { computed, type Ref } from "vue";
import { SystemVariableRegistry } from "@/shared/types/SystemVariableRegistry";
import type { AuthUser, Clinic } from "@/shared/types";

/**
 * Shared composable that replaces duplicated inline resolver logic
 * in ReportFillPage and ReportPdfExport.
 *
 * Accepts reactive refs for user and clinic; returns a `resolve(text)` function
 * that interpolates {category.key} placeholders with live values.
 *
 * Null fields render as "—".
 */
export function useReportVariableResolver(
  user: Ref<AuthUser | null>,
  clinic: Ref<Clinic | null>,
): { resolve: (text: string) => string } {
  const resolve = computed<(text: string) => string>(() => {
    const registry = new SystemVariableRegistry();

    const u = user.value;
    const c = clinic.value;

    // ── Helper: resolve field or "—" ───────────────────────────────────
    const val = (v: unknown): string => {
      if (v === null || v === undefined) return "—";
      return String(v);
    };

    // ── Médico ─────────────────────────────────────────────────────────
    const medicoNombre = u?.name ?? null;
    registry.register("medico", "nombre", "Nombre", undefined, () => val(medicoNombre));

    const medicoApellido = u?.apellido ?? null;
    registry.register("medico", "apellido", "Apellido", undefined, () => val(medicoApellido));

    const medicoMatricula = u?.num_colegiado ?? null;
    registry.register("medico", "matricula", "Matrícula", undefined, () => val(medicoMatricula));
    registry.register("medico", "nro_colegiado", "Nro. Colegiado", undefined, () => val(medicoMatricula));

    const medicoEspecialidad = u?.especialidad ?? null;
    registry.register("medico", "especialidad", "Especialidad", undefined, () => val(medicoEspecialidad));

    const medicoTelefono = u?.telefono ?? null;
    registry.register("medico", "telefono", "Teléfono", undefined, () => val(medicoTelefono));

    // ── Usuario ────────────────────────────────────────────────────────
    const usuarioNombre = u?.name ?? null;
    registry.register("usuario", "nombre", "Usuario", undefined, () => val(usuarioNombre));

    // ── Clínica ────────────────────────────────────────────────────────
    const clinicaNombre = c?.nombre ?? null;
    registry.register("clinica", "nombre", "Nombre", undefined, () => val(clinicaNombre));

    const clinicaDireccion = c?.direccion ?? null;
    registry.register("clinica", "direccion", "Dirección", undefined, () => val(clinicaDireccion));

    const clinicaTelefono = c?.telefono ?? null;
    registry.register("clinica", "telefono", "Teléfono", undefined, () => val(clinicaTelefono));

    const clinicaEmail = c?.email ?? null;
    registry.register("clinica", "email", "Email", undefined, () => val(clinicaEmail));

    const clinicaCiudad = c?.ciudad ?? null;
    registry.register("clinica", "ciudad", "Ciudad", undefined, () => val(clinicaCiudad));

    const clinicaProvincia = c?.provincia ?? null;
    registry.register("clinica", "provincia", "Provincia", undefined, () => val(clinicaProvincia));

    const clinicaCodigoPostal = c?.codigo_postal ?? null;
    registry.register("clinica", "codigo_postal", "Código Postal", undefined, () => val(clinicaCodigoPostal));

    const clinicaWeb = c?.web ?? null;
    registry.register("clinica", "web", "Web", undefined, () => val(clinicaWeb));

    const clinicaCuit = c?.cuit ?? null;
    registry.register("clinica", "cuit", "CUIT", undefined, () => val(clinicaCuit));

    // ── Clinica Logo ───────────────────────────────────────────────────
    registry.register("clinica", "logo", "Logo de la clínica", undefined, () => {
      const logoUrl = c?.logo ?? null;
      if (!logoUrl) return "";
      return `<img src="${logoUrl}" alt="Logo" style="max-width:100%">`;
    });

    return (text: string): string => {
      return registry.interpolate(text);
    };
  });

  return { resolve: (text: string) => resolve.value(text) };
}
