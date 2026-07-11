import type { Clinic } from "@/shared/types";
import type { ClinicRepository } from "@/modules/admin/clinic/domain/repositories/ClinicRepository";

export default class UploadClinicLogoUseCase {
  static readonly ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/svg+xml",
    "image/webp",
  ];
  static readonly MAX_SIZE = 5 * 1024 * 1024; // 5MB

  constructor(private readonly clinicRepository: ClinicRepository) {}

  async execute(file: File): Promise<Clinic> {
    if (!UploadClinicLogoUseCase.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(
        "Tipo de archivo no válido. Solo se aceptan PNG, JPG, SVG y WebP.",
      );
    }

    if (file.size > UploadClinicLogoUseCase.MAX_SIZE) {
      throw new Error("El archivo excede el tamaño máximo de 5MB.");
    }

    return this.clinicRepository.uploadLogo(file);
  }
}
