import PatientRepository from "@/modules/patients/domain/repositories/PatientRepository";
import { fetchClient } from "@/core/api/httpClient";

export default class ApiPatientRepository extends PatientRepository {
  async search(filters = {}) {
    const params = new URLSearchParams();

    if (filters.q) params.append("q", filters.q);
    if (filters.age_min) params.append("age_min", String(filters.age_min));
    if (filters.age_max) params.append("age_max", String(filters.age_max));
    if (filters.gender) params.append("gender", filters.gender);
    if (filters.city) params.append("city", filters.city);
    if (filters.registered_from) params.append("registered_from", filters.registered_from);
    if (filters.registered_to) params.append("registered_to", filters.registered_to);
    if (filters.last_visit_from) params.append("last_visit_from", filters.last_visit_from);
    if (filters.last_visit_to) params.append("last_visit_to", filters.last_visit_to);
    if (filters.is_active && filters.is_active !== "all")
      params.append("is_active", filters.is_active);
    if (Array.isArray(filters.insurance) && filters.insurance.length > 0) {
      filters.insurance.forEach((i) => params.append("insurance[]", String(i)));
    }

    const url = params.toString() ? `/patients/find?${params.toString()}` : "/patients/find";
    const res = await fetchClient(url);
    return Array.isArray(res) ? res : res?.data || [];
  }

  async create(payload) {
    const body = { ...payload };
    if (body.insurance_id === "") delete body.insurance_id;
    // Remove empty-string values for nullable fields to avoid validation issues
    Object.keys(body).forEach((k) => {
      if (body[k] === "") delete body[k];
    });
    return fetchClient("/patients", { method: "POST", body: JSON.stringify(body) });
  }

  async update(id, payload) {
    const body = { ...payload };
    if (body.insurance_id === "") delete body.insurance_id;
    Object.keys(body).forEach((k) => {
      if (body[k] === "") delete body[k];
    });
    return fetchClient(`/patients/${id}`, { method: "PUT", body: JSON.stringify(body) });
  }
}
