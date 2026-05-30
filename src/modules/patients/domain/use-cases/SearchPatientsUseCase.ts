import type { PatientRepository } from "@/modules/patients/domain/repositories/PatientRepository";

export default class SearchPatientsUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(filters: Record<string, unknown> = {}): Promise<any> {
    return this.patientRepository.search(filters);
  }
}
