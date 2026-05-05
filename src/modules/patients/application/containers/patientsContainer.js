import ApiPatientRepository from '@/modules/patients/infrastructure/ApiPatientRepository'
import SearchPatientsUseCase from '@/modules/patients/domain/use-cases/SearchPatientsUseCase'
import CreatePatientUseCase from '@/modules/patients/domain/use-cases/CreatePatientUseCase'
import UpdatePatientUseCase from '@/modules/patients/domain/use-cases/UpdatePatientUseCase'

export function provideSearchPatientsUseCase() {
  return new SearchPatientsUseCase(new ApiPatientRepository())
}

export function provideCreatePatientUseCase() {
  return new CreatePatientUseCase(new ApiPatientRepository())
}

export function provideUpdatePatientUseCase() {
  return new UpdatePatientUseCase(new ApiPatientRepository())
}

export default { provideSearchPatientsUseCase, provideCreatePatientUseCase, provideUpdatePatientUseCase }
