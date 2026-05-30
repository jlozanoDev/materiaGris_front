import type { PatientRepository } from "@/modules/patients/domain/repositories/PatientRepository";

export default class UpdatePatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(id: number | string, payload: Record<string, unknown>): Promise<any> {
    return this.patientRepository.update(id, payload);
  }
}
