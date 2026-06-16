import ApiPatientRepository from "@/modules/patients/infrastructure/ApiPatientRepository";
import SearchPatientsUseCase from "@/modules/patients/domain/use-cases/SearchPatientsUseCase";
import CreatePatientUseCase from "@/modules/patients/domain/use-cases/CreatePatientUseCase";
import UpdatePatientUseCase from "@/modules/patients/domain/use-cases/UpdatePatientUseCase";
import GetPatientUseCase from "@/modules/patients/domain/use-cases/GetPatientUseCase";

export function provideSearchPatientsUseCase(): SearchPatientsUseCase {
  return new SearchPatientsUseCase(new ApiPatientRepository());
}

export function provideCreatePatientUseCase(): CreatePatientUseCase {
  return new CreatePatientUseCase(new ApiPatientRepository());
}

export function provideUpdatePatientUseCase(): UpdatePatientUseCase {
  return new UpdatePatientUseCase(new ApiPatientRepository());
}

export function provideGetPatientUseCase(): GetPatientUseCase {
  return new GetPatientUseCase(new ApiPatientRepository());
}
