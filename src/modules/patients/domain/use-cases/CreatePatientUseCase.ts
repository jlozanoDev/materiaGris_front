import type { PatientRepository } from "@/modules/patients/domain/repositories/PatientRepository";

export default class CreatePatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(payload: Record<string, unknown>): Promise<any> {
    return this.patientRepository.create(payload);
  }
}
