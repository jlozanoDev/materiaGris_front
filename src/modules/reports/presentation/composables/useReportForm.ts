import { ref, watch, computed, type Ref } from "vue";
import {
  provideInitReportUseCase,
  provideGetReportUseCase,
  provideSaveReportDraftUseCase,
  provideSignReportUseCase,
  provideArchiveReportUseCase,
} from "@/modules/reports/application/containers/reportsContainer";
import { useAuthStore } from "@/core/store/auth";
import type { PatientReport, Section, FieldConfig } from "@/shared/types";

export interface UseReportFormReturn {
  report: Ref<PatientReport | null>;
  values: Ref<Record<string, any>>;
  dirtyFields: Ref<Set<string>>;
  errors: Ref<Record<string, string>>;
  isSaving: Ref<boolean>;
  isLoading: Ref<boolean>;
  isPrinting: Ref<boolean>;
  errorMessage: Ref<string | null>;
  autoSaveEnabled: Ref<boolean>;
  signatureValue: Ref<string | null>;
  typedSignatureValue: Ref<string>;
  init: (patientId: string | number, templateId: string | number) => Promise<void>;
  loadReport: (id: string | number) => Promise<void>;
  setValue: (key: string, value: any) => void;
  validateFormFields: () => Record<string, string>;
  validateForSignature: () => Record<string, string>;
  saveDraft: () => Promise<void>;
  sign: () => Promise<void>;
  archive: () => Promise<void>;
  printReport: () => Promise<void>;
}

