import ApiClinicRepository from "@/modules/admin/clinic/infrastructure/ApiClinicRepository";
import UpdateClinicUseCase from "@/modules/admin/clinic/domain/use-cases/UpdateClinicUseCase";
import UploadClinicLogoUseCase from "@/modules/admin/clinic/domain/use-cases/UploadClinicLogoUseCase";

export function provideUpdateClinicUseCase(): UpdateClinicUseCase {
  const clinicRepo = new ApiClinicRepository();
  return new UpdateClinicUseCase(clinicRepo);
}

export function provideUploadClinicLogoUseCase(): UploadClinicLogoUseCase {
  const clinicRepo = new ApiClinicRepository();
  return new UploadClinicLogoUseCase(clinicRepo);
}
