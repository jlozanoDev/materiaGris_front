import ApiClinicRepository from "@/modules/admin/clinic/infrastructure/ApiClinicRepository";
import UpdateClinicUseCase from "@/modules/admin/clinic/domain/use-cases/UpdateClinicUseCase";

export function provideUpdateClinicUseCase(): UpdateClinicUseCase {
  const clinicRepo = new ApiClinicRepository();
  return new UpdateClinicUseCase(clinicRepo);
}
