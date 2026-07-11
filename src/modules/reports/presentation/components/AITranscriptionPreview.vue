<script setup lang="ts">
import type { AISpeakerSegment } from "@/modules/reports/domain/entities/AIProcessing";

defineProps<{
  segments: AISpeakerSegment[];
  loading?: boolean;
}>();
</script>

<template>
  <div class="flex flex-col gap-3 p-4 bg-white rounded-xl border border-slate-200 min-h-[120px]">
    <!-- Loading skeleton -->
    <div v-if="loading" class="flex flex-col gap-3">
      <div class="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
      <div class="h-4 bg-slate-200 rounded animate-pulse w-1/2"></div>
      <div class="h-4 bg-slate-200 rounded animate-pulse w-5/6"></div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="segments.length === 0"
      class="flex items-center justify-center py-8 text-slate-400 text-sm"
    >
      <i class="pi pi-volume-up mr-2"></i>
      La transcripción aparecerá aquí
    </div>

    <!-- Segments -->
    <div v-else class="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
      <div
        v-for="(segment, idx) in segments"
        :key="idx"
        class="flex flex-col gap-1"
      >
        <span class="text-xs font-semibold text-indigo-600">
          {{ segment.speaker }}
          <span class="text-slate-400 font-normal ml-1">
            {{ segment.start.toFixed(1) }}s – {{ segment.end.toFixed(1) }}s
          </span>
        </span>
        <p class="text-sm text-slate-700 leading-relaxed">
          {{ segment.text }}
        </p>
      </div>
    </div>
  </div>
</template>
