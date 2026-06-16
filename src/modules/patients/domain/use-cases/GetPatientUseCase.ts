import type { PatientRepository } from "@/modules/patients/domain/repositories/PatientRepository";

export default class GetPatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(id: number | string): Promise<any> {
    return this.patientRepository.getById(id);
  }
}
