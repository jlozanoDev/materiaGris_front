<script setup lang="ts">
import { inject } from 'vue'
import { useAuthStore } from '@/core/store/auth'
import { BUILDER_KEY } from '../composables/useTemplateBuilder'
import type { UseTemplateBuilderReturn } from '../composables/useTemplateBuilder'

const builder = inject(BUILDER_KEY) as UseTemplateBuilderReturn
const authStore = useAuthStore()

const canSave = authStore.hasPermission('admin.reporttemplate.update')
</script>

<template>
  <div class="space-y-4">
    <!-- Información general -->
    <div>
      <h4 class="text-xs font-semibold uppercase tracking-wider text-[#7c3aed] mb-3">
        Información general
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Nombre de la plantilla</label>
          <input
            v-model="builder.templateName"
            placeholder="Ej: Informe de Evaluación"
            class="form-input"
            :disabled="!canSave"
            aria-label="Nombre de la plantilla"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Descripción (opcional)</label>
          <input
            v-model="builder.templateDescription"
            placeholder="Breve descripción del propósito"
            class="form-input"
            :disabled="!canSave"
            aria-label="Descripción"
          />
        </div>
      </div>
    </div>

    <hr class="border-[rgba(124,58,237,0.08)]" />

    <!-- Acciones -->
    <div class="flex items-center justify-end gap-2">
      <button
        class="btn btn-ghost btn-sm"
        :disabled="builder.undoStack.length === 0"
        data-undo-btn
        title="Deshacer"
        @click="builder.undo()"
      >
        <i class="pi pi-undo mr-1" />
        Deshacer
      </button>
      <button
        class="btn btn-ghost btn-sm"
        :disabled="builder.redoStack.length === 0"
        data-redo-btn
        title="Rehacer"
        @click="builder.redo()"
      >
        <i class="pi pi-redo mr-1" />
        Rehacer
      </button>
      <button
        v-if="canSave"
        class="btn btn-primary btn-sm"
        :disabled="!builder.isDirty"
        data-save-btn
        @click="builder.saveTemplate()"
      >
        <i class="pi pi-save mr-1" />
        Guardar
      </button>
    </div>
  </div>
</template>
