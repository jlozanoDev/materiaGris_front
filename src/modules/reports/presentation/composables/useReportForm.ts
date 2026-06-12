import { ref, watch, computed, type Ref } from "vue";
import {
  provideInitReportUseCase,
  provideGetReportUseCase,
  provideSaveReportDraftUseCase,
  provideSignReportUseCase,
  provideCloseReportUseCase,
  provideDownloadReportPdfUseCase,
} from "@/modules/reports/application/containers/reportsContainer";
import { useAuthStore } from "@/core/store/auth";
import type { PatientReport, Section, FieldConfig } from "@/shared/types";

export interface UseReportFormReturn {
  report: Ref<PatientReport | null>;
  values: Ref<Record<string, any>>;
  dirtyFields: Ref<Set<string>>;
  errors: Ref<Record<string, string>>;
  isSaving: Ref<boolean>;
  autoSaveEnabled: Ref<boolean>;
  signatureValue: Ref<string | null>;
  typedSignatureValue: Ref<string>;
  init: (patientId: string | number, templateId: string | number) => Promise<void>;
  loadReport: (id: string | number) => Promise<void>;
  setValue: (key: string, value: any) => void;
  validateForSignature: () => Record<string, string>;
  saveDraft: () => Promise<void>;
  sign: () => Promise<void>;
  close: () => Promise<void>;
  downloadPdf: () => Promise<void>;
}

export function useReportForm(): UseReportFormReturn {
  const authStore = useAuthStore();

  const report = ref<PatientReport | null>(null);
  const values = ref<Record<string, any>>({});
  const dirtyFields = ref<Set<string>>(new Set());
  const errors = ref<Record<string, string>>({});
  const isSaving = ref(false);
  const autoSaveEnabled = ref(true);
  const signatureValue = ref<string | null>(null);
  const typedSignatureValue = ref<string>("");

  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  // ── init ───────────────────────────────────────────────────────────────────
  async function init(patientId: string | number, templateId: string | number): Promise<void> {
    const useCase = provideInitReportUseCase();
    const result = await useCase.execute(patientId, templateId);
    report.value = result;
    values.value = result.values ?? {};
    errors.value = {};
    dirtyFields.value = new Set();
  }

  // ── loadReport ─────────────────────────────────────────────────────────────
  async function loadReport(id: string | number): Promise<void> {
    const useCase = provideGetReportUseCase();
    const result = await useCase.execute(id);
    report.value = result;
    values.value = result.values ?? {};
    signatureValue.value = values.value._signature ?? null;
    typedSignatureValue.value = values.value._typed ?? "";
    errors.value = {};
    dirtyFields.value = new Set();
  }

  // ── setValue ───────────────────────────────────────────────────────────────
  function setValue(key: string, value: any): void {
    values.value = { ...values.value, [key]: value };
    dirtyFields.value = new Set([...dirtyFields.value, key]);
    errors.value = { ...errors.value };
    delete errors.value[key];
    triggerAutoSave();
  }

  // ── validateForSignature ───────────────────────────────────────────────────
  function validateForSignature(): Record<string, string> {
    const errs: Record<string, string> = {};
    const snapshot = report.value?.template_structure_snapshot;
    if (snapshot?.sections) {
      const allFields = snapshot.sections.flatMap((s: Section) =>
        s.rows.flatMap((r: any) =>
          r.columns.flatMap((c: any) => c.fields as FieldConfig[]),
        ),
      );
      for (const field of allFields) {
        if (field.required) {
          const val = values.value[field.key];
          if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
            errs[field.key] = `El campo "${field.label}" es obligatorio`;
          }
        }
      }
    }
    // Signature required: canvas OR typed
    if (!signatureValue.value && !typedSignatureValue.value) {
      errs["_signature"] = "La firma es obligatoria para firmar el informe";
    }
    errors.value = errs;
    return errs;
  }

  // ── saveDraft ──────────────────────────────────────────────────────────────
  async function saveDraft(): Promise<void> {
    if (!report.value) return;
    isSaving.value = true;
    try {
      const useCase = provideSaveReportDraftUseCase();
      await useCase.execute(report.value.id, values.value);
    } finally {
      isSaving.value = false;
    }
  }

  // ── sign ───────────────────────────────────────────────────────────────────
  async function sign(): Promise<void> {
    if (!report.value) throw new Error("No hay informe cargado");
    // Author check
    if (report.value.user_id !== authStore.user?.id) {
      throw new Error("No tiene permiso para firmar este informe");
    }
    // Validate
    const errs = validateForSignature();
    if (Object.keys(errs).length > 0) {
      throw new Error("Complete los campos obligatorios antes de firmar");
    }
    // Signature canvas or typed
    const sig = signatureValue.value ?? typedSignatureValue.value;
    const useCase = provideSignReportUseCase();
    const updated = await useCase.execute(report.value.id, sig);
    report.value = { ...report.value, ...updated };
  }

  // ── close ──────────────────────────────────────────────────────────────────
  async function close(): Promise<void> {
    if (!report.value) throw new Error("No hay informe cargado");
    if (report.value.status !== "signed") {
      throw new Error("Solo se pueden cerrar informes firmados");
    }
    const useCase = provideCloseReportUseCase();
    const updated = await useCase.execute(report.value.id);
    report.value = { ...report.value, ...updated };
  }

  // ── downloadPdf ────────────────────────────────────────────────────────────
  async function downloadPdf(): Promise<void> {
    if (!report.value) return;
    const useCase = provideDownloadReportPdfUseCase();
    const blob = await useCase.execute(report.value.id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `informe-${report.value.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── auto-save ──────────────────────────────────────────────────────────────
  function triggerAutoSave(): void {
    if (!autoSaveEnabled.value) return;
    if (!report.value || report.value.status !== "draft") return;

    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      saveDraft();
    }, 2000);
  }

  return {
    report,
    values,
    dirtyFields,
    errors,
    isSaving,
    autoSaveEnabled,
    signatureValue,
    typedSignatureValue,
    init,
    loadReport,
    setValue,
    validateForSignature,
    saveDraft,
    sign,
    close,
    downloadPdf,
  };
}
