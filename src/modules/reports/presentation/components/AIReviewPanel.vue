<script setup lang="ts">
import { computed } from "vue";
import type { LLMExtractionResult } from "@/modules/reports/domain/entities/AIProcessing";
import type { FieldConfig } from "@/shared/types";
import { useAIReview } from "@/modules/reports/presentation/composables/useAIReview";
import AIReviewField from "./AIReviewField.vue";

const props = defineProps<{
  llmResult: LLMExtractionResult | null;
  fieldConfigs: FieldConfig[];
  currentValues: Record<string, unknown>;
  setValue: (key: string, value: unknown) => void;
}>();

const emit = defineEmits<{
  done: [];
}>();

// Convert props to refs for useAIReview
const llmResultRef = computed(() => props.llmResult);
const fieldConfigsRef = computed(() => props.fieldConfigs);
const currentValuesRef = computed(() => props.currentValues);

const {
  reviews,
  warnings,
  pendingCount,
  hasWarnings,
  acceptField,
  rejectField,
  editField,
  applyAll,
} = useAIReview(llmResultRef, fieldConfigsRef, currentValuesRef, props.setValue);

const hasReviews = computed(() => reviews.value.length > 0);

function handleAcceptField(key: string) {
  acceptField(key);
}

function handleRejectField(key: string) {
  rejectField(key);
}

function handleEditField(key: string, value: unknown) {
  editField(key, value);
}

function handleApplyAll() {
  applyAll();
  emit("done");
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <i class="pi pi-check-circle text-indigo-500"></i>
        Revisar campos extraídos
      </h3>
      <span v-if="hasReviews" class="text-xs text-slate-400">
        {{ pendingCount }} pendiente{{ pendingCount !== 1 ? "s" : "" }}
      </span>
    </div>

    <!-- Warnings -->
    <div
      v-if="hasWarnings"
      class="flex flex-col gap-1.5 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200"
    >
      <span class="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
        <i class="pi pi-exclamation-triangle"></i>
        Advertencias
      </span>
      <ul class="list-disc list-inside">
        <li
          v-for="(warn, idx) in warnings"
          :key="idx"
          class="text-xs text-amber-700"
        >
          {{ warn }}
        </li>
      </ul>
    </div>

    <!-- Empty state -->
    <div
      v-if="!hasReviews"
      class="flex flex-col items-center justify-center py-8 gap-2 text-slate-400"
    >
      <i class="pi pi-search text-2xl"></i>
      <p class="text-sm font-medium">No se encontraron campos para revisar</p>
      <p class="text-xs">La IA no extrajo datos que coincidan con los campos del formulario.</p>
    </div>

    <!-- Field review list -->
    <div v-if="hasReviews" class="flex flex-col gap-2">
      <AIReviewField
        v-for="review in reviews"
        :key="review.fieldKey"
        :review="review"
        @accept="handleAcceptField"
        @reject="handleRejectField"
        @edit="handleEditField"
      />
    </div>

    <!-- Apply All footer -->
    <div v-if="hasReviews" class="flex justify-end pt-2 border-t border-slate-100">
      <button
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        @click="handleApplyAll"
      >
        <i class="pi pi-check"></i>
        <span>Aplicar todo</span>
      </button>
    </div>
  </div>
</template>