export function useReportForm(): UseReportFormReturn {
  const authStore = useAuthStore();

  const report = ref<PatientReport | null>(null);
  const values = ref<Record<string, any>>({});
  const dirtyFields = ref<Set<string>>(new Set());
  const errors = ref<Record<string, string>>({});
  const isSaving = ref(false);
  const isLoading = ref(false);
  const isPrinting = ref(false);
  const errorMessage = ref<string | null>(null);
  const autoSaveEnabled = ref(true);
  const signatureValue = ref<string | null>(null);
  const typedSignatureValue = ref<string>("");

  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  // ── init ───────────────────────────────────────────────────────────────────
  async function init(patientId: string | number, templateId: string | number): Promise<void> {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      const useCase = provideInitReportUseCase();
      const result = await useCase.execute(patientId, templateId);
      report.value = result;
      values.value = result.values ?? {};
      errors.value = {};
      dirtyFields.value = new Set();
    } catch (err: any) {
      report.value = null;
      errorMessage.value = err?.message || "Error al iniciar el informe";
    } finally {
      isLoading.value = false;
    }
  }

  // ── loadReport ─────────────────────────────────────────────────────────────
  async function loadReport(id: string | number): Promise<void> {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      const useCase = provideGetReportUseCase();
      const result = await useCase.execute(id);
      report.value = result;
      values.value = result.values ?? {};
      signatureValue.value = values.value._signature ?? null;
      typedSignatureValue.value = values.value._typed ?? "";
      errors.value = {};
      dirtyFields.value = new Set();
    } catch (err: any) {
      report.value = null;
      errorMessage.value = err?.message || "Error al obtener el informe";
    } finally {
      isLoading.value = false;
    }
  }

  // ── setValue ───────────────────────────────────────────────────────────────
  function setValue(key: string, value: any): void {
    values.value = { ...values.value, [key]: value }
    dirtyFields.value = new Set([...dirtyFields.value, key])
    errors.value = { ...errors.value }
    delete errors.value[key]
    // Keep signature refs in sync for sign/validate
    if (key === '_signature') signatureValue.value = value
    if (key === '_typed') typedSignatureValue.value = value
    triggerAutoSave()
  }

  // ── validateFormFields ─────────────────────────────────────────────────────
  function validateFormFields(): Record<string, string> {
    const errs: Record<string, string> = {};
    const snapshot = report.value?.templateStructureSnapshot;
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
    errors.value = errs;
    return errs;
  }

  // ── validateForSignature ───────────────────────────────────────────────────
  function validateForSignature(): Record<string, string> {
    const errs = validateFormFields();
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
    if (report.value.userId !== authStore.user?.id) {
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

  // ── archive ────────────────────────────────────────────────────────────────
  async function archive(): Promise<void> {
    if (!report.value) throw new Error("No hay informe cargado");
    if (report.value.status !== "signed") {
      throw new Error("Solo se pueden archivar informes firmados");
    }

    isSaving.value = true;
    try {
      // Generate PDF
      const { createApp } = await import("vue");
      const ReportPdfExport = (
        await import(
          "@/modules/reports/presentation/components/ReportPdfExport.vue"
        )
      ).default;

      const container = document.createElement("div");
      container.id = "pdf-export-container";
      document.body.appendChild(container);

      const app = createApp(ReportPdfExport, {
        report: report.value,
        signatureUrl: signatureValue.value,
      });
      const instance = app.mount(container);

      // Wait for render
      await new Promise((resolve) => setTimeout(resolve, 500));

      const pdfBlob = await (instance as any).generatePdf();

      // Cleanup
      app.unmount();
      document.body.removeChild(container);

      // Upload to backend
      const useCase = provideArchiveReportUseCase();
      const updated = await useCase.execute(report.value.id, pdfBlob);
      report.value = { ...report.value, ...updated };
    } catch (e: any) {
      errorMessage.value = e?.message || "Error al archivar el informe";
      throw e;
    } finally {
      isSaving.value = false;
    }
  }

  // ── printReport ────────────────────────────────────────────────────────────
  async function printReport(): Promise<void> {
    if (!report.value) return;

    isPrinting.value = true;
    errorMessage.value = null;

    let iframe: HTMLIFrameElement | null = null;
    let app: any = null;

    function copyStylesheets(targetDoc: Document): void {
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
        if (el instanceof HTMLStyleElement) {
          const clone = targetDoc.createElement('style')
          clone.textContent = el.textContent
          targetDoc.head.appendChild(clone)
        } else if (el instanceof HTMLLinkElement) {
          const clone = targetDoc.createElement('link')
          clone.rel = 'stylesheet'
          clone.href = el.href
          targetDoc.head.appendChild(clone)
        }
      })
    }

    try {
      const { createApp, nextTick } = await import("vue");
      const ReportPdfExport = (
        await import(
          "@/modules/reports/presentation/components/ReportPdfExport.vue"
        )
      ).default;

      iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:210mm;height:100vh;";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument!;
      iframeDoc.body.style.margin = "0";
      iframeDoc.body.style.padding = "0";

      copyStylesheets(iframeDoc);

      app = createApp(ReportPdfExport, {
        report: report.value,
        signatureUrl: signatureValue.value,
      });
      app.mount(iframeDoc.body);

      await new Promise((resolve) => setTimeout(resolve, 800));
      await nextTick();

      const root = iframeDoc.body.querySelector('.report-pdf-export') as HTMLElement | null;
      if (root) {
        root.style.position = 'static';
        root.style.left = 'auto';
        root.style.top = 'auto';
        root.style.zIndex = 'auto';
        root.style.visibility = 'visible';
        root.style.margin = '0 auto';
      }

      const win = iframe.contentWindow;
      if (!win) throw new Error("No se pudo acceder a la ventana de impresión");

      isPrinting.value = false;

      win.onafterprint = () => {
        app?.unmount();
        if (iframe?.parentNode) document.body.removeChild(iframe);
      };

      win.print();

      // Fallback cleanup for browsers without onafterprint
      setTimeout(() => {
        app?.unmount();
        if (iframe?.parentNode) document.body.removeChild(iframe);
      }, 60000);
    } catch (e: any) {
      isPrinting.value = false;
      if (app) app.unmount();
      if (iframe?.parentNode) document.body.removeChild(iframe);
      const message = e?.message || String(e) || "Error al preparar la impresión";
      errorMessage.value = message;
      console.error("[printReport] error:", e);
      throw new Error(message);
    }
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
    isLoading,
    isPrinting,
    errorMessage,
    autoSaveEnabled,
    signatureValue,
    typedSignatureValue,
    init,
    loadReport,
    setValue,
    validateFormFields,
    validateForSignature,
    saveDraft,
    sign,
    archive,
    printReport,
  };
}
