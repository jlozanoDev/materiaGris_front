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
  <div class="flex items-center gap-3 flex-wrap">
    <div class="flex flex-col gap-1 flex-1 min-w-[200px]">
      <input
        v-model="builder.templateName"
        placeholder="Nombre de la plantilla"
        class="form-input text-lg font-bold border-0 bg-transparent focus:ring-0 px-0"
        :disabled="!canSave"
        aria-label="Nombre de la plantilla"
      />
      <input
        v-model="builder.templateDescription"
        placeholder="Descripción (opcional)"
        class="form-input text-sm text-slate-500 border-0 bg-transparent focus:ring-0 px-0"
        :disabled="!canSave"
        aria-label="Descripción"
      />
    </div>

    <div class="flex items-center gap-1.5">
      <button
        v-if="canSave"
        class="btn btn-primary btn-sm"
        :disabled="!builder.isDirty"
        data-save-btn
        @click="builder.saveTemplate()"
      >
        Guardar
      </button>
      <button
        class="btn btn-ghost btn-sm"
        :disabled="builder.undoStack.length === 0"
        data-undo-btn
        title="Deshacer"
        @click="builder.undo()"
      >
        <i class="pi pi-undo" />
      </button>
      <button
        class="btn btn-ghost btn-sm"
        :disabled="builder.redoStack.length === 0"
        data-redo-btn
        title="Rehacer"
        @click="builder.redo()"
      >
        <i class="pi pi-redo" />
      </button>
    </div>
  </div>
</template>
