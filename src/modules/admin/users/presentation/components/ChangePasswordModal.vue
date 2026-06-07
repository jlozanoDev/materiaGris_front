<template>
  <Modal :show="show" size="md" icon-class="h-6 w-6 text-rose-500" @close="close">
    <template #icon>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2"></rect>
        <path d="M7 11V7a5 5 0 0110 0v4"></path>
      </svg>
    </template>
    <template #header>
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Cambiar contraseña</h3>
    </template>

    <form @submit.prevent="onSave">
      <div class="mb-4">
        <label class="block text-sm font-medium text-slate-600 mb-1">Contraseña actual</label>
        <div class="relative">
          <input
            v-model="oldPassword"
            :type="showOldPassword ? 'text' : 'password'"
            placeholder="Contraseña actual"
            class="form-input"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="showOldPassword = !showOldPassword"
          >
            <EyeOff v-if="!showOldPassword" class="h-5 w-5" />
            <Eye v-else class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-slate-600 mb-1">Nueva contraseña</label>
        <div class="relative">
          <input
            v-model="password"
            :type="showNewPassword ? 'text' : 'password'"
            placeholder="Nueva contraseña"
            class="form-input"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="showNewPassword = !showNewPassword"
          >
            <EyeOff v-if="!showNewPassword" class="h-5 w-5" />
            <Eye v-else class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-slate-600 mb-1">Confirmar contraseña</label>
        <div class="relative">
          <input
            v-model="confirm"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Repetir contraseña"
            class="form-input"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <EyeOff v-if="!showConfirmPassword" class="h-5 w-5" />
            <Eye v-else class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button type="button" class="btn btn-ghost" @click="close">Cancelar</button>
        <button type="submit" :disabled="!canSave" class="btn btn-primary disabled:opacity-50">
          Guardar
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Eye, EyeOff } from "lucide-vue-next";
import Modal from "@/shared/components/Modal.vue";

interface Props {
  show?: boolean;
}

interface PasswordPayload {
  oldPassword: string;
  password: string;
}

withDefaults(defineProps<Props>(), { show: false });
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", payload: PasswordPayload): void;
}>();

const oldPassword = ref<string>("");
const password = ref<string>("");
const confirm = ref<string>("");
const showOldPassword = ref<boolean>(false);
const showNewPassword = ref<boolean>(false);
const showConfirmPassword = ref<boolean>(false);

const canSave = computed<boolean>(
  () =>
    oldPassword.value.trim().length > 0 &&
    password.value.length >= 8 &&
    password.value === confirm.value
);

const close = (): void => emit("close");
const onSave = (): void => {
  emit("save", { oldPassword: oldPassword.value, password: password.value });
  oldPassword.value = "";
  password.value = "";
  confirm.value = "";
};
</script>
