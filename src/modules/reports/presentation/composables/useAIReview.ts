import { computed, reactive, type Ref, type ComputedRef } from "vue";
import type {
  LLMExtractionResult,
  FieldReview,
  ReviewAction,
  ConfidenceLevel,
} from "@/modules/reports/domain/entities/AIProcessing";
import type { FieldConfig } from "@/shared/types";
import { matchAIFields } from "@/modules/reports/application/mappers/aiValueMapper";

/**
 * Convert a numeric confidence score to a traffic-light level.
 * - high (green): ≥ 0.8
 * - medium (amber): ≥ 0.5
 * - low (red): < 0.5
 */
function toConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}

export interface UseAIReviewReturn {
  /** Computed list of field reviews, rebuilt when inputs change */
  reviews: ComputedRef<FieldReview[]>;
  /** Warning messages from the LLM extraction */
  warnings: ComputedRef<string[]>;
  /** Number of fields still in "pending" state */
  pendingCount: ComputedRef<number>;
  /** True when warnings array is non-empty */
  hasWarnings: ComputedRef<boolean>;
  /** Accept a field: mark as accepted and write proposed value to form */
  acceptField: (key: string) => void;
  /** Reject a field: mark as rejected, keep current value in form */
  rejectField: (key: string) => void;
  /** Edit a field: store edited value and write it to form */
  editField: (key: string, value: unknown) => void;
  /** Apply all non-rejected fields, return true to signal transition to done */
  applyAll: () => boolean;
}

/**
 * useAIReview — Per-field review state for the AI field-by-field review panel.
 *
 * Decoupled from the pipeline orchestrator (useReportAI). Receives the LLM
 * extraction result, template field configs, current form values, and the
 * form's per-field setValue function.
 *
 * Only fields with `ai_help_description` are included in the review.
 */
export function useAIReview(
  llmResult: Ref<LLMExtractionResult | null>,
  fieldConfigs: Ref<FieldConfig[]>,
  currentValues: Ref<Record<string, unknown>>,
  setValue: (key: string, value: unknown) => void,
): UseAIReviewReturn {
  // ── Internal mutable state (reactive so computed depends on it) ────────────
  const actionMap = reactive<Record<string, ReviewAction>>({});
  const editedValueMap = reactive<Record<string, unknown>>({});

  // ── Computed reviews ───────────────────────────────────────────────────────

  const reviews = computed<FieldReview[]>(() => {
    const result = llmResult.value;
    if (!result) return [];

    // Handle both wrapped {data: {...}} and unwrapped LLMExtractionResult responses
    const inner = (result as any).data?.extracted_data !== undefined
      ? (result as any).data
      : result;

    const extracted: Record<string, any> = inner.extracted_data ?? {};
    const scores: Record<string, number> = inner.confidence_scores ?? {};

    // Use the 3-tier mapper to match LLM keys to form fields
    const matched = matchAIFields(extracted, fieldConfigs.value);

    return matched.map((m) => {
      // Confidence is keyed by LLM key, not form field key
      const confidence = scores[m.llmKey] ?? 0.5;
      const currentAction: ReviewAction = actionMap[m.fieldKey] ?? "pending";

      return {
        fieldKey: m.fieldKey,
        fieldLabel:
          fieldConfigs.value.find((f) => f.key === m.fieldKey)?.label ?? m.fieldKey,
        fieldType:
          fieldConfigs.value.find((f) => f.key === m.fieldKey)?.type ?? "text",
        currentValue: currentValues.value[m.fieldKey],
        proposedValue: m.value,
        confidence,
        confidenceLevel: toConfidenceLevel(confidence),
        action: currentAction,
        editedValue:
          currentAction === "edited"
            ? editedValueMap[m.fieldKey]
            : undefined,
      } satisfies FieldReview;
    });
  });

  // ── Derived computeds ──────────────────────────────────────────────────────

  const warnings = computed<string[]>(() => {
    const result = llmResult.value;
    if (!result) return [];
    // Handle both wrapped and unwrapped responses
    const inner = (result as any).data?.warnings !== undefined
      ? (result as any).data
      : result;
    return (inner as any).warnings ?? [];
  });

  const hasWarnings = computed<boolean>(() => warnings.value.length > 0);

  const pendingCount = computed<number>(
    () => reviews.value.filter((r) => r.action === "pending").length,
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  function acceptField(key: string): void {
    actionMap[key] = "accepted";
    const review = reviews.value.find((r) => r.fieldKey === key);
    if (review) {
      setValue(key, review.proposedValue);
    }
  }

  function rejectField(key: string): void {
    actionMap[key] = "rejected";
    // No form write — keep the current value
  }

  function editField(key: string, value: unknown): void {
    actionMap[key] = "edited";
    editedValueMap[key] = value;
    setValue(key, value);
  }

  function applyAll(): boolean {
    const snapshot = reviews.value;
    for (const review of snapshot) {
      if (review.action === "rejected") continue;
      if (review.action === "accepted") continue; // already written by acceptField
      if (review.action === "edited") continue;   // already written by editField

      // pending: write proposed value
      setValue(review.fieldKey, review.proposedValue);
      actionMap[review.fieldKey] = "accepted";
    }
    return true;
  }

  return {
    reviews,
    warnings,
    pendingCount,
    hasWarnings,
    acceptField,
    rejectField,
    editField,
    applyAll,
  };
}
