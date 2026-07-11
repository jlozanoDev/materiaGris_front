import type { Clinic } from "@/shared/types";

export interface ClinicRepository {
  get(): Promise<Clinic>;
  update(data: Partial<Clinic>): Promise<Clinic>;
  uploadLogo(file: File): Promise<Clinic>;
}
