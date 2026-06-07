<template>
  <Modal :show="show" size="md" icon-class="h-6 w-6 text-[#7c3aed]" @close="close">
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
      <h3 class="text-lg font-semibold text-[#0b0817] mb-4">Cambiar contraseña</h3>
    </template>

    <form @submit.prevent="onSave">
      <div class="mb-4">
        <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Contraseña actual</label>
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
        <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Nueva contraseña</label>
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
        </div><div class="mt-2 space-y-1">
          <p
            v-for="c in criteria"
            :key="c.key"
            class="text-xs flex items-center gap-1.5"
            :class="{
              'text-gray-400': c.state === 'pending',
              'text-green-600': c.state === 'valid',
              'text-red-500': c.state === 'invalid',
            }"
          >
            <svg v-if="c.state === 'valid'" class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <svg v-else-if="c.state === 'invalid'" class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <svg v-else class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="6" />
            </svg>
            {{ c.label }}
          </p>
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-[#6b6b7b] mb-1">Confirmar contraseña</label>
        <div class="relative">
          <input
            v-model="confirmPassword"
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
        </div><p
          v-if="confirmDirty"
          class="text-xs mt-1.5 flex items-center gap-1.5"
          :class="confirmMatch ? 'text-green-600' : 'text-red-500'"
        >
          <svg v-if="confirmMatch" class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <svg v-else class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          {{ confirmMatch ? "Las contraseñas coinciden" : "Las contraseñas no coinciden" }}
        </p>
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
const confirmPassword = ref<string>("");
const showOldPassword = ref<boolean>(false);
const showNewPassword = ref<boolean>(false);
const showConfirmPassword = ref<boolean>(false);

const hasUpper = (s: string): boolean => /[A-Z]/.test(s);
const hasDigit = (s: string): boolean => /[0-9]/.test(s);
const hasSpecial = (s: string): boolean => /[^a-zA-Z0-9]/.test(s);

const canSave = computed<boolean>(
  () =>
    oldPassword.value.trim().length > 0 &&
    password.value.length >= 8 &&
    hasUpper(password.value) &&
    hasDigit(password.value) &&
    hasSpecial(password.value) &&
    password.value === confirmPassword.value
);

const criterionState = (test: (s: string) => boolean) =>
  computed<"pending" | "valid" | "invalid">(() => {
    if (password.value.length === 0) return "pending";
    return test(password.value) ? "valid" : "invalid";
  });

const minLenState = criterionState((s) => s.length >= 8);
const hasUpperState = criterionState((s) => /[A-Z]/.test(s));
const hasDigitState = criterionState((s) => /[0-9]/.test(s));
const hasSpecialState = criterionState((s) => /[^a-zA-Z0-9]/.test(s));

interface Criterion {
  key: string;
  label: string;
  state: "pending" | "valid" | "invalid";
}

const criteria = computed<Criterion[]>(() => [
  { key: "minLen", label: "Mínimo 8 caracteres", state: minLenState.value },
  { key: "upper", label: "1 mayúscula", state: hasUpperState.value },
  { key: "digit", label: "1 dígito", state: hasDigitState.value },
  { key: "special", label: "1 carácter especial", state: hasSpecialState.value },
]);

const confirmDirty = computed<boolean>(() => confirmPassword.value.length > 0);
const confirmMatch = computed<boolean>(
  () => confirmPassword.value.length > 0 && password.value === confirmPassword.value
);

const close = (): void => emit("close");
const onSave = (): void => {
  emit("save", { oldPassword: oldPassword.value, password: password.value });
  oldPassword.value = "";
  password.value = "";
  confirmPassword.value = "";
};
</script>
