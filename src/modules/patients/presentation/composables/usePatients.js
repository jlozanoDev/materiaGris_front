import { ref } from 'vue'
import { provideSearchPatientsUseCase, provideCreatePatientUseCase, provideUpdatePatientUseCase } from '@/modules/patients/application/containers/patientsContainer'

export function usePatients() {
  const patients = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchPatients(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const useCase = provideSearchPatientsUseCase()
      patients.value = await useCase.execute(filters)
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function createPatient(payload) {
    const useCase = provideCreatePatientUseCase()
    return useCase.execute(payload)
  }

  async function updatePatient(id, payload) {
    const useCase = provideUpdatePatientUseCase()
    return useCase.execute(id, payload)
  }

  return { patients, loading, error, fetchPatients, createPatient, updatePatient }
}
