<script setup lang="ts">
import { ref } from "vue";

// ---------------------------------------------------------------------------
// Props & Emits
// ---------------------------------------------------------------------------

const props = withDefaults(
  defineProps<{
    logoUrl?: string | null;
    uploading?: boolean;
    disabled?: boolean;
    uploadError?: string | null;
  }>(),
  {
    logoUrl: null,
    uploading: false,
    disabled: false,
    uploadError: null,
  },
);

const emit = defineEmits<{
  upload: [file: File];
  remove: [];
}>();

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
];
const ACCEPT_STRING = ALLOWED_TYPES.join(",");

// ---------------------------------------------------------------------------
// Local state
// ---------------------------------------------------------------------------

const localTypeError = ref<string | null>(null);
const localSizeError = ref<string | null>(null);

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

function validate(file: File): boolean {
  localTypeError.value = null;
  localSizeError.value = null;

  if (!ALLOWED_TYPES.includes(file.type)) {
    localTypeError.value =
      "Tipo de archivo no válido. Solo se aceptan PNG, JPG, SVG y WebP.";
    return false;
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    localSizeError.value = "El archivo excede el tamaño máximo de 5MB.";
    return false;
  }

  return true;
}

function onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];

  if (!validate(file)) return;

  emit("upload", file);

  // Reset input so re-selecting the same file works
  input.value = "";
}

function onDrop(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();

  if (props.disabled || props.uploading) return;

  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;

  const file = files[0];

  if (!validate(file)) return;

  emit("upload", file);
}

function onDragOver(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
}

function onRemove(): void {
  emit("remove");
}

const fileInput = ref<HTMLInputElement | null>(null);

function openFilePicker(): void {
  if (props.disabled || props.uploading) return;
  fileInput.value?.click();
}
</script>

<template>
  <div class="mb-6">
    <h4
      class="text-xs font-semibold uppercase tracking-wider text-[#7c3aed] mb-3"
    >
      Logo de la Clínica
    </h4>

    <!-- Existing logo preview -->
    <div
      v-if="logoUrl"
      class="mb-4 flex flex-col items-start gap-2"
    >
      <img
        :src="logoUrl"
        alt="Logo de la clínica"
        class="max-h-64 w-full rounded-lg border border-slate-200 object-contain"
      />
      <button
        v-if="!disabled"
        type="button"
        class="btn btn-ghost text-red-500 hover:text-red-700 text-xs"
        :disabled="uploading"
        data-testid="remove-logo"
        @click="onRemove"
      >
        <i class="pi pi-trash mr-1" /> Eliminar
      </button>
    </div>

    <!-- Drop zone -->
    <div
      data-testid="drop-zone"
      class="relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer"
      :class="[
        uploading || disabled
          ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
          : 'border-[#7c3aed]/20 hover:border-[#7c3aed]/50 hover:bg-[#f5f3ff]/50',
      ]"
      @click="openFilePicker"
      @drop="onDrop"
      @dragover="onDragOver"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="ACCEPT_STRING"
        class="hidden"
        :disabled="uploading || disabled"
        @change="onFileChange"
      />

      <!-- Uploading state -->
      <div v-if="uploading" class="flex flex-col items-center gap-2">
        <i
          class="pi pi-spin pi-spinner text-2xl text-[#7c3aed]"
          aria-hidden="true"
        />
        <p class="text-sm text-slate-600">Subiendo...</p>
      </div>

      <!-- Default empty state -->
      <div v-else class="flex flex-col items-center gap-2">
        <i
          class="pi pi-cloud-upload text-3xl text-slate-400"
          aria-hidden="true"
        />
        <p class="text-sm text-slate-600">
          Arrastrá un archivo aquí o
          <span class="text-[#7c3aed] font-medium">hacé clic para buscar</span>
        </p>
        <p class="text-xs text-slate-400">
          PNG, JPG, SVG o WebP. Máx. 5MB.
        </p>
      </div>
    </div>

    <!-- Local validation errors -->
    <p
      v-if="localTypeError"
      class="mt-2 text-xs text-red-500"
      data-testid="type-error"
    >
      {{ localTypeError }}
    </p>
    <p
      v-if="localSizeError"
      class="mt-2 text-xs text-red-500"
      data-testid="size-error"
    >
      {{ localSizeError }}
    </p>

    <!-- Upload error from parent -->
    <p
      v-if="uploadError"
      class="mt-2 text-xs text-red-500"
      data-testid="upload-error"
    >
      {{ uploadError }}
    </p>
  </div>
</template>
