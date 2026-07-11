import type { Clinic } from "@/shared/types";
import type { ClinicRepository } from "@/modules/admin/clinic/domain/repositories/ClinicRepository";

export default class UploadClinicLogoUseCase {
  constructor(private readonly clinicRepository: ClinicRepository) {}

  async execute(file: File): Promise<Clinic> {
    return this.clinicRepository.uploadLogo(file);
  }
}
