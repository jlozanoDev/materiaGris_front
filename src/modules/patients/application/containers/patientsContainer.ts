import ApiPatientRepository from "@/modules/patients/infrastructure/ApiPatientRepository";
import SearchPatientsUseCase from "@/modules/patients/domain/use-cases/SearchPatientsUseCase";
import CreatePatientUseCase from "@/modules/patients/domain/use-cases/CreatePatientUseCase";
import UpdatePatientUseCase from "@/modules/patients/domain/use-cases/UpdatePatientUseCase";

export function provideSearchPatientsUseCase(): SearchPatientsUseCase {
  return new SearchPatientsUseCase(new ApiPatientRepository());
}

export function provideCreatePatientUseCase(): CreatePatientUseCase {
  return new CreatePatientUseCase(new ApiPatientRepository());
}

export function provideUpdatePatientUseCase(): UpdatePatientUseCase {
  return new UpdatePatientUseCase(new ApiPatientRepository());
}
