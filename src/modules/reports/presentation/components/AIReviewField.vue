<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { FieldReview } from "@/modules/reports/domain/entities/AIProcessing";

const props = defineProps<{
  review: FieldReview;
}>();

const emit = defineEmits<{
  accept: [key: string];
  reject: [key: string];
  edit: [key: string, value: unknown];
}>();

const isEditing = ref(false);
const editValue = ref<unknown>(props.review.proposedValue);

watch(
  () => props.review,
  (newReview) => {
    editValue.value = newReview.editedValue ?? newReview.proposedValue;
  },
  { immediate: true },
);

const confidencePercent = computed(() =>
  Math.round(props.review.confidence * 100),
);

const confidenceColor = computed(() => {
  switch (props.review.confidenceLevel) {
    case "high": return "text-emerald-600";
    case "medium": return "text-amber-600";
    case "low": return "text-red-600";
    default: return "text-slate-400";
  }
});

const confidenceDot = computed(() => {
  switch (props.review.confidenceLevel) {
    case "high": return "bg-emerald-500";
    case "medium": return "bg-amber-500";
    case "low": return "bg-red-500";
    default: return "bg-slate-300";
  }
});

const accentColor = computed(() => {
  switch (props.review.confidenceLevel) {
    case "high": return "border-l-emerald-500";
    case "medium": return "border-l-amber-500";
    case "low": return "border-l-red-500";
    default: return "border-l-slate-300";
  }
});

const actionBadge = computed(() => {
  switch (props.review.action) {
    case "accepted": return { text: "Aceptado", cls: "bg-emerald-100 text-emerald-700" };
    case "rejected": return { text: "Rechazado", cls: "bg-red-100 text-red-700" };
    case "edited": return { text: "Editado", cls: "bg-indigo-100 text-indigo-700" };
    default: return null;
  }
});

const isActionable = computed(() =>
  props.review.action === "pending" || props.review.action === "edited",
);

function handleAccept() { emit("accept", props.review.fieldKey); }
function handleReject() { emit("reject", props.review.fieldKey); }

function startEditing() {
  isEditing.value = true;
  editValue.value = props.review.editedValue ?? props.review.proposedValue;
}

function confirmEdit() {
  emit("edit", props.review.fieldKey, editValue.value);
  isEditing.value = false;
}

function cancelEdit() {
  isEditing.value = false;
  editValue.value = props.review.proposedValue;
}
</script>

<template>
  <div
    class="relative flex border-l-4 rounded-r-lg bg-gradient-to-r from-indigo-50/60 to-white border border-slate-200"
    :class="[
      accentColor,
      review.action === 'accepted' ? 'opacity-60' : '',
      review.action === 'rejected' ? 'opacity-40' : '',
    ]"
  >
    <div class="flex-1 flex flex-col gap-2.5 px-4 py-3">
      <!-- Header -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-xs font-semibold text-indigo-600 flex items-center gap-1">
            <span class="text-[10px]">✦</span>
            <span class="truncate">IA sugiere</span>
          </span>
          <span
            v-if="actionBadge"
            class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            :class="actionBadge.cls"
          >
            {{ actionBadge.text }}
          </span>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="h-2 w-2 rounded-full" :class="confidenceDot" />
          <span class="text-[10px] font-mono" :class="confidenceColor">
            {{ confidencePercent }}%
          </span>
        </div>
      </div>

      <!-- Current value -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Actual</span>
        <span class="text-sm text-slate-400 line-through decoration-slate-300 truncate">
          {{ review.currentValue || '—' }}
        </span>
      </div>

      <!-- Proposed value -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[10px] text-indigo-400 font-medium uppercase tracking-wide">Propuesta</span>

        <div v-if="isEditing || review.action === 'edited'" class="flex items-center gap-1.5">
          <input
            v-model="editValue"
            type="text"
            data-testid="edit-input"
            class="flex-1 text-sm px-2.5 py-1.5 rounded-lg border-2 border-indigo-300 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            @keydown.enter="confirmEdit"
            @keydown.escape="cancelEdit"
          />
          <button
            v-if="isEditing"
            data-testid="confirm-edit-btn"
            class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-600 text-white text-xs hover:bg-indigo-700 transition-colors"
            @click="confirmEdit"
          >
            ✓
          </button>
          <button
            v-if="isEditing"
            class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-slate-200 text-slate-500 text-xs hover:bg-slate-300 transition-colors"
            @click="cancelEdit"
          >
            ✕
          </button>
        </div>

        <span v-else class="text-sm text-slate-800 font-medium">
          {{ review.proposedValue || '—' }}
        </span>
      </div>

      <!-- Actions -->
      <div v-if="isActionable && !isEditing" class="flex items-center gap-1.5 pt-1">
        <button
          data-testid="accept-btn"
          class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
          @click="handleAccept"
        >
          <span class="text-[10px]">✓</span>
          <span>Aceptar</span>
        </button>
        <button
          data-testid="reject-btn"
          class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          @click="handleReject"
        >
          <span class="text-[10px]">✕</span>
          <span>Rechazar</span>
        </button>
        <button
          data-testid="edit-btn"
          class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          @click="startEditing"
        >
          <span class="text-[10px]">✎</span>
          <span>Editar</span>
        </button>
      </div>
    </div>
  </div>
</template>
