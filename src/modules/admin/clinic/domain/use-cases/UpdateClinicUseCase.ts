import type { Clinic } from "@/shared/types";
import type { ClinicRepository } from "@/modules/admin/clinic/domain/repositories/ClinicRepository";

export default class UpdateClinicUseCase {
  constructor(private readonly clinicRepository: ClinicRepository) {}

  async execute(data: Partial<Clinic>): Promise<Clinic> {
    return this.clinicRepository.update(data);
  }
}
