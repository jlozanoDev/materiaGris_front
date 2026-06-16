import type { Patient } from "@/shared/types";

export interface PatientSearchFilters {
  q?: string;
  age_min?: number;
  age_max?: number;
  gender?: string;
  city?: string;
  insurance?: string[];
  registered_from?: string;
  registered_to?: string;
  last_visit_from?: string;
  last_visit_to?: string;
  is_active?: string;
}

export interface PatientRepository {
  search(filters: PatientSearchFilters): Promise<Patient[]>;
  getById(id: number | string): Promise<Patient>;
  create(payload: Record<string, unknown>): Promise<Patient>;
  update(id: number | string, payload: Record<string, unknown>): Promise<Patient>;
}
