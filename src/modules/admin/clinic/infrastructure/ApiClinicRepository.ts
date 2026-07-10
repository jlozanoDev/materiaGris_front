import type { ClinicRepository } from "@/modules/admin/clinic/domain/repositories/ClinicRepository";
import { fetchClient } from "@/core/api/httpClient";
import type { Clinic } from "@/shared/types";

export default class ApiClinicRepository implements ClinicRepository {
  async get(): Promise<Clinic> {
    try {
      return await fetchClient("/admin/clinic", { method: "GET" });
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403 || err?.status === 404 || err?.status === 422) {
        throw err;
      }
      throw new Error("Error al obtener datos de la clínica");
    }
  }

  async update(data: Partial<Clinic>): Promise<Clinic> {
    try {
      return await fetchClient("/admin/clinic", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403 || err?.status === 404 || err?.status === 422 || err?.status === 500) {
        throw err;
      }
      throw new Error("Error al actualizar la clínica");
    }
  }
}
