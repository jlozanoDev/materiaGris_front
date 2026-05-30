import type { ApiError } from "@/shared/types";

export function parseApiError(err: ApiError | any): string {
  if (!err) return "Ha ocurrido un error.";

  if (err.body) {
    const b = err.body;
    if (typeof b === "string") {
      try {
        const parsed = JSON.parse(b);
        return parsed?.message || b.replace(/<[^>]*>/g, "");
      } catch (_) {
        return b.replace(/<[^>]*>/g, "") || "Ha ocurrido un error.";
      }
    } else if (typeof b === "object") {
      if (b.message) return b.message;
      if (b.errors) {
        try {
          return Object.values(b.errors).flat().join(" ") || "Ha ocurrido un error.";
        } catch (_) {
          return "Ha ocurrido un error.";
        }
      }
      return JSON.stringify(b);
    }
  }

  if (err.status === 401) return "No autorizado. Inténtalo de nuevo.";
  return err?.message || "No se pudo conectar con el servidor";
}
