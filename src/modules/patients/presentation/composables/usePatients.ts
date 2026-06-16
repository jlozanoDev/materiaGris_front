import { ref, type Ref } from "vue";
import {
  provideSearchPatientsUseCase,
  provideCreatePatientUseCase,
  provideUpdatePatientUseCase,
  provideGetPatientUseCase,
} from "@/modules/patients/application/containers/patientsContainer";
import type { Patient } from "@/shared/types";

export interface UsePatientsReturn {
  patients: Ref<Patient[]>;
  patient: Ref<Patient | null>;
  loading: Ref<boolean>;
  patientLoading: Ref<boolean>;
  error: Ref<unknown>;
  fetchPatients: (filters?: Record<string, unknown>) => Promise<void>;
  fetchPatientById: (id: number | string) => Promise<void>;
  createPatient: (payload: Record<string, unknown>) => Promise<any>;
  updatePatient: (id: number | string, payload: Record<string, unknown>) => Promise<any>;
}

export function usePatients(): UsePatientsReturn {
  const patients: Ref<Patient[]> = ref([]);
  const patient: Ref<Patient | null> = ref(null);
  const loading: Ref<boolean> = ref(false);
  const patientLoading: Ref<boolean> = ref(false);
  const error: Ref<unknown> = ref(null);

  async function fetchPatients(filters: Record<string, unknown> = {}): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const useCase = provideSearchPatientsUseCase();
      patients.value = await useCase.execute(filters);
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  }

  async function createPatient(payload: Record<string, unknown>): Promise<any> {
    const useCase = provideCreatePatientUseCase();
    return useCase.execute(payload);
  }

  async function updatePatient(id: number | string, payload: Record<string, unknown>): Promise<any> {
    const useCase = provideUpdatePatientUseCase();
    return useCase.execute(id, payload);
  }

  async function fetchPatientById(id: number | string): Promise<void> {
    patientLoading.value = true;
    error.value = null;
    try {
      const useCase = provideGetPatientUseCase();
      patient.value = await useCase.execute(id);
    } catch (e) {
      error.value = e;
    } finally {
      patientLoading.value = false;
    }
  }

  return { patients, patient, loading, patientLoading, error, fetchPatients, fetchPatientById, createPatient, updatePatient };
}
