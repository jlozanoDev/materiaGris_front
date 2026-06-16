import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

// ============================================================================
// Mock DI container — intercept use case creation
// ============================================================================

vi.mock("@/modules/patients/application/containers/patientsContainer", () => ({
  provideGetPatientUseCase: vi.fn(),
}));

// ============================================================================
// Imports (after vi.mock hoisting)
// ============================================================================

import { usePatients } from "../usePatients";
import { provideGetPatientUseCase } from "@/modules/patients/application/containers/patientsContainer";

// ============================================================================
// Tests
// ============================================================================

describe("usePatients.fetchPatientById", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("sets patientLoading to true during fetch", async () => {
    let resolve: any;
    const promise = new Promise((r) => {
      resolve = r;
    });
    const execute = vi.fn().mockReturnValue(promise);
    (provideGetPatientUseCase as any).mockReturnValue({ execute });

    const composable = usePatients();
    const fetchP = composable.fetchPatientById(42);

    // loading should be true while the promise is pending
    expect(composable.patientLoading.value).toBe(true);

    resolve({ id: 42, first_name: "Ana" });
    await fetchP;

    expect(composable.patientLoading.value).toBe(false);
  });

  it("sets patient ref to the returned patient on success", async () => {
    const patientData = {
      id: 42,
      first_name: "Ana",
      last_name: "García",
      medical_record_number: "HC-00042",
    };
    const execute = vi.fn().mockResolvedValue(patientData);
    (provideGetPatientUseCase as any).mockReturnValue({ execute });

    const composable = usePatients();
    await composable.fetchPatientById(42);

    expect(composable.patient.value).toEqual(patientData);
    expect(composable.patientLoading.value).toBe(false);
    expect(composable.error.value).toBeNull();
  });

  it("sets patientLoading to false after completion", async () => {
    const execute = vi.fn().mockResolvedValue({ id: 1 });
    (provideGetPatientUseCase as any).mockReturnValue({ execute });

    const composable = usePatients();
    expect(composable.patientLoading.value).toBe(false);

    await composable.fetchPatientById(1);

    expect(composable.patientLoading.value).toBe(false);
  });

  it("sets error on failure and clears patient", async () => {
    const execute = vi.fn().mockRejectedValue(new Error("Network error"));
    (provideGetPatientUseCase as any).mockReturnValue({ execute });

    const composable = usePatients();
    await composable.fetchPatientById(42);

    expect(composable.error.value).toBeTruthy();
    expect((composable.error.value as Error).message).toBe("Network error");
    expect(composable.patient.value).toBeNull();
    expect(composable.patientLoading.value).toBe(false);
  });
});
